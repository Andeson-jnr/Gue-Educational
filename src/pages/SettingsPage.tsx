import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { SystemSettings, Role } from '../types/index.js';
import { LogoUploader } from '../components/LogoUploader.js';
import {
  Settings,
  Building,
  Save,
  Download,
  Upload,
  Database,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface SettingsPageProps {
  userRole?: Role;
  onSettingsUpdated?: (updatedSettings?: SystemSettings) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userRole = 'VIEWER',
  onSettingsUpdated,
}) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [restoreText, setRestoreText] = useState('');

  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  useEffect(() => {
    api.getSettings().then((res) => setSettings(res.settings)).catch(() => {});
  }, []);

  const handleChange = (field: keyof SystemSettings, val: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: val });
  };

  const handleLogoChange = async (newLogoUrl: string) => {
    if (!settings) return;
    const updated = { ...settings, logoUrl: newLogoUrl };
    setSettings(updated);
    try {
      const res = await api.updateSettings(updated);
      setMessage('Institutional logo updated successfully and synchronized across Navbar and ID Cards.');
      if (onSettingsUpdated) onSettingsUpdated(res.settings || updated);
    } catch (err: any) {
      console.error('Failed to auto-save logo:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await api.updateSettings(settings);
      setMessage('Institutional settings successfully saved and synchronized.');
      if (onSettingsUpdated) onSettingsUpdated(res.settings || settings);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBackup = () => {
    const link = document.createElement('a');
    link.href = '/api/settings/backup';
    link.download = `GUE_System_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreBackup = async () => {
    if (!restoreText.trim()) {
      setError('Please paste valid JSON backup content.');
      return;
    }

    if (
      !window.confirm(
        'WARNING: Restoring a backup will overwrite the current database records. Proceed?'
      )
    ) {
      return;
    }

    try {
      await api.restoreBackup(restoreText);
      setMessage('Backup successfully restored! Refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to restore backup');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRestoreText(content);
    };
    reader.readAsText(file);
  };

  if (!settings) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Institutional Branding &amp; System Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure institutional legal credentials, card disclaimers, and database backups.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. INSTITUTIONAL VISUAL BRANDING & LOGO */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-[#0f3a5d]">
            <Sparkles className="w-5 h-5 text-[#c59b27]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              1. Institutional Visual Branding &amp; Emblem / Logo
            </h2>
          </div>

          <LogoUploader
            currentLogoUrl={settings.logoUrl || '/gue_logo.jpg'}
            onLogoChange={handleLogoChange}
            orgName={settings.orgName}
            trainingCentreName={settings.trainingCentreName}
          />
        </div>

        {/* 2. ORGANIZATION LEGAL CREDENTIALS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-[#0f3a5d]">
            <Building className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              2. Institutional Identity &amp; Corporate Registration
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Organization Name (CAC Registered) *
              </label>
              <input
                type="text"
                required
                value={settings.orgName}
                onChange={(e) => handleChange('orgName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Corporate Affairs Commission (RC Number) *
              </label>
              <input
                type="text"
                required
                value={settings.orgRc}
                onChange={(e) => handleChange('orgRc', e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Federal Tax Identification Number (TIN) *
              </label>
              <input
                type="text"
                required
                value={settings.orgTin}
                onChange={(e) => handleChange('orgTin', e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Skills Training Centre Name *
              </label>
              <input
                type="text"
                required
                value={settings.trainingCentreName}
                onChange={(e) => handleChange('trainingCentreName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Institutional Address *
              </label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Contact Phone
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Institutional Email (Inquiries &amp; Verification)
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>
          </div>
        </div>

        {/* 3. CARD ISSUANCE & VERIFICATION CONFIG */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-[#0f3a5d]">
            <Settings className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              3. ID Card Disclaimer &amp; Public Verification Domain
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Public Verification Domain / URL Base
              </label>
              <input
                type="text"
                value={settings.verificationBaseUrl}
                onChange={(e) => handleChange('verificationBaseUrl', e.target.value)}
                placeholder="e.g. https://verify.gue.edu.ng/v/"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                The cryptographic QR code printed on physical cards directly routes scanners to this domain.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Physical Card Back Notice / Return Address Disclaimer
              </label>
              <textarea
                rows={2}
                value={settings.cardFooterNotice}
                onChange={(e) => handleChange('cardFooterNotice', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f3a5d]"
              />
            </div>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="flex justify-end">
            <button
              id="btn-save-settings"
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0f3a5d] hover:bg-[#164e7d] text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        )}
      </form>

      {/* DATABASE BACKUP AND RESTORE */}
      {isSuperAdmin && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-slate-900">
            <Database className="w-5 h-5 text-[#0f3a5d]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              4. System Database Backup &amp; Disaster Recovery
            </h2>
          </div>

          <p className="text-xs text-slate-500">
            Export a full JSON snapshot of all registered staff records, departments, verification tokens, and audit trails.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">
                Download JSON Database Snapshot
              </div>
              <div className="text-[11px] text-slate-500">
                Contains complete live database state with tamper-proof structure.
              </div>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="flex items-center space-x-1.5 bg-[#0f3a5d] hover:bg-[#164e7d] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup (.json)</span>
            </button>
          </div>

          {/* Restore */}
          <div className="p-4 bg-rose-50/50 rounded-lg border border-rose-200 space-y-3">
            <div className="flex items-center space-x-2 text-rose-800">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">
                Restore Database from Backup
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Upload Backup File or Paste JSON
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 cursor-pointer mb-2"
              />
              <textarea
                rows={3}
                value={restoreText}
                onChange={(e) => setRestoreText(e.target.value)}
                placeholder="Or paste backup JSON content here..."
                className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <button
              onClick={handleRestoreBackup}
              disabled={!restoreText.trim()}
              className="bg-rose-700 hover:bg-rose-800 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition"
            >
              Confirm &amp; Restore Database
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
