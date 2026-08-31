import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Clock, FileText, CheckCircle, Car, AlertTriangle, Eye, Gauge, Fuel } from 'lucide-react';
import { RentalService, RentalApplication } from '../../services/api/rental.service';
import HandoverConfirmation from '../../components/rental/HandoverConfirmation';
import ConditionComparison from '../../components/rental/ConditionComparison';

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

      if (data.status === 'completed') {
        const comp = await RentalService.getComparison(id);
        setComparison(comp);
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
    <div className="max-w-4xl mx-auto px-4 py-12">
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
        <div className="flex flex-col items-start md:items-end">
          <span className="text-xs text-slate-400 font-semibold">Verification Status</span>
          <span className={`mt-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            app.status === 'completed' ? 'bg-green-600 text-white' :
            app.status === 'active' ? 'bg-blue-600 text-white' :
            app.status === 'owner_approved' ? 'bg-emerald-600 text-white' :
            app.status === 'more_information_required' ? 'bg-amber-500 text-slate-900' :
            'bg-slate-700 text-slate-300'
          }`}>
            {app.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl mb-6">
          {error}
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
                    <div key={ph.id} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                      <img src={ph.url} alt={ph.photo_type} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded capitalize">
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

      {/* Case 4: Completed Comparison Report */}
      {app.status === 'completed' && comparison && (
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-black text-slate-800">Rental Completed — Verification Summary</h3>
          <ConditionComparison comparison={comparison} />
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
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-white text-slate-500 hover:text-blue-600 rounded-lg border border-slate-150"
                  title="View Secure Document"
                >
                  <Eye className="h-3.5 w-3.5" />
                </a>
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
    </div>
  );
}
