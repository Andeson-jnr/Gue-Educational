import React, { useState, useEffect } from 'react';
import { Staff } from '../types/index.js';
import { api } from '../services/api.js';
import { QrCode, Copy, Check, Download, ExternalLink, X, Loader2 } from 'lucide-react';

interface QrModalProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ staff, isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && staff) {
      setLoading(true);
      api
        .getStaffQr(staff.id)
        .then((res) => {
          setQrDataUrl(res.qrDataUrl);
          setVerificationUrl(res.verificationUrl);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, staff]);

  if (!isOpen || !staff) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `GUE_QR_${staff.staffId.replace(/\//g, '_')}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="bg-[#0f3a5d] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm">Staff Verification QR Code</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          <div className="font-bold text-slate-800 text-base">
            {staff.firstName} {staff.lastName}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {staff.designation} • <span className="font-mono font-semibold">{staff.staffId}</span>
          </div>

          <div className="my-5 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
            {loading ? (
              <div className="w-48 h-48 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#0f3a5d]" />
              </div>
            ) : (
              <img src={qrDataUrl} alt="Staff QR" className="w-48 h-48 object-contain" />
            )}
          </div>

          <div className="text-xs font-mono font-bold text-[#0f3a5d] bg-slate-100 px-3 py-1 rounded-md mb-3">
            Token: {staff.verificationToken}
          </div>

          <div className="w-full text-left bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Encoded Verification URL</div>
            <div className="font-mono text-[11px] text-slate-700 break-all">{verificationUrl}</div>
          </div>

          <div className="mt-5 w-full flex items-center justify-center gap-2">
            <button
              onClick={handleCopyUrl}
              className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3 rounded-lg border border-slate-300 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center space-x-1.5 bg-[#0f3a5d] hover:bg-[#164e7d] text-white font-semibold text-xs py-2 px-3 rounded-lg shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>

            <a
              href={`/v/${staff.verificationToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition"
              title="Open public verification page in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
