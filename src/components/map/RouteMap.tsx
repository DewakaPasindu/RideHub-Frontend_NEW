import React from 'react';
import { Navigation, Clock, Ruler, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { RouteService } from '../../services/api/RouteService';
import type { RouteResult, RoutePoint, DeviationEvent } from '../../services/api/RouteService';
import type { Coordinates } from '../../services/api/LocationService';

export interface RouteMapCoords { lat: number; lng: number; address?: string }

export interface LiveVehicle {
  id: string;
  label: string;
  type: 'driver' | 'vehicle' | 'user';
  coords: RouteMapCoords;
  heading?: number;
  speed?: number;
  /** If provided, heading arrow rotates */
}

export interface RouteMapProps {
  pickup: RouteMapCoords | null;
  destination: RouteMapCoords | null;
  /** Live moving entities rendered on map */
  liveVehicles?: LiveVehicle[];
  /** Highlight anomalous (off-route) breadcrumb trail */
  deviationTrail?: RouteMapCoords[];
  /** Pre-detected deviation to highlight on map */
  activeDeviation?: DeviationEvent | null;
  height?: string;
  showRouteInfo?: boolean;
  showAlternatives?: boolean;
  className?: string;
  /** Called when route loads */
  onRouteLoaded?: (result: RouteResult) => void;
  /** Called when live driver position is analysed */
  onDeviationDetected?: (event: DeviationEvent) => void;
  /** Polling interval ms for live tracking (0 = off) */
  trackingInterval?: number;
}

// ─── Leaflet marker SVGs ──────────────────────────────────────────────────────

function pickupIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    html: `
      <div style="position:relative;width:36px;height:44px">
        <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:44px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35))">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 12.65 18 26 18 26s18-13.35 18-26C36 8.06 27.94 0 18 0z" fill="#2563eb"/>
          <circle cx="18" cy="18" r="8" fill="white"/>
          <circle cx="18" cy="18" r="4" fill="#2563eb"/>
        </svg>
      </div>`,
    iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -44], className: '',
  });
}

function destinationIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    html: `
      <div style="position:relative;width:36px;height:44px">
        <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:44px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35))">
          <path d="M18 0C8.06 0 0 8.06 8.06 18c0 12.65 18 26 18 26s18-13.35 18-26C36 8.06 27.94 0 18 0z" fill="#dc2626"/>
          <path d="M18 0C8.06 0 0 8.06 0 18c0 12.65 18 26 18 26s18-13.35 18-26C36 8.06 27.94 0 18 0z" fill="#dc2626"/>
          <rect x="11" y="10" width="14" height="16" rx="2" fill="white"/>
          <rect x="14" y="13" width="8" height="2" rx="1" fill="#dc2626"/>
          <rect x="14" y="17" width="8" height="2" rx="1" fill="#dc2626"/>
          <rect x="14" y="21" width="5" height="2" rx="1" fill="#dc2626"/>
        </svg>
      </div>`,
    iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -44], className: '',
  });
}

function driverIcon(L: typeof import('leaflet'), heading = 0, color = '#059669') {
  return L.divIcon({
    html: `
      <div style="transform:rotate(${heading}deg);width:40px;height:40px">
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.4))">
          <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3"/>
          <path d="M20 8 L26 28 L20 24 L14 28 Z" fill="white"/>
          <circle cx="20" cy="20" r="3" fill="white"/>
        </svg>
      </div>`,
    iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -22], className: '',
  });
}

function userIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    html: `
      <div style="width:22px;height:22px;position:relative">
        <div style="width:22px;height:22px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.25)"></div>
      </div>`,
    iconSize: [22, 22], iconAnchor: [11, 11], className: '',
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RouteMap({
  pickup, destination, liveVehicles = [], deviationTrail = [],
  activeDeviation, height = '420px', showRouteInfo = true,
  showAlternatives = true, className = '',
  onRouteLoaded, onDeviationDetected, trackingInterval = 0,
}: RouteMapProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInst = React.useRef<import('leaflet').Map | null>(null);
  const layers = React.useRef<import('leaflet').Layer[]>([]);
  const liveMarkers = React.useRef<Record<string, import('leaflet').Marker>>({});
  const routeResultRef = React.useRef<RouteResult | null>(null);
  const prevPositions = React.useRef<Array<Coordinates & { timestamp: number }>>([]);

  const [routeResult, setRouteResult] = React.useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = React.useState(false);
  const [routeError, setRouteError] = React.useState('');
  const [selectedAlt, setSelectedAlt] = React.useState<number | null>(null);
  const [infoExpanded, setInfoExpanded] = React.useState(true);
  const [deviationAlert, setDeviationAlert] = React.useState<DeviationEvent | null>(activeDeviation ?? null);

  React.useEffect(() => { setDeviationAlert(activeDeviation ?? null); }, [activeDeviation]);

  // ── Init map ─────────────────────────────────────────────────────────────
  React.useEffect(() => {
    let mounted = true;
    import('leaflet').then(mod => {
      if (!mounted || !mapRef.current || mapInst.current) return;
      const L = mod.default;
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;

      const center = pickup ?? { lat: 7.8731, lng: 80.7718 };
      const map = L.map(mapRef.current!, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
      }).setView([center.lat, center.lng], pickup ? 13 : 8);

      // OpenStreetMap tiles — same data source as Google/Mapbox but free
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInst.current = map;
    });
    return () => { mounted = false; };
  }, []);

  // ── Clear layers ─────────────────────────────────────────────────────────
  const clearStaticLayers = React.useCallback(() => {
    layers.current.forEach(l => l.remove());
    layers.current = [];
  }, []);

  // ── Draw route ───────────────────────────────────────────────────────────
  const drawRoute = React.useCallback((L: typeof import('leaflet'), map: import('leaflet').Map, result: RouteResult) => {
    clearStaticLayers();
    const bounds: [number, number][] = [];

    // ── Alternative routes (thinner, lighter blue) ────────────────────────
    if (showAlternatives) {
      result.altPolylines.forEach((alt, i) => {
        const isSelected = selectedAlt === i;
        const pts = alt.map(p => [p.lat, p.lng] as [number, number]);
        const line = L.polyline(pts, {
          color: isSelected ? '#2563eb' : '#93c5fd',
          weight: isSelected ? 8 : 5,
          opacity: isSelected ? 0.9 : 0.55,
        }).addTo(map);
        line.on('click', () => setSelectedAlt(isSelected ? null : i));
        const dist = Math.round(RouteService.haversineMetres(alt[0], alt[alt.length - 1]) / 100) / 10;
        line.bindTooltip(`Alternative route (~${dist} km)`, { permanent: false, sticky: true });
        layers.current.push(line);
        pts.forEach(p => bounds.push(p));
      });
    }

    // ── Primary route — thick dark blue (Uber/Pickme style) ───────────────
    if (!selectedAlt) {
      const pts = result.polyline.map(p => [p.lat, p.lng] as [number, number]);

      // Outer glow / shadow effect
      const shadow = L.polyline(pts, { color: '#1e3a8a', weight: 14, opacity: 0.15 }).addTo(map);
      layers.current.push(shadow);

      // Main route line
      const main = L.polyline(pts, { color: '#2563eb', weight: 8, opacity: 0.92, lineCap: 'round', lineJoin: 'round' }).addTo(map);
      layers.current.push(main);

      // Direction dots
      const dotSpacing = Math.max(1, Math.floor(pts.length / 20));
      for (let i = dotSpacing; i < pts.length - dotSpacing; i += dotSpacing) {
        const dot = L.circleMarker(pts[i], { radius: 3, color: 'white', fillColor: '#2563eb', fillOpacity: 1, weight: 2 }).addTo(map);
        layers.current.push(dot);
      }

      pts.forEach(p => bounds.push(p));
    }

    // ── Deviation trail ────────────────────────────────────────────────────
    if (deviationTrail.length > 1) {
      const dpts = deviationTrail.map(p => [p.lat, p.lng] as [number, number]);
      const devLine = L.polyline(dpts, { color: '#ef4444', weight: 4, opacity: 0.8, dashArray: '6 4' }).addTo(map);
      layers.current.push(devLine);
      // Deviation start marker
      const devIcon = L.divIcon({ html: `<div style="background:#ef4444;border:2px solid white;border-radius:50%;width:14px;height:14px;box-shadow:0 0 0 3px rgba(239,68,68,0.4)"></div>`, iconSize: [14, 14], iconAnchor: [7, 7], className: '' });
      const devMark = L.marker(dpts[0], { icon: devIcon }).addTo(map).bindPopup('Route deviation started here');
      layers.current.push(devMark);
    }

    // ── Pickup marker ──────────────────────────────────────────────────────
    if (pickup?.lat) {
      const m = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon(L), zIndexOffset: 200 })
        .addTo(map).bindPopup(`<b>Pickup</b><br>${pickup.address ?? ''}`);
      layers.current.push(m);
      bounds.push([pickup.lat, pickup.lng]);
    }

    // ── Destination marker ────────────────────────────────────────────────
    if (destination?.lat) {
      const m = L.marker([destination.lat, destination.lng], { icon: destinationIcon(L), zIndexOffset: 200 })
        .addTo(map).bindPopup(`<b>Destination</b><br>${destination.address ?? ''}`);
      layers.current.push(m);
      bounds.push([destination.lat, destination.lng]);
    }

    // ── Route info tooltip on route midpoint ──────────────────────────────
    if (result.polyline.length > 2) {
      const mid = result.polyline[Math.floor(result.polyline.length / 2)];
      const infoIcon = L.divIcon({
        html: `<div style="background:white;border:1px solid #e2e8f0;border-radius:10px;padding:5px 10px;font-size:12px;font-weight:700;color:#1e293b;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;display:flex;gap:6px;align-items:center">
          <span style="color:#2563eb">&#x1F697;</span> ${result.durationLabel} · ${result.distanceKm} km
        </div>`,
        iconSize: [160, 32], iconAnchor: [80, 16], className: '',
      });
      const infoMarker = L.marker([mid.lat, mid.lng], { icon: infoIcon, zIndexOffset: 100 }).addTo(map);
      layers.current.push(infoMarker);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds as [number, number][], { padding: [50, 50], maxZoom: 15 });
    }
  }, [pickup, destination, deviationTrail, selectedAlt, showAlternatives, clearStaticLayers]);

  // ── Fetch route via OSRM ─────────────────────────────────────────────────
  React.useEffect(() => {
    if (!pickup?.lat || !destination?.lat) return;
    let cancelled = false;
    setRouteLoading(true); setRouteError('');
    RouteService.getRoute(pickup, destination).then(result => {
      if (cancelled) return;
      routeResultRef.current = result;
      setRouteResult(result);
      onRouteLoaded?.(result);
      import('leaflet').then(mod => {
        const map = mapInst.current;
        if (!map || cancelled) return;
        drawRoute(mod.default, map, result);
      });
    }).catch(() => {
      if (cancelled) return;
      setRouteError('Could not calculate route. Showing straight-line estimate.');
      // Fallback — draw straight line
      import('leaflet').then(mod => {
        const L = mod.default; const map = mapInst.current;
        if (!map || !pickup?.lat || !destination?.lat) return;
        clearStaticLayers();
        if (pickup.lat) {
          const m = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon(L) }).addTo(map).bindPopup('Pickup');
          layers.current.push(m);
        }
        if (destination.lat) {
          const m = L.marker([destination.lat, destination.lng], { icon: destinationIcon(L) }).addTo(map).bindPopup('Destination');
          layers.current.push(m);
        }
        const line = L.polyline([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { color: '#2563eb', weight: 5, opacity: 0.7, dashArray: '10 6' }).addTo(map);
        layers.current.push(line);
        map.fitBounds([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { padding: [50, 50] });
      });
    }).finally(() => { if (!cancelled) setRouteLoading(false); });
    return () => { cancelled = true; };
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng]);

  // Redraw when alt selection changes
  React.useEffect(() => {
    if (!routeResultRef.current) return;
    import('leaflet').then(mod => {
      const map = mapInst.current;
      if (!map) return;
      drawRoute(mod.default, map, routeResultRef.current!);
    });
  }, [selectedAlt, deviationTrail]);

  // ── Live vehicle markers ──────────────────────────────────────────────────
  React.useEffect(() => {
    import('leaflet').then(mod => {
      const L = mod.default;
      const map = mapInst.current;
      if (!map) return;

      // Remove old markers not in current set
      const currentIds = new Set(liveVehicles.map(v => v.id));
      Object.keys(liveMarkers.current).forEach(id => {
        if (!currentIds.has(id)) {
          liveMarkers.current[id].remove();
          delete liveMarkers.current[id];
        }
      });

      liveVehicles.forEach(v => {
        if (!v.coords.lat) return;
        const icon = v.type === 'driver'
          ? driverIcon(L, v.heading ?? 0, '#059669')
          : v.type === 'vehicle'
          ? driverIcon(L, v.heading ?? 0, '#f59e0b')
          : userIcon(L);

        const popup = `<div style="min-width:120px"><b>${v.label}</b><br/>${v.type}${v.speed ? `<br/>${Math.round(v.speed)} km/h` : ''}</div>`;

        if (liveMarkers.current[v.id]) {
          liveMarkers.current[v.id].setLatLng([v.coords.lat, v.coords.lng]);
          liveMarkers.current[v.id].setIcon(icon);
        } else {
          liveMarkers.current[v.id] = L.marker([v.coords.lat, v.coords.lng], { icon, zIndexOffset: 500 })
            .addTo(map).bindPopup(popup);
        }

        // Deviation check
        if (v.type === 'driver' && routeResultRef.current) {
          const pos = { ...v.coords, speed: v.speed, timestamp: Date.now() };
          prevPositions.current.push(pos);
          if (prevPositions.current.length > 20) prevPositions.current.shift();
          const event = RouteService.analysePosition(pos, routeResultRef.current.polyline, prevPositions.current);
          if (event) {
            setDeviationAlert(event);
            onDeviationDetected?.(event);
          }
        }
      });
    });
  }, [liveVehicles]);

  // ── Route info panel ──────────────────────────────────────────────────────

  return (
    <div className={`relative ${className}`}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Route Info Overlay */}
      {showRouteInfo && (routeResult || routeLoading) && (
        <div className="absolute top-3 left-3 z-[500] bg-white/96 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-xs">
          <button
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            onClick={() => setInfoExpanded(e => !e)}
          >
            <div className="flex items-center space-x-2">
              {routeLoading
                ? <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                : <Navigation className="h-4 w-4 text-blue-600" />}
              <span className="text-sm font-bold text-gray-800">
                {routeLoading ? 'Calculating route…' : `${routeResult?.durationLabel} · ${routeResult?.distanceKm} km`}
              </span>
            </div>
            {infoExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>

          {infoExpanded && routeResult && (
            <div className="border-t border-gray-100 px-4 py-3 space-y-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-semibold">{routeResult.durationLabel}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                  <Ruler className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-semibold">{routeResult.distanceKm} km</span>
                </div>
              </div>

              {/* Pickup / Destination */}
              <div className="space-y-1.5">
                <div className="flex items-start space-x-2">
                  <div className="h-3 w-3 rounded-full bg-blue-600 flex-shrink-0 mt-0.5 ring-2 ring-blue-200" />
                  <p className="text-xs text-gray-600 truncate">{pickup?.address?.split(',')[0] ?? 'Pickup'}</p>
                </div>
                <div className="ml-1.5 h-5 border-l-2 border-dashed border-gray-300" />
                <div className="flex items-start space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-600 flex-shrink-0 mt-0.5 ring-2 ring-red-200" />
                  <p className="text-xs text-gray-600 truncate">{destination?.address?.split(',')[0] ?? 'Destination'}</p>
                </div>
              </div>

              {/* Alternative routes */}
              {showAlternatives && routeResult.altPolylines.length > 0 && (
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Alternative routes</p>
                  {routeResult.alternatives.map((alt, i) => (
                    <button key={i} onClick={() => setSelectedAlt(selectedAlt === i ? null : i)}
                      className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors ${selectedAlt === i ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}>
                      <span>Route {i + 2}</span>
                      <div className="flex items-center space-x-2">
                        <span>{Math.round(alt.distance / 1000 * 10) / 10} km</span>
                        <span>·</span>
                        <span>{formatDur(alt.duration)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Deviation Alert Overlay */}
      {deviationAlert && (
        <div className={`absolute bottom-3 left-3 right-3 z-[500] rounded-xl border px-4 py-3 shadow-lg flex items-start space-x-3 ${
          deviationAlert.severity === 'high' ? 'bg-red-50 border-red-300' :
          deviationAlert.severity === 'medium' ? 'bg-amber-50 border-amber-300' :
          'bg-yellow-50 border-yellow-300'
        }`}>
          <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
            deviationAlert.severity === 'high' ? 'text-red-600' :
            deviationAlert.severity === 'medium' ? 'text-amber-600' : 'text-yellow-600'
          }`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${deviationAlert.severity === 'high' ? 'text-red-900' : deviationAlert.severity === 'medium' ? 'text-amber-900' : 'text-yellow-900'}`}>
              {deviationAlert.type === 'route_deviation' ? 'Route Deviation' :
               deviationAlert.type === 'speeding' ? 'Speed Alert' :
               deviationAlert.type === 'idle' ? 'Vehicle Idle' : 'Anomaly Detected'}
            </p>
            <p className={`text-xs mt-0.5 ${deviationAlert.severity === 'high' ? 'text-red-700' : deviationAlert.severity === 'medium' ? 'text-amber-700' : 'text-yellow-700'}`}>
              {deviationAlert.message}
            </p>
          </div>
          <button onClick={() => setDeviationAlert(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-lg leading-none">×</button>
        </div>
      )}

      {/* Route error */}
      {routeError && (
        <div className="absolute top-3 right-3 z-[500] bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 max-w-48">
          {routeError}
        </div>
      )}

      {/* Map */}
      <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden" />
    </div>
  );
}

function formatDur(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}
