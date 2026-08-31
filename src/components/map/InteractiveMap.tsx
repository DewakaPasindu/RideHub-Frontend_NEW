import React from 'react';
import { MapPin, Search, X, Crosshair } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { LocationService } from '../../services/api/LocationService';
import { RouteService } from '../../services/api/RouteService';
import type { LocationSuggestion } from '../../services/api/LocationService';

export interface MapCoords { lat: number; lng: number; address?: string }

interface Props {
  mode: 'single' | 'route';
  pickup?: MapCoords | null;
  destination?: MapCoords | null;
  onPickupChange?: (c: MapCoords) => void;
  onDestinationChange?: (c: MapCoords) => void;
  markers?: Array<{ coords: MapCoords; label?: string; color?: string }>;
  height?: string;
  className?: string;
}

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>';

function latlng(c: MapCoords) { return `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`; }

function pickupIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    html: `<div style="position:relative;width:32px;height:40px"><svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:40px;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.3))"><path d="M18 0C8.06 0 0 8.06 0 18c0 12.65 18 26 18 26s18-13.35 18-26C36 8.06 27.94 0 18 0z" fill="#2563eb"/><circle cx="18" cy="18" r="8" fill="white"/><circle cx="18" cy="18" r="4" fill="#2563eb"/></svg></div>`,
    iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -42], className: '',
  });
}

function destinationIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    html: `<div style="position:relative;width:32px;height:40px"><svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:40px;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.3))"><path d="M18 0C8.06 0 0 8.06 0 18c0 12.65 18 26 18 26s18-13.35 18-26C36 8.06 27.94 0 18 0z" fill="#dc2626"/><circle cx="18" cy="18" r="10" fill="white"/><text x="18" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">B</text></svg></div>`,
    iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -42], className: '',
  });
}

export default function InteractiveMap({
  mode, pickup, destination,
  onPickupChange, onDestinationChange,
  markers = [], height = '400px', className = ''
}: Props) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<import('leaflet').Map | null>(null);
  const pickupMarker = React.useRef<import('leaflet').Marker | null>(null);
  const destMarker = React.useRef<import('leaflet').Marker | null>(null);
  const routeLayers = React.useRef<import('leaflet').Layer[]>([]);
  const extraMarkers = React.useRef<import('leaflet').Layer[]>([]);

  const { coords: gpsCoords } = useLocation();
  const [active, setActive] = React.useState<'pickup' | 'destination' | null>(null);
  const [pendingCoords, setPendingCoords] = React.useState<MapCoords | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<LocationSuggestion[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [routeLoading, setRouteLoading] = React.useState(false);
  const activeRef = React.useRef(active);
  const pendingMarker = React.useRef<import('leaflet').Marker | null>(null);

  React.useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // ── Init map ──────────────────────────────────────────────────────────────
  React.useEffect(() => {
    let mounted = true;
    import('leaflet').then(mod => {
      if (!mounted || !mapRef.current || mapInstance.current) return;
      const L = mod.default;
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;

      const center = pickup || gpsCoords || { lat: 6.9271, lng: 79.8612 };
      const map = L.map(mapRef.current!).setView([center.lat, center.lng], 13);
      L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
      mapInstance.current = map;

      map.on('click', async (e: { latlng: { lat: number; lng: number } }) => {
        const currentActive = activeRef.current;
        if (!currentActive && mode !== 'single') return;
        
        const c: MapCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
        c.address = `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`;
        setPendingCoords(c);

        try {
          const address = await LocationService.reverseGeocode(c);
          setPendingCoords(prev => {
            if (prev && prev.lat === c.lat && prev.lng === c.lng) {
              return { ...prev, address };
            }
            return prev;
          });
        } catch {
          // ignore
        }
      });
    });
    return () => { mounted = false; };
  }, []);

  // ── Update pickup / destination markers ───────────────────────────────────
  React.useEffect(() => {
    import('leaflet').then(mod => {
      const L = mod.default;
      const map = mapInstance.current;
      if (!map) return;

      if (pickup?.lat) {
        if (pickupMarker.current) pickupMarker.current.remove();
        pickupMarker.current = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon(L), zIndexOffset: 200 })
          .addTo(map).bindPopup(`<b>Pickup</b><br>${pickup.address || latlng(pickup)}`);
      }

      if (destination?.lat) {
        if (destMarker.current) destMarker.current.remove();
        destMarker.current = L.marker([destination.lat, destination.lng], { icon: destinationIcon(L), zIndexOffset: 200 })
          .addTo(map).bindPopup(`<b>Destination</b><br>${destination.address || latlng(destination)}`);
      }

      if (pendingCoords?.lat) {
        if (pendingMarker.current) pendingMarker.current.remove();
        const markerColor = active === 'pickup' ? '#2563eb' : '#dc2626';
        const icon = L.divIcon({ html: `<div style="background:${markerColor};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)"><span style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:11px;font-weight:900">?</span></div>`, iconSize: [28, 28], iconAnchor: [14, 28], className: '' });
        pendingMarker.current = L.marker([pendingCoords.lat, pendingCoords.lng], { icon, zIndexOffset: 300 })
          .addTo(map).bindPopup(`<b>Confirming Location...</b><br>${pendingCoords.address || latlng(pendingCoords)}`);
        pendingMarker.current.openPopup();
      } else {
        if (pendingMarker.current) {
          pendingMarker.current.remove();
          pendingMarker.current = null;
        }
      }

      // Extra markers
      extraMarkers.current.forEach(m => m.remove());
      extraMarkers.current = [];
      markers.forEach(m => {
        const icon = L.divIcon({ html: `<div style="background:${m.color || '#6b7280'};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`, iconSize: [12, 12], iconAnchor: [6, 6], className: '' });
        const mark = L.marker([m.coords.lat, m.coords.lng], { icon }).addTo(map).bindPopup(m.label || '');
        extraMarkers.current.push(mark);
      });
    });
  }, [pickup, destination, markers, pendingCoords, active]);

  // ── Draw real road route via OSRM ─────────────────────────────────────────
  React.useEffect(() => {
    if (!pickup?.lat || !destination?.lat) {
      routeLayers.current.forEach(l => l.remove());
      routeLayers.current = [];
      return;
    }
    let cancelled = false;
    setRouteLoading(true);
    RouteService.getRoute(pickup, destination).then(result => {
      if (cancelled) return;
      import('leaflet').then(mod => {
        const L = mod.default;
        const map = mapInstance.current;
        if (!map || cancelled) return;

        routeLayers.current.forEach(l => l.remove());
        routeLayers.current = [];

        const pts = result.polyline.map(p => [p.lat, p.lng] as [number, number]);

        // Shadow / glow
        const shadow = L.polyline(pts, { color: '#1e3a8a', weight: 14, opacity: 0.12 }).addTo(map);
        routeLayers.current.push(shadow);

        // Main line
        const line = L.polyline(pts, { color: '#2563eb', weight: 7, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }).addTo(map);
        routeLayers.current.push(line);

        // Midpoint info badge
        if (pts.length > 2) {
          const mid = pts[Math.floor(pts.length / 2)];
          const badge = L.divIcon({
            html: `<div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:4px 9px;font-size:11px;font-weight:700;color:#1e293b;box-shadow:0 2px 6px rgba(0,0,0,0.12);white-space:nowrap">${result.durationLabel} · ${result.distanceKm} km</div>`,
            iconSize: [140, 28], iconAnchor: [70, 14], className: '',
          });
          const info = L.marker(mid, { icon: badge, zIndexOffset: 100 }).addTo(map);
          routeLayers.current.push(info);
        }

        map.fitBounds([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { padding: [50, 50], maxZoom: 14 });
        setRouteLoading(false);
      });
    }).catch(() => {
      if (cancelled) return;
      // Fallback: dashed straight line
      import('leaflet').then(mod => {
        const L = mod.default; const map = mapInstance.current;
        if (!map || !pickup?.lat || !destination?.lat) return;
        routeLayers.current.forEach(l => l.remove()); routeLayers.current = [];
        const line = L.polyline([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { color: '#2563eb', weight: 5, opacity: 0.6, dashArray: '10 6' }).addTo(map);
        routeLayers.current.push(line);
        map.fitBounds([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { padding: [50, 50] });
        setRouteLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng]);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = React.useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length < 3) { setSuggestions([]); return; }
    setSearching(true);
    try { setSuggestions(await LocationService.searchLocations(q)); }
    catch { setSuggestions([]); } finally { setSearching(false); }
  }, []);

  const selectSuggestion = (s: LocationSuggestion) => {
    const c: MapCoords = { lat: s.lat, lng: s.lng, address: s.display_name };
    if (active === 'destination') onDestinationChange?.(c);
    else onPickupChange?.(c);
    setSearchQuery(''); setSuggestions([]); setActive(null);
  };

  const useCurrentLocation = async () => {
    if (!gpsCoords) return;
    const addr = await LocationService.reverseGeocode(gpsCoords).catch(() => latlng(gpsCoords));
    const c: MapCoords = { ...gpsCoords, address: addr };
    if (active === 'destination') onDestinationChange?.(c);
    else onPickupChange?.(c);
    setActive(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Location inputs */}
      <div className="space-y-2">
        {(mode === 'route' || mode === 'single') && onPickupChange && (
          <LocationInput label="Pickup Location" color="blue" value={pickup?.address || ''} placeholder="Search or click map for pickup"
            isActive={active === 'pickup'} onActivate={() => setActive(active === 'pickup' ? null : 'pickup')}
            query={active === 'pickup' ? searchQuery : ''} onSearch={active === 'pickup' ? handleSearch : () => {}}
            suggestions={active === 'pickup' ? suggestions : []} searching={active === 'pickup' && searching}
            onSelect={selectSuggestion} onUseGPS={useCurrentLocation} hasGPS={!!gpsCoords}
            onClear={() => onPickupChange({ lat: 0, lng: 0, address: '' })} />
        )}
        {mode === 'route' && onDestinationChange && (
          <LocationInput label="Destination" color="red" value={destination?.address || ''} placeholder="Search or click map for destination"
            isActive={active === 'destination'} onActivate={() => setActive(active === 'destination' ? null : 'destination')}
            query={active === 'destination' ? searchQuery : ''} onSearch={active === 'destination' ? handleSearch : () => {}}
            suggestions={active === 'destination' ? suggestions : []} searching={active === 'destination' && searching}
            onSelect={selectSuggestion} onUseGPS={useCurrentLocation} hasGPS={!!gpsCoords}
            onClear={() => onDestinationChange({ lat: 0, lng: 0, address: '' })} />
        )}
      </div>

      {active && (
        <div className="flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Click anywhere on the map to set {active === 'pickup' ? 'pickup' : 'destination'} location</span>
        </div>
      )}

      {routeLoading && (
        <div className="flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
          <div className="h-3.5 w-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Calculating road route…</span>
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200" style={{ height }}>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

        {pendingCoords && (active || mode === 'single') && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 p-3.5 flex flex-col items-center space-y-2.5 min-w-[260px] max-w-[90%] pointer-events-auto">
            <div className="text-center">
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">Confirm Location?</p>
              <p className="text-xs text-gray-500 mt-1 font-medium max-w-[220px] truncate leading-normal">
                {pendingCoords.address}
              </p>
            </div>
            <div className="flex space-x-2 w-full">
              <button
                type="button"
                onClick={() => {
                  const targetMode = active || (mode === 'single' ? 'pickup' : null);
                  if (targetMode === 'pickup') {
                    onPickupChange?.(pendingCoords);
                  } else if (targetMode === 'destination') {
                    onDestinationChange?.(pendingCoords);
                  }
                  setPendingCoords(null);
                  setActive(null);
                }}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-colors"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setPendingCoords(null)}
                className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors border border-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Location Input sub-component ─────────────────────────────────────────────

interface LocationInputProps {
  label: string; color: 'blue' | 'red'; value: string; placeholder: string;
  isActive: boolean; onActivate: () => void; query: string; onSearch: (q: string) => void;
  suggestions: LocationSuggestion[]; searching: boolean; onSelect: (s: LocationSuggestion) => void;
  onUseGPS: () => void; hasGPS: boolean; onClear: () => void;
}

function LocationInput({ label, color, value, placeholder, isActive, onActivate, query, onSearch, suggestions, searching, onSelect, onUseGPS, hasGPS, onClear }: LocationInputProps) {
  const dotColor = color === 'blue' ? 'bg-blue-500' : 'bg-red-500';
  return (
    <div className="relative">
      <div className={`flex items-center space-x-2 border-2 rounded-xl px-3 py-2.5 transition-colors ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
        <div className={`h-3 w-3 rounded-full ${dotColor} flex-shrink-0`} />
        <button type="button" onClick={onActivate} className="flex-1 text-left text-sm text-gray-700 truncate">
          {value || <span className="text-gray-400">{placeholder}</span>}
        </button>
        {hasGPS && <button type="button" onClick={onUseGPS} title="Use GPS location" className="text-blue-500 hover:text-blue-700 transition-colors"><Crosshair className="h-4 w-4" /></button>}
        {value && <button type="button" onClick={onClear} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>}
        <button type="button" onClick={onActivate} className="text-gray-400 hover:text-blue-600"><Search className="h-4 w-4" /></button>
      </div>
      {isActive && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-[1000] overflow-hidden">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input autoFocus type="text" value={query} onChange={e => onSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {searching && <div className="px-3 py-2 text-xs text-gray-400">Searching…</div>}
          {suggestions.map(s => (
            <button key={s.place_id} type="button" onClick={() => onSelect(s)}
              className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-t border-gray-100">
              <div className="flex items-start space-x-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 line-clamp-2">{s.display_name}</span>
              </div>
            </button>
          ))}
          {!searching && suggestions.length === 0 && query.length >= 3 && (
            <div className="px-3 py-2.5 text-xs text-gray-400">No results — try a different search or click the map.</div>
          )}
        </div>
      )}
    </div>
  );
}
