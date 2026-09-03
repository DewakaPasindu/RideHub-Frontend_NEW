import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Star, Eye, Plus, Car, User, CheckCircle,
  XCircle, AlertCircle, Truck, Shield, Phone, Mail, Navigation,
  ChevronRight, AlertTriangle
} from 'lucide-react';
import { BookingService, BookingRow } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import Pagination from '../../components/common/Pagination';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Waiting for Owner',
    color: 'bg-amber-100 text-amber-800 border border-amber-200',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  approved: {
    label: 'Confirmed by Owner',
    color: 'bg-blue-100 text-blue-800 border border-blue-200',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  active: {
    label: 'Trip In Progress',
    color: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    icon: <Truck className="h-3.5 w-3.5 animate-pulse" />,
  },
  trip_started: {
    label: 'Trip In Progress',
    color: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    icon: <Truck className="h-3.5 w-3.5 animate-pulse" />,
  },
  completed: {
    label: 'Trip Completed',
    color: 'bg-green-100 text-green-800 border border-green-200',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  rejected: {
    label: 'Declined by Owner',
    color: 'bg-red-100 text-red-800 border border-red-200',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-700 border border-gray-200',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const TIMELINE_STEPS = [
  { key: 'pending', label: '1. Requested' },
  { key: 'approved', label: '2. Owner Confirmed' },
  { key: 'active', label: '3. On Trip' },
  { key: 'completed', label: '4. Completed' },
];

function getTimelineIndex(status: string): number {
  switch (status) {
    case 'pending': return 0;
    case 'approved': return 1;
    case 'active':
    case 'trip_started': return 2;
    case 'completed': return 3;
    default: return -1;
  }
}

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
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState((location.state as { success?: string })?.success || '');

  const perPage = 10;

  const load = React.useCallback(async (status: string, p: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, count } = await BookingService.listForUser(user.id, {
        status: status !== 'all' ? status : undefined,
        page: p, per_page: perPage,
      });
      setBookings(data || []);
      setTotal(count || 0);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => { load(filter, page); }, [filter, page, load]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking request?')) return;
    setCancellingId(id);
    try {
      await BookingService.cancel(id);
      setSuccessMsg('Booking cancelled successfully.');
      load(filter, page);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Confirmed' },
    { key: 'active', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'rejected', label: 'Declined' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-green-500 hover:text-green-700">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-xs text-gray-500 mt-1">Track and manage your Vehicle + Driver bookings and rentals</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/owner/rental-requests"
            className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 px-3.5 py-2 rounded-xl transition-colors text-xs font-bold shadow-xs"
          >
            <Car className="h-3.5 w-3.5 text-blue-600" />
            <span>Owner Portal</span>
          </Link>
          <Link
            to="/customer/rentals"
            className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 px-3.5 py-2 rounded-xl transition-colors text-xs font-bold shadow-xs"
          >
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <span>Self-Drive Rentals</span>
          </Link>
          <button onClick={() => navigate('/vehicles')} className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl transition-colors text-xs font-bold shadow-xs">
            <Plus className="h-3.5 w-3.5" /><span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-1 min-w-max pb-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setFilter(tab.key); setPage(1); }}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                filter === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-400">
          <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-700">No {filter !== 'all' ? filter : ''} bookings found.</p>
          <p className="text-xs text-gray-400 mt-1">Book vehicles with dedicated drivers to have your trips listed here.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map(b => {
              const cfg = STATUS_CONFIG[b.status] || {
                label: b.status,
                color: 'bg-gray-100 text-gray-700',
                icon: <AlertCircle className="h-3.5 w-3.5" />,
              };
              const timelineIdx = getTimelineIndex(b.status);
              const isTerminated = b.status === 'cancelled' || b.status === 'rejected';

              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        {b.booking_type === 'vehicle' ? (
                          <Car className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <User className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        )}
                        <h3 className="font-bold text-gray-900 text-base">{b.target_name}</h3>
                        {b.vehicle?.vehicle_number && (
                          <span className="font-mono text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold">
                            {b.vehicle.vehicle_number}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Booking Ref: #{b.id.slice(0, 8).toUpperCase()}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                        {cfg.icon}
                        <span>{cfg.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Dedicated driver badge */}
                  {b.booking_type === 'vehicle' && (
                    <div className="mb-3 inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                      <Shield className="h-3 w-3 text-emerald-600" />
                      <span>Dedicated Driver Included — Assigned by vehicle owner</span>
                    </div>
                  )}

                  {/* Grid details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs text-gray-600 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">Dates & Time</span>
                        <span className="font-medium text-gray-800">
                          {new Date(b.start_date).toLocaleDateString()} {b.start_time || '09:00'} &rarr; {new Date(b.end_date).toLocaleDateString()} {b.end_time || '18:00'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">Pickup Location</span>
                        <span className="font-medium text-gray-800 truncate block max-w-[200px]">{b.pickup_location}</span>
                      </div>
                    </div>

                    {b.dropoff_location && (
                      <div className="flex items-center space-x-2">
                        <Navigation className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-gray-400">Drop-off Location</span>
                          <span className="font-medium text-gray-800 truncate block max-w-[200px]">{b.dropoff_location}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status-specific progress guidance */}
                  {b.status === 'pending' && (
                    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2.5">
                      <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0 animate-pulse" />
                      <div>
                        <span className="font-bold">Awaiting Owner Confirmation: </span>
                        <span>Your request has been forwarded to the vehicle owner. The owner will review your dates and confirm the vehicle and driver.</span>
                      </div>
                    </div>
                  )}

                  {b.status === 'approved' && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start space-x-2.5">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-bold">Booking Confirmed by Owner! </span>
                        <span>Your vehicle and dedicated driver are locked in for your scheduled trip.</span>
                        {b.vehicle?.owner && (
                          <div className="mt-2 pt-2 border-t border-blue-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-blue-800">
                            <span>Owner: <strong>{b.vehicle.owner.name}</strong></span>
                            {b.vehicle.owner.phone && (
                              <span className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-blue-600" />
                                <strong>{b.vehicle.owner.phone}</strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(b.status === 'active' || b.status === 'trip_started') && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start space-x-2.5">
                      <Truck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0 animate-bounce" />
                      <div>
                        <span className="font-bold">Trip Currently In Progress: </span>
                        <span>Your journey is underway with your assigned driver. The owner will conclude the booking upon destination arrival.</span>
                      </div>
                    </div>
                  )}

                  {b.status === 'rejected' && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 flex items-start space-x-2.5">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Booking Declined by Owner: </span>
                        <span>{b.rejection_reason || 'Vehicle was unavailable on the selected dates.'}</span>
                      </div>
                    </div>
                  )}

                  {/* Timeline bar (only for active progression) */}
                  {!isTerminated && (
                    <div className="mb-4 px-2 py-1">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-2.5 h-0.5 bg-gray-200 w-full -z-0" />
                        <div
                          className="absolute left-0 top-2.5 h-0.5 bg-blue-600 transition-all duration-500 -z-0"
                          style={{ width: `${(Math.max(0, timelineIdx) / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                        />
                        {TIMELINE_STEPS.map((step, i) => {
                          const isDone = timelineIdx >= i;
                          const isCurrent = timelineIdx === i;
                          return (
                            <div key={step.key} className="flex flex-col items-center relative z-10">
                              <div
                                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                  isDone ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                                } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}
                              >
                                {isDone ? '✓' : i + 1}
                              </div>
                              <span className={`text-[10px] mt-1.5 font-bold ${isDone ? 'text-blue-900' : 'text-gray-400'}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bottom Financials & Actions */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400">Total Price: </span>
                      <span className="text-base font-black text-blue-700">LKR {b.total_amount?.toLocaleString()}</span>
                      <span className="text-[11px] text-gray-400 ml-2">Booked on {new Date(b.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelected(b)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Details</span>
                      </button>

                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={cancellingId === b.id}
                          className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors"
                        >
                          {cancellingId === b.id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      )}

                      {b.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/reviews/new?booking=${b.id}&type=${b.booking_type}&target=${b.vehicle_id || b.driver_profile_id}&name=${encodeURIComponent(b.target_name)}`)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>Rate & Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination currentPage={page} totalPages={Math.ceil(total / perPage)} onPageChange={setPage} />
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Booking Summary</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Service:</span>
                  <span className="font-bold text-gray-900">{selected.target_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${STATUS_CONFIG[selected.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {STATUS_CONFIG[selected.status]?.label || selected.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Price:</span>
                  <span className="font-black text-blue-700 text-sm">LKR {selected.total_amount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Dedicated driver notice */}
              {selected.booking_type === 'vehicle' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                  <span className="font-bold block text-emerald-800">Dedicated Driver Included</span>
                  <span className="text-[11px]">A professional driver is provided directly by the vehicle owner for this entire rental.</span>
                </div>
              )}

              {/* Owner info */}
              {selected.vehicle?.owner && (
                <div className="border border-gray-100 p-3.5 rounded-xl space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Vehicle Owner Details</span>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-bold text-gray-800">{selected.vehicle.owner.name}</span>
                  </div>
                  {selected.vehicle.owner.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-bold text-gray-800">{selected.vehicle.owner.phone}</span>
                    </div>
                  )}
                  {selected.vehicle.owner.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium text-gray-800">{selected.vehicle.owner.email}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Route & Schedule */}
              <div className="border border-gray-100 p-3.5 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Trip Schedule & Locations</span>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dates:</span>
                  <span className="font-semibold text-gray-800">{selected.start_date} &rarr; {selected.end_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span className="font-semibold text-gray-800">{selected.start_time || '09:00'} – {selected.end_time || '18:00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pickup:</span>
                  <span className="font-semibold text-gray-800">{selected.pickup_location}</span>
                </div>
                {selected.dropoff_location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Drop-off:</span>
                    <span className="font-semibold text-gray-800">{selected.dropoff_location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Passengers:</span>
                  <span className="font-semibold text-gray-800">{selected.passenger_count || 1}</span>
                </div>
                {selected.ac_preference && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">AC Preference:</span>
                    <span className="font-semibold text-gray-800 capitalize">{selected.ac_preference}</span>
                  </div>
                )}
              </div>

              {selected.notes && (
                <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">Your Special Notes</span>
                  <p className="text-amber-900">{selected.notes}</p>
                </div>
              )}

              {selected.rejection_reason && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                  <span className="text-[10px] uppercase font-bold text-red-800 block mb-1">Decline Reason</span>
                  <p className="text-red-900">{selected.rejection_reason}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
