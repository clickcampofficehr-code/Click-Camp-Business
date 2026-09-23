import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { MainNavTab, UserRole } from '../../types';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Briefcase,
  FolderOpen,
  MessageSquare,
  Mail,
  Video,
  LifeBuoy,
  FileText,
  Lock,
  Unlock,
  LogOut,
  Bell,
  Clock,
  Coffee,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  UserCheck,
  UserPlus,
  Camera
} from 'lucide-react';

// Profile Settings & Custom PFP
import { ProfileSettingsModal } from '../profile/ProfileSettingsModal';
import { DatabaseSyncModal } from '../common/DatabaseSyncModal';

// Role-specific Workspaces
import { AdminWorkspace } from '../dashboard/AdminWorkspace';
import { HRWorkspace } from '../dashboard/HRWorkspace';
import { OpsWorkspace } from '../dashboard/OpsWorkspace';
import { TeamLeaderWorkspace } from '../dashboard/TeamLeaderWorkspace';
import { EmployeeWorkspace } from '../dashboard/EmployeeWorkspace';

// Shared Enterprise Modules
import { DmsWorkspace } from '../dashboard/DmsWorkspace';
import { ChatWorkspace } from '../dashboard/ChatWorkspace';
import { WebmailWorkspace } from '../dashboard/WebmailWorkspace';
import { MeetingsWorkspace } from '../dashboard/MeetingsWorkspace';
import { SupportFinanceWorkspace } from '../dashboard/SupportFinanceWorkspace';
import { AuditLogWorkspace } from '../dashboard/AuditLogWorkspace';
import { OnboardingPortal } from '../auth/OnboardingPortal';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    allUsers,
    activeTab,
    setActiveTab,
    switchUserRole,
    logoutUser,
    lockScreen,
    punchState,
    liveIstTime,
    elapsedSeconds,
    clockIn,
    clockOut,
    toggleBreak,
    notifications,
    markAllNotificationsRead,
    clientAccounts,
    pendingOnboarding,
    leaves,
    webmail,
    isProfileLockEnforced,
    unlockedHubs,
    isHubLockedForUser,
    requestHubAccess,
    setIsProfileSettingsOpen
  } = useWorkspace();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);

  // Format punch clock elapsed time HH:MM:SS
  const formatElapsed = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Navigation Items
  const navItems: {
    id: MainNavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    isEmployeeHub?: boolean;
    clearance?: string;
  }[] = [
    // 5 Core Authorized Employee Hubs:
    {
      id: 'webmail',
      label: 'Webmail Client',
      icon: <Mail className="w-4 h-4" />,
      badge: webmail.filter((m) => m.folder === 'inbox' && !m.isRead).length,
      isEmployeeHub: true,
      clearance: 'Employee Permitted'
    },
    {
      id: 'meetings',
      label: 'Meeting Hub & MOM',
      icon: <Video className="w-4 h-4" />,
      isEmployeeHub: true,
      clearance: 'Employee Permitted'
    },
    {
      id: 'support_finance',
      label: 'Support & CRM',
      icon: <LifeBuoy className="w-4 h-4" />,
      isEmployeeHub: true,
      clearance: 'Employee Permitted'
    },
    {
      id: 'chat',
      label: 'Team Chat & Direct Messages',
      icon: <MessageSquare className="w-4 h-4" />,
      isEmployeeHub: true,
      clearance: 'Employee Permitted'
    },
    {
      id: 'dms',
      label: 'Document System (DMS)',
      icon: <FolderOpen className="w-4 h-4" />,
      isEmployeeHub: true,
      clearance: 'Employee Permitted'
    },
    {
      id: 'dashboard',
      label: `${currentUser.roleLabel} Workspace`,
      icon: <LayoutDashboard className="w-4 h-4" />,
      isEmployeeHub: true,
      clearance: 'Employee Permitted'
    },
    // Managerial & Administrative Operational Hubs (Restricted / Locked for Employees):
    {
      id: 'ops_queue',
      label: 'Ops Verification Queue',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: clientAccounts.filter((a) => a.status === 'pending').length,
      clearance: 'Operations Lead / Admin Clearance'
    },
    {
      id: 'team_hub',
      label: 'Team Leader Hub',
      icon: <Users className="w-4 h-4" />,
      clearance: 'Team Leader Clearance'
    },
    {
      id: 'hr_portal',
      label: 'HR & People Operations',
      icon: <Briefcase className="w-4 h-4" />,
      badge:
        pendingOnboarding.filter((o) => o.status === 'pending_approval').length +
        leaves.filter((l) => l.status === 'pending').length,
      clearance: 'HR & People Ops Clearance'
    },
    {
      id: 'onboarding',
      label: 'Employee Onboarding',
      icon: <UserPlus className="w-4 h-4" />,
      badge: pendingOnboarding.filter((o) => o.status === 'pending_approval').length || undefined,
      clearance: 'HR Administration Clearance'
    },
    {
      id: 'audit_logs',
      label: 'System Audit Logs',
      icon: <FileText className="w-4 h-4" />,
      clearance: 'Super Admin Security Clearance'
    }
  ];

  const handleTabSelect = (tab: MainNavTab, hubLabel?: string, clearance?: string) => {
    const success = requestHubAccess(tab, hubLabel, clearance);
    if (success) {
      setIsMobileSidebarOpen(false);
    }
  };

  // Render role-specific workspace component for the primary tab
  const renderRoleDashboard = () => {
    switch (currentUser.role) {
      case 'super_admin':
      case 'admin':
        return <AdminWorkspace />;
      case 'hr':
        return <HRWorkspace />;
      case 'ops':
        return <OpsWorkspace />;
      case 'team_leader':
        return <TeamLeaderWorkspace />;
      case 'employee':
      default:
        return <EmployeeWorkspace />;
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row">
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* PERSISTENT ENTERPRISE SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-72 bg-neutral-900 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 h-screen shrink-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-700 flex items-center justify-center font-bold text-sm text-emerald-400 shadow-md">
                CC
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
                  ClickCamp Technologies
                </h2>
                <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Workspace v3.0
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick RBAC Role Switcher with Profile Lock */}
          <div className="p-3 border-b border-neutral-800/80 bg-neutral-950/40 shrink-0">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5 px-1">
              <span className="flex items-center gap-1 text-neutral-300">
                {isProfileLockEnforced && <Lock className="w-3 h-3 text-amber-400" />}
                <span>Role Context</span>
              </span>
              <span
                className={`text-[9.5px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                  isProfileLockEnforced
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {isProfileLockEnforced ? 'Profile Locked' : 'RBAC Active'}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {(['super_admin', 'admin', 'hr', 'ops', 'team_leader', 'employee'] as UserRole[]).map((r) => {
                const isSelected = currentUser.role === r;
                const labels: Record<UserRole, string> = {
                  super_admin: 'SUP',
                  admin: 'ADM',
                  hr: 'HR',
                  ops: 'OPS',
                  team_leader: 'TL',
                  employee: 'EMP'
                };
                return (
                  <button
                    key={r}
                    onClick={() => switchUserRole(r)}
                    className={`py-1 text-[10px] font-bold rounded-md transition cursor-pointer border relative ${
                      isSelected
                        ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-xs'
                        : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:bg-neutral-700 hover:text-white'
                    }`}
                    title={
                      isSelected
                        ? `Current Active Profile: ${r.toUpperCase()}`
                        : isProfileLockEnforced
                        ? `Switch to ${r.toUpperCase()} Profile (Locked - Password Required)`
                        : `Switch to ${r.toUpperCase()} Persona`
                    }
                  >
                    {labels[r]}
                    {!isSelected && isProfileLockEnforced && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Links Scrollable */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 text-xs">
            {currentUser.role === 'employee' ? (
              <>
                <div className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>Permitted Hubs</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    5 Core Tools
                  </span>
                </div>

                {navItems
                  .filter((item) => item.isEmployeeHub)
                  .map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabSelect(item.id, item.label, item.clearance)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500 text-neutral-950 font-bold shadow-xs'
                            : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={isActive ? 'text-neutral-950' : 'text-neutral-400'}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>

                        {Boolean(item.badge) && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 shrink-0 ${
                              isActive
                                ? 'bg-neutral-950 text-emerald-400'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}

                <div className="pt-4 px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between border-t border-neutral-800/80 mt-3">
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Restricted Operational Hubs</span>
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Locked
                  </span>
                </div>
                <div className="px-2 pb-1.5 text-[10px] text-neutral-400 leading-tight">
                  Requires supervisor authorization password to unlock.
                </div>

                {navItems
                  .filter((item) => !item.isEmployeeHub)
                  .map((item) => {
                    const isActive = activeTab === item.id;
                    const isLocked = isHubLockedForUser(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabSelect(item.id, item.label, item.clearance)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500 text-neutral-950 font-bold shadow-xs'
                            : isLocked
                            ? 'text-neutral-400 hover:text-amber-200 hover:bg-neutral-800/70 border border-transparent hover:border-amber-500/30'
                            : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                        }`}
                        title={
                          isLocked
                            ? `${item.label} (Locked - Enter Supervisor Password to Unlock)`
                            : item.label
                        }
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={isActive ? 'text-neutral-950' : 'text-neutral-400'}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          {isLocked ? (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Locked</span>
                            </span>
                          ) : Boolean(item.badge) ? (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                                isActive
                                  ? 'bg-neutral-950 text-emerald-400'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
              </>
            ) : (
              <>
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Operational Hubs
                </div>

                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const isLocked = isHubLockedForUser(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id, item.label, item.clearance)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500 text-neutral-950 font-bold shadow-xs'
                          : isLocked
                          ? 'text-neutral-400 hover:text-amber-200 hover:bg-neutral-800/70 border border-transparent hover:border-amber-500/30'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                      }`}
                      title={
                        isLocked
                          ? `${item.label} (Locked - Enter Supervisor Password to Unlock)`
                          : item.label
                      }
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={isActive ? 'text-neutral-950' : 'text-neutral-400'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        {isLocked && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Locked</span>
                          </span>
                        )}

                        {Boolean(item.badge) && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                              isActive
                                ? 'bg-neutral-950 text-emerald-400'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* User Card & Security Controls in Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2 shadow-2xs">
            <button
              onClick={() => setIsProfileSettingsOpen(true)}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group hover:opacity-90 transition rounded-lg p-0.5"
              title="Profile Settings & Upload Photo"
            >
              <div className="relative shrink-0">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-700 group-hover:border-emerald-500 transition"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border border-emerald-500/50">
                    {currentUser.name
                      ? currentUser.name
                          .trim()
                          .split(/\s+/)
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'CC'}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-neutral-800 rounded-full border border-neutral-600 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-neutral-950 transition">
                  <Camera className="w-2 h-2" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-emerald-400 transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-neutral-400 truncate flex items-center gap-1">
                  <span>{currentUser.roleLabel}</span>
                  <span className="text-[9px] text-emerald-400 font-mono underline">Edit PFP</span>
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={lockScreen}
                className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                title="Lock Workstation (PIN Security)"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={logoutUser}
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Top Bar with Time & Attendance Controls */}
        <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Title */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-700">ClickCamp Hub</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-bold text-neutral-900 capitalize">
                {navItems.find((i) => i.id === activeTab)?.label || activeTab}
              </span>
            </div>
          </div>

          {/* Time & Attendance Quick Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live IST Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100/90 rounded-xl border border-neutral-200 text-xs font-mono font-semibold text-neutral-800">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{liveIstTime || 'IST Live'}</span>
            </div>

            {/* Punch Clock Widget */}
            <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-xl border border-neutral-200 text-xs">
              {punchState === 'clocked_in' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono font-bold text-neutral-900">
                    {formatElapsed(elapsedSeconds)}
                  </span>
                  <button
                    onClick={toggleBreak}
                    className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 text-[10px] font-bold cursor-pointer transition"
                    title="Take a quick break"
                  >
                    Break
                  </button>
                  <button
                    onClick={clockOut}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer transition shadow-2xs"
                  >
                    Clock Out
                  </button>
                </>
              ) : punchState === 'on_break' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-amber-800">On Break</span>
                  <button
                    onClick={toggleBreak}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition shadow-2xs"
                  >
                    Resume
                  </button>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  <span className="text-[11px] text-neutral-500 font-medium">Clocked Out</span>
                  <button
                    onClick={clockIn}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition shadow-2xs"
                  >
                    Clock In
                  </button>
                </>
              )}
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 p-3 z-50 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <span className="font-bold text-neutral-900">Notifications ({notifications.length})</span>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-emerald-600 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2 rounded-lg border transition ${
                          !n.isRead ? 'bg-emerald-50/50 border-emerald-200' : 'bg-neutral-50 border-neutral-100'
                        }`}
                      >
                        <p className="font-bold text-neutral-900 text-[11px]">{n.title}</p>
                        <p className="text-[11px] text-neutral-600 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-neutral-400 mt-1 block">{n.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Database & Real-Time Sync Status Trigger */}
            <button
              onClick={() => setIsDatabaseModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-800 cursor-pointer transition shadow-2xs group"
              title="Real-Time Database Sync Engine (Supabase / PostgreSQL)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">DB Sync</span>
            </button>

            {/* Profile Settings Avatar Trigger */}
            <button
              onClick={() => setIsProfileSettingsOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/80 rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer transition shadow-2xs group"
              title="Profile Settings & Custom PFP"
            >
              <div className="relative shrink-0">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover border border-neutral-300"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[9.5px] font-bold flex items-center justify-center">
                    {currentUser.name
                      ? currentUser.name
                          .trim()
                          .split(/\s+/)
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'CC'}
                  </div>
                )}
              </div>
              <span className="hidden sm:inline text-neutral-900 font-semibold text-xs">Profile</span>
              <Camera className="w-3 h-3 text-neutral-400 group-hover:text-emerald-600 transition-colors" />
            </button>

            {/* Lock Screen Shortcut Button */}
            <button
              onClick={lockScreen}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition"
              title="Lock Admin/Workstation Screen"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Lock Workstation</span>
            </button>
          </div>
        </header>

        {/* Content Body Router */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {isHubLockedForUser(activeTab) ? (
            <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl p-8 sm:p-10 border border-neutral-200 shadow-xl text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 mx-auto mb-4 shadow-xs">
                <Lock className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                <span>Operational Hub Lockdown</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-3">
                {navItems.find((i) => i.id === activeTab)?.label || 'Restricted Hub'}
              </h2>
              <p className="text-sm text-neutral-600 mt-2.5 max-w-lg mx-auto leading-relaxed">
                Direct access to this Operational Hub is locked under ClickCamp workplace security policy. Employee profiles are restricted to 5 authorized core tools: <strong>Webmail Client</strong>, <strong>Meeting Hub & MOM</strong>, <strong>Support & CRM</strong>, <strong>Team Chat & Direct Messages</strong>, and <strong>Document System (DMS)</strong>.
              </p>
              <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 max-w-md mx-auto">
                <span className="font-semibold text-neutral-700">Clearance Required:</span>{' '}
                {navItems.find((i) => i.id === activeTab)?.clearance || 'Supervisor Authorization Required'}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const item = navItems.find((i) => i.id === activeTab);
                    requestHubAccess(activeTab, item?.label, item?.clearance);
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Authorize Access with Supervisor Password</span>
                </button>
                <button
                  onClick={() => setActiveTab('webmail')}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>Go to Webmail Client</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderRoleDashboard()}
              {activeTab === 'ops_queue' && <OpsWorkspace />}
              {activeTab === 'team_hub' && <TeamLeaderWorkspace />}
              {activeTab === 'hr_portal' && <HRWorkspace />}
              {activeTab === 'onboarding' && <OnboardingPortal />}
              {activeTab === 'dms' && <DmsWorkspace />}
              {activeTab === 'chat' && <ChatWorkspace />}
              {activeTab === 'webmail' && <WebmailWorkspace />}
              {activeTab === 'meetings' && <MeetingsWorkspace />}
              {activeTab === 'support_finance' && <SupportFinanceWorkspace />}
              {activeTab === 'audit_logs' && <AuditLogWorkspace />}
            </>
          )}
        </main>
      </div>

      {/* Profile Settings & Custom PFP Modal */}
      <ProfileSettingsModal />

      {/* Real-time Database & Sync Control Modal */}
      <DatabaseSyncModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />
    </div>
  );
};
