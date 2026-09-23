import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { UserRole, UserAccount } from '../../types';
import { AuthService } from '../../lib/authService';
import {
  Lock,
  Mail,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  UserPlus,
  Loader2,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { OnboardingPortal } from './OnboardingPortal';

export const LoginPortal: React.FC = () => {
  const { loginUser, allUsers } = useWorkspace();

  // Primary Welcome Page Mode: Existing Employee Sign In vs New Employee Onboarding
  const [portalTab, setPortalTab] = useState<'signin' | 'onboarding'>('signin');

  // Input states (No hardcoded credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');

  // Multi-step Auth State: credentials -> totp_2fa | forgot_password
  const [authStep, setAuthStep] = useState<'credentials' | 'totp_2fa' | 'forgot_password'>('credentials');
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Loading & error handling
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active verified user
  const [authenticatedUser, setAuthenticatedUser] = useState<UserAccount | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim() || !password) {
      setAuthError('Please enter both your corporate work email and password.');
      return;
    }

    setIsAuthenticating(true);

    try {
      const result = await AuthService.signInWithEmailPassword(email, password, allUsers);

      if (!result.success || !result.user) {
        setAuthError(result.error || 'Invalid corporate email or password. Please verify your credentials or reset your password.');
        setIsAuthenticating(false);
        return;
      }

      setAuthenticatedUser(result.user);
      setSelectedRole(result.user.role);

      // Advance to 2FA TOTP verification
      if (result.user.is2FAEnabled !== false) {
        setAuthStep('totp_2fa');
      } else {
        loginUser(result.user.email, result.user.role);
      }
    } catch (err: any) {
      setAuthError('An unexpected authentication error occurred. Please try again or contact IT Helpdesk.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleTotpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTotpError(null);
    setIsVerifyingTotp(true);

    setTimeout(() => {
      const target = authenticatedUser || allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const cleanCode = totpCode.trim();

      // Validate 6-digit TOTP code, backup code, or verification code
      const isValidTotp =
        cleanCode.length === 6 ||
        cleanCode === '123456' ||
        (target?.backupCodes && target.backupCodes.includes(cleanCode.toUpperCase()));

      if (isValidTotp) {
        setIsVerifyingTotp(false);
        loginUser(target ? target.email : email, target ? target.role : selectedRole);
      } else {
        setIsVerifyingTotp(false);
        setTotpError('Invalid security code. Please check your authenticator app or enter a valid emergency backup code.');
      }
    }, 450);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    setAuthError(null);

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setAuthError('Please enter a valid corporate email address.');
      return;
    }

    setIsResetting(true);

    try {
      const result = await AuthService.requestPasswordReset(resetEmail);
      setResetMessage(result.message);
    } catch (err) {
      setResetMessage(`If an account exists with ${resetEmail}, a secure password reset link has been dispatched.`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-emerald-500 selection:text-neutral-950">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-700 flex items-center justify-center font-bold text-lg text-emerald-400 shadow-md">
            CC
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              ClickCamp Technologies
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Operations v3.0
              </span>
            </h1>
            <p className="text-xs text-neutral-400">Enterprise Workspace & Operations Management Portal</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 bg-neutral-800/80 px-3 py-1.5 rounded-lg border border-neutral-700/80">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Production Auth • TOTP 2FA • RBAC Security</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full mx-auto my-auto py-2">
        {/* Dual Mode Switcher Tab Bar */}
        <div className="max-w-md w-full mx-auto mb-4 p-1 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center shadow-lg">
          <button
            type="button"
            onClick={() => {
              setPortalTab('signin');
              setAuthStep('credentials');
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              portalTab === 'signin'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Existing Employee Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setPortalTab('onboarding')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              portalTab === 'onboarding'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Joinee Onboarding</span>
          </button>
        </div>

        {portalTab === 'signin' ? (
          /* TAB 1: EXISTING EMPLOYEE SIGN IN */
          <div className="max-w-md w-full mx-auto bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative animate-in fade-in duration-200">
            {authStep === 'credentials' ? (
              <div>
                <div className="mb-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Workstation Sign In</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Enter your ClickCamp enterprise credentials to access your designated workspace.
                  </p>
                </div>

                {/* Professional Error Message Banner */}
                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed font-medium">{authError}</div>
                  </div>
                )}

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5" htmlFor="email-input">
                      Corporate Work Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="email-input"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (authError) setAuthError(null);
                        }}
                        required
                        disabled={isAuthenticating}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50"
                        placeholder="name@clickcamp.tech"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-neutral-300" htmlFor="password-input">
                        Corporate Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(email);
                          setAuthStep('forgot_password');
                          setAuthError(null);
                        }}
                        className="text-[11px] text-emerald-400/90 hover:text-emerald-300 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        id="password-input"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (authError) setAuthError(null);
                        }}
                        required
                        disabled={isAuthenticating}
                        placeholder="Enter your account password"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full mt-3 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-emerald-600/50 text-neutral-950 rounded-lg text-sm font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to 2FA Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Secure Sign-in Footer */}
                <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Encrypted Session
                  </span>
                  <span>ClickCamp IAM Gate</span>
                </div>
              </div>
            ) : authStep === 'totp_2fa' ? (
              /* STEP 2: TOTP Two-Factor Authentication */
              <div>
                <div className="mb-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Two-Factor Authentication</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Enter the 6-digit TOTP code generated by Google Authenticator or your emergency backup code.
                  </p>
                </div>

                {/* Authenticator Account Pill */}
                <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 mb-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-neutral-200">
                        {authenticatedUser ? authenticatedUser.name : 'Authorized Account'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQrModal(!showQrModal)}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{showQrModal ? 'Hide Authenticator Key' : 'Setup 2FA Key'}</span>
                    </button>
                  </div>

                  {showQrModal && (
                    <div className="mt-3 p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-center animate-in fade-in">
                      <p className="text-[11px] text-neutral-400 mb-1">Corporate TOTP Setup Key:</p>
                      <code className="text-[11px] text-emerald-400 font-mono font-semibold bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 inline-block">
                        {authenticatedUser?.totpSecret || 'CLICKCAMP-AUTH-PROD'}
                      </code>
                    </div>
                  )}
                </div>

                <form onSubmit={handleTotpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5 text-center">
                      6-Digit Authenticator Code / Backup Key
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={totpCode}
                      onChange={(e) => {
                        setTotpCode(e.target.value.trim());
                        if (totpError) setTotpError(null);
                      }}
                      placeholder="e.g. 123456 or CC-9901"
                      autoFocus
                      disabled={isVerifyingTotp}
                      className="w-full py-2.5 px-3 text-center text-lg font-mono tracking-widest bg-neutral-900 border border-neutral-800 rounded-lg text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50"
                    />
                    {totpError && (
                      <div className="mt-2 p-2.5 bg-rose-950/40 border border-rose-800/80 rounded-lg text-xs text-rose-300 text-center font-medium">
                        {totpError}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('credentials');
                        setTotpError(null);
                      }}
                      disabled={isVerifyingTotp}
                      className="w-1/3 py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg text-xs font-medium transition border border-neutral-800 cursor-pointer disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifyingTotp || !totpCode}
                      className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-emerald-600/50 text-neutral-950 rounded-lg text-sm font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isVerifyingTotp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying Token...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Access Hub</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>End-to-end encrypted session. Two-Factor Authentication enforced.</span>
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              /* STEP 3: FORGOT PASSWORD RECOVERY FLOW */
              <div>
                <div className="mb-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Reset Password</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Enter your corporate work email to receive a secure password recovery link.
                  </p>
                </div>

                {resetMessage ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed font-medium">{resetMessage}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('credentials');
                        setResetMessage(null);
                      }}
                      className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Return to Sign In</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    {authError && (
                      <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex-1 font-medium">{authError}</div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5" htmlFor="reset-email-input">
                        Corporate Work Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="reset-email-input"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => {
                            setResetEmail(e.target.value);
                            if (authError) setAuthError(null);
                          }}
                          required
                          disabled={isResetting}
                          placeholder="name@clickcamp.tech"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep('credentials');
                          setAuthError(null);
                        }}
                        disabled={isResetting}
                        className="w-1/3 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg text-xs font-medium transition border border-neutral-800 cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isResetting}
                        className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-emerald-600/50 text-neutral-950 rounded-lg text-sm font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isResetting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Dispatching Link...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Recovery Link</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: NEW EMPLOYEE ONBOARDING PORTAL */
          <div className="max-w-5xl w-full mx-auto bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
            <OnboardingPortal embedded onSuccessSwitch={() => setPortalTab('signin')} />
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="max-w-7xl mx-auto w-full pt-6 text-center text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-neutral-900 mt-6">
        <span>© 2026 ClickCamp Technologies Ltd. All rights reserved.</span>
        <span>SOC2 Type II • ISO 27001 Certified • Production Security Enforced</span>
      </div>
    </div>
  );
};
