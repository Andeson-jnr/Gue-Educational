import React, { useState } from 'react';
import { Staff, EmploymentStatus } from '../types/index.js';
import { AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';

interface StatusChangeModalProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (staffId: string, newStatus: EmploymentStatus, reason: string) => Promise<void>;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  staff,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [newStatus, setNewStatus] = useState<EmploymentStatus>('INACTIVE');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !staff) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide an institutional reason for this status change.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onConfirm(staff.id, newStatus, reason.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update employment status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDeactivating = newStatus === 'INACTIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          isDeactivating ? 'bg-rose-700' : 'bg-[#0f3a5d]'
        }`}>
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">
              Change Staff Employment Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
            <div className="font-bold text-slate-800">
              {staff.firstName} {staff.lastName}
            </div>
            <div className="text-slate-600 text-xs">
              Staff ID: <span className="font-mono font-semibold">{staff.staffId}</span> | Designation: {staff.designation}
            </div>
            <div className="text-xs mt-1 text-slate-500">
              Current Status:{' '}
              <span className="font-semibold uppercase text-slate-700">{staff.employmentStatus}</span>
            </div>
          </div>

          {isDeactivating && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2 text-rose-800 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Immediate Institutional Impact:</strong> Deactivating this staff record will immediately prevent this person from appearing as an active staff member when their physical ID card QR code is scanned.
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select New Status *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as EmploymentStatus)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
            >
              <option value="ACTIVE">ACTIVE — Full active staff clearance</option>
              <option value="INACTIVE">INACTIVE — Left organisation / Retired / Contract ended</option>
              <option value="SUSPENDED">SUSPENDED — Temporary institutional disciplinary hold</option>
              <option value="ON_LEAVE">ON_LEAVE — Sabbatical / Medical / Research leave</option>
              <option value="TRANSFERRED">TRANSFERRED — Reassigned to another institution</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reason for Status Change (Recorded in Audit Trail) *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. End of 1-year training contract on 31 Dec 2025; or Approved sabbatical leave per memo GUE/HR/2026/04."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition flex items-center space-x-1.5 ${
                isDeactivating
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-[#0f3a5d] hover:bg-[#164e7d]'
              }`}
            >
              {isSubmitting ? (
                <span>Updating...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Status Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
