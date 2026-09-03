import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Car,
  Users,
  Radio,
  Clock,
  TrendingUp,
  Wallet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { AdminService, type CommandCenterData } from '../../services/api/admin.service';
import { formatLKR } from '../../components/professional/EarningsSummaryCards';

export default function AdminCommandCenter() {
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await AdminService.getCommandCenter();
      setData(res);
    } catch (e) {
      console.error('Failed to load command center data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 30000); // 30s auto-pulse
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-xs font-semibold tracking-wider uppercase">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-wide">MOBILITY COMMAND CENTER</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Pulse
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time operational intelligence and platform telemetry</p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Dynamic Alerts Banner */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Operational Attention Alerts ({data.alerts.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.alerts.map(alert => (
              <Link
                key={alert.id}
                to={alert.link}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all group ${
                  alert.severity === 'critical'
                    ? 'bg-red-950/40 border-red-800/60 hover:border-red-600'
                    : 'bg-amber-950/30 border-amber-800/60 hover:border-amber-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-red-900/60 text-red-300' : 'bg-amber-900/60 text-amber-300'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-100 group-hover:text-white transition-colors">{alert.title}</h4>
                    <span className="text-[11px] text-slate-400 capitalize">{alert.severity} priority</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Platform Operational Pulse Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Online Drivers</span>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-emerald-400">{data?.overview.online_drivers ?? 0}</p>
            <span className="text-[11px] text-slate-500">of {data?.overview.active_drivers} total</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Fleet</span>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-blue-400">{data?.overview.approved_vehicles ?? 0}</p>
            <span className="text-[11px] text-slate-500">Vehicles</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Trips</span>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-purple-400">{data?.overview.active_trips ?? 0}</p>
            <span className="text-[11px] text-slate-500">In Progress</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Rentals</span>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-amber-400">{data?.overview.active_rentals ?? 0}</p>
            <span className="text-[11px] text-slate-500">On Road</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Rides</span>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-white">{data?.overview.today_rides ?? 0}</p>
            <span className="text-[11px] text-emerald-400 font-semibold">+Today</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Rentals</span>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-white">{data?.overview.today_rentals ?? 0}</p>
            <span className="text-[11px] text-emerald-400 font-semibold">+Today</span>
          </div>
        </div>
      </div>

      {/* Financial Telemetry Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-900 border border-emerald-900/40 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-300">Financial Engine Summary (10% Platform Fee)</h3>
          </div>
          <Link to="/admin/finance" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
            <span>Financial Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <p className="text-[11px] text-slate-400">Total Gross Billed</p>
            <p className="font-bold text-base text-white mt-0.5">{formatLKR(data?.financial.total_gross ?? 0)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">10% Platform Fees</p>
            <p className="font-bold text-base text-amber-300 mt-0.5">{formatLKR(data?.financial.total_platform_fees ?? 0)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Net Distributed</p>
            <p className="font-bold text-base text-emerald-400 mt-0.5">{formatLKR(data?.financial.total_net_distributed ?? 0)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Fees Collected</p>
            <p className="font-bold text-base text-teal-300 mt-0.5">{formatLKR(data?.financial.fees_collected ?? 0)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Fees Outstanding</p>
            <p className="font-bold text-base text-rose-400 mt-0.5">{formatLKR(data?.financial.fees_outstanding ?? 0)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Today's Revenue</p>
            <p className="font-bold text-base text-white mt-0.5">{formatLKR(data?.financial.today_revenue ?? 0)}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Action Queue & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Admin Priority Action Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Administrator Priority Action Queue
            </h3>
            <span className="text-xs text-slate-400">Ranked by operational urgency</span>
          </div>

          {data?.action_queue && data.action_queue.length > 0 ? (
            <div className="space-y-2.5">
              {data.action_queue.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          item.priority === 'HIGH'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-xs font-bold text-white">{item.type}</span>
                      <span className="text-slate-500 text-xs">• {item.created_at}</span>
                    </div>
                    <p className="font-semibold text-xs text-slate-200">{item.entity}</p>
                    <p className="text-xs text-slate-400">{item.details}</p>
                  </div>

                  <Link
                    to={item.action_url}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap self-start sm:self-auto shadow-sm shadow-emerald-500/20"
                  >
                    <span>{item.action_label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-xs text-slate-200">Action Queue Clear</p>
              <p className="text-xs text-slate-500">No urgent verifications or disputes currently pending administrator action.</p>
            </div>
          )}
        </div>

        {/* Right Col: Intelligent Insights & Recent Activity Feed */}
        <div className="space-y-6">
          {/* Intelligent Insights */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Platform Insights</h3>
            </div>
            <div className="space-y-2.5">
              {data?.insights && data.insights.length > 0 ? (
                data.insights.map((ins, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1">
                    <p className="font-bold text-xs text-emerald-400">{ins.title}</p>
                    <p className="text-[11px] text-slate-400">{ins.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Sufficient operational data accumulating...</p>
              )}
            </div>
          </div>

          {/* Recent Platform Activity */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Audit Trail Feed
              </h3>
              <Link to="/admin/audit-logs" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {data?.recent_activity && data.recent_activity.length > 0 ? (
                data.recent_activity.slice(0, 7).map(item => (
                  <div key={item.id} className="text-xs border-b border-slate-900 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                      <span className="font-mono text-[10px] text-emerald-400">{item.action}</span>
                      <span>{item.created_at}</span>
                    </div>
                    <p className="text-slate-200 font-medium mt-0.5">{item.description}</p>
                    <span className="text-[10px] text-slate-500">By: {item.user}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No recent activity recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}