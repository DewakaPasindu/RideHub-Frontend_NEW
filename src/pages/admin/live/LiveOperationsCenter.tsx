import React, { useState, useEffect } from 'react';
import {
  Radio,
  Car,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AdminService, type LiveOperationsData } from '../../../services/api/admin.service';
import { formatLKR } from '../../../components/professional/EarningsSummaryCards';

export default function LiveOperationsCenter() {
  const [data, setData] = useState<LiveOperationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'drivers' | 'vehicles' | 'rides' | 'rentals'>('map');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await AdminService.getLiveOperations();
      setData(res);
    } catch (e) {
      console.error('Failed to load live operations', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 20000); // 20s telemetry poll
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
            LIVE OPERATIONS & FLEET MONITOR
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time driver location tracking, active rides, vehicle rentals, and critical overdue alerts</p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* Pulse KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Drivers Online</span>
          <p className="text-xl font-black text-emerald-400">{data?.counts.online_drivers ?? 0}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Available Fleet</span>
          <p className="text-xl font-black text-blue-400">{data?.counts.available_vehicles ?? 0}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Rented Vehicles</span>
          <p className="text-xl font-black text-purple-400">{data?.counts.rented_vehicles ?? 0}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Rides</span>
          <p className="text-xl font-black text-white">{data?.counts.active_trips ?? 0}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Rentals</span>
          <p className="text-xl font-black text-amber-400">{data?.counts.active_rentals ?? 0}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Overdue Rentals</span>
          <p className={`text-xl font-black ${(data?.counts.overdue_rentals ?? 0) > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
            {data?.counts.overdue_rentals ?? 0}
          </p>
        </div>
      </div>

      {/* Overdue Banner Alert */}
      {(data?.counts.overdue_rentals ?? 0) > 0 && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-900 text-red-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">CRITICAL: Overdue Self-Drive Rentals Detected</h4>
              <p className="text-xs text-red-200 mt-0.5">
                {data?.counts.overdue_rentals} vehicle rental{data?.counts.overdue_rentals === 1 ? ' has' : 's have'} exceeded their scheduled return timestamp without check-in.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('rentals')}
            className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs whitespace-nowrap"
          >
            Review Overdue
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs w-fit">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'map' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Operations Map
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'drivers' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Live Drivers ({data?.drivers.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'vehicles' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Fleet Status ({data?.vehicles.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('rides')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'rides' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Active Trips ({data?.active_rides.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'rentals' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Active Rentals ({data?.active_rentals.length ?? 0})
        </button>
      </div>

      {/* Main Tab Content */}
      {loading && !data ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : activeTab === 'map' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Active Telemetry Monitor</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available Driver
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Active Rental
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" /> Overdue Rental
                </span>
              </div>
            </div>

            {/* Interactive Operations Canvas / Map Simulation */}
            <div className="h-96 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
              
              {/* Markers display */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 w-fit backdrop-blur-sm text-xs space-y-1">
                  <p className="font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    GPS Telemetry Grid • Colombo Central Region (6.9271° N, 79.8612° E)
                  </p>
                  <p className="text-[11px] text-slate-400">Tracking {data?.drivers.length} drivers and {data?.active_rentals.length} rentals on road.</p>
                </div>

                {/* Quick Map List Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {data?.drivers.slice(0, 3).map(d => (
                    <div key={d.uuid} className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs backdrop-blur-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{d.name}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-[11px] text-slate-400">{d.availability_status} • ★ {d.rating}</p>
                      <p className="text-[10px] text-slate-500">{d.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'drivers' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.drivers.map(d => (
            <div key={d.uuid} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                    {d.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{d.name}</h4>
                    <p className="text-[11px] text-slate-400">★ {d.rating} • License: {d.driving_license}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${d.is_online ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {d.availability_status}
                </span>
              </div>

              {d.current_trip && (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Current Active Trip</span>
                  <p className="text-slate-200 text-[11px] truncate">{d.current_trip.pickup} → {d.current_trip.dropoff}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  {d.phone || 'No phone'}
                </span>
                <span>Active: {d.last_active}</span>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'vehicles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.vehicles.map(v => (
            <div key={v.uuid} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white">{v.make} {v.model}</h4>
                  <p className="font-mono text-[11px] text-slate-400">{v.registration_number} • {v.vehicle_type}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  v.status === 'available'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : v.status === 'rented'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {v.status}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-0.5">
                <p>Owner: <span className="text-slate-200 font-semibold">{v.owner}</span></p>
                <p>Rate: <span className="text-emerald-400 font-bold">{formatLKR(v.price_per_day)}/day</span></p>
              </div>

              {v.active_service && (
                <div className="p-2 rounded bg-slate-900 text-slate-300 text-[11px] font-semibold">
                  {v.active_service}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : activeTab === 'rides' ? (
        <div className="space-y-3">
          {data?.active_rides && data.active_rides.length > 0 ? (
            data.active_rides.map(r => (
              <div key={r.uuid} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">#{r.uuid.substring(0, 8).toUpperCase()}</span>
                    <span className="text-slate-500">• Started: {r.start_time}</span>
                  </div>
                  <p className="text-white font-bold">{r.pickup} → {r.dropoff}</p>
                  <p className="text-slate-400 text-[11px]">
                    Customer: <span className="text-slate-200">{r.customer}</span> ({r.customer_phone}) • Driver: <span className="text-slate-200">{r.driver}</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-white text-sm">{formatLKR(r.total_amount)}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                    {r.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
              No active passenger trips currently in progress.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.active_rentals && data.active_rentals.length > 0 ? (
            data.active_rentals.map(r => (
              <div
                key={r.uuid}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  r.is_overdue
                    ? 'bg-red-950/40 border-red-800'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">#{r.uuid.substring(0, 8).toUpperCase()}</span>
                    {r.is_overdue ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/30 text-red-300 border border-red-500/40 animate-pulse">
                        OVERDUE FOR RETURN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                        ACTIVE RENTAL
                      </span>
                    )}
                  </div>
                  <p className="text-white font-bold">{r.vehicle}</p>
                  <p className="text-slate-400 text-[11px]">
                    Customer: <span className="text-slate-200">{r.customer}</span> • Phone: <span className="text-slate-200">{r.customer_phone}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Odometer: {r.starting_odometer} KM • Return Due: {r.end_at ? new Date(r.end_at).toLocaleString() : 'N/A'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-emerald-400 text-sm">{formatLKR(r.daily_rate)}/day</p>
                  <a
                    href={`/admin/rentals/${r.uuid}`}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <span>Inspect Rental</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
              No self-drive vehicle rentals currently on road.
            </div>
          )}
        </div>
      )}
    </div>
  );
}