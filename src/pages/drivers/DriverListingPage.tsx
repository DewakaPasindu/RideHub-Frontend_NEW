import React from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import {
  Plus, Users, Target, Search, SlidersHorizontal, X, Star,
  MapPin, ChevronRight, Clock, Award, Filter, UserX,
  Crosshair, Loader, DollarSign, Shield, Navigation, RouteIcon
} from 'lucide-react';
import { useLocation as useGPS } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { DriverService } from '../../services/api/DriverService';
import { AIService, DriverMatch } from '../../services/api/AIService';
import { LocationService } from '../../services/api/LocationService';
import type { DriverProfile, DriverFilters } from '../../services/api/DriverService';
import type { LocationSuggestion } from '../../services/api/LocationService';
import LocationPermissionBanner from '../../components/location/LocationPermissionBanner';
import GPSStatusIndicator from '../../components/location/GPSStatusIndicator';
import Pagination from '../../components/common/Pagination';
import InteractiveMap from '../../components/map/InteractiveMap';
import type { MapCoords } from '../../components/map/InteractiveMap';

// ─── Constants ────────────────────────────────────────────────────────────────

const DRIVER_PLACEHOLDER = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80';
const TOWNS = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Matara', 'Nuwara Eliya', 'Trincomalee', 'Batticaloa', 'Anuradhapura'];
const SPECIALTIES = ['Long Distance', 'City Expert', 'Tour Guide', 'Off-road Specialist', 'Luxury Vehicles', 'Commercial Vehicles', 'Mountain Driving', 'Night Driving', 'Adventure Tours'];

type SearchMode = 'browse' | 'smart';

// ─── Location Autocomplete ────────────────────────────────────────────────────

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
          <input autoFocus={open} type="text" value={q}
            onChange={e => handleInput(e.target.value)}
            onFocus={() => q.length >= 2 && setOpen(true)}
            placeholder={placeholder ?? `Search ${label.toLowerCase()}…`}
            className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400 min-w-0" />
        )}
        {busy && <Loader className="h-3.5 w-3.5 text-gray-400 animate-spin flex-shrink-0 ml-1" />}
        {value && !busy && (
          <button type="button" onClick={() => { onClear(); setQ(''); setResults([]); setOpen(false); }}
            className="text-gray-400 hover:text-gray-600 ml-1.5 text-xl leading-none flex-shrink-0">×</button>
        )}
        {hasGPS && onUseGPS && !value && (
          <button type="button" onClick={onUseGPS} title="Use my GPS location"
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
              className="w-full flex items-start space-x-2.5 px-4 py-2.5 hover:bg-violet-50 text-left border-b border-gray-50 last:border-0 transition-colors">
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

// ─── Driver Card ──────────────────────────────────────────────────────────────

function DriverCard({ driver, onBook }: { driver: DriverProfile; onBook: () => void }) {
  const name = driver.user ? `${driver.user.first_name} ${driver.user.last_name}` : 'Driver';
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative flex-shrink-0">
          <img src={driver.profile_photo || DRIVER_PLACEHOLDER} alt={name}
            className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 group-hover:border-violet-300 transition-colors"
            onError={e => { (e.target as HTMLImageElement).src = DRIVER_PLACEHOLDER; }} />
          <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${driver.availability_status === 'available' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{name}</h3>
          <div className="flex items-center space-x-2 mt-0.5">
            <div className="flex items-center space-x-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-gray-700">{driver.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">{driver.experience_years}y exp</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs font-medium ${driver.availability_status === 'available' ? 'text-emerald-600' : 'text-gray-400'}`}>
              {driver.availability_status === 'available' ? 'Available Now' : 'Currently Busy'}
            </span>
            {driver.license_type && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium capitalize">
                {driver.license_type} vehicle
              </span>
            )}
          </div>
        </div>
      </div>

      {driver.nearest_town && (
        <div className="flex items-center space-x-1.5 text-xs text-gray-500 mb-2">
          <MapPin className="h-3.5 w-3.5" /><span>Based in {driver.nearest_town}</span>
        </div>
      )}

      {driver.specialties?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {driver.specialties.slice(0, 3).map(s => (
            <span key={s} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">{s}</span>
          ))}
        </div>
      )}

      <button onClick={onBook}
        className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors">
        <span>Hire Driver</span><ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Score Wheel ──────────────────────────────────────────────────────────────

function ScoreWheel({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="relative inline-flex">
        <svg className="h-11 w-11 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#f3f4f6" strokeWidth="3" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray={`${(value / 100) * 87.96} 87.96`} strokeLinecap="round"
            className={color} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">{value}</span>
      </div>
      <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

// ─── AI Driver Card ───────────────────────────────────────────────────────────

function AIDriverCard({ match, rank, onBook }: { match: DriverMatch; rank: number; onBook: () => void }) {
  const d = match.driver;
  const name = d.user ? `${d.user.first_name} ${d.user.last_name}` : 'Driver';
  const isTop = rank === 1;
  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${isTop ? 'border-violet-400 shadow-lg shadow-violet-100' : 'border-gray-200 hover:border-gray-300 shadow-sm'}`}>
      <div className="p-5">
        <div className="flex items-start space-x-3 mb-4">
          <div className="text-center w-8 flex-shrink-0 pt-1">
            <span className={`text-xl font-black ${rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-gray-400' : 'text-amber-700'}`}>#{rank}</span>
          </div>
          <div className="relative flex-shrink-0">
            <img src={d.profile_photo || DRIVER_PLACEHOLDER} alt={name}
              className="h-14 w-14 rounded-full object-cover border-2 border-gray-200"
              onError={e => { (e.target as HTMLImageElement).src = DRIVER_PLACEHOLDER; }} />
            {isTop && (
              <div className="absolute -top-1 -right-1 bg-violet-600 rounded-full p-0.5">
                <Award className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${d.availability_status === 'available' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-gray-900">{name}</h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold">{d.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-500">{d.experience_years}y exp</span>
                  {d.license_type && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full capitalize">{d.license_type}</span>
                  )}
                </div>
              </div>
              <div className={`text-3xl font-black ${isTop ? 'text-violet-600' : 'text-gray-500'}`}>{match.final_score}</div>
            </div>
          </div>
        </div>

        {/* Distance + ETA */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex items-center space-x-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg text-xs text-gray-600">
            <MapPin className="h-3.5 w-3.5 text-gray-400" /><span>{match.distance_km} km away</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg text-xs text-gray-600">
            <Clock className="h-3.5 w-3.5 text-gray-400" /><span>~{match.estimated_arrival_min} min arrival</span>
          </div>
        </div>

        {/* Score wheels */}
        <div className="flex items-center justify-around mb-3 py-2 bg-gray-50 rounded-xl">
          <ScoreWheel label="Distance" value={match.distance_score} color="text-blue-500" />
          <ScoreWheel label="Experience" value={match.experience_score} color="text-green-500" />
          <ScoreWheel label="Rating" value={match.rating_score} color="text-amber-500" />
          <ScoreWheel label="Availability" value={match.availability_score} color="text-violet-500" />
        </div>

        {/* Reason */}
        {match.reason && (
          <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2 mb-3">
            <p className="text-xs text-violet-800 leading-relaxed">{match.reason}</p>
          </div>
        )}

        {isTop && (
          <div className="flex items-center space-x-1.5 mb-2">
            <span className="flex items-center space-x-1 bg-violet-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <Target className="h-3 w-3" /><span>Best Match</span>
            </span>
          </div>
        )}

        <button onClick={onBook}
          className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors">
          <span>Hire This Driver</span><ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
      <div className="flex space-x-3">
        <div className="h-16 w-16 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
          <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
          <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DriverListingPage() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { isLoggedIn } = useAuth();
  const { coords: gpsCoords, permission, requestPermission } = useGPS();

  const [searchMode, setSearchMode] = React.useState<SearchMode>('browse');
  const [bannerDismissed, setBannerDismissed] = React.useState(false);
  const successMsg = (routerLocation.state as { success?: string })?.success || '';

  // ── Browse state ───────────────────────────────────────────────────────────
  const [drivers, setDrivers] = React.useState<DriverProfile[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const perPage = 12;

  // Browse filter state — all existing + new fields
  const [search, setSearch] = React.useState('');
  const [minExperience, setMinExperience] = React.useState('');
  const [minRating, setMinRating] = React.useState('');
  const [nearestTown, setNearestTown] = React.useState('');
  const [specialty, setSpecialty] = React.useState('');
  const [availabilityStatus, setAvailabilityStatus] = React.useState('');
  const [licenseType, setLicenseType] = React.useState<'light' | 'heavy' | ''>('');
  const [budgetPerDay, setBudgetPerDay] = React.useState('');
  const [sort, setSort] = React.useState('rating_desc');
  const [showFilters, setShowFilters] = React.useState(false);

  // Browse location filter
  const [browseLocation, setBrowseLocation] = React.useState<{ lat: number; lng: number; address: string } | null>(null);
  const [gpsLoading, setGpsLoading] = React.useState(false);

  const hasFilters = !!(search || minExperience || minRating || nearestTown || specialty ||
    availabilityStatus || licenseType || budgetPerDay || browseLocation);

  // ── Smart search state ─────────────────────────────────────────────────────
  const [smartPickup, setSmartPickup] = React.useState<{ lat: number; lng: number; address: string } | null>(null);
  const [smartDest, setSmartDest] = React.useState<{ lat: number; lng: number; address: string } | null>(null);
  const [mapPickup, setMapPickup] = React.useState<MapCoords | null>(null);
  const [mapDest, setMapDest] = React.useState<MapCoords | null>(null);
  const [smartLicenseType, setSmartLicenseType] = React.useState<'light' | 'heavy' | ''>('');
  const [smartBudget, setSmartBudget] = React.useState('');
  const [smartMinExp, setSmartMinExp] = React.useState('');
  const [smartSpecialty, setSmartSpecialty] = React.useState('');
  const [distanceKm, setDistanceKm] = React.useState<number | null>(null);
  const [driverMatches, setDriverMatches] = React.useState<DriverMatch[]>([]);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiRan, setAiRan] = React.useState(false);

  // ── Auto-fill GPS ──────────────────────────────────────────────────────────
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
        const town = TOWNS.find(t => address.toLowerCase().includes(t.toLowerCase()));
        if (town) setNearestTown(town);
      } catch { setBrowseLocation({ ...gpsCoords, address: `${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}` }); }
      finally { setGpsLoading(false); }
    } else {
      await requestPermission();
    }
  };

  // ── Load drivers ───────────────────────────────────────────────────────────
  const loadDrivers = React.useCallback(async (p: number) => {
    setLoading(true);
    try {
      const filters: DriverFilters = {
        search: search || undefined,
        min_experience: minExperience ? parseInt(minExperience) : undefined,
        min_rating: minRating ? parseFloat(minRating) : undefined,
        nearest_town: nearestTown || undefined,
        specialty: specialty || undefined,
        availability_status: availabilityStatus || undefined,
        license_type: licenseType || undefined,
        budget_per_day: budgetPerDay ? parseFloat(budgetPerDay) : undefined,
        location_lat: browseLocation?.lat,
        location_lng: browseLocation?.lng,
        approval_status: 'approved',
        sort,
        page: p,
        per_page: perPage,
      };
      const { data, count } = await DriverService.list(filters);
      setDrivers(data);
      setTotal(count);
    } catch { setDrivers([]); setTotal(0); }
    finally { setLoading(false); }
  }, [search, minExperience, minRating, nearestTown, specialty, availabilityStatus, licenseType, budgetPerDay, browseLocation, sort]);

  React.useEffect(() => { if (searchMode === 'browse') loadDrivers(page); }, [loadDrivers, page, searchMode]);

  const resetFilters = () => {
    setSearch(''); setMinExperience(''); setMinRating(''); setNearestTown('');
    setSpecialty(''); setAvailabilityStatus(''); setLicenseType(''); setBudgetPerDay('');
    setBrowseLocation(null); setPage(1);
  };

  // ── AI search ──────────────────────────────────────────────────────────────
  const handleSmartSearch = async () => {
    if (!smartPickup) return;
    setAiLoading(true); setAiRan(false);
    try {
      const { data: allDrivers } = await DriverService.list({
        approval_status: 'approved',
        availability_status: 'available',
        license_type: smartLicenseType || undefined,
        min_experience: smartMinExp ? parseInt(smartMinExp) : undefined,
        specialty: smartSpecialty || undefined,
        per_page: 60,
      });
      const matches = await AIService.getDriverMatches({
        pickup_location: smartPickup,
        distance_km: distanceKm ?? 0,
      }, allDrivers);
      setDriverMatches(matches);
      setAiRan(true);
    } catch { setDriverMatches([]); setAiRan(true); }
    finally { setAiLoading(false); }
  };

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
          <h1 className="text-3xl font-black text-gray-900">Available Drivers</h1>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-500 text-sm">
              {total > 0 ? `${total} driver${total !== 1 ? 's' : ''} found` : 'Professional drivers near you'}
            </p>
            <GPSStatusIndicator />
          </div>
        </div>
        {isLoggedIn && (
          <button onClick={() => navigate('/drivers/register')}
            className="flex items-center space-x-1.5 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm">
            <Plus className="h-4 w-4" /><span>Become a Driver</span>
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
          <Target className="h-4 w-4" /><span>AI Matching</span>
          <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-bold">AI</span>
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
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by location, nearest town, name, or specialty…"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                <option value="rating_desc">Highest Rated</option>
                <option value="experience_desc">Most Experienced</option>
                <option value="experience_asc">Least Experienced</option>
              </select>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${showFilters || hasFilters ? 'border-violet-500 text-violet-600 bg-violet-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters{hasFilters ? ` (${[search,minExperience,minRating,nearestTown,specialty,availabilityStatus,licenseType,budgetPerDay].filter(Boolean).length})` : ''}</span>
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
                        <span className="text-sm text-gray-400 flex-1">Not set — all locations shown</span>
                      )}
                      {browseLocation && (
                        <button onClick={() => { setBrowseLocation(null); setNearestTown(''); }} className="text-gray-400 hover:text-gray-600 ml-2">×</button>
                      )}
                    </div>
                    <button onClick={useGPSForBrowse} disabled={gpsLoading}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-60">
                      {gpsLoading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
                      <span>{permission === 'granted' ? 'Use My Location' : 'Enable GPS'}</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: License type */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center space-x-1">
                    <Shield className="h-3.5 w-3.5" /><span>License Type (Vehicle Class)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: '', label: 'Any License', icon: Shield, desc: 'All drivers' },
                      { val: 'light', label: 'Light Vehicle', icon: Shield, desc: 'Cars, vans, SUVs' },
                      { val: 'heavy', label: 'Heavy Vehicle', icon: Shield, desc: 'Buses, trucks, lorries' },
                    ].map(opt => (
                      <button key={opt.val} type="button"
                        onClick={() => { setLicenseType(opt.val as typeof licenseType); setPage(1); }}
                        className={`flex flex-col items-center py-3 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                          licenseType === opt.val
                            ? 'border-violet-600 bg-violet-50 text-violet-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}>
                        <Shield className={`h-5 w-5 mb-1 ${licenseType === opt.val ? 'text-violet-600' : 'text-gray-400'}`} />
                        <span>{opt.label}</span>
                        <span className={`text-xs mt-0.5 ${licenseType === opt.val ? 'text-violet-500' : 'text-gray-400'}`}>{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 3: Budget per day */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center space-x-1">
                    <DollarSign className="h-3.5 w-3.5" /><span>Max Budget (LKR per day)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">LKR</span>
                    <input type="number" min="0" step="500" value={budgetPerDay}
                      onChange={e => { setBudgetPerDay(e.target.value); setPage(1); }}
                      placeholder="Maximum driver daily rate (e.g. 5,000)"
                      className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                </div>

                {/* Row 4: Additional filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Min Experience (yrs)</label>
                    <input type="number" min="0" value={minExperience}
                      onChange={e => { setMinExperience(e.target.value); setPage(1); }}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Min Rating</label>
                    <select value={minRating} onChange={e => { setMinRating(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                      <option value="">Any Rating</option>
                      <option value="4.5">4.5+ ⭐⭐⭐⭐⭐</option>
                      <option value="4">4.0+ ⭐⭐⭐⭐</option>
                      <option value="3">3.0+ ⭐⭐⭐</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nearest Town</label>
                    <select value={nearestTown} onChange={e => { setNearestTown(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                      <option value="">All Towns</option>
                      {TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Availability</label>
                    <select value={availabilityStatus} onChange={e => { setAvailabilityStatus(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                      <option value="">Any</option>
                      <option value="available">Available Now</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Specialty</label>
                    <select value={specialty} onChange={e => { setSpecialty(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                      <option value="">All Specialties</option>
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
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
          ) : drivers.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Users className="mx-auto h-14 w-14 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No drivers found</h3>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or clearing them</p>
              {hasFilters && (
                <button onClick={resetFilters} className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {drivers.map(d => (
                  <DriverCard key={d.id} driver={d}
                    onBook={() => navigate(isLoggedIn ? `/drivers/book/${d.id}` : '/login')} />
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
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-5">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="h-5 w-5 text-yellow-300" />
                <h2 className="text-white font-bold text-lg">AI Driver Matching</h2>
              </div>
              <p className="text-violet-200 text-sm">
                Ranked by: distance (20%) · experience (25%) · rating (35%) · availability (20%)
              </p>
            </div>

            <div className="p-5 space-y-5">
              {/* GPS status */}
              {permission === 'granted' && gpsCoords && (
                <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>GPS active — pickup pre-filled from your location. Drivers ranked by proximity.</span>
                </div>
              )}

              {/* Location inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LocationAutocomplete label="Pickup Location" pinColor="blue"
                  value={smartPickup?.address ?? ''}
                  placeholder="Where do you need the driver?"
                  onSelect={s => { const c = { lat: s.lat, lng: s.lng, address: s.display_name }; setSmartPickup(c); setMapPickup(c); }}
                  onClear={() => { setSmartPickup(null); setMapPickup(null); }}
                  onUseGPS={() => {
                    if (gpsCoords) LocationService.reverseGeocode(gpsCoords).then(address => {
                      const c = { ...gpsCoords, address }; setSmartPickup(c); setMapPickup(c);
                    }).catch(() => {});
                  }}
                  hasGPS={permission === 'granted' && !!gpsCoords}
                />
                <LocationAutocomplete label="Drop-off Location (optional)" pinColor="red"
                  value={smartDest?.address ?? ''}
                  placeholder="Destination — helps calculate route distance"
                  onSelect={s => {
                    const c = { lat: s.lat, lng: s.lng, address: s.display_name };
                    setSmartDest(c); setMapDest(c);
                    if (smartPickup) {
                      const d = LocationService.haversineDistance(smartPickup, c) * 1.3;
                      setDistanceKm(Math.round(d * 10) / 10);
                    }
                  }}
                  onClear={() => { setSmartDest(null); setMapDest(null); setDistanceKm(null); }}
                />
              </div>

              {/* Distance indicator */}
              {distanceKm !== null && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-violet-50 border border-violet-200 px-3 py-2 rounded-lg">
                    <RouteIcon className="h-4 w-4 text-violet-600" />
                    <span className="text-sm font-semibold text-violet-800">~{distanceKm} km route</span>
                  </div>
                  <span className="text-xs text-gray-400">Driver arrival time estimated from pickup</span>
                </div>
              )}

              {/* License type */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center space-x-1">
                  <Shield className="h-3.5 w-3.5" /><span>Required License Class</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: '', label: 'Any License', desc: 'Any vehicle class' },
                    { val: 'light', label: 'Light Vehicle', desc: 'Cars, vans, SUVs' },
                    { val: 'heavy', label: 'Heavy Vehicle', desc: 'Bus, truck, lorry' },
                  ].map(opt => (
                    <button key={opt.val} type="button"
                      onClick={() => setSmartLicenseType(opt.val as typeof smartLicenseType)}
                      className={`flex flex-col items-center py-3 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                        smartLicenseType === opt.val
                          ? 'border-violet-600 bg-violet-50 text-violet-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <Shield className={`h-5 w-5 mb-1 ${smartLicenseType === opt.val ? 'text-violet-600' : 'text-gray-400'}`} />
                      <span>{opt.label}</span>
                      <span className={`text-xs mt-0.5 ${smartLicenseType === opt.val ? 'text-violet-500' : 'text-gray-400'}`}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget + Experience + Specialty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center space-x-1">
                    <DollarSign className="h-3.5 w-3.5" /><span>Max Budget/day (LKR)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">LKR</span>
                    <input type="number" min="0" step="500" value={smartBudget}
                      onChange={e => setSmartBudget(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Min Experience</label>
                  <div className="relative">
                    <input type="number" min="0" value={smartMinExp}
                      onChange={e => setSmartMinExp(e.target.value)}
                      placeholder="Min years (e.g. 3)"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">yrs</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Specialty</label>
                  <select value={smartSpecialty} onChange={e => setSmartSpecialty(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white transition-colors">
                    <option value="">Any Specialty</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
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
                  height="280px" />
              </div>

              {/* Search button */}
              <button onClick={handleSmartSearch} disabled={!smartPickup || aiLoading}
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors shadow-sm">
                {aiLoading
                  ? <><div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Matching drivers to your route…</span></>
                  : <><Target className="h-5 w-5" /><span>Find Best Drivers with AI</span></>}
              </button>
              {!smartPickup && <p className="text-center text-xs text-gray-400">Enter your pickup location to find nearby drivers</p>}
            </div>
          </div>

          {/* AI Results */}
          {aiRan && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-violet-600" />
                  <h3 className="text-xl font-bold text-gray-900">Best Driver Matches</h3>
                  <span className="text-sm text-gray-400">({driverMatches.length} drivers ranked)</span>
                </div>
              </div>
              {driverMatches.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <UserX className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No available drivers found</h3>
                  <p className="text-gray-400 text-sm mt-2">Try relaxing license type, experience, or specialty requirements</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {driverMatches.map((m, i) => (
                    <AIDriverCard key={m.driver.id} match={m} rank={i + 1}
                      onBook={() => navigate(isLoggedIn ? `/drivers/book/${m.driver.id}` : '/login')} />
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
