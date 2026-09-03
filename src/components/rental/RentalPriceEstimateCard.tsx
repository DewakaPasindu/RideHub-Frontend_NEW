import React from 'react';
import { Car, Clock, ShieldCheck, AlertCircle, Sparkles, Gauge } from 'lucide-react';
import { RentalPriceEstimate } from '../../services/api/rental.service';

interface RentalPriceEstimateCardProps {
  estimate: RentalPriceEstimate | null;
  loading?: boolean;
  vehicleName?: string;
}

export default function RentalPriceEstimateCard({
  estimate,
  loading = false,
  vehicleName,
}: RentalPriceEstimateCardProps) {
  if (loading) {
    return (
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-blue-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-blue-100 rounded w-full"></div>
          <div className="h-3 bg-blue-100 rounded w-5/6"></div>
          <div className="h-3 bg-blue-100 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs">
        <Clock className="h-6 w-6 text-slate-400 mx-auto mb-2" />
        <span>Select rental start & return dates to calculate estimated price and included mileage.</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/40 border-2 border-blue-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-blue-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
            <Car className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Approximate Rental Price
            </h4>
            <p className="text-sm font-black text-slate-800">
              {vehicleName || `${estimate.make} ${estimate.model}`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
            <Sparkles className="h-3 w-3 text-blue-600" />
            <span>Self-Drive Rule</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-blue-100 text-xs">
        <div className="bg-white/80 p-3 rounded-xl border border-blue-100/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Daily Rate
          </span>
          <span className="font-extrabold text-slate-800 text-sm">
            Rs. {estimate.daily_rate.toLocaleString()}
          </span>
        </div>

        <div className="bg-white/80 p-3 rounded-xl border border-blue-100/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Rental Duration
          </span>
          <span className="font-extrabold text-slate-800 text-sm">
            {estimate.duration_hours && estimate.duration_hours > 24
              ? `${estimate.full_days}d + ${estimate.extra_hours}h`
              : `${estimate.estimated_days} ${estimate.estimated_days === 1 ? 'Day' : 'Days'}`}
          </span>
          {estimate.duration_hours && (
            <span className="block text-[9px] text-slate-400 mt-0.5">
              {estimate.duration_hours} hrs total ({estimate.estimated_days}d included)
            </span>
          )}
        </div>

        <div className="bg-white/80 p-3 rounded-xl border border-blue-100/60">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5 flex items-center space-x-1">
            <Gauge className="h-3 w-3" />
            <span>Included KM</span>
          </span>
          <span className="font-extrabold text-blue-700 text-sm">
            {estimate.estimated_included_km} KM
          </span>
          <span className="block text-[9px] text-slate-400 mt-0.5">
            {estimate.included_km_per_day || 100} KM / Day
          </span>
        </div>

        <div className="bg-white/80 p-3 rounded-xl border border-blue-100/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Extra KM Rate
          </span>
          <span className="font-extrabold text-slate-800 text-sm">
            Rs. {estimate.extra_km_rate} / KM
          </span>
        </div>
      </div>

      <div className="py-4 space-y-2 text-xs border-b border-blue-100">
        <div className="flex justify-between items-center text-slate-600">
          <span>
            Estimated Base Rental{' '}
            {estimate.duration_hours && estimate.duration_hours > 24
              ? `(${estimate.full_days}d + ${estimate.extra_hours}h @ Rs. ${(estimate.hourly_rate ?? (estimate.daily_rate / 24)).toFixed(0)}/h)`
              : `(${estimate.estimated_days} days × Rs. ${estimate.daily_rate.toLocaleString()})`}
            :
          </span>
          <span className="font-semibold text-slate-800">Rs. {estimate.estimated_base_amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Included Mileage Allowance:</span>
          <span className="font-semibold text-emerald-700">{estimate.estimated_included_km} KM (Free)</span>
        </div>
        <div className="flex justify-between items-center pt-2 text-sm font-black text-slate-900 border-t border-blue-100/60">
          <span>Estimated Total:</span>
          <span className="text-base text-blue-700">Rs. {estimate.estimated_total_amount.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 flex items-start space-x-2 bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Approximate price only.</strong> Final rental price will be calculated after vehicle return using the actual odometer reading. Any distance driven beyond {estimate.estimated_included_km} KM will be charged at Rs. {estimate.extra_km_rate} per additional kilometre.
        </p>
      </div>
    </div>
  );
}
