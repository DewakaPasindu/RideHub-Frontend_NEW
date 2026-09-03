import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  RefreshCw,
  Eye,
  User,
  Car,
  FileText,
  X,
  MessageSquare,
  UserCheck,
} from 'lucide-react';
import { AdminService, type ComplaintRecord } from '../../../services/api/admin.service';

export default function SafetyTrustCenter() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [statusCounts, setStatusCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState<ComplaintRecord | null>(null);

  // Resolution modal
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 50 };
      if (activeTab !== 'all') params.status = activeTab;

      const res = await AdminService.getComplaints(params);
      setComplaints(res.data || []);
      setStatusCounts(res.status_counts || {});
    } catch (e) {
      console.error('Failed to load complaints', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [activeTab]);

  const handleResolveSubmit = async () => {
    if (!selectedTicket || !resolutionNotes.trim()) {
      setErrorMsg('Resolution summary is required.');
      return;
    }
    try {
      setProcessing(true);
      setErrorMsg('');
      await AdminService.resolveComplaint(selectedTicket.uuid, resolutionNotes.trim());
      setShowResolveModal(false);
      setSelectedTicket(null);
      setResolutionNotes('');
      loadComplaints();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Resolution failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      setProcessing(true);
      await AdminService.updateComplaintStatus(selectedTicket.uuid, newStatus);
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus as any } : null);
      loadComplaints();
    } catch (e) {
      console.error('Status update failed', e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            SAFETY, DISPUTES & COMPLAINT CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-1">Investigate customer disputes, vehicle return damage claims, driver safety incidents, and arbitrate resolutions</p>
        </div>

        <button
          onClick={loadComplaints}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto w-fit">
        {[
          { id: 'open', label: 'Open Tickets', count: statusCounts.open },
          { id: 'under_investigation', label: 'Under Investigation', count: statusCounts.under_investigation },
          { id: 'resolved', label: 'Resolved Tickets', count: statusCounts.resolved },
          { id: 'all', label: 'All Tickets', count: statusCounts.all },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${activeTab === tab.id ? 'bg-rose-900 text-white' : 'bg-slate-800 text-slate-300'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-rose-400" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="font-bold text-slate-200">No complaints found in this category.</p>
          <p className="text-slate-500">Platform disputes and incident tickets will appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Ticket / Subject</th>
                  <th className="p-3.5">Complainant</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Created</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {complaints.map(c => (
                  <tr key={c.uuid} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] font-bold text-rose-400">{c.ticket_number}</span>
                        <p className="font-bold text-white text-xs">{c.title}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-200 font-medium">
                        {c.user ? `${c.user.first_name} ${c.user.last_name}` : 'User'}
                      </p>
                      <p className="text-[11px] text-slate-500">{c.user?.email}</p>
                    </td>
                    <td className="p-3.5 capitalize text-slate-300">
                      {c.category?.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        c.priority === 'critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : c.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : c.status === 'under_investigation'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {c.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedTicket(c)}
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

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-400">{selectedTicket.ticket_number}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-black uppercase ${
                      selectedTicket.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {selectedTicket.priority} Priority
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mt-0.5">{selectedTicket.title}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Incident Description</span>
                <p className="text-slate-200 leading-relaxed">{selectedTicket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Complainant</span>
                  <p className="font-bold text-slate-200">{selectedTicket.user?.first_name} {selectedTicket.user?.last_name}</p>
                  <p className="text-[11px] text-slate-400">{selectedTicket.user?.email}</p>
                  <p className="text-[11px] text-slate-400">{selectedTicket.user?.phone || 'No phone'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Status & Assignment</span>
                  <p className="font-bold text-white capitalize">{selectedTicket.status?.replace(/_/g, ' ')}</p>
                  <p className="text-[11px] text-slate-400">
                    Assigned: {selectedTicket.assigned_admin ? `${selectedTicket.assigned_admin.first_name} ${selectedTicket.assigned_admin.last_name}` : 'Unassigned'}
                  </p>
                </div>
              </div>

              {selectedTicket.resolution_notes && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Resolution Notes</span>
                  <p className="text-slate-200">{selectedTicket.resolution_notes}</p>
                  <p className="text-[10px] text-emerald-400">Resolved at: {new Date(selectedTicket.resolved_at!).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Footer / Actions */}
            <div className="p-5 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {selectedTicket.status !== 'under_investigation' && (
                  <button
                    onClick={() => handleStatusChange('under_investigation')}
                    disabled={processing}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs"
                  >
                    Set Under Investigation
                  </button>
                )}
                {selectedTicket.status !== 'resolved' && (
                  <button
                    onClick={() => setShowResolveModal(true)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow"
                  >
                    Resolve & Close Ticket
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white">Resolve Dispute Ticket</h3>
            {errorMsg && <p className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs">{errorMsg}</p>}
            <p className="text-xs text-slate-300">Document the resolution decision, refund action, or warning issued to the involved parties.</p>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Resolution Summary (Required)</label>
              <textarea
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                rows={4}
                placeholder="Enter final resolution details..."
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowResolveModal(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs">
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={processing}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
              >
                {processing ? 'Processing...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}