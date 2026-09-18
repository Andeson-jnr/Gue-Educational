import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { PublicVerificationResult, SystemSettings } from '../types/index.js';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  XCircle,
  Search,
  Building,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowRight,
  ExternalLink,
  Info,
} from 'lucide-react';

interface PublicVerificationProps {
  initialToken?: string;
  onNavigateToAdmin?: () => void;
}

export const PublicVerification: React.FC<PublicVerificationProps> = ({
  initialToken = '',
  onNavigateToAdmin,
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [result, setResult] = useState<PublicVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    api.getPublicSettings().then((res) => setSettings(res.settings)).catch(() => {});
  }, []);

  const performVerification = async (tokenToVerify: string) => {
    const cleanToken = tokenToVerify.trim().toUpperCase();
    if (!cleanToken) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await api.verifyToken(cleanToken);
      setResult(data);
    } catch (err) {
      setResult({
        valid: false,
        codeStatus: 'INVALID',
        message: 'Could not connect to the verification server. Please verify network connectivity.',
        verificationId: cleanToken,
        verifiedAt: new Date().toISOString(),
        institution: {
          name: 'GUE EDUCATIONAL LIMITED',
          centre: 'Skills Training Centre, Wannune',
          rc: 'RC: 9451933',
          tin: 'TIN: 2620760246226',
          address: 'Wannune, Tarka LGA, Benue State, Nigeria',
          verifiedBy: 'GUE Educational Limited',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialToken) {
      performVerification(initialToken);
    }
  }, [initialToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(tokenInput);
  };

  const orgName = settings?.orgName || 'GUE EDUCATIONAL LIMITED';
  const rc = settings?.orgRc || 'RC: 9451933';
  const tin = settings?.orgTin || 'TIN: 2620760246226';
  const trainingCentre = settings?.trainingCentreName || 'GUE Educational Limited Skills Training Centre';
  const address = settings?.address || 'Wannune, Tarka LGA, Benue State, Nigeria';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* Institutional Top Banner */}
      <header className="bg-[#0f3a5d] text-white border-b-4 border-[#c59b27] shadow-md py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-14 h-14 rounded-xl bg-white border-2 border-amber-400/40 p-1 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={settings?.logoUrl || '/gue_logo.jpg'}
                alt="GUE Institutional Crest"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-tight font-sans">
                {orgName}
              </h1>
              <p className="text-xs text-amber-300 font-medium tracking-wide">
                {trainingCentre}
              </p>
              <p className="text-[10px] text-slate-300">
                {rc} • {tin} • {address}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-goto-admin"
              onClick={onNavigateToAdmin}
              className="flex items-center space-x-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg border border-white/20 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8 flex-1">
        {/* Verification Title and manual search box */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Institutional Identity Verification System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0f3a5d] tracking-tight">
            Staff Identity Credential Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
            Scan the QR code printed on the physical staff identity card, or enter the unique verification token below to query the live institutional database.
          </p>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex rounded-xl shadow-sm overflow-hidden border-2 border-slate-300 focus-within:border-[#0f3a5d] transition">
            <div className="relative flex-1 bg-white flex items-center pl-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                id="input-verification-token"
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="Enter Token (e.g. GUE-8F42K9X7)"
                className="w-full pl-2 pr-4 py-3 text-sm font-mono uppercase tracking-wider font-bold text-slate-800 focus:outline-hidden"
              />
            </div>
            <button
              id="btn-verify-token"
              type="submit"
              disabled={loading || !tokenInput.trim()}
              className="bg-[#0f3a5d] hover:bg-[#164e7d] disabled:opacity-50 text-white font-bold text-sm px-6 py-3 transition flex items-center space-x-2"
            >
              {loading ? (
                <span>Checking...</span>
              ) : (
                <>
                  <span>Verify</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Tokens helper for effortless testing */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">Quick Test Tokens:</span>
            <button
              type="button"
              onClick={() => {
                setTokenInput('GUE-8F42K9X7');
                performVerification('GUE-8F42K9X7');
              }}
              className="px-2 py-0.5 bg-white border border-slate-200 hover:border-emerald-500 rounded font-mono text-emerald-700 font-bold"
            >
              GUE-8F42K9X7 (Active)
            </button>
            <button
              type="button"
              onClick={() => {
                setTokenInput('GUE-6D33PW81');
                performVerification('GUE-6D33PW81');
              }}
              className="px-2 py-0.5 bg-white border border-slate-200 hover:border-rose-500 rounded font-mono text-rose-700 font-bold"
            >
              GUE-6D33PW81 (Inactive)
            </button>
            <button
              type="button"
              onClick={() => {
                setTokenInput('GUE-2B91JK44');
                performVerification('GUE-2B91JK44');
              }}
              className="px-2 py-0.5 bg-white border border-slate-200 hover:border-amber-500 rounded font-mono text-amber-700 font-bold"
            >
              GUE-2B91JK44 (Suspended)
            </button>
            <button
              type="button"
              onClick={() => {
                setTokenInput('GUE-4X92LMQ8');
                performVerification('GUE-4X92LMQ8');
              }}
              className="px-2 py-0.5 bg-white border border-slate-200 hover:border-blue-500 rounded font-mono text-blue-700 font-bold"
            >
              GUE-4X92LMQ8 (On Leave)
            </button>
            <button
              type="button"
              onClick={() => {
                setTokenInput('GUE-INVALID99');
                performVerification('GUE-INVALID99');
              }}
              className="px-2 py-0.5 bg-white border border-slate-200 hover:border-slate-500 rounded font-mono text-slate-600 font-bold"
            >
              Non-Existent
            </button>
          </div>
        </form>

        {/* Verification Result Card */}
        {hasSearched && result && (
          <div
            id="verification-result-container"
            className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200"
          >
            {/* STATUS HEADER BANNER */}
            {result.codeStatus === 'VERIFIED' && (
              <div className="bg-emerald-600 text-white px-6 py-4 flex items-center space-x-3">
                <CheckCircle2 className="w-7 h-7 flex-shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-widest font-black text-emerald-100">
                    Verification Outcome
                  </div>
                  <div className="text-lg sm:text-xl font-black tracking-tight">
                    ✓ STAFF ID VERIFIED
                  </div>
                </div>
              </div>
            )}

            {result.codeStatus === 'INACTIVE' && (
              <div className="bg-amber-600 text-white px-6 py-4 flex items-center space-x-3">
                <AlertTriangle className="w-7 h-7 flex-shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-widest font-black text-amber-100">
                    Verification Notice
                  </div>
                  <div className="text-lg sm:text-xl font-black tracking-tight">
                    ⚠ STAFF ID INACTIVE
                  </div>
                </div>
              </div>
            )}

            {result.codeStatus === 'SUSPENDED' && (
              <div className="bg-rose-700 text-white px-6 py-4 flex items-center space-x-3">
                <ShieldAlert className="w-7 h-7 flex-shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-widest font-black text-rose-200">
                    Institutional Hold
                  </div>
                  <div className="text-lg sm:text-xl font-black tracking-tight">
                    ⚠ STAFF RECORD NOT CURRENTLY ACTIVE
                  </div>
                </div>
              </div>
            )}

            {result.codeStatus === 'ON_LEAVE' && (
              <div className="bg-blue-600 text-white px-6 py-4 flex items-center space-x-3">
                <Info className="w-7 h-7 flex-shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-widest font-black text-blue-100">
                    Authorized Status
                  </div>
                  <div className="text-lg sm:text-xl font-black tracking-tight">
                    STAFF RECORD VALID — CURRENTLY ON APPROVED LEAVE
                  </div>
                </div>
              </div>
            )}

            {(result.codeStatus === 'INVALID' || result.codeStatus === 'REVOKED') && (
              <div className="bg-rose-600 text-white px-6 py-4 flex items-center space-x-3">
                <XCircle className="w-7 h-7 flex-shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-widest font-black text-rose-100">
                    System Alert
                  </div>
                  <div className="text-lg sm:text-xl font-black tracking-tight">
                    ✕ INVALID STAFF ID
                  </div>
                </div>
              </div>
            )}

            {/* BODY DETAILS */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Institution Statement */}
              <div className="border-b border-slate-200 pb-4">
                <div className="text-xs font-bold text-[#0f3a5d] uppercase tracking-wide">
                  {result.institution.name}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {result.message}
                </p>
              </div>

              {/* Staff Details (only if found) */}
              {result.staff && (
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {result.staff.photoUrl && (
                    <div className="w-28 h-32 rounded-xl overflow-hidden border-2 border-[#0f3a5d] shadow-sm bg-slate-100 flex-shrink-0 mx-auto sm:mx-0">
                      <img
                        src={result.staff.photoUrl}
                        alt={result.staff.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Full Name:
                        </span>
                        <span className="font-extrabold text-[#0f3a5d] text-base">
                          {result.staff.name}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Staff ID Number:
                        </span>
                        <span className="font-mono font-extrabold text-[#0f3a5d] text-base">
                          {result.staff.staffId}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Designation:
                        </span>
                        <span className="font-bold text-slate-800">
                          {result.staff.designation}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Department / Unit:
                        </span>
                        <span className="font-bold text-slate-800">
                          {result.staff.department}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 sm:col-span-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Institution:
                        </span>
                        <span className="font-bold text-slate-800">
                          {result.staff.institution}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Employment Status:
                        </span>
                        <span
                          className={`font-black uppercase text-sm ${
                            result.staff.employmentStatus === 'ACTIVE'
                              ? 'text-emerald-700'
                              : result.staff.employmentStatus === 'ON_LEAVE'
                              ? 'text-blue-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {result.staff.employmentStatus}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Verification ID:
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {result.verificationId}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Verified by footer notice */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Verified by: {result.institution.verifiedBy}</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    Query Time: {new Date(result.verifiedAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  This electronic verification queries the live GUE Educational Limited institutional registry database in real-time. In accordance with data-protection standards, confidential personal records (BVN, NIN, salary, residential address) are strictly withheld from public verification screens.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="text-slate-200 font-bold uppercase tracking-wider">
              {orgName}
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              {trainingCentre} • Wannune, Tarka LGA, Benue State, Nigeria
            </div>
          </div>
          <div className="text-slate-400 text-[11px]">
            Official Staff Identity Verification • {rc} • {tin}
          </div>
        </div>
      </footer>
    </div>
  );
};
