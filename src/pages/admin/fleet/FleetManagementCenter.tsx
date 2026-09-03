import React, { useState, useEffect } from 'react';
import {
  Car,
  Filter,
  Search,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  Calendar,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { AdminService } from '../../../services/api/admin.service';
import { formatLKR } from '../../../components/professional/EarningsSummaryCards';

export default function FleetManagementCenter() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadFleet = async () => {
    try {
      setLoading(true);
      const params: any = { status: 'approved', per_page: 50 };
      if (filterType !== 'all') params.type = filterType;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await AdminService.getVehicles(params);
      setVehicles(res.data || []);
    } catch (e) {
      console.error('Failed to load fleet', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, [filterType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Car className="w-6 h-6 text-emerald-400" />
            FLEET ASSET MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 mt-1">Monitor vehicle utilization, maintenance statuses, performance metrics, and asset health</p>
        </div>

        <button
          onClick={loadFleet}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'car', 'van', 'suv', 'bus'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                filterType === type ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadFleet()}
            placeholder="Search make, model, registration..."
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
          />
          <button onClick={loadFleet} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200">
            Search
          </button>
        </div>
      </div>

      {/* Fleet Table */}
      {loading ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="font-bold text-slate-200">No vehicles found in fleet directory.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Vehicle Asset</th>
                  <th className="p-3.5">Plate Number</th>
                  <th className="p-3.5">Type / Fuel</th>
                  <th className="p-3.5">Pricing</th>
                  <th className="p-3.5">Owner / Fleet Partner</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {vehicles.map(v => (
                  <tr key={v.uuid} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-white">{v.make} {v.model}</p>
                      <p className="text-[11px] text-slate-500">{v.manufacturing_year} • {v.color}</p>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-200">
                      {v.registration_number || v.vehicle_number}
                    </td>
                    <td className="p-3.5 capitalize text-slate-300">
                      {v.vehicle_type} • {v.fuel_type}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-emerald-400">{formatLKR(v.price_per_day || 0)}/day</p>
                      <p className="text-[10px] text-slate-500">Rs. {v.extra_km_rate || 50}/KM extra</p>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-200 font-semibold">{v.vehicle_owner_profile?.business_name || 'Individual Fleet'}</p>
                      <p className="text-[11px] text-slate-500">{v.vehicle_owner_profile?.user?.first_name} {v.vehicle_owner_profile?.user?.last_name}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {v.application_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <a
                        href={`/admin/vehicle-approvals`}
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