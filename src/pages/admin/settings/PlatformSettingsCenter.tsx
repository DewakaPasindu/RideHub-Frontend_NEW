import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Percent,
  Gauge,
  CheckCircle2,
  Save,
  AlertTriangle,
} from 'lucide-react';

export default function PlatformSettingsCenter() {
  const [feeRate, setFeeRate] = useState(10);
  const [includedKm, setIncludedKm] = useState(100);
  const [extraKmRate, setExtraKmRate] = useState(50);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-400" />
            PLATFORM PARAMETERS & BUSINESS RULES
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure authoritative financial commissions, rental mileage thresholds, and operations policies</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Financial Commission Rules */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Platform Financial Engine (10% Authoritative Fee)</h3>
          </div>
          <p className="text-xs text-slate-400">
            RideHub enforces an authoritative 10% platform fee calculation across all completed passenger bookings and vehicle rental agreements.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Standard Platform Fee Rate (%)</label>
              <input
                type="number"
                disabled
                value={feeRate}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Locked by core financial engine (10.00%)</span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Net Driver & Owner Distribution (%)</label>
              <input
                type="number"
                disabled
                value={100 - feeRate}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-white cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">90.00% automatically credited to partner ledger</span>
            </div>
          </div>
        </div>

        {/* Self-Drive Rental Rules */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Self-Drive Rental Mileage & Duration Policies</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Daily Included Mileage (KM)</label>
              <input
                type="number"
                value={includedKm}
                onChange={e => setIncludedKm(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Standard allowance included per 24-hour rental block (100 KM)</span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Default Excess Mileage Fee (Rs. / KM)</label>
              <input
                type="number"
                value={extraKmRate}
                onChange={e => setExtraKmRate(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Charged on return check-in for distance exceeding package</span>
            </div>
          </div>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Platform operational settings updated successfully.</span>
          </div>
        )}

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Operational Rules</span>
        </button>
      </form>
    </div>
  );
}