import React from 'react';
import { Ruler, Clock, Users, Wallet, Package, Calendar, CheckCircle, AlertTriangle, TrendingDown, Zap } from 'lucide-react';
import type { TripAnalysis } from '../../services/api/TripSearchService';

interface Props { analysis: TripAnalysis }

const feasibilityConfig = {
  excellent: { color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle, label: 'Excellent Budget', iconColor: 'text-emerald-500' },
  good: { color: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: CheckCircle, label: 'Good Budget', iconColor: 'text-blue-500' },
  tight: { color: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: AlertTriangle, label: 'Tight Budget', iconColor: 'text-amber-500' },
  insufficient: { color: 'bg-red-50 border-red-200', text: 'text-red-700', icon: TrendingDown, label: 'Budget Alert', iconColor: 'text-red-500' },
};

function Stat({ icon: Icon, label, value, sub, accent }: { icon: React.FC<{className?: string}>; label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className={`p-2 rounded-xl ${accent ?? 'bg-gray-100'} flex-shrink-0`}>
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-base font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}

export default function TripAnalysisSummary({ analysis }: Props) {
  const feasibility = feasibilityConfig[analysis.feasibility];
  const FeasibilityIcon = feasibility.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          <h3 className="text-white font-bold text-base">Trip Analysis</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">AI-powered</span>
      </div>

      <div className="p-5">
        {/* Key metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <Stat icon={Ruler} label="Distance" value={`${analysis.distance_km} km`} accent="bg-blue-50" />
          <Stat icon={Clock} label="Est. Duration" value={analysis.estimated_hours_label} accent="bg-indigo-50" />
          <Stat icon={Users} label="Passengers" value={String(analysis.passengers)} accent="bg-purple-50" />
          <Stat icon={Wallet} label="Budget/Day" value={`LKR ${analysis.budget.toLocaleString()}`} sub={`≈ LKR ${analysis.budget_per_km}/km`} accent="bg-emerald-50" />
        </div>

        {/* Extra trip details */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
            <Calendar className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-semibold text-gray-800">{new Date(analysis.trip_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
            <Package className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Luggage</p>
            <p className="text-sm font-semibold text-gray-800 capitalize">{analysis.luggage_size}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
            <Users className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Driver</p>
            <p className="text-sm font-semibold text-gray-800">{analysis.driver_required ? 'Required' : 'Optional'}</p>
          </div>
        </div>

        {/* Recommended types */}
        {analysis.recommended_vehicle_types.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recommended Vehicle Types</p>
            <div className="flex flex-wrap gap-2">
              {analysis.recommended_vehicle_types.map(t => (
                <span key={t} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 capitalize">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Feasibility banner */}
        <div className={`flex items-start space-x-3 p-3 rounded-xl border ${feasibility.color}`}>
          <FeasibilityIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${feasibility.iconColor}`} />
          <div>
            <p className={`text-sm font-semibold ${feasibility.text}`}>{feasibility.label}</p>
            <p className={`text-xs mt-0.5 ${feasibility.text} opacity-80`}>{analysis.feasibility_note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
