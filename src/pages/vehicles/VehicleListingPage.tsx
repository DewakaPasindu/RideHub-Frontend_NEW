import React from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Plus, Car, Zap, Search, SlidersHorizontal, X, Star, Users, Fuel, Settings2, Thermometer, MapPin, ChevronRight, Filter, Tag, Navigation, Crosshair, Loader, DollarSign, Route as RouteIcon, UserCheck, UserX, Shield } from 'lucide-react';
import { useLocation as useGPS } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { VehicleService } from '../../services/api/VehicleService';
import { AIService } from '../../services/api/AIService';
import { LocationService } from '../../services/api/LocationService';
import type { Vehicle, VehicleFilters } from '../../services/api/VehicleService';
import type { VehicleRecommendation } from '../../services/api/AIService';
import type { LocationSuggestion } from '../../services/api/LocationService';
import LocationPermissionBanner from '../../components/location/LocationPermissionBanner';
import GPSStatusIndicator from '../../components/location/GPSStatusIndicator';
import Pagination from '../../components/common/Pagination';
import InteractiveMap from '../../components/map/InteractiveMap';
import type { MapCoords } from '../../components/map/InteractiveMap';

// ─── Constants ────────────────────────────────────────────────────────────────

const VEHICLE_PLACEHOLDER = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80';
const TOWNS = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Matara', 'Nuwara Eliya', 'Trincomalee', 'Batticaloa', 'Anuradhapura'];

// Vehicle models grouped by type with passenger counts
const VEHICLE_MODELS: Record<string, Array<{ model: string; seats: number }>> = {
  car: [
    { model: 'Toyota Prius', seats: 5 }, { model: 'Honda Vezel', seats: 5 },
    { model: 'Toyota Corolla', seats: 5 }, { model: 'Suzuki Alto', seats: 5 },
    { model: 'Honda Fit', seats: 5 }, { model: 'Toyota Aqua', seats: 5 },
    { model: 'BMW 3 Series', seats: 5 }, { model: 'Mercedes C-Class', seats: 5 },
  ],
  suv: [
    { model: 'Toyota Land Cruiser', seats: 7 }, { model: 'Mitsubishi Outlander', seats: 7 },
    { model: 'Toyota RAV4', seats: 5 }, { model: 'Honda CR-V', seats: 5 },
    { model: 'Nissan X-Trail', seats: 7 }, { model: 'Suzuki Vitara', seats: 5 },
  ],
  van: [
    { model: 'Toyota HiAce', seats: 14 }, { model: 'Toyota KDH', seats: 9 },
    { model: 'Toyota Dolphin', seats: 12 }, { model: 'Nissan Urvan', seats: 12 },
    { model: 'Honda Stepwagon', seats: 8 }, { model: 'Toyota Voxy', seats: 8 },
  ],
  minibus: [
    { model: 'Rosa Minibus', seats: 24 }, { model: 'Coaster Bus', seats: 30 },
    { model: 'Toyota Coaster', seats: 26 },
  ],
  bus: [
    { model: 'Ashok Leyland Bus', seats: 52 }, { model: 'Tata Bus', seats: 45 },
    { model: 'Volvo Bus', seats: 54 },
  ],
  truck: [
    { model: 'TATA Lorry', seats: 3 }, { model: 'Isuzu Elf', seats: 3 },
    { model: 'Mitsubishi Canter', seats: 3 },
  ],
};

type SearchMode = 'browse' | 'smart';
type BudgetMode = 'per_day' | 'per_km';

// ─── Shared components ────────────────────────────────────────────────────────

