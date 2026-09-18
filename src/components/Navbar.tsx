import React from 'react';
import { User, SystemSettings } from '../types/index.js';
import { ShieldCheck, LogOut, UserCheck, ExternalLink, Menu } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  settings?: SystemSettings | null;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  settings,
  onLogout,
  onToggleSidebar,
}) => {
  const orgName = settings?.orgName || 'GUE EDUCATIONAL LIMITED';
  const centre = settings?.trainingCentreName || 'Skills Training Centre, Wannune';

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
    DIRECTOR: 'bg-purple-100 text-purple-800 border-purple-200',
    HR_ADMIN: 'bg-blue-100 text-blue-800 border-blue-200',
    VIEWER: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const logoSrc = settings?.logoUrl || '/gue_logo.jpg';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-xs overflow-hidden flex-shrink-0">
              <img
                src={logoSrc}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/gue_logo.jpg';
                }}
                alt="GUE Emblem"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-sm font-bold text-[#0f3a5d] tracking-tight leading-tight flex items-center gap-1.5">
                <span>{orgName}</span>
                <span className="hidden sm:inline-block text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-1.5 py-0.2 rounded">
                  {settings?.orgRc || 'RC: 9451933'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium truncate max-w-[240px] sm:max-w-md">
                {centre}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Verification shortcut, User profile, Logout */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <a
            id="nav-link-public-verify"
            href="/v"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Public Verification Portal</span>
            <ExternalLink className="w-3 h-3 text-emerald-600" />
          </a>

          {user && (
            <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[160px]">
                  {user.fullName}
                </span>
                <span
                  className={`text-[9.5px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded border inline-block mt-0.5 ${
                    roleColors[user.role] || 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {user.role.replace('_', ' ')}
                </span>
              </div>

              <button
                id="btn-nav-logout"
                onClick={onLogout}
                title="Sign out of administration portal"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
