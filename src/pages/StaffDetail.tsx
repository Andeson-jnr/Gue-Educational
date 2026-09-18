import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Staff, StaffDocument, SystemSettings, Role, AuditLog } from '../types/index.js';
import { IdCard } from '../components/IdCard.js';
import { StatusChangeModal } from '../components/StatusChangeModal.js';
import {
  User,
  CreditCard,
  FileText,
  History,
  Lock,
  ArrowLeft,
  Edit,
  ShieldCheck,
  RefreshCw,
  Ban,
  Upload,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface StaffDetailProps {
  staffId: string;
  onNavigate: (tab: any, params?: any) => void;
  userRole?: Role;
  settings?: SystemSettings | null;
}

export const StaffDetail: React.FC<StaffDetailProps> = ({
  staffId,
  onNavigate,
  userRole = 'VIEWER',
  settings,
}) => {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [documents, setDocuments] = useState<StaffDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'card' | 'details' | 'confidential' | 'documents'>('card');
  const [loading, setLoading] = useState(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // New Document Upload State
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('APPOINTMENT_LETTER');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const canEdit = ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN'].includes(userRole);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getStaffById(staffId),
      api.getStaffQr(staffId),
      api.getStaffDocuments(staffId),
    ])
      .then(([staffRes, qrRes, docsRes]) => {
        setStaff(staffRes.staff);
        setQrDataUrl(qrRes.qrDataUrl);
        setVerificationUrl(qrRes.verificationUrl);
        setDocuments(docsRes.documents || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [staffId]);

  if (loading || !staff) {
    return (
      <div className="py-16 text-center text-slate-500">
        Loading staff identity profile...
      </div>
    );
  }

  const handleStatusChange = async (sId: string, newStatus: any, reason: string) => {
    await api.updateStaffStatus(sId, newStatus, reason);
    loadData();
  };

  const handleRegenerateToken = async () => {
    if (window.confirm('Regenerate verification token? The existing QR token on any printed ID card will be rendered void immediately.')) {
      await api.regenerateToken(staff.id, 'Administrative request from staff profile');
      loadData();
    }
  };

  const handleRevokeToken = async () => {
    const reason = window.prompt('Enter reason for revoking verification token:');
    if (reason && reason.trim()) {
      await api.revokeToken(staff.id, reason.trim());
      loadData();
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    setUploadingDoc(true);
    try {
      await api.uploadStaffDocument(staff.id, {
        title: newDocTitle.trim(),
        docType: newDocType as any,
        fileName: `${newDocTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileSize: '420 KB',
      });
      setNewDocTitle('');
      const docsRes = await api.getStaffDocuments(staff.id);
      setDocuments(docsRes.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (window.confirm('Delete document from vault?')) {
      await api.deleteDocument(docId);
      const docsRes = await api.getStaffDocuments(staff.id);
      setDocuments(docsRes.documents || []);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Profile Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <button
            onClick={() => onNavigate('staff')}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Staff Directory</span>
          </button>

          <div className="flex items-center space-x-2">
            {canEdit && (
              <button
                onClick={() => onNavigate('edit-staff', { staffId: staff.id })}
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}

            {canEdit && (
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Change Status</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative">
            <img
              src={staff.photoUrl}
              alt={staff.firstName}
              className="w-24 h-28 rounded-xl object-cover border-2 border-[#0f3a5d] shadow-md"
              referrerPolicy="no-referrer"
            />
            <span
              className={`absolute -bottom-2 -right-2 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow border ${
                staff.employmentStatus === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : staff.employmentStatus === 'ON_LEAVE'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}
            >
              {staff.employmentStatus}
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {staff.firstName} {staff.middleName ? `${staff.middleName} ` : ''}{staff.lastName}
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">
              {staff.designation}
            </p>
            <p className="text-xs text-slate-500">
              {staff.departmentName} • {staff.unitName || 'Vocational Training'}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-mono font-bold">
                Staff ID: {staff.staffId}
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-mono font-bold flex items-center space-x-1">
                <span>Token: {staff.verificationToken}</span>
              </span>
              <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                Appointed: {staff.dateOfAppointment}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'card'
                ? 'bg-[#0f3a5d] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Staff ID Card &amp; QR Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'details'
                ? 'bg-[#0f3a5d] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Institutional Record</span>
          </button>

          <button
            onClick={() => setActiveTab('confidential')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'confidential'
                ? 'bg-[#0f3a5d] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Confidential HR Details</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'documents'
                ? 'bg-[#0f3a5d] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document Vault ({documents.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ID CARD & QR CREDENTIAL */}
      {activeTab === 'card' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Official Institutional ID Card &amp; Live Verification Token
                </h2>
                <p className="text-xs text-slate-500">
                  Standard CR80 format ID card (Front &amp; Back) ready for high-resolution printing and plastic card lamination.
                </p>
              </div>

              {canEdit && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRegenerateToken}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate QR Token</span>
                  </button>
                  <button
                    onClick={handleRevokeToken}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Revoke Token</span>
                  </button>
                </div>
              )}
            </div>

            <IdCard
              staff={staff}
              qrDataUrl={qrDataUrl}
              verificationUrl={verificationUrl}
              settings={settings || undefined}
              showActions={true}
            />
          </div>
        </div>
      )}

      {/* TAB 2: INSTITUTIONAL RECORD */}
      {activeTab === 'details' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Institutional Assignment &amp; Qualifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Department
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {staff.departmentName}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Unit / Section
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {staff.unitName || 'Main Training Unit'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Employment Type
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {staff.employmentType}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Date of Appointment
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {staff.dateOfAppointment}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Highest Academic Qualification
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {staff.highestQualification || 'Not specified'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Area of Specialisation
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {staff.specialisation || 'Not specified'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 sm:col-span-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Professional Certifications
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {staff.certifications || 'None registered'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Official Email
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {staff.email}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIDENTIAL HR DETAILS */}
      {activeTab === 'confidential' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-amber-800">
            <Lock className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Confidential Human Resources Information (Data Privacy Protected)
            </h2>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
            <strong>Security Notice:</strong> The fields below are strictly internal records accessible only to authorized institutional administrators. These records are <em>never</em> disclosed to members of the public during QR code verification scans.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Date of Birth
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {staff.dateOfBirth || 'Confidential on file'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Residential Address
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {staff.address || 'Wannune, Tarka LGA, Benue State'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Emergency Phone Number
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {staff.phone}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Appointment Reference Ref
              </span>
              <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">
                {staff.appointmentRef || 'GUE/APT/2026/SEC-01'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENT VAULT */}
      {activeTab === 'documents' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Staff Identity Document Vault
              </h2>
              <p className="text-xs text-slate-500">
                Institutional appointment letters, certificates, and ID card scans.
              </p>
            </div>
          </div>

          {/* Upload Document Form */}
          {canEdit && (
            <form
              onSubmit={handleAddDocument}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-end gap-3"
            >
              <div className="flex-1 w-full">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Official Letter of Appointment"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0f3a5d]"
                />
              </div>

              <div className="w-full sm:w-48">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Category
                </label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0f3a5d]"
                >
                  <option value="APPOINTMENT_LETTER">Appointment Letter</option>
                  <option value="DEGREE_CERTIFICATE">Degree Certificate</option>
                  <option value="ID_CARD_COPY">ID Card Copy</option>
                  <option value="OTHER">Other Credential</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={uploadingDoc}
                className="bg-[#0f3a5d] hover:bg-[#164e7d] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition flex items-center space-x-1.5 whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload to Vault</span>
              </button>
            </form>
          )}

          {/* Documents Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Document Title</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">File Name &amp; Size</th>
                  <th className="px-4 py-2.5">Uploaded Date</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      No documents currently archived for this staff member.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {doc.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">
                          {doc.docType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {doc.fileName} ({doc.fileSize || '350 KB'})
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => window.alert(`Viewing verified document: ${doc.title}`)}
                          className="text-xs font-bold text-[#0f3a5d] hover:underline"
                        >
                          View
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="text-xs font-bold text-rose-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Modal */}
      <StatusChangeModal
        staff={staff}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleStatusChange}
      />
    </div>
  );
};
