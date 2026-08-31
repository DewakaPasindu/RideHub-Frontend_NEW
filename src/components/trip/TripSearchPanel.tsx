import React from 'react';
import { MapPin, Navigation, Search, X, Crosshair, Loader, ChevronRight, Users, Wallet, Package, Calendar, Car } from 'lucide-react';
import { useLocation as useGPS } from '../../contexts/LocationContext';
import { LocationService } from '../../services/api/LocationService';
import type { LocationSuggestion } from '../../services/api/LocationService';
import type { MapCoords } from '../map/InteractiveMap';

export interface TripFormValues {
  pickup: (MapCoords & { address: string }) | null;
  destination: (MapCoords & { address: string }) | null;
  passenger_count: number;
  budget: number;
  luggage_size: 'light' | 'medium' | 'heavy';
  trip_date: string;
  driver_required: boolean;
}

interface Props {
  value: TripFormValues;
  onChange: (v: TripFormValues) => void;
  onSearch: () => void;
  loading?: boolean;
}

const LUGGAGE_OPTIONS = [
  { value: 'light', label: 'Light', desc: 'Backpacks only', icon: '🎒' },
  { value: 'medium', label: 'Medium', desc: 'Up to 2 suitcases', icon: '🧳' },
  { value: 'heavy', label: 'Heavy', desc: '3+ large bags', icon: '📦' },
] as const;

