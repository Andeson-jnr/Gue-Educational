import React, { useState, useEffect } from 'react';
import { Staff, SystemSettings } from '../types/index.js';
import { api } from '../services/api.js';
import { IdCard } from './IdCard.js';
import { Printer, Download, X, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface BatchPrintModalProps {
  staffIds: string[];
  isOpen: boolean;
  onClose: () => void;
  settings?: SystemSettings;
}

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({
  staffIds,
  isOpen,
  onClose,
  settings,
}) => {
  const [cards, setCards] = useState<
    Array<{
      staff: Staff;
      qrDataUrl: string;
      verificationUrl: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && staffIds.length > 0) {
      setLoading(true);
      api
        .getBatchCards(staffIds)
        .then((res) => {
          setCards(res.cards || []);
        })
        .catch((err) => {
          console.error('Failed to load batch cards:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, staffIds]);

  if (!isOpen) return null;

  const handlePrintAll = () => {
    window.print();
  };

  const handleDownloadCombinedPdf = () => {
    if (cards.length === 0) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98], // CR80 standard dimensions
    });

    const orgName = settings?.orgName || 'GUE EDUCATIONAL LIMITED';
    const centre = settings?.trainingCentreName || 'Skills Training Centre, Wannune';
    const address = settings?.address || 'Wannune, Tarka LGA, Benue State, Nigeria';

    cards.forEach((card, index) => {
      if (index > 0) {
        doc.addPage([85.6, 53.98], 'landscape');
      }

      const s = card.staff;
      // Front
      doc.setFillColor(15, 58, 93);
      doc.rect(0, 0, 85.6, 12, 'F');

      // Dynamic Emblem
      if (settings?.logoUrl) {
        try {
          const format = settings.logoUrl.includes('image/png') ? 'PNG' : 'JPEG';
          doc.addImage(settings.logoUrl, format, 3, 1.5, 9, 9);
        } catch {
          // safe continue
        }
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(orgName, 42.8, 5, { align: 'center' });

      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text(centre, 42.8, 8.5, { align: 'center' });
      doc.text('STAFF IDENTITY CARD', 42.8, 11, { align: 'center' });

      doc.setFillColor(197, 155, 39);
      doc.rect(0, 12, 85.6, 1, 'F');

      doc.setTextColor(15, 58, 93);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const fullName = `${s.firstName} ${s.middleName ? s.middleName + ' ' : ''}${s.lastName}`.toUpperCase();
      doc.text(fullName, 30, 20);

      doc.setFontSize(7);
      doc.setTextColor(60, 60, 60);
      doc.text(s.designation, 30, 24);
      doc.text(s.departmentName || 'Skills Training Centre', 30, 28);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 58, 93);
      doc.text(`ID: ${s.staffId}`, 30, 33);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text(`Token: ${s.verificationToken || 'GUE-AUTH'}`, 30, 37);
      doc.text(`Status: ${s.employmentStatus}`, 30, 41);

      if (card.qrDataUrl) {
        try {
          doc.addImage(card.qrDataUrl, 'PNG', 62, 16, 20, 20);
        } catch {
          doc.rect(62, 16, 20, 20);
        }
      }

      doc.setFillColor(15, 58, 93);
      doc.rect(0, 49, 85.6, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.text(`${settings?.orgRc || 'RC: 9451933'} | ${settings?.orgTin || 'TIN: 2620760246226'}`, 42.8, 52.5, { align: 'center' });

      // Back Page
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
      doc.text('1. Scan QR code to verify live status in GUE official database.', 5, 14);
      doc.text(`2. Verification URL: ${card.verificationUrl}`, 5, 19);
      doc.text(`3. Address: ${address}`, 5, 24);
      doc.text(`4. Contact: ${settings?.phone || '+234 803 249 9451'} | ${settings?.email || 'info@gue.edu.ng'}`, 5, 29);
      doc.text('5. Authorized Signatory: Director, GUE Educational Limited', 5, 33);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(5);
      doc.text(settings?.cardFooterNotice || 'Property of GUE Educational Limited.', 42.8, 38, { align: 'center' });

      doc.setFillColor(15, 58, 93);
      doc.rect(0, 46, 85.6, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('GUE EDUCATIONAL LIMITED - SKILLS TRAINING CENTRE', 42.8, 51, { align: 'center' });
    });

    doc.save(`GUE_Batch_ID_Cards_${cards.length}_staff.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-[#0f3a5d] text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div>
            <h3 className="text-base font-bold">
              Batch Staff ID Card Generation & Print ({cards.length} Cards Selected)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              High-resolution print layout with live cryptographic verification QR codes.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintAll}
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print All Cards</span>
            </button>
            <button
              onClick={handleDownloadCombinedPdf}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3 py-1.5 rounded shadow transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Combined PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#0f3a5d] mb-2" />
              <p className="text-sm font-medium">Generating QR codes and compiling ID cards...</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No staff records selected.
            </div>
          ) : (
            <div className="space-y-12">
              {cards.map((card, idx) => (
                <div
                  key={card.staff.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 print:bg-white print:border-none print:p-0"
                >
                  <div className="text-xs font-bold text-slate-500 mb-3 print:hidden">
                    Card #{idx + 1}: {card.staff.firstName} {card.staff.lastName} ({card.staff.staffId})
                  </div>
                  <IdCard
                    staff={card.staff}
                    qrDataUrl={card.qrDataUrl}
                    verificationUrl={card.verificationUrl}
                    settings={settings}
                    showActions={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
