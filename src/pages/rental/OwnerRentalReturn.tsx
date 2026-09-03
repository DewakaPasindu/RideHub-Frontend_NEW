import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Gauge,
  Fuel,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Trash2,
  Sparkles,
  DollarSign,
  Car,
} from 'lucide-react';
import { RentalService, RentalApplication } from '../../services/api/rental.service';
import CameraCapture from '../../components/rental/CameraCapture';

const DAMAGE_CATEGORIES = [
  { key: 'front', label: 'Front Bumper / Grille' },
  { key: 'rear', label: 'Rear Bumper / Boot' },
  { key: 'left_side', label: 'Left Side Doors / Panels' },
  { key: 'right_side', label: 'Right Side Doors / Panels' },
  { key: 'roof', label: 'Roof Panel' },
  { key: 'interior', label: 'Seats / Dashboard / Carpet' },
  { key: 'wheels_tyres', label: 'Alloys / Tyres' },
  { key: 'windows', label: 'Windshield / Door Glasses' },
  { key: 'other', label: 'Other/Mechanical Damages' },
];

const PHOTO_CATEGORIES = [
  { key: 'odometer', label: 'Ending Odometer (Speedometer)', required: true },
  { key: 'fuel', label: 'Return Fuel Gauge', required: true },
  { key: 'front', label: 'Vehicle Front View', required: false },
  { key: 'rear', label: 'Vehicle Rear View', required: false },
  { key: 'left', label: 'Vehicle Left Side', required: false },
  { key: 'right', label: 'Vehicle Right Side', required: false },
  { key: 'interior', label: 'Dashboard & Interior', required: false },
  { key: 'damage', label: 'Damage / Inspection Evidence', required: false },
];

