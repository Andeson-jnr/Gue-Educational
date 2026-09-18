import React, { useState } from 'react';
import { api } from '../services/api.js';
import { User, SystemSettings } from '../types/index.js';
import { ShieldCheck, Lock, User as UserIcon, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  settings?: SystemSettings | null;
  onGoToPublicVerify: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  settings,
  onGoToPublicVerify,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@GUE2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const orgName = settings?.orgName || 'GUE EDUCATIONAL LIMITED';
  const centre = settings?.trainingCentreName || 'Skills Training Centre, Wannune';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(username.trim(), password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Emblem */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-white border-2 border-[#c59b27] p-1 shadow-xl mb-4 flex items-center justify-center overflow-hidden">
          <img
            src={settings?.logoUrl || '/gue_logo.jpg'}
            alt="GUE Emblem"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
          {orgName}
        </h2>
        <p className="text-xs text-amber-300 font-semibold mt-1">
          {centre}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Staff Management &amp; Institutional ID Verification System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white text-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-700">
          <div className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#0f3a5d]">
              <Lock className="w-5 h-5 text-[#0f3a5d]" />
              <h3 className="text-base font-bold">Administrator Sign-In</h3>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
              Secure RBAC
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Username or Official Email
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="input-login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or admin@gue.edu.ng"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d] text-slate-900 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="input-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0f3a5d] text-slate-900 bg-slate-50"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#0f3a5d] hover:bg-[#164e7d] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#0f3a5d] transition disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Access Staff Management System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Institutional Test Credentials Quick-Fill Bar */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Institutional Demo Roles (Click to autofill):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'Admin@GUE2026!')}
                className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded font-semibold text-center transition"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('director', 'Director@GUE2026!')}
                className="p-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded font-semibold text-center transition"
              >
                Director
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('hr_admin', 'HRAdmin@GUE2026!')}
                className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded font-semibold text-center transition"
              >
                HR Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('auditor', 'Auditor@GUE2026!')}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded font-semibold text-center transition"
              >
                Auditor
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onGoToPublicVerify}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-center space-x-1 mx-auto"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Go to Public QR Verification Portal</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400">
          Wannune, Tarka LGA, Benue State, Nigeria • RC: 9451933
        </div>
      </div>
    </div>
  );
};
