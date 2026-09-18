import React, { useState } from 'react';
import { api } from '../services/api.js';
import { Upload, FileSpreadsheet, Check, AlertCircle, X, Download } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  if (!isOpen) return null;

  const sampleCsv = `first_name,middle_name,last_name,designation,department,unit,employment_type,date_of_appointment,employment_status,email,phone
Terungwa,David,Akaa,Senior Instructor,STC,EIS,FULL_TIME,2026-02-01,ACTIVE,terungwa.akaa@gue.edu.ng,+2348039876543
Nguavese,Blessing,Iorliam,Administrative Officer,ADM,HRR,FULL_TIME,2026-01-20,ACTIVE,nguavese.iorliam@gue.edu.ng,+2348123456789
Dooshima,Faith,Tor,Junior Accountant,ACC,TRV,FULL_TIME,2026-02-10,ACTIVE,dooshima.tor@gue.edu.ng,+2348056789012`;

  const handleParse = (text: string) => {
    setCsvText(text);
    setErrors([]);
    setResultMessage('');

    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setErrors(['CSV must have a header row and at least one data row.']);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const requiredHeaders = ['first_name', 'last_name', 'designation'];
    const missing = requiredHeaders.filter((req) => !headers.includes(req));

    if (missing.length > 0) {
      setErrors([`Missing mandatory CSV headers: ${missing.join(', ')}`]);
      return;
    }

    const rows: any[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map((v) => v.trim());
      const rowObj: Record<string, string> = {};
      headers.forEach((header, idx) => {
        rowObj[header] = values[idx] || '';
      });

      if (!rowObj['first_name'] || !rowObj['last_name']) {
        parseErrors.push(`Line ${i + 1}: first_name and last_name are required.`);
      } else {
        rows.push(rowObj);
      }
    }

    setErrors(parseErrors);
    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    setIsSubmitting(true);
    setErrors([]);
    try {
      const res = await api.importStaffCsv(parsedRows);
      setResultMessage(`Successfully imported ${res.importedCount} staff records!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrors([err.message || 'CSV Import failed']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-[#0f3a5d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base">Batch Staff CSV Import</h3>
              <p className="text-xs text-slate-300">
                Bulk register institutional staff and generate cryptographic verification tokens.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Action to download or fill sample */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-xs text-slate-600 font-medium">Need sample format?</span>
            <button
              onClick={() => handleParse(sampleCsv)}
              className="text-xs font-bold text-[#0f3a5d] hover:underline flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Load Demo CSV Template</span>
            </button>
          </div>

          {/* Upload input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select CSV File from Computer
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>

          {/* Text Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Or Paste CSV Data Directly:
            </label>
            <textarea
              value={csvText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="first_name,middle_name,last_name,designation,department,unit,employment_type,date_of_appointment,employment_status,email,phone"
              rows={6}
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d]"
            />
          </div>

          {/* Validation Feedback */}
          {parsedRows.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
              <span className="font-semibold">
                ✓ {parsedRows.length} valid staff record{parsedRows.length > 1 ? 's' : ''} parsed and ready for insertion.
              </span>
              <span className="text-[11px] text-emerald-600">ID &amp; QR tokens will be generated automatically</span>
            </div>
          )}

          {errors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Validation Issues:</span>
              </div>
              {errors.map((err, idx) => (
                <div key={idx}>• {err}</div>
              ))}
            </div>
          )}

          {resultMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>{resultMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isSubmitting || parsedRows.length === 0}
            className="px-5 py-2 text-sm font-bold text-white bg-[#0f3a5d] hover:bg-[#164e7d] disabled:opacity-50 rounded-lg shadow-sm transition flex items-center space-x-1.5"
          >
            {isSubmitting ? (
              <span>Importing Staff...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Import {parsedRows.length} Staff Records</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
