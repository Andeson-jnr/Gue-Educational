import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Staff, Department, SystemSettings, Role } from '../types/index.js';
import {
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  Building2,
  QrCode,
  PlusCircle,
  CreditCard,
  History,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: any, params?: any) => void;
  settings?: SystemSettings | null;
  userRole?: Role;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, settings, userRole = 'VIEWER' }) => {
  const [stats, setStats] = useState<any>(null);
  const [verificationStats, setVerificationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboardData = () => {
    setLoading(true);
    setLoadError(null);
    Promise.all([api.getReportsSummary(), api.getVerificationStats()])
      .then(([summary, vStats]) => {
        setStats(summary);
        setVerificationStats(vStats);
      })
      .catch((err) => {
        console.warn('Dashboard notice:', err?.message || err);
        setLoadError(err?.message || 'Unable to connect to live statistics server.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const orgName = settings?.orgName || 'GUE EDUCATIONAL LIMITED';

  return (
    <div className="space-y-6">
      {/* Optional Connectivity / Loading Notice */}
      {loadError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Could not refresh dashboard statistics: {loadError}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="bg-[#0f3a5d] hover:bg-[#174871] text-white font-bold px-3 py-1.5 rounded-lg transition"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Banner with Quick Institutional Stats */}
      <div className="bg-gradient-to-r from-[#0f3a5d] via-[#174871] to-[#0f3a5d] text-white p-6 sm:p-8 rounded-2xl shadow-sm border-b-4 border-[#c59b27] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <span>Official Identity &amp; Verification Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            GUE Staff Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
            Overview of registered personnel, credential issuance status, and real-time public QR code verification queries for GUE Educational Limited Skills Training Centre.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN'].includes(userRole) && (
            <button
              id="dash-btn-add-staff"
              onClick={() => onNavigate('new-staff')}
              className="flex items-center space-x-2 bg-[#c59b27] hover:bg-[#b0881e] text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Staff</span>
            </button>
          )}

          <button
            id="dash-btn-id-cards"
            onClick={() => onNavigate('id-cards')}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-lg border border-white/20 transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>Generate ID</span>
          </button>

          <button
            id="dash-btn-staff-directory"
            onClick={() => onNavigate('staff')}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-lg border border-white/20 transition"
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory</span>
          </button>

          <button
            id="dash-btn-verification-logs"
            onClick={() => onNavigate('verification-logs')}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Logs</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0f3a5d] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
            {stats ? stats.totalStaff : '--'}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Issued Cards: {stats?.idCardsIssued || 0}</span>
            <span className="text-emerald-600 font-semibold">100% DB Synced</span>
          </div>
        </div>

        {/* Active Staff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-700">
            {stats ? stats.activeStaff : '--'}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Passes public QR scan</span>
            <span className="text-emerald-600 font-bold">VERIFIED</span>
          </div>
        </div>

        {/* Inactive Staff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Inactive Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-700">
            {stats ? stats.inactiveStaff : '--'}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Left / Retired / Void</span>
            <span className="text-rose-600 font-bold">BLOCKED</span>
          </div>
        </div>

        {/* Suspended / On Leave */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Suspended / On Leave
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-700">
            {stats ? (stats.suspendedStaff || 0) + (stats.onLeaveStaff || 0) : '--'}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Suspended: {stats?.suspendedStaff || 0}</span>
            <span>Leave: {stats?.onLeaveStaff || 0}</span>
          </div>
        </div>
      </div>

      {/* VERIFICATION ACTIVITY WIDGET & DEPARTMENT BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Activity Overview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Verification Activity
              </h2>
            </div>
            <button
              onClick={() => onNavigate('verification-logs')}
              className="text-xs font-bold text-[#0f3a5d] hover:underline flex items-center space-x-0.5"
            >
              <span>View All Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 my-4 text-center">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">Today</div>
              <div className="text-xl font-extrabold text-[#0f3a5d]">
                {verificationStats ? verificationStats.today : 0}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">This Week</div>
              <div className="text-xl font-extrabold text-[#0f3a5d]">
                {verificationStats ? verificationStats.thisWeek : 0}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">This Month</div>
              <div className="text-xl font-extrabold text-[#0f3a5d]">
                {verificationStats ? verificationStats.thisMonth : 0}
              </div>
            </div>
          </div>

          {/* Recent Live Verification Queries Feed */}
          <div className="space-y-2 mt-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recent Inquiries
            </div>
            {verificationStats?.recent?.length > 0 ? (
              verificationStats.recent.slice(0, 4).map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-200"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono font-bold text-[#0f3a5d]">
                      {log.verificationToken}
                    </span>
                    <div className="text-[10px] text-slate-500 truncate">
                      {log.staffName || 'External Inquiry'}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded ${
                        log.statusResult === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.statusResult === 'INVALID'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.statusResult}
                    </span>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {new Date(log.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">
                No recent verification records.
              </div>
            )}
          </div>
        </div>

        {/* Staff by Department */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#0f3a5d]" />
              <h2 className="text-base font-bold text-slate-900">
                Staff by Department &amp; Training Unit
              </h2>
            </div>
            <button
              onClick={() => onNavigate('departments')}
              className="text-xs font-bold text-[#0f3a5d] hover:underline"
            >
              Manage Departments
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {stats?.departmentCounts?.map((dept: any) => {
              const max = Math.max(...stats.departmentCounts.map((d: any) => d.count), 1);
              const percentage = Math.round((dept.count / max) * 100);

              return (
                <div key={dept.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {dept.name} ({dept.code})
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {dept.count} Staff
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0f3a5d] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENTLY REGISTERED STAFF TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recently Enrolled Staff Members
            </h2>
            <p className="text-xs text-slate-500">
              Staff with registered profile, cryptographic QR credential, and institutional record.
            </p>
          </div>
          <button
            id="dash-btn-view-all-staff"
            onClick={() => onNavigate('staff')}
            className="text-xs font-bold text-[#0f3a5d] hover:underline flex items-center space-x-1"
          >
            <span>View Full Directory</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Staff Member</th>
                <th className="px-6 py-3">Staff ID Number</th>
                <th className="px-6 py-3">Designation &amp; Dept</th>
                <th className="px-6 py-3">Employment Status</th>
                <th className="px-6 py-3">Verification Token</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stats?.recentStaff?.map((s: Staff) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center space-x-3">
                      <img
                        src={s.photoUrl}
                        alt={s.firstName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-slate-900">
                          {s.firstName} {s.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-mono font-bold text-[#0f3a5d]">
                    {s.staffId}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="font-semibold text-slate-800">{s.designation}</div>
                    <div className="text-[11px] text-slate-500">{s.departmentName}</div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded ${
                        s.employmentStatus === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.employmentStatus === 'ON_LEAVE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s.employmentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-600 font-semibold">
                    {s.verificationToken}
                  </td>
                  <td className="px-6 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => onNavigate('id-cards', { staffId: s.id })}
                      className="text-xs font-bold text-[#0f3a5d] hover:underline"
                    >
                      Print ID
                    </button>
                    <button
                      onClick={() => onNavigate('staff', { selectedStaffId: s.id })}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
