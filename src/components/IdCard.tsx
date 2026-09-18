import React, { useRef } from 'react';
import { Staff, SystemSettings } from '../types/index.js';
import { ShieldCheck, QrCode, Printer, Download, ExternalLink, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';

interface IdCardProps {
  staff: Staff;
  qrDataUrl?: string;
  verificationUrl?: string;
  settings?: SystemSettings;
  showActions?: boolean;
}

export const IdCard: React.FC<IdCardProps> = ({
  staff,
  qrDataUrl,
  verificationUrl,
  settings,
  showActions = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const orgName = settings?.orgName || 'GUE EDUCATIONAL LIMITED';
  const rc = settings?.orgRc || 'RC: 9451933';
  const tin = settings?.orgTin || 'TIN: 2620760246226';
  const trainingCentre = settings?.trainingCentreName || 'GUE Educational Limited Skills Training Centre';
  const address = settings?.address || 'Wannune, Tarka LGA, Benue State, Nigeria';
  const cardNotice = settings?.cardFooterNotice || 'Property of GUE Educational Limited. If found, please return to Wannune, Tarka LGA, Benue State.';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98], // CR80 standard card dimensions
    });

    // Page 1: Front
    doc.setFillColor(15, 58, 93); // Navy header
    doc.rect(0, 0, 85.6, 12, 'F');

    // Emblem in header
    const logoImg = settings?.logoUrl;
    if (logoImg) {
      try {
        const format = logoImg.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(logoImg, format, 3, 1.5, 9, 9);
      } catch {
        // Continue cleanly if cross-origin or relative URI without canvas
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(orgName, 42.8, 5, { align: 'center' });

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(trainingCentre, 42.8, 8.5, { align: 'center' });
    doc.text('STAFF IDENTITY CARD', 42.8, 11, { align: 'center' });

    // Gold accent divider
    doc.setFillColor(197, 155, 39);
    doc.rect(0, 12, 85.6, 1, 'F');

    // Content
    doc.setTextColor(15, 58, 93);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const fullName = `${staff.firstName} ${staff.middleName ? staff.middleName + ' ' : ''}${staff.lastName}`.toUpperCase();
    doc.text(fullName, 32, 20);

    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text(staff.designation, 32, 24);
    doc.text(staff.departmentName || 'Skills Training Centre', 32, 28);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 58, 93);
    doc.text(`ID: ${staff.staffId}`, 32, 33);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`Token: ${staff.verificationToken || 'GUE-AUTH'}`, 32, 37);
    doc.text(`Status: ${staff.employmentStatus}`, 32, 41);

    // QR on PDF if available
    if (qrDataUrl) {
      try {
        doc.addImage(qrDataUrl, 'PNG', 62, 16, 20, 20);
      } catch (e) {
        // Fallback text
        doc.rect(62, 16, 20, 20);
      }
    }

    // Footer bar
    doc.setFillColor(15, 58, 93);
    doc.rect(0, 49, 85.6, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(5);
    doc.text(`${rc} | ${tin}`, 42.8, 52.5, { align: 'center' });

    // Page 2: Back
    doc.addPage([85.6, 53.98], 'landscape');

    doc.setFillColor(15, 58, 93);
    doc.rect(0, 0, 85.6, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('STAFF ID VERIFICATION & CONDITIONS', 42.8, 5, { align: 'center' });

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text('1. This card certifies that the bearer is a recognised staff member.', 5, 13);
    doc.text('2. Scan the official QR code to verify live employment validity.', 5, 17);
    doc.text('3. If this record is inactive in the database, this card is void.', 5, 21);
    doc.text(`4. Verification URL: ${verificationUrl || 'https://verify.gue.edu.ng/v/' + staff.verificationToken}`, 5, 25);
    doc.text(`5. Address: ${address}`, 5, 29);
    doc.text(`6. Contact: ${settings?.phone || '+234 803 249 9451'} | ${settings?.email || 'info@gue.edu.ng'}`, 5, 33);
    doc.text('7. Authorized Signatory: Director, GUE Educational Limited', 5, 37);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5);
    doc.text(cardNotice, 42.8, 42, { align: 'center' });

    doc.setFillColor(15, 58, 93);
    doc.rect(0, 46, 85.6, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('GUE EDUCATIONAL LIMITED - SKILLS TRAINING CENTRE', 42.8, 51, { align: 'center' });

    doc.save(`${staff.staffId.replace(/\//g, '_')}_ID_Card.pdf`);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${staff.staffId.replace(/\//g, '_')}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Printable ID Card Container (Front & Back) */}
      <div
        ref={cardRef}
        id="id-card-print-area"
        className="flex flex-col xl:flex-row items-center justify-center gap-8 print:flex-col print:gap-4 print:items-center print:justify-start"
      >
        {/* CARD FRONT (Standard CR80 Ratio 85.6mm x 54mm) */}
        <div
          id="id-card-front"
          className="relative w-[340px] sm:w-[380px] h-[220px] sm:h-[240px] rounded-xl shadow-xl overflow-hidden border border-slate-300 bg-white flex flex-col justify-between select-none print:shadow-none print:border print:border-black"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          {/* Top Header Banner */}
          <div className="bg-[#0f3a5d] text-white px-3 py-2 flex items-center justify-between border-b-2 border-[#c59b27]">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm overflow-hidden flex-shrink-0 border border-amber-300/50">
                <img
                  src={settings?.logoUrl || '/gue_logo.jpg'}
                  alt="GUE Emblem"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="leading-tight">
                <div className="text-[11px] sm:text-[12px] font-bold tracking-tight text-white uppercase font-sans">
                  {orgName}
                </div>
                <div className="text-[7.5px] sm:text-[8.5px] text-amber-300 font-medium tracking-wide">
                  Skills Training Centre • Wannune
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-[#c59b27] text-slate-950 font-black text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                Staff ID
              </span>
            </div>
          </div>

          {/* Institutional Crest Watermark */}
          <div className="absolute right-6 top-14 opacity-[0.06] pointer-events-none w-28 h-28 flex items-center justify-center">
            <img
              src={settings?.logoUrl || '/gue_logo.jpg'}
              alt=""
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Middle Body */}
          <div className="px-3.5 py-2 flex items-center gap-3.5 flex-1">
            {/* Staff Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-20 sm:w-24 h-24 sm:h-28 rounded-lg overflow-hidden border-2 border-[#0f3a5d] shadow-md bg-slate-100">
                <img
                  src={staff.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={`${staff.firstName} ${staff.lastName}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Staff Text Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="text-[13px] sm:text-[14px] font-extrabold text-[#0f3a5d] leading-tight truncate">
                {staff.firstName} {staff.middleName ? `${staff.middleName} ` : ''}{staff.lastName}
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5 truncate">
                {staff.designation}
              </div>
              <div className="text-[8.5px] sm:text-[9.5px] text-slate-500 font-medium truncate">
                {staff.departmentName || 'General Administration'}
              </div>

              <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Staff ID Number</div>
                  <div className="text-[11px] sm:text-[12px] font-mono font-bold text-[#0f3a5d]">
                    {staff.staffId}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Status</div>
                  <span
                    className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      staff.employmentStatus === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : staff.employmentStatus === 'ON_LEAVE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {staff.employmentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center flex-shrink-0 pl-1">
              <div className="w-16 sm:w-18 h-16 sm:h-18 p-1 bg-white border border-slate-300 rounded shadow-sm">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Staff Verification QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <QrCode className="w-10 h-10" />
                  </div>
                )}
              </div>
              <span className="text-[7px] font-mono font-bold text-slate-600 mt-1">
                {staff.verificationToken || 'VERIFY'}
              </span>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="bg-slate-100 px-3 py-1 border-t border-slate-200 flex items-center justify-between text-[7.5px] sm:text-[8px] text-slate-600">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span className="font-semibold">{rc} • {tin}</span>
            </div>
            <div className="font-medium text-slate-500">
              Valid: Institutional Live DB
            </div>
          </div>
        </div>

        {/* CARD BACK (CR80 Standard Back) */}
        <div
          id="id-card-back"
          className="relative w-[340px] sm:w-[380px] h-[220px] sm:h-[240px] rounded-xl shadow-xl overflow-hidden border border-slate-300 bg-white flex flex-col justify-between select-none print:shadow-none print:border print:border-black"
        >
          {/* Header */}
          <div className="bg-[#0f3a5d] text-white px-3 py-1.5 flex items-center justify-between border-b-2 border-[#c59b27]">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Staff ID Verification & Terms
            </div>
            <div className="text-[7px] text-slate-300 font-mono">SEC-GUE-2026</div>
          </div>

          {/* Terms & Verification instructions */}
          <div className="px-4 py-2.5 flex-1 flex flex-col justify-around text-slate-700 text-[8px] sm:text-[8.5px] leading-relaxed">
            <div className="space-y-1">
              <p className="font-medium">
                • <strong className="text-slate-900">Verification Requirement:</strong> This identity card is property of <span className="font-bold text-[#0f3a5d]">{orgName}</span>. Scan the QR code or visit:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-center font-mono text-[8px] text-[#0f3a5d] font-bold">
                {verificationUrl || `https://verify.gue.edu.ng/v/${staff.verificationToken || '...'}`}
              </div>
              <p>
                • Physical card possession alone does not constitute valid authority. Only active status confirmed via the official verification system is recognized.
              </p>
              <p>
                • <strong className="text-slate-900">Loss or Misuse:</strong> If found, please return to: <span className="text-slate-800">{address}</span>.
              </p>
            </div>

            <div className="mt-1 pt-1.5 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-300 p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={settings?.logoUrl || '/gue_logo.jpg'}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/gue_logo.jpg';
                    }}
                    alt="Official Seal"
                    className="w-full h-full object-contain opacity-80"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="text-[7px] text-slate-400 uppercase font-bold">Authorized Signatory</div>
                  <div className="font-serif italic font-bold text-slate-800 text-[10px] mt-0.5">
                    Director
                  </div>
                  <div className="text-[6.5px] text-slate-500">GUE Educational Limited</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[7px] text-slate-400 uppercase font-bold">Enquiries</div>
                <div className="text-[7.5px] text-slate-700 font-semibold">{settings?.email || 'info@gue.edu.ng'}</div>
                <div className="text-[7.5px] text-slate-700">{settings?.phone || '+234 803 249 9451'}</div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bg-[#0f3a5d] text-white px-3 py-1 text-[7px] sm:text-[7.5px] text-center font-medium">
            {cardNotice}
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      {showActions && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <button
            id="btn-print-id-card"
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-[#0f3a5d] hover:bg-[#164e7d] text-white font-medium text-sm px-4 py-2 rounded-lg shadow transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print ID Card</span>
          </button>

          <button
            id="btn-download-pdf-card"
            onClick={handleDownloadPdf}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm px-4 py-2 rounded-lg shadow transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF (CR80)</span>
          </button>

          {qrDataUrl && (
            <button
              id="btn-download-qr"
              onClick={handleDownloadQr}
              className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Download QR Code</span>
            </button>
          )}

          {staff.verificationToken && (
            <a
              id="btn-test-verification-page"
              href={`/v/${staff.verificationToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Test Public Verification</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};
