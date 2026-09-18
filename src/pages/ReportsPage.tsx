import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { BarChart3, Download, Printer, Users, ShieldCheck, Building2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getReportsSummary()
      .then((res) => setSummary(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Reports &amp; Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical analytics on staff demographics, card allocations, and public verification activity.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-[#0f3a5d] hover:bg-[#164e7d] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Executive Summary</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-lg font-bold text-slate-900">GUE EDUCATIONAL LIMITED</h1>
        <p className="text-xs text-slate-600">
          Skills Training Centre, Wannune, Tarka LGA, Benue State • RC: 9451933 • TIN: 2620760246226
        </p>
        <p className="text-xs font-bold text-slate-800 mt-1">
          OFFICIAL STAFF MANAGEMENT &amp; ID VERIFICATION EXECUTIVE REPORT — {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Enrolled Staff
          </span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">
            {summary?.totalStaff || 0}
          </span>
          <span className="text-xs text-slate-500">100% indexed in registry</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Active Verified Staff
          </span>
          <span className="text-3xl font-black text-emerald-700 mt-1 block">
            {summary?.activeStaff || 0}
          </span>
          <span className="text-xs text-emerald-600 font-semibold">Active credentials</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Deactivated Records
          </span>
          <span className="text-3xl font-black text-rose-700 mt-1 block">
            {summary?.inactiveStaff || 0}
          </span>
          <span className="text-xs text-rose-600 font-semibold">Blocked from QR verification</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Physical Cards Issued
          </span>
          <span className="text-3xl font-black text-amber-700 mt-1 block">
            {summary?.idCardsIssued || 0}
          </span>
          <span className="text-xs text-slate-500">CR80 plastic cards</span>
        </div>
      </div>

      {/* Demographic & Department Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Department */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#0f3a5d]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Staff Distribution by Department
            </h2>
          </div>

          <div className="space-y-2">
            {summary?.departmentCounts?.map((dept: any) => (
              <div
                key={dept.code}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{dept.name}</span>
                  <span className="text-slate-400 ml-2 font-mono">({dept.code})</span>
                </div>
                <div className="font-mono font-bold text-[#0f3a5d]">
                  {dept.count} Staff ({Math.round((dept.count / (summary?.totalStaff || 1)) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Employment Type */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Users className="w-5 h-5 text-[#0f3a5d]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Employment Type Demographics
            </h2>
          </div>

          <div className="space-y-2">
            {summary?.employmentTypes?.map((t: any) => (
              <div
                key={t.type}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs"
              >
                <span className="font-bold text-slate-900 uppercase tracking-wider">
                  {t.type.replace('_', ' ')}
                </span>
                <div className="font-mono font-bold text-slate-700">
                  {t.count} Personnel
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
