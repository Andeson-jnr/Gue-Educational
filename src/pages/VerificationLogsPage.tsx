import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { VerificationLog } from '../types/index.js';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

export const VerificationLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadLogs = () => {
    setLoading(true);
    Promise.all([api.getVerificationLogs(200), api.getVerificationStats()])
      .then(([logsRes, statsRes]) => {
        setLogs(logsRes.logs || []);
        setStats(statsRes);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      `${log.verificationToken} ${log.staffName || ''} ${log.staffId || ''} ${log.ipAddress || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus = !statusFilter || log.statusResult === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['Verification Token', 'Staff Name', 'Staff ID', 'Department', 'Result', 'IP Address', 'User-Agent', 'Timestamp'];
    const rows = filteredLogs.map((l) => [
      `"${l.verificationToken}"`,
      `"${l.staffName || 'N/A'}"`,
      `"${l.staffId || 'N/A'}"`,
      `"${l.department || 'N/A'}"`,
      `"${l.statusResult}"`,
      `"${l.ipAddress || 'Unknown'}"`,
      `"${(l.userAgent || '').replace(/"/g, '""')}"`,
      `"${l.verifiedAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GUE_Verification_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Live Public Verification Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry and audit records of external QR code scans and identity lookups.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadLogs}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg border border-slate-300 shadow-2xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-[#0f3a5d] hover:bg-[#164e7d] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Logs (CSV)</span>
          </button>
        </div>
      </div>

      {/* METRIC PILLS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Scans Today
          </span>
          <span className="text-2xl font-black text-[#0f3a5d] mt-1 block">
            {stats?.today || 0}
          </span>
          <span className="text-[10px] text-slate-500">Live 24-hr queries</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Verified Outcomes
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {stats?.breakdown?.verified || 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">Active staff confirmed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Inactive / Suspended Scans
          </span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {stats?.breakdown?.inactiveOrSuspended || 0}
          </span>
          <span className="text-[10px] text-amber-600 font-semibold">Flagged / Denied</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Invalid / Unregistered
          </span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">
            {stats?.breakdown?.invalid || 0}
          </span>
          <span className="text-[10px] text-rose-600 font-semibold">Unknown tokens</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Token, Staff Name, Staff ID, or Client IP..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
          >
            <option value="">All Verification Outcomes</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="ON_LEAVE">ON_LEAVE</option>
            <option value="INVALID">INVALID</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Token Queried</th>
                <th className="px-4 py-3">Staff Identity</th>
                <th className="px-4 py-3">Outcome</th>
                <th className="px-4 py-3">Client IP &amp; Device</th>
                <th className="px-4 py-3 text-right">Verification Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Loading verification logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No verification records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-[#0f3a5d]">
                      {log.verificationToken}
                    </td>
                    <td className="px-4 py-3">
                      {log.staffName ? (
                        <div>
                          <div className="font-bold text-slate-900">{log.staffName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {log.staffId} • {log.department || 'Skills Centre'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unregistered Token</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block font-extrabold text-[10px] px-2 py-0.5 rounded ${
                          log.statusResult === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.statusResult === 'INVALID'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log.statusResult}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11px] text-slate-600">
                        {log.ipAddress || '127.0.0.1'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs" title={log.userAgent}>
                        {log.userAgent || 'Web Browser'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      <div>{new Date(log.verifiedAt).toLocaleDateString()}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {new Date(log.verifiedAt).toLocaleTimeString()}
                      </div>
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
