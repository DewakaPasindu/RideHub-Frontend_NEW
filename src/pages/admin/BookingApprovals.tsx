import React from 'react';
import { Calendar, CheckCircle, XCircle, Eye, User, Car, Clock, Truck } from 'lucide-react';
import { BookingService, BookingRow } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-700',
  driver_assigned: 'bg-blue-100 text-blue-800',
  trip_started: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-emerald-100 text-emerald-800',
};

export default function BookingApprovals() {
  const { user } = useAuth();
  const [bookings, setBookings] = React.useState<BookingRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<BookingRow | null>(null);
  const [rejectId, setRejectId] = React.useState('');
  const [rejectReason, setRejectReason] = React.useState('');
  const [processing, setProcessing] = React.useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await BookingService.listAll({ status: 'pending', per_page: 50 });
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    if (!user) return;
    setProcessing(id);
    try {
      await BookingService.approve(id, user.id);
      setBookings(bs => bs.filter(b => b.id !== id));
      setSelected(null);
    } catch { /* ignore */ } finally { setProcessing(''); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) return;
    setProcessing(rejectId);
    try {
      await BookingService.reject(rejectId, rejectReason);
      setBookings(bs => bs.filter(b => b.id !== rejectId));
      setRejectId(''); setRejectReason(''); setSelected(null);
    } catch { /* ignore */ } finally { setProcessing(''); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} pending booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={load} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2">
          <Clock className="h-4 w-4" /><span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="mx-auto h-14 w-14 text-gray-300 mb-4" />
          <p className="text-gray-500">No pending booking approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-0.5">
                    {b.booking_type === 'vehicle' ? <Car className="h-4 w-4 text-blue-600" /> : <User className="h-4 w-4 text-blue-600" />}
                    <h3 className="font-semibold text-gray-900">{b.target_name}</h3>
                  </div>
                  <p className="text-xs text-gray-500">#{b.id.slice(0, 8).toUpperCase()} · {b.user ? `${b.user.first_name} ${b.user.last_name}` : 'Unknown user'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status]}`}>{b.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-4">
                <span>{new Date(b.start_date).toLocaleDateString()} – {new Date(b.end_date).toLocaleDateString()}</span>
                <span className="truncate">{b.pickup_location}</span>
                {b.total_amount > 0 && <span className="font-medium text-blue-600">LKR {b.total_amount.toLocaleString()}</span>}
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setSelected(b)} className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  <Eye className="h-4 w-4" /><span>Details</span>
                </button>
                <button onClick={() => approve(b.id)} disabled={processing === b.id} className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60">
                  <CheckCircle className="h-4 w-4" /><span>Approve</span>
                </button>
                <button onClick={() => setRejectId(b.id)} className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                  <XCircle className="h-4 w-4" /><span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Booking Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-xl mb-4">
              {[['ID', `#${selected.id.slice(0,8).toUpperCase()}`], ['Status', selected.status], ['Type', selected.booking_type], ['Service', selected.target_name], ['Dates', `${new Date(selected.start_date).toLocaleDateString()} – ${new Date(selected.end_date).toLocaleDateString()}`], ['Time', `${selected.start_time} – ${selected.end_time}`], ['Pickup', selected.pickup_location], ['Drop-off', selected.dropoff_location], ['Passengers', selected.passenger_count], ['Total', `LKR ${selected.total_amount.toLocaleString()}`]].map(([l, v]) => (
                <div key={l}><p className="text-gray-500 text-xs">{l}</p><p className="font-medium">{v}</p></div>
              ))}
            </div>
            {selected.user && (
              <div className="bg-blue-50 p-3 rounded-xl mb-4 text-sm">
                <p className="font-medium text-blue-900">{selected.user.first_name} {selected.user.last_name}</p>
                <p className="text-blue-700">{selected.user.email} · {selected.user.mobile_number || '-'}</p>
              </div>
            )}
            {selected.notes && <p className="text-sm text-gray-600 mb-4"><span className="font-medium">Notes:</span> {selected.notes}</p>}
            <div className="flex space-x-3">
              <button onClick={() => approve(selected.id)} disabled={processing === selected.id} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5" /><span>Approve</span>
              </button>
              <button onClick={() => { setRejectId(selected.id); setSelected(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                <XCircle className="h-5 w-5" /><span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Rejection Reason</h3>
            <textarea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Explain why this booking is being rejected..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4" />
            <div className="flex space-x-3">
              <button onClick={() => { setRejectId(''); setRejectReason(''); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={reject} disabled={!rejectReason.trim() || processing === rejectId} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-60">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
