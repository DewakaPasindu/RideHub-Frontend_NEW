import React, { useState } from 'react';
import { UserCheck, ShieldCheck, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';

interface HandoverConfirmationProps {
  handover: {
    status: string;
    customer_confirmed_at: string | null;
    owner_confirmed_at: string | null;
    handover_at: string | null;
  } | null;
  role: 'customer' | 'owner';
  hasConditionReport: boolean;
  onConfirm: (coords?: { latitude: number; longitude: number }) => void;
  loading: boolean;
}

export default function HandoverConfirmation({
  handover,
  role,
  hasConditionReport,
  onConfirm,
  loading
}: HandoverConfirmationProps) {
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleAction = () => {
    // Attempt to grab GPS location first to record exact handover coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onConfirm({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (err) => {
          console.warn("GPS access denied, proceeding without coordinates:", err);
          onConfirm();
        },
        { timeout: 5000 }
      );
    } else {
      onConfirm();
    }
  };

  const isCustomerConfirmed = !!handover?.customer_confirmed_at;
  const isOwnerConfirmed = !!handover?.owner_confirmed_at;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center space-x-2">
        <CheckCircle2 className="h-5 w-5 text-blue-500" />
        <span>Digital Handover Confirmations</span>
      </h3>

      <p className="text-xs text-slate-500 leading-relaxed mb-6">
        Before the rental becomes active, the owner must submit a pre-rental condition report. 
        The customer must inspect the vehicle, review the report, and confirm they accept the condition. 
        Once both parties sign below, the rental is activated.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Customer Step */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isCustomerConfirmed ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <UserCheck className="h-4 w-4 text-blue-500" />
                <span>Customer Confirmation</span>
              </span>
              {isCustomerConfirmed ? (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Confirmed</span>
              ) : (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Awaiting Sign</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {isCustomerConfirmed 
                ? `Confirmed on: ${new Date(handover!.customer_confirmed_at!).toLocaleString()}`
                : "Customer must review pre-rental condition notes & photos and sign acceptance."}
            </p>
          </div>

          {role === 'customer' && !isCustomerConfirmed && (
            <button
              type="button"
              onClick={handleAction}
              disabled={loading || !hasConditionReport}
              className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-colors ${
                hasConditionReport
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {!hasConditionReport 
                ? "Awaiting Owner Condition Report" 
                : loading ? "Confirming..." : "Confirm & Accept Condition"}
            </button>
          )}
        </div>

        {/* Owner Step */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isOwnerConfirmed ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Owner Confirmation</span>
              </span>
              {isOwnerConfirmed ? (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Handed Over</span>
              ) : (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Awaiting Release</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {isOwnerConfirmed 
                ? `Released on: ${new Date(handover!.owner_confirmed_at!).toLocaleString()}`
                : "Owner must hand over vehicle keys and confirm release to customer."}
            </p>
          </div>

          {role === 'owner' && !isOwnerConfirmed && (
            <button
              type="button"
              onClick={handleAction}
              disabled={loading}
              className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              {loading ? "Releasing..." : "Confirm Handover & Release Vehicle"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
