import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Car, Key, CheckCircle, Clock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { ProfessionalService } from '../../services/api/professional.service';
import type { EarningRecord } from '../../services/api/types';
import { formatLKR } from './EarningsSummaryCards';

export const EarningsHistoryTable: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEarnings = async (page = 1) => {
    try {
      setLoading(true);
      const res = await ProfessionalService.getEarnings({
        page,
        per_page: 10,
        search: search.trim() || undefined,
        type: typeFilter || undefined,
      });

      setEarnings(res.data || []);
      setCurrentPage(res.current_page || 1);
      setTotalPages(res.last_page || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load earnings history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings(1);
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEarnings(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header & Filter Bar */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Earnings History
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Itemized records of completed rides and rentals with authoritative 10% fee deductions
            </p>
          </div>

          <button
            onClick={() => fetchEarnings(currentPage)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or description..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </form>

          {/* Service Type Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Service Types</option>
              <option value="RIDE">Rides (Driver)</option>
              <option value="VEHICLE_RENTAL">Rentals (Vehicle Owner)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
          <p className="text-xs">Loading earnings records...</p>
        </div>
      ) : earnings.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Calendar className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No earnings recorded yet</p>
          <p className="text-xs text-gray-500 mt-1">Completed rides and vehicle rentals will appear here automatically.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 dark:bg-gray-900/40 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">Description / Reference</th>
                <th className="py-3 px-4 text-right">Gross</th>
                <th className="py-3 px-4 text-right">10% Platform Fee</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">Net Take-Home</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
              {earnings.map((earning) => (
                <tr key={earning.uuid} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 dark:text-gray-400 font-medium">
                    {earning.earning_date || earning.created_at.split('T')[0]}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {earning.earning_type === 'RIDE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        <Car className="w-3 h-3" /> Ride
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        <Key className="w-3 h-3" /> Rental
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {earning.description}
                    </div>
                    <div className="text-[11px] font-mono text-gray-400">
                      Ref #{earning.reference_uuid?.substring(0, 8) || earning.reference_id}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {formatLKR(earning.gross_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    -{formatLKR(earning.platform_fee_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatLKR(earning.net_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                      {earning.status}
                    </span>
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
              onClick={() => fetchEarnings(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchEarnings(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
