import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Upload, X } from 'lucide-react';
import api from '../../services/api/client';
import { useAuth } from '../../contexts/AuthContext';

export default function DriverRegistrationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    nic_passport: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: '',
    driving_license_number: '',
    license_classes: 'B',
    license_expiry_date: '',
    vehicle_types: 'car',
    years_of_experience: '1',
    languages: 'English, Sinhala',
    skills: 'Defensive Driving',
    availability: 'full_time'
  });

  const [licenseDoc, setLicenseDoc] = useState<File | null>(null);
  const [nicDoc, setNicDoc] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!licenseDoc || !nicDoc || !selfiePhoto) {
      setError('Please upload all required documents (License, NIC, and Selfie).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      
      // Append basic fields
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'license_classes' || key === 'vehicle_types' || key === 'languages' || key === 'skills') {
          // Convert comma-separated string inputs to arrays for the backend validation
          const arr = val.split(',').map((s: string) => s.trim()).filter(Boolean);
          arr.forEach((item: string) => {
            formData.append(`${key}[]`, item);
          });
        } else {
          formData.append(key, val);
        }
      });

      // Append files
      formData.append('license_document', licenseDoc);
      formData.append('nic_document', nicDoc);
      formData.append('selfie_photo', selfiePhoto);

      await api.post('/driver/application', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Application submitted successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat().join(' ');
        setError(errors);
      } else {
        setError(err.response?.data?.message || 'Failed to submit driver application.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-xl">
          <User className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Become a Driver</h1>
          <p className="text-gray-500 text-sm">Submit your driver application and credentials for approval</p>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input required value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="First Name" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input required value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Last Name" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIC / Passport Number *</label>
              <input required value={form.nic_passport} onChange={e => set('nic_passport', e.target.value)} placeholder="e.g. 199512345678" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input required type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="e.g. 0771234567" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address *</label>
              <textarea required rows={2} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Your residential address" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* License & Driving Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Licence & Driving Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driving Licence Number *</label>
              <input required value={form.driving_license_number} onChange={e => set('driving_license_number', e.target.value)} placeholder="e.g. B9876543" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Licence Expiry Date *</label>
              <input required type="date" value={form.license_expiry_date} onChange={e => set('license_expiry_date', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience *</label>
              <input required type="number" min="0" max="60" value={form.years_of_experience} onChange={e => set('years_of_experience', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability *</label>
              <select value={form.availability} onChange={e => set('availability', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="weekends">Weekends</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Classes (Comma separated)</label>
              <input value={form.license_classes} onChange={e => set('license_classes', e.target.value)} placeholder="e.g. B, B1, A" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Types (Comma separated)</label>
              <input value={form.vehicle_types} onChange={e => set('vehicle_types', e.target.value)} placeholder="e.g. car, van, suv" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Languages (Comma separated)</label>
              <input value={form.languages} onChange={e => set('languages', e.target.value)} placeholder="e.g. English, Sinhala" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
              <input value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="e.g. Navigation, First Aid" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Emergency Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
              <input value={form.emergency_contact_name} onChange={e => set('emergency_contact_name', e.target.value)} placeholder="Contact Name" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
              <input value={form.emergency_contact_phone} onChange={e => set('emergency_contact_phone', e.target.value)} placeholder="Contact Phone" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* File Verification Documents */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Upload Verification Documents</h2>
          <p className="text-xs text-gray-500">Please upload scanned documents for identity verification (JPEG, PNG, or PDF, max 5MB)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Scan *</label>
              <input type="file" accept="image/*,application/pdf" required onChange={e => e.target.files && setLicenseDoc(e.target.files[0])} className="w-full text-xs cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIC / Passport Scan *</label>
              <input type="file" accept="image/*,application/pdf" required onChange={e => e.target.files && setNicDoc(e.target.files[0])} className="w-full text-xs cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selfie Photo *</label>
              <input type="file" accept="image/*" required onChange={e => e.target.files && setSelfiePhoto(e.target.files[0])} className="w-full text-xs cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