export default function OwnerRentalReturn() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<RentalApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Return Time (Defaults to current date & time)
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  const [returnDate, setReturnDate] = useState<string>(defaultDate);
  const [returnTime, setReturnTime] = useState<string>(defaultTime);

  // Ending Odometer & Fuel
  const [endingOdometer, setEndingOdometer] = useState<number | ''>('');
  const [fuelLevel, setFuelLevel] = useState<number>(100);

  // Return Condition Confirmation
  const [returnCondition, setReturnCondition] = useState<'no_damage' | 'damage_found' | 'other_complaint'>('no_damage');
  const [damageDescription, setDamageDescription] = useState<string>('');
  const [selectedDamageAreas, setSelectedDamageAreas] = useState<string[]>([]);
  const [exteriorNotes, setExteriorNotes] = useState<string>('');
  const [interiorNotes, setInteriorNotes] = useState<string>('');

  // Photos
  const [photos, setPhotos] = useState<Record<string, File>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  const [activeCameraType, setActiveCameraType] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      const data = await RentalService.getApplication(id);
      setApp(data);
      if (data.starting_odometer) {
        setEndingOdometer(data.starting_odometer);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load active rental details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const preCondition = app?.conditions?.find((c) => c.inspection_stage === 'pre_rental');
  const startingOdometer = app?.starting_odometer ?? preCondition?.odometer_reading ?? 0;

  const toggleDamageArea = (key: string) => {
    setSelectedDamageAreas((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handlePhotoCaptured = (type: string, file: File) => {
    setPhotos((prev) => ({ ...prev, [type]: file }));
    setPhotoPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
    setActiveCameraType(null);
  };

  const handleRemovePhoto = (type: string) => {
    const nextPhotos = { ...photos };
    delete nextPhotos[type];
    setPhotos(nextPhotos);

    const nextPreviews = { ...photoPreviews };
    delete nextPreviews[type];
    setPhotoPreviews(nextPreviews);
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !app) return;
    setError(null);

    const finalEndingOdo = Number(endingOdometer);

    // 1. Validation: Ending odometer >= Starting odometer
    if (isNaN(finalEndingOdo) || finalEndingOdo < startingOdometer) {
      setError(
        `Ending odometer (${finalEndingOdo} km) must be greater than or equal to the starting odometer (${startingOdometer} km).`
      );
      return;
    }

    // 2. Validation: If damage or complaint, require description
    if (returnCondition !== 'no_damage' && (!damageDescription.trim() || damageDescription.trim().length < 5)) {
      setError('Please provide a detailed description of the damage or complaint.');
      return;
    }

    // 3. Validation: Minimum photos (odometer evidence)
    if (!photos['odometer']) {
      setError('Please upload or capture a photo of the ending odometer as return evidence.');
      return;
    }

    setSubmitting(true);

    try {
      const returnedAtIso = `${returnDate} ${returnTime}:00`;

      // Step 1: Save return vehicle condition report
      const cond = await RentalService.storeCondition(id, {
        odometer_reading: finalEndingOdo,
        fuel_level: fuelLevel,
        exterior_condition: exteriorNotes || (returnCondition === 'no_damage' ? 'Clean / No damages' : 'Damages recorded'),
        interior_condition: interiorNotes || 'Standard return condition',
        existing_damage: selectedDamageAreas,
        condition_description: damageDescription || 'No complaints recorded during vehicle return.',
        inspection_stage: 'return',
      });

      // Step 2: Upload return condition photographs
      for (const [type, file] of Object.entries(photos)) {
        await RentalService.uploadConditionPhoto(id, cond.uuid, type, file);
      }

      // Step 3: Complete return and trigger authoritative final price calculation
      await RentalService.completeReturn(id, {
        returned_at: returnedAtIso,
        ending_odometer: finalEndingOdo,
        return_condition: returnCondition,
        damage_description: returnCondition !== 'no_damage' ? damageDescription.trim() : undefined,
      });

      // Navigate back to the rental review view which will now display the Final Rental Summary
      navigate(`/owner/rental-requests/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to finalize rental return check-in. Please try again.');
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

  const actualKmDriven = endingOdometer !== '' && Number(endingOdometer) >= startingOdometer
    ? Number(endingOdometer) - startingOdometer
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6 flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate(`/owner/rental-requests/${app.uuid}`)}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Rental Request</span>
        </button>
        <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
          Vehicle Return Check-In
        </span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Vehicle Return & Final Inspection
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Record actual return time, verify ending odometer, confirm return condition, and submit for automatic final price calculation.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-xl mb-6 flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Database Reference Card (Borrowed Time & Starting Odometer - LOCKED) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-xs text-slate-600">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
            <Car className="h-3.5 w-3.5 text-blue-600" />
            <span>Database Reference (Handover Records - Read Only)</span>
          </h3>
          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
            Locked from DB
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Original Borrowed Date & Time
            </span>
            <div className="font-extrabold text-slate-800 text-xs">
              {app.start_at ? new Date(app.start_at).toLocaleString() : 'N/A'}
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Cannot be modified</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Starting Odometer
            </span>
            <div className="font-extrabold text-blue-700 text-sm flex items-center space-x-1">
              <Gauge className="h-4 w-4 text-blue-600" />
              <span>{startingOdometer.toLocaleString()} KM</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Recorded at Handover</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Daily Rate & Extra KM Rate
            </span>
            <div className="font-extrabold text-slate-800 text-xs">
              Rs. {app.daily_rate?.toLocaleString() ?? app.vehicle?.price_per_day?.toLocaleString()} / day
            </div>
            <span className="text-[9px] text-emerald-700 font-bold mt-0.5 block">
              Extra: Rs. {app.extra_km_rate ?? app.vehicle?.extra_km_rate ?? 50} / KM
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleReturnSubmit} className="space-y-8">
        {/* Section 1: Actual Return Date and Time */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>1. Actual Vehicle Return Date & Time</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Return Time
              </label>
              <input
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Ending Odometer & Fuel Level */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Gauge className="h-4 w-4 text-blue-600" />
            <span>2. Ending Odometer & Fuel Gauge</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Ending Odometer Reading (KM) *
              </label>
              <input
                type="number"
                min={startingOdometer}
                value={endingOdometer}
                onChange={(e) => setEndingOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`Must be >= ${startingOdometer}`}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1.5">
                Must be greater than or equal to starting odometer ({startingOdometer.toLocaleString()} KM).
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Return Fuel Level: {fuelLevel}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={fuelLevel}
                onChange={(e) => setFuelLevel(Number(e.target.value))}
                className="w-full accent-blue-600 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0% (Empty)</span>
                <span>50% (Half)</span>
                <span>100% (Full)</span>
              </div>
            </div>
          </div>

          {/* Live mileage calculation badge */}
          {endingOdometer !== '' && Number(endingOdometer) >= startingOdometer && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-blue-800 font-medium">Actual Distance Driven:</span>
              <span className="font-black text-blue-900 text-sm">
                {actualKmDriven.toLocaleString()} KM
              </span>
            </div>
          )}
        </div>

        {/* Section 3: Return Condition Confirmation (Mandatory Options) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span>3. Return Condition & Damage Confirmation *</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                returnCondition === 'no_damage'
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <input
                  type="radio"
                  name="return_condition"
                  value="no_damage"
                  checked={returnCondition === 'no_damage'}
                  onChange={() => setReturnCondition('no_damage')}
                  className="accent-emerald-600 h-4 w-4"
                />
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <span className="font-extrabold text-xs block">NO DAMAGE / NO COMPLAINT</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Vehicle returned in clean, sound state.</span>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                returnCondition === 'damage_found'
                  ? 'border-rose-500 bg-rose-50/50 text-rose-950 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <input
                  type="radio"
                  name="return_condition"
                  value="damage_found"
                  checked={returnCondition === 'damage_found'}
                  onChange={() => setReturnCondition('damage_found')}
                  className="accent-rose-600 h-4 w-4"
                />
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <span className="font-extrabold text-xs block">DAMAGE FOUND</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">New scratches, dents, or broken parts.</span>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                returnCondition === 'other_complaint'
                  ? 'border-amber-500 bg-amber-50/50 text-amber-950 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <input
                  type="radio"
                  name="return_condition"
                  value="other_complaint"
                  checked={returnCondition === 'other_complaint'}
                  onChange={() => setReturnCondition('other_complaint')}
                  className="accent-amber-600 h-4 w-4"
                />
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <span className="font-extrabold text-xs block">OTHER COMPLAINT</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Late return, dirty interior, smoking, etc.</span>
              </div>
            </label>
          </div>

          {/* Conditional Damage / Complaint Details */}
          {returnCondition !== 'no_damage' && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50/40 border border-rose-200 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-rose-900 uppercase tracking-wider mb-1">
                  Damage / Complaint Description *
                </label>
                <textarea
                  rows={3}
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  placeholder="Describe the damages or complaint in detail..."
                  className="w-full px-3.5 py-2.5 bg-white border border-rose-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Check Affected Areas
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DAMAGE_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.key}
                      onClick={() => toggleDamageArea(cat.key)}
                      className={`text-left p-2 rounded-lg border text-[11px] font-medium transition-all ${
                        selectedDamageAreas.includes(cat.key)
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Return Photographs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Camera className="h-4 w-4 text-blue-600" />
            <span>4. Return Condition Photographs</span>
          </h3>
          <p className="text-xs text-slate-500">
            Ending odometer and fuel gauge photos are required as official evidence for return calculation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PHOTO_CATEGORIES.map((cat) => (
              <div key={cat.key} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">
                    {cat.label} {cat.required && <span className="text-rose-500">*</span>}
                  </span>
                  {photos[cat.key] && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(cat.key)}
                      className="text-rose-500 hover:text-rose-700 text-[10px] font-bold flex items-center space-x-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {photoPreviews[cat.key] ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-black">
                    <img
                      src={photoPreviews[cat.key]}
                      alt={cat.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveCameraType(cat.key)}
                      className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Camera className="h-3.5 w-3.5 text-blue-600" />
                      <span>Capture / Upload</span>
                    </button>
                  </div>
                )}

                {activeCameraType === cat.key && (
                  <div className="mt-2">
                    <CameraCapture
                      label={`Capture ${cat.label}`}
                      onCapture={(file) => handlePhotoCaptured(cat.key, file)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate(`/owner/rental-requests/${app.uuid}`)}
            className="px-6 py-3 border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            {submitting ? (
              <span>Calculating Final Bill & Finalizing...</span>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Submit Return & Generate Final Bill</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
