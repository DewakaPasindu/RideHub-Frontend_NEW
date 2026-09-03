import React, { useState, useEffect } from 'react';
import {
  Car,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  RefreshCw,
  Search,
  Shield,
  Phone,
  DollarSign,
  Calendar,
  X,
} from 'lucide-react';
import { AdminService } from '../../../services/api/admin.service';
import { formatLKR } from '../../../components/professional/EarningsSummaryCards';

export default function VehicleApprovalCenter() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected vehicle for inspection modal
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  // Action Dialog states
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'more_info' | 'suspend' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 50 };
      if (activeTab !== 'all') params.status = activeTab;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await AdminService.getVehicles(params);
      setVehicles(res.data || []);
      setStatusCounts(res.status_counts || {});
    } catch (e) {
      console.error('Failed to load vehicles', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [activeTab]);

  const handleActionSubmit = async () => {
    if (!selectedVehicle || !actionType) return;
    try {
      setProcessing(true);
      setErrorMsg('');

      if (actionType === 'approve') {
        await AdminService.approveVehicle(selectedVehicle.uuid, actionReason);
      } else if (actionType === 'reject') {
        if (!actionReason.trim()) {
          setErrorMsg('Rejection reason is required.');
          setProcessing(false);
          return;
        }
        await AdminService.rejectVehicle(selectedVehicle.uuid, actionReason);
      } else if (actionType === 'more_info') {
        if (!actionReason.trim()) {
          setErrorMsg('Information request notes are required.');
          setProcessing(false);
          return;
        }
        await AdminService.requestVehicleMoreInfo(selectedVehicle.uuid, actionReason);
      } else if (actionType === 'suspend') {
        if (!actionReason.trim()) {
          setErrorMsg('Suspension reason is required.');
          setProcessing(false);
          return;
        }
        await AdminService.suspendVehicle(selectedVehicle.uuid, actionReason);
      }

      setActionType(null);
      setActionReason('');
      setSelectedVehicle(null);
      loadVehicles();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Action failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Car className="w-6 h-6 text-emerald-400" />
            VEHICLE VERIFICATION & INSPECTION CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit fleet listings, specifications, registration papers, insurance compliance, and safety standards</p>
        </div>

        <button
          onClick={loadVehicles}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending Review', count: statusCounts.pending },
            { id: 'more_info_required', label: 'More Info Needed', count: statusCounts.more_info_required },
            { id: 'approved', label: 'Approved Fleet', count: statusCounts.approved },
            { id: 'rejected', label: 'Rejected', count: statusCounts.rejected },
            { id: 'all', label: 'All Vehicles', count: statusCounts.all },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${activeTab === tab.id ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadVehicles()}
            placeholder="Search plate, make, model..."
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
          />
          <button
            onClick={loadVehicles}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
          >
            Search
          </button>
        </div>
      </div>

      {/* Vehicles Table */}
      {loading ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="font-bold text-slate-200">No vehicles found matching criteria.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Registration / Plate</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Daily Rate</th>
                  <th className="p-3.5">Owner / Fleet</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {vehicles.map(v => (
                  <tr key={v.uuid} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 overflow-hidden">
                          {v.images?.[0] ? (
                            <img src={`http://127.0.0.1:8000/storage/${v.images[0]}`} alt={v.model} className="w-full h-full object-cover" />
                          ) : (
                            <Car className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{v.make} {v.model}</p>
                          <p className="text-[11px] text-slate-500">{v.manufacturing_year} • {v.color}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-200">
                      {v.registration_number || v.vehicle_number}
                    </td>
                    <td className="p-3.5 uppercase text-[11px] text-slate-400 font-semibold">
                      {v.vehicle_type}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400">
                      {formatLKR(v.price_per_day || 0)}/day
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-200 font-medium">
                        {v.vehicle_owner_profile?.user ? `${v.vehicle_owner_profile.user.first_name} ${v.vehicle_owner_profile.user.last_name}` : 'Owner'}
                      </p>
                      <p className="text-[11px] text-slate-500">{v.vehicle_owner_profile?.business_name || v.vehicle_owner_profile?.user?.phone || 'Fleet'}</p>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        v.application_status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : v.application_status === 'rejected'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : v.application_status === 'suspended'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : v.application_status === 'more_info_required'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {v.application_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedVehicle(v)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicle Inspection Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.registration_number || selectedVehicle.vehicle_number})</h3>
                  <p className="text-xs text-slate-400">Vehicle Specifications & Regulatory Compliance Audit</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Category</span>
                  <p className="font-bold text-slate-200 capitalize mt-0.5">{selectedVehicle.vehicle_type}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Year / Color</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedVehicle.manufacturing_year} • {selectedVehicle.color}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Transmission / Fuel</span>
                  <p className="font-bold text-slate-200 capitalize mt-0.5">{selectedVehicle.transmission} • {selectedVehicle.fuel_type}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Seating / Doors</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedVehicle.seating_capacity} Seats • {selectedVehicle.doors} Doors</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Chassis Number</span>
                  <p className="font-mono text-slate-200 mt-0.5">{selectedVehicle.chassis_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Engine Number</span>
                  <p className="font-mono text-slate-200 mt-0.5">{selectedVehicle.engine_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Pricing Model</span>
                  <p className="font-bold text-blue-400 mt-0.5 capitalize">{selectedVehicle.pricing_type?.replace('_', ' ') || 'Price Per Day'}</p>
                </div>
                {(selectedVehicle.pricing_type === 'per_day' || selectedVehicle.pricing_type === 'both' || !selectedVehicle.pricing_type) && (
                  <>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Daily Rental Rate</span>
                      <p className="font-bold text-emerald-400 mt-0.5">{formatLKR(selectedVehicle.price_per_day || 0)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Included KM / Day</span>
                      <p className="font-bold text-slate-200 mt-0.5">{selectedVehicle.included_km_per_day || 100} KM/day</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Extra KM Rate</span>
                      <p className="font-bold text-amber-400 mt-0.5">Rs. {selectedVehicle.extra_km_rate || 50.00}/KM</p>
                    </div>
                  </>
                )}
                {(selectedVehicle.pricing_type === 'per_km' || selectedVehicle.pricing_type === 'both') && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Per KM Rate</span>
                    <p className="font-bold text-emerald-400 mt-0.5">{formatLKR(selectedVehicle.price_per_km || 0)}/KM</p>
                  </div>
                )}
              </div>

              {/* Photos Gallery */}
              {selectedVehicle.images && selectedVehicle.images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Vehicle Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {selectedVehicle.images.map((img: string, idx: number) => (
                      <a
                        key={idx}
                        href={`http://127.0.0.1:8000/storage/${img}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-28 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden block hover:opacity-90 transition-opacity"
                      >
                        <img src={`http://127.0.0.1:8000/storage/${img}`} alt="Vehicle" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Regulatory Documents */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Compliance Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Revenue License</p>
                      <p className="text-[11px] text-slate-500">Official government vehicle permit</p>
                    </div>
                    {selectedVehicle.revenue_license_document ? (
                      <a
                        href={`http://127.0.0.1:8000/storage/${selectedVehicle.revenue_license_document}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </a>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Not provided</span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Insurance Certificate</p>
                      <p className="text-[11px] text-slate-500">Comprehensive vehicle coverage</p>
                    </div>
                    {selectedVehicle.insurance_card_document ? (
                      <a
                        href={`http://127.0.0.1:8000/storage/${selectedVehicle.insurance_card_document}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </a>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Vehicle Owner</span>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {selectedVehicle.vehicle_owner_profile?.user ? `${selectedVehicle.vehicle_owner_profile.user.first_name} ${selectedVehicle.vehicle_owner_profile.user.last_name}` : 'Registered Partner'}
                  </p>
                  <p className="text-[11px] text-slate-400">{selectedVehicle.vehicle_owner_profile?.business_name} • Phone: {selectedVehicle.vehicle_owner_profile?.user?.phone || 'N/A'}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified Fleet Partner
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActionType('reject')}
                  className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-bold text-xs transition-colors"
                >
                  Reject Vehicle
                </button>
                <button
                  onClick={() => setActionType('more_info')}
                  className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition-colors"
                >
                  Request Info
                </button>
                {selectedVehicle.application_status === 'approved' && (
                  <button
                    onClick={() => setActionType('suspend')}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-300 font-bold text-xs transition-colors"
                  >
                    Suspend Listing
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Close
                </button>
                {selectedVehicle.application_status !== 'approved' && (
                  <button
                    onClick={() => setActionType('approve')}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Vehicle</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      {actionType && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white capitalize">
              {actionType === 'approve' && 'Confirm Vehicle Approval'}
              {actionType === 'reject' && 'Confirm Vehicle Rejection'}
              {actionType === 'more_info' && 'Request Additional Documentation'}
              {actionType === 'suspend' && 'Suspend Vehicle Listing'}
            </h3>

            {errorMsg && (
              <p className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs">{errorMsg}</p>
            )}

            <p className="text-xs text-slate-300">
              {actionType === 'approve' && 'Approving this vehicle will make it active and immediately bookable for self-drive rentals and driver bookings across RideHub.'}
              {actionType === 'reject' && 'Specify reason for rejection. This will be stored for audit and notified to the vehicle owner.'}
              {actionType === 'more_info' && 'Specify what documents (e.g. clearer revenue license, insurance) are required.'}
              {actionType === 'suspend' && 'Suspending the vehicle will remove it from public search and block future rental requests.'}
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                {actionType === 'approve' ? 'Administrative Notes (Optional)' : 'Reason / Notes (Required)'}
              </label>
              <textarea
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                rows={3}
                placeholder="Enter administrative details..."
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setActionType(null); setActionReason(''); setErrorMsg(''); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={processing}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors"
              >
                {processing ? 'Processing...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}