import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Car, Users, Shield, ChevronLeft, ChevronRight, MapPin, Calendar,
  Clock, Check, Navigation, Target, Zap, Ruler, CreditCard,
  User, AlertTriangle, Loader
} from 'lucide-react';
import { VehicleService } from '../../services/api/VehicleService';
import { DriverService } from '../../services/api/DriverService';
import { BookingService } from '../../services/api/BookingService';
import { AIService } from '../../services/api/AIService';
import { LocationService } from '../../services/api/LocationService';
import { TripSearchService } from '../../services/api/TripSearchService';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation as useGPS } from '../../contexts/LocationContext';
import type { Vehicle } from '../../services/api/VehicleService';
import type { DriverProfile } from '../../services/api/DriverService';
import type { DriverMatch } from '../../services/api/AIService';
import type { LocationSuggestion } from '../../services/api/LocationService';

export interface BookingCreatePageProps {
  bookingType: 'vehicle' | 'driver';
}

// ─── Sub-types ────────────────────────────────────────────────────────────────

interface MapCoords { lat: number; lng: number; address?: string }

// ─── Location Autocomplete ────────────────────────────────────────────────────

function LocationInput({
  label, pinColor, value, onSelect, onClear, onUseGPS, hasGPS,
}: {
  label: string; pinColor: 'blue' | 'red';
  value: string;
  onSelect: (s: LocationSuggestion) => void;
  onClear: () => void;
  onUseGPS?: () => void;
  hasGPS?: boolean;
}) {
  const [q, setQ] = React.useState('');
  const [results, setResults] = React.useState<LocationSuggestion[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>();
  const wrap = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleChange = (v: string) => {
    setQ(v);
    clearTimeout(timer.current);
    if (v.length < 2) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setBusy(true);
      try { const r = await LocationService.searchLocations(v); setResults(r); setOpen(r.length > 0); }
      catch { setResults([]); } finally { setBusy(false); }
    }, 280);
  };

  const dot = pinColor === 'blue' ? 'bg-blue-500' : 'bg-red-500';
  const ring = pinColor === 'blue' ? 'focus-within:ring-blue-500 focus-within:border-blue-500' : 'focus-within:ring-red-400 focus-within:border-red-400';

  return (
    <div ref={wrap} className="relative">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <div className={`flex items-center space-x-2 border-2 border-gray-200 rounded-xl px-3 py-2.5 ${ring} focus-within:ring-2 transition-colors bg-white`}>
        <div className={`h-3 w-3 rounded-full ${dot} flex-shrink-0`} />
        {value && !open ? (
          <span className="flex-1 text-sm font-medium text-gray-800 truncate">{value}</span>
        ) : (
          <input autoFocus={open} type="text" value={q} onChange={e => handleChange(e.target.value)}
            onFocus={() => q.length >= 2 && setOpen(true)}
            placeholder={`Type to search ${label.toLowerCase()}…`}
            className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400 min-w-0" />
        )}
        {busy && <Loader className="h-4 w-4 text-gray-400 animate-spin flex-shrink-0" />}
        {value && !busy && (
          <button type="button" onClick={() => { onClear(); setQ(''); setResults([]); setOpen(false); }}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-lg leading-none">×</button>
        )}
        {hasGPS && onUseGPS && !value && (
          <button type="button" onClick={onUseGPS} title="Use my GPS location"
            className="text-blue-500 hover:text-blue-700 flex-shrink-0">
            <Navigation className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 z-[600] max-h-56 overflow-y-auto">
          {results.map(r => (
            <button key={r.place_id} type="button"
              onClick={() => { onSelect(r); setQ(r.display_name.split(',')[0]); setResults([]); setOpen(false); }}
              className="w-full flex items-start space-x-2 px-4 py-2.5 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{r.display_name.split(',')[0]}</p>
                <p className="text-xs text-gray-400 truncate">{r.display_name.split(',').slice(1, 3).join(',')}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Map component (inline Leaflet) ──────────────────────────────────────────

function RouteMap({ pickup, destination, driverPins, onSelectPickup, onSelectDestination }: {
  pickup: MapCoords | null;
  destination: MapCoords | null;
  driverPins?: Array<{ name: string; coords: MapCoords }>;
  onSelectPickup?: (c: MapCoords) => void;
  onSelectDestination?: (c: MapCoords) => void;
}) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInst = React.useRef<any>(null);
  const layers = React.useRef<any[]>([]);

  const [activeMode, setActiveMode] = React.useState<'pickup' | 'destination' | null>(null);
  const [pendingCoords, setPendingCoords] = React.useState<MapCoords | null>(null);
  const modeRef = React.useRef(activeMode);

  React.useEffect(() => {
    modeRef.current = activeMode;
  }, [activeMode]);

  React.useEffect(() => {
    let mounted = true;
    import('leaflet').then(mod => {
      if (!mounted || !mapRef.current || mapInst.current) return;
      const L = mod.default;
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      const center = pickup ?? { lat: 7.8731, lng: 80.7718 };
      const map = L.map(mapRef.current!, { zoomControl: true }).setView([center.lat, center.lng], pickup ? 12 : 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
      
      map.on('click', async (e: any) => {
        const mode = modeRef.current;
        if (!mode) return;
        
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
        const tempAddr = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
        const c = { ...coords, address: tempAddr };

        setPendingCoords(c);

        try {
          const resolved = await LocationService.reverseGeocode(coords);
          setPendingCoords(prev => {
            if (prev && prev.lat === coords.lat && prev.lng === coords.lng) {
              return { ...prev, address: resolved };
            }
            return prev;
          });
        } catch {
          // keep temp coordinates address
        }
      });

      mapInst.current = map;
    });
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    import('leaflet').then(mod => {
      const L = mod.default;
      const map = mapInst.current as import('leaflet').Map | null;
      if (!map) return;
      (layers.current as import('leaflet').Layer[]).forEach(l => l.remove());
      layers.current = [];

      const bounds: [number, number][] = [];

      if (pickup && pickup.lat) {
        const icon = L.divIcon({ html: `<div style="background:#2563eb;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(37,99,235,.5)"><span style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:11px;font-weight:900">A</span></div>`, iconSize: [28, 28], iconAnchor: [14, 28], className: '' });
        const m = L.marker([pickup.lat, pickup.lng], { icon }).addTo(map).bindPopup(`<b>Pickup</b><br>${pickup.address ?? ''}`);
        layers.current.push(m);
        bounds.push([pickup.lat, pickup.lng]);
      }

      if (destination && destination.lat) {
        const icon = L.divIcon({ html: `<div style="background:#dc2626;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(220,38,38,.5)"><span style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:11px;font-weight:900">B</span></div>`, iconSize: [28, 28], iconAnchor: [14, 28], className: '' });
        const m = L.marker([destination.lat, destination.lng], { icon }).addTo(map).bindPopup(`<b>Destination</b><br>${destination.address ?? ''}`);
        layers.current.push(m);
        bounds.push([destination.lat, destination.lng]);
      }

      if (pickup?.lat && destination?.lat) {
        const line = L.polyline([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { color: '#3b82f6', weight: 4, opacity: 0.8 }).addTo(map);
        layers.current.push(line);
        map.fitBounds([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { padding: [40, 40] });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      }

      if (pendingCoords && pendingCoords.lat) {
        const markerColor = activeMode === 'pickup' ? '#2563eb' : '#dc2626';
        const icon = L.divIcon({ html: `<div style="background:${markerColor};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)"><span style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:11px;font-weight:900">?</span></div>`, iconSize: [28, 28], iconAnchor: [14, 28], className: '' });
        const m = L.marker([pendingCoords.lat, pendingCoords.lng], { icon }).addTo(map).bindPopup(`<b>Confirming Location...</b><br>${pendingCoords.address ?? ''}`);
        layers.current.push(m);
        m.openPopup();
      }

      (driverPins ?? []).forEach(d => {
        if (!d.coords.lat) return;
        const icon = L.divIcon({ html: `<div style="background:#059669;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(5,150,105,.4)"></div>`, iconSize: [16, 16], iconAnchor: [8, 8], className: '' });
        const m = L.marker([d.coords.lat, d.coords.lng], { icon }).addTo(map).bindPopup(d.name);
        layers.current.push(m);
      });
    });
  }, [pickup, destination, driverPins, pendingCoords, activeMode]);

  const showSelectors = onSelectPickup || onSelectDestination;

  return (
    <div className="relative rounded-2xl overflow-hidden shadow border border-gray-200 bg-white">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      
      {showSelectors && (
        <div className="flex items-center justify-between border-b border-gray-100 p-3 bg-gray-50">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Set Pin on Map</span>
          <div className="flex space-x-2">
            {onSelectPickup && (
              <button
                type="button"
                onClick={() => {
                  setPendingCoords(null);
                  setActiveMode(activeMode === 'pickup' ? null : 'pickup');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeMode === 'pickup'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                📍 Set Pickup
              </button>
            )}
            {onSelectDestination && (
              <button
                type="button"
                onClick={() => {
                  setPendingCoords(null);
                  setActiveMode(activeMode === 'destination' ? null : 'destination');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeMode === 'destination'
                    ? 'bg-red-600 border-red-600 text-white shadow-sm'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                📍 Set Drop-off
              </button>
            )}
          </div>
        </div>
      )}

      {activeMode && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-xs font-medium text-blue-700 animate-pulse">
          Click anywhere on the map below to set your <b>{activeMode === 'pickup' ? 'pickup location' : 'drop-off location'}</b>.
        </div>
      )}

      <div className="relative">
        <div ref={mapRef} style={{ height: '320px', width: '100%' }} />

        {pendingCoords && activeMode && (
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
                  if (activeMode === 'pickup') {
                    onSelectPickup?.(pendingCoords);
                  } else {
                    onSelectDestination?.(pendingCoords);
                  }
                  setPendingCoords(null);
                  setActiveMode(null);
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

      {pickup?.lat && destination?.lat && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
          <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-md border border-gray-200 text-xs font-semibold">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-gray-700">{pickup.address?.split(',')[0]}</span>
            <span className="text-gray-400">→</span>
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-gray-700">{destination.address?.split(',')[0]}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step progress bar ────────────────────────────────────────────────────────

function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center mb-8">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              i < current ? 'bg-blue-600 border-blue-600 text-white' :
              i === current ? 'border-blue-600 text-blue-600 bg-blue-50' :
              'border-gray-300 text-gray-400 bg-white'
            }`}>
              {i < current ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${i === current ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-colors ${i < current ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Service type badge ────────────────────────────────────────────────────────

function ServiceBadge({ bookingType }: { bookingType: 'vehicle' | 'driver' }) {
  if (bookingType === 'vehicle') {
    return (
      <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mb-6 w-fit">
        <Car className="h-5 w-5 text-blue-600" />
        <div>
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Vehicle with Driver</p>
          <p className="text-xs text-blue-600">Professional driver provided with vehicle</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center space-x-2 bg-violet-50 border border-violet-200 rounded-xl px-4 py-2 mb-6 w-fit">
      <Users className="h-5 w-5 text-violet-600" />
      <div>
        <p className="text-xs font-bold text-violet-800 uppercase tracking-wide">Driver Hire</p>
        <p className="text-xs text-violet-600">Driver for your personal vehicle</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Step = 'location' | 'schedule' | 'summary';

const BOOKING_STEPS = ['Location', 'Schedule', 'Confirm'];

const DRIVER_PLACEHOLDER = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=120&q=80';
const VEHICLE_PLACEHOLDER = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&q=80';

export default function BookingCreatePage({ bookingType }: BookingCreatePageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coords: gpsCoords, permission, requestPermission } = useGPS();

  // ── Target entity (vehicle or driver being booked) ─────────────────────────
  const [target, setTarget] = React.useState<Vehicle | DriverProfile | null>(null);
  const [loadingTarget, setLoadingTarget] = React.useState(true);
  const [targetError, setTargetError] = React.useState('');

  // ── Navigation (3 Steps: Location -> Schedule -> Confirm) ─────────────────
  const [step, setStep] = React.useState<Step>('location');
  const steps = BOOKING_STEPS;
  const stepIndex = { location: 0, schedule: 1, summary: 2 }[step] ?? 0;

  // ── Location & route ───────────────────────────────────────────────────────
  const [pickup, setPickup] = React.useState<MapCoords | null>(null);
  const [destination, setDestination] = React.useState<MapCoords | null>(null);
  const [distanceKm, setDistanceKm] = React.useState<number | null>(null);
  const [durationLabel, setDurationLabel] = React.useState<string | null>(null);
  const [calcingRoute, setCalcingRoute] = React.useState(false);
  const [requestingGPS, setRequestingGPS] = React.useState(false);

  // ── Schedule ───────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('18:00');
  const [passengers, setPassengers] = React.useState(1);
  const [acPref, setAcPref] = React.useState('any');
  const [notes, setNotes] = React.useState('');
  const [advanceAmount, setAdvanceAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<'cash' | 'card'>('cash');

  // ── Submission ─────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  // ── Derived ────────────────────────────────────────────────────────────────
  const vehicle = bookingType === 'vehicle' ? target as Vehicle | null : null;
  const driver = bookingType === 'driver' ? target as DriverProfile | null : null;

  const { days, hours, fullDays, extraHours, totalAmount } = React.useMemo(() => {
    if (!startDate || !endDate || !vehicle) return { days: 0, hours: 0, fullDays: 0, extraHours: 0, totalAmount: 0 };
    const start = new Date(`${startDate}T${startTime || '09:00'}:00`);
    const end = new Date(`${endDate}T${endTime || '18:00'}:00`);
    const diffMs = end.getTime() - start.getTime();
    const dailyRate = vehicle.price_per_day;
    const hourlyRate = dailyRate / 24;

    if (diffMs <= 0) {
      return { days: 1, hours: 0, fullDays: 1, extraHours: 0, totalAmount: Math.round(dailyRate) };
    }

    const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

    // Minimum 1 full day for duration <= 24 hours
    if (totalHours <= 24) {
      return {
        days: 1,
        hours: totalHours,
        fullDays: 1,
        extraHours: 0,
        totalAmount: Math.round(dailyRate),
      };
    }

    // For duration > 24 hours: full day(s) plus extra hours
    const fDays = Math.floor(totalHours / 24);
    const eHours = Math.round((totalHours - (fDays * 24)) * 10) / 10;
    const cDays = Math.ceil(totalHours / 24);
    const amount = Math.round((fDays * dailyRate) + (eHours * hourlyRate));

    return {
      days: cDays,
      hours: totalHours,
      fullDays: fDays,
      extraHours: eHours,
      totalAmount: amount,
    };
  }, [startDate, endDate, startTime, endTime, vehicle]);

  const targetName = bookingType === 'vehicle' && vehicle
    ? `${vehicle.brand} ${vehicle.model}`
    : driver?.user ? `${driver.user.first_name} ${driver.user.last_name}` : '';

  // ── Load target ────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const t = bookingType === 'vehicle'
          ? await VehicleService.getById(id)
          : await DriverService.getById(id);
        if (!t) throw new Error('Not found');
        setTarget(t);
      } catch {
        setTargetError(bookingType === 'vehicle' ? 'Vehicle not found' : 'Driver not found');
      } finally {
        setLoadingTarget(false);
      }
    })();
  }, [id, bookingType]);

  // ── Auto-fill pickup from GPS ──────────────────────────────────────────────
  React.useEffect(() => {
    if (gpsCoords && !pickup) {
      LocationService.reverseGeocode(gpsCoords)
        .then(address => setPickup({ ...gpsCoords, address }))
        .catch(() => setPickup({ ...gpsCoords, address: `${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}` }));
    }
  }, [gpsCoords]);

  // ── Recalculate route when both coords known ───────────────────────────────
  React.useEffect(() => {
    if (!pickup?.lat || !destination?.lat) { setDistanceKm(null); setDurationLabel(null); return; }
    setCalcingRoute(true);
    TripSearchService.analyzeTrip({
      pickup: pickup as { lat: number; lng: number; address: string },
      destination: destination as { lat: number; lng: number; address: string },
      passenger_count: passengers,
      budget: totalAmount || 10000,
      luggage_size: 'medium',
      trip_date: startDate || today,
      driver_required: bookingType === 'vehicle',
    }).then(a => {
      setDistanceKm(a.distance_km);
      setDurationLabel(a.estimated_hours_label);
    }).catch(() => {}).finally(() => setCalcingRoute(false));
  }, [pickup, destination]);

  // ── GPS request ────────────────────────────────────────────────────────────
  const handleRequestGPS = async () => {
    setRequestingGPS(true);
    await requestPermission();
    setRequestingGPS(false);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user || !id) return;
    if (!pickup) { setSubmitError('Pickup location is required'); return; }
    if (!startDate || !endDate) { setSubmitError('Please set your trip dates'); return; }
    if (new Date(endDate) < new Date(startDate)) { setSubmitError('End date must be on or after start date'); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      await BookingService.create({
        user_id: user.id,
        booking_type: bookingType,
        ...(bookingType === 'vehicle' ? { vehicle_id: id } : { driver_profile_id: id }),
        target_name: targetName,
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        pickup_location: pickup.address || `${pickup.lat},${pickup.lng}`,
        dropoff_location: destination?.address || destination ? `${destination?.lat},${destination?.lng}` : '',
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dropoff_lat: destination?.lat,
        dropoff_lng: destination?.lng,
        passenger_count: passengers,
        ac_preference: acPref,
        total_amount: totalAmount,
        advance_amount: advanceAmount ? parseFloat(advanceAmount) : 0,
        payment_method: paymentMethod,
        notes: notes || undefined,
      } as Parameters<typeof BookingService.create>[0]);
      navigate('/bookings', { state: { success: 'Booking submitted successfully! You will be notified once approved.' } });
    } catch (err: unknown) {
      setSubmitError((err as { userMessage?: string })?.userMessage ?? 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render guards ─────────────────────────────────────────────────────────

  if (loadingTarget) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (targetError || !target) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">{targetError || 'Not found'}</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline text-sm">Go back</button>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 mb-5 text-sm transition-colors">
        <ChevronLeft className="h-4 w-4" /><span>Back</span>
      </button>

      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-shrink-0">
          {bookingType === 'vehicle' && vehicle ? (
            <img src={vehicle.images?.[0] || VEHICLE_PLACEHOLDER} alt={targetName}
              className="h-16 w-20 rounded-xl object-cover border border-gray-200"
              onError={e => { (e.target as HTMLImageElement).src = VEHICLE_PLACEHOLDER; }} />
          ) : driver ? (
            <img src={driver.profile_photo || DRIVER_PLACEHOLDER} alt={targetName}
              className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
              onError={e => { (e.target as HTMLImageElement).src = DRIVER_PLACEHOLDER; }} />
          ) : null}
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{targetName}</h1>
          {bookingType === 'vehicle' && vehicle && (
            <p className="text-sm text-gray-500">{vehicle.year} · {vehicle.seat_count} seats · <span className="text-blue-600 font-semibold">LKR {vehicle.price_per_day.toLocaleString()}/day</span></p>
          )}
          {bookingType === 'driver' && driver && (
            <p className="text-sm text-gray-500">{driver.experience_years}y experience · ⭐ {driver.rating.toFixed(1)}</p>
          )}
        </div>
      </div>

      <ServiceBadge bookingType={bookingType} />

      {bookingType === 'vehicle' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300/80 rounded-2xl p-4 mb-6 gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl flex-shrink-0 shadow-sm">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">Looking for Vehicle-Only / Self-Drive Rental?</h4>
              <p className="text-xs text-emerald-700">Rent this vehicle without a driver with verified document check and condition handover.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/customer/rentals/apply?vehicle_id=${vehicle?.id || id}`)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg"
          >
            <Shield className="h-4 w-4" />
            <span>Switch to Self-Drive Rental</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <StepBar steps={steps} current={stepIndex} />

      {submitError && (
        <div className="mb-5 flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>{submitError}</span>
        </div>
      )}

      {/* ════ STEP: LOCATION ════════════════════════════════════════════════ */}
      {step === 'location' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" /><span>Set Your Route</span>
          </h2>

          {/* GPS gate */}
          {permission === 'denied' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">Location access denied</p>
                  <p className="text-xs text-amber-700 mt-0.5">Enable GPS for auto-fill, or type your pickup location below.</p>
                </div>
                <button onClick={handleRequestGPS} disabled={requestingGPS}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 disabled:opacity-60 flex-shrink-0">
                  {requestingGPS ? 'Requesting…' : 'Retry'}
                </button>
              </div>
            </div>
          )}

          {permission === 'granted' && gpsCoords && (
            <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>GPS active — pickup pre-filled from your current location</span>
            </div>
          )}

          <LocationInput label="Pickup Location" pinColor="blue"
            value={pickup?.address ?? ''}
            onSelect={s => setPickup({ lat: s.lat, lng: s.lng, address: s.display_name })}
            onClear={() => setPickup(null)}
            onUseGPS={() => {
              if (gpsCoords) LocationService.reverseGeocode(gpsCoords).then(a => setPickup({ ...gpsCoords, address: a })).catch(() => {});
            }}
            hasGPS={permission === 'granted' && !!gpsCoords}
          />

          <LocationInput label="Drop-off Location" pinColor="red"
            value={destination?.address ?? ''}
            onSelect={s => setDestination({ lat: s.lat, lng: s.lng, address: s.display_name })}
            onClear={() => setDestination(null)}
          />

          {/* Route info chips */}
          {distanceKm !== null && durationLabel && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 bg-blue-50 px-3 py-1.5 rounded-lg text-sm text-blue-700 font-semibold">
                <Ruler className="h-4 w-4" /><span>{distanceKm} km</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm text-emerald-700 font-semibold">
                <Clock className="h-4 w-4" /><span>{durationLabel}</span>
              </div>
              {calcingRoute && <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
            </div>
          )}
          {calcingRoute && distanceKm === null && (
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <div className="h-3.5 w-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /><span>Calculating route…</span>
            </div>
          )}

          <RouteMap 
            pickup={pickup} 
            destination={destination} 
            onSelectPickup={setPickup}
            onSelectDestination={setDestination}
          />

          <button onClick={() => setStep('schedule')} disabled={!pickup}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors shadow-sm">
            <span>Continue to Schedule</span><ChevronRight className="h-4 w-4" />
          </button>
          {!pickup && <p className="text-center text-xs text-gray-400">Enter a pickup location to continue</p>}
        </div>
      )}

      {/* ════ STEP: SCHEDULE ════════════════════════════════════════════════ */}
      {step === 'schedule' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" /><span>Trip Schedule</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Start Date *</label>
              <input type="date" min={today} value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">End Date *</label>
              <input type="date" min={startDate || today} value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Start Time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">End Time</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Passengers</label>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button type="button" onClick={() => setPassengers(p => Math.max(1, p - 1))} className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 font-bold text-lg">−</button>
                <span className="flex-1 text-center text-sm font-semibold">{passengers}</span>
                <button type="button" onClick={() => setPassengers(p => Math.min(60, p + 1))} className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 font-bold text-lg">+</button>
              </div>
            </div>
            {bookingType === 'vehicle' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">AC Preference</label>
                <select value={acPref} onChange={e => setAcPref(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="any">No Preference</option>
                  <option value="required">AC Required</option>
                  <option value="none">No AC</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Special Notes</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any special requirements or instructions…"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          {days > 0 && vehicle && (
            <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-blue-900">
                  {hours <= 24
                    ? `1 Day (${hours} hrs) × LKR ${vehicle.price_per_day.toLocaleString()}`
                    : `${fullDays}d + ${extraHours}h (LKR ${(vehicle.price_per_day / 24).toFixed(0)}/h)`}
                </span>
                <span className="block text-[11px] text-blue-600 font-medium">
                  {hours <= 24 ? 'Up to 24 hrs = 1 full day minimum' : `${hours} hrs total • Extra hours charged hourly`}
                </span>
              </div>
              <span className="text-xl font-black text-blue-700">LKR {totalAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex space-x-3">
            <button onClick={() => setStep('location')} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">← Back</button>
            <button onClick={() => setStep('summary')} disabled={!startDate || !endDate}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors">
              Review Booking →
            </button>
          </div>
        </div>
      )}

      {/* ════ STEP: SUMMARY ═════════════════════════════════════════════════ */}
      {step === 'summary' && (
        <div className="space-y-4">
          {/* Route map recap */}
          <RouteMap pickup={pickup} destination={destination} />

          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2 mb-5">
              <CreditCard className="h-5 w-5 text-blue-600" /><span>Booking Summary</span>
            </h2>

            <div className="space-y-3">
              {/* Route */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                <div className="flex items-start space-x-3">
                  <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">A</div>
                  <div><p className="text-xs text-gray-500">Pickup</p><p className="text-sm font-semibold text-gray-800">{pickup?.address ?? '—'}</p></div>
                </div>
                {destination?.address && (
                  <div className="flex items-start space-x-3">
                    <div className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">B</div>
                    <div><p className="text-xs text-gray-500">Drop-off</p><p className="text-sm font-semibold text-gray-800">{destination.address}</p></div>
                  </div>
                )}
                {distanceKm !== null && (
                  <div className="flex items-center space-x-4 pt-1">
                    <div className="flex items-center space-x-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg font-semibold"><Ruler className="h-3.5 w-3.5" /><span>{distanceKm} km</span></div>
                    {durationLabel && <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-semibold"><Clock className="h-3.5 w-3.5" /><span>{durationLabel}</span></div>}
                  </div>
                )}
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Dates', `${startDate} → ${endDate}`],
                  ['Time', `${startTime} – ${endTime} (${hours} hrs)`],
                  ['Duration', hours <= 24 ? `1 Day (${hours} hrs)` : `${fullDays}d + ${extraHours}h (${hours} hrs)`],
                  ['Passengers', `${passengers} person${passengers > 1 ? 's' : ''}`],
                  ...(bookingType === 'vehicle' ? [['AC', acPref === 'required' ? 'Required' : acPref === 'none' ? 'None' : 'Any']] : []),
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-gray-400">{l}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>

              {/* Service */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center space-x-3">
                {bookingType === 'vehicle' && vehicle ? (
                  <>
                    <img src={vehicle.images?.[0] || VEHICLE_PLACEHOLDER} alt="" className="h-10 w-14 rounded-lg object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = VEHICLE_PLACEHOLDER; }} />
                    <div>
                      <p className="text-xs text-gray-500">Vehicle</p>
                      <p className="text-sm font-bold text-gray-900">{targetName}</p>
                    </div>
                  </>
                ) : driver ? (
                  <>
                    <img src={driver.profile_photo || DRIVER_PLACEHOLDER} alt="" className="h-10 w-10 rounded-full object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = DRIVER_PLACEHOLDER; }} />
                    <div>
                      <p className="text-xs text-gray-500">Driver</p>
                      <p className="text-sm font-bold text-gray-900">{targetName}</p>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Dedicated driver for vehicle with driver rentals */}
              {bookingType === 'vehicle' && (
                <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center space-x-3 border border-emerald-200">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Dedicated Driver Included</p>
                    <p className="text-sm font-bold text-emerald-950">Professional driver provided with this vehicle</p>
                    <p className="text-xs text-emerald-700">A qualified, verified driver is assigned directly by the vehicle owner for your entire trip.</p>
                  </div>
                  <Shield className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                </div>
              )}

              {/* Cost */}
              {totalAmount > 0 && (
                <>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-emerald-800 font-medium">
                      Estimated Total ({hours <= 24 ? '1 day' : `${fullDays}d + ${extraHours}h`} • {hours} hrs)
                    </span>
                    <span className="text-2xl font-black text-emerald-700">LKR {totalAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Advance Payment (LKR) <span className="text-gray-400 font-normal normal-case">— optional</span></label>
                    <input type="number" min="0" value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)}
                      placeholder="Enter advance amount if applicable"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Method</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as 'cash' | 'card')}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="cash">Cash Payment (Default)</option>
                    </select>
                  </div>
                </>
              )}

              {notes && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-gray-400">Notes</p>
                  <p className="text-sm text-gray-700 mt-0.5">{notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={() => setStep('schedule')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">← Back</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center space-x-2">
              {submitting
                ? <><div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /><span>Creating Booking…</span></>
                : <><Check className="h-4 w-4" /><span>Confirm Booking</span></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
