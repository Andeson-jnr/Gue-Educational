import React, { useRef } from 'react';
import { Staff, SystemSettings } from '../types/index.js';
import { QrCode, Printer, Download, ExternalLink } from 'lucide-react';
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
  const address = settings?.address || 'Former Chief Magistrate Court, Behind Township hall, Tse Gyer Strt, Wannune Tarka LGA';
  const phone = settings?.phone || '08103769128';
  const email = settings?.email || 'support@guevte.com';

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
    doc.setFillColor(30, 58, 138); // Deep blue header
    doc.rect(0, 0, 85.6, 14, 'F');

    const logoImg = settings?.logoUrl || '/gue_logo.jpg';
    if (logoImg) {
      try {
        doc.addImage(logoImg, 'JPEG', 2, 2, 10, 10);
      } catch {
        // Fallback
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('GUE EDUCATIONAL LIMITED', 44, 4, { align: 'center' });

    doc.setFontSize(5);
    doc.setFont('helvetica', 'italic');
    doc.text('... A subsidiary of Gue Group Limited', 44, 7.5, { align: 'center' });

    doc.setFillColor(220, 38, 38); // Red divider
    doc.rect(14, 9.5, 60, 0.5, 'F');

    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('TRAINING • KNOWLEDGE • EMPOWERMENT', 44, 12.5, { align: 'center' });

    // STAFF ID CARD pill
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(26, 15, 33.6, 3.5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text('STAFF ID CARD', 43, 17.5, { align: 'center' });

    // Passport Photo box placeholder
    doc.setDrawColor(150, 150, 150);
    doc.roundedRect(6, 20, 22, 28, 1, 1, 'S');
    doc.setFontSize(5);
    doc.setTextColor(100, 100, 100);
    doc.text('PASSPORT', 17, 33, { align: 'center' });
    doc.text('PHOTO', 17, 36, { align: 'center' });

    // Staff photo if available
    if (staff.photoUrl) {
      try {
        doc.addImage(staff.photoUrl, 'JPEG', 6, 20, 22, 28);
      } catch {
        // Fallback
      }
    }

    // Details text
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');

    const fullName = `${staff.firstName} ${staff.middleName ? staff.middleName + ' ' : ''}${staff.lastName}`.toUpperCase();

    doc.text('STAFF NAME:', 31, 23);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(fullName, 31, 27);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('STAFF ID:', 31, 31);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(staff.staffId, 50, 31);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('DEPARTMENT:', 31, 35);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(staff.departmentName || 'General Administration', 52, 35);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('DESIGNATION:', 31, 39);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(staff.designation || 'Staff', 52, 39);

    // Front Footer bar
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 50, 85.6, 3.98, 'F');

    // Page 2: Back
    doc.addPage([85.6, 53.98], 'landscape');

    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 85.6, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPANY DETAILS', 42.8, 6.5, { align: 'center' });

    // Address
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('ADDRESS:', 5, 13.5);
    doc.setFont('helvetica', 'normal');
    doc.text(address, 5, 16.5, { maxWidth: 50 });

    // Return policy
    doc.setFont('helvetica', 'bold');
    doc.text('RETURN POLICY:', 5, 22.5);
    doc.setFont('helvetica', 'normal');
    doc.text('If found, please return to GUE EDUCATIONAL LIMITED at the address above. This card is a property of GUE EDUCATIONAL LIMITED. It must be returned upon termination of employment. Unauthorized use or duplication is prohibited.\nFor enquiries: www.guevte.com / 08103769128', 5, 25.5, { maxWidth: 50, lineHeightFactor: 1.2 });

    // QR Code on right
    if (qrDataUrl) {
      try {
        doc.addImage(qrDataUrl, 'PNG', 58, 12, 22, 22);
      } catch {
        doc.rect(58, 12, 22, 22);
      }
    }
    doc.setFontSize(5);
    doc.setTextColor(100, 100, 100);
    doc.text('Scan me!', 69, 36, { align: 'center' });

    // Not transferable badge
    doc.setFillColor(100, 116, 139);
    doc.roundedRect(6, 38, 73.6, 3.5, 0.5, 0.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'bold');
    doc.text('NOT TRANSFERABLE. BEARER IS AUTHORIZED STAFF OF GUE EDUCATIONAL LIMITED', 42.8, 40.2, { align: 'center' });

    // Valid
    doc.setFontSize(5);
    doc.setTextColor(30, 30, 30);
    doc.text('----------------------- VALID -----------------------', 42.8, 45, { align: 'center' });

    // Back Footer
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 47, 85.6, 6.98, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(4.5);
    doc.text(`📞 ${phone}   |   ✉️ ${email}   |   🌐 www.guevte.com`, 42.8, 51, { align: 'center' });

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
      {/* Printable ID Card Container (Front & Back matching exact reference design) */}
      <div
        ref={cardRef}
        id="id-card-print-area"
        className="flex flex-col xl:flex-row items-center justify-center gap-8 print:flex-col print:gap-4 print:items-center print:justify-start"
      >
        {/* ==================== CARD FRONT ==================== */}
        <div
          id="id-card-front"
          className="relative w-[340px] sm:w-[380px] h-[220px] sm:h-[240px] rounded-xl shadow-xl overflow-hidden border border-slate-300 bg-white flex flex-col justify-between select-none print:shadow-none print:border print:border-black"
        >
          {/* Top Header Banner */}
          <div className="bg-[#1e3a8a] text-white px-3 py-2 flex flex-col items-center relative border-b-2 border-red-600">
            <div className="w-full flex items-center justify-between">
              {/* Emblem / Logo Box */}
              <div className="w-9 h-9 bg-white rounded-md flex items-center justify-center p-0.5 shadow border border-slate-200 overflow-hidden flex-shrink-0">
                <img
                  src={settings?.logoUrl || '/gue_logo.jpg'}
                  alt="GUE Emblem"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Organization Title */}
              <div className="text-center flex-1 mx-2">
                <div className="text-[12px] sm:text-[13px] font-extrabold tracking-tight text-white uppercase leading-none">
                  {orgName}
                </div>
                <div className="text-[7.5px] sm:text-[8px] text-slate-200 font-medium italic mt-0.5">
                  ... A subsidiary of Gue Group Limited
                </div>
              </div>
              <div className="w-9"></div> {/* spacing balance */}
            </div>

            {/* Motto Ribbon */}
            <div className="mt-1 text-[7px] sm:text-[7.5px] font-bold text-amber-300 tracking-widest uppercase">
              TRAINING • KNOWLEDGE • EMPOWERMENT
            </div>
          </div>

          {/* Sub-header Pill */}
          <div className="flex justify-center -mt-1 z-10">
            <span className="bg-[#1e3a8a] text-white text-[8px] sm:text-[9px] font-extrabold px-4 py-0.5 rounded-md shadow uppercase tracking-wider border border-blue-400">
              STAFF ID CARD
            </span>
          </div>

          {/* Middle Body */}
          <div className="px-3.5 py-1.5 flex items-center gap-3.5 flex-1">
            {/* Passport Photo Box */}
            <div className="relative flex-shrink-0">
              <div className="w-20 sm:w-24 h-24 sm:h-28 rounded-lg overflow-hidden border-2 border-dashed border-slate-400 shadow-sm bg-slate-100 flex flex-col items-center justify-center text-center p-1">
                {staff.photoUrl ? (
                  <img
                    src={staff.photoUrl}
                    alt={`${staff.firstName} ${staff.lastName}`}
                    className="w-full h-full object-cover rounded"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-slate-400 font-semibold text-[9px] uppercase tracking-wider leading-tight">
                    PASSPORT PHOTO
                  </div>
                )}
              </div>
            </div>

            {/* Staff Details (Strictly matching reference layout) */}
            <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
              <div>
                <div className="text-[7px] sm:text-[7.5px] font-bold text-slate-500 uppercase tracking-tight">STAFF NAME:</div>
                <div className="text-[12px] sm:text-[13px] font-extrabold text-[#1e3a8a] leading-tight truncate">
                  {staff.firstName} {staff.middleName ? `${staff.middleName} ` : ''}{staff.lastName}
                </div>
              </div>

              <div>
                <div className="text-[7px] sm:text-[7.5px] font-bold text-slate-500 uppercase tracking-tight">STAFF ID:</div>
                <div className="text-[10.5px] sm:text-[11.5px] font-mono font-bold text-slate-900">
                  {staff.staffId}
                </div>
              </div>

              <div>
                <div className="text-[7px] sm:text-[7.5px] font-bold text-slate-500 uppercase tracking-tight">DEPARTMENT:</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-800 truncate">
                  {staff.departmentName || 'General Administration'}
                </div>
              </div>

              <div>
                <div className="text-[7px] sm:text-[7.5px] font-bold text-slate-500 uppercase tracking-tight">DESIGNATION:</div>
                <div className="text-[9px] sm:text-[10px] font-semibold text-slate-700 truncate">
                  {staff.designation || 'Staff'}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Bar */}
          <div className="bg-[#1e3a8a] h-3.5 w-full"></div>
        </div>

        {/* ==================== CARD BACK ==================== */}
        <div
          id="id-card-back"
          className="relative w-[340px] sm:w-[380px] h-[220px] sm:h-[240px] rounded-xl shadow-xl overflow-hidden border border-slate-300 bg-white flex flex-col justify-between select-none print:shadow-none print:border print:border-black"
        >
          {/* Header */}
          <div className="bg-[#1e3a8a] text-white px-3 py-2 flex items-center justify-center">
            <div className="text-[11px] sm:text-[12px] font-black uppercase tracking-wider text-white">
              COMPANY DETAILS
            </div>
          </div>

          {/* Body Content */}
          <div className="px-3.5 py-1.5 flex-1 flex flex-col justify-between text-[7.5px] sm:text-[8px] text-slate-800 leading-snug">
            <div className="flex gap-2 items-start justify-between">
              {/* Left Column: Address & Return Policy */}
              <div className="flex-1 space-y-1.5">
                <div>
                  <span className="font-extrabold text-[#1e3a8a] uppercase block text-[7.5px]">ADDRESS:</span>
                  <p className="text-slate-700 text-[7px] sm:text-[7.5px] leading-tight">
                    {address}
                  </p>
                </div>

                <div>
                  <span className="font-extrabold text-[#1e3a8a] uppercase block text-[7.5px]">RETURN POLICY:</span>
                  <p className="text-slate-700 text-[6.5px] sm:text-[7px] leading-tight">
                    If found, please return to GUE EDUCATIONAL LIMITED at the address above. This card is a property of GUE EDUCATIONAL LIMITED. It must be returned upon termination of employment. Unauthorized use or duplication is prohibited. For enquiries: www.guevte.com / 08103769128
                  </p>
                </div>
              </div>

              {/* Right Column: QR Code */}
              <div className="flex flex-col items-center flex-shrink-0 pl-1">
                <div className="w-16 sm:w-18 h-16 sm:h-18 p-1 bg-white border border-slate-300 rounded shadow-sm">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Verification QR"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <QrCode className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <span className="text-[7px] font-bold text-slate-600 mt-0.5 flex items-center gap-0.5">
                  👉 Scan me!
                </span>
              </div>
            </div>

            {/* Authorization Notice Badge */}
            <div className="bg-slate-600 text-white py-0.5 px-2 rounded text-center font-bold text-[7px] tracking-tight uppercase shadow-inner my-1">
              NOT TRANSFERABLE . BEARER IS AUTHORIZED STAFF OF GUE EDUCATIONAL LIMITED
            </div>

            {/* Validity Line */}
            <div className="text-[7.5px] font-bold text-slate-800 flex items-center justify-center gap-1.5 w-full">
              <span className="text-slate-400 font-mono text-[7px] tracking-widest">----------------</span>
              <span className="text-slate-900 font-extrabold uppercase px-1">VALID</span>
              <span className="text-slate-400 font-mono text-[7px] tracking-widest">----------------</span>
            </div>
          </div>

          {/* Bottom Footer Contact */}
          <div className="bg-[#1e3a8a] text-white px-2 py-1 flex items-center justify-around text-[7px] sm:text-[7.5px] font-medium">
            <div className="flex items-center space-x-1">
              <span>📞 {phone}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>✉️ {email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🌐 www.guevte.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      {showActions && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <button
            id="btn-print-id-card"
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-[#1e3a8a] hover:bg-blue-900 text-white font-medium text-sm px-4 py-2 rounded-lg shadow transition"
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
