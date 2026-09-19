import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  Building2,
  ShieldAlert,
  BarChart3,
  FileText,
  History,
  Settings,
  LogOut,
  QrCode,
} from 'lucide-react';
import { Role } from '../types/index.js';

export type TabType =
  | 'dashboard'
  | 'staff'
  | 'new-staff'
  | 'departments'
  | 'id-cards'
  | 'verification-logs'
  | 'reports'
  | 'documents'
  | 'audit-logs'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userRole?: Role;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole = 'VIEWER',
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const roleDisplayNames: Record<Role, string> = {
    SUPER_ADMIN: 'SUPER ADMIN',
    HR_ADMIN: 'HR/ADMIN',
    DIRECTOR: 'DIRECTOR',
    VIEWER: 'VIEWER',
  };

  const roleColors: Record<Role, string> = {
    SUPER_ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    DIRECTOR: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    HR_ADMIN: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    VIEWER: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'VIEWER'],
    },
    {
      id: 'staff' as TabType,
      label: 'Staff Directory',
      icon: Users,
      roles: ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'VIEWER'],
    },
    {
      id: 'new-staff' as TabType,
      label: 'Add Staff',
      icon: UserPlus,
      roles: ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN'],
    },
    {
      id: 'id-cards' as TabType,
      label: 'ID Cards Studio',
      icon: CreditCard,
      roles: ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'VIEWER'],
    },
    {
      id: 'departments' as TabType,
      label: 'Departments',
      icon: Building2,
      roles: ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'VIEWER'],
    },
    {
      id: 'verification-logs' as TabType,
      label: 'Verification Logs',
      icon: ShieldAlert,
      roles: ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'VIEWER'],
    },
    {
      id: 'documents' as TabType,
      label: 'Staff Documents',
      icon: FileText,
      roles: ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'VIEWER'],
    },
    {
      id: 'reports' as TabType,
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'VIEWER'],
    },
    {
      id: 'audit-logs' as TabType,
      label: 'Audit Trail',
      icon: History,
      roles: ['SUPER_ADMIN', 'DIRECTOR'],
    },
    {
      id: 'settings' as TabType,
      label: 'System Settings',
      icon: Settings,
      roles: ['SUPER_ADMIN', 'DIRECTOR'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  const handleSelect = (tab: TabType) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="admin-sidebar"
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-20 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="font-bold text-white text-sm">GUE Staff Portal</div>
            <button
              onClick={onCloseMobile}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded"
            >
              Close
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-2">
              Core Modules
            </div>

            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#0f3a5d] text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick link to verification page */}
          <div className="pt-4 border-t border-slate-800">
            <a
              href="/v"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 transition"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Public Verification UI</span>
            </a>
          </div>
        </div>

        {/* Bottom logout and role area */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Access Level</span>
            <span
              className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${
                roleColors[userRole] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'
              }`}
            >
              {roleDisplayNames[userRole] || userRole}
            </span>
          </div>

          <button
            id="sidebar-btn-logout"
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