function LocationAutocomplete({
  label, pinColor, value, onSelect, onClear, onUseGPS, hasGPS, placeholder,
}: {
  label: string; pinColor: 'blue' | 'red';
  value: string; placeholder?: string;
  onSelect: (s: LocationSuggestion) => void;
  onClear: () => void; onUseGPS?: () => void; hasGPS?: boolean;
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

  // Show filled value when not editing
  React.useEffect(() => { if (!value) setQ(''); }, [value]);

  const handleInput = (v: string) => {
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
  const focusRing = pinColor === 'blue' ? 'focus-within:ring-blue-400 focus-within:border-blue-500' : 'focus-within:ring-red-300 focus-within:border-red-500';

  return (
    <div ref={wrap} className="relative">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className={`flex items-center border-2 border-gray-200 rounded-xl px-3 py-2.5 ${focusRing} focus-within:ring-2 bg-white transition-colors`}>
        <div className={`h-3 w-3 rounded-full ${dot} flex-shrink-0 mr-2`} />
        {value && !open ? (
          <span className="flex-1 text-sm font-medium text-gray-800 truncate">{value}</span>
        ) : (
          <input
            autoFocus={open} type="text" value={q}
            onChange={e => handleInput(e.target.value)}
            onFocus={() => q.length >= 2 && setOpen(true)}
            placeholder={placeholder ?? `Search ${label.toLowerCase()}…`}
            className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400 min-w-0"
          />
        )}
        {busy && <Loader className="h-3.5 w-3.5 text-gray-400 animate-spin flex-shrink-0 ml-1" />}
        {value && !busy && (
          <button type="button" onClick={() => { onClear(); setQ(''); setResults([]); setOpen(false); }}
            className="text-gray-400 hover:text-gray-600 ml-1.5 text-xl leading-none flex-shrink-0">×</button>
        )}
        {hasGPS && onUseGPS && !value && (
          <button type="button" onClick={onUseGPS} title="Use my current GPS location"
            className="text-blue-500 hover:text-blue-700 ml-1.5 flex-shrink-0">
            <Crosshair className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 z-[600] max-h-60 overflow-y-auto">
          {results.map(r => (
            <button key={r.place_id} type="button"
              onClick={() => { onSelect(r); setQ(r.display_name.split(',')[0]); setResults([]); setOpen(false); }}
              className="w-full flex items-start space-x-2.5 px-4 py-2.5 hover:bg-blue-50 text-left border-b border-gray-50 last:border-0 transition-colors">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{r.display_name.split(',')[0]}</p>
                <p className="text-xs text-gray-400 truncate">{r.display_name.split(',').slice(1, 3).join(',')}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Vehicle Card ─────────────────────────────────────────────────────────────

function VehicleCard({
  vehicle,
  onBook,
  onSelfDrive,
  onViewDetails,
}: {
  vehicle: Vehicle;
  onBook: () => void;
  onSelfDrive: () => void;
  onViewDetails: () => void;
}) {
  const img = vehicle.images?.[0] || VEHICLE_PLACEHOLDER;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group flex flex-col justify-between">
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={onViewDetails} title="Click to view vehicle details">
        <img src={img} alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { (e.target as HTMLImageElement).src = VEHICLE_PLACEHOLDER; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full capitalize">{vehicle.vehicle_type}</span>
        </div>
        {vehicle.has_ac && (
          <div className="absolute top-3 right-3 bg-blue-600/90 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center space-x-1">
            <Thermometer className="h-3 w-3" /><span>AC</span>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors" onClick={onViewDetails}>
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-xs text-gray-500 mb-3">{vehicle.year} · {vehicle.vehicle_number}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg"><Users className="h-3 w-3" /><span>{vehicle.seat_count} seats</span></span>
            <span className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg capitalize"><Fuel className="h-3 w-3" /><span>{vehicle.fuel_type}</span></span>
            <span className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg capitalize"><Settings2 className="h-3 w-3" /><span>{vehicle.transmission}</span></span>
          </div>
          {vehicle.avg_rating !== undefined && vehicle.avg_rating > 0 && (
            <div className="flex items-center space-x-1 mb-3">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-gray-700">{vehicle.avg_rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({vehicle.review_count} reviews)</span>
            </div>
          )}
        </div>
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-1">
            {vehicle.pricing_type === 'per_km' ? (
              <>
                <span className="text-xl font-black text-blue-600">LKR {(vehicle.price_per_km || 0).toLocaleString()}</span>
                <span className="text-xs text-gray-400 font-medium">per km</span>
              </>
            ) : (
              <>
                <span className="text-xl font-black text-blue-600">LKR {vehicle.price_per_day.toLocaleString()}</span>
                <span className="text-xs text-gray-400 font-medium">per day</span>
              </>
            )}
          </div>
          {vehicle.pricing_type !== 'per_km' && (
            <div className="text-[10px] text-slate-500 mb-2.5 flex items-center justify-between">
              <span>{vehicle.included_km_per_day || 100} KM/day included</span>
              <span className="text-amber-700 font-bold">+LKR {vehicle.extra_km_rate || 50}/extra km</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onSelfDrive}
              title="Rent this vehicle without a driver"
              className="flex items-center justify-center space-x-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-2 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Self-Drive</span>
            </button>
            <button
              type="button"
              onClick={onBook}
              title="Book this vehicle with a driver"
              className="flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-2 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span>With Driver</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Recommendation Card ───────────────────────────────────────────────────

function AIRecommendationCard({
  rec,
  rank,
  onBook,
  onSelfDrive,
  onViewDetails,
}: {
  rec: VehicleRecommendation;
  rank: number;
  onBook: () => void;
  onSelfDrive: () => void;
  onViewDetails: () => void;
}) {
  const v = rec.vehicle;
  const isTop = rank === 1;
  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all flex flex-col justify-between ${isTop ? 'border-blue-400 shadow-lg shadow-blue-100' : 'border-gray-200 hover:border-gray-300 shadow-sm'}`}>
      <div>
        <div className="relative h-44 cursor-pointer" onClick={onViewDetails}>
          <img src={v.images?.[0] || VEHICLE_PLACEHOLDER} alt={`${v.brand} ${v.model}`}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = VEHICLE_PLACEHOLDER; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          {isTop && (
            <div className="absolute top-3 left-3 flex items-center space-x-1 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <Zap className="h-3 w-3 text-yellow-300" /><span>Best Match</span>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">#{rank}</div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <p className="text-white font-black text-xl drop-shadow">
              LKR {v.price_per_day.toLocaleString()}<span className="text-sm font-normal text-white/70">/day</span>
            </p>
            <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${rec.confidence >= 80 ? 'bg-emerald-500 text-white' : rec.confidence >= 60 ? 'bg-blue-500 text-white' : 'bg-amber-400 text-white'}`}>
              {rec.confidence}% match
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 cursor-pointer hover:text-blue-600" onClick={onViewDetails}>{v.brand} {v.model}</h3>
          <p className="text-xs text-gray-500 mb-2">{v.year} · {v.seat_count} seats · {v.vehicle_type}</p>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">AI Match Score</span>
              <span className="font-bold text-blue-600">{rec.score}/100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${rec.score >= 80 ? 'bg-emerald-500' : rec.score >= 60 ? 'bg-blue-500' : 'bg-amber-400'}`}
                style={{ width: `${rec.score}%` }} />
            </div>
          </div>
          {rec.reasons.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-2.5 mb-3">
              <p className="text-xs font-semibold text-blue-800 mb-1">Why this vehicle?</p>
              <p className="text-xs text-blue-700 leading-relaxed">{rec.reasons.slice(0, 2).join(' ')}</p>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSelfDrive}
            className="flex items-center justify-center space-x-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Self-Drive</span>
          </button>
          <button
            type="button"
            onClick={onBook}
            className="flex items-center justify-center space-x-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <span>With Driver</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
        <div className="h-2 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VehicleListingPage() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { isLoggedIn, user } = useAuth();
  const { coords: gpsCoords, permission, requestPermission } = useGPS();

  // ── Mode ───────────────────────────────────────────────────────────────────
  const [searchMode, setSearchMode] = React.useState<SearchMode>('browse');
  const [bannerDismissed, setBannerDismissed] = React.useState(false);
  const successMsg = (routerLocation.state as { success?: string })?.success || '';

  // ── Browse state ───────────────────────────────────────────────────────────
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const perPage = 12;

  // Browse filter state — all existing + new fields
  const [search, setSearch] = React.useState('');
  const [vehicleType, setVehicleType] = React.useState('');
  const [vehicleModel, setVehicleModel] = React.useState('');
  const [nearestTown, setNearestTown] = React.useState('');
  const [minSeats, setMinSeats] = React.useState('');
  const [withDriver, setWithDriver] = React.useState<'' | 'true' | 'false'>('');
  const [budgetMode, setBudgetMode] = React.useState<BudgetMode>('per_day');
  const [budgetPerDay, setBudgetPerDay] = React.useState('');
  const [budgetPerKm, setBudgetPerKm] = React.useState('');
  const [fuelType, setFuelType] = React.useState('');
  const [transmission, setTransmission] = React.useState('');
  const [hasAc, setHasAc] = React.useState('');
  const [sort, setSort] = React.useState('created_at_desc');
  const [showFilters, setShowFilters] = React.useState(false);

  // Browse location filter
  const [browseLocation, setBrowseLocation] = React.useState<{ lat: number; lng: number; address: string } | null>(null);
  const [gpsLoading, setGpsLoading] = React.useState(false);

  const hasFilters = !!(search || vehicleType || vehicleModel || nearestTown || minSeats ||
    withDriver || budgetPerDay || budgetPerKm || fuelType || transmission || hasAc || browseLocation);

  // Models for selected type
  const availableModels = vehicleType ? (VEHICLE_MODELS[vehicleType] ?? []) : [];

  // Infer min seats from model selection
  React.useEffect(() => {
    if (vehicleModel && vehicleType) {
      const found = VEHICLE_MODELS[vehicleType]?.find(m => m.model === vehicleModel);
      if (found) setMinSeats(String(found.seats));
    }
  }, [vehicleModel, vehicleType]);

  // ── Smart search state ─────────────────────────────────────────────────────
  const [smartPickup, setSmartPickup] = React.useState<{ lat: number; lng: number; address: string } | null>(null);
  const [smartDest, setSmartDest] = React.useState<{ lat: number; lng: number; address: string } | null>(null);
  const [mapPickup, setMapPickup] = React.useState<MapCoords | null>(null);
  const [mapDest, setMapDest] = React.useState<MapCoords | null>(null);
  const [smartPassengers, setSmartPassengers] = React.useState(2);
  const [smartBudget, setSmartBudget] = React.useState(10000);
  const [smartBudgetMode, setSmartBudgetMode] = React.useState<BudgetMode>('per_day');
  const [smartBudgetKm, setSmartBudgetKm] = React.useState(150);
  const [smartLuggage, setSmartLuggage] = React.useState<'light' | 'medium' | 'heavy'>('medium');
  const [smartVehicleType, setSmartVehicleType] = React.useState('');
  const [smartVehicleModel, setSmartVehicleModel] = React.useState('');
  const [smartWithDriver, setSmartWithDriver] = React.useState<boolean | null>(null);
  const [distanceKm, setDistanceKm] = React.useState<number | null>(null);
  const [aiRecs, setAiRecs] = React.useState<VehicleRecommendation[]>([]);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiRan, setAiRan] = React.useState(false);

  const smartModels = smartVehicleType ? (VEHICLE_MODELS[smartVehicleType] ?? []) : [];

  // ── Auto-fill GPS pickup ───────────────────────────────────────────────────
  React.useEffect(() => {
    if (gpsCoords && !smartPickup) {
      LocationService.reverseGeocode(gpsCoords)
        .then(address => { const c = { ...gpsCoords, address }; setSmartPickup(c); setMapPickup(c); })
        .catch(() => {});
    }
  }, [gpsCoords]);

  const useGPSForBrowse = async () => {
    if (gpsCoords) {
      setGpsLoading(true);
      try {
        const address = await LocationService.reverseGeocode(gpsCoords);
        setBrowseLocation({ ...gpsCoords, address });
        // Use nearest town detection
        const town = TOWNS.find(t => address.toLowerCase().includes(t.toLowerCase()));
        if (town) setNearestTown(town);
      } catch { setBrowseLocation({ ...gpsCoords, address: `${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}` }); }
      finally { setGpsLoading(false); }
    } else {
      await requestPermission();
    }
  };

  // ── Load vehicles ──────────────────────────────────────────────────────────
  const loadVehicles = React.useCallback(async (p: number) => {
    setLoading(true);
    try {
      const filters: VehicleFilters = {
        search: search || undefined,
        vehicle_type: vehicleType || undefined,
        vehicle_model: vehicleModel || undefined,
        nearest_town: nearestTown || undefined,
        min_seats: minSeats ? parseInt(minSeats) : undefined,
        fuel_type: fuelType || undefined,
        transmission: transmission || undefined,
        has_ac: hasAc !== '' ? hasAc === 'true' : undefined,
        with_driver: withDriver !== '' ? withDriver === 'true' : undefined,
        max_price: budgetMode === 'per_day' && budgetPerDay ? parseFloat(budgetPerDay) : undefined,
        budget_per_km: budgetMode === 'per_km' && budgetPerKm ? parseFloat(budgetPerKm) : undefined,
        approval_status: 'approved',
        sort,
        page: p,
        per_page: perPage,
      };
      const { data, count } = await VehicleService.list(filters);
      const cleanData = user ? data.filter(v => {
        const ownerId = (v as any).owner_id || (v as any).vehicle_owner_profile?.user_id;
        const ownerEmail = (v as any).owner?.email || (v as any).vehicle_owner_profile?.user?.email;
        if (ownerId && ownerId === user.id) return false;
        if (ownerEmail && user.email && ownerEmail.toLowerCase() === user.email.toLowerCase()) return false;
        return true;
      }) : data;
      setVehicles(cleanData);
      setTotal(cleanData.length);
    } catch { setVehicles([]); setTotal(0); }
    finally { setLoading(false); }
  }, [search, vehicleType, vehicleModel, nearestTown, minSeats, fuelType, transmission, hasAc, withDriver, budgetMode, budgetPerDay, budgetPerKm, sort, user]);

  React.useEffect(() => { if (searchMode === 'browse') loadVehicles(page); }, [loadVehicles, page, searchMode]);

  const resetFilters = () => {
    setSearch(''); setVehicleType(''); setVehicleModel(''); setNearestTown('');
    setMinSeats(''); setWithDriver(''); setBudgetPerDay(''); setBudgetPerKm('');
    setFuelType(''); setTransmission(''); setHasAc(''); setBrowseLocation(null); setPage(1);
  };

  // ── Destination -> calculate distance ──────────────────────────────────────
  const handleSmartDestSelect = (s: LocationSuggestion) => {
    const c = { lat: s.lat, lng: s.lng, address: s.display_name };
    setSmartDest(c); setMapDest(c);
    if (smartPickup) {
      const d = LocationService.haversineDistance(smartPickup, c) * 1.3;
      setDistanceKm(Math.round(d * 10) / 10);
    }
  };

  // ── AI search ──────────────────────────────────────────────────────────────
  const handleSmartSearch = async () => {
    if (!smartPickup || !smartDest) return;
    setAiLoading(true); setAiRan(false);
    try {
      const dist = distanceKm ?? 50;
      const effectiveBudget = smartBudgetMode === 'per_km' ? smartBudgetKm * dist : smartBudget;
      const { data: allVehicles } = await VehicleService.list({
        approval_status: 'approved',
        vehicle_type: smartVehicleType || undefined,
        vehicle_model: smartVehicleModel || undefined,
        per_page: 60,
      });
      const availableForUser = user ? allVehicles.filter(v => {
        const ownerId = (v as any).owner_id || (v as any).vehicle_owner_profile?.user_id;
        const ownerEmail = (v as any).owner?.email || (v as any).vehicle_owner_profile?.user?.email;
        if (ownerId && ownerId === user.id) return false;
        if (ownerEmail && user.email && ownerEmail.toLowerCase() === user.email.toLowerCase()) return false;
        return true;
      }) : allVehicles;
      const recs = await AIService.getVehicleRecommendations({
        passenger_count: smartPassengers,
        budget: effectiveBudget,
        distance_km: dist,
        luggage_size: smartLuggage,
        vehicle_type: smartVehicleType || undefined,
        pickup_location: smartPickup,
        destination: smartDest,
      }, availableForUser);
      setAiRecs(recs);
      setAiRan(true);
    } catch { setAiRecs([]); setAiRan(true); }
    finally { setAiLoading(false); }
  };

  const canSmartSearch = !!smartPickup && !!smartDest;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{successMsg}</div>
      )}
      {!bannerDismissed && permission === 'denied' && (
        <div className="mb-5"><LocationPermissionBanner onDismiss={() => setBannerDismissed(true)} /></div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Available Vehicles</h1>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-500 text-sm">
              {total > 0 ? `${total} vehicle${total !== 1 ? 's' : ''} found` : 'Browse our fleet'}
            </p>
            <GPSStatusIndicator />
          </div>
        </div>
        {isLoggedIn && (
          <button onClick={() => navigate('/vehicles/create')}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm">
            <Plus className="h-4 w-4" /><span>List Your Vehicle</span>
          </button>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => setSearchMode('browse')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${searchMode === 'browse' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <Filter className="h-4 w-4" /><span>Browse All</span>
        </button>
        <button onClick={() => setSearchMode('smart')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${searchMode === 'smart' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <Zap className="h-4 w-4" /><span>Smart Search</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">AI</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BROWSE MODE
      ══════════════════════════════════════════════════════════════ */}
      {searchMode === 'browse' && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
            {/* Top bar */}
            <div className="flex flex-col md:flex-row gap-3 p-4">
              {/* Text search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by location, nearest town, brand, or model…"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {/* Sort */}
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="created_at_desc">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="year_desc">Year: Newest</option>
              </select>
              {/* Filter toggle */}
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${showFilters || hasFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters{hasFilters ? ` (${[search,vehicleType,vehicleModel,nearestTown,minSeats,withDriver,budgetPerDay,budgetPerKm,fuelType,transmission,hasAc].filter(Boolean).length})` : ''}</span>
              </button>
              {hasFilters && (
                <button onClick={resetFilters}
                  className="flex items-center space-x-1 px-3 py-2.5 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                  <X className="h-4 w-4" /><span>Clear All</span>
                </button>
              )}
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {/* Row 1: Location */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5" /><span>Your Location</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
                      {browseLocation ? (
                        <span className="text-sm text-gray-700 truncate flex-1">{browseLocation.address}</span>
                      ) : (
                        <span className="text-sm text-gray-400 flex-1">Not set — vehicles from all locations shown</span>
                      )}
                      {browseLocation && (
                        <button onClick={() => { setBrowseLocation(null); setNearestTown(''); }} className="text-gray-400 hover:text-gray-600 ml-2">×</button>
                      )}
                    </div>
                    <button onClick={useGPSForBrowse} disabled={gpsLoading}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-60">
                      {gpsLoading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
                      <span>{permission === 'granted' ? 'Use My Location' : 'Enable GPS'}</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: Vehicle type + model with passenger count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Vehicle Type</label>
                    <select value={vehicleType} onChange={e => { setVehicleType(e.target.value); setVehicleModel(''); setMinSeats(''); setPage(1); }}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">All Types</option>
                      <option value="car">Car</option>
                      <option value="suv">SUV</option>
                      <option value="van">Van</option>
                      <option value="minibus">Minibus</option>
                      <option value="bus">Bus</option>
                      <option value="truck">Truck</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Vehicle Model {availableModels.length > 0 && <span className="text-gray-400 font-normal normal-case">(with passenger count)</span>}
                    </label>
                    <select value={vehicleModel} onChange={e => { setVehicleModel(e.target.value); setPage(1); }}
                      disabled={availableModels.length === 0}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400">
                      <option value="">{vehicleType ? `All ${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} Models` : 'Select type first'}</option>
                      {availableModels.map(m => (
                        <option key={m.model} value={m.model}>{m.model} — {m.seats} seats</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: With/without driver */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center space-x-1">
                    <UserCheck className="h-3.5 w-3.5" /><span>Service Type</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: '', label: 'Any', icon: Car },
                      { val: 'true', label: 'With Driver', icon: UserCheck },
                      { val: 'false', label: 'Without Driver', icon: UserX },
                    ].map(opt => (
                      <button key={opt.val} type="button"
                        onClick={() => { setWithDriver(opt.val as typeof withDriver); setPage(1); }}
                        className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                          withDriver === opt.val
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}>
                        <opt.icon className="h-3.5 w-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 4: Budget */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center space-x-1">
                    <DollarSign className="h-3.5 w-3.5" /><span>Budget</span>
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                      <button type="button" onClick={() => setBudgetMode('per_day')}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${budgetMode === 'per_day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        Per Day
                      </button>
                      <button type="button" onClick={() => setBudgetMode('per_km')}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${budgetMode === 'per_km' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        Per KM
                      </button>
                    </div>
                  </div>
                  {budgetMode === 'per_day' ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-semibold">LKR</span>
                      <input type="number" min="0" step="500" value={budgetPerDay}
                        onChange={e => { setBudgetPerDay(e.target.value); setPage(1); }}
                        placeholder="Maximum budget per day (e.g. 15,000)"
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-semibold">LKR</span>
                      <input type="number" min="0" step="5" value={budgetPerKm}
                        onChange={e => { setBudgetPerKm(e.target.value); setPage(1); }}
                        placeholder="Maximum budget per km (e.g. 150)"
                        className="w-full pl-12 pr-16 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">/km</span>
                    </div>
                  )}
                </div>

                {/* Row 5: Additional filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Min Seats</label>
                    <input type="number" min="1" value={minSeats}
                      onChange={e => { setMinSeats(e.target.value); setPage(1); }}
                      placeholder="e.g. 5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fuel Type</label>
                    <select value={fuelType} onChange={e => { setFuelType(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">Any Fuel</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Transmission</label>
                    <select value={transmission} onChange={e => { setTransmission(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">Any</option>
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Air Conditioning</label>
                    <select value={hasAc} onChange={e => { setHasAc(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">Any</option>
                      <option value="true">With AC</option>
                      <option value="false">Without AC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nearest Town</label>
                    <select value={nearestTown} onChange={e => { setNearestTown(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">All Towns</option>
                      {TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Car className="mx-auto h-14 w-14 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No vehicles found</h3>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or clearing them</p>
              {hasFilters && (
                <button onClick={resetFilters} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {vehicles.map(v => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    onBook={() => navigate(isLoggedIn ? `/vehicles/book/${v.id}` : '/login')}
                    onSelfDrive={() => navigate(isLoggedIn ? `/customer/rentals/apply?vehicle_id=${v.id}` : '/login')}
                    onViewDetails={() => navigate(`/vehicles/${v.id}`)}
                  />
                ))}
              </div>
              <Pagination currentPage={page} totalPages={Math.ceil(total / perPage)} onPageChange={setPage} />
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SMART SEARCH (AI) MODE
      ══════════════════════════════════════════════════════════════ */}
      {searchMode === 'smart' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="h-5 w-5 text-yellow-300" />
                <h2 className="text-white font-bold text-lg">AI Vehicle Recommendation</h2>
              </div>
              <p className="text-blue-200 text-sm">Enter your route and requirements — we rank the best vehicles for your exact journey</p>
            </div>

            <div className="p-5 space-y-5">
              {/* GPS status */}
              {permission === 'granted' && gpsCoords && (
                <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>GPS active — pickup pre-filled from your location</span>
                </div>
              )}

              {/* Location inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LocationAutocomplete label="Pickup Location" pinColor="blue"
                  value={smartPickup?.address ?? ''}
                  placeholder="Where are you starting from?"
                  onSelect={s => { const c = { lat: s.lat, lng: s.lng, address: s.display_name }; setSmartPickup(c); setMapPickup(c); }}
                  onClear={() => { setSmartPickup(null); setMapPickup(null); }}
                  onUseGPS={() => {
                    if (gpsCoords) LocationService.reverseGeocode(gpsCoords).then(address => {
                      const c = { ...gpsCoords, address }; setSmartPickup(c); setMapPickup(c);
                    }).catch(() => {});
                  }}
                  hasGPS={permission === 'granted' && !!gpsCoords}
                />
                <LocationAutocomplete label="Drop-off Location" pinColor="red"
                  value={smartDest?.address ?? ''}
                  placeholder="Where are you going?"
                  onSelect={handleSmartDestSelect}
                  onClear={() => { setSmartDest(null); setMapDest(null); setDistanceKm(null); }}
                />
              </div>

              {/* Distance indicator */}
              {distanceKm !== null && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                    <RouteIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">~{distanceKm} km route</span>
                  </div>
                  <span className="text-xs text-gray-400">Estimated straight-line × 1.3 road factor</span>
                </div>
              )}

              {/* Vehicle Type + Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Vehicle Type</label>
                  <select value={smartVehicleType}
                    onChange={e => { setSmartVehicleType(e.target.value); setSmartVehicleModel(''); }}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white transition-colors">
                    <option value="">Any Type</option>
                    <option value="car">Car</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van</option>
                    <option value="minibus">Minibus</option>
                    <option value="bus">Bus</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Vehicle Model <span className="text-gray-400 font-normal normal-case">— with passenger count</span>
                  </label>
                  <select value={smartVehicleModel} onChange={e => {
                    setSmartVehicleModel(e.target.value);
                    const found = smartModels.find(m => m.model === e.target.value);
                    if (found) setSmartPassengers(found.seats);
                  }}
                    disabled={smartModels.length === 0}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white disabled:bg-gray-50 disabled:text-gray-400 transition-colors">
                    <option value="">{smartVehicleType ? `All ${smartVehicleType} models` : 'Select type first'}</option>
                    {smartModels.map(m => (
                      <option key={m.model} value={m.model}>{m.model} — {m.seats} seats</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service Type (with/without driver) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center space-x-1">
                  <UserCheck className="h-3.5 w-3.5" /><span>Do you need a driver?</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: null, label: "Don't mind", icon: Car, desc: 'Show all' },
                    { val: true, label: 'Yes, with driver', icon: UserCheck, desc: 'Driver included' },
                    { val: false, label: 'No, self-drive', icon: UserX, desc: 'Drive yourself' },
                  ].map(opt => (
                    <button key={String(opt.val)} type="button"
                      onClick={() => setSmartWithDriver(opt.val)}
                      className={`flex flex-col items-center py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                        smartWithDriver === opt.val
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <opt.icon className={`h-4 w-4 mb-1 ${smartWithDriver === opt.val ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span>{opt.label}</span>
                      <span className={`text-xs mt-0.5 ${smartWithDriver === opt.val ? 'text-blue-500' : 'text-gray-400'}`}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Passengers + Luggage + Budget */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Passengers</label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                    <button type="button" onClick={() => setSmartPassengers(p => Math.max(1, p - 1))}
                      className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 font-bold text-lg leading-none">−</button>
                    <span className="flex-1 text-center text-sm font-bold text-gray-800">{smartPassengers}</span>
                    <button type="button" onClick={() => setSmartPassengers(p => Math.min(60, p + 1))}
                      className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 font-bold text-lg leading-none">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Luggage</label>
                  <select value={smartLuggage} onChange={e => setSmartLuggage(e.target.value as typeof smartLuggage)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white transition-colors">
                    <option value="light">Light — bags only</option>
                    <option value="medium">Medium — 1-2 cases</option>
                    <option value="heavy">Heavy — 3+ bags</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</label>
                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                      <button type="button" onClick={() => setSmartBudgetMode('per_day')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${smartBudgetMode === 'per_day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                        /day
                      </button>
                      <button type="button" onClick={() => setSmartBudgetMode('per_km')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${smartBudgetMode === 'per_km' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                        /km
                      </button>
                    </div>
                  </div>
                  {smartBudgetMode === 'per_day' ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">LKR</span>
                      <input type="number" min="0" step="500" value={smartBudget}
                        onChange={e => setSmartBudget(parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors" />
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">LKR</span>
                      <input type="number" min="0" step="5" value={smartBudgetKm}
                        onChange={e => setSmartBudgetKm(parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-12 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">/km</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Map */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Route Preview</p>
                <InteractiveMap mode="route" pickup={mapPickup} destination={mapDest}
                  onPickupChange={c => { setMapPickup(c); if (c.address) setSmartPickup(c as typeof smartPickup); }}
                  onDestinationChange={c => {
                    setMapDest(c);
                    if (c.address) {
                      setSmartDest(c as typeof smartDest);
                      if (smartPickup) {
                        const d = LocationService.haversineDistance(smartPickup, c) * 1.3;
                        setDistanceKm(Math.round(d * 10) / 10);
                      }
                    }
                  }}
                  height="300px" />
              </div>

              {/* Search button */}
              <button onClick={handleSmartSearch} disabled={!canSmartSearch || aiLoading}
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors shadow-sm">
                {aiLoading
                  ? <><div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Analysing your trip…</span></>
                  : <><Zap className="h-5 w-5 text-yellow-300" /><span>Find Best Vehicles with AI</span></>}
              </button>
              {!canSmartSearch && <p className="text-center text-xs text-gray-400">Enter both pickup and drop-off locations to continue</p>}
            </div>
          </div>

          {/* AI Results */}
          {aiRan && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Recommended For Your Trip</h3>
                  <span className="text-sm text-gray-400">({aiRecs.length} vehicles matched)</span>
                </div>
              </div>
              {aiRecs.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No vehicles match your criteria</h3>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your budget, passenger count, or vehicle type</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {aiRecs.map((rec, i) => (
                    <AIRecommendationCard
                      key={rec.vehicle.id}
                      rec={rec}
                      rank={i + 1}
                      onBook={() => navigate(isLoggedIn ? `/vehicles/book/${rec.vehicle.id}` : '/login')}
                      onSelfDrive={() => navigate(isLoggedIn ? `/customer/rentals/apply?vehicle_id=${rec.vehicle.id}` : '/login')}
                      onViewDetails={() => navigate(`/vehicles/${rec.vehicle.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
