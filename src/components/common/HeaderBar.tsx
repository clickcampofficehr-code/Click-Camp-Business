import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { UserRole } from '../../types';
import {
  Shield,
  Lock,
  Bell,
  Clock,
  LogOut,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Layers,
  Zap
} from 'lucide-react';

export const HeaderBar: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    logoutUser,
    lockScreen,
    liveIstTime,
    punchState,
    notifications,
    markAllNotificationsRead,
    isProfileLockEnforced
  } = useWorkspace();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const rolesList: { role: UserRole; name: string; title: string; badgeColor: string }[] = [
    { role: 'super_admin', name: 'Adnan Malik', title: 'Super Admin & Managing Director', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
    { role: 'admin', name: 'Ananya Sharma', title: 'Operations Director', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { role: 'hr', name: 'Priya Nambiar', title: 'HR & People Ops Lead', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
    { role: 'ops', name: 'Rohan Gupta', title: 'Ops Verification Officer', badgeColor: 'bg-sky-50 text-sky-700 border-sky-200' },
    { role: 'team_leader', name: 'Vikram Malhotra', title: 'Team Leader (Team Alpha)', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { role: 'employee', name: 'Rahul Verma', title: 'Employee / Client Ops', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  ];

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-xs">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Live IST Clock */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
              <span className="text-emerald-400 font-black text-base">C</span>C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-sm tracking-tight leading-none">
                  ClickCamp
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 hidden sm:block leading-tight">Operations Portal & Workspace</p>
            </div>
          </div>

          {/* Live Server Clock with IST */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-neutral-50 rounded-md border border-neutral-200 text-neutral-700 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-medium text-[11.5px]">{liveIstTime || '09:30:00 AM IST'}</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Synchronized with IST NTP Clock" />
          </div>

          {/* Punch Status Quick Pill */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs">
            <span className="text-neutral-400">Punch:</span>
            {punchState === 'clocked_in' && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-200 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Clocked In
              </span>
            )}
            {punchState === 'on_break' && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                On Break
              </span>
            )}
            {punchState === 'clocked_out' && (
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium text-[11px] border border-neutral-200 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                Clocked Out
              </span>
            )}
          </div>
        </div>

        {/* Right Action Tools: Role Switcher, Screen Lock, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher Dropdown with Profile Lock Indicator */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                isProfileLockEnforced
                  ? 'border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 text-amber-950'
                  : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
              }`}
              title={
                isProfileLockEnforced
                  ? 'Profile Locked: Workstation locked to employee. Password required to switch.'
                  : 'Test role-based access control workflows'
              }
            >
              {isProfileLockEnforced ? (
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span className="hidden sm:inline text-neutral-500 font-normal">Profile:</span>
              <span className="font-semibold">{currentUser.name.split(' ')[0]}</span>
              <span className="text-[10px] px-1 rounded bg-white/80 border border-neutral-200 font-mono">
                {currentUser.role.toUpperCase()}
              </span>
              {isProfileLockEnforced && (
                <span className="hidden xl:inline text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200/60 text-amber-900 border border-amber-300 uppercase">
                  Locked
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {isRoleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-1"
                onClick={() => setIsRoleMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-neutral-100 bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      {isProfileLockEnforced && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                      <span>Profile Access Control</span>
                    </p>
                    {isProfileLockEnforced && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                    {isProfileLockEnforced
                      ? 'Profiles are locked after employee sign in. Moving to another profile requires administrator permission & password.'
                      : 'Switch role to preview specific permissions & dashboard workflows:'}
                  </p>
                </div>

                <div className="py-1">
                  {rolesList.map((r) => {
                    const isCurrent = currentUser.role === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => switchUserRole(r.role)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 transition ${
                          isCurrent ? 'bg-emerald-50/40 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {!isCurrent && isProfileLockEnforced && (
                            <Lock className="w-3 h-3 text-neutral-400 shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-neutral-900">{r.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${r.badgeColor}`}>
                                {r.role.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500">{r.title}</p>
                          </div>
                        </div>

                        {isCurrent ? (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Active</span>
                          </div>
                        ) : isProfileLockEnforced ? (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium">
                            Passcode Req
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Admin Screen Lock Button */}
          <button
            onClick={lockScreen}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-xs font-medium transition cursor-pointer"
            title="Lock workstation screen (Requires 4-digit PIN 1234 to unlock)"
          >
            <Lock className="w-3.5 h-3.5 text-neutral-600" />
            <span className="hidden md:inline">Lock Screen</span>
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 relative transition cursor-pointer"
              title="System Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden animate-in fade-in">
                <div className="p-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-neutral-900">Notifications</span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">
                        {unreadNotifs.length} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-indigo-600 hover:underline font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-neutral-500 text-center">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs hover:bg-neutral-50/70 transition flex items-start gap-2.5 ${
                          !n.isRead ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-indigo-500" />
                        <div className="flex-1">
                          <p className="font-semibold text-neutral-900">{n.title}</p>
                          <p className="text-neutral-600 text-[11px] mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-neutral-400 mt-1 block">{n.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition cursor-pointer"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-neutral-200"
              />
              <span className="text-xs font-semibold text-neutral-900 hidden lg:inline">{currentUser.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50 animate-in fade-in"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-neutral-100">
                  <p className="text-xs font-bold text-neutral-900">{currentUser.name}</p>
                  <p className="text-[11px] text-neutral-500">{currentUser.email}</p>
                  <div className="mt-1.5 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                      <Shield className="w-3 h-3" />
                      <span>2FA Protected (TOTP)</span>
                    </div>
                    {isProfileLockEnforced && (
                      <div className="flex items-center justify-between text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <span className="flex items-center gap-1 font-semibold">
                          <Lock className="w-3 h-3 text-amber-600" />
                          Profile Lockdown Active
                        </span>
                        <span className="text-[9px] font-mono text-amber-700">Enforced</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={logoutUser}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
