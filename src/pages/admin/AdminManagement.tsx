import React from 'react';
import { UserPlus, Shield, Users, Eye, Plus } from 'lucide-react';
import { useRequireSuperAdmin } from '../../hooks/useAuth';
import { DashboardService } from '../../services/api/DashboardService';
import { logUserAction, logError, logInfo } from '../../utils/logger';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'superadmin' | 'manager';
  createdAt: string;
  lastLogin?: string;
}

export default function AdminManagement() {
  const { user } = useRequireSuperAdmin();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [admins, setAdmins] = React.useState<AdminUser[]>([
    {
      id: '1',
      username: 'superadmin',
      email: 'admin@ridehub.com',
      role: 'superadmin',
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      username: 'manager',
      email: 'manager@ridehub.com',
      role: 'admin',
      createdAt: '2024-01-05T00:00:00Z',
      lastLogin: '2024-01-14T15:45:00Z'
    }
  ]);

  const [newAdmin, setNewAdmin] = React.useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'admin' | 'manager'
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Load admins on component mount
  React.useEffect(() => {
    const loadAdmins = async () => {
      try {
        setLoading(true);
        logInfo('Loading admin list');
        const data = await DashboardService.listAdmins();
        setAdmins(data.map(admin => ({
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role as 'admin' | 'superadmin' | 'manager',
          createdAt: admin.created_at,
          lastLogin: admin.last_login || undefined
        })));
        logInfo('Admin list loaded successfully', { count: data.length });
      } catch (error) {
        logError('Error loading admins', error as Error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validation
    if (!newAdmin.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (admins.some(admin => admin.username === newAdmin.username)) {
      newErrors.username = 'Username already exists';
    }
    
    if (!newAdmin.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      newErrors.email = 'Email is invalid';
    } else if (admins.some(admin => admin.email === newAdmin.email)) {
      newErrors.email = 'Email already exists';
    }
    
    if (!newAdmin.password) {
      newErrors.password = 'Password is required';
    } else if (newAdmin.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newAdmin.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        logUserAction('Create new admin', { 
          username: newAdmin.username, 
          email: newAdmin.email, 
          role: newAdmin.role 
        });
        
        const createdAdmin = await DashboardService.createAdmin({
          username: newAdmin.username,
          email: newAdmin.email,
          password: newAdmin.password,
          role: newAdmin.role
        });
        
        const newAdminUser: AdminUser = {
          id: createdAdmin.id,
          username: createdAdmin.username,
          email: createdAdmin.email,
          role: createdAdmin.role as 'admin' | 'superadmin' | 'manager',
          createdAt: createdAdmin.created_at,
          lastLogin: createdAdmin.last_login || undefined
        };
        
        setAdmins(prev => [...prev, newAdminUser]);
        setNewAdmin({ username: '', email: '', password: '', confirmPassword: '', role: 'admin' });
        setShowAddForm(false);
        
        logInfo('Admin created successfully', { 
          adminId: createdAdmin.id, 
          username: createdAdmin.username 
        });
        
        alert('Admin created successfully!');
      } catch (error: any) {
        logError('Error creating admin', error as Error, { 
          username: newAdmin.username, 
          email: newAdmin.email 
        });
        
        if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        } else {
          setErrors({ general: 'Failed to create admin. Please try again.' });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-gray-800 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-purple-600">
                {admins.filter(a => a.role === 'superadmin').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Regular Admins</p>
              <p className="text-2xl font-bold text-green-600">
                {admins.filter(a => a.role === 'admin' || a.role === 'manager').length}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Current Administrators</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {admin.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {admin.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(admin.role)}`}>
                      {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Add New Administrator</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setErrors({});
                  setNewAdmin({ username: '', email: '', password: '', confirmPassword: '', role: 'admin' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={newAdmin.username}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                  placeholder="Enter username"
                />
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                  placeholder="Enter email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={newAdmin.role}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={newAdmin.password}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                  placeholder="Enter password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={newAdmin.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setErrors({});
                    setNewAdmin({ username: '', email: '', password: '', confirmPassword: '', role: 'admin' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}