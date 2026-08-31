import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Car, User, Shield, CreditCard, FileText, MapPin, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { VehicleService, Vehicle } from '../../services/api/VehicleService';
import { RentalService } from '../../services/api/rental.service';
import CameraCapture from '../../components/rental/CameraCapture';
import LocationSelector from '../../components/rental/LocationSelector';
import { MapCoords } from '../../components/map/InteractiveMap';

export default function CustomerRentalApply() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vehicleId = searchParams.get('vehicle_id');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-step state
  const [step, setStep] = useState(1);

  // Form Fields
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    id_type: 'nic' as 'nic' | 'passport',
    id_number: '',
    driving_license_number: '',
    license_expiry_date: '',
    start_date: '',
    start_time: '09:00',
    end_date: '',
    end_time: '18:00',
    passenger_count: 1,
    luggage_requirement: 'medium' as 'light' | 'medium' | 'heavy',
    rental_purpose: '',
    additional_requirements: '',
  });

  // Files
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [licenseFront, setLicenseFront] = useState<File | null>(null);
  const [licenseBack, setLicenseBack] = useState<File | null>(null);
  const [livePhoto, setLivePhoto] = useState<File | null>(null);

  // Locations
  const [pickup, setPickup] = useState<MapCoords | null>(null);
  const [dropoff, setDropoff] = useState<MapCoords | null>(null);

  useEffect(() => {
    if (vehicleId) {
      VehicleService.getById(vehicleId).then(setVehicle);
    }
  }, [vehicleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.first_name || !formData.last_name || !formData.phone || !formData.email || !formData.address) {
        setError("All profile fields are required.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.id_number || !idFront || !idBack) {
        setError("Please enter ID number and upload both front and back images.");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.driving_license_number || !formData.license_expiry_date || !licenseFront || !licenseBack) {
        setError("Please enter license details and upload both front and back scans.");
        return false;
      }
      const expiry = new Date(formData.license_expiry_date);
      if (expiry <= new Date()) {
        setError("Your driving license is expired.");
        return false;
      }
    }
    if (step === 4) {
      if (!livePhoto) {
        setError("Please capture your live selfie verification photo.");
        return false;
      }
    }
    if (step === 5) {
      if (!formData.start_date || !formData.end_date || !pickup || !dropoff) {
        setError("Please specify dates, times, pickup, and drop-off coordinates.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!vehicle) return;
    setSubmitting(true);
    setError(null);

    try {
      // 1. Create base application
      const payload = {
        vehicle_id: vehicle.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        id_type: formData.id_type,
        id_number: formData.id_number,
        driving_license_number: formData.driving_license_number,
        license_expiry_date: formData.license_expiry_date,
        pickup_address: pickup?.address || '',
        pickup_latitude: pickup?.lat || 0,
        pickup_longitude: pickup?.lng || 0,
        return_address: dropoff?.address || '',
        return_latitude: dropoff?.lat || 0,
        return_longitude: dropoff?.lng || 0,
        start_at: `${formData.start_date} ${formData.start_time}:00`,
        end_at: `${formData.end_date} ${formData.end_time}:00`,
        passenger_count: formData.passenger_count,
        luggage_requirement: formData.luggage_requirement,
        rental_purpose: formData.rental_purpose,
        additional_requirements: formData.additional_requirements,
      };

      const app = await RentalService.createApplication(payload);

      // 2. Upload verification documents sequentially
      await RentalService.uploadDocument(app.uuid, 'id_front', idFront!);
      await RentalService.uploadDocument(app.uuid, 'id_back', idBack!);
      await RentalService.uploadDocument(app.uuid, 'driving_license_front', licenseFront!);
      await RentalService.uploadDocument(app.uuid, 'driving_license_back', licenseBack!);
      await RentalService.uploadLivePhoto(app.uuid, livePhoto!);

      // 3. Submit application
      await RentalService.submitApplication(app.uuid);

      navigate(`/customer/rentals/${app.uuid}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An error occurred during submission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading vehicle details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Self-Drive Rental Verification</h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete the multi-step verification process to rent {vehicle.make} {vehicle.model}
          </p>
        </div>
        <div className="flex items-center space-x-1 text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">
          <Car className="h-4 w-4" />
          <span>LKR {vehicle.price_per_day}/day</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Progress Timeline Indicator */}
      <div className="grid grid-cols-6 gap-2 mb-8">
        {[
          { icon: User, label: "Info" },
          { icon: CreditCard, label: "ID" },
          { icon: FileText, label: "License" },
          { icon: Shield, label: "Selfie" },
          { icon: MapPin, label: "Trip" },
          { icon: Zap, label: "Submit" },
        ].map((s, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center py-2.5 rounded-xl border text-center transition-all ${
              step === idx + 1
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : step > idx + 1
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-slate-200 text-slate-400 bg-slate-50/50'
            }`}
          >
            <s.icon className="h-4.5 w-4.5 mb-1" />
            <span className="text-[9px] font-bold uppercase tracking-wider hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        {/* Step 1: Customer Profile Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g. John"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Doe"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 077 1234567"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@mail.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Home/Billing Address *</label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address, City"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Identity Verification */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Identity Verification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Identity Document Type *</label>
                <select
                  name="id_type"
                  value={formData.id_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="nic">National Identity Card (NIC)</option>
                  <option value="passport">Passport</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Document Number *</label>
                <input
                  type="text"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  placeholder="e.g. 199512345678"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ID Front Copy *</label>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {idFront ? (
                    <p className="text-xs text-slate-700 truncate">{idFront.name}</p>
                  ) : (
                    <p className="text-[10px] text-slate-400">Choose front file (PDF/Image)</p>
                  )}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setIdFront(e.target.files?.[0] || null)}
                    className="mt-2 text-xs w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ID Back Copy *</label>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {idBack ? (
                    <p className="text-xs text-slate-700 truncate">{idBack.name}</p>
                  ) : (
                    <p className="text-[10px] text-slate-400">Choose back file</p>
                  )}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setIdBack(e.target.files?.[0] || null)}
                    className="mt-2 text-xs w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Driving License */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Driving License Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">License Number *</label>
                <input
                  type="text"
                  name="driving_license_number"
                  value={formData.driving_license_number}
                  onChange={handleChange}
                  placeholder="e.g. B1234567"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiry Date *</label>
                <input
                  type="date"
                  name="license_expiry_date"
                  value={formData.license_expiry_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">License Front *</label>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {licenseFront ? (
                    <p className="text-xs text-slate-700 truncate">{licenseFront.name}</p>
                  ) : (
                    <p className="text-[10px] text-slate-400">Choose front file</p>
                  )}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setLicenseFront(e.target.files?.[0] || null)}
                    className="mt-2 text-xs w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">License Back *</label>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {licenseBack ? (
                    <p className="text-xs text-slate-700 truncate">{licenseBack.name}</p>
                  ) : (
                    <p className="text-[10px] text-slate-400">Choose back file</p>
                  )}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setLicenseBack(e.target.files?.[0] || null)}
                    className="mt-2 text-xs w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Real-time Customer Photo */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Live Selfie Verification</h3>
            <CameraCapture
              label="Capture Live Customer Verification Photo"
              onCapture={(file) => {
                setLivePhoto(file);
                setError(null);
              }}
            />
            {livePhoto && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3 rounded-xl flex items-center justify-center space-x-1">
                <span>✓ Live photo captured and confirmed.</span>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Trip Locations & Details */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Trip Details & Locations</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pickup Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pickup Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Return Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Return Time</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <LocationSelector
              pickup={pickup}
              destination={dropoff}
              onChangePickup={setPickup}
              onChangeDestination={setDropoff}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Luggage Type</label>
                <select
                  name="luggage_requirement"
                  value={formData.luggage_requirement}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="light">Light (Backpacks only)</option>
                  <option value="medium">Medium (Standard bags)</option>
                  <option value="heavy">Heavy (Big suitcases)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Purpose</label>
                <input
                  type="text"
                  name="rental_purpose"
                  value={formData.rental_purpose}
                  onChange={handleChange}
                  placeholder="e.g. Family holiday, business trip"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Additional Requirements</label>
              <textarea
                name="additional_requirements"
                rows={2}
                value={formData.additional_requirements}
                onChange={handleChange}
                placeholder="Any special details..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 6: Preview Verification Documents */}
        {step === 6 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Application Preview & Verification</h3>
            
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Profile</span>
              <p className="text-xs font-bold text-slate-700">{formData.first_name} {formData.last_name}</p>
              <p className="text-xs text-slate-500">{formData.phone} | {formData.email}</p>
              <p className="text-xs text-slate-500">{formData.address}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Identity verification</span>
                <p className="text-xs text-slate-700">Type: <span className="font-bold uppercase">{formData.id_type}</span></p>
                <p className="text-xs text-slate-700">Number: <span className="font-bold">{formData.id_number}</span></p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Driving License</span>
                <p className="text-xs text-slate-700">Number: <span className="font-bold">{formData.driving_license_number}</span></p>
                <p className="text-xs text-slate-700">Expiry: <span className="font-bold">{formData.license_expiry_date}</span></p>
              </div>
            </div>

            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Trip Coordinates & Schedule</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <span className="font-semibold block text-slate-500">Pickup Location:</span>
                  <span>{pickup?.address}</span>
                  <span className="block text-[10px] text-slate-400">Lat: {pickup?.lat.toFixed(5)}, Lng: {pickup?.lng.toFixed(5)}</span>
                  <span className="block font-bold text-slate-700 mt-1">Date: {formData.start_date} @ {formData.start_time}</span>
                </div>
                <div>
                  <span className="font-semibold block text-slate-500">Return Location:</span>
                  <span>{dropoff?.address}</span>
                  <span className="block text-[10px] text-slate-400">Lat: {dropoff?.lat.toFixed(5)}, Lng: {dropoff?.lng.toFixed(5)}</span>
                  <span className="block font-bold text-slate-700 mt-1">Date: {formData.end_date} @ {formData.end_time}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Selfie Verification Live Capture</span>
              {livePhoto && (
                <div className="relative w-40 aspect-video rounded-xl overflow-hidden bg-black shadow">
                  <img src={URL.createObjectURL(livePhoto)} alt="Live photo verification" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center space-x-1.5 px-6 py-3 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center space-x-1.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center space-x-1.5 px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <span>{submitting ? "Submitting..." : "Submit Rental Request"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
