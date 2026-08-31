import React, { useState } from 'react';
import { Shield, Camera, Trash2, CheckCircle } from 'lucide-react';
import CameraCapture from './CameraCapture';

interface ConditionFormProps {
  onSubmit: (data: {
    odometer_reading: number;
    fuel_level: number;
    exterior_condition: string;
    interior_condition: string;
    existing_damage: string[];
    condition_description: string;
    photos: Record<string, File>;
  }) => void;
  title?: string;
  submitLabel?: string;
}

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
  { key: 'front', label: 'Vehicle Front View' },
  { key: 'rear', label: 'Vehicle Rear View' },
  { key: 'left', label: 'Vehicle Left Side' },
  { key: 'right', label: 'Vehicle Right Side' },
  { key: 'interior', label: 'Dashboard & Interior' },
  { key: 'odometer', label: 'Odometer (Speedometer)' },
  { key: 'fuel', label: 'Fuel Gauge' },
  { key: 'damage', label: 'Existing Damages (Close-up)' },
];

export default function ConditionForm({
  onSubmit,
  title = "Vehicle Condition Inspection",
  submitLabel = "Submit Report"
}: ConditionFormProps) {
  const [odometer, setOdometer] = useState<number>(0);
  const [fuel, setFuel] = useState<number>(100);
  const [exterior, setExterior] = useState('');
  const [interior, setInterior] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDamage, setSelectedDamage] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Record<string, File>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  const [activeCameraType, setActiveCameraType] = useState<string | null>(null);

  const toggleDamage = (key: string) => {
    setSelectedDamage(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleFileChange = (type: string, file: File) => {
    setPhotos(prev => ({ ...prev, [type]: file }));
    setPhotoPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify key photos are present: odometer and fuel must be uploaded
    if (!photos['odometer'] || !photos['fuel']) {
      alert("Please upload Odometer and Fuel Gauge photos as minimum evidence.");
      return;
    }

    onSubmit({
      odometer_reading: odometer,
      fuel_level: fuel,
      exterior_condition: exterior,
      interior_condition: interior,
      existing_damage: selectedDamage,
      condition_description: notes,
      photos
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2 mb-6">
          <Shield className="h-5 w-5 text-blue-500" />
          <span>{title}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Odometer */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Odometer Reading (km) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={odometer}
              onChange={(e) => setOdometer(Number(e.target.value))}
              placeholder="e.g. 45210"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fuel Level */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Fuel Level (Percentage: 0 - 100) *
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="100"
                value={fuel}
                onChange={(e) => setFuel(Number(e.target.value))}
                className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="font-bold text-slate-700 w-12 text-right text-sm">{fuel}%</span>
            </div>
          </div>
        </div>

        {/* Existing damage checklist */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Existing Damage Areas (Check all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {DAMAGE_CATEGORIES.map((damage) => (
              <label
                key={damage.key}
                className={`flex items-center space-x-3 px-4 py-3 border rounded-xl cursor-pointer transition-colors text-xs font-semibold ${
                  selectedDamage.includes(damage.key)
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDamage.includes(damage.key)}
                  onChange={() => toggleDamage(damage.key)}
                  className="hidden"
                />
                <span>{damage.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Exterior Condition Notes
            </label>
            <textarea
              rows={3}
              value={exterior}
              onChange={(e) => setExterior(e.target.value)}
              placeholder="Describe panel alignments, paint condition, scratches..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Interior Condition Notes
            </label>
            <textarea
              rows={3}
              value={interior}
              onChange={(e) => setInterior(e.target.value)}
              placeholder="Describe upholstery hygiene, controls operational status..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            General Inspection Summary / Additional Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any other observations..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Photos grid */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Inspection Evidence Photographs
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PHOTO_CATEGORIES.map((cat) => (
              <div key={cat.key} className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col justify-between">
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-700">{cat.label}</h4>
                  <p className="text-[10px] text-slate-400">
                    {cat.key === 'odometer' || cat.key === 'fuel' ? 'Required' : 'Recommended'}
                  </p>
                </div>

                {photoPreviews[cat.key] ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-3">
                    <img src={photoPreviews[cat.key]} alt={cat.label} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(cat.key)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 aspect-video rounded-lg flex items-center justify-center bg-white mb-3">
                    <Camera className="h-6 w-6 text-slate-300" />
                  </div>
                )}

                <div className="flex flex-col space-y-1">
                  <label className="w-full text-center py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-50 cursor-pointer">
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileChange(cat.key, file);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveCameraType(cat.key)}
                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100"
                  >
                    Use Webcam
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeCameraType && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl relative">
                <button
                  type="button"
                  onClick={() => setActiveCameraType(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
                <CameraCapture
                  label={`Take Photo: ${PHOTO_CATEGORIES.find(c => c.key === activeCameraType)?.label}`}
                  onCapture={(file) => handleFileChange(activeCameraType, file)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
