import React from 'react';
import { Calendar, Search, Eye, CheckCircle, XCircle, Truck, Flag, Car, User, Filter } from 'lucide-react';
import { BookingService, BookingRow } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import Pagination from '../../components/common/Pagination';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-700',
  driver_assigned: 'bg-blue-100 text-blue-800',
  trip_started: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-emerald-100 text-emerald-800',
};

export default function BookingManagement() {
  const { user } = useAuth();
  const [bookings, setBookings] = React.useState<BookingRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<BookingRow | null>(null);
  const perPage = 20;

  const load = React.useCallback(async (status: string, s: string, p: number) => {
    setLoading(true);
    try {
      const { data, count } = await BookingService.listAll({
        status: status !== 'all' ? status : undefined,
        search: s || undefined,
        page: p, per_page: perPage,
      });
      setBookings(data);
      setTotal(count);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(statusFilter, search, page); }, [statusFilter, search, page, load]);

  const updateStatus = async (id: string, status: string) => {
    if (!user) return;
    try {
      await BookingService.updateStatus(id, status, status === 'approved' ? { approved_by: user.id, approved_at: new Date().toISOString() } : {});
      load(statusFilter, search, page);
      setSelected(null);
    } catch { /* ignore */ }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-gray-500 text-sm">{total} total</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search by service, pickup location..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">All Status</option>
          {['pending','approved','driver_assigned','trip_started','completed','rejected','cancelled'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12"><Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" /><p className="text-gray-500">No bookings found</p></div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">ID</th>
                  <th className="text-left p-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left p-3 font-medium text-gray-600">Service</th>
                  <th className="text-left p-3 font-medium text-gray-600">Dates</th>
                  <th className="text-left p-3 font-medium text-gray-600">Amount</th>
                  <th className="text-left p-3 font-medium text-gray-600">Status</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-500 text-xs">#{b.id.slice(0,8).toUpperCase()}</td>
                    <td className="p-3">
                      <div>{b.user ? `${b.user.first_name} ${b.user.last_name}` : '-'}</div>
                      <div className="text-xs text-gray-400">{b.user?.email}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1.5">
                        {b.booking_type === 'vehicle' ? <Car className="h-3.5 w-3.5 text-gray-400" /> : <User className="h-3.5 w-3.5 text-gray-400" />}
                        <span className="font-medium">{b.target_name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{new Date(b.start_date).toLocaleDateString()} – {new Date(b.end_date).toLocaleDateString()}</td>
                    <td className="p-3 font-medium text-blue-600">{b.total_amount > 0 ? `LKR ${b.total_amount.toLocaleString()}` : '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[b.status]}`}>{b.status.replace('_', ' ')}</span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => setSelected(b)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="h-4 w-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(total / perPage)} onPageChange={setPage} />
        </>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Booking #{selected.id.slice(0,8).toUpperCase()}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-xl mb-4">
              {[['Status', selected.status.replace('_', ' ')], ['Type', selected.booking_type], ['Service', selected.target_name], ['Dates', `${new Date(selected.start_date).toLocaleDateString()} – ${new Date(selected.end_date).toLocaleDateString()}`], ['Pickup', selected.pickup_location], ['Drop-off', selected.dropoff_location], ['Passengers', selected.passenger_count], ['Amount', `LKR ${selected.total_amount.toLocaleString()}`]].map(([l, v]) => (
                <div key={l}><p className="text-gray-500 text-xs">{l}</p><p className="font-medium capitalize">{v}</p></div>
              ))}
            </div>
            {selected.user && <div className="bg-blue-50 p-3 rounded-xl mb-4 text-sm"><p className="font-medium">{selected.user.first_name} {selected.user.last_name}</p><p className="text-gray-600">{selected.user.email}</p></div>}
            {selected.notes && <p className="text-sm mb-4"><span className="font-medium">Notes:</span> {selected.notes}</p>}
            <div className="flex flex-wrap gap-2">
              {selected.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(selected.id, 'approved')} className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"><CheckCircle className="h-4 w-4" /><span>Approve</span></button>
                  <button onClick={() => updateStatus(selected.id, 'rejected')} className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"><XCircle className="h-4 w-4" /><span>Reject</span></button>
                </>
              )}
              {selected.status === 'approved' && (
                <button onClick={() => updateStatus(selected.id, 'trip_started')} className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"><Truck className="h-4 w-4" /><span>Start Trip</span></button>
              )}
              {selected.status === 'trip_started' && (
                <button onClick={() => updateStatus(selected.id, 'completed')} className="flex items-center space-x-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"><Flag className="h-4 w-4" /><span>Complete Trip</span></button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
