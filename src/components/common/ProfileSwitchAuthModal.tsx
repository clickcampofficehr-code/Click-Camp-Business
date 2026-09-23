import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Lock,
  Unlock,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  X
} from 'lucide-react';

export const ProfileSwitchAuthModal: React.FC = () => {
  const {
    currentUser,
    pendingProfileSwitch,
    verifyProfileSwitch,
    cancelProfileSwitch
  } = useWorkspace();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [reason, setReason] = useState('Administrative Oversight & Compliance Inspection');
  const [authorizedBy, setAuthorizedBy] = useState('Adnan Malik (Super Admin)');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  if (!pendingProfileSwitch) return null;

  const targetUser = pendingProfileSwitch.targetUser;
  const targetRole = pendingProfileSwitch.targetRole;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter the supervisor or administrator authorization password.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    setTimeout(() => {
      const result = verifyProfileSwitch(password, reason, authorizedBy);
      setIsVerifying(false);

      if (!result.success) {
        setFailedAttempts((prev) => prev + 1);
        setErrorMessage(result.message);
      } else {
        // Reset local state upon success
        setPassword('');
        setErrorMessage(null);
      }
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-lock-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with Security Banner */}
        <div className="bg-neutral-900 text-white p-5 border-b border-neutral-800 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="profile-lock-title" className="text-base font-bold text-white tracking-tight">
                    Profile Switch Locked
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Security Enforced
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Supervisor authorization & master password required to transition profiles
                </p>
              </div>
            </div>

            <button
              onClick={cancelProfileSwitch}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              title="Cancel and remain in current profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transition Comparison Diagram */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-200">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Requested Profile Transition
          </p>
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-xs">
            {/* Current Profile */}
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-neutral-200 shrink-0"
              />
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-neutral-900 truncate">{currentUser.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase bg-neutral-100 text-neutral-700 border border-neutral-200">
                    Current
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate">{currentUser.roleLabel}</p>
              </div>
            </div>

            {/* Transition Arrow */}
            <div className="flex flex-col items-center justify-center shrink-0 px-2">
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] text-neutral-400 mt-0.5 font-medium">Switch To</span>
            </div>

            {/* Target Profile */}
            <div className="flex items-center gap-2.5 min-w-0 text-right">
              <div className="truncate">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Target
                  </span>
                  <span className="text-xs font-bold text-neutral-900 truncate">
                    {targetUser ? targetUser.name : targetRole.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate">
                  {targetUser ? targetUser.roleLabel : targetRole.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <img
                src={
                  targetUser
                    ? targetUser.avatarUrl
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={targetUser?.name || 'Target Profile'}
                className="w-9 h-9 rounded-full object-cover border border-neutral-200 shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11.5px] leading-relaxed">
              <p className="font-bold text-amber-950">Statutory Access Control Notice</p>
              <p className="text-amber-800 mt-0.5">
                Workstations are locked to the authenticated employee under ClickCamp IT Security & DPDP Act 2023.
                Transitioning to another role or accessing elevated privileges without supervisor permission is prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 pt-2">
          {/* Administrator / Supervisor Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="auth-password" className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-neutral-600" />
                <span>Admin / Supervisor Password</span>
              </label>
              <span className="text-[10px] text-neutral-500 font-mono">Bcrypt Salted & Audited</span>
            </div>

            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter admin password or passcode"
                className="w-full pl-3 pr-10 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-500">
              Only authorized personnel with verified supervisor or administrator clearance may approve profile switches.
            </p>
          </div>

          {/* Business Justification / Permission Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="auth-reason" className="block text-xs font-semibold text-neutral-700 mb-1">
                Authorization Purpose
              </label>
              <select
                id="auth-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="Administrative Oversight & Compliance Inspection">
                  Administrative Oversight & Inspection
                </option>
                <option value="Authorized Manager Review & Cross-Verification">
                  Manager Review & Cross-Verification
                </option>
                <option value="IT Helpdesk & Workstation Troubleshooting">
                  IT Helpdesk & System Support
                </option>
                <option value="Emergency Operational Incident Response">
                  Emergency Operational Incident
                </option>
                <option value="Shift Transition / Handover Audit">Shift Transition / Handover Audit</option>
              </select>
            </div>

            <div>
              <label htmlFor="auth-by" className="block text-xs font-semibold text-neutral-700 mb-1">
                Authorizing Officer
              </label>
              <input
                id="auth-by"
                type="text"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                placeholder="e.g. Adnan Malik (Super Admin)"
                className="w-full px-2.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="flex-1 font-medium">{errorMessage}</div>
              {failedAttempts > 0 && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                  Attempt #{failedAttempts}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={cancelProfileSwitch}
              className="w-1/3 py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl text-xs transition border border-neutral-300 cursor-pointer"
            >
              Cancel & Stay in Profile
            </button>

            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>Verify Password & Switch</span>
                </>
              )}
            </button>
          </div>

          {/* Security Audit Badge */}
          <div className="pt-2 border-t border-neutral-100 text-center">
            <p className="text-[10.5px] text-neutral-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>SOC2 Type II Audit: Verification attempts are cryptographically timestamped.</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
