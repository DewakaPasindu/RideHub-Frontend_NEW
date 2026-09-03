import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminNav from '../../components/layout/AdminNav';
import NotificationBell from '../../components/admin/NotificationBell';
import ThemeToggleSwitch from '../../components/admin/ThemeToggleSwitch';
import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminThemeProvider, useAdminTheme } from '../../contexts/AdminThemeContext';

function AdminLayoutInner() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark } = useAdminTheme();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div
      className={`flex min-h-screen antialiased font-sans transition-colors duration-200 ${
        isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <AdminNav />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Operations Header */}
        <header
          className={`h-16 px-6 backdrop-blur-md border-b flex items-center justify-between sticky top-0 z-30 transition-colors duration-200 ${
            isDark
              ? 'bg-slate-950/80 border-slate-800 text-slate-100'
              : 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
          }`}
        >
          {/* Quick Search */}
          <form onSubmit={handleSearch} className="relative w-72 sm:w-96">
            <Search
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users, vehicles, trips, tickets..."
              className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-xs transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-emerald-500'
                  : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500'
              }`}
            />
          </form>

          {/* Telemetry Status Pills, Theme Toggle & Actions */}
          <div className="flex items-center gap-4">
            <div
              className={`hidden lg:flex items-center gap-3 text-[11px] font-medium border-r pr-4 ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>API</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Database</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>GPS</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Payments</span>
              </span>
            </div>

            {/* Dark / Light Mode Switch */}
            <ThemeToggleSwitch showLabel={true} />

            <div className="flex items-center gap-3">
              <NotificationBell />
              <div
                className={`flex items-center gap-2 pl-2 border-l text-xs ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                  {user?.roles?.[0] || (user as any)?.role || 'Admin'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ml-1 ${
                    isDark
                      ? 'bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/50'
                      : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                  }`}
                  title="Log out of Admin Center"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner />
    </AdminThemeProvider>
  );
}