import React, { useState, useEffect } from 'react';
import { User as UserIcon, Car, Users, Edit, Eye, Trash2, Save, X, Calendar, Upload, Wallet, TrendingUp, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api/client';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/api/auth.service';
import { ProfessionalService } from '../services/api/professional.service';
import type { ProfessionalCapabilities, ProfessionalOverview } from '../services/api/types';
import { formatLKR } from '../components/professional/EarningsSummaryCards';
import OwnerAvailabilityCalendar from '../components/booking/OwnerAvailabilityCalendar';

interface UserVehicle {
  id: string;
  uuid: string;
  registration_number: string;
  vehicle_type: string;
  make: string;
  model: string;
  application_status: string;
  created_at: string;
}

interface UserDriverApplication {
  id: string;
  uuid: string;
  first_name: string;
  last_name: string;
  driving_license_number: string;
  application_status: string;
  created_at: string;
}

export default function UserProfile() {
  const { user: authUser, isAdmin, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState<{
    targetId: string;
    targetType: 'vehicle' | 'driver';
    targetName: string;
  } | null>(null);

  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });

  const [customerProfile, setCustomerProfile] = useState<any>({
    gender: 'male',
    date_of_birth: '',
    nic_passport: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    preferred_language: 'English'
  });

  const [userVehicles, setUserVehicles] = useState<UserVehicle[]>([]);
  const [userDriverApplications, setUserDriverApplications] = useState<UserDriverApplication[]>([]);
  
  const [professionalCaps, setProfessionalCaps] = useState<ProfessionalCapabilities | null>(null);
  const [professionalOverview, setProfessionalOverview] = useState<ProfessionalOverview | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const u = await AuthService.me();

      // Load professional capabilities & overview
      try {
        const caps = await ProfessionalService.getCapabilities();
        setProfessionalCaps(caps);
        if (caps.has_professional_access) {
          const ov = await ProfessionalService.getOverview();
          setProfessionalOverview(ov);
        }
      } catch (e) {
        console.log("Could not load professional capabilities", e);
      }
      
      let cp = null;
      try {
        const res = await api.get('/customer/profile');
        cp = res.data?.data;
        if (cp) {
          setCustomerProfile({
            gender: cp.gender || 'male',
            date_of_birth: cp.date_of_birth || '',
            nic_passport: cp.nic_passport || '',
            emergency_contact_name: cp.emergency_contact_name || '',
            emergency_contact_phone: cp.emergency_contact_phone || '',
            preferred_language: cp.preferred_language || 'English'
          });
        }
      } catch (e) {
        console.log("Customer profile not found / empty", e);
      }

      setUserData({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        email: u.email || '',
        phone: u.phone || '',
        address: cp?.address || '',
        avatar: u.avatar ? `http://127.0.0.1:8000/storage/${u.avatar}` : ''
      });

      // Fetch vehicles if user is a Vehicle Owner
      if (u.roles?.includes('Vehicle Owner')) {
        try {
          const vRes = await api.get('/vehicle-owner/vehicles');
          setUserVehicles(vRes.data?.data || []);
        } catch (e) {
          console.log("Error fetching owner vehicles", e);
        }
      }

      // Fetch driver application
      try {
        const dRes = await api.get('/driver/application');
        if (dRes.data?.data) {
          const dApp = dRes.data.data;
          setUserDriverApplications([
            {
              id: dApp.id,
              uuid: dApp.uuid,
              first_name: dApp.first_name,
              last_name: dApp.last_name,
              driving_license_number: dApp.driving_license_number,
              application_status: dApp.application_status,
              created_at: dApp.created_at
            }
          ]);
          if (dApp.address) {
            setUserData(prev => ({ ...prev, address: dApp.address }));
          }
        }
      } catch (e) {
        console.log("No driver application found", e);
      }

    } catch (err: any) {
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // 1. Save customer profile details
      await api.put('/customer/profile', customerProfile);

      // 2. Upload avatar photo if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await api.post('/customer/profile/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      await loadProfileData();

    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors).flat().join(' '));
      } else {
        setError(err.response?.data?.message || 'Failed to update profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setIsEditing(false);
    loadProfileData();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSetAvailability = (targetId: string, targetType: 'vehicle' | 'driver', targetName: string) => {
    setShowAvailabilityCalendar({ targetId, targetType, targetName });
  };

  if (loading && userData.email === '') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (showAvailabilityCalendar) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => setShowAvailabilityCalendar(null)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Profile
          </button>
        </div>
        <OwnerAvailabilityCalendar
          ownerId="current-user"
          targetId={showAvailabilityCalendar.targetId}
          targetType={showAvailabilityCalendar.targetType}
          targetName={showAvailabilityCalendar.targetName}
        />
      </div>
    );
  }

  const roleLabel = isSuperAdmin?.() || authUser?.role === 'superadmin' || authUser?.roles?.includes('Super Admin')
    ? 'Super Admin'
    : isAdmin?.() || authUser?.role === 'admin' || authUser?.roles?.includes('Admin')
    ? 'Administrator'
    : authUser?.isDriver || authUser?.role === 'driver' || authUser?.roles?.includes('Driver')
    ? 'Driver'
    : authUser?.roles?.includes('Vehicle Owner')
    ? 'Vehicle Owner'
    : 'Customer';

  const isSystemAdmin = isAdmin?.() || authUser?.isAdmin || authUser?.role === 'admin' || authUser?.role === 'superadmin';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center">
        <UserIcon className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
      </div>

      {/* Admin Access Banner */}
      {isSystemAdmin && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm uppercase tracking-wider text-white">Administrator Access Active</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Command Center
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                You are authenticated as an administrator. Access live telemetry, verification hubs, disputes, and financial controls.
              </p>
            </div>
          </div>
          <Link
            to="/admin/dashboard"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap self-start sm:self-auto"
          >
            <span>Open Admin Operations Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
      {success && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <img
                  src={avatarPreview || userData.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150'}
                  alt="avatar"
                  className="h-24 w-24 rounded-full object-cover border-4 border-gray-100"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150'; }}
                />
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="h-4 w-4 mr-1" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                )}
              </div>
              <h2 className="mt-4 font-bold text-gray-900 text-lg">{userData.first_name} {userData.last_name}</h2>
              <span className={`text-xs font-bold capitalize px-2.5 py-0.5 rounded-full mt-1 border ${
                isSystemAdmin
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                {roleLabel}
              </span>
            </div>

            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-semibold text-gray-800">Account Details</h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center space-x-1 text-xs text-blue-600 hover:underline">
                  <Edit className="h-3 w-3" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button onClick={handleSave} className="flex items-center space-x-1 text-xs text-green-600 hover:underline">
                    <Save className="h-3 w-3" />
                    <span>Save</span>
                  </button>
                  <button onClick={handleCancel} className="flex items-center space-x-1 text-xs text-gray-500 hover:underline">
                    <X className="h-3 w-3" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-500">Email</label>
                <p className="text-gray-900">{userData.email}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500">Mobile Number</label>
                <p className="text-gray-900">{userData.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500">Residential Address</label>
                <p className="text-gray-900">{userData.address || 'Not provided'}</p>
              </div>

              {/* Extra editable Customer Profile properties */}
              <div className="pt-3 border-t space-y-3">
                <h4 className="font-medium text-xs text-gray-700">Extended Profile Details</h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-500">Gender</label>
                  {isEditing ? (
                    <select
                      value={customerProfile.gender}
                      onChange={e => setCustomerProfile(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-sm bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 capitalize">{customerProfile.gender}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={customerProfile.date_of_birth}
                      onChange={e => setCustomerProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{customerProfile.date_of_birth || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500">NIC / Passport</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={customerProfile.nic_passport}
                      onChange={e => setCustomerProfile(prev => ({ ...prev, nic_passport: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{customerProfile.nic_passport || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500">Emergency Contact Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={customerProfile.emergency_contact_name}
                      onChange={e => setCustomerProfile(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{customerProfile.emergency_contact_name || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500">Emergency Contact Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={customerProfile.emergency_contact_phone}
                      onChange={e => setCustomerProfile(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{customerProfile.emergency_contact_phone || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RideHub Professional Card */}
          {professionalCaps?.has_professional_access ? (
            <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-gray-900 rounded-2xl p-5 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm text-emerald-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Professional Status</h3>
                    <span className="text-[11px] text-emerald-200">
                      {professionalCaps.is_combined
                        ? 'Driver & Fleet Owner'
                        : professionalCaps.is_driver
                        ? 'Verified Driver'
                        : 'Vehicle Fleet Owner'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  Approved
                </span>
              </div>

              {professionalOverview && (
                <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm space-y-2 text-xs">
                  <div className="flex justify-between text-emerald-100">
                    <span>Lifetime Gross:</span>
                    <span className="font-bold text-white">{formatLKR(professionalOverview.lifetime.gross)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-100">
                    <span>10% Platform Fee:</span>
                    <span className="font-bold text-amber-300">-{formatLKR(professionalOverview.lifetime.platform_fee)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-white/10 flex justify-between font-bold text-sm">
                    <span className="text-emerald-200">Net Take-Home:</span>
                    <span className="text-emerald-400">{formatLKR(professionalOverview.lifetime.net)}</span>
                  </div>
                </div>
              )}

              <Link
                to="/professional"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
              >
                <span>Open Earnings Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Become a Professional</h3>
                  <p className="text-[11px] text-gray-500">Earn with RideHub</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                Drive passengers or list your vehicles to start earning with our 10% platform fee and automated statements.
              </p>
              <div className="flex gap-2 pt-1">
                <Link
                  to="/drivers/register"
                  className="flex-1 py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-center text-xs transition-colors"
                >
                  Join as Driver
                </Link>
                <Link
                  to="/vehicles/register"
                  className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-center text-xs transition-colors"
                >
                  List Vehicle
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Vehicles and Driver Status Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Vehicles */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Car className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900 text-lg">My Registered Vehicles</h3>
            </div>

            {userVehicles.length > 0 ? (
              <div className="space-y-3">
                {userVehicles.map(vehicle => (
                  <div key={vehicle.id} className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
                    <div>
                      <h4 className="font-bold text-gray-800">{vehicle.make} {vehicle.model}</h4>
                      <p className="text-xs text-gray-500">{vehicle.registration_number} • {vehicle.vehicle_type}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(vehicle.application_status)}`}>
                        {vehicle.application_status}
                      </span>
                      {vehicle.application_status === 'approved' && (
                        <button
                          onClick={() => handleSetAvailability(vehicle.uuid, 'vehicle', `${vehicle.make} ${vehicle.model}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Set Availability Calendar"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">No vehicles registered under this account.</p>
            )}
          </div>

          {/* My Driver Application status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900 text-lg">My Driver Application</h3>
            </div>

            {userDriverApplications.length > 0 ? (
              <div className="space-y-3">
                {userDriverApplications.map(app => (
                  <div key={app.id} className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
                    <div>
                      <h4 className="font-bold text-gray-800">{app.first_name} {app.last_name}</h4>
                      <p className="text-xs text-gray-500">License: {app.driving_license_number}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(app.application_status)}`}>
                        {app.application_status}
                      </span>
                      {app.application_status === 'approved' && (
                        <button
                          onClick={() => handleSetAvailability(app.uuid, 'driver', `${app.first_name} ${app.last_name}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Set Availability Calendar"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">No driver application submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}