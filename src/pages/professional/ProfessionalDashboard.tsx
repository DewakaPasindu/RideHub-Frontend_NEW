import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Car,
  Key,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ProfessionalService } from '../../services/api/professional.service';
import type {
  ProfessionalCapabilities,
  ProfessionalOverview,
  DriverAnalyticsData,
  VehicleOwnerAnalyticsData,
  MonthlyStatement,
} from '../../services/api/types';
import { EarningsSummaryCards, formatLKR } from '../../components/professional/EarningsSummaryCards';
import { MonthlyEarningsChart } from '../../components/professional/MonthlyEarningsChart';
import { DriverAnalytics } from '../../components/professional/DriverAnalytics';
import { VehicleOwnerAnalytics } from '../../components/professional/VehicleOwnerAnalytics';
import { EarningsHistoryTable } from '../../components/professional/EarningsHistoryTable';
import { MonthlyStatementTable } from '../../components/professional/MonthlyStatementTable';
import { PlatformFeePaymentModal } from '../../components/professional/PlatformFeePaymentModal';

export const ProfessionalDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [capabilities, setCapabilities] = useState<ProfessionalCapabilities | null>(null);
  const [overview, setOverview] = useState<ProfessionalOverview | null>(null);
  const [driverData, setDriverData] = useState<DriverAnalyticsData | null>(null);
  const [ownerData, setOwnerData] = useState<VehicleOwnerAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Platform fee payment modal state
  const [selectedStatement, setSelectedStatement] = useState<MonthlyStatement | null>(null);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Fetch user capabilities
      const caps = await ProfessionalService.getCapabilities();
      setCapabilities(caps);

      // 2. If user doesn't have access, stop here (they see onboarding promo)
      if (!caps.has_professional_access) {
        setLoading(false);
        return;
      }

      // Default active tab based on capabilities
      if (caps.is_combined) {
        setActiveTab('overview');
      } else if (caps.is_driver) {
        setActiveTab('driver');
      } else if (caps.is_vehicle_owner) {
        setActiveTab('owner');
      }

      // 3. Load Overview
      const overviewRes = await ProfessionalService.getOverview();
      setOverview(overviewRes);

      // 4. Load role-specific analytics if applicable
      if (caps.is_driver) {
        const dRes = await ProfessionalService.getDriverAnalytics();
        setDriverData(dRes);
      }

      if (caps.is_vehicle_owner) {
        const oRes = await ProfessionalService.getOwnerAnalytics();
        setOwnerData(oRes);
      }
    } catch (err) {
      console.error('Failed to load professional dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenPayFee = (statement: MonthlyStatement) => {
    setSelectedStatement(statement);
    setShowPayModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Loading your professional earnings & analytics...
        </p>
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 1: Normal customer without approved professional capabilities
  // =========================================================================
  if (!capabilities?.has_professional_access) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Onboarding Promo Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-gray-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>RideHub Professional Program</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start Earning with Your Vehicle or Driving Skills
            </h1>

            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Join Sri Lanka's leading intelligent mobility network. Earn guaranteed income with our transparent 10% platform fee, real-time analytics, and automated monthly settlements.
            </p>

            {/* Application status notice if pending */}
            {(capabilities?.driver_status === 'pending' || capabilities?.vehicle_owner_status === 'pending') && (
              <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-sm flex items-start gap-3 text-amber-200 text-xs">
                <Clock className="w-5 h-5 flex-shrink-0 text-amber-300 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Application Under Review</p>
                  <p className="mt-0.5">
                    Your professional application is currently being reviewed by our administration team. Once approved, your financial analytics and earnings hub will be unlocked here.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/drivers/register')}
                className="px-6 py-3 rounded-2xl bg-white text-gray-900 font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4 text-emerald-600" />
                <span>Become a RideHub Driver</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/vehicles/register')}
                className="px-6 py-3 rounded-2xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-sm transition-colors border border-white/20 flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-amber-300" />
                <span>List Your Vehicle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Background Decorative Blur */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Benefits Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Transparent 10% Fee</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You keep 90% of every completed trip and rental. No hidden fees or surprise deductions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Real-Time Analytics</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Track daily and monthly revenue, fleet utilization rates, and customer reviews instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Automated Statements</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Receive monthly financial reports with clear fee calculations and one-click settlements.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 2: Approved Driver, Vehicle Owner, or Combined Professional
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Professional Earnings & Analytics
                </h1>
                {/* Capability Badges */}
                {capabilities.is_combined ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                    Driver + Vehicle Owner
                  </span>
                ) : capabilities.is_driver ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    Verified Driver
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    Vehicle Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Authoritative gross earnings, 10% platform fee tracking, and monthly statements
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Overview Metric Cards (Always visible) */}
      {overview && (
        <EarningsSummaryCards
          overview={overview}
          onPayFeeClick={handleOpenPayFee}
        />
      )}

      {/* Role & Module Tabs */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 space-x-2 sm:space-x-4 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
        {/* Tab: Combined Overview (if combined user) */}
        {capabilities.is_combined && (
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Combined Overview</span>
          </button>
        )}

        {/* Tab: Driver Hub (if driver) */}
        {capabilities.is_driver && (
          <button
            onClick={() => setActiveTab('driver')}
            className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'driver'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Driver Hub</span>
          </button>
        )}

        {/* Tab: Vehicle Owner Hub (if owner) */}
        {capabilities.is_vehicle_owner && (
          <button
            onClick={() => setActiveTab('owner')}
            className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'owner'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Vehicle Fleet Hub</span>
          </button>
        )}

        {/* Tab: Earnings History */}
        <button
          onClick={() => setActiveTab('earnings')}
          className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'earnings'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Earnings History</span>
        </button>

        {/* Tab: Monthly Statements */}
        <button
          onClick={() => setActiveTab('statements')}
          className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'statements'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Monthly Statements</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-6">
            <MonthlyEarningsChart data={overview.monthly_trend} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lifetime Summary Box */}
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Lifetime Earnings Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <span className="text-xs text-gray-500">Gross Total</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {formatLKR(overview.lifetime.gross)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20">
                    <span className="text-xs text-amber-700 dark:text-amber-400">10% Platform Fees</span>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-400 mt-1">
                      {formatLKR(overview.lifetime.platform_fee)}
                    </p>
                  </div>
                  <div className="col-span-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Lifetime Net Take-Home</span>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                      {formatLKR(overview.lifetime.net)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Breakdown Box */}
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Revenue by Capability
                </h3>
                <div className="space-y-3 text-xs">
                  {/* Driver Rides */}
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Driver Rides</span>
                        <p className="text-[11px] text-gray-500">{overview.breakdown_by_type.rides.count} completed rides</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 dark:text-white">{formatLKR(overview.breakdown_by_type.rides.gross)}</span>
                      <p className="text-[11px] text-emerald-600 font-semibold">Net: {formatLKR(overview.breakdown_by_type.rides.net)}</p>
                    </div>
                  </div>

                  {/* Vehicle Rentals */}
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Vehicle Rentals</span>
                        <p className="text-[11px] text-gray-500">{overview.breakdown_by_type.rentals.count} completed rentals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 dark:text-white">{formatLKR(overview.breakdown_by_type.rentals.gross)}</span>
                      <p className="text-[11px] text-emerald-600 font-semibold">Net: {formatLKR(overview.breakdown_by_type.rentals.net)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <EarningsHistoryTable />
          </div>
        )}

        {/* DRIVER TAB */}
        {activeTab === 'driver' && driverData && (
          <div className="space-y-6">
            <DriverAnalytics data={driverData} />
            {overview && <MonthlyEarningsChart data={overview.monthly_trend} title="Driver Earnings & Platform Fee Trend" />}
            <EarningsHistoryTable />
          </div>
        )}

        {/* OWNER TAB */}
        {activeTab === 'owner' && ownerData && (
          <div className="space-y-6">
            <VehicleOwnerAnalytics data={ownerData} />
            {overview && <MonthlyEarningsChart data={overview.monthly_trend} title="Fleet Rental Revenue & Fee Trend" />}
            <EarningsHistoryTable />
          </div>
        )}

        {/* EARNINGS HISTORY TAB */}
        {activeTab === 'earnings' && <EarningsHistoryTable />}

        {/* STATEMENTS TAB */}
        {activeTab === 'statements' && <MonthlyStatementTable />}
      </div>

      {/* Settle Fee Modal */}
      <PlatformFeePaymentModal
        statement={selectedStatement}
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};
export default ProfessionalDashboard;
