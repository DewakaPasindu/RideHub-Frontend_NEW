import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Users, AlertCircle, XCircle, MessageSquare, User, Calendar, BookOpen, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminNav() {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/booking-approvals', label: 'Booking Approvals', icon: Calendar },
    { path: '/admin/booking-management', label: 'All Bookings', icon: BookOpen },
    { path: '/admin/vehicle-approvals', label: 'Vehicle Approvals', icon: Car },
    { path: '/admin/driver-approvals', label: 'Driver Approvals', icon: Users },
    { path: '/admin/reviews', label: 'Review Management', icon: MessageSquare },
    { path: '/admin/rejected', label: 'Rejected', icon: XCircle },
    { path: '/admin/profile', label: 'Admin Profile', icon: User },
    ...(user?.role === 'superadmin' ? [{ path: '/admin/admin-management', label: 'Admin Management', icon: UserPlus }] : [])
  ];

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <div className="space-y-2">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 ${
              location.pathname === item.path ? 'bg-gray-700' : ''
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}