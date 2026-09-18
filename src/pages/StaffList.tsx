import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Staff, Department, Role, EmploymentStatus, SystemSettings } from '../types/index.js';
import { StatusChangeModal } from '../components/StatusChangeModal.js';
import { BatchPrintModal } from '../components/BatchPrintModal.js';
import { CsvImportModal } from '../components/CsvImportModal.js';
import { QrModal } from '../components/QrModal.js';
import {
  Users,
  Search,
  Filter,
  Plus,
  Printer,
  Upload,
  Download,
  MoreVertical,
  QrCode,
  CreditCard,
  Edit,
  Eye,
  Trash2,
  RefreshCw,
  Ban,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface StaffListProps {
  onNavigate: (tab: any, params?: any) => void;
  userRole?: Role;
  settings?: SystemSettings | null;
  initialSelectedStaffId?: string;
}

export const StaffList: React.FC<StaffListProps> = ({
  onNavigate,
  userRole = 'VIEWER',
  settings,
}) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [statusModalStaff, setStatusModalStaff] = useState<Staff | null>(null);
  const [qrModalStaff, setQrModalStaff] = useState<Staff | null>(null);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const canEdit = ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN'].includes(userRole);

  const fetchStaff = () => {
    setLoading(true);
    api
      .getStaffList({
        search,
        departmentId: deptFilter,
        status: statusFilter,
        employmentType: typeFilter,
      })
      .then((res) => {
        setStaffList(res.staff || []);
      })
      .catch((err) => console.error('Staff fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.getDepartments().then((res) => setDepartments(res.departments || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStaff();
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [search, deptFilter, statusFilter, typeFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(staffList.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleStatusChange = async (staffId: string, newStatus: EmploymentStatus, reason: string) => {
    await api.updateStaffStatus(staffId, newStatus, reason);
    fetchStaff();
  };

  const handleRegenerateToken = async (staff: Staff) => {
    if (window.confirm(`Are you sure you want to regenerate the verification token for ${staff.firstName} ${staff.lastName}? The old token will be immediately invalidated.`)) {
      await api.regenerateToken(staff.id, 'Administrative regeneration from staff directory');
      fetchStaff();
    }
  };

  const handleRevokeToken = async (staff: Staff) => {
    const reason = window.prompt(`Enter mandatory reason for revoking the verification token for ${staff.firstName} ${staff.lastName}:`);
    if (reason && reason.trim()) {
      await api.revokeToken(staff.id, reason.trim());
      fetchStaff();
    }
  };

  const handleDeleteStaff = async (staff: Staff) => {
    if (window.confirm(`PERMANENT ACTION: Delete record for ${staff.firstName} ${staff.lastName} (${staff.staffId})? This will remove all verification references.`)) {
      await api.deleteStaff(staff.id);
      fetchStaff();
    }
  };

  const handleExportCsv = () => {
    if (staffList.length === 0) return;
    const headers = [
      'Staff ID',
      'First Name',
      'Middle Name',
      'Last Name',
      'Designation',
      'Department',
      'Unit',
      'Employment Status',
      'Employment Type',
      'Date of Appointment',
      'Verification Token',
      'Email',
      'Phone',
    ];

    const rows = staffList.map((s) => [
      `"${s.staffId}"`,
      `"${s.firstName}"`,
      `"${s.middleName || ''}"`,
      `"${s.lastName}"`,
      `"${s.designation}"`,
      `"${s.departmentName || ''}"`,
      `"${s.unitName || ''}"`,
      `"${s.employmentStatus}"`,
      `"${s.employmentType}"`,
      `"${s.dateOfAppointment}"`,
      `"${s.verificationToken}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GUE_Staff_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Global Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Staff Directory &amp; Identity Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered institutional personnel, employment credentials, and verification tokens.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <button
              id="staff-btn-add-new"
              onClick={() => onNavigate('new-staff')}
              className="flex items-center space-x-1.5 bg-[#0f3a5d] hover:bg-[#164e7d] text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          )}

          {canEdit && (
            <button
              id="staff-btn-import-csv"
              onClick={() => setIsCsvImportOpen(true)}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg border border-slate-300 shadow-2xs transition"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Import CSV</span>
            </button>
          )}

          <button
            id="staff-btn-export-csv"
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg border border-slate-300 shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              id="staff-btn-batch-print"
              onClick={() => setIsBatchPrintOpen(true)}
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-2 rounded-lg shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Batch Print IDs ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER AND SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="filter-input-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name, ID, Token, Designation..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              id="filter-select-dept"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="filter-select-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
            >
              <option value="">All Employment Statuses</option>
              <option value="ACTIVE">ACTIVE (Verified)</option>
              <option value="INACTIVE">INACTIVE (Blocked)</option>
              <option value="SUSPENDED">SUSPENDED (Disciplinary Hold)</option>
              <option value="ON_LEAVE">ON_LEAVE (Authorized Leave)</option>
              <option value="TRANSFERRED">TRANSFERRED</option>
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <select
              id="filter-select-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
            >
              <option value="">All Employment Types</option>
              <option value="FULL_TIME">Full-Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="ADJUNCT">Adjunct / Visiting</option>
              <option value="INTERN">Intern / Trainee</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing {staffList.length} staff records</span>
          {selectedIds.length > 0 && (
            <span className="font-semibold text-[#0f3a5d]">
              {selectedIds.length} staff records selected for batch processing
            </span>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={staffList.length > 0 && selectedIds.length === staffList.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#0f3a5d] focus:ring-[#0f3a5d]"
                  />
                </th>
                <th className="px-4 py-3">Staff Profile</th>
                <th className="px-4 py-3">Staff ID Number</th>
                <th className="px-4 py-3">Department &amp; Unit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verification Token</th>
                <th className="px-4 py-3 text-right">Card &amp; Identity Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading staff directory...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No staff records match the selected filters.
                  </td>
                </tr>
              ) : (
                staffList.map((s) => {
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50 transition ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(s.id)}
                          className="rounded border-slate-300 text-[#0f3a5d] focus:ring-[#0f3a5d]"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={s.photoUrl}
                            alt={s.firstName}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-300 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-tight">
                              {s.firstName} {s.middleName ? s.middleName + ' ' : ''}{s.lastName}
                            </div>
                            <div className="text-slate-500 text-[11px]">{s.designation}</div>
                            <div className="text-slate-400 text-[10px]">{s.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-[#0f3a5d] text-xs">
                          {s.staffId}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Appointed: {s.dateOfAppointment}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">
                          {s.departmentName || 'General'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {s.unitName || 'Main Training Unit'}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded ${
                            s.employmentStatus === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : s.employmentStatus === 'ON_LEAVE'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : s.employmentStatus === 'SUSPENDED'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {s.employmentStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {s.verificationToken}
                          </span>
                          <button
                            onClick={() => setQrModalStaff(s)}
                            title="View / Download QR Code"
                            className="p-1 text-slate-400 hover:text-emerald-700 rounded transition"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onNavigate('id-cards', { staffId: s.id })}
                            title="Preview and Print Staff ID Card"
                            className="p-1.5 bg-[#0f3a5d]/10 hover:bg-[#0f3a5d] text-[#0f3a5d] hover:text-white rounded-lg transition"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onNavigate('staff-detail', { staffId: s.id })}
                            title="View Full Profile & Vault"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canEdit && (
                            <button
                              onClick={() => onNavigate('edit-staff', { staffId: s.id })}
                              title="Edit Staff Record"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {canEdit && (
                            <button
                              onClick={() => setStatusModalStaff(s)}
                              title="Change Employment Status (Active/Inactive/Suspended)"
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )}

                          {canEdit && (
                            <button
                              onClick={() => handleRegenerateToken(s)}
                              title="Regenerate QR Verification Token"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}

                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteStaff(s)}
                              title="Delete Record (Super Admin)"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <StatusChangeModal
        staff={statusModalStaff}
        isOpen={!!statusModalStaff}
        onClose={() => setStatusModalStaff(null)}
        onConfirm={handleStatusChange}
      />

      <BatchPrintModal
        staffIds={selectedIds}
        isOpen={isBatchPrintOpen}
        onClose={() => setIsBatchPrintOpen(false)}
        settings={settings || undefined}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onSuccess={fetchStaff}
      />

      <QrModal
        staff={qrModalStaff}
        isOpen={!!qrModalStaff}
        onClose={() => setQrModalStaff(null)}
      />
    </div>
  );
};
