import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Clock, FileText, CheckCircle, Car, AlertTriangle, Eye, Gauge, Fuel, MapPin, X, ExternalLink, ChevronLeft, XCircle } from 'lucide-react';
import { RentalService, RentalApplication, RentalFinalSummary } from '../../services/api/rental.service';
import { tokenStore } from '../../services/api/client';
import HandoverConfirmation from '../../components/rental/HandoverConfirmation';
import ConditionComparison from '../../components/rental/ConditionComparison';
import FinalRentalSummaryCard from '../../components/rental/FinalRentalSummaryCard';
import RentalPriceEstimateCard from '../../components/rental/RentalPriceEstimateCard';
import RentalReviewModal from '../../components/rental/RentalReviewModal';

const DAMAGE_LABELS: Record<string, string> = {
  front: 'Front Bumper / Grille',
  rear: 'Rear Bumper / Boot',
  left_side: 'Left Side Doors / Panels',
  right_side: 'Right Side Doors / Panels',
  roof: 'Roof Panel',
  interior: 'Seats / Dashboard / Carpet',
  wheels_tyres: 'Alloys / Tyres',
  windows: 'Windshield / Door Glasses',
  other: 'Other/Mechanical Damages',
};

export default function CustomerRentalDetails() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<RentalApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<any | null>(null);
  const [summaryData, setSummaryData] = useState<RentalFinalSummary | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string; blobUrl?: string | null; loading?: boolean } | null>(null);

  const handlePreviewDocument = async (doc: any) => {
    const token = tokenStore.get() || localStorage.getItem('access_token') || '';
    const authenticatedUrl = token
      ? (doc.url.includes('?') ? `${doc.url}&token=${encodeURIComponent(token)}` : `${doc.url}?token=${encodeURIComponent(token)}`)
      : doc.url;

    setPreviewDoc({
      url: authenticatedUrl,
      title: doc.document_type.replace(/_/g, ' '),
      blobUrl: null,
      loading: true,
    });

    try {
      const res = await fetch(doc.url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        setPreviewDoc(prev => (prev ? { ...prev, blobUrl: objectUrl, loading: false } : null));
      } else {
        setPreviewDoc(prev => (prev ? { ...prev, blobUrl: authenticatedUrl, loading: false } : null));
      }
    } catch {
      setPreviewDoc(prev => (prev ? { ...prev, blobUrl: authenticatedUrl, loading: false } : null));
    }
  };

  const closePreview = () => {
    if (previewDoc?.blobUrl && previewDoc.blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewDoc.blobUrl);
    }
    setPreviewDoc(null);
  };

  // Edit/Correction fields
  const [moreInfoData, setMoreInfoData] = useState({
    phone: '',
    address: '',
    driving_license_number: ''
  });

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await RentalService.getApplication(id);
      setApp(data);
      
      // Initialize edit fields
      setMoreInfoData({
        phone: data.phone,
        address: data.address,
        driving_license_number: data.driving_license_number
      });

      if (data.status === 'returned' || data.status === 'completed') {
        const [comp, sum] = await Promise.all([
          RentalService.getComparison(id).catch(() => null),
          RentalService.getSummary(id).catch(() => null),
        ]);
        if (comp) setComparison(comp);
        if (sum?.summary) setSummaryData(sum.summary);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load rental details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateInformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      // 1. Send update payload
      await RentalService.updateApplication(id, moreInfoData);
      // 2. Re-submit application
      await RentalService.submitApplication(id);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to submit updates.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmHandover = async (coords?: { latitude: number; longitude: number }) => {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      await RentalService.confirmHandoverCustomer(id, coords?.latitude, coords?.longitude);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Handover confirmation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancelApplication = async () => {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await RentalService.cancelApplication(id, cancelReason);
      setApp(updated);
      setShowCancelModal(false);
    } catch (err: any) {
      setError(err?.message || "Failed to cancel rental application.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading application details...
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-red-500">
        Rental application not found.
      </div>
    );
  }

  const preCondition = app.conditions?.find(c => c.inspection_stage === 'pre_rental');

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb back link */}
      <div className="mb-5">
        <Link
          to="/customer/rentals"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 bg-white border border-slate-200 hover:border-emerald-300 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
        >
          <ChevronLeft className="h-4 w-4 text-emerald-600" />
          <span>&larr; Back to My Rentals</span>
        </Link>
      </div>

      {/* Header card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">Self-Drive Trip</span>
          <h2 className="text-3xl font-black tracking-tight mt-1">
            {app.vehicle?.make} {app.vehicle?.model}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Rental Period: {new Date(app.start_at).toLocaleDateString()} &rarr; {new Date(app.end_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end space-y-2">
          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400 font-semibold block">Verification Status</span>
            <span className={`mt-1.5 inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              app.status === 'completed' ? 'bg-green-600 text-white' :
              app.status === 'active' ? 'bg-blue-600 text-white' :
              app.status === 'owner_approved' ? 'bg-emerald-600 text-white' :
              app.status === 'more_information_required' ? 'bg-amber-500 text-slate-900' :
              app.status === 'cancelled' ? 'bg-red-600 text-white' :
              'bg-slate-700 text-slate-300'
            }`}>
              {app.status.replace(/_/g, ' ')}
            </span>
          </div>

          {['submitted', 'more_information_required', 'owner_approved'].includes(app.status) && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="text-xs font-bold text-red-400 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-xl border border-red-500/40 transition-all flex items-center space-x-1 shadow-sm mt-1"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Cancel Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Cancelled Banner */}
      {app.status === 'cancelled' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 flex items-start space-x-3 text-red-800 shadow-sm animate-in fade-in">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-900">Rental Request Cancelled</h4>
            <p className="text-xs text-red-700 mt-0.5">
              This rental application was cancelled. Reason: <strong>{app.more_info_reason || 'Cancelled by customer'}</strong>.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Approximate Pricing & Mileage Allowance (100 KM/Day Rule) */}
      {['draft', 'submitted', 'under_review', 'more_information_required', 'owner_approved'].includes(app.status) && (
        <div className="mb-8">
          <RentalPriceEstimateCard
            estimate={{
              vehicle_id: app.vehicle_id,
              vehicle_uuid: app.vehicle?.uuid || '',
              make: app.vehicle?.make || '',
              model: app.vehicle?.model || '',
              daily_rate: app.daily_rate ?? app.vehicle?.price_per_day ?? 0,
              estimated_days: app.estimated_days ?? 1,
              included_km_per_day: app.included_km_per_day ?? 100,
              estimated_included_km: app.estimated_included_km ?? (app.estimated_days ?? 1) * 100,
              extra_km_rate: app.extra_km_rate ?? app.vehicle?.extra_km_rate ?? 50,
              estimated_base_amount: app.estimated_base_amount ?? 0,
              estimated_total_amount: app.estimated_total_amount ?? 0,
              disclaimer: 'Approximate price only. Final rental price will be calculated after vehicle return using the actual odometer reading.',
            }}
            vehicleName={app.vehicle ? `${app.vehicle.make} ${app.vehicle.model}` : undefined}
          />
        </div>
      )}

      {/* Case 1: More Information Required */}
      {app.status === 'more_information_required' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-bold text-amber-800 flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
            <span>Information Update Required</span>
          </h3>
          <p className="text-xs text-amber-700 mb-4 bg-white p-3 rounded-lg border border-amber-100 italic">
            Owner remarks: "{app.more_info_reason}"
          </p>

          <form onSubmit={handleUpdateInformation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="text"
                  value={moreInfoData.phone}
                  onChange={e => setMoreInfoData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Driving License Number</label>
                <input
                  type="text"
                  value={moreInfoData.driving_license_number}
                  onChange={e => setMoreInfoData(prev => ({ ...prev, driving_license_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Address</label>
                <input
                  type="text"
                  value={moreInfoData.address}
                  onChange={e => setMoreInfoData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs"
            >
              {actionLoading ? "Submitting..." : "Resubmit Information"}
            </button>
          </form>
        </div>
      )}

      {/* Case 2: Handover Confirmation Flow */}
      {app.status === 'owner_approved' && (
        <div className="space-y-8 mb-8">
          {/* Display Owner condition report details */}
          {preCondition ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Owner's Vehicle Condition Report</h3>
              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div className="bg-white p-3 rounded-lg border border-slate-100 flex items-center space-x-2">
                  <Gauge className="h-4.5 w-4.5 text-blue-500" />
                  <span>Odometer: <strong>{preCondition.odometer_reading} km</strong></span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 flex items-center space-x-2">
                  <Fuel className="h-4.5 w-4.5 text-amber-500" />
                  <span>Fuel Level: <strong>{preCondition.fuel_level}%</strong></span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Exterior Condition Notes</span>
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
                    {preCondition.exterior_condition || 'No exterior damage details noted.'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Damaged Checked Areas</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preCondition.existing_damage && preCondition.existing_damage.length > 0 ? (
                      preCondition.existing_damage.map((d: string) => (
                        <span key={d} className="bg-red-50 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded border border-red-100">
                          {DAMAGE_LABELS[d] || d}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No existing damage checked.</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Inspection Photos</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {preCondition.photos?.map((ph) => (
                    <div
                      key={ph.id}
                      onClick={() => setPreviewDoc({ url: ph.url, title: `${ph.photo_type} Inspection Photo`, blobUrl: ph.url })}
                      className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition-all bg-slate-100 group shadow-sm hover:shadow-md"
                      title="Click to zoom photo"
                    >
                      <img
                        src={ph.url}
                        alt={ph.photo_type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[8px] font-bold px-1.5 py-0.5 rounded capitalize">
                        {ph.photo_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-xs flex items-center space-x-2">
              <Clock className="h-4.5 w-4.5" />
              <span>Awaiting the owner to record the vehicle condition report before handover confirmation.</span>
            </div>
          )}

          <HandoverConfirmation
            handover={app.handover || null}
            role="customer"
            hasConditionReport={!!preCondition}
            onConfirm={handleConfirmHandover}
            loading={actionLoading}
          />
        </div>
      )}

      {/* Case 3: Active Rental Navigation */}
      {app.status === 'active' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-blue-800">Your rental is Active!</h3>
            <p className="text-xs text-blue-600 mt-1">Please start the trip. The owner can monitor location for safety tracking.</p>
          </div>
          <Link
            to={`/customer/rentals/${app.uuid}/active`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md"
          >
            Track Live Trip
          </Link>
        </div>
      )}

      {/* Case 4: Final Rental Summary & Mandatory Customer Review */}
      {(app.status === 'returned' || app.status === 'completed') && (
        <div className="space-y-8 mb-8">
          {summaryData ? (
            <FinalRentalSummaryCard summary={summaryData} role="customer" />
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 animate-pulse">
              Loading final rental calculation summary...
            </div>
          )}

          {/* Mandatory Customer Review */}
          {!app.has_reviewed && !app.review ? (
            <RentalReviewModal
              rentalUuid={app.uuid}
              vehicleName={app.vehicle ? `${app.vehicle.make} ${app.vehicle.model}` : 'Your Rented Vehicle'}
              onSuccess={() => loadData()}
            />
          ) : (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-xs text-emerald-950">
              <div className="flex items-center justify-between mb-3">
                <span className="font-extrabold uppercase tracking-wider text-[11px] text-emerald-800 flex items-center space-x-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Your Submitted Rental Review</span>
                </span>
                <span className="text-[10px] text-emerald-700">{app.review?.created_at}</span>
              </div>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < (app.review?.rating || 5) ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="font-bold ml-1 text-slate-700">({app.review?.rating}/5 Stars)</span>
              </div>
              <p className="italic text-slate-700 bg-white/70 p-3 rounded-xl border border-emerald-100">
                "{app.review?.comment}"
              </p>
            </div>
          )}

          {comparison && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-800">Condition Comparison Report</h3>
              <ConditionComparison comparison={comparison} />
            </div>
          )}
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Documents list */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Uploaded verification files</h4>
          <div className="space-y-3">
            {app.documents?.map(doc => (
              <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-700 capitalize">{doc.document_type.replace(/_/g, ' ')}</p>
                  <p className="text-[8px] text-slate-400">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePreviewDocument(doc)}
                  className="p-1.5 bg-white text-slate-600 hover:text-blue-600 rounded-lg border border-slate-200 flex items-center space-x-1 shadow-sm transition-colors"
                  title="View Secure Document"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold">View</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: General Information */}
        <div className="md:col-span-2 space-y-6">
          {/* Pickup/Dropoff Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Locations & Coordinates</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-xs">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">Pickup location</span>
                  <span className="text-slate-500">{app.pickup_address}</span>
                  <span className="block text-[9px] text-slate-400 font-mono mt-0.5">Lat: {app.pickup_latitude.toFixed(5)}, Lng: {app.pickup_longitude.toFixed(5)}</span>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-xs">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">Drop-off / Return location</span>
                  <span className="text-slate-500">{app.return_address}</span>
                  <span className="block text-[9px] text-slate-400 font-mono mt-0.5">Lat: {app.return_latitude.toFixed(5)}, Lng: {app.return_longitude.toFixed(5)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <h4 className="text-sm font-bold text-slate-800 capitalize">{previewDoc.title}</h4>
              <div className="flex items-center space-x-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center space-x-1 px-2.5 py-1 border border-blue-200 rounded-lg bg-blue-50 font-semibold"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Open in New Tab</span>
                </a>
                <button
                  type="button"
                  onClick={closePreview}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-900/5 min-h-[320px]">
              {previewDoc.loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-500 font-semibold">Loading verification document...</span>
                </div>
              ) : (
                <img
                  src={previewDoc.blobUrl || previewDoc.url}
                  alt={previewDoc.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Rental Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Cancel Rental Request?</h3>
                <p className="text-xs text-slate-500">This action will cancel the rental and notify the vehicle owner.</p>
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
                onClick={() => setShowCancelModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleCancelApplication}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
              >
                {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Yes, Cancel Rental</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
