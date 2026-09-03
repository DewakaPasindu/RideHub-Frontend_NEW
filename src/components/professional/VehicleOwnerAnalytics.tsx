import React from 'react';
import { Car, Key, Calendar, Percent, Star, ShieldCheck, DollarSign } from 'lucide-react';
import type { VehicleOwnerAnalyticsData } from '../../services/api/types';
import { formatLKR } from './EarningsSummaryCards';

interface VehicleOwnerAnalyticsProps {
  data: VehicleOwnerAnalyticsData;
}

export const VehicleOwnerAnalytics: React.FC<VehicleOwnerAnalyticsProps> = ({ data }) => {
  const { vehicle_performance_table = [] } = data;

  return (
    <div className="space-y-6">
      {/* Fleet Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Fleet Size */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Fleet Size
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.total_vehicles}
              </span>
              <span className="text-xs text-gray-500">vehicles</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>Active: <strong className="text-emerald-600">{data.active_vehicles}</strong></span>
              <span>•</span>
              <span>On Rent: <strong className="text-blue-600">{data.rented_vehicles}</strong></span>
            </div>
          </div>
        </div>

        {/* Stat 2: Fleet Utilization */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Fleet Utilization
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.fleet_utilization}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(data.fleet_utilization, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stat 3: Rentals & Days */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Rentals
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.total_rentals}
              </span>
              <span className="text-xs text-gray-500">rentals</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5 mr-1 text-purple-500" />
              <span>{data.total_rental_days} total billed rental days</span>
            </div>
          </div>
        </div>

        {/* Stat 4: Average Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Avg. Rental Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatLKR(data.average_rental_revenue)}
            </span>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Gross average per rental agreement
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Vehicle Fleet Performance
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Breakdown of earnings, rental days, and utilization per vehicle
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {vehicle_performance_table.length} Vehicles
          </span>
        </div>

        {vehicle_performance_table.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Car className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="text-sm">No vehicles registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-gray-900/40 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4 text-center">Rentals</th>
                  <th className="py-3 px-4 text-center">Rental Days</th>
                  <th className="py-3 px-4 text-right">Gross Revenue</th>
                  <th className="py-3 px-4 text-right">10% Platform Fee</th>
                  <th className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">Net Revenue</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4 text-center">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
                {vehicle_performance_table.map((veh) => (
                  <tr key={veh.vehicle_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {veh.brand} {veh.model}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                        {veh.vehicle_number}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-gray-700 dark:text-gray-300">
                      {veh.rentals_count}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-gray-700 dark:text-gray-300">
                      {veh.rental_days}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-gray-900 dark:text-white">
                      {formatLKR(veh.gross_earnings)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-amber-600 dark:text-amber-400">
                      {formatLKR(veh.platform_fee)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatLKR(veh.net_earnings)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{Number(veh.average_rating || 5.0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                        {veh.utilization_rate}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
