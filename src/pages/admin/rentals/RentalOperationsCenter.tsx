import React, { useState, useEffect } from 'react';
import {
  Car,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  ShieldAlert,
  X,
  Gauge,
} from 'lucide-react';
import { AdminService } from '../../../services/api/admin.service';
import { useAdminTheme } from '../../../contexts/AdminThemeContext';
import { formatLKR } from '../../../components/professional/EarningsSummaryCards';

export default function RentalOperationsCenter() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRental, setSelectedRental] = useState<any | null>(null);
  const { isDark } = useAdminTheme();

  const loadRentals = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 50 };
      if (activeTab !== 'all') params.status = activeTab;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await AdminService.getRentals(params);
      setRentals(res.data || []);
      setStatusCounts(res.status_counts || {});
    } catch (e) {
      console.error('Failed to load rentals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b transition-colors ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div>
          <h1
            className={`text-2xl font-black tracking-wide flex items-center gap-2.5 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <Car className="w-6 h-6 text-emerald-500" />
            SELF-DRIVE RENTAL OPERATIONS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor active agreements, check-ins, scheduled return deadlines, and overdue alerts
          </p>
        </div>

        <button
          onClick={loadRentals}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          <span>Refresh Rentals</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div
          className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs overflow-x-auto ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {[
            { id: 'all', label: 'All Rentals', count: statusCounts.all },
            { id: 'active', label: 'Active on Road', count: statusCounts.active },
            { id: 'overdue', label: 'Overdue', count: statusCounts.overdue },
            { id: 'completed', label: 'Completed', count: statusCounts.completed },
            { id: 'approved', label: 'Approved', count: statusCounts.approved },
            { id: 'pending', label: 'Pending', count: statusCounts.pending },
            { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                      isActive
                        ? 'bg-slate-950 text-emerald-400'
                        : tab.id === 'overdue' && tab.count > 0
                        ? 'bg-red-500/20 text-red-400 font-black'
                        : isDark
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadRentals()}
            placeholder="Search customer, vehicle, plate..."
            className={`px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-emerald-500 w-64 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
            }`}
          />
          <button
            onClick={loadRentals}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Search
          </button>
        </div>
      </div>

      {/* Rentals Table */}
      {loading ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : rentals.length === 0 ? (
        <div
          className={`p-12 rounded-2xl border text-center space-y-2 text-xs ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
          }`}
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="font-bold">No rental agreements found matching criteria.</p>
        </div>
      ) : (
        <div
          className={`rounded-2xl border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`uppercase text-[10px] font-bold tracking-wider border-b ${
                  isDark ? 'bg-slate-900/80 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <tr>
                  <th className="p-3.5">Agreement / Customer</th>
                  <th className="p-3.5">Vehicle Plate</th>
                  <th className="p-3.5">Schedule</th>
                  <th className="p-3.5">Pricing</th>
                  <th className="p-3.5">Fleet Owner</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-900 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
                {rentals.map(r => {
                  const isOverdue = r.status === 'active' && r.end_at && new Date(r.end_at) < new Date();
                  return (
                    <tr
                      key={r.uuid}
                      className={`transition-colors ${
                        isOverdue
                          ? isDark
                            ? 'bg-red-950/20 hover:bg-red-950/30'
                            : 'bg-red-50 hover:bg-red-100/60'
                          : isDark
                          ? 'hover:bg-slate-900/50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] font-bold text-emerald-500">
                            #{r.uuid.substring(0, 8).toUpperCase()}
                          </span>
                          <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {r.first_name} {r.last_name}
                          </p>
                          <p className="text-[11px] text-slate-400">{r.phone || r.email}</p>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {r.vehicle?.make} {r.vehicle?.model}
                        </p>
                        <p className="font-mono text-[11px] text-slate-400">
                          {r.vehicle?.registration_number || 'N/A'}
                        </p>
                      </td>

                      <td className="p-3.5 text-[11px]">
                        <p className="font-semibold">
                          From: {r.start_at ? new Date(r.start_at).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className={isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}>
                          Due: {r.end_at ? new Date(r.end_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-emerald-500">
                          {formatLKR(r.estimated_total_amount || r.final_amount || 0)}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatLKR(r.daily_rate || 0)}/day</p>
                      </td>

                      <td className="p-3.5 text-[11px]">
                        <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {r.vehicle?.vehicle_owner_profile?.business_name || 'Individual Fleet'}
                        </p>
                        <p className="text-slate-400">
                          {r.vehicle?.vehicle_owner_profile?.user?.first_name} {r.vehicle?.vehicle_owner_profile?.user?.last_name}
                        </p>
                      </td>

                      <td className="p-3.5">
                        {isOverdue ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse">
                            OVERDUE
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              r.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                : r.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                                : 'bg-slate-500/20 text-slate-400'
                            }`}
                          >
                            {r.status?.replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedRental(r)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors ${
                            isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rental Details Modal */}
      {selectedRental && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`rounded-2xl border w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Rental #{selectedRental.uuid.substring(0, 8).toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedRental.vehicle?.make} {selectedRental.vehicle?.model} ({selectedRental.vehicle?.registration_number})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRental(null)}
                className={`p-1.5 rounded-lg ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div
                className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Daily Rate</span>
                  <p className="font-bold text-emerald-500 mt-0.5">{formatLKR(selectedRental.daily_rate || 0)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Included KM</span>
                  <p className="font-bold mt-0.5">{selectedRental.included_km_per_day || 100} KM/day</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Start Odometer</span>
                  <p className="font-mono font-bold mt-0.5">{selectedRental.starting_odometer ?? 'Pending'} KM</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Return Odometer</span>
                  <p className="font-mono font-bold mt-0.5">{selectedRental.ending_odometer ?? 'On Road'} KM</p>
                </div>
              </div>

              {/* Customer & Owner info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border space-y-1 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Customer Details</span>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedRental.first_name} {selectedRental.last_name}
                  </p>
                  <p className="text-slate-400">{selectedRental.email}</p>
                  <p className="text-slate-400">Phone: {selectedRental.phone}</p>
                  <p className="text-slate-400">License: {selectedRental.driving_license_number || 'N/A'}</p>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-1 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Fleet Owner</span>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedRental.vehicle?.vehicle_owner_profile?.business_name || 'Individual'}
                  </p>
                  <p className="text-slate-400">
                    {selectedRental.vehicle?.vehicle_owner_profile?.user?.first_name} {selectedRental.vehicle?.vehicle_owner_profile?.user?.last_name}
                  </p>
                  <p className="text-slate-400">
                    Owner Phone: {selectedRental.vehicle?.vehicle_owner_profile?.user?.phone || 'N/A'}
                  </p>
                </div>
              </div>

              {selectedRental.damage_description && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 space-y-1">
                  <span className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Return Condition / Damage Note
                  </span>
                  <p>{selectedRental.damage_description}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={`p-4 border-t flex justify-end ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <button
                onClick={() => setSelectedRental(null)}
                className={`px-4 py-2 rounded-lg font-bold text-xs ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}