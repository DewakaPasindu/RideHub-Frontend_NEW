import React from 'react';
import { Navigation, Clock, Ruler, MapPin } from 'lucide-react';
import type { MapCoords } from '../map/InteractiveMap';

interface Props {
  pickup: (MapCoords & { address: string }) | null;
  destination: (MapCoords & { address: string }) | null;
  distanceKm: number | null;
  durationLabel: string | null;
  driverLocations?: Array<{ id: string; name: string; coords: MapCoords; distanceKm: number }>;
  height?: string;
}

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function RouteMapPanel({
  pickup,
  destination,
  distanceKm,
  durationLabel,
  driverLocations = [],
  height = '420px',
}: Props) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<unknown>(null);
  const layersRef = React.useRef<unknown[]>([]);

  // Init map once
  React.useEffect(() => {
    let mounted = true;
    import('leaflet').then(mod => {
      if (!mounted || !mapRef.current || mapInstance.current) return;
      const L = mod.default;
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      const center = pickup ?? { lat: 7.8731, lng: 80.7718 }; // Sri Lanka center
      mapInstance.current = L.map(mapRef.current!, { zoomControl: true })
        .setView([center.lat, center.lng], pickup ? 11 : 7);
      L.tileLayer(TILE_URL, { attribution: '&copy; OpenStreetMap', maxZoom: 19 })
        .addTo(mapInstance.current as import('leaflet').Map);
    });
    return () => { mounted = false; };
  }, []);

  // Re-render markers + route whenever deps change
  React.useEffect(() => {
    import('leaflet').then(mod => {
      const L = mod.default;
      const map = mapInstance.current as import('leaflet').Map | null;
      if (!map) return;

      // Remove old layers
      (layersRef.current as import('leaflet').Layer[]).forEach(l => l.remove());
      layersRef.current = [];

      const bounds: [number, number][] = [];

      if (pickup) {
        const icon = L.divIcon({
          html: `<div class="flex items-center justify-center" style="width:32px;height:32px;background:#2563eb;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(37,99,235,0.5)"><div style="transform:rotate(45deg);color:white;font-size:13px;font-weight:bold">A</div></div>`,
          iconSize: [32, 32], iconAnchor: [16, 32], className: '',
        });
        const m = L.marker([pickup.lat, pickup.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>Pickup</strong><br/>${pickup.address}`);
        layersRef.current.push(m);
        bounds.push([pickup.lat, pickup.lng]);
      }

      if (destination) {
        const icon = L.divIcon({
          html: `<div style="width:32px;height:32px;background:#dc2626;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(220,38,38,0.5)"><div style="transform:rotate(45deg);color:white;font-size:13px;font-weight:bold;display:flex;align-items:center;justify-content:center;height:100%">B</div></div>`,
          iconSize: [32, 32], iconAnchor: [16, 32], className: '',
        });
        const m = L.marker([destination.lat, destination.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>Destination</strong><br/>${destination.address}`);
        layersRef.current.push(m);
        bounds.push([destination.lat, destination.lng]);
      }

      // Route polyline
      if (pickup && destination) {
        const line = L.polyline(
          [[pickup.lat, pickup.lng], [destination.lat, destination.lng]],
          { color: '#2563eb', weight: 4, opacity: 0.75, dashArray: undefined }
        ).addTo(map);
        layersRef.current.push(line);
        map.fitBounds([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { padding: [50, 50] });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      }

      // Driver location markers
      driverLocations.forEach(d => {
        const icon = L.divIcon({
          html: `<div style="background:#059669;width:20px;height:20px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(5,150,105,0.5)"></div>`,
          iconSize: [20, 20], iconAnchor: [10, 10], className: '',
        });
        const m = L.marker([d.coords.lat, d.coords.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${d.name}</strong><br/>${d.distanceKm.toFixed(1)} km away`);
        layersRef.current.push(m);
      });
    });
  }, [pickup, destination, driverLocations]);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Map container */}
      <div ref={mapRef} style={{ height, width: '100%' }} />

      {/* Overlay: route info pill */}
      {pickup && destination && distanceKm !== null && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
          <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg border border-gray-200">
            <div className="flex items-center space-x-1.5 text-blue-600">
              <Ruler className="h-4 w-4" />
              <span className="font-bold text-sm">{distanceKm} km</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center space-x-1.5 text-emerald-600">
              <Clock className="h-4 w-4" />
              <span className="font-bold text-sm">{durationLabel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay: location labels */}
      {(pickup || destination) && (
        <div className="absolute top-3 left-3 z-[500] space-y-1.5 pointer-events-none">
          {pickup && (
            <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow text-xs font-medium text-gray-800 max-w-[200px]">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-600 flex-shrink-0" />
              <span className="truncate">{pickup.address.split(',')[0]}</span>
            </div>
          )}
          {destination && (
            <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow text-xs font-medium text-gray-800 max-w-[200px]">
              <div className="h-2.5 w-2.5 rounded-full bg-red-600 flex-shrink-0" />
              <span className="truncate">{destination.address.split(',')[0]}</span>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!pickup && !destination && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[400]">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow">
            <Navigation className="h-10 w-10 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Enter pickup & destination</p>
            <p className="text-xs text-gray-400 mt-1">Route will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
}
