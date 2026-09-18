import React, { useState, useEffect } from 'react';
import { User, SystemSettings } from './types/index.js';
import { api, authStorage } from './services/api.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar, TabType } from './components/Sidebar.js';
import { PublicVerification } from './pages/PublicVerification.js';
import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';
import { StaffList } from './pages/StaffList.js';
import { StaffForm } from './pages/StaffForm.js';
import { StaffDetail } from './pages/StaffDetail.js';
import { IdCardStudio } from './pages/IdCardStudio.js';
import { DepartmentsPage } from './pages/DepartmentsPage.js';
import { VerificationLogsPage } from './pages/VerificationLogsPage.js';
import { AuditLogsPage } from './pages/AuditLogsPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authStorage.getUser());
  const [currentTab, setCurrentTab] = useState<TabType | 'edit-staff' | 'staff-detail'>('dashboard');
  const [tabParams, setTabParams] = useState<any>({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isPublicVerificationMode, setIsPublicVerificationMode] = useState(false);
  const [publicVerificationToken, setPublicVerificationToken] = useState('');
  const [authChecked, setAuthChecked] = useState<boolean>(() => !authStorage.getToken());

  // Initialize Route Detection and Session Validation
  useEffect(() => {
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    // Check if path is /v or /v/:token or has ?v= or ?verify=
    if (pathname.startsWith('/v/') || pathname === '/v' || searchParams.has('v') || searchParams.has('verify')) {
      let token = '';
      if (pathname.startsWith('/v/')) {
        token = decodeURIComponent(pathname.replace('/v/', ''));
      } else if (searchParams.get('v')) {
        token = searchParams.get('v') || '';
      } else if (searchParams.get('verify')) {
        token = searchParams.get('verify') || '';
      }
      setPublicVerificationToken(token);
      setIsPublicVerificationMode(true);
    }

    // Check existing stored auth
    const token = authStorage.getToken();
    const storedUser = authStorage.getUser();
    if (token && storedUser) {
      // Validate session with server
      api
        .getCurrentUser()
        .then((res) => {
          setCurrentUser(res.user);
          authStorage.setUser(res.user);
        })
        .catch(() => {
          authStorage.clear();
          setCurrentUser(null);
        })
        .finally(() => setAuthChecked(true));
    } else {
      authStorage.clear();
      setCurrentUser(null);
      setAuthChecked(true);
    }

    // Listen for unauthorized 401 events anywhere in the app
    const handleUnauthorized = () => {
      authStorage.clear();
      setCurrentUser(null);
      setAuthChecked(true);
    };
    window.addEventListener('gue:unauthorized', handleUnauthorized);

    // Fetch system settings
    api.getPublicSettings().then((res) => setSettings(res.settings)).catch(() => {});

    return () => {
      window.removeEventListener('gue:unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAuthChecked(true);
    setIsPublicVerificationMode(false);
  };

  const handleLogout = async () => {
    await api.logout();
    authStorage.clear();
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const handleNavigate = (tab: any, params: any = {}) => {
    setCurrentTab(tab);
    setTabParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in public verification view (accessed via QR code scan or link)
  if (isPublicVerificationMode) {
    return (
      <PublicVerification
        initialToken={publicVerificationToken}
        onNavigateToAdmin={() => setIsPublicVerificationMode(false)}
      />
    );
  }

  // While validating active session token
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#c59b27] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
            Verifying GUE Session...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, display the Login portal
  if (!currentUser) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        settings={settings}
        onGoToPublicVerify={() => {
          setIsPublicVerificationMode(true);
          setPublicVerificationToken('');
        }}
      />
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        user={currentUser}
        settings={settings}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Workspace with Sidebar & Content */}
      <div className="flex-1 flex">
        <Sidebar
          currentTab={(currentTab === 'edit-staff' || currentTab === 'staff-detail') ? 'staff' : currentTab}
          onSelectTab={(tab) => handleNavigate(tab)}
          userRole={currentUser?.role}
          onLogout={handleLogout}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <Dashboard onNavigate={handleNavigate} settings={settings} />
          )}

          {currentTab === 'staff' && (
            <StaffList
              onNavigate={handleNavigate}
              userRole={currentUser?.role}
              settings={settings}
              initialSelectedStaffId={tabParams?.selectedStaffId}
            />
          )}

          {currentTab === 'new-staff' && (
            <StaffForm onNavigate={handleNavigate} />
          )}

          {currentTab === 'edit-staff' && (
            <StaffForm staffIdToEdit={tabParams?.staffId} onNavigate={handleNavigate} />
          )}

          {currentTab === 'staff-detail' && (
            <StaffDetail
              staffId={tabParams?.staffId}
              onNavigate={handleNavigate}
              userRole={currentUser?.role}
              settings={settings}
            />
          )}

          {currentTab === 'id-cards' && (
            <IdCardStudio
              initialStaffId={tabParams?.staffId}
              settings={settings}
            />
          )}

          {currentTab === 'departments' && (
            <DepartmentsPage userRole={currentUser?.role} />
          )}

          {currentTab === 'verification-logs' && (
            <VerificationLogsPage />
          )}

          {currentTab === 'documents' && (
            <StaffList
              onNavigate={handleNavigate}
              userRole={currentUser?.role}
              settings={settings}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsPage />
          )}

          {currentTab === 'audit-logs' && (
            <AuditLogsPage />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              userRole={currentUser?.role}
              onSettingsUpdated={(updated) => {
                if (updated) {
                  setSettings(updated);
                } else {
                  api.getPublicSettings().then((res) => setSettings(res.settings)).catch(() => {});
                }
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
