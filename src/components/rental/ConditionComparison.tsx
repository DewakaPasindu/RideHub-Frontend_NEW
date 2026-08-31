import React from 'react';
import { Gauge, Fuel, CheckSquare, MessageSquare, Image, AlertTriangle } from 'lucide-react';
import type { RentalVehicleCondition } from '../../services/api/rental.service';

interface ConditionComparisonProps {
  comparison: {
    pre_rental: RentalVehicleCondition | null;
    return: RentalVehicleCondition | null;
    odometer_difference: number;
    fuel_difference: number;
  } | null;
}

const DAMAGE_LABELS: Record<string, string> = {
  front: 'Front Bumper / Grille',
  rear: 'Rear Bumper / Boot',
  left_side: 'Left Side Doors / Panels',
  right_side: 'Right Side Doors / Panels',
  roof: 'Roof Panel',
  interior: 'Seats / Dashboard / Carpet',
  wheels_tyres: 'Alloys / Tyres',
  windows: 'Windshield / Door Glasses',
  other: 'Other/Mechanical Damages',
};

export default function ConditionComparison({ comparison }: ConditionComparisonProps) {
  if (!comparison) return null;

  const { pre_rental: pre, return: ret, odometer_difference: odoDiff, fuel_difference: fuelDiff } = comparison;

  return (
    <div className="space-y-6">
      {/* Metrics Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h4 className="text-sm font-bold text-slate-700 mb-4">Inspection Difference Metrics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distance Covered</p>
              <p className="text-lg font-black text-slate-800">{odoDiff} km</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center space-x-3">
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
              <Fuel className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuel Difference</p>
              <p className="text-lg font-black text-slate-800">{Math.abs(fuelDiff)}% {fuelDiff < 0 ? 'Consumed' : 'Added'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pre-Rental Inspection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h4 className="text-sm font-bold text-slate-800">Pre-Rental Inspection</h4>
            <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">Check-Out</span>
          </div>

          {pre ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Odometer</span>
                  <span className="font-bold text-slate-700">{pre.odometer_reading} km</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Fuel Level</span>
                  <span className="font-bold text-slate-700">{pre.fuel_level}%</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-semibold mb-1">Exterior Notes</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                  {pre.exterior_condition || 'No specific comments recorded.'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-semibold mb-1">Interior Notes</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                  {pre.interior_condition || 'No specific comments recorded.'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-semibold mb-2">Recorded Damages</span>
                <div className="flex flex-wrap gap-1.5">
                  {pre.existing_damage && pre.existing_damage.length > 0 ? (
                    pre.existing_damage.map((d: string) => (
                      <span key={d} className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-1 border border-red-100 rounded-md">
                        {DAMAGE_LABELS[d] || d}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">No existing damage checked.</span>
                  )}
                </div>
              </div>

              {/* Photos */}
              <div>
                <span className="text-xs text-slate-400 block font-semibold mb-2">Inspection Photos</span>
                <div className="grid grid-cols-3 gap-2">
                  {pre.photos?.map((ph) => (
                    <div key={ph.id} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-100">
                      <img src={ph.url} alt={ph.photo_type} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[8px] font-bold px-1 py-0.5 rounded capitalize">
                        {ph.photo_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-xs italic text-center py-6">Pre-rental report not found.</p>
          )}
        </div>

        {/* Return Inspection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h4 className="text-sm font-bold text-slate-800">Return Inspection</h4>
            <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">Check-in</span>
          </div>

          {ret ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Odometer</span>
                  <span className="font-bold text-slate-700">{ret.odometer_reading} km</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Fuel Level</span>
                  <span className="font-bold text-slate-700">{ret.fuel_level}%</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-semibold mb-1">Exterior Notes</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                  {ret.exterior_condition || 'No specific comments recorded.'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-semibold mb-1">Interior Notes</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                  {ret.interior_condition || 'No specific comments recorded.'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-semibold mb-2">Recorded Damages</span>
                <div className="flex flex-wrap gap-1.5">
                  {ret.existing_damage && ret.existing_damage.length > 0 ? (
                    ret.existing_damage.map((d: string) => (
                      <span key={d} className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-1 border border-red-100 rounded-md">
                        {DAMAGE_LABELS[d] || d}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">No damages checked.</span>
                  )}
                </div>
              </div>

              {/* Photos */}
              <div>
                <span className="text-xs text-slate-400 block font-semibold mb-2">Inspection Photos</span>
                <div className="grid grid-cols-3 gap-2">
                  {ret.photos?.map((ph) => (
                    <div key={ph.id} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-100">
                      <img src={ph.url} alt={ph.photo_type} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[8px] font-bold px-1 py-0.5 rounded capitalize">
                        {ph.photo_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2 opacity-50" />
              <p className="text-slate-400 text-xs italic">Return report not yet submitted by owner.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
