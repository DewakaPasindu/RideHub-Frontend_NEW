import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  Search,
  Car,
  Phone,
  Mail,
  X,
} from 'lucide-react';
import api from '../../../services/api/client';

export default function OwnerApprovalCenter() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'more_info' | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', { params: { role: 'Vehicle Owner' } });
      setOwners(res.data?.data?.data || []);
    } catch (e) {
      console.error('Failed to load owners', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  const handleReviewAction = async () => {
    if (!selectedOwner?.vehicle_owner_profile?.uuid || !actionType) return;
    try {
      setProcessing(true);
      const uuid = selectedOwner.vehicle_owner_profile.uuid;
      if (actionType === 'approve') {
        await api.patch(`/admin/vehicle-owner-profiles/${uuid}/approve`, { admin_notes: notes });
      } else if (actionType === 'reject') {
        await api.patch(`/admin/vehicle-owner-profiles/${uuid}/reject`, { admin_notes: notes });
      } else if (actionType === 'more_info') {
        await api.patch(`/admin/vehicle-owner-profiles/${uuid}/more-info`, { admin_notes: notes });
      }
      setSelectedOwner(null);
      setActionType(null);
      setNotes('');
      loadOwners();
    } catch (e) {
      console.error('Owner review failed', e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            VEHICLE OWNER VERIFICATION CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit fleet partner profiles, registered business credentials, and fleet compliance</p>
        </div>

        <button
          onClick={loadOwners}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Owners</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : owners.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="font-bold text-slate-200">No vehicle owners found.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Owner / Partner</th>
                  <th className="p-3.5">Business Name</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">NIC / Identity</th>
                  <th className="p-3.5">Registered Fleet</th>
                  <th className="p-3.5">Verification Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {owners.map(u => {
                  const prof = u.vehicle_owner_profile;
                  const vehiclesCount = prof?.vehicles?.length || 0;
                  return (
                    <tr key={u.uuid} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-white">{u.first_name} {u.last_name}</p>
                        <p className="text-[11px] text-slate-500">Joined: {new Date(u.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="p-3.5 text-slate-200 font-semibold">
                        {prof?.business_name || 'Individual Fleet Partner'}
                      </td>
                      <td className="p-3.5">
                        <p className="text-slate-200">{u.phone || prof?.phone || '—'}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </td>
                      <td className="p-3.5 font-mono text-slate-200">
                        {prof?.nic_passport || prof?.id_number || 'N/A'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-200 text-xs inline-flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{vehiclesCount} Vehicles</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          prof?.application_status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : prof?.application_status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {prof?.application_status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedOwner(u)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
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

      {/* Owner Review Modal */}
      {selectedOwner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedOwner.first_name} {selectedOwner.last_name}</h3>
                  <p className="text-xs text-slate-400">Vehicle Owner Profile Verification</p>
                </div>
              </div>
              <button onClick={() => setSelectedOwner(null)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Business Name</span>
                <p className="font-bold text-slate-200 mt-0.5">{selectedOwner.vehicle_owner_profile?.business_name || 'Individual'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Tax / Registration No</span>
                <p className="font-mono font-bold text-slate-200 mt-0.5">{selectedOwner.vehicle_owner_profile?.tax_number || 'N/A'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Registered Address</span>
                <p className="font-bold text-slate-200 mt-0.5">{selectedOwner.vehicle_owner_profile?.address || 'N/A'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">NIC / ID Number</span>
                <p className="font-mono font-bold text-slate-200 mt-0.5">{selectedOwner.vehicle_owner_profile?.nic_passport || 'N/A'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActionType('reject')}
                  className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-bold text-xs"
                >
                  Reject Owner
                </button>
                <button
                  onClick={() => setActionType('more_info')}
                  className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs"
                >
                  Request Info
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedOwner(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => setActionType('approve')}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Owner</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {actionType && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white capitalize">
              Confirm Owner {actionType === 'approve' ? 'Approval' : actionType === 'reject' ? 'Rejection' : 'Information Request'}
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Administrative Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Enter verification notes..."
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setActionType(null); setNotes(''); }} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs">
                Cancel
              </button>
              <button
                onClick={handleReviewAction}
                disabled={processing}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors"
              >
                {processing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}