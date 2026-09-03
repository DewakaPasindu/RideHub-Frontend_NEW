import React, { useState, useEffect } from 'react';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { AdminService } from '../../../services/api/admin.service';
import { formatLKR } from '../../../components/professional/EarningsSummaryCards';
import { useAdminTheme } from '../../../contexts/AdminThemeContext';

export default function FinancialCommandCenter() {
  const [finance, setFinance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'statements' | 'recent_earnings'>('statements');
  const { isDark } = useAdminTheme();

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getFinancialOverview();
      setFinance(res);
    } catch (e) {
      console.error('Failed to load financial telemetry', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  const summary = finance?.summary || finance || {};
  const totalGross = summary?.total_gross_volume ?? summary?.total_platform_gross ?? 0;
  const platformFees = summary?.total_platform_fees ?? 0;
  const netDistributed = summary?.total_net_distributed ?? 0;
  const feesCollected = summary?.fees_collected ?? 0;
  const feesOutstanding = summary?.fees_outstanding ?? 0;
  const collectionRate = summary?.collection_rate ?? (platformFees > 0 ? ((feesCollected / platformFees) * 100).toFixed(1) : '100.0');

  const statements = finance?.recent_statements || [];
  const recentEarnings = finance?.recent_earnings || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b transition-colors ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div>
          <h1
            className={`text-2xl font-black tracking-wide flex items-center gap-2.5 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <Wallet className="w-6 h-6 text-emerald-500" />
            FINANCIAL INTELLIGENCE & CONTROL CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative 10% platform fee calculation audits, monthly partner settlements, and revenue reconciliation
          </p>
        </div>

        <button
          onClick={loadFinancialData}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          <span>Sync Financials</span>
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Volume */}
        <div
          className={`p-5 rounded-2xl border space-y-2 transition-colors ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Platform Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatLKR(totalGross)}
          </p>
          <p className="text-[11px] text-slate-400">Across passenger rides & vehicle rentals</p>
        </div>

        {/* 10% Platform Fee Engine */}
        <div
          className={`p-5 rounded-2xl border space-y-2 transition-colors ${
            isDark
              ? 'bg-slate-950 border-amber-900/40 bg-gradient-to-br from-amber-950/20 to-slate-950 text-amber-300'
              : 'bg-amber-50/50 border-amber-200 text-amber-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
              RideHub 10% Platform Fees
            </span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500">{formatLKR(platformFees)}</p>
          <p className="text-[11px] text-amber-600/80">Authoritative 10% platform fee engine</p>
        </div>

        {/* Net Distributed to Drivers/Owners */}
        <div
          className={`p-5 rounded-2xl border space-y-2 transition-colors ${
            isDark
              ? 'bg-slate-950 border-emerald-900/40 bg-gradient-to-br from-emerald-950/20 to-slate-950 text-emerald-400'
              : 'bg-emerald-50/50 border-emerald-200 text-emerald-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Net Partner Distribution
            </span>
            <CreditCard className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500">{formatLKR(netDistributed)}</p>
          <p className="text-[11px] text-emerald-600/80">90% distributed to drivers & vehicle owners</p>
        </div>

        {/* Fee Collection Efficiency */}
        <div
          className={`p-5 rounded-2xl border space-y-2 transition-colors ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Collection Efficiency</span>
            <ShieldCheck className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-teal-500">{formatLKR(feesCollected)}</p>
          <p className="text-[11px] text-slate-400">
            Outstanding: <span className="text-rose-500 font-bold">{formatLKR(feesOutstanding)}</span> ({collectionRate}%)
          </p>
        </div>
      </div>

      {/* Ledger View Tabs */}
      <div className="flex items-center gap-2 border-b pb-3">
        <button
          onClick={() => setActiveTab('statements')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'statements'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : isDark
              ? 'bg-slate-800 text-slate-300 hover:text-white'
              : 'bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Monthly Statements Audit</span>
        </button>
        <button
          onClick={() => setActiveTab('recent_earnings')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'recent_earnings'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : isDark
              ? 'bg-slate-800 text-slate-300 hover:text-white'
              : 'bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Recent Earning Transactions</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : activeTab === 'statements' ? (
        statements.length === 0 ? (
          <div
            className={`p-12 rounded-2xl border text-center space-y-2 text-xs transition-colors ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
            }`}
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold">No monthly statements on record yet.</p>
            <p className="text-slate-500">Statements generate upon month closure for active drivers and vehicle owners.</p>
          </div>
        ) : (
          <div
            className={`rounded-2xl border overflow-hidden transition-colors ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`uppercase text-[10px] font-bold tracking-wider border-b ${
                    isDark ? 'bg-slate-900/80 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <tr>
                    <th className="p-3.5">Statement Period</th>
                    <th className="p-3.5">Partner Profile</th>
                    <th className="p-3.5">Gross Billed</th>
                    <th className="p-3.5">10% Platform Fee</th>
                    <th className="p-3.5">Net Distributed</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-900 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
                  {statements.map((st: any) => (
                    <tr key={st.id} className={isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'}>
                      <td className="p-3.5 font-bold">
                        {st.year}-{String(st.month).padStart(2, '0')}
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold">{st.user?.first_name} {st.user?.last_name}</p>
                        <p className="text-[10px] text-slate-400">{st.user?.email}</p>
                      </td>
                      <td className="p-3.5 font-bold">{formatLKR(st.gross_earnings || 0)}</td>
                      <td className="p-3.5 font-bold text-amber-500">{formatLKR(st.platform_fee_due || 0)}</td>
                      <td className="p-3.5 font-bold text-emerald-500">{formatLKR(st.net_earnings || 0)}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            st.status === 'PAID' || st.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Recent Earnings Tab */
        recentEarnings.length === 0 ? (
          <div
            className={`p-12 rounded-2xl border text-center space-y-2 text-xs transition-colors ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
            }`}
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold">No earning transactions found.</p>
          </div>
        ) : (
          <div
            className={`rounded-2xl border overflow-hidden transition-colors ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`uppercase text-[10px] font-bold tracking-wider border-b ${
                    isDark ? 'bg-slate-900/80 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Partner</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Gross Amount</th>
                    <th className="p-3.5">10% Platform Fee</th>
                    <th className="p-3.5">Net Amount</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-900 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
                  {recentEarnings.map((er: any) => (
                    <tr key={er.id} className={isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'}>
                      <td className="p-3.5 font-bold">
                        {er.earning_date ? new Date(er.earning_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold">{er.user?.first_name} {er.user?.last_name}</p>
                        <p className="text-[10px] text-slate-400">{er.user?.email}</p>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-400 uppercase text-[10px]">
                        {er.earning_type?.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3.5 font-bold">{formatLKR(er.gross_amount || 0)}</td>
                      <td className="p-3.5 font-bold text-amber-500">{formatLKR(er.platform_fee_amount || 0)}</td>
                      <td className="p-3.5 font-bold text-emerald-500">{formatLKR(er.net_amount || 0)}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            er.status === 'COMPLETED' || er.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {er.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}