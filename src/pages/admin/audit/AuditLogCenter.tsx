import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  RefreshCw,
  Eye,
  Shield,
  Clock,
  X,
} from 'lucide-react';
import { AdminService } from '../../../services/api/admin.service';

export default function AuditLogCenter() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 50 };
      if (searchTerm.trim()) params.action = searchTerm.trim();

      const res = await AdminService.getAuditLogs(params);
      setLogs(res.data || []);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <History className="w-6 h-6 text-emerald-400" />
            COMPLIANCE & AUDIT LOG VIEWER
          </h1>
          <p className="text-xs text-slate-400 mt-1">Immutable administrative action history, verification decisions, suspensions, and IP audit trails</p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadLogs()}
            placeholder="Filter by action name (e.g. driver.approve)..."
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-72"
          />
          <button onClick={loadLogs} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200">
            Filter
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="p-12 flex justify-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-bold text-slate-200">No activity logs recorded matching criteria.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action Event</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Operator</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-200 max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                      {log.ip_address || '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Payload</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl overflow-hidden text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-emerald-400 font-bold">{selectedLog.action}</span>
                <p className="text-slate-400 text-[11px] mt-0.5">{new Date(selectedLog.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-200">{selectedLog.description}</p>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Metadata Properties</span>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.properties || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}