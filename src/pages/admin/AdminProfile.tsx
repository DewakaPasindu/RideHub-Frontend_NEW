import React from 'react';
import { User, Edit, Save, X, Upload, Shield, Mail, Calendar } from 'lucide-react';
import { Admin } from '../../types';

export default function AdminProfile() {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [adminData, setAdminData] = React.useState<Admin>({
    id: 'admin1',
    username: 'admin',
    email: 'admin@ridehub.com',
    role: 'admin',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    createdAt: '2024-01-01T00:00:00Z'
  });

  const [editData, setEditData] = React.useState({
    username: adminData.username,
    email: adminData.email,
    profilePhoto: adminData.profilePhoto || ''
  });

  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!editData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setAdminData(prev => ({
        ...prev,
        username: editData.username,
        email: editData.email,
        profilePhoto: editData.profilePhoto
      }));
      setIsEditing(false);
      // TODO: Save to backend
      console.log('Saving admin data:', editData);
    }
  };

  const handlePasswordChange = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // TODO: Change password in backend
      console.log('Changing password');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    }
  };

  const handleCancel = () => {
    setEditData({
      username: adminData.username,
      email: adminData.email,
      profilePhoto: adminData.profilePhoto || ''
    });
    setIsEditing(false);
    setErrors({});
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData(prev => ({
          ...prev,
          profilePhoto: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Shield className="h-8 w-8 text-gray-800 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Photo and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={editData.profilePhoto || adminData.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'}
                    alt="Admin Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700">
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {adminData.username}
                </h2>
                <p className="text-gray-600">System Administrator</p>
                <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined {new Date(adminData.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-800"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleChange}
                      className={`w-full rounded-md border ${
                        errors.username ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                    />
                  ) : (
                    <p className="text-gray-900">{adminData.username}</p>
                  )}
                  {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleChange}
                      className={`w-full rounded-md border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                    />
                  ) : (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{adminData.email}</span>
                    </div>
                  )}
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 capitalize">{adminData.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Security</h3>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Change Password</span>
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      className={`w-full rounded-md border ${
                        errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                    />
                    {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className={`w-full rounded-md border ${
                        errors.newPassword ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                    />
                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className={`w-full rounded-md border ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handlePasswordChange}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setErrors({});
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">
                    Last password change: Never
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    For security reasons, we recommend changing your password regularly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}