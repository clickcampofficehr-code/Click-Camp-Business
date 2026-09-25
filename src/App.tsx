import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { LoginPortal } from './components/auth/LoginPortal';
import { DashboardView } from './components/views/DashboardView';
import { ScreenLockModal } from './components/common/ScreenLockModal';
import { ProfileSwitchAuthModal } from './components/common/ProfileSwitchAuthModal';
import { OperationalHubAuthModal } from './components/common/OperationalHubAuthModal';
import { CompanyLogo } from './components/common/CompanyLogo';
import { CompanyLogoModal } from './components/common/CompanyLogoModal';
import { Compass, ShieldCheck, CheckCircle2 } from 'lucide-react';

const WorkspaceAppContent: React.FC = () => {
  const { isAuthenticated, activeTab, currentUser, activeToast, clearToast } = useWorkspace();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 font-sans selection:bg-emerald-500 selection:text-neutral-950">
      {/* Top Next.js App Router Simulated Navigation Bar */}
      <header className="bg-neutral-950 text-white border-b border-neutral-800 px-4 py-2 flex items-center justify-between text-xs shadow-xs z-40 select-none">
        <div className="flex items-center gap-3">
          <CompanyLogo variant="compact" size="xs" theme="dark" />

          <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block" />

          {/* Simulated App Router Dynamic Route Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-900 rounded-md border border-neutral-800 font-mono text-[11px] text-neutral-300">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>app/{!isAuthenticated ? 'login' : `workspace/${currentUser.role}/${activeTab}`}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span
              className={`w-2 h-2 rounded-full ${
                isAuthenticated ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline">
              {isAuthenticated ? `Session: ${currentUser.roleLabel}` : 'Session: Unauthenticated'}
            </span>
          </div>
        </div>
      </header>

      {/* Screen Lock Security Layer */}
      <ScreenLockModal />

      {/* Profile Switch Lockdown Authorization Modal */}
      <ProfileSwitchAuthModal />

      {/* Operational Hub Lockdown Authorization Modal */}
      <OperationalHubAuthModal />

      {/* Brand & Company Logo Manager Modal */}
      <CompanyLogoModal />

      {/* Floating System Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white border border-neutral-700 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-2 fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{activeToast}</span>
          <button
            onClick={clearToast}
            className="text-neutral-400 hover:text-white font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Authentication Gateway / Primary Workspace Router */}
      <div className="flex-1 flex flex-col">
        {!isAuthenticated ? <LoginPortal /> : <DashboardView />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceAppContent />
    </WorkspaceProvider>
  );
}
