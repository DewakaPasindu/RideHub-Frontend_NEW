import React, { useState } from 'react';
import {
  Car,
  User,
  Calendar,
  Clock,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Camera,
  Eye,
  X,
  Sparkles,
} from 'lucide-react';
import { RentalFinalSummary } from '../../services/api/rental.service';

interface FinalRentalSummaryCardProps {
  summary: RentalFinalSummary;
  role?: 'owner' | 'customer';
}

export default function FinalRentalSummaryCard({
  summary,
  role = 'customer',
}: FinalRentalSummaryCardProps) {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const getDamageBadge = () => {
    switch (summary.damage_status) {
      case 'no_damage':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>No Damage / No Complaint</span>
          </span>
        );
      case 'damage_found':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>Damage Reported</span>
          </span>
        );
      case 'other_complaint':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>Issue / Complaint Logged</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
            {summary.damage_status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span>Finalized Rental Bill & Inspection</span>
            </div>
            <h3 className="text-xl font-black">{summary.vehicle_name}</h3>
            <p className="text-xs text-blue-200 font-mono mt-0.5">
              Reg No: {summary.vehicle_registration}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-blue-200 block">
              Total Final Amount
            </span>
            <span className="text-3xl font-black text-white">
              Rs. {summary.final_rental_amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Parties Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">
              <Car className="h-3.5 w-3.5 text-blue-600" />
              <span>Vehicle Details</span>
            </div>
            <p className="font-extrabold text-slate-800 text-sm">{summary.vehicle_name}</p>
            <p className="text-slate-500 font-mono mt-0.5">Plate: {summary.vehicle_registration}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">
              <User className="h-3.5 w-3.5 text-indigo-600" />
              <span>Customer Information</span>
            </div>
            <p className="font-extrabold text-slate-800 text-sm">{summary.customer_name}</p>
            <p className="text-slate-500 mt-0.5">{summary.customer_email} • {summary.customer_phone}</p>
          </div>
        </div>

        {/* Borrowed & Return Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
          <div className="p-4 rounded-xl border border-slate-100 bg-emerald-50/30">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Vehicle Handover (Borrowed)
            </span>
            <div className="flex items-center space-x-2 text-sm font-black text-slate-800">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span>{summary.borrowed_date}</span>
              <span className="text-slate-400 font-normal">at</span>
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>{summary.borrowed_time}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Verified from official handover database record
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-blue-50/30">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
              Vehicle Check-In (Returned)
            </span>
            <div className="flex items-center space-x-2 text-sm font-black text-slate-800">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>{summary.returned_date}</span>
              <span className="text-slate-400 font-normal">at</span>
              <Clock className="h-4 w-4 text-blue-600" />
              <span>{summary.returned_time}</span>
            </div>
            <span className="text-[10px] text-blue-600 font-bold mt-1 block">
              Total Duration:{' '}
              {summary.duration_hours && summary.duration_hours > 24
                ? `${summary.full_days}d + ${summary.extra_hours}h (${summary.duration_hours} hrs total)`
                : `${summary.total_rental_days} ${summary.total_rental_days === 1 ? 'Day' : 'Days'}`}
            </span>
          </div>
        </div>

        {/* Mileage & Odometer Audit */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Odometer & Mileage Breakdown ({(summary as any).included_km_per_day || 100} KM / Day Allowance)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Starting Odometer
              </span>
              <span className="font-extrabold text-slate-800 text-sm">
                {summary.starting_odometer.toLocaleString()} KM
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Ending Odometer
              </span>
              <span className="font-extrabold text-slate-800 text-sm">
                {summary.ending_odometer.toLocaleString()} KM
              </span>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
              <span className="text-[10px] font-bold text-blue-600 uppercase block mb-1">
                Actual Distance
              </span>
              <span className="font-extrabold text-blue-800 text-sm">
                {summary.actual_km.toLocaleString()} KM
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">
                Included Allowance
              </span>
              <span className="font-extrabold text-emerald-800 text-sm">
                {summary.included_km.toLocaleString()} KM
              </span>
              <span className="text-[9px] text-emerald-600 block mt-0.5">
                ({summary.total_rental_days}d × {(summary as any).included_km_per_day || 100} KM)
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Extra Mileage Driven:</span>
              <span className={`font-bold ${summary.extra_km > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {summary.extra_km > 0 ? `${summary.extra_km.toLocaleString()} KM` : '0 KM (Within Allowance)'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Additional KM Rate:</span>
              <span className="font-semibold text-slate-800">
                Rs. {summary.additional_km_rate.toFixed(2)} / KM
              </span>
            </div>
            {summary.extra_km > 0 && (
              <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200">
                <span>Extra KM Charge ({summary.extra_km} KM × Rs. {summary.additional_km_rate}):</span>
                <span className="font-bold text-amber-700">
                  Rs. {summary.additional_km_charge.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 text-xs space-y-2.5">
          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <DollarSign className="h-3.5 w-3.5 text-blue-700" />
            <span>Authoritative Final Price Calculation</span>
          </h4>

          <div className="flex justify-between items-center text-slate-700">
            <span>
              Base Rental{' '}
              {summary.duration_hours && summary.duration_hours > 24
                ? `(${summary.full_days}d + ${summary.extra_hours}h @ Rs. ${(summary.hourly_rental_rate ?? (summary.daily_rental_rate / 24)).toFixed(0)}/h)`
                : `(${summary.total_rental_days} Days × Rs. ${summary.daily_rental_rate.toLocaleString()})`}
              :
            </span>
            <span className="font-bold text-slate-900">Rs. {summary.base_rental_amount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-slate-700">
            <span>Additional KM Charge ({summary.extra_km} Extra KM):</span>
            <span className="font-bold text-slate-900">Rs. {summary.additional_km_charge.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-blue-200 text-sm font-black text-blue-950">
            <span>Final Payable Rental Amount:</span>
            <span className="text-lg text-blue-700 font-black">
              Rs. {summary.final_rental_amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Damage & Return Condition Report */}
        <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Vehicle Return Inspection Status
            </h4>
            <div>{getDamageBadge()}</div>
          </div>

          {summary.damage_description ? (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <span className="font-bold block mb-1">Owner's Notes & Findings:</span>
              <p className="italic leading-relaxed">{summary.damage_description}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Vehicle was returned in satisfactory condition with no reported complaints.
            </p>
          )}

          {/* Return condition photos */}
          {summary.return_photos && summary.return_photos.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Return Inspection Photographs ({summary.return_photos.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {summary.return_photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhoto(photo.url)}
                    className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group shadow-xs hover:shadow-md transition-all"
                    title="Click to view full photo"
                  >
                    <img
                      src={photo.url}
                      alt={photo.type}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </div>
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded capitalize">
                      {photo.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-size Photo Preview Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={activePhoto} alt="Inspection evidence" className="w-full max-h-[80vh] object-contain bg-black" />
          </div>
        </div>
      )}
    </div>
  );
}
