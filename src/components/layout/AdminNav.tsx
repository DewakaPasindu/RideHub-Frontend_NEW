import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Radio,
  Car,
  Users,
  Calendar,
  Wallet,
  AlertTriangle,
  BarChart3,
  FileText,
  History,
  Activity,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  UserCheck,
  ShieldAlert,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import ThemeToggleSwitch from '../admin/ThemeToggleSwitch';
import { useNavigate } from 'react-router-dom';

interface NavGroup {
  title: string;
  items: Array<{
    path: string;
    label: string;
    icon: any;
    badge?: string;
  }>;
}

export default function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark } = useAdminTheme();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Command Center': true,
    'Approvals': true,
    'Live Operations': true,
    'Financial Center': true,
    'Safety & Trust': true,
  });

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const navGroups: NavGroup[] = [
    {
      title: 'Command Center',
      items: [
        { path: '/admin/dashboard', label: 'Command Center', icon: LayoutDashboard },
        { path: '/admin/search', label: 'Global Search', icon: Search },
      ],
    },
    {
      title: 'Approvals',
      items: [
        { path: '/admin/driver-approvals', label: 'Driver Verification', icon: UserCheck },
        { path: '/admin/vehicle-approvals', label: 'Vehicle Verification', icon: Car },
        { path: '/admin/owner-approvals', label: 'Owner Verification', icon: ShieldCheck },
      ],
    },
    {
      title: 'Live Operations',
      items: [
        { path: '/admin/live', label: 'Live Operations Map', icon: Radio },
      ],
    },
    {
      title: 'Fleet & Drivers',
      items: [
        { path: '/admin/fleet', label: 'Fleet Management', icon: Car },
        { path: '/admin/drivers', label: 'Driver Management', icon: Users },
      ],
    },
    {
      title: 'Users & Access',
      items: [
        { path: '/admin/users', label: 'User Directory', icon: Users },
        ...(user?.roles?.includes('Super Admin') || (user as any)?.role === 'superadmin'
          ? [{ path: '/admin/admin-management', label: 'Admin Access Control', icon: ShieldAlert }]
          : []),
      ],
    },
    {
      title: 'Bookings & Rentals',
      items: [
        { path: '/admin/booking-management', label: 'Ride Bookings', icon: Calendar },
        { path: '/admin/rentals', label: 'Self-Drive Rentals', icon: Car },
      ],
    },
    {
      title: 'Financial Center',
      items: [
        { path: '/admin/finance', label: 'Financial Telemetry', icon: Wallet },
      ],
    },
    {
      title: 'Safety & Trust',
      items: [
        { path: '/admin/safety/complaints', label: 'Disputes & Complaints', icon: AlertTriangle },
        { path: '/admin/reviews', label: 'Review Moderation', icon: Sparkles },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { path: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
        { path: '/admin/reports', label: 'Operations Reports', icon: FileText },
      ],
    },
    {
      title: 'Platform System',
      items: [
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: History },
        { path: '/admin/system-health', label: 'System Health Probes', icon: Activity },
        { path: '/admin/settings', label: 'Platform Settings', icon: Settings },
      ],
    },
  ];

  return (
    <nav
      className={`w-72 min-h-screen border-r flex flex-col flex-shrink-0 select-none transition-colors duration-200 ${
        isDark
          ? 'bg-slate-950 text-slate-200 border-slate-800'
          : 'bg-white text-slate-700 border-slate-200 shadow-sm'
      }`}
    >
      {/* Header */}
      <div
        className={`p-5 border-b flex items-center justify-between transition-colors ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-emerald-500/20">
            R
          </div>
          <div>
            <h2 className={`text-sm font-black tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              RideHub Admin
            </h2>
            <p className="text-[10px] font-semibold text-emerald-500 tracking-widest uppercase flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Operations Center
            </p>
          </div>
        </div>

        {/* Quick Theme Switch in Nav Header */}
        <ThemeToggleSwitch />
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
        {navGroups.map(group => {
          const isOpen = openGroups[group.title] ?? true;
          return (
            <div key={group.title} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{group.title}</span>
                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {isOpen && (
                <div className="space-y-0.5 pl-1">
                  {group.items.map(item => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                            : isDark
                            ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComponent
                            className={`w-4 h-4 ${
                              isActive
                                ? 'text-slate-950'
                                : isDark
                                ? 'text-slate-400'
                                : 'text-slate-500'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isActive
                                ? 'bg-slate-950 text-white'
                                : isDark
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className={`p-3.5 border-t text-xs flex items-center justify-between transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-900/40 text-slate-300'
            : 'border-slate-200 bg-slate-50 text-slate-700'
        }`}
      >
        <div className="truncate pr-2">
          <p className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-[10px] text-slate-400 capitalize truncate">
            {user?.roles?.[0] || (user as any)?.role || 'Administrator'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Link
            to="/admin/profile"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
            title="Admin Profile"
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'bg-red-950/40 hover:bg-red-900/60 text-red-400'
                : 'bg-red-50 hover:bg-red-100 text-red-600'
            }`}
            title="Log out of Admin Center"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}