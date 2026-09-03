import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Car,
  Users,
  MapPin,
  RefreshCw,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { AdminService } from '../../../services/api/admin.service';
import { formatLKR } from '../../../components/professional/EarningsSummaryCards';

export default function AnalyticsCenter() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getAnalytics();
      setData(res);
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            OPERATIONS & BUSINESS INTELLIGENCE
          </h1>
          <p className="text-xs text-slate-400 mt-1">Platform revenue metrics, fleet distribution, driver performance, and asset utilization</p>
        </div>

        <button
          onClick={loadAnalytics}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {loading && !data ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Revenue Trends (6 Months) */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">6-Month Platform Revenue Performance</h3>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Gross Volume</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-400" /> 10% Platform Fee</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {data?.monthly_revenue?.map((m: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-400 text-xs">{m.month}</span>
                  <div>
                    <p className="text-[10px] text-slate-500">Gross</p>
                    <p className="font-bold text-white text-xs">{formatLKR(m.gross)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Platform Fee</p>
                    <p className="font-bold text-amber-400 text-xs">{formatLKR(m.fees)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Composition */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Fleet Category Distribution</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data?.vehicle_distribution?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{item.type}</span>
                    <p className="text-xl font-black text-white">{item.count}</p>
                    <p className="text-[10px] text-blue-400 font-semibold">{item.percentage}% of fleet</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Drivers */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Top Performing Drivers</h3>
              </div>
              <div className="space-y-2">
                {data?.top_drivers?.map((d: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{d.name}</p>
                      <p className="text-[11px] text-slate-400">★ {d.rating} • {d.trips_completed} trips completed</p>
                    </div>
                    <span className="font-bold text-emerald-400">{formatLKR(d.total_earnings)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}