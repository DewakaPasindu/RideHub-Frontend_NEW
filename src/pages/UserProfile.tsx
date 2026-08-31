import React, { useState, useEffect } from 'react';
import { User as UserIcon, Car, Users, Edit, Eye, Trash2, Save, X, Calendar, Upload } from 'lucide-react';
import api from '../services/api/client';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/api/auth.service';
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
  const { user: authUser } = useAuth();
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
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const u = await AuthService.me();
      
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <UserIcon className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}

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
              <span className="text-xs text-blue-600 font-medium capitalize bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                {authUser?.role || 'Customer'}
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