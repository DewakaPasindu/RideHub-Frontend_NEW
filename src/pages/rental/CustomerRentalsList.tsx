import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Calendar, MapPin, Shield, Clock, CheckCircle2, AlertCircle, ChevronRight, Navigation, Plus, XCircle, AlertTriangle } from 'lucide-react';
import { RentalService, RentalApplication } from '../../services/api/rental.service';

export default function CustomerRentalsList() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<RentalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'owner_approved' | 'active' | 'completed' | 'cancelled'>('all');
  const [targetCancelApp, setTargetCancelApp] = useState<RentalApplication | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const data = await RentalService.getApplications();
      setRentals(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load your rental requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, []);

  const confirmCancel = async () => {
    if (!targetCancelApp) return;
    setCancelLoading(true);
    try {
      await RentalService.cancelApplication(targetCancelApp.uuid, cancelReason);
      setTargetCancelApp(null);
      setCancelReason('');
      await loadRentals();
    } catch (err: any) {
      alert(err?.message || "Failed to cancel rental.");
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredRentals = rentals.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            <span>Under Review</span>
          </span>
        );
      case 'owner_approved':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            <span>Approved - Ready for Handover</span>
          </span>
        );
      case 'active':
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider">
            <Navigation className="h-3 w-3 animate-pulse" />
            <span>Trip Active</span>
          </span>
        );
      case 'completed':
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'more_information_required':
        return (
          <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider">
            <AlertCircle className="h-3 w-3" />
            <span>Action Required</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider">
            <XCircle className="h-3 w-3" />
            <span>Cancelled</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {status.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Shield className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Self-Drive Rentals</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track verification status, owner approvals, vehicle condition handovers, and active trip safety.
          </p>
        </div>
        <Link
          to="/vehicles"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Rent Another Vehicle</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'submitted', 'owner_approved', 'active', 'completed', 'cancelled'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filter === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab === 'all' && `All Rentals (${rentals.length})`}
            {tab === 'submitted' && 'Pending Review'}
            {tab === 'owner_approved' && 'Approved / Handover'}
            {tab === 'active' && 'Active Trips'}
            {tab === 'completed' && 'Completed'}
            {tab === 'cancelled' && 'Cancelled'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl mb-6 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading your rental applications...</p>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <Car className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No rental requests found</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
            {filter !== 'all'
              ? 'There are no rental requests matching this filter criteria.'
              : 'You have not submitted any self-drive vehicle rental applications yet.'}
          </p>
          <Link
            to="/vehicles"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Car className="h-4 w-4" />
            <span>Browse Available Fleet</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRentals.map(req => {
            const vehicleName = req.vehicle ? `${req.vehicle.make} ${req.vehicle.model}` : 'Self-Drive Vehicle';
            const vehiclePlate = req.vehicle?.registration_number || 'N/A';
            const vehicleImage = req.vehicle?.image_url || req.vehicle?.photos?.[0] || null;

            return (
              <div
                key={req.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 flex-shrink-0">
                        {vehicleImage ? (
                          <img src={vehicleImage} alt={vehicleName} className="w-full h-full object-cover" />
                        ) : (
                          <Car className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800 leading-tight">{vehicleName}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">Plate: {vehiclePlate}</p>
                      </div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  {/* Rental Timeline & Dates */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-4 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center space-x-1.5 font-semibold text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        <span>Pickup:</span>
                      </span>
                      <span className="font-bold text-slate-700">{new Date(req.start_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center space-x-1.5 font-semibold text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Return:</span>
                      </span>
                      <span className="font-bold text-slate-700">{new Date(req.end_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                    <div className="flex items-start space-x-2 truncate">
                      <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="truncate text-slate-500">Pickup: <strong className="text-slate-700">{req.pickup_address}</strong></span>
                    </div>
                    <div className="flex items-start space-x-2 truncate">
                      <MapPin className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="truncate text-slate-500">Return: <strong className="text-slate-700">{req.return_address}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-400">
                    Applied: {new Date(req.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center space-x-2">
                    {req.status === 'active' && (
                      <Link
                        to={`/customer/rentals/${req.uuid}/active`}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1 transition-colors shadow-sm"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>Live GPS</span>
                      </Link>
                    )}
                    {['submitted', 'more_information_required', 'owner_approved'].includes(req.status) && (
                      <button
                        type="button"
                        onClick={() => setTargetCancelApp(req)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-bold transition-colors border border-red-200 flex items-center space-x-1"
                        title="Cancel this request"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                    <Link
                      to={`/customer/rentals/${req.uuid}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1 transition-colors shadow-sm"
                    >
                      <span>View Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {targetCancelApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Cancel Rental Request?</h3>
                <p className="text-xs text-slate-500">
                  Cancel application for {targetCancelApp.vehicle?.make} {targetCancelApp.vehicle?.model}.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Reason for cancellation (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="E.g., Change of travel plans, no longer needed..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => { setTargetCancelApp(null); setCancelReason(''); }}
                disabled={cancelLoading}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                disabled={cancelLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
              >
                {cancelLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Yes, Cancel Rental</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
