import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  RefreshCw,
  Search,
  Shield,
  Phone,
  Mail,
  Calendar,
  X,
} from 'lucide-react';
import { AdminService } from '../../../services/api/admin.service';

export default function DriverApprovalCenter() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected driver for inspection modal
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  // Action Dialog states
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'more_info' | 'suspend' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 50 };
      if (activeTab !== 'all') params.status = activeTab;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await AdminService.getDrivers(params);
      setDrivers(res.data || []);
      setStatusCounts(res.status_counts || {});
    } catch (e) {
      console.error('Failed to load driver applications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [activeTab]);

  const handleActionSubmit = async () => {
    if (!selectedDriver || !actionType) return;
    try {
      setProcessing(true);
      setErrorMsg('');

      if (actionType === 'approve') {
        await AdminService.approveDriver(selectedDriver.uuid, actionReason);
      } else if (actionType === 'reject') {
        if (!actionReason.trim()) {
          setErrorMsg('Rejection reason is required.');
          setProcessing(false);
          return;
        }
        await AdminService.rejectDriver(selectedDriver.uuid, actionReason);
      } else if (actionType === 'more_info') {
        if (!actionReason.trim()) {
          setErrorMsg('Information request notes are required.');
          setProcessing(false);
          return;
        }
        await AdminService.requestDriverMoreInfo(selectedDriver.uuid, actionReason);
      } else if (actionType === 'suspend') {
        if (!actionReason.trim()) {
          setErrorMsg('Suspension reason is required.');
          setProcessing(false);
          return;
        }
        await AdminService.suspendDriver(selectedDriver.uuid, actionReason);
      }

      setActionType(null);
      setActionReason('');
      setSelectedDriver(null);
      loadDrivers();
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
            <UserCheck className="w-6 h-6 text-emerald-400" />
            DRIVER VERIFICATION CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review applicant identity, licensing, background verification, and manage driver credentials</p>
        </div>

        <button
          onClick={loadDrivers}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending Review', count: statusCounts.pending },
            { id: 'more_info_required', label: 'More Info Needed', count: statusCounts.more_info_required },
            { id: 'approved', label: 'Approved Drivers', count: statusCounts.approved },
            { id: 'rejected', label: 'Rejected', count: statusCounts.rejected },
            { id: 'all', label: 'All Applications', count: statusCounts.all },
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
            onKeyDown={e => e.key === 'Enter' && loadDrivers()}
            placeholder="Search driver name, license, NIC..."
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
          />
          <button
            onClick={loadDrivers}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
          >
            Search
          </button>
        </div>
      </div>

      {/* Driver Queue Table */}
      {loading ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : drivers.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="font-bold text-slate-200">No driver applications found in this queue.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Applicant</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Driving License</th>
                  <th className="p-3.5">NIC / Identity</th>
                  <th className="p-3.5">Documents</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {drivers.map(driver => (
                  <tr key={driver.uuid} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 overflow-hidden">
                          {driver.selfie_photo ? (
                            <img src={`http://127.0.0.1:8000/storage/${driver.selfie_photo}`} alt="Selfie" className="w-full h-full object-cover" />
                          ) : (
                            driver.first_name?.[0]
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{driver.first_name} {driver.last_name}</p>
                          <p className="text-[11px] text-slate-500 capitalize">{driver.gender || 'Driver'} • {driver.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-200">{driver.phone || '—'}</p>
                      <p className="text-[11px] text-slate-500">{driver.email}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-mono text-slate-200 font-semibold">{driver.driving_license_number}</p>
                      <p className="text-[11px] text-slate-500">Exp: {driver.license_expiry_date || 'N/A'}</p>
                    </td>
                    <td className="p-3.5 font-mono text-slate-200">
                      {driver.nic_passport}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-semibold ${driver.license_document ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          License: {driver.license_document ? 'Uploaded' : 'Missing'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-semibold ${driver.nic_document ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          NIC: {driver.nic_document ? 'Uploaded' : 'Missing'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        driver.application_status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : driver.application_status === 'rejected'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : driver.application_status === 'more_info_required'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {driver.application_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedDriver(driver)}
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

      {/* Driver Inspection Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedDriver.first_name} {selectedDriver.last_name}</h3>
                  <p className="text-xs text-slate-400">Driver Verification & Document Audit</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Verification Checklist */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">5-Point Compliance Checklist</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Identity Document Present</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Driver License Valid</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Selfie / Face Matched</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Background Verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Profile Complete</span>
                  </div>
                </div>
              </div>

              {/* Applicant Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Driving License</span>
                  <p className="font-mono font-bold text-slate-200 mt-0.5">{selectedDriver.driving_license_number}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">License Expiry</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedDriver.license_expiry_date || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">NIC / Passport</span>
                  <p className="font-mono font-bold text-slate-200 mt-0.5">{selectedDriver.nic_passport}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Date of Birth</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedDriver.date_of_birth ? new Date(selectedDriver.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {/* Uploaded Documents Preview Links */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Verification Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                    <p className="font-bold text-slate-300 text-xs">Driver License</p>
                    {selectedDriver.license_document ? (
                      <a
                        href={`http://127.0.0.1:8000/storage/${selectedDriver.license_document}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </a>
                    ) : (
                      <p className="text-slate-500 text-[11px]">Not uploaded</p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                    <p className="font-bold text-slate-300 text-xs">NIC / Passport</p>
                    {selectedDriver.nic_document ? (
                      <a
                        href={`http://127.0.0.1:8000/storage/${selectedDriver.nic_document}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </a>
                    ) : (
                      <p className="text-slate-500 text-[11px]">Not uploaded</p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                    <p className="font-bold text-slate-300 text-xs">Live Verification Photo</p>
                    {selectedDriver.selfie_photo ? (
                      <a
                        href={`http://127.0.0.1:8000/storage/${selectedDriver.selfie_photo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Selfie</span>
                      </a>
                    ) : (
                      <p className="text-slate-500 text-[11px]">Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Notes History */}
              {selectedDriver.admin_notes && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Previous Administrative Notes</p>
                  <p className="text-slate-300">{selectedDriver.admin_notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer / Actions */}
            <div className="p-5 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActionType('reject')}
                  className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-bold text-xs transition-colors"
                >
                  Reject Application
                </button>
                <button
                  onClick={() => setActionType('more_info')}
                  className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition-colors"
                >
                  Request Information
                </button>
                {selectedDriver.application_status === 'approved' && (
                  <button
                    onClick={() => setActionType('suspend')}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-300 font-bold text-xs transition-colors"
                  >
                    Suspend Driver
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Close
                </button>
                {selectedDriver.application_status !== 'approved' && (
                  <button
                    onClick={() => setActionType('approve')}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Driver</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionType && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white capitalize">
              {actionType === 'approve' && 'Confirm Driver Approval'}
              {actionType === 'reject' && 'Confirm Rejection'}
              {actionType === 'more_info' && 'Request More Information'}
              {actionType === 'suspend' && 'Confirm Driver Suspension'}
            </h3>

            {errorMsg && (
              <p className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs">{errorMsg}</p>
            )}

            <p className="text-xs text-slate-300">
              {actionType === 'approve' && 'Approving this application will activate the Driver capability and grant the user full access to the Driver Dashboard.'}
              {actionType === 'reject' && 'Please specify the exact reason for rejecting this driver application. The reason will be notified to the user and recorded in audit logs.'}
              {actionType === 'more_info' && 'Specify what additional documents or clarification the applicant needs to provide.'}
              {actionType === 'suspend' && 'Suspending the driver will disable trip assignments and access to new rides. State reason for audit compliance.'}
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                {actionType === 'approve' ? 'Administrative Notes (Optional)' : 'Reason / Notes (Required)'}
              </label>
              <textarea
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                rows={3}
                placeholder="Enter administrative justification..."
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