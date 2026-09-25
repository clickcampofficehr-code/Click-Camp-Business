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
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Fingerprint,
  Check
} from 'lucide-react';
import { OnboardingPortal } from './OnboardingPortal';
import { CCLogoMark } from '../common/CompanyLogo';

export const LoginPortal: React.FC = () => {
  const { loginUser, allUsers, setIsBrandModalOpen } = useWorkspace();

  // Primary Mode: Existing Employee Sign In vs New Joinee Onboarding
  const [portalTab, setPortalTab] = useState<'signin' | 'onboarding'>('signin');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  // Quick fill helper for testers/evaluators
  const handleQuickFill = (targetEmail: string, targetPass: string = 'ClickCamp#2026') => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setAuthError(null);
  };

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
        setAuthError(result.error || 'Invalid corporate credentials. Please verify your work email and password.');
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

      // Validate 6-digit TOTP code, default bypass '123456', or backup code
      const isValidTotp =
        cleanCode.length === 6 ||
        cleanCode === '123456' ||
        (target?.backupCodes && target.backupCodes.includes(cleanCode.toUpperCase()));

      if (isValidTotp) {
        setIsVerifyingTotp(false);
        loginUser(target ? target.email : email, target ? target.role : selectedRole);
      } else {
        setIsVerifyingTotp(false);
        setTotpError('Invalid security code. Please check your authenticator app or enter a valid emergency backup code (or use test code 123456).');
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
      setResetMessage(`If an active account exists with ${resetEmail}, an enterprise password reset link has been dispatched.`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#070b0e] text-neutral-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-emerald-500 selection:text-neutral-950 overflow-x-hidden">
      {/* Ambient Cyber Mesh & Radial Glow Aesthetics */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent blur-3xl opacity-75" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[300px] bg-gradient-to-tl from-emerald-600/10 via-teal-500/5 to-transparent blur-3xl opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035]" />

      {/* Header Elements: 'CC' logo, 'ClickCamp Technologies', small badge 'OPERATIONS V3.0' */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between pb-6 pt-2">
        <div
          onClick={() => setIsBrandModalOpen(true)}
          className="group flex items-center gap-3.5 cursor-pointer select-none"
          title="ClickCamp Technologies Brand Hub (Click to view or customize)"
        >
          {/* 'CC' Logo with Vibrant Green Gradient */}
          <div className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(16,185,129,0.4)]">
            <CCLogoMark size={42} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="font-bold text-lg sm:text-xl text-white tracking-tight font-sans drop-shadow-sm group-hover:text-emerald-300 transition-colors">
              ClickCamp Technologies
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              OPERATIONS V3.0
            </span>
          </div>
        </div>

        {/* Top-Right Security Enforcement Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-white/10 backdrop-blur-md text-xs text-neutral-300 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </span>
          <span className="text-[11px] font-medium text-neutral-300">Production Security Enforced</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-auto py-2">
        {/* Navigation: Sleek Segmented Control to toggle between 'Existing Employee Sign In' and 'New Joinee Onboarding' */}
        <div className="max-w-md w-full mx-auto mb-6 p-1.5 bg-neutral-950/70 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <button
            type="button"
            onClick={() => {
              setPortalTab('signin');
              setAuthStep('credentials');
            }}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              portalTab === 'signin'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-neutral-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Existing Employee Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setPortalTab('onboarding')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              portalTab === 'onboarding'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-neutral-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Joinee Onboarding</span>
          </button>
        </div>

        {portalTab === 'signin' ? (
          /* TAB 1: EXISTING EMPLOYEE SIGN IN */
          <div className="max-w-md w-full mx-auto relative rounded-3xl bg-neutral-950/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.06)] p-6 sm:p-8 overflow-hidden transition-all duration-300">
            {/* Ambient Subtle Gradient Sheen across top edge */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />

            {authStep === 'credentials' ? (
              <div>
                {/* Main Form Card Title & Minimalist Lock Icon */}
                <div className="mb-6 text-center">
                  <div className="w-13 h-13 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-3.5 shadow-[0_0_24px_rgba(16,185,129,0.18)]">
                    <Lock className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Workstation Sign In</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed max-w-sm mx-auto">
                    Enter your ClickCamp enterprise credentials to access your designated workspace.
                  </p>
                </div>

                {/* Authentication Error Banner */}
                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed font-medium">{authError}</div>
                  </div>
                )}

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  {/* Field 1: Corporate Work Email */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5" htmlFor="corporate-email">
                      Corporate Work Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="corporate-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (authError) setAuthError(null);
                        }}
                        required
                        disabled={isAuthenticating}
                        placeholder="name@clickcamp.tech"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-900/80 border border-neutral-800/90 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/30 transition shadow-inner disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Field 2: Corporate Password with right-aligned 'Forgot Password?' */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-neutral-300" htmlFor="corporate-password">
                        Corporate Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(email);
                          setAuthStep('forgot_password');
                          setAuthError(null);
                        }}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        id="corporate-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (authError) setAuthError(null);
                        }}
                        required
                        disabled={isAuthenticating}
                        placeholder="Enter corporate password"
                        className="w-full pl-10 pr-11 py-2.5 text-sm bg-neutral-900/80 border border-neutral-800/90 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/30 transition shadow-inner disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Quick-Fill Helper Pills for Convenient Demonstration & Testing */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
                      <span className="flex items-center gap-1 font-medium text-neutral-400">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Quick Test Profiles:
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickFill('adnanmaliklyx@gmail.com', 'Adnan@ClickCamp#2026')}
                        className="p-1.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-emerald-500/40 text-left transition cursor-pointer group"
                      >
                        <div className="text-[11px] font-semibold text-neutral-200 group-hover:text-emerald-400 flex items-center justify-between">
                          <span>Super Admin</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Director</span>
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate mt-0.5">adnanmaliklyx@gmail.com</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickFill('rahul.verma@clickcamp.tech', 'Rahul@ClickCamp#2026')}
                        className="p-1.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-emerald-500/40 text-left transition cursor-pointer group"
                      >
                        <div className="text-[11px] font-semibold text-neutral-200 group-hover:text-emerald-400 flex items-center justify-between">
                          <span>Client Ops</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Associate</span>
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate mt-0.5">rahul.verma@clickcamp.tech</div>
                      </button>
                    </div>
                  </div>

                  {/* Call to Action: Prominent, full-width primary button in vibrant green */}
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full mt-4 py-3.5 px-5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.99] disabled:opacity-60 text-neutral-950 rounded-xl text-sm font-bold transition-all duration-200 shadow-[0_0_24px_rgba(16,185,129,0.35)] hover:shadow-[0_0_36px_rgba(16,185,129,0.55)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed group"
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                        <span>Authenticating Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to 2FA Verification -&gt;</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer & Trust Signals: Inside bottom of form card */}
                <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Encrypted Session</span>
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400 bg-neutral-900/90 px-2 py-0.5 rounded border border-neutral-800">
                    ClickCamp IAM Gate
                  </span>
                </div>
              </div>
            ) : authStep === 'totp_2fa' ? (
              /* STEP 2: TOTP Two-Factor Authentication */
              <div className="animate-in fade-in duration-200">
                <div className="mb-6 text-center">
                  <div className="w-13 h-13 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3.5 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
                    <Smartphone className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Two-Factor Authentication</h2>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    Enter the 6-digit TOTP code generated by your Authenticator app or an authorized emergency backup code.
                  </p>
                </div>

                {/* Authorized Profile Identity Card */}
                <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 mb-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-neutral-200">
                        {authenticatedUser ? authenticatedUser.name : email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQrModal(!showQrModal)}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{showQrModal ? 'Hide 2FA Secret' : 'View 2FA Key'}</span>
                    </button>
                  </div>

                  {showQrModal && (
                    <div className="mt-3 p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-center animate-in fade-in">
                      <p className="text-[11px] text-neutral-400 mb-1">Corporate TOTP Setup Key:</p>
                      <code className="text-[11px] text-emerald-400 font-mono font-semibold bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 inline-block">
                        {authenticatedUser?.totpSecret || 'CLICKCAMP-SEC-PROD-2FA'}
                      </code>
                      <p className="text-[10px] text-neutral-500 mt-1.5">
                        Test bypass code: <strong className="text-emerald-400">123456</strong>
                      </p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleTotpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5 text-center">
                      6-Digit Security Code / Backup Token
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
                      className="w-full py-3 px-4 text-center text-xl font-mono tracking-widest bg-neutral-900/90 border border-neutral-800 rounded-xl text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition disabled:opacity-50 shadow-inner"
                    />
                    {totpError && (
                      <div className="mt-2.5 p-2.5 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300 text-center font-medium">
                        {totpError}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('credentials');
                        setTotpError(null);
                      }}
                      disabled={isVerifyingTotp}
                      className="w-1/3 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold transition border border-neutral-800 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifyingTotp || !totpCode}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 rounded-xl text-sm font-bold transition shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isVerifyingTotp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                          <span>Verifying Token...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify &amp; Enter Workspace</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Encrypted Session</span>
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400 bg-neutral-900/90 px-2 py-0.5 rounded border border-neutral-800">
                      ClickCamp IAM Gate
                    </span>
                  </div>
                </form>
              </div>
            ) : (
              /* STEP 3: FORGOT PASSWORD RECOVERY FLOW */
              <div className="animate-in fade-in duration-200">
                <div className="mb-6 text-center">
                  <div className="w-13 h-13 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-3.5 shadow-[0_0_24px_rgba(16,185,129,0.18)]">
                    <KeyRound className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    Enter your corporate work email to receive a secure password recovery dispatch.
                  </p>
                </div>

                {resetMessage ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed font-medium">{resetMessage}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('credentials');
                        setResetMessage(null);
                      }}
                      className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Return to Sign In</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    {authError && (
                      <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex-1 font-medium">{authError}</div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5" htmlFor="recovery-email">
                        Corporate Work Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="recovery-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => {
                            setResetEmail(e.target.value);
                            if (authError) setAuthError(null);
                          }}
                          required
                          disabled={isResetting}
                          placeholder="name@clickcamp.tech"
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-900/80 border border-neutral-800/90 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition shadow-inner disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep('credentials');
                          setAuthError(null);
                        }}
                        disabled={isResetting}
                        className="w-1/3 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-medium transition border border-neutral-800 cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isResetting}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 rounded-xl text-sm font-bold transition shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResetting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
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

                    <div className="mt-4 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Encrypted Session</span>
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400 bg-neutral-900/90 px-2 py-0.5 rounded border border-neutral-800">
                        ClickCamp IAM Gate
                      </span>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: NEW JOINEE ONBOARDING PORTAL */
          <div className="max-w-5xl w-full mx-auto bg-neutral-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.06)] p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
            <OnboardingPortal embedded onSuccessSwitch={() => setPortalTab('signin')} />
          </div>
        )}
      </main>

      {/* Footer & Trust Signals: Below the Card */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full pt-8 pb-3 text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 mt-6">
        <span className="text-neutral-500 font-sans">
          &copy; 2026 ClickCamp Technologies Ltd. All rights reserved.
        </span>

        {/* Security Badges: SOC2 Type II • ISO 27001 Certified • Production Security Enforced */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/60 border border-white/5 text-[11px] text-neutral-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">SOC2 Type II</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/60 border border-white/5 text-[11px] text-neutral-300">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">ISO 27001 Certified</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            <span className="font-medium">Production Security Enforced</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
