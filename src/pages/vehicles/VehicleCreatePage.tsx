import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Upload, X, Plus } from 'lucide-react';
import { VehicleService, VehicleInsert } from '../../services/vehicleService';
import { useAuth } from '../../contexts/AuthContext';

const TOWNS = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Matara', 'Nuwara Eliya', 'Trincomalee', 'Batticaloa', 'Anuradhapura'];

export default function VehicleCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = React.useState({
    vehicle_number: '', brand: '', model: '', year: new Date().getFullYear().toString(),
    vehicle_type: 'car', seat_count: '5', fuel_type: 'petrol', transmission: 'manual',
    price_per_day: '', description: '', has_ac: false, nearest_town: '', features: [] as string[], images: [] as string[]
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
    if (f && !form.features.includes(f)) { set('features', [...form.features, f]); setFeatureInput(''); }
  };

  const addImage = () => {
    const url = imageInput.trim();
    if (url && !form.images.includes(url)) { set('images', [...form.images, url]); setImageInput(''); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const payload: VehicleInsert = {
        owner_id: user.id,
        vehicle_number: form.vehicle_number,
        brand: form.brand,
        model: form.model,
        year: parseInt(form.year),
        vehicle_type: form.vehicle_type,
        seat_count: parseInt(form.seat_count),
        fuel_type: form.fuel_type,
        transmission: form.transmission,
        price_per_day: parseFloat(form.price_per_day),
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
        await VehicleService.uploadDocuments(created.uuid, formData);
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
              <input required value={form.vehicle_number} onChange={e => set('vehicle_number', e.target.value)} placeholder="e.g. CAB-1234" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <input required value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Toyota" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <input required value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. Prius" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input required type="number" min="1990" max="2030" value={form.year} onChange={e => set('year', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
              <select required value={form.vehicle_type} onChange={e => set('vehicle_type', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="minibus">Minibus</option>
                <option value="bus">Bus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seat Count *</label>
              <input required type="number" min="1" max="100" value={form.seat_count} onChange={e => set('seat_count', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
              <select required value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission *</label>
              <select required value={form.transmission} onChange={e => set('transmission', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Day (LKR) *</label>
              <input required type="number" min="1" value={form.price_per_day} onChange={e => set('price_per_day', e.target.value)} placeholder="e.g. 8000" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nearest Town</label>
              <select value={form.nearest_town} onChange={e => set('nearest_town', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select town...</option>
                {TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-3 md:col-span-2">
              <input type="checkbox" id="has_ac" checked={form.has_ac} onChange={e => set('has_ac', e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <label htmlFor="has_ac" className="text-sm font-medium text-gray-700">Air Conditioning (AC)</label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your vehicle, special features, conditions..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h2>
          <div className="flex space-x-2 mb-3">
            <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="e.g. GPS Navigation" className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={addFeature} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.features.map(f => (
              <span key={f} className="flex items-center space-x-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                <span>{f}</span>
                <button type="button" onClick={() => set('features', form.features.filter(x => x !== f))}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Vehicle Images</h2>
          <p className="text-sm text-gray-500 mb-4">Add image URLs (Unsplash, direct links, etc.)</p>
          <div className="flex space-x-2 mb-3">
            <input value={imageInput} onChange={e => setImageInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())} placeholder="https://example.com/image.jpg" className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={addImage} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1">
              <Upload className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden">
                <img src={img} alt={`vehicle ${i + 1}`} className="w-full h-24 object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300'; }} />
                <button type="button" onClick={() => set('images', form.images.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Required Documents */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Required Documents</h2>
          <p className="text-sm text-gray-500 mb-4">Please upload scanned copies of the required vehicle documents (JPEG, PNG, or PDF, max 10MB)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Revenue License *</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setRevenueLicenseFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Card *</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setInsuranceCardFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}
