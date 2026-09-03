import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  CheckCircle2,
  Phone,
  Eye,
  Star,
  ShieldAlert,
} from 'lucide-react';
import { AdminService } from '../../../services/api/admin.service';

export default function DriverManagementCenter() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const params: any = { status: 'approved', per_page: 50 };
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await AdminService.getDrivers(params);
      setDrivers(res.data || []);
    } catch (e) {
      console.error('Failed to load drivers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            DRIVER FLEET MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review active driver roster, ratings, trip completion records, and performance metrics</p>
        </div>

        <button
          onClick={loadDrivers}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Drivers</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadDrivers()}
            placeholder="Search driver name, license, NIC..."
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-72"
          />
          <button onClick={loadDrivers} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200">
            Search
          </button>
        </div>
      </div>

      {/* Drivers Table */}
      {loading ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : drivers.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="font-bold text-slate-200">No active drivers found.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Driver</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">License & NIC</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Availability</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {drivers.map(d => (
                  <tr key={d.uuid} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-white">{d.first_name} {d.last_name}</p>
                      <p className="text-[11px] text-slate-500">{d.address || 'Sri Lanka'}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-200">{d.phone || '—'}</p>
                      <p className="text-[11px] text-slate-500">{d.email}</p>
                    </td>
                    <td className="p-3.5 font-mono">
                      <p className="text-slate-200 font-bold">{d.driving_license_number}</p>
                      <p className="text-[11px] text-slate-500">NIC: {d.nic_passport}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{d.rating || '5.0'}</span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        d.availability_status === 'available' || d.availability_status === 'online'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {d.availability_status || 'Offline'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <a
                        href="/admin/driver-approvals"
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}