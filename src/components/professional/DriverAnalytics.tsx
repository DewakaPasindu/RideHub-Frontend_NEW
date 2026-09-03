import React from 'react';
import { Star, CheckCircle, Award, Compass, Car } from 'lucide-react';
import type { DriverAnalyticsData } from '../../services/api/types';
import { formatLKR } from './EarningsSummaryCards';

interface DriverAnalyticsProps {
  data: DriverAnalyticsData;
}

export const DriverAnalytics: React.FC<DriverAnalyticsProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Driver Performance Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Completed Rides */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Completed Rides
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.completed_rides}
              </span>
              <span className="text-xs text-gray-500">/ {data.total_rides} total</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              <span>{data.completion_rate}% completion rate</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Average Per Ride */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Avg. Per Ride
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatLKR(data.average_per_ride)}
            </span>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Gross average per completed trip
            </p>
          </div>
        </div>

        {/* Stat 3: Driver Rating */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Driver Rating
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {Number(data.rating || 5.0).toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">/ 5.0</span>
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Based on {data.review_count} verified passenger reviews
            </p>
          </div>
        </div>

        {/* Stat 4: Total Driver Net */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Lifetime Net Earnings
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatLKR(data.net_earnings)}
            </span>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              After 10% platform fee deduction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
