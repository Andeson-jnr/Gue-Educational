import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { AuditLog } from '../types/index.js';
import { History, ShieldAlert, Search, Download, Lock } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .getAuditLogs(200)
      .then((res) => setLogs(res.logs || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((l) =>
    `${l.adminName || ''} ${l.action} ${l.details || ''} ${l.staffName || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['Admin User', 'Action', 'Target Entity', 'Details', 'IP Address', 'Timestamp'];
    const rows = filteredLogs.map((l) => [
      `"${l.adminName || l.adminId}"`,
      `"${l.action}"`,
      `"${l.staffName || l.staffId || 'N/A'}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || '127.0.0.1'}"`,
      `"${l.timestamp}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GUE_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Security Audit Trail
            </h1>
            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped record of administrative actions, status updates, token regenerations, and data modifications.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center space-x-1.5 bg-[#0f3a5d] hover:bg-[#164e7d] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by Administrator, Action type, or Staff record..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Action Performed</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3">Administrative Justification / Details</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No audit records match the search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {log.adminName || log.adminId}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[10.5px] bg-slate-100 text-[#0f3a5d] px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {log.staffName || log.staffId || 'System'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-md break-words">
                      {log.details || '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
