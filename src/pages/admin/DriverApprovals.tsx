import React from 'react';
import { Users, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { DriverService, DriverProfileRow } from '../../services/driverService';
import { useAuth } from '../../contexts/AuthContext';

const placeholder = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80';

export default function DriverApprovals() {
  const { user } = useAuth();
  const [drivers, setDrivers] = React.useState<DriverProfileRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<DriverProfileRow | null>(null);
  const [rejectId, setRejectId] = React.useState('');
  const [rejectReason, setRejectReason] = React.useState('');
  const [suspendId, setSuspendId] = React.useState('');
  const [suspendReason, setSuspendReason] = React.useState('');
  const [processing, setProcessing] = React.useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await DriverService.list({ approval_status: 'pending', per_page: 50 });
      setDrivers(data);
    } catch {
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    if (!user) return;
    setProcessing(id);
    try {
      await DriverService.approve(id, user.id);
      setDrivers(ds => ds.filter(d => d.id !== id));
      setSelected(null);
    } catch { /* ignore */ } finally { setProcessing(''); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) return;
    setProcessing(rejectId);
    try {
      await DriverService.reject(rejectId, rejectReason);
      setDrivers(ds => ds.filter(d => d.id !== rejectId));
      setRejectId(''); setRejectReason(''); setSelected(null);
    } catch { /* ignore */ } finally { setProcessing(''); }
  };

  const suspend = async () => {
    if (!suspendReason.trim()) return;
    setProcessing(suspendId);
    try {
      await DriverService.suspend(suspendId, suspendReason);
      setDrivers(ds => ds.filter(d => d.id !== suspendId));
      setSuspendId(''); setSuspendReason(''); setSelected(null);
    } catch { /* ignore */ } finally { setProcessing(''); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">{drivers.length} pending driver{drivers.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={load} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2">
          <Clock className="h-4 w-4" /><span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="mx-auto h-14 w-14 text-gray-300 mb-4" />
          <p className="text-gray-500">No pending driver approvals</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drivers.map(d => {
            const name = d.user ? `${d.user.first_name} ${d.user.last_name}` : 'Unknown';
            return (
              <div key={d.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-start space-x-4 mb-4">
                  <img src={d.profile_photo || placeholder} alt={name} className="h-14 w-14 rounded-full object-cover border border-gray-200" onError={e => { (e.target as HTMLImageElement).src = placeholder; }} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500">License: {d.license_number}</p>
                    <p className="text-sm text-gray-500">{d.experience_years} years experience</p>
                    {d.nearest_town && <p className="text-xs text-gray-400">{d.nearest_town}</p>}
                  </div>
                </div>
                {d.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {d.specialties.slice(0, 3).map(s => <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>)}
                  </div>
                )}
                <div className="flex space-x-2">
                  <button onClick={() => setSelected(d)} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => approve(d.id)} disabled={processing === d.id} className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60">
                    <CheckCircle className="h-4 w-4" /><span>Approve</span>
                  </button>
                  <button onClick={() => setRejectId(d.id)} className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    <XCircle className="h-4 w-4" /><span>Reject</span>
                  </button>
                  <button onClick={() => setSuspendId(d.id)} title="Suspend" className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors">⊘</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Driver Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <img src={selected.profile_photo || placeholder} alt="profile" className="h-20 w-20 rounded-full object-cover border-2 border-gray-200" onError={e => { (e.target as HTMLImageElement).src = placeholder; }} />
              <div>
                <h3 className="text-xl font-bold">{selected.user ? `${selected.user.first_name} ${selected.user.last_name}` : 'Unknown'}</h3>
                {selected.user?.email && <p className="text-gray-500 text-sm">{selected.user.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              {[['License', selected.license_number], ['Experience', `${selected.experience_years} years`], ['Phone', selected.phone || '-'], ['Town', selected.nearest_town || '-'], ['Address', selected.address || '-']].map(([l, v]) => (
                <div key={l}><p className="text-gray-500 text-xs">{l}</p><p className="font-medium">{v}</p></div>
              ))}
            </div>
            {selected.specialties?.length > 0 && (
              <div className="mb-4"><p className="text-xs text-gray-500 mb-2">Specialties</p><div className="flex flex-wrap gap-1.5">{selected.specialties.map(s => <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>)}</div></div>
            )}
            <div className="flex space-x-3">
              <button onClick={() => approve(selected.id)} disabled={processing === selected.id} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5" /><span>Approve</span>
              </button>
              <button onClick={() => { setRejectId(selected.id); setSelected(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                <XCircle className="h-5 w-5" /><span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Rejection Reason</h3>
            <textarea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Explain the rejection reason..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4" />
            <div className="flex space-x-3">
              <button onClick={() => { setRejectId(''); setRejectReason(''); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={reject} disabled={!rejectReason.trim() || processing === rejectId} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-60">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Suspend Driver</h3>
            <textarea rows={4} value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Reason for suspension..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4" />
            <div className="flex space-x-3">
              <button onClick={() => { setSuspendId(''); setSuspendReason(''); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={suspend} disabled={!suspendReason.trim() || processing === suspendId} className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 disabled:opacity-60">Suspend</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
