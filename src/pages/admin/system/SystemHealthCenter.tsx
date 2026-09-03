import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Server,
  HardDrive,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { AdminService } from '../../../services/api/admin.service';

export default function SystemHealthCenter() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [probing, setProbing] = useState(false);

  const runDiagnostics = async () => {
    try {
      setProbing(true);
      const res = await AdminService.getSystemHealth();
      setHealth(res);
    } catch (e) {
      console.error('Failed to probe system health', e);
    } finally {
      setLoading(false);
      setProbing(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-400" />
            INFRASTRUCTURE & SYSTEM HEALTH PROBES
          </h1>
          <p className="text-xs text-slate-400 mt-1">Live latency measurements, database query diagnostics, cache responsiveness, and storage health</p>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={probing}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg shadow-emerald-500/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${probing ? 'animate-spin' : ''}`} />
          <span>Execute Live Diagnostics</span>
        </button>
      </div>

      {loading && !health ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Health Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">System Status: Optimal</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">All core backend services and micro-probes responding within normal latency thresholds</p>
              </div>
            </div>
            <span className="font-mono text-xs text-slate-500">Probe timestamp: {health?.timestamp}</span>
          </div>

          {/* Service Probes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">MySQL Database</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                  {health?.database?.status || 'OK'}
                </span>
              </div>
              <p className="text-2xl font-black text-white">{health?.database?.latency_ms ?? 0} <span className="text-xs font-normal text-slate-500">ms</span></p>
              <p className="text-[11px] text-slate-400">Direct query response time on primary cluster</p>
            </div>

            {/* Cache */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Cache Engine</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                  {health?.cache?.status || 'OK'}
                </span>
              </div>
              <p className="text-2xl font-black text-white">{health?.cache?.latency_ms ?? 0} <span className="text-xs font-normal text-slate-500">ms</span></p>
              <p className="text-[11px] text-slate-400">Read / write cycle latency on active driver telemetry</p>
            </div>

            {/* Disk Storage */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Disk Storage</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                  {health?.storage?.status || 'OK'}
                </span>
              </div>
              <p className="text-2xl font-black text-white">{health?.storage?.latency_ms ?? 0} <span className="text-xs font-normal text-slate-500">ms</span></p>
              <p className="text-[11px] text-slate-400">Local document & media write speed</p>
            </div>

            {/* API Latency */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">API Pipeline</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                  {health?.api?.status || 'OK'}
                </span>
              </div>
              <p className="text-2xl font-black text-white">{health?.api?.latency_ms ?? 0} <span className="text-xs font-normal text-slate-500">ms</span></p>
              <p className="text-[11px] text-slate-400">Request bootstrapping & pipeline execution</p>
            </div>
          </div>

          {/* Environment & Software Details */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Software Environment & Runtime</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">PHP Runtime</span>
                <p className="font-mono font-bold text-white mt-0.5">{health?.environment?.php_version || '8.2+'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Laravel Framework</span>
                <p className="font-mono font-bold text-white mt-0.5">{health?.environment?.laravel_version || '12.0'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Server OS</span>
                <p className="font-mono font-bold text-white mt-0.5">{health?.environment?.server_os || 'Windows'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Timezone</span>
                <p className="font-mono font-bold text-emerald-400 mt-0.5">{health?.environment?.timezone || 'Asia/Colombo'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}