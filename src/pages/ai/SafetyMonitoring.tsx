import React from 'react';
import {
  Shield, AlertTriangle, MapPin, Clock, Phone, Eye, CheckCircle,
  Siren, Activity, TrendingDown, Navigation, X, ChevronRight,
  RefreshCw, Radio, Car, Users
} from 'lucide-react';
import RouteMap from '../../components/map/RouteMap';
import TrackingMap from '../../components/map/TrackingMap';
import type { DeviationEvent } from '../../services/api/RouteService';
import type { RouteMapCoords, LiveVehicle } from '../../components/map/RouteMap';

// ─── Mock data (will be replaced by real API) ──────────────────────────────

interface Alert {
  id: string; type: 'emergency' | 'deviation' | 'incident' | 'warning';
  title: string; location: string; driver: string; vehicle: string;
  time: string; status: 'active' | 'acknowledged' | 'resolved'; severity: 'high' | 'medium' | 'low';
}

interface ActiveTrip {
  id: string; driver: string; driverPhoto?: string;
  vehicle: string; vehicleType?: string;
  route: string; startTime: string;
  status: 'on_route' | 'delayed' | 'deviation' | 'stopped';
  progress: number;
  pickup: RouteMapCoords; destination: RouteMapCoords;
  driverPosition?: RouteMapCoords & { heading?: number; speed?: number };
  deviationTrail?: RouteMapCoords[];
}

const MOCK_ALERTS: Alert[] = [
  { id: '1', type: 'emergency', title: 'Emergency Button Pressed', location: 'A1 Highway, km 45', driver: 'Kumara Perera', vehicle: 'Toyota Aqua · CAB-1234', time: '2 min ago', status: 'active', severity: 'high' },
  { id: '2', type: 'deviation', title: 'Route Deviation Detected', location: 'Kandy Road, Warakapola', driver: 'Nimal Silva', vehicle: 'Honda Vezel · WP-5678', time: '12 min ago', status: 'active', severity: 'medium' },
  { id: '3', type: 'incident', title: 'Sudden Braking Detected', location: 'Galle Road, Colombo 3', driver: 'Saman Fernando', vehicle: 'Nissan Tiida · NC-9012', time: '28 min ago', status: 'acknowledged', severity: 'medium' },
  { id: '4', type: 'warning', title: 'Driver Inactive 15 min', location: 'Bandarawela Rest Stop', driver: 'Ruwan Jayasinghe', vehicle: 'Mitsubishi Delica · SG-3456', time: '45 min ago', status: 'acknowledged', severity: 'low' },
  { id: '5', type: 'deviation', title: 'Route Deviation Detected', location: 'Negombo Road, Ja-Ela', driver: 'Preethi Bandara', vehicle: 'Toyota HiAce · NW-7890', time: '1h ago', status: 'resolved', severity: 'medium' },
];

// Sri Lanka real coordinates
const MOCK_TRIPS: ActiveTrip[] = [
  {
    id: 't1', driver: 'Kumara Perera', vehicle: 'Toyota Aqua', vehicleType: 'car',
    route: 'Colombo → Kandy', startTime: '08:30', status: 'deviation', progress: 62,
    pickup: { lat: 6.9271, lng: 79.8612, address: 'Colombo Fort Station' },
    destination: { lat: 7.2906, lng: 80.6337, address: 'Kandy City Centre' },
    driverPosition: { lat: 7.1500, lng: 80.3900, address: 'Near Warakapola', heading: 45, speed: 68 },
    deviationTrail: [
      { lat: 7.1200, lng: 80.2500 }, { lat: 7.1350, lng: 80.3100 }, { lat: 7.1500, lng: 80.3900 },
    ],
  },
  {
    id: 't2', driver: 'Nimal Silva', vehicle: 'Honda Vezel', vehicleType: 'suv',
    route: 'Negombo → Colombo', startTime: '09:15', status: 'on_route', progress: 45,
    pickup: { lat: 7.2083, lng: 79.8358, address: 'Negombo Bus Stand' },
    destination: { lat: 6.9271, lng: 79.8612, address: 'Colombo Fort' },
    driverPosition: { lat: 7.0800, lng: 79.8800, address: 'Ja-Ela', heading: 180, speed: 52 },
  },
  {
    id: 't3', driver: 'Saman Fernando', vehicle: 'Nissan Tiida', vehicleType: 'car',
    route: 'Colombo → Galle', startTime: '07:00', status: 'on_route', progress: 80,
    pickup: { lat: 6.9271, lng: 79.8612, address: 'Colombo Fort' },
    destination: { lat: 6.0535, lng: 80.2210, address: 'Galle Fort' },
    driverPosition: { lat: 6.2770, lng: 80.0070, address: 'Hikkaduwa', heading: 200, speed: 85 },
  },
  {
    id: 't4', driver: 'Ruwan Jayasinghe', vehicle: 'Mitsubishi Delica', vehicleType: 'van',
    route: 'Colombo → Nuwara Eliya', startTime: '06:00', status: 'delayed', progress: 55,
    pickup: { lat: 6.9271, lng: 79.8612, address: 'Colombo Fort' },
    destination: { lat: 6.9497, lng: 80.7891, address: 'Nuwara Eliya Town' },
    driverPosition: { lat: 6.9816, lng: 80.6554, address: 'Kandy', heading: 90, speed: 0 },
  },
];

const ALERT_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  emergency: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', icon: 'text-red-600' },
  deviation: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: 'text-amber-600' },
  incident: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', icon: 'text-orange-600' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', icon: 'text-yellow-600' },
};

const STATUS_STYLES: Record<string, string> = {
  on_route: 'bg-emerald-100 text-emerald-800',
  delayed: 'bg-amber-100 text-amber-800',
  deviation: 'bg-red-100 text-red-800',
  stopped: 'bg-gray-100 text-gray-700',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SafetyMonitoring() {
  const [alerts, setAlerts] = React.useState<Alert[]>(MOCK_ALERTS);
  const [trips] = React.useState<ActiveTrip[]>(MOCK_TRIPS);
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null);
  const [selectedTrip, setSelectedTrip] = React.useState<ActiveTrip>(MOCK_TRIPS[0]);
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [liveDeviations, setLiveDeviations] = React.useState<Record<string, DeviationEvent>>({});
  const [mapView, setMapView] = React.useState<'selected' | 'all'>('selected');

  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const highSeverity = alerts.filter(a => a.severity === 'high' && a.status === 'active').length;
  const filtered = filterStatus === 'all' ? alerts : alerts.filter(a => a.status === filterStatus);

  const acknowledge = (id: string) => {
    setAlerts(as => as.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
    setSelectedAlert(null);
  };
  const resolve = (id: string) => {
    setAlerts(as => as.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    setSelectedAlert(null);
  };

  const handleDeviationDetected = React.useCallback((event: DeviationEvent) => {
    setLiveDeviations(prev => ({ ...prev, [event.type]: event }));
    if (event.severity === 'high') {
      const newAlert: Alert = {
        id: `live-${Date.now()}`, type: 'deviation',
        title: event.type === 'route_deviation' ? 'Route Deviation Detected' :
               event.type === 'speeding' ? 'Speed Alert' : 'Anomaly Detected',
        location: event.coords ? `${event.coords.lat.toFixed(4)}, ${event.coords.lng.toFixed(4)}` : 'Unknown',
        driver: selectedTrip.driver, vehicle: selectedTrip.vehicle,
        time: 'Just now', status: 'active', severity: event.severity,
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  }, [selectedTrip]);

  // Live vehicles for the selected trip
  const selectedTripVehicles: LiveVehicle[] = React.useMemo(() => {
    if (!selectedTrip.driverPosition) return [];
    return [{
      id: selectedTrip.id,
      label: selectedTrip.driver,
      type: 'driver',
      coords: selectedTrip.driverPosition,
      heading: selectedTrip.driverPosition.heading,
      speed: selectedTrip.driverPosition.speed,
    }];
  }, [selectedTrip]);

  // All vehicles for overview map
  const allTripVehicles: LiveVehicle[] = React.useMemo(() =>
    trips.filter(t => t.driverPosition).map(t => ({
      id: t.id,
      label: t.driver,
      type: 'driver',
      coords: t.driverPosition!,
      heading: t.driverPosition?.heading,
      speed: t.driverPosition?.speed,
    })),
  [trips]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-xl">
            <Shield className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Safety Monitoring</h1>
            <p className="text-gray-500 text-sm">Real-time trip tracking · Route deviation detection · Anomaly alerts</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {highSeverity > 0 && (
            <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-4 py-2 rounded-xl animate-pulse">
              <Siren className="h-5 w-5 text-red-600" />
              <span className="text-red-700 font-bold text-sm">{highSeverity} HIGH SEVERITY</span>
            </div>
          )}
          <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 text-xs font-semibold">Live Tracking</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Alerts', value: activeAlerts, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          { label: 'Active Trips', value: trips.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Deviations Live', value: Object.keys(liveDeviations).length + trips.filter(t => t.status === 'deviation').length, icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Resolved Today', value: alerts.filter(a => a.status === 'resolved').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-2xl border ${s.border} shadow-sm p-4`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">{s.label}</p>
              <div className={`p-2 ${s.bg} rounded-xl`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
            </div>
            <p className="text-3xl font-black text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* ── LEFT: Trip list + Alerts ── */}
        <div className="xl:col-span-3 space-y-4">
          {/* Active Trips list */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-blue-600" />
                <h2 className="font-bold text-gray-900">Live Trips ({trips.length})</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {trips.map(trip => {
                const isSelected = selectedTrip.id === trip.id;
                const isDeviation = trip.status === 'deviation';
                return (
                  <button key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`w-full text-left p-3.5 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : isDeviation ? 'border-l-4 border-l-red-500' : ''}`}>
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 truncate">{trip.driver}</p>
                        <p className="text-xs text-gray-500 truncate">{trip.vehicle}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-1 ${STATUS_STYLES[trip.status]}`}>
                        {trip.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{trip.route}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{trip.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${
                          trip.status === 'deviation' ? 'bg-red-500' :
                          trip.status === 'delayed' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} style={{ width: `${trip.progress}%` }} />
                      </div>
                    </div>
                    {trip.driverPosition?.speed !== undefined && (
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center space-x-1">
                        <Activity className="h-3 w-3" />
                        <span>{trip.driverPosition.speed > 0 ? `${Math.round(trip.driverPosition.speed)} km/h` : 'Stopped'}</span>
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Siren className="h-5 w-5 text-red-600" />
              <h3 className="font-bold text-red-900">Emergency Contacts</h3>
            </div>
            <div className="space-y-1.5">
              {[['Police Emergency', '119'], ['Ambulance', '110'], ['Fire & Rescue', '111'], ['RideHub Support', '1919']].map(([label, num]) => (
                <div key={num} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-red-700">
                    <Phone className="h-3.5 w-3.5" /><span>{label}</span>
                  </div>
                  <a href={`tel:${num}`} className="text-xs font-bold text-red-900 hover:underline">{num}</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTRE: Live Route Map ── */}
        <div className="xl:col-span-6 space-y-4">
          {/* Map view toggle */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setMapView('selected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${mapView === 'selected' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                Selected Trip
              </button>
              <button onClick={() => setMapView('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${mapView === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                All Trips
              </button>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{mapView === 'selected' ? `Tracking: ${selectedTrip.driver}` : `${trips.length} trips live`}</span>
            </div>
          </div>

          {mapView === 'selected' ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Trip info header */}
              <div className={`px-4 py-3 flex items-center justify-between border-b ${
                selectedTrip.status === 'deviation' ? 'bg-red-50 border-red-100' :
                selectedTrip.status === 'on_route' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${selectedTrip.status === 'deviation' ? 'bg-red-500' : selectedTrip.status === 'on_route' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedTrip.driver} · {selectedTrip.vehicle}</p>
                    <p className="text-xs text-gray-600">{selectedTrip.route} · Started {selectedTrip.startTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedTrip.driverPosition?.speed !== undefined && (
                    <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-lg border">
                      {selectedTrip.driverPosition.speed > 0 ? `${Math.round(selectedTrip.driverPosition.speed)} km/h` : 'Stopped'}
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[selectedTrip.status]}`}>
                    {selectedTrip.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* The route map — full OSRM routing with Uber-style display */}
              <div className="p-3">
                <RouteMap
                  pickup={selectedTrip.pickup}
                  destination={selectedTrip.destination}
                  liveVehicles={selectedTripVehicles}
                  deviationTrail={selectedTrip.deviationTrail}
                  activeDeviation={selectedTrip.status === 'deviation' ? {
                    type: 'route_deviation',
                    severity: 'high',
                    message: `${selectedTrip.driver} is deviating from planned route`,
                    detectedAt: new Date(),
                    coords: selectedTrip.driverPosition ?? { lat: 0, lng: 0 },
                    distanceFromRoute: 450,
                  } : null}
                  showRouteInfo={true}
                  showAlternatives={true}
                  height="440px"
                  onRouteLoaded={() => {}}
                  onDeviationDetected={handleDeviationDetected}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center space-x-2">
                <Radio className="h-4 w-4 text-blue-600 animate-pulse" />
                <p className="text-sm font-bold text-gray-900">All Active Trips — Live Overview</p>
              </div>
              <div className="p-3">
                <TrackingMap
                  driverLocations={allTripVehicles.map(v => ({ ...v, name: v.label, status: 'active' }))}
                  showDeviationTracking={true}
                  height="480px"
                  onDeviationDetected={handleDeviationDetected}
                />
              </div>
            </div>
          )}

          {/* Route deviation explanation */}
          {selectedTrip.status === 'deviation' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-red-900 mb-1">Abnormal Route Detected</h3>
                  <p className="text-sm text-red-700 mb-2">
                    <strong>{selectedTrip.driver}</strong> has deviated from the planned route for
                    <strong> {selectedTrip.vehicle}</strong>. The dashed red line shows the actual path taken.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-white rounded-xl px-3 py-2 border border-red-100">
                      <p className="text-red-400">Deviation</p>
                      <p className="font-bold text-red-900">~450m off-route</p>
                    </div>
                    <div className="bg-white rounded-xl px-3 py-2 border border-red-100">
                      <p className="text-red-400">Duration</p>
                      <p className="font-bold text-red-900">12 min ago</p>
                    </div>
                    <div className="bg-white rounded-xl px-3 py-2 border border-red-100">
                      <p className="text-red-400">Speed</p>
                      <p className="font-bold text-red-900">{selectedTrip.driverPosition?.speed ?? 0} km/h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Alert Queue ── */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-20">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>Alert Queue</span>
                  {activeAlerts > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{activeAlerts}</span>}
                </h2>
              </div>
              <div className="flex space-x-0.5 bg-gray-100 p-0.5 rounded-lg">
                {['all', 'active', 'acknowledged', 'resolved'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`flex-1 py-1 rounded-md text-xs font-medium capitalize transition-colors ${filterStatus === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto divide-y divide-gray-100">
              {filtered.map(alert => {
                const colors = ALERT_COLORS[alert.type];
                return (
                  <button key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      alert.status === 'active' ? 'border-l-4 border-l-red-500' :
                      alert.status === 'acknowledged' ? 'border-l-4 border-l-amber-400' : ''
                    }`}>
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-start space-x-2.5">
                        <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                          alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-amber-500' : 'bg-yellow-400'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-snug">{alert.title}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{alert.driver}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-1 capitalize ${
                        alert.status === 'active' ? 'bg-red-100 text-red-800' :
                        alert.status === 'acknowledged' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>{alert.status}</span>
                    </div>
                    <div className="ml-4.5 space-y-0.5">
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" /><span className="truncate">{alert.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" /><span>{alert.time}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className={`px-6 py-4 ${ALERT_COLORS[selectedAlert.type].bg} border-b ${ALERT_COLORS[selectedAlert.type].border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`h-5 w-5 ${ALERT_COLORS[selectedAlert.type].icon}`} />
                  <h3 className={`text-base font-bold ${ALERT_COLORS[selectedAlert.type].text}`}>{selectedAlert.title}</h3>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className={`text-xs mt-1 ${ALERT_COLORS[selectedAlert.type].text} opacity-70`}>
                {selectedAlert.type} · {selectedAlert.severity} severity
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Users, label: 'Driver', value: selectedAlert.driver },
                  { icon: Car, label: 'Vehicle', value: selectedAlert.vehicle },
                  { icon: MapPin, label: 'Location', value: selectedAlert.location },
                  { icon: Clock, label: 'Time', value: selectedAlert.time },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-gray-400 flex items-center space-x-1"><Icon className="h-3 w-3" /><span>{label}</span></p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5 flex space-x-2">
              {selectedAlert.status === 'active' && (
                <button onClick={() => acknowledge(selectedAlert.id)}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-1.5 transition-colors">
                  <Eye className="h-4 w-4" /><span>Acknowledge</span>
                </button>
              )}
              {selectedAlert.status !== 'resolved' && (
                <button onClick={() => resolve(selectedAlert.id)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-1.5 transition-colors">
                  <CheckCircle className="h-4 w-4" /><span>Resolve</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
