import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserX,
  UserCheck,
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
  X,
} from 'lucide-react';
import { AdminService } from '../../../services/api/admin.service';

export default function UserManagementCenter() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status Change Dialog
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'suspended'>('suspended');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 50 };
      if (filterRole !== 'all') params.role = filterRole;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await AdminService.getUsers(params);
      setUsers(res.data || []);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  const handleStatusChange = async () => {
    if (!selectedUser || !reason.trim()) {
      setErrorMsg('A specific administrative reason is required.');
      return;
    }
    try {
      setProcessing(true);
      setErrorMsg('');
      await AdminService.updateUserStatus(selectedUser.uuid, targetStatus, reason.trim());
      setSelectedUser(null);
      setReason('');
      loadUsers();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            PLATFORM USER DIRECTORY & ACCESS CONTROL
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage platform accounts across customers, verified drivers, fleet partners, and administrators</p>
        </div>

        <button
          onClick={loadUsers}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Role Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'Customer', label: 'Customers' },
            { id: 'Driver', label: 'Drivers' },
            { id: 'Vehicle Owner', label: 'Vehicle Owners' },
            { id: 'Admin', label: 'Admins' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                filterRole === tab.id ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadUsers()}
            placeholder="Search name, email, phone..."
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
          />
          <button onClick={loadUsers} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200">
            Search
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="font-bold text-slate-200">No users found matching filter.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Assigned Roles</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Joined Date</th>
                  <th className="p-3.5 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {users.map(u => (
                  <tr key={u.uuid} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                          {u.first_name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{u.first_name} {u.last_name}</p>
                          <p className="font-mono text-[10px] text-slate-500">{u.uuid.substring(0, 13)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-200">{u.email}</p>
                      <p className="text-[11px] text-slate-500">{u.phone || 'No phone'}</p>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r: any) => (
                          <span
                            key={r.id || r.name}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              r.name === 'Admin' || r.name === 'Super Admin'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : r.name === 'Driver'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : r.name === 'Vehicle Owner'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      {u.status === 'active' ? (
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setTargetStatus('suspended');
                            setReason('');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setTargetStatus('active');
                            setReason('');
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Activate</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suspension / Activation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white capitalize flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>{targetStatus === 'suspended' ? 'Suspend User Access' : 'Reactivate User Account'}</span>
            </h3>

            {errorMsg && (
              <p className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs">{errorMsg}</p>
            )}

            <p className="text-xs text-slate-300">
              Target account: <span className="font-bold text-white">{selectedUser.first_name} {selectedUser.last_name}</span> ({selectedUser.email}).
              {targetStatus === 'suspended'
                ? ' Suspending this account prevents all login sessions, active driver dispatches, and rental bookings.'
                : ' Reactivating this account restores full platform privileges.'}
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Audit Reason (Mandatory)
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="Enter justification for compliance audit..."
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setSelectedUser(null); setReason(''); setErrorMsg(''); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={processing}
                className={`px-4 py-1.5 rounded-lg font-black text-xs transition-colors ${
                  targetStatus === 'suspended'
                    ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {processing ? 'Submitting...' : `Confirm ${targetStatus === 'suspended' ? 'Suspension' : 'Activation'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}