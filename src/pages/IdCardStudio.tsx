import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Staff, SystemSettings } from '../types/index.js';
import { IdCard } from '../components/IdCard.js';
import { BatchPrintModal } from '../components/BatchPrintModal.js';
import {
  CreditCard,
  Printer,
  Download,
  Users,
  Search,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

interface IdCardStudioProps {
  initialStaffId?: string;
  settings?: SystemSettings | null;
}

export const IdCardStudio: React.FC<IdCardStudioProps> = ({
  initialStaffId,
  settings,
}) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(initialStaffId || '');
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [search, setSearch] = useState('');
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  useEffect(() => {
    api.getStaffList().then((res) => {
      const list = res.staff || [];
      setStaffList(list);
      if (list.length > 0 && !selectedStaffId) {
        setSelectedStaffId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedStaffId) {
      api.getStaffById(selectedStaffId).then((res) => {
        setCurrentStaff(res.staff);
      });
      api.getStaffQr(selectedStaffId).then((res) => {
        setQrDataUrl(res.qrDataUrl);
        setVerificationUrl(res.verificationUrl);
      });
    }
  }, [selectedStaffId]);

  const filteredStaff = staffList.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.staffId} ${s.designation}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional ID Card Studio &amp; Print Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            CR80 standard physical card format with embedded cryptographically hashed verification QR codes.
          </p>
        </div>

        <button
          id="btn-open-batch-modal"
          onClick={() => setIsBatchOpen(true)}
          className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          <span>Batch Print Cards</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Staff Selector List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Staff Member
            </h2>
            <span className="text-[11px] text-slate-500">{filteredStaff.length} available</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID or role..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredStaff.map((s) => {
              const isSelected = s.id === selectedStaffId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaffId(s.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center space-x-3 transition ${
                    isSelected
                      ? 'bg-[#0f3a5d] text-white shadow-xs font-semibold'
                      : 'hover:bg-slate-50 text-slate-700 border border-slate-100'
                  }`}
                >
                  <img
                    src={s.photoUrl}
                    alt={s.firstName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">
                      {s.firstName} {s.lastName}
                    </div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                      {s.staffId} • {s.designation}
                    </div>
                  </div>
                  <span
                    className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : s.employmentStatus === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {s.employmentStatus}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: ID Card Live Stage */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Live Card Preview (CR80 Standard: 85.6mm x 54mm)
              </h2>
              <p className="text-xs text-slate-500">
                Front and back layout automatically synchronized with database records.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              ✓ Ready for Print
            </span>
          </div>

          {currentStaff ? (
            <IdCard
              staff={currentStaff}
              qrDataUrl={qrDataUrl}
              verificationUrl={verificationUrl}
              settings={settings || undefined}
              showActions={true}
            />
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              Select a staff member from the left to preview their institutional ID card.
            </div>
          )}
        </div>
      </div>

      {/* Batch Modal */}
      <BatchPrintModal
        staffIds={staffList.map((s) => s.id)}
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        settings={settings || undefined}
      />
    </div>
  );
};
