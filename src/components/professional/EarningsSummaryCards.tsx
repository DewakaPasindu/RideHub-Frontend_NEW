import React from 'react';
import { DollarSign, Wallet, Percent, AlertCircle, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import type { ProfessionalOverview, MonthlyStatement } from '../../services/api/types';

interface EarningsSummaryCardsProps {
  overview: ProfessionalOverview;
  onPayFeeClick?: (statement: MonthlyStatement) => void;
}

export const formatLKR = (amount: number): string => {
  return 'Rs. ' + Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const EarningsSummaryCards: React.FC<EarningsSummaryCardsProps> = ({ overview, onPayFeeClick }) => {
  const { this_month, active_statement } = overview;
  const isPositiveGrowth = (this_month?.growth_percentage ?? 0) >= 0;

  return (
    <div className="space-y-4">
      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Earnings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Gross Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatLKR(this_month?.gross ?? 0)}
            </h3>
            <div className="mt-2 flex items-center text-xs">
              <span className={`inline-flex items-center font-medium ${isPositiveGrowth ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isPositiveGrowth ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {Math.abs(this_month?.growth_percentage ?? 0)}%
              </span>
              <span className="text-gray-400 dark:text-gray-500 ml-1.5">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: 10% Platform Fee */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Platform Fee
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                10%
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatLKR(this_month?.platform_fee ?? 0)}
            </h3>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              RideHub 10% platform share
            </p>
          </div>
        </div>

        {/* Card 3: Net Take-Home Earnings */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md shadow-emerald-500/10 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Net Take-Home
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight">
              {formatLKR(this_month?.net ?? 0)}
            </h3>
            <p className="mt-2 text-xs text-emerald-100 font-medium">
              Gross minus 10% platform fee
            </p>
          </div>
        </div>

        {/* Card 4: Services Completed */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Trips / Rentals
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {this_month?.total_services ?? 0}
            </h3>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>Rides: <strong className="text-gray-800 dark:text-gray-200">{this_month?.rides_count ?? 0}</strong></span>
              <span>•</span>
              <span>Rentals: <strong className="text-gray-800 dark:text-gray-200">{this_month?.rentals_count ?? 0}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Monthly Statement Settlement Banner */}
      {active_statement && (
        <div className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
          active_statement.status === 'PAID'
            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
            : active_statement.status === 'OVERDUE'
            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200'
            : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200'
        }`}>
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              active_statement.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700'
            }`}>
              {active_statement.status === 'PAID' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {active_statement.month_name} {active_statement.statement_year} Statement
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  active_statement.status === 'PAID'
                    ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                    : active_statement.status === 'PARTIALLY_PAID'
                    ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : active_statement.status === 'OVERDUE'
                    ? 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                    : 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                }`}>
                  {active_statement.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                Total 10% Platform Fee: {formatLKR(active_statement.platform_fee_amount)} • Paid: {formatLKR(active_statement.amount_paid)} • Balance Due: <strong className="font-bold">{formatLKR(active_statement.amount_due)}</strong>
              </p>
            </div>
          </div>

          {active_statement.amount_due > 0 && onPayFeeClick && (
            <button
              onClick={() => onPayFeeClick(active_statement)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-xs shadow hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Pay Platform Fee ({formatLKR(active_statement.amount_due)})
            </button>
          )}
        </div>
      )}
    </div>
  );
};
