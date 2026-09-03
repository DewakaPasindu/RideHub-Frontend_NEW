import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, ShieldAlert, CheckCircle, Clock, FileText, AlertTriangle, ArrowLeft, Fuel, Gauge, Compass, Car, X, ExternalLink } from 'lucide-react';
import { RentalService, RentalApplication, RentalFinalSummary } from '../../services/api/rental.service';
import { tokenStore } from '../../services/api/client';
import ConditionForm from '../../components/rental/ConditionForm';
import HandoverConfirmation from '../../components/rental/HandoverConfirmation';
import ConditionComparison from '../../components/rental/ConditionComparison';
import FinalRentalSummaryCard from '../../components/rental/FinalRentalSummaryCard';
import RentalPriceEstimateCard from '../../components/rental/RentalPriceEstimateCard';

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

export default function OwnerRentalReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<RentalApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  
  // Rejection/Request Info variables
  const [rejectReason, setRejectReason] = useState('');
  const [infoRequestDetails, setInfoRequestDetails] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [showInfoBox, setShowInfoBox] = useState(false);

  // Active Location variables
  const [liveLocation, setLiveLocation] = useState<any | null>(null);
  const [locationTimer, setLocationTimer] = useState<any>(null);

  const [summaryData, setSummaryData] = useState<RentalFinalSummary | null>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      const data = await RentalService.getApplication(id);
      setApp(data);
      if (data.status === 'returned' || data.status === 'completed') {
        const sum = await RentalService.getSummary(id);
        if (sum?.summary) {
          setSummaryData(sum.summary);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load request details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (locationTimer) clearInterval(locationTimer);
    };
  }, [id]);

  // If status is active, fetch live location updates every 15 seconds
  useEffect(() => {
    if (app?.status === 'active' && id) {
      const timer = setInterval(async () => {
        try {
          const loc = await RentalService.getLatestLocation(id);
          setLiveLocation(loc);
        } catch {
          // Silent
        }
      }, 15000);
      setLocationTimer(timer);
      
      // Fetch initial position
      RentalService.getLatestLocation(id).then(setLiveLocation).catch(() => {});
    }
  }, [app?.status]);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      await RentalService.approveRequest(id);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Approval failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason) return;
    setActionLoading(true);
    setError(null);
    try {
      await RentalService.rejectRequest(id, rejectReason);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Rejection failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!id || !infoRequestDetails) return;
    setActionLoading(true);
    setError(null);
    try {
      await RentalService.requestInformation(id, infoRequestDetails);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Request failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConditionSubmit = async (data: any) => {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      // 1. Submit condition notes
      const cond = await RentalService.storeCondition(id, {
        odometer_reading: data.odometer_reading,
        fuel_level: data.fuel_level,
        exterior_condition: data.exterior_condition,
        interior_condition: data.interior_condition,
        existing_damage: data.existing_damage,
        condition_description: data.condition_description,
        inspection_stage: 'pre_rental'
      });

      // 2. Upload each photo linked to this condition
      for (const [type, file] of Object.entries(data.photos)) {
        await RentalService.uploadConditionPhoto(id, cond.uuid, type, file as File);
      }

      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to submit condition report.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmHandover = async (coords?: { latitude: number; longitude: number }) => {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      await RentalService.confirmHandoverOwner(id, coords?.latitude, coords?.longitude);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Handover Release confirmation failed.");
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
        Application request not found.
      </div>
    );
  }

  const preCondition = app.conditions?.find(c => c.inspection_stage === 'pre_rental');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <button
          onClick={() => navigate('/owner/rental-requests')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Requests Dashboard</span>
        </button>
      </div>

      {/* Header Profile details */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">
            Rental Applicant Review
          </span>
          <h2 className="text-2xl font-black text-slate-800 mt-2">
            {app.first_name} {app.last_name}
          </h2>
          <p className="text-xs text-slate-500">{app.email} | {app.phone}</p>
        </div>
        <div className="flex flex-col sm:items-end">
          <span className="text-xs text-slate-400 font-semibold">Workflow Stage</span>
          <span className="mt-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-black uppercase tracking-wider">
            {app.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Case 1: Needs review approval */}
      {(app.status === 'submitted' || app.status === 'under_review') && (
        <div className="space-y-6 mb-8">
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

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Application Audit Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-sm"
            >
              Approve Request & Lock Dates
            </button>
            <button
              onClick={() => { setShowRejectBox(true); setShowInfoBox(false); }}
              className="border border-red-200 text-red-600 bg-white hover:bg-red-50 font-bold px-6 py-3 rounded-xl text-xs"
            >
              Reject Request
            </button>
            <button
              onClick={() => { setShowInfoBox(true); setShowRejectBox(false); }}
              className="border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 font-bold px-6 py-3 rounded-xl text-xs"
            >
              Request More Information
            </button>
          </div>

          {showRejectBox && (
            <div className="mt-5 border-t border-slate-200 pt-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rejection Reason</label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Why is this application rejected? (Customer will see this)"
                className="w-full px-4 py-2 border rounded-xl text-xs"
              />
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          )}

          {showInfoBox && (
            <div className="mt-5 border-t border-slate-200 pt-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Details Required</label>
              <textarea
                rows={2}
                value={infoRequestDetails}
                onChange={e => setInfoRequestDetails(e.target.value)}
                placeholder="What details should the customer clarify?"
                className="w-full px-4 py-2 border rounded-xl text-xs"
              />
              <button
                onClick={handleRequestInfo}
                disabled={actionLoading}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
              >
                Send Request
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Case 2: Approved -> Prepare vehicle condition report */}
      {app.status === 'owner_approved' && (
        <div className="space-y-8 mb-8">
          {!preCondition ? (
            <ConditionForm
              onSubmit={handleConditionSubmit}
              title="Record Checkout/Pre-Rental Vehicle Condition"
              submitLabel="Save Condition Report & Trigger Handover"
            />
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600">
                <h4 className="font-bold text-slate-700 mb-2">Recorded Checkout Condition</h4>
                <p>Odometer: <strong>{preCondition.odometer_reading} km</strong></p>
                <p>Fuel Level: <strong>{preCondition.fuel_level}%</strong></p>
              </div>

              <HandoverConfirmation
                handover={app.handover || null}
                role="owner"
                hasConditionReport={true}
                onConfirm={handleConfirmHandover}
                loading={actionLoading}
              />
            </div>
          )}
        </div>
      )}

      {/* Case 3: Active Tracking Dashboard */}
      {app.status === 'active' && (
        <div className="space-y-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-blue-800">Rental is Active</h3>
              <p className="text-xs text-blue-600 mt-1">Vehicle is out on self-drive trip. Process return checklist once vehicle arrives.</p>
            </div>
            <button
              onClick={() => navigate(`/owner/rentals/${app.uuid}/return`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md"
            >
              Process Return Check-In
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center space-x-2">
              <Compass className="h-4.5 w-4.5 text-blue-500 animate-spin" />
              <span>Live Safety Tracking</span>
            </h3>
            {liveLocation ? (
              <div className="text-xs space-y-2">
                <p>Latest coordinates pinged: <strong>{liveLocation.latitude.toFixed(5)}, {liveLocation.longitude.toFixed(5)}</strong></p>
                <p className="text-slate-400">Accuracy: {liveLocation.accuracy?.toFixed(1) || 'N/A'}m | Last updated: {new Date(liveLocation.recorded_at).toLocaleTimeString()}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No GPS broadcasts logged from customer yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Case 4: Rental Completed comparison */}
      {/* Case 4: Final Summary & Return Verification */}
      {(app.status === 'returned' || app.status === 'completed') && (
        <div className="space-y-8 mb-8">
          {summaryData ? (
            <FinalRentalSummaryCard summary={summaryData} role="owner" />
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 animate-pulse">
              Loading final rental calculation summary...
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">Condition Comparison Report</h3>
            <ConditionComparison comparison={{
              pre_rental: app.conditions?.find(c => c.inspection_stage === 'pre_rental') || null,
              return: app.conditions?.find(c => c.inspection_stage === 'return') || null,
              odometer_difference: (app.ending_odometer || 0) - (app.starting_odometer || 0),
              fuel_difference: 0
            }} />
          </div>
        </div>
      )}

      {/* Audit Data Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b">Applicant Details</h3>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-400 block">ID Type & Number</span>
              <span className="font-bold text-slate-700 uppercase">{app.id_type} / {app.id_number}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-400 block">Driving License Number</span>
              <span className="font-bold text-slate-700">{app.driving_license_number} (Exp: {app.license_expiry_date})</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-xs font-bold text-slate-500 mb-3">Customer Verification Files</h4>
            <div className="grid grid-cols-2 gap-3">
              {app.documents?.map(doc => (
                <div key={doc.id} className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 capitalize truncate max-w-[120px]">
                    {doc.document_type.replace(/_/g, ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePreviewDocument(doc)}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 transition-colors flex items-center space-x-1 shadow-sm"
                    title="Preview Document"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold">View</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Vehicle Info */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Target Vehicle</h4>
            <div className="text-center py-4 bg-slate-50 rounded-xl border mb-4">
              <Car className="h-10 w-10 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-800">{app.vehicle?.make} {app.vehicle?.model}</p>
              <p className="text-[10px] text-slate-400">Plate: {app.vehicle?.registration_number}</p>
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
    </div>
  );
}
