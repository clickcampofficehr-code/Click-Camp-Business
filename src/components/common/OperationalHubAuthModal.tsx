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
  X,
  Mail,
  Users,
  Briefcase,
  MessageSquare,
  FolderLock
} from 'lucide-react';

export const OperationalHubAuthModal: React.FC = () => {
  const {
    currentUser,
    pendingHubAuth,
    verifyHubAccess,
    cancelHubAccess,
    setActiveTab
  } = useWorkspace();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [reason, setReason] = useState('Operational Review & Management Task Execution');
  const [authorizedBy, setAuthorizedBy] = useState('Adnan Malik (Super Admin)');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  if (!pendingHubAuth) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter the supervisor or administrator authorization password.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    setTimeout(() => {
      const result = verifyHubAccess(password, reason, authorizedBy);
      setIsVerifying(false);

      if (!result.success) {
        setFailedAttempts((prev) => prev + 1);
        setErrorMessage(result.message);
      } else {
        setPassword('');
        setErrorMessage(null);
      }
    }, 400);
  };

  const handleCancelAndGoToWebmail = () => {
    cancelHubAccess();
    setActiveTab('webmail');
  };

  return (
    <div
      id="operational-hub-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hub-lock-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with Security Banner */}
        <div className="bg-neutral-900 text-white p-5 border-b border-neutral-800 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 id="hub-lock-title" className="text-base font-bold text-white flex items-center gap-2">
                  <span>Operational Hub Locked</span>
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Restricted
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Supervisor authorization required to access this department hub
                </p>
              </div>
            </div>
            <button
              onClick={cancelHubAccess}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Target Hub & Requester Box */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl mb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                  Target Operational Hub
                </span>
                <h4 className="text-sm font-bold text-neutral-900 mt-0.5 flex items-center gap-1.5">
                  <FolderLock className="w-4 h-4 text-amber-600" />
                  {pendingHubAuth.hubLabel}
                </h4>
                <p className="text-xs text-neutral-600 mt-1">
                  Required Clearance:{' '}
                  <span className="font-semibold text-neutral-800">
                    {pendingHubAuth.requiredClearance}
                  </span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block uppercase font-medium">
                  Logged In As
                </span>
                <span className="text-xs font-bold text-neutral-900">
                  {currentUser.name}
                </span>
                <span className="text-[11px] block text-emerald-700 font-medium">
                  {currentUser.roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Permitted Hubs Guide */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl mb-5 text-xs text-neutral-700">
            <div className="flex items-center gap-2 mb-2 font-bold text-neutral-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Standard Employee Permitted Hubs:</span>
            </div>
            <p className="text-[11.5px] text-neutral-600 mb-2 leading-relaxed">
              In accordance with corporate workstation security policy, employee roles have direct access to these 5 hubs:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-800 font-medium">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Webmail Client</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-800 font-medium">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Meeting Hub & MOM</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-800 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                <span>Support & CRM</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-800 font-medium">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Team Chat & Messages</span>
              </div>
              <div className="col-span-2 flex items-center gap-1.5 p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Document System (DMS)</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Authorization Denied</span>
                <span>{errorMessage}</span>
                {failedAttempts >= 2 && (
                  <span className="block mt-1 font-semibold text-rose-900">
                    Failed authorization incidents are logged in the corporate audit trail.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Authorization Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Supervisor / Administrator Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  id="hub-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter administrator or supervisor password"
                  autoFocus
                  required
                  className="w-full pl-9 pr-10 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-neutral-500">
                Departmental clearance requires active supervisory approval. Failed attempts are recorded in the audit log.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Authorizing Supervisor
                </label>
                <input
                  type="text"
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Access Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Operational Review & Management Task Execution">Operational Review</option>
                  <option value="Urgent Client Verification / Cross-Audit">Urgent Verification</option>
                  <option value="Escalation Inspection by Lead">Escalation Inspection</option>
                  <option value="Temporary Supervisor Delegated Duty">Delegated Duty</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full sm:flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-neutral-950 font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isVerifying ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Unlock {pendingHubAuth.hubLabel}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelAndGoToWebmail}
                className="w-full sm:w-auto py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Return to Webmail</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
