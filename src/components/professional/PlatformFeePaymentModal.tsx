import React, { useState } from 'react';
import { X, CreditCard, Landmark, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProfessionalService } from '../../services/api/professional.service';
import type { MonthlyStatement } from '../../services/api/types';
import { formatLKR } from './EarningsSummaryCards';

interface PlatformFeePaymentModalProps {
  statement: MonthlyStatement | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PlatformFeePaymentModal: React.FC<PlatformFeePaymentModalProps> = ({
  statement,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !statement) return null;

  const [amount, setAmount] = useState<number>(Number(statement.amount_due || 0));
  const [method, setMethod] = useState<'card' | 'bank_transfer' | 'wallet' | 'cash'>('card');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }
    if (amount > statement.amount_due) {
      setError(`Payment amount cannot exceed the balance due of ${formatLKR(statement.amount_due)}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await ProfessionalService.payFee(statement.uuid, {
        amount,
        payment_method: method,
        payment_reference: reference.trim() || `SETTLE-${Date.now()}`,
        notes: notes.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit platform fee payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
            Platform Fee Settlement
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
            Pay {statement.month_name} {statement.statement_year} Fee
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Settle RideHub's 10% platform share for completed services.
          </p>
        </div>

        {/* Statement Summary Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Gross Revenue:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatLKR(statement.gross_amount)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>10% Platform Fee:</span>
            <span className="font-semibold text-amber-600">{formatLKR(statement.platform_fee_amount)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Already Paid:</span>
            <span className="font-semibold text-emerald-600">{formatLKR(statement.amount_paid)}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-sm">
            <span className="text-gray-900 dark:text-white">Outstanding Due:</span>
            <span className="text-rose-600 dark:text-rose-400">{formatLKR(statement.amount_due)}</span>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Amount input */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Payment Amount (LKR)
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={statement.amount_due}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 font-semibold text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  method === 'card'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[11px]">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('bank_transfer')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  method === 'bank_transfer'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span className="text-[11px]">Bank Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('wallet')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  method === 'wallet'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span className="text-[11px]">Wallet</span>
              </button>
            </div>
          </div>

          {/* Reference input */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Transaction / Reference ID
            </label>
            <input
              type="text"
              placeholder="e.g. TXN-12345 or Bank Slip ID"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || amount <= 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Processing...' : `Confirm Payment of ${formatLKR(amount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
