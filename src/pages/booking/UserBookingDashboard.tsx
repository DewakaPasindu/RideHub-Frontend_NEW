import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Clock, Star, Eye, Plus, Car, User, CheckCircle, XCircle, AlertCircle, Truck } from 'lucide-react';
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

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <AlertCircle className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
  driver_assigned: <User className="h-4 w-4" />,
  trip_started: <Truck className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
};

const TIMELINE = ['pending', 'approved', 'driver_assigned', 'trip_started', 'completed'];

export default function UserBookingDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [bookings, setBookings] = React.useState<BookingRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<BookingRow | null>(null);
  const [successMsg] = React.useState((location.state as { success?: string })?.success || '');

  const perPage = 10;

  const load = React.useCallback(async (status: string, p: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, count } = await BookingService.listForUser(user.id, {
        status: status !== 'all' ? status : undefined,
        page: p, per_page: perPage,
      });
      setBookings(data);
      setTotal(count);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => { load(filter, page); }, [filter, page, load]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await BookingService.cancel(id);
      load(filter, page);
    } catch { /* ignore */ }
  };

  const tabs = ['all', 'pending', 'approved', 'driver_assigned', 'trip_started', 'completed', 'cancelled', 'rejected'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{successMsg}</div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <button onClick={() => navigate('/vehicles')} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" /><span>New Booking</span>
        </button>
      </div>

      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-1 min-w-max pb-0">
          {tabs.map(tab => (
            <button key={tab} onClick={() => { setFilter(tab); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${filter === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'all' ? 'All' : tab.replace('_', ' ')}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="mx-auto h-14 w-14 text-gray-300 mb-4" />
          <p className="text-gray-500">No {filter !== 'all' ? filter : ''} bookings found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        {b.booking_type === 'vehicle' ? <Car className="h-4 w-4 text-blue-600" /> : <User className="h-4 w-4 text-blue-600" />}
                        <h3 className="font-semibold text-gray-900">{b.target_name}</h3>
                      </div>
                      <p className="text-xs text-gray-500">#{b.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_ICONS[b.status]}
                        <span>{b.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1.5"><Calendar className="h-4 w-4 text-gray-400" /><span>{new Date(b.start_date).toLocaleDateString()} – {new Date(b.end_date).toLocaleDateString()}</span></div>
                    <div className="flex items-center space-x-1.5"><Clock className="h-4 w-4 text-gray-400" /><span>{b.start_time} – {b.end_time}</span></div>
                    <div className="flex items-center space-x-1.5"><MapPin className="h-4 w-4 text-gray-400" /><span className="truncate">{b.pickup_location}</span></div>
                  </div>

                  {/* Timeline bar */}
                  <div className="mb-4 hidden sm:block">
                    <div className="flex items-center">
                      {TIMELINE.map((step, i) => (
                        <React.Fragment key={step}>
                          <div className={`flex flex-col items-center ${i < TIMELINE.length - 1 ? 'flex-1' : ''}`}>
                            <div className={`h-2 w-2 rounded-full ${TIMELINE.indexOf(b.status) >= i ? 'bg-blue-600' : 'bg-gray-300'}`} />
                            <span className="text-xs text-gray-400 mt-1 capitalize hidden md:block">{step.replace('_', ' ')}</span>
                          </div>
                          {i < TIMELINE.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${TIMELINE.indexOf(b.status) > i ? 'bg-blue-600' : 'bg-gray-200'}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {b.total_amount > 0 && <span className="font-bold text-blue-600">LKR {b.total_amount.toLocaleString()}</span>}
                      <span className="text-xs text-gray-400 ml-2">{new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => setSelected(b)} className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye className="h-4 w-4" /><span>Details</span>
                      </button>
                      {(b.status === 'pending' || b.status === 'approved') && (
                        <button onClick={() => handleCancel(b.id)} className="px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors">Cancel</button>
                      )}
                      {b.status === 'completed' && (
                        <button onClick={() => navigate(`/reviews/new?booking=${b.id}&type=${b.booking_type}&target=${b.vehicle_id || b.driver_profile_id}&name=${encodeURIComponent(b.target_name)}`)} className="flex items-center space-x-1 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg hover:bg-amber-100 transition-colors">
                          <Star className="h-4 w-4" /><span>Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(total / perPage)} onPageChange={setPage} />
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl">
                  <div><p className="text-gray-500">Booking ID</p><p className="font-medium">#{selected.id.slice(0, 8).toUpperCase()}</p></div>
                  <div><p className="text-gray-500">Status</p><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[selected.status]}`}>{selected.status.replace('_', ' ')}</span></div>
                  <div><p className="text-gray-500">Type</p><p className="font-medium capitalize">{selected.booking_type}</p></div>
                  <div><p className="text-gray-500">Service</p><p className="font-medium">{selected.target_name}</p></div>
                  <div><p className="text-gray-500">Dates</p><p className="font-medium">{new Date(selected.start_date).toLocaleDateString()} – {new Date(selected.end_date).toLocaleDateString()}</p></div>
                  <div><p className="text-gray-500">Time</p><p className="font-medium">{selected.start_time} – {selected.end_time}</p></div>
                  <div><p className="text-gray-500">Pickup</p><p className="font-medium">{selected.pickup_location}</p></div>
                  <div><p className="text-gray-500">Drop-off</p><p className="font-medium">{selected.dropoff_location}</p></div>
                  {selected.total_amount > 0 && <div><p className="text-gray-500">Total Amount</p><p className="font-bold text-blue-600">LKR {selected.total_amount.toLocaleString()}</p></div>}
                  <div><p className="text-gray-500">Booked On</p><p className="font-medium">{new Date(selected.created_at).toLocaleString()}</p></div>
                </div>
                {selected.notes && <div className="bg-gray-50 p-3 rounded-xl"><p className="text-gray-500 text-xs mb-1">Notes</p><p>{selected.notes}</p></div>}
                {selected.rejection_reason && <div className="bg-red-50 p-3 rounded-xl"><p className="text-red-500 text-xs mb-1">Rejection Reason</p><p className="text-red-700">{selected.rejection_reason}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
