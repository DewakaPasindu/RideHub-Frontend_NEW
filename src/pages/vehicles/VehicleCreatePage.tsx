import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Upload, X, Plus, Info, AlertCircle } from 'lucide-react';
import { VehicleService, VehicleInsert } from '../../services/vehicleService';
import { useAuth } from '../../contexts/AuthContext';

const TOWNS = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Matara', 'Nuwara Eliya', 'Trincomalee', 'Batticaloa', 'Anuradhapura'];

export default function VehicleCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = React.useState({
    vehicle_number: '',
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    vehicle_type: 'car',
    seat_count: '5',
    fuel_type: 'petrol',
    transmission: 'manual',
    pricing_type: 'per_day' as 'per_day' | 'per_km' | 'both',
    price_per_day: '',
    price_per_km: '',
    included_km_per_day: '100',
    extra_km_rate: '80',
    description: '',
    has_ac: false,
    nearest_town: '',
    features: [] as string[],
    images: [] as string[],
  });

  const [featureInput, setFeatureInput] = React.useState('');
  const [imageInput, setImageInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [revenueLicenseFile, setRevenueLicenseFile] = React.useState<File | null>(null);
  const [insuranceCardFile, setInsuranceCardFile] = React.useState<File | null>(null);

  const set = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const addFeature = () => {
    const f = featureInput.trim();
    if (f && !form.features.includes(f)) {
      set('features', [...form.features, f]);
      setFeatureInput('');
    }
  };

  const addImage = () => {
    const url = imageInput.trim();
    if (url && !form.images.includes(url)) {
      set('images', [...form.images, url]);
      setImageInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    // Validation
    if ((form.pricing_type === 'per_day' || form.pricing_type === 'both') && !form.price_per_day) {
      setError('Price Per Day is required.');
      setLoading(false);
      return;
    }

    if ((form.pricing_type === 'per_km' || form.pricing_type === 'both') && !form.price_per_km) {
      setError('Price Per Kilometer is required.');
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        owner_id: user.id,
        vehicle_number: form.vehicle_number,
        brand: form.brand,
        model: form.model,
        year: parseInt(form.year),
        vehicle_type: form.vehicle_type,
        seat_count: parseInt(form.seat_count),
        fuel_type: form.fuel_type,
        transmission: form.transmission,
        pricing_type: form.pricing_type,
        price_per_day: form.price_per_day ? parseFloat(form.price_per_day) : 0,
        price_per_km: form.price_per_km ? parseFloat(form.price_per_km) : null,
        included_km_per_day: form.included_km_per_day ? parseInt(form.included_km_per_day) : 100,
        extra_km_rate: form.extra_km_rate ? parseFloat(form.extra_km_rate) : 50,
        description: form.description,
        has_ac: form.has_ac,
        nearest_town: form.nearest_town,
        features: form.features,
        images: form.images,
      };

      const created = await VehicleService.create(payload);
      const formData = new FormData();
      if (revenueLicenseFile) {
        formData.append('revenue_license_document', revenueLicenseFile);
      }
      if (insuranceCardFile) {
        formData.append('insurance_card_document', insuranceCardFile);
      }
      if (revenueLicenseFile || insuranceCardFile) {
        await VehicleService.uploadDocuments(created.uuid || created.id, formData);
      }
      navigate('/vehicles', { state: { success: 'Vehicle submitted for approval!' } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Car className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register Your Vehicle</h1>
          <p className="text-gray-500 text-sm">Submit your vehicle for approval and start earning</p>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
              <input
                required
                value={form.vehicle_number}
                onChange={e => set('vehicle_number', e.target.value)}
                placeholder="e.g. CAB-1234"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <input
                required
                value={form.brand}
                onChange={e => set('brand', e.target.value)}
                placeholder="e.g. Toyota"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <input
                required
                value={form.model}
                onChange={e => set('model', e.target.value)}
                placeholder="e.g. Prius"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input
                required
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={e => set('year', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
              <select
                required
                value={form.vehicle_type}
                onChange={e => set('vehicle_type', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="suv">SUV</option>
                <option value="bike">Bike / Motorcycle</option>
                <option value="three_wheeler">Three Wheeler (Tuk-Tuk)</option>
                <option value="truck">Truck</option>
                <option value="minibus">Minibus</option>
                <option value="bus">Bus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seat Count *</label>
              <input
                required
                type="number"
                min="1"
                max="100"
                value={form.seat_count}
                onChange={e => set('seat_count', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
              <select
                required
                value={form.fuel_type}
                onChange={e => set('fuel_type', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission *</label>
              <select
                required
                value={form.transmission}
                onChange={e => set('transmission', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>

            {/* PRICING MODEL SELECTOR */}
            <div className="md:col-span-2 pt-4 pb-2 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Pricing Model & Rates *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => set('pricing_type', 'per_day')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    form.pricing_type === 'per_day'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-900">Price Per Day</span>
                    <input
                      type="radio"
                      name="pricing_type_choice"
                      checked={form.pricing_type === 'per_day'}
                      onChange={() => set('pricing_type', 'per_day')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Daily rental with included KM & extra KM rate</p>
                </button>

                <button
                  type="button"
                  onClick={() => set('pricing_type', 'per_km')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    form.pricing_type === 'per_km'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-900">Price Per KM</span>
                    <input
                      type="radio"
                      name="pricing_type_choice"
                      checked={form.pricing_type === 'per_km'}
                      onChange={() => set('pricing_type', 'per_km')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Distance-based rate per kilometer driven</p>
                </button>

                <button
                  type="button"
                  onClick={() => set('pricing_type', 'both')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    form.pricing_type === 'both'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-900">Both Models</span>
                    <input
                      type="radio"
                      name="pricing_type_choice"
                      checked={form.pricing_type === 'both'}
                      onChange={() => set('pricing_type', 'both')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Enable both daily rentals and per-km booking</p>
                </button>
              </div>

              {/* Dynamic Rates Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {/* Price Per Day */}
                {(form.pricing_type === 'per_day' || form.pricing_type === 'both') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Price Per Day (LKR) *
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={form.price_per_day}
                      onChange={e => set('price_per_day', e.target.value)}
                      placeholder="e.g. 8000"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                    />
                    <span className="text-[11px] text-gray-500 mt-0.5 block">24-hour daily rental rate</span>
                  </div>
                )}

                {/* Included KM Per Day */}
                {(form.pricing_type === 'per_day' || form.pricing_type === 'both') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Kilometers Per Day (KM) *
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      max="5000"
                      value={form.included_km_per_day}
                      onChange={e => set('included_km_per_day', e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                    />
                    <span className="text-[11px] text-gray-500 mt-0.5 block">Included mileage per day</span>
                  </div>
                )}

                {/* Extra KM Rate */}
                {(form.pricing_type === 'per_day' || form.pricing_type === 'both') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Extra KM Rate (LKR/KM) *
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={form.extra_km_rate}
                      onChange={e => set('extra_km_rate', e.target.value)}
                      placeholder="e.g. 80"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-amber-700"
                    />
                    <span className="text-[11px] text-gray-500 mt-0.5 block">Charged per KM beyond included</span>
                  </div>
                )}

                {/* Price Per KM */}
                {(form.pricing_type === 'per_km' || form.pricing_type === 'both') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Price Per KM (LKR) *
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={form.price_per_km}
                      onChange={e => set('price_per_km', e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                    />
                    <span className="text-[11px] text-gray-500 mt-0.5 block">Rate charged per kilometer</span>
                  </div>
                )}

                {/* Automated Calculation Reminder Banner */}
                {(form.pricing_type === 'per_day' || form.pricing_type === 'both') && (
                  <div className="sm:col-span-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3 mt-1">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-950">Automated Mileage Calculation & Payment Settlement:</span>
                      <p className="text-blue-800 text-[11px] mt-1 leading-relaxed">
                        Every self-drive rental automatically tracks mileage against your custom allowance of{' '}
                        <strong>{form.included_km_per_day || '100'} KM/day</strong>. If the customer drives further, the system
                        calculates the excess distance from the return odometer and bills the customer at your registered rate of{' '}
                        <strong className="text-blue-950 underline">
                          LKR {form.extra_km_rate || '0'} / extra KM
                        </strong>
                        , crediting the full extra amount directly to your payout.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nearest Town</label>
              <select
                value={form.nearest_town}
                onChange={e => set('nearest_town', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select town...</option>
                {TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-3 md:col-span-2">
              <input
                type="checkbox"
                id="has_ac"
                checked={form.has_ac}
                onChange={e => set('has_ac', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="has_ac" className="text-sm font-medium text-gray-700">Air Conditioning (AC)</label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe your vehicle, special features, conditions..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h2>
          <div className="flex space-x-2 mb-3">
            <input
              value={featureInput}
              onChange={e => setFeatureInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              placeholder="e.g. GPS Navigation"
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.features.map(f => (
              <span key={f} className="flex items-center space-x-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                <span>{f}</span>
                <button type="button" onClick={() => set('features', form.features.filter(x => x !== f))} className="hover:text-blue-900">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Images (URLs)</h2>
          <div className="flex space-x-2 mb-3">
            <input
              value={imageInput}
              onChange={e => setImageInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
              placeholder="https://example.com/photo.jpg"
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addImage}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {form.images.map((url, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('images', form.images.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Documents */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Regulatory Documents</h2>
          <p className="text-gray-500 text-sm mb-4">Upload copies of your vehicle's registration certificate and insurance policy.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Revenue License Certificate</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => setRevenueLicenseFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Certificate</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => setInsuranceCardFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Vehicle for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}