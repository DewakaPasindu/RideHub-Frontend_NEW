import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, User, Car, ShieldAlert, CheckCircle, Clock, MapPin,
  Phone, Mail, Check, X, Eye, AlertCircle, Sparkles, Navigation,
  DollarSign, Play, Flag
} from 'lucide-react';
import { RentalService, RentalApplication } from '../../services/api/rental.service';
import { BookingService } from '../../services/api/booking.service';
import type { Booking } from '../../services/api/types';

export default function OwnerRentalRequests() {
  const [activeTab, setActiveTab] = useState<'with_driver' | 'self_drive'>('with_driver');

  // Self-drive state
  const [rentalRequests, setRentalRequests] = useState<RentalApplication[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(true);

  // Vehicle + driver bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingFilter, setBookingFilter] = useState('all');

  // Common error / action states
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadSelfDriveRequests = async () => {
    try {
      setLoadingRentals(true);
      const data = await RentalService.getOwnerRequests();
      setRentalRequests(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load self-drive rental requests.");
    } finally {
      setLoadingRentals(false);
    }
  };

  const loadVehicleBookings = async () => {
    try {
      setLoadingBookings(true);
      const { data } = await BookingService.listForOwner();
      setBookings(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load vehicle bookings.");
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadVehicleBookings();
    loadSelfDriveRequests();
  }, []);

  const handleApproveBooking = async (uuid: string) => {
    setActionLoading(uuid);
    setActionSuccess(null);
    setError(null);
    try {
      await BookingService.ownerApprove(uuid);
      setActionSuccess('Booking approved successfully! The customer has been notified.');
      await loadVehicleBookings();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to approve booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (uuid: string) => {
    setActionLoading(uuid);
    setActionSuccess(null);
    setError(null);
    try {
      await BookingService.ownerReject(uuid, rejectionReason || 'Rejected by vehicle owner.');
      setActionSuccess('Booking rejected.');
      setRejectingBookingId(null);
      setRejectionReason('');
      await loadVehicleBookings();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to reject booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartTrip = async (uuid: string) => {
    setActionLoading(uuid);
    setActionSuccess(null);
    setError(null);
    try {
      await BookingService.ownerStartTrip(uuid);
      setActionSuccess('Trip started! Status updated to active.');
      await loadVehicleBookings();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to start trip.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTrip = async (uuid: string) => {
    setActionLoading(uuid);
    setActionSuccess(null);
    setError(null);
    try {
      await BookingService.ownerCompleteTrip(uuid);
      setActionSuccess('Trip marked as completed!');
      await loadVehicleBookings();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to complete trip.');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const pendingRentalsCount = rentalRequests.filter(r => r.status === 'submitted' || r.status === 'under_review').length;

  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">Pending Approval</span>;
      case 'approved':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">Approved</span>;
      case 'active':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">Trip In Progress</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">Completed</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">Rejected</span>;
      case 'cancelled':
        return <span className="bg-gray-100 text-gray-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Owner Requests & Bookings</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage customer bookings for your vehicles (Vehicle + Driver and Self-Drive rentals).
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('with_driver')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'with_driver'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="h-3.5 w-3.5" />
            <span>Vehicle + Driver Bookings</span>
            {pendingBookingsCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingBookingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('self_drive')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'self_drive'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Self-Drive Rentals</span>
            {pendingRentalsCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingRentalsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: VEHICLE + DRIVER BOOKINGS                                       */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'with_driver' && (
        <div>
          {/* Status filters */}
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2 text-xs">
            {['all', 'pending', 'approved', 'active', 'completed', 'cancelled', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setBookingFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
                  bookingFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {loadingBookings ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500">
              <div className="animate-spin h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
              <span>Loading vehicle booking requests...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400">
              <Car className="h-10 w-10 mx-auto mb-2 opacity-30 text-slate-500" />
              <p className="text-sm font-semibold">No vehicle + driver bookings found.</p>
              <p className="text-xs text-slate-400 mt-1">
                {bookingFilter !== 'all' ? `No bookings with status "${bookingFilter}".` : 'When customers book your vehicles with driver, they will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBookings.map((b) => (
                <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Car className="h-4 w-4 text-blue-600" />
                          <h3 className="font-bold text-slate-900 text-base">{b.target_name}</h3>
                        </div>
                        {b.vehicle?.vehicle_number && (
                          <span className="inline-block bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded">
                            {b.vehicle.vehicle_number}
                          </span>
                        )}
                      </div>
                      <div>
                        {getStatusBadge(b.status)}
                      </div>
                    </div>

                    {/* Customer details */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mb-3 space-y-1.5">
                      <div className="flex items-center space-x-2 text-slate-700">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-bold">{b.user?.first_name} {b.user?.last_name}</span>
                      </div>
                      {b.user?.mobile_number && (
                        <div className="flex items-center space-x-2 text-slate-600">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{b.user.mobile_number}</span>
                        </div>
                      )}
                      {b.user?.email && (
                        <div className="flex items-center space-x-2 text-slate-600">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">{b.user.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Trip details */}
                    <div className="space-y-2 text-xs text-slate-600 mb-4">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-slate-700">Pickup: </span>
                          <span>{b.pickup_location}</span>
                        </div>
                      </div>

                      {b.dropoff_location && (
                        <div className="flex items-start space-x-2">
                          <Navigation className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-slate-700">Drop-off: </span>
                            <span>{b.dropoff_location}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {new Date(b.start_date).toLocaleDateString()} {b.start_time || ''} &rarr; {new Date(b.end_date).toLocaleDateString()} {b.end_time || ''}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-500">
                        <span>👥 {b.passenger_count || 1} passenger{(b.passenger_count || 1) > 1 ? 's' : ''}</span>
                        {b.ac_preference && <span>❄️ AC: {b.ac_preference}</span>}
                      </div>

                      {b.notes && (
                        <div className="bg-amber-50/70 border border-amber-100 p-2 rounded-lg text-[11px] text-amber-800">
                          <span className="font-semibold">Note:</span> {b.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-400">Total Price:</span>
                      <span className="text-base font-black text-blue-700">
                        LKR {b.total_amount?.toLocaleString()}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                        title="View Full Booking Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveBooking(b.id)}
                            disabled={actionLoading === b.id}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => setRejectingBookingId(b.id)}
                            disabled={actionLoading === b.id}
                            className="py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {b.status === 'approved' && (
                        <button
                          onClick={() => handleStartTrip(b.id)}
                          disabled={actionLoading === b.id}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>Start Trip</span>
                        </button>
                      )}

                      {b.status === 'active' && (
                        <button
                          onClick={() => handleCompleteTrip(b.id)}
                          disabled={actionLoading === b.id}
                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                        >
                          <Flag className="h-3.5 w-3.5" />
                          <span>Complete Trip</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: SELF-DRIVE RENTAL REQUESTS                                       */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'self_drive' && (
        <div>
          {loadingRentals ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500">
              <div className="animate-spin h-7 w-7 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
              <span>Loading self-drive rental requests...</span>
            </div>
          ) : rentalRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400">
              <Car className="h-10 w-10 mx-auto mb-2 opacity-30 text-slate-500" />
              <p className="text-sm font-semibold">No self-drive rental requests logged yet.</p>
              <p className="text-xs text-slate-400 mt-1">When customers submit self-drive rental applications for your vehicles, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentalRequests.map((req) => (
                <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        req.status === 'completed' ? 'bg-green-100 text-green-700' :
                        req.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'returned' ? 'bg-indigo-100 text-indigo-700 font-bold' :
                        req.status === 'submitted' ? 'bg-amber-100 text-amber-700 font-bold' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-md font-bold text-slate-800 mb-1">
                      {req.vehicle?.make} {req.vehicle?.model}
                    </h3>
                    
                    <div className="space-y-2 mt-4 mb-6 text-xs text-slate-600">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>Customer: <strong>{req.first_name} {req.last_name}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>
                          {new Date(req.start_at).toLocaleDateString()} &rarr; {new Date(req.end_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/owner/rental-requests/${req.uuid}`}
                    className="w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    View & Review Application
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Reject Modal ─────────────────────────────────────────────────── */}
      {rejectingBookingId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Reject Booking Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              Please specify the reason for rejecting this customer booking.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g., Vehicle unavailable on these dates, schedule conflict..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => { setRejectingBookingId(null); setRejectionReason(''); }}
                className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectBooking(rejectingBookingId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Booking Details Modal ────────────────────────────────────────── */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Booking Overview</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-slate-800">{selectedBooking.target_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span>{getStatusBadge(selectedBooking.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="font-bold text-blue-700 text-sm">LKR {selectedBooking.total_amount?.toLocaleString()}</span>
                </div>
              </div>

              <div className="border border-slate-100 p-4 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 mb-2 uppercase text-[10px] tracking-wider text-slate-400">Customer</p>
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-semibold">{selectedBooking.user?.first_name} {selectedBooking.user?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold">{selectedBooking.user?.mobile_number || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold">{selectedBooking.user?.email || '—'}</span>
                </div>
              </div>

              <div className="border border-slate-100 p-4 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 mb-2 uppercase text-[10px] tracking-wider text-slate-400">Schedule & Route</p>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dates:</span>
                  <span className="font-semibold">{selectedBooking.start_date} &rarr; {selectedBooking.end_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time:</span>
                  <span className="font-semibold">{selectedBooking.start_time || '09:00'} – {selectedBooking.end_time || '18:00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup:</span>
                  <span className="font-semibold">{selectedBooking.pickup_location}</span>
                </div>
                {selectedBooking.dropoff_location && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Drop-off:</span>
                    <span className="font-semibold">{selectedBooking.dropoff_location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Passengers:</span>
                  <span className="font-semibold">{selectedBooking.passenger_count || 1}</span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Customer Notes</p>
                  <p className="text-amber-900">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
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