function LocationAutocomplete({
  label, value, placeholder, pinColor, onSelect, onUseGPS, hasGPS,
}: {
  label: string;
  value: string;
  placeholder: string;
  pinColor: 'blue' | 'red';
  onSelect: (s: LocationSuggestion) => void;
  onUseGPS?: () => void;
  hasGPS?: boolean;
}) {
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const debounce = React.useRef<ReturnType<typeof setTimeout>>();
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (q: string) => {
    setQuery(q);
    clearTimeout(debounce.current);
    if (q.length < 2) { setSuggestions([]); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await LocationService.searchLocations(q);
        setSuggestions(res);
        setOpen(true);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 300);
  };

  const dotCls = pinColor === 'blue' ? 'bg-blue-600' : 'bg-red-500';
  const ringCls = pinColor === 'blue' ? 'focus-within:ring-blue-500' : 'focus-within:ring-red-400';

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className={`flex items-center space-x-2 border-2 border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-500 transition-colors focus-within:ring-2 ${ringCls}`}>
        <div className={`h-3 w-3 rounded-full ${dotCls} flex-shrink-0`} />
        {value && !open ? (
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="text-sm font-medium text-gray-800 truncate">{value}</span>
            <button type="button" onClick={() => { setQuery(''); setOpen(true); }} className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <input
            autoFocus={open}
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onFocus={() => query.length >= 2 && setOpen(true)}
            placeholder={placeholder}
            className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
          />
        )}
        {hasGPS && onUseGPS && !value && (
          <button type="button" onClick={onUseGPS} title="Use GPS location" className="text-blue-500 hover:text-blue-700 flex-shrink-0">
            <Crosshair className="h-4 w-4" />
          </button>
        )}
        {!value && <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 z-[2000] overflow-hidden">
          {loading && (
            <div className="flex items-center space-x-2 px-4 py-3 text-gray-400">
              <Loader className="h-4 w-4 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          )}
          {!loading && suggestions.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-sm text-gray-400">No results for "{query}"</div>
          )}
          {suggestions.map(s => (
            <button
              key={s.place_id}
              type="button"
              onClick={() => { onSelect(s); setQuery(''); setSuggestions([]); setOpen(false); }}
              className="w-full flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 text-left border-t border-gray-50 first:border-0 transition-colors"
            >
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800 leading-tight">{s.display_name.split(',')[0]}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{s.display_name.split(',').slice(1, 3).join(',')}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TripSearchPanel({ value, onChange, onSearch, loading }: Props) {
  const { coords: gpsCoords } = useGPS();
  const [gpsLoading, setGpsLoading] = React.useState(false);

  const set = (patch: Partial<TripFormValues>) => onChange({ ...value, ...patch });

  const useGPSForPickup = async () => {
    if (!gpsCoords) return;
    setGpsLoading(true);
    try {
      const address = await LocationService.reverseGeocode(gpsCoords);
      set({ pickup: { ...gpsCoords, address } });
    } finally { setGpsLoading(false); }
  };

  const canSearch = !!value.pickup && !!value.destination && value.passenger_count > 0 && value.budget > 0 && !!value.trip_date;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-5">
        <h2 className="text-xl font-bold text-white">Plan Your Trip</h2>
        <p className="text-blue-200 text-sm mt-0.5">Enter your route to get AI-powered recommendations</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Route inputs */}
        <div className="space-y-3">
          <LocationAutocomplete
            label="Pickup Location"
            value={value.pickup?.address ?? ''}
            placeholder="Where are you starting from?"
            pinColor="blue"
            onSelect={s => set({ pickup: { lat: s.lat, lng: s.lng, address: s.display_name } })}
            onUseGPS={useGPSForPickup}
            hasGPS={!!gpsCoords}
          />

          {/* Connector line */}
          <div className="flex items-center pl-[22px] space-x-2">
            <div className="flex flex-col items-center">
              <div className="w-px h-3 bg-gray-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <div className="w-px h-3 bg-gray-300" />
            </div>
          </div>

          <LocationAutocomplete
            label="Drop-off Location"
            value={value.destination?.address ?? ''}
            placeholder="Where are you going?"
            pinColor="red"
            onSelect={s => set({ destination: { lat: s.lat, lng: s.lng, address: s.display_name } })}
          />
        </div>

        {/* Trip details grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center space-x-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <Calendar className="h-3.5 w-3.5" /><span>Trip Date</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={value.trip_date}
              onChange={e => set({ trip_date: e.target.value })}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>
          <div>
            <label className="flex items-center space-x-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <Users className="h-3.5 w-3.5" /><span>Passengers</span>
            </label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-colors">
              <button type="button" onClick={() => set({ passenger_count: Math.max(1, value.passenger_count - 1) })} className="px-3 py-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 font-bold text-lg leading-none">−</button>
              <span className="flex-1 text-center text-sm font-semibold text-gray-800">{value.passenger_count}</span>
              <button type="button" onClick={() => set({ passenger_count: Math.min(60, value.passenger_count + 1) })} className="px-3 py-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 font-bold text-lg leading-none">+</button>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <Wallet className="h-3.5 w-3.5" /><span>Budget (LKR/day)</span>
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={value.budget || ''}
              onChange={e => set({ budget: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 15000"
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center space-x-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <Package className="h-3.5 w-3.5" /><span>Luggage</span>
            </label>
            <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden">
              {LUGGAGE_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => set({ luggage_size: opt.value })}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${value.luggage_size === opt.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  title={opt.desc}>
                  {opt.icon}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">{LUGGAGE_OPTIONS.find(o => o.value === value.luggage_size)?.desc}</p>
          </div>
        </div>

        {/* Driver toggle */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <div className="flex items-center space-x-2">
            <Car className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-800">Include Driver</p>
              <p className="text-xs text-gray-500">AI will match the best available driver</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => set({ driver_required: !value.driver_required })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value.driver_required ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value.driver_required ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* GPS status */}
        {gpsCoords && (
          <div className="flex items-center space-x-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GPS active — use the crosshair icon to fill pickup from your location</span>
          </div>
        )}

        {/* Search button */}
        <button
          type="button"
          onClick={onSearch}
          disabled={!canSearch || loading}
          className="w-full flex items-center justify-center space-x-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors shadow-sm text-sm"
        >
          {loading ? (
            <><Loader className="h-5 w-5 animate-spin" /><span>Analysing Trip...</span></>
          ) : (
            <><Search className="h-5 w-5" /><span>Find Best Vehicles & Drivers</span><ChevronRight className="h-4 w-4 ml-1" /></>
          )}
        </button>

        {!canSearch && (
          <p className="text-center text-xs text-gray-400">Fill in all fields above to continue</p>
        )}
      </div>
    </div>
  );
}
