import React, { useState } from 'react';
import {
  FileText,
  Download,
  Filter,
  RefreshCw,
  CheckCircle2,
  Table,
} from 'lucide-react';
import { AdminService } from '../../../services/api/admin.service';

export default function ReportsCenter() {
  const [reportType, setReportType] = useState('financial');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await AdminService.generateReport(reportType);
      setReportData(res);
    } catch (e) {
      console.error('Failed to generate report', e);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData?.data || reportData.data.length === 0) return;
    const headers = Object.keys(reportData.data[0]);
    const rows = reportData.data.map((obj: any) =>
      headers.map(header => `"${String(obj[header] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ridehub_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            OPERATIONS REPORTS GENERATOR
          </h1>
          <p className="text-xs text-slate-400 mt-1">Export authoritative platform records, financial reconciliations, and compliance datasets to CSV</p>
        </div>
      </div>

      {/* Selector & Actions */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-300 uppercase">Dataset Type:</label>
          <select
            value={reportType}
            onChange={e => setReportType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="financial">Financial Reconciliation (10% Fees & Earnings)</option>
            <option value="drivers">Driver Fleet & Credential Roster</option>
            <option value="vehicles">Vehicle Asset Utilization & Status</option>
            <option value="complaints">Customer Disputes & Safety Incidents</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Generate Report</span>
          </button>

          {reportData?.data?.length > 0 && (
            <button
              onClick={downloadCSV}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Generated Dataset Table Preview */}
      {loading ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : reportData?.data?.length > 0 ? (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <span className="font-bold text-xs text-white uppercase tracking-wider">
              Previewing {reportData.data.length} Records ({reportType})
            </span>
            <span className="text-[11px] text-slate-500">Generated: {reportData.generated_at}</span>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold tracking-wider sticky top-0 border-b border-slate-800">
                <tr>
                  {Object.keys(reportData.data[0]).map(key => (
                    <th key={key} className="p-3 whitespace-nowrap">{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {reportData.data.slice(0, 100).map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    {Object.values(row).map((val: any, vIdx: number) => (
                      <td key={vIdx} className="p-3 whitespace-nowrap text-[11px]">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
          <Table className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-bold text-slate-200">No report generated yet.</p>
          <p className="text-slate-500">Select a report dataset above and click "Generate Report".</p>
        </div>
      )}
    </div>
  );
}