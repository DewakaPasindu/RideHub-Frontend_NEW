import React, { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import type { MonthlyTrendItem } from '../../services/api/types';
import { formatLKR } from './EarningsSummaryCards';

interface MonthlyEarningsChartProps {
  data: MonthlyTrendItem[];
  title?: string;
}

export const MonthlyEarningsChart: React.FC<MonthlyEarningsChartProps> = ({
  data = [],
  title = '6-Month Earnings & Platform Fee Trend',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p className="text-sm">No monthly trend data available yet.</p>
      </div>
    );
  }

  // Calculate maximum gross for SVG chart scaling
  const maxGross = Math.max(...data.map((d) => Number(d.gross || 0)), 10000);
  const chartHeight = 180;
  const barGroupWidth = 100 / data.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {title}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Authoritative Gross vs 10% Platform Fee vs Net take-home
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            <span>Gross</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
            <span>10% Fee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span>Net</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div className="relative pt-6 pb-2">
        {/* Hover details floating pill */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="absolute top-0 right-0 z-10 bg-gray-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
            <span className="font-semibold text-gray-300">{data[hoveredIdx].label}:</span>
            <span>Gross: <strong className="text-blue-300">{formatLKR(data[hoveredIdx].gross)}</strong></span>
            <span>Fee: <strong className="text-amber-300">{formatLKR(data[hoveredIdx].platform_fee)}</strong></span>
            <span>Net: <strong className="text-emerald-300">{formatLKR(data[hoveredIdx].net)}</strong></span>
          </div>
        )}

        <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-gray-100 dark:border-gray-700">
          {data.map((item, idx) => {
            const grossHeight = Math.max((item.gross / maxGross) * chartHeight, 4);
            const feeHeight = Math.max((item.platform_fee / maxGross) * chartHeight, 2);
            const netHeight = Math.max((item.net / maxGross) * chartHeight, 2);

            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={`${item.year}-${item.month}`}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* 3 Grouped Bars for Gross, Fee, Net */}
                <div className={`flex items-end gap-1 w-full max-w-[56px] justify-center transition-all ${isHovered ? 'opacity-100 scale-105' : 'opacity-90 hover:opacity-100'}`}>
                  {/* Gross bar */}
                  <div
                    style={{ height: `${grossHeight}px` }}
                    className="w-1/3 max-w-[14px] bg-blue-500 rounded-t-sm transition-all duration-300 group-hover:bg-blue-600"
                    title={`Gross: ${formatLKR(item.gross)}`}
                  />
                  {/* Platform fee bar */}
                  <div
                    style={{ height: `${feeHeight}px` }}
                    className="w-1/3 max-w-[14px] bg-amber-400 rounded-t-sm transition-all duration-300 group-hover:bg-amber-500"
                    title={`Platform Fee: ${formatLKR(item.platform_fee)}`}
                  />
                  {/* Net take-home bar */}
                  <div
                    style={{ height: `${netHeight}px` }}
                    className="w-1/3 max-w-[14px] bg-emerald-500 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-600"
                    title={`Net: ${formatLKR(item.net)}`}
                  />
                </div>

                {/* X-axis Month Label */}
                <span className={`text-[11px] font-medium mt-2 transition-colors ${
                  isHovered ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.short_label || item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
