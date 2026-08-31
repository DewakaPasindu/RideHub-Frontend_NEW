import React from 'react';
import { RefreshCw, AlertTriangle, Navigation, MapPin, Activity } from 'lucide-react';
import type { MapCoords } from './InteractiveMap';
import { useLocation } from '../../contexts/LocationContext';
import { RouteService } from '../../services/api/RouteService';
import type { DeviationEvent } from '../../services/api/RouteService';

interface LiveEntity {
  id: string;
  name: string;
  type: 'driver' | 'vehicle' | 'user';
  coords: MapCoords;
  heading?: number;
  speed?: number;
  status?: string;
}

interface Props {
  driverLocations?: LiveEntity[];
  vehicleLocations?: LiveEntity[];
  bookingRoute?: { pickup: MapCoords; destination: MapCoords };
  /** Pre-computed route polyline to snap positions to */
  routePolyline?: Array<{ lat: number; lng: number }>;
  /** Show deviation highlighting */
  showDeviationTracking?: boolean;
  height?: string;
  onDeviationDetected?: (event: DeviationEvent) => void;
}

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>';

// Marker icon builders
function userPulseIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    html: `<div style="position:relative;width:24px;height:24px"><div style="position:absolute;inset:0;background:rgba(59,130,246,0.3);border-radius:50%;animation:ping 1s cubic-bezier(0,0,.2,1) infinite"></div><div style="position:relative;width:24px;height:24px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(59,130,246,.5)"></div></div>`,
    iconSize: [24, 24], iconAnchor: [12, 12], className: '',
  });
}

function driverCarIcon(L: typeof import('leaflet'), heading = 0, isDeviating = false) {
  const color = isDeviating ? '#ef4444' : '#059669';
  return L.divIcon({
    html: `<div style="transform:rotate(${heading}deg);width:40px;height:40px"><svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:40px;height:40px;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.4))"><circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3"/><path d="M20 8 L26 28 L20 24 L14 28 Z" fill="white"/><circle cx="20" cy="20" r="3" fill="white"/></svg></div>`,
    iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -22], className: '',
  });
}

function vehicleIcon(L: typeof import('leaflet'), heading = 0) {
  return L.divIcon({
    html: `<div style="transform:rotate(${heading}deg);width:38px;height:38px"><svg viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" style="width:38px;height:38px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.35))"><circle cx="19" cy="19" r="17" fill="#f59e0b" stroke="white" stroke-width="3"/><rect x="11" y="13" width="16" height="10" rx="2" fill="white"/><rect x="13" y="11" width="12" height="4" rx="1" fill="white"/><circle cx="14" cy="24" r="2" fill="#f59e0b"/><circle cx="24" cy="24" r="2" fill="#f59e0b"/></svg></div>`,
    iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -20], className: '',
  });
}

function pickupIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    html: `<div style="width:32px;height:40px"><svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:40px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.25))"><path d="M18 0C8.06 0 0 8.06 0 18c0 12.65 18 26 18 26s18-13.35 18-26C36 8.06 27.94 0 18 0z" fill="#2563eb"/><circle cx="18" cy="18" r="8" fill="white"/><circle cx="18" cy="18" r="4" fill="#2563eb"/></svg></div>`,
    iconSize: [32, 40], iconAnchor: [16, 40], className: '',
  });
}

function destIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    html: `<div style="width:32px;height:40px"><svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:40px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.25))"><path d="M18 0C8.06 0 0 8.06 0 18c0 12.65 18 26 18 26s18-13.35 18-26C36 8.06 27.94 0 18 0z" fill="#dc2626"/><circle cx="18" cy="18" r="9" fill="white"/><text x="18" y="23" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">B</text></svg></div>`,
    iconSize: [32, 40], iconAnchor: [16, 40], className: '',
  });
}

export default function TrackingMap({
  driverLocations = [], vehicleLocations = [],
  bookingRoute, routePolyline = [], showDeviationTracking = true,
  height = '520px', onDeviationDetected,
}: Props) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<import('leaflet').Map | null>(null);
  const staticLayers = React.useRef<import('leaflet').Layer[]>([]);
  const liveMarkers = React.useRef<Record<string, import('leaflet').Marker>>({});
  const deviationLayers = React.useRef<import('leaflet').Layer[]>([]);
  const routePts = React.useRef<Array<{ lat: number; lng: number }>>(routePolyline);
  const prevPositions = React.useRef<Array<{ lat: number; lng: number; timestamp: number }>>([]);
  const deviatingIds = React.useRef<Set<string>>(new Set());

  const { coords: userCoords } = useLocation();
  const [lastUpdate, setLastUpdate] = React.useState(new Date());
  const [activeDeviations, setActiveDeviations] = React.useState<DeviationEvent[]>([]);
  const [routeLoaded, setRouteLoaded] = React.useState(false);

  // ── Init map ──────────────────────────────────────────────────────────────
  React.useEffect(() => {
    let mounted = true;
    import('leaflet').then(mod => {
      if (!mounted || !mapRef.current || mapInstance.current) return;
      const L = mod.default;
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;

      const center = bookingRoute?.pickup || userCoords || { lat: 6.9271, lng: 79.8612 };
      const map = L.map(mapRef.current!).setView([center.lat, center.lng], 12);
      L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
      mapInstance.current = map;
    });
    return () => { mounted = false; };
  }, []);

  // ── Draw route ────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!bookingRoute?.pickup?.lat || !bookingRoute?.destination?.lat) return;
    const { pickup, destination } = bookingRoute;

    // Draw OSRM real-road route
    RouteService.getRoute(pickup, destination).then(result => {
      routePts.current = result.polyline;
      setRouteLoaded(true);
      import('leaflet').then(mod => {
        const L = mod.default;
        const map = mapInstance.current;
        if (!map) return;
        staticLayers.current.forEach(l => l.remove()); staticLayers.current = [];

        const pts = result.polyline.map(p => [p.lat, p.lng] as [number, number]);

        // Glow shadow
        const shadow = L.polyline(pts, { color: '#1e3a8a', weight: 14, opacity: 0.12 }).addTo(map);
        staticLayers.current.push(shadow);
        // Main route
        const mainLine = L.polyline(pts, { color: '#2563eb', weight: 8, opacity: 0.88, lineCap: 'round', lineJoin: 'round' }).addTo(map);
        staticLayers.current.push(mainLine);
        // Alt routes
        result.altPolylines.forEach(alt => {
          const apts = alt.map(p => [p.lat, p.lng] as [number, number]);
          const aline = L.polyline(apts, { color: '#93c5fd', weight: 5, opacity: 0.5 }).addTo(map);
          staticLayers.current.push(aline);
        });

        // Pickup / dest markers
        const pm = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon(L), zIndexOffset: 200 }).addTo(map).bindPopup(`<b>Pickup</b><br>${pickup.address || ''}`);
        const dm = L.marker([destination.lat, destination.lng], { icon: destIcon(L), zIndexOffset: 200 }).addTo(map).bindPopup(`<b>Destination</b><br>${destination.address || ''}`);
        staticLayers.current.push(pm, dm);

        // Route info badge at midpoint
        if (pts.length > 2) {
          const mid = pts[Math.floor(pts.length / 2)];
          const badge = L.divIcon({
            html: `<div style="background:white;border:1px solid #e2e8f0;border-radius:10px;padding:5px 10px;font-size:12px;font-weight:700;color:#1e293b;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap">&#x1F697; ${result.durationLabel} · ${result.distanceKm} km</div>`,
            iconSize: [160, 32], iconAnchor: [80, 16], className: '',
          });
          const info = L.marker(mid, { icon: badge, zIndexOffset: 100 }).addTo(map);
          staticLayers.current.push(info);
        }

        map.fitBounds([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { padding: [60, 60], maxZoom: 14 });
      });
    }).catch(() => {
      // Fallback straight-line
      import('leaflet').then(mod => {
        const L = mod.default; const map = mapInstance.current;
        if (!map || !bookingRoute) return;
        staticLayers.current.forEach(l => l.remove()); staticLayers.current = [];
        const { pickup, destination } = bookingRoute;
        const line = L.polyline([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { color: '#2563eb', weight: 6, opacity: 0.7, dashArray: '10 6' }).addTo(map);
        const pm = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon(L), zIndexOffset: 200 }).addTo(map);
        const dm = L.marker([destination.lat, destination.lng], { icon: destIcon(L), zIndexOffset: 200 }).addTo(map);
        staticLayers.current.push(line, pm, dm);
        map.fitBounds([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { padding: [60, 60] });
      });
    });
  }, [bookingRoute?.pickup?.lat, bookingRoute?.pickup?.lng, bookingRoute?.destination?.lat, bookingRoute?.destination?.lng]);

  // ── Live entity markers ───────────────────────────────────────────────────
  React.useEffect(() => {
    import('leaflet').then(mod => {
      const L = mod.default;
      const map = mapInstance.current;
      if (!map) return;

      const all = [
        ...driverLocations,
        ...vehicleLocations.map(v => ({ ...v, type: 'vehicle' as const })),
      ];

      const seen = new Set<string>();

      all.forEach(entity => {
        if (!entity.coords?.lat) return;
        seen.add(entity.id);

        // Deviation check
        let isDeviating = false;
        if (showDeviationTracking && entity.type === 'driver' && routePts.current.length > 0) {
          const pos = { ...entity.coords, timestamp: Date.now() };
          prevPositions.current.push(pos);
          if (prevPositions.current.length > 30) prevPositions.current.shift();
          const event = RouteService.analysePosition(pos, routePts.current, prevPositions.current);
          if (event) {
            isDeviating = true;
            deviatingIds.current.add(entity.id);
            setActiveDeviations(prev => {
              const filtered = prev.filter(e => e.type !== event.type);
              return [...filtered, event].slice(-5);
            });
            onDeviationDetected?.(event);

            // Draw deviation trail
            import('leaflet').then(mod2 => {
              const L2 = mod2.default; const map2 = mapInstance.current;
              if (!map2) return;
              deviationLayers.current.forEach(l => l.remove()); deviationLayers.current = [];
              const trail = prevPositions.current.slice(-10).map(p => [p.lat, p.lng] as [number, number]);
              if (trail.length > 1) {
                const devLine = L2.polyline(trail, { color: '#ef4444', weight: 4, opacity: 0.85, dashArray: '6 4' }).addTo(map2);
                const deviationIcon = L2.divIcon({ html: `<div style="background:#ef4444;border:2px solid white;border-radius:50%;width:16px;height:16px;box-shadow:0 0 0 4px rgba(239,68,68,0.3);animation:ping 1s infinite"></div>`, iconSize: [16, 16], iconAnchor: [8, 8], className: '' });
                const devMark = L2.marker(trail[trail.length - 1], { icon: deviationIcon }).addTo(map2);
                deviationLayers.current.push(devLine, devMark);
              }
            });
          } else {
            deviatingIds.current.delete(entity.id);
          }
        }

        const icon = entity.type === 'driver'
          ? driverCarIcon(L, entity.heading ?? 0, isDeviating)
          : vehicleIcon(L, entity.heading ?? 0);

        const speedStr = entity.speed ? ` · ${Math.round(entity.speed)} km/h` : '';
        const statusStr = isDeviating ? '<br/><span style="color:#ef4444;font-weight:bold">⚠ Off-Route</span>' : '';
        const popup = `<div style="min-width:130px"><b>${entity.name}</b><br/>📍 ${entity.type}${speedStr}${statusStr}</div>`;

        if (liveMarkers.current[entity.id]) {
          liveMarkers.current[entity.id].setLatLng([entity.coords.lat, entity.coords.lng]);
          liveMarkers.current[entity.id].setIcon(icon);
        } else {
          liveMarkers.current[entity.id] = L.marker([entity.coords.lat, entity.coords.lng], { icon, zIndexOffset: 500 })
            .addTo(map).bindPopup(popup);
        }
      });

      // User location marker
      if (userCoords) {
        const uid = '__user__';
        seen.add(uid);
        if (liveMarkers.current[uid]) {
          liveMarkers.current[uid].setLatLng([userCoords.lat, userCoords.lng]);
        } else {
          liveMarkers.current[uid] = L.marker([userCoords.lat, userCoords.lng], { icon: userPulseIcon(L), zIndexOffset: 600 })
            .addTo(map).bindPopup('Your Location');
        }
      }

      // Remove stale markers
      Object.keys(liveMarkers.current).forEach(id => {
        if (!seen.has(id)) {
          liveMarkers.current[id].remove();
          delete liveMarkers.current[id];
        }
      });

      setLastUpdate(new Date());
    });
  }, [driverLocations, vehicleLocations, showDeviationTracking]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      {/* Legend & status bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
        <div className="flex items-center space-x-3 flex-wrap gap-1">
          <div className="flex items-center space-x-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500" /><span className="text-gray-600">You</span>
          </div>
          {driverLocations.length > 0 && (
            <div className="flex items-center space-x-1.5">
              <div className="h-3 w-3 rounded-full bg-emerald-500" /><span className="text-gray-600">Driver</span>
            </div>
          )}
          {vehicleLocations.length > 0 && (
            <div className="flex items-center space-x-1.5">
              <div className="h-3 w-3 rounded-sm bg-amber-400" /><span className="text-gray-600">Vehicle</span>
            </div>
          )}
          {bookingRoute && (
            <div className="flex items-center space-x-1.5">
              <div className="h-1 w-6 bg-blue-600 rounded-full" /><span className="text-gray-600">Route</span>
            </div>
          )}
          {activeDeviations.length > 0 && (
            <div className="flex items-center space-x-1.5">
              <div className="h-1 w-5 bg-red-500 rounded" style={{ borderTop: '2px dashed' }} />
              <span className="text-red-600 font-semibold">Deviation</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1 text-gray-400">
          <RefreshCw className="h-3 w-3" />
          <span>Updated {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Active deviation alerts */}
      {activeDeviations.length > 0 && (
        <div className="space-y-1.5">
          {activeDeviations.slice(-2).map((ev, i) => (
            <div key={i} className={`flex items-start space-x-2.5 px-3 py-2.5 rounded-xl border text-xs ${
              ev.severity === 'high' ? 'bg-red-50 border-red-200 text-red-800' :
              ev.severity === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold capitalize">{ev.type.replace(/_/g, ' ')}: </span>
                <span>{ev.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200" style={{ height }}>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>{`@keyframes ping{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.6)}}`}</style>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

        {/* Floating deviation alert on map */}
        {activeDeviations.length > 0 && activeDeviations[activeDeviations.length - 1].severity === 'high' && (
          <div className="absolute top-3 right-3 z-[500] flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            <span>ROUTE DEVIATION</span>
          </div>
        )}
      </div>
    </div>
  );
}
