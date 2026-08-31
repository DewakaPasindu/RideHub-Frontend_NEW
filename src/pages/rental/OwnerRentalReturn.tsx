import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Gauge, Fuel } from 'lucide-react';
import { RentalService, RentalApplication } from '../../services/api/rental.service';
import ConditionForm from '../../components/rental/ConditionForm';

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

export default function OwnerRentalReturn() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<RentalApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      const data = await RentalService.getApplication(id);
      setApp(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load active rental details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleReturnSubmit = async (data: any) => {
    if (!id) return;
    setSubmitting(true);
    setError(null);
    try {
      // 1. Submit return condition report
      const cond = await RentalService.storeCondition(id, {
        odometer_reading: data.odometer_reading,
        fuel_level: data.fuel_level,
        exterior_condition: data.exterior_condition,
        interior_condition: data.interior_condition,
        existing_damage: data.existing_damage,
        condition_description: data.condition_description,
        inspection_stage: 'return'
      });

      // 2. Upload return photographs
      for (const [type, file] of Object.entries(data.photos)) {
        await RentalService.uploadConditionPhoto(id, cond.uuid, type, file as File);
      }

      // 3. Mark return complete in backend transaction
      await RentalService.completeReturn(id);

      navigate(`/owner/rental-requests/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to finalize rental return check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading active rental profile...
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-red-500">
        Rental application record not found.
      </div>
    );
  }

  const preCondition = app.conditions?.find(c => c.inspection_stage === 'pre_rental');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(`/owner/rental-requests/${app.uuid}`)}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Request review</span>
        </button>
        <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
          Active Check-In
        </span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Vehicle Return Check-In</h2>
        <p className="text-xs text-slate-500 mt-1">
          Perform a visual audit of the vehicle state upon return and record odometer/fuel differences.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Side-by-side verification info (Pre-rental condition reference) */}
      {preCondition && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 text-xs text-slate-600">
          <h3 className="font-bold text-slate-700 mb-3">Pre-Rental Reference Check-Out (For Comparison)</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg border border-slate-100 flex items-center space-x-2">
              <Gauge className="h-4.5 w-4.5 text-blue-500" />
              <span>Odometer at Start: <strong>{preCondition.odometer_reading} km</strong></span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-100 flex items-center space-x-2">
              <Fuel className="h-4.5 w-4.5 text-amber-500" />
              <span>Fuel Level at Start: <strong>{preCondition.fuel_level}%</strong></span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pre-Rental Exterior Notes:</span>
              <p className="italic text-slate-600 font-medium mt-0.5">{preCondition.exterior_condition || 'No damages noted.'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pre-Rental Damages Selected:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {preCondition.existing_damage && preCondition.existing_damage.length > 0 ? (
                  preCondition.existing_damage.map((d: string) => (
                    <span key={d} className="bg-red-50 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded border border-red-100">
                      {DAMAGE_LABELS[d] || d}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic text-[11px]">None.</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Check-Out Photos</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {preCondition.photos?.map((ph) => (
                <div key={ph.id} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                  <img src={ph.url} alt={ph.photo_type} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Return Condition Form */}
      <ConditionForm
        onSubmit={handleReturnSubmit}
        title="Record Return/Check-In Vehicle Condition"
        submitLabel={submitting ? "Finalizing Return Check-In..." : "Complete Return & Make Available"}
      />
    </div>
  );
}
