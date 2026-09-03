import React, { useState, useEffect } from 'react';
import { FileText, Calendar, CreditCard, CheckCircle2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProfessionalService } from '../../services/api/professional.service';
import type { MonthlyStatement } from '../../services/api/types';
import { formatLKR } from './EarningsSummaryCards';
import { PlatformFeePaymentModal } from './PlatformFeePaymentModal';

export const MonthlyStatementTable: React.FC = () => {
  const [statements, setStatements] = useState<MonthlyStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected statement for payment modal
  const [selectedStatement, setSelectedStatement] = useState<MonthlyStatement | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const fetchStatements = async (page = 1) => {
    try {
      setLoading(true);
      const res = await ProfessionalService.getStatements(page, 10);
      setStatements(res.data || []);
      setCurrentPage(res.current_page || 1);
      setTotalPages(res.last_page || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load monthly statements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements(1);
  }, []);

  const handleOpenPay = (stmt: MonthlyStatement) => {
    setSelectedStatement(stmt);
    setShowPayModal(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">
            Monthly Statements & Platform Fee Settlements
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Aggregated monthly financial summaries and 10% platform fee balance status
          </p>
        </div>

        <button
          onClick={() => fetchStatements(currentPage)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
          <p className="text-xs">Loading statements...</p>
        </div>
      ) : statements.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No monthly statements yet</p>
          <p className="text-xs text-gray-500 mt-1">Statements are generated automatically at the end of each billing cycle.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 dark:bg-gray-900/40 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4 text-right">Gross Earnings</th>
                <th className="py-3 px-4 text-right">10% Platform Fee</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">Net Take-Home</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
              {statements.map((stmt) => (
                <tr key={stmt.uuid} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {stmt.month_name} {stmt.statement_year}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Generated: {stmt.generated_at?.split('T')[0]}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {formatLKR(stmt.gross_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    {formatLKR(stmt.platform_fee_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatLKR(stmt.net_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {formatLKR(stmt.amount_paid)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                    <span className={stmt.amount_due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}>
                      {formatLKR(stmt.amount_due)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      stmt.status === 'PAID'
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        : stmt.status === 'PARTIALLY_PAID'
                        ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
                        : stmt.status === 'OVERDUE'
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                    }`}>
                      {stmt.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {stmt.amount_due > 0 ? (
                      <button
                        onClick={() => handleOpenPay(stmt)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] shadow-sm transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Fee</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Settled</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing page {currentPage} of {totalPages} ({totalCount} total)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchStatements(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchStatements(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pay Fee Modal */}
      <PlatformFeePaymentModal
        statement={selectedStatement}
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onSuccess={() => {
          fetchStatements(currentPage);
        }}
      />
    </div>
  );
};
