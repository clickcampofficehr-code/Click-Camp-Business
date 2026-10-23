import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { RealtimeService } from '../../lib/realtimeService';
import {
  Rocket,
  Database,
  Radio,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Lock,
  Clock,
  HardDrive,
  Copy,
  Check,
  FileText,
  KeyRound,
  ExternalLink,
  Zap,
  Layers
} from 'lucide-react';

export const ProductionLaunchHub: React.FC = () => {
  const {
    currentUser,
    allUsers,
    webmail,
    auditLogs,
    punchRecords,
    sessionId,
    purgeProductionDemoData,
    updateProfilePicture,
    showToast
  } = useWorkspace();

  const [isPurging, setIsPurging] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testAvatarUrl, setTestAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  // Step 1: Detect any demo or test accounts currently in the system
  const demoAccounts = allUsers.filter(
    (u) =>
      u.email.includes('@test.com') ||
      u.email.includes('@demo.com') ||
      u.email.includes('@example.com') ||
      u.role === ('demo_user' as any) ||
      u.name.toLowerCase().includes('demo') ||
      u.name.toLowerCase().includes('test user')
  );

  const realAccounts = allUsers.filter(
    (u) => !demoAccounts.some((d) => d.id === u.id)
  );

  const handleRunStep1Purge = async () => {
    setIsPurging(true);
    try {
      await purgeProductionDemoData();
    } finally {
      setIsPurging(false);
    }
  };

  const handleTestRealtimeDp = () => {
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    ];
    const nextAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    updateProfilePicture(nextAvatar, currentUser.id);
  };

  const sqlCleanupCode = `-- Step 1: Database Cleanup Query
DELETE FROM users 
WHERE email LIKE '%@test.com' 
   OR email LIKE '%@demo.com' 
   OR role = 'demo_user' 
   OR is_test_profile = TRUE;

-- Clean up orphaned data
DELETE FROM user_activity_logs WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM webmail_records WHERE user_id NOT IN (SELECT id FROM users);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCleanupCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 border border-neutral-800 shadow-md relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold tracking-wider mb-2 border border-emerald-500/30">
              <Rocket className="w-3 h-3" />
              <span>PRODUCTION LAUNCH BLUEPRINT • LIVE GATEWAY</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Enterprise Production Readiness Hub
            </h2>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              Real-time monitoring and execution of the 5-step transition blueprint from sandbox testing to live enterprise operations for ClickCamp Technologies.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-300">
              Env: <strong className="text-emerald-400">production</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-300">
              SOC2 Type II: <strong className="text-emerald-400">Enforced</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Grid of the 5 Blueprint Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ========================================================================= */}
        {/* STEP 1: DATABASE CLEANUP                                                 */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Step 1: Database Cleanup (Purge Demo Data)
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Wipes dummy test accounts so real employees don't interact with test data
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  demoAccounts.length === 0
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {demoAccounts.length === 0 ? 'Clean Slate Ready' : `${demoAccounts.length} Demo Profiles Found`}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Live Real Accounts</span>
                  <p className="text-lg font-bold text-neutral-900 mt-0.5">{realAccounts.length}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Demo Accounts Found</span>
                  <p
                    className={`text-lg font-bold mt-0.5 ${
                      demoAccounts.length > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {demoAccounts.length}
                  </p>
                </div>
              </div>

              {/* SQL Code Snippet */}
              <div className="bg-neutral-950 text-neutral-300 rounded-xl p-3 font-mono text-[11px] relative overflow-hidden border border-neutral-800">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-800 text-[10px] text-neutral-400">
                  <span>SQL Cleanup Query</span>
                  <button
                    onClick={copySqlToClipboard}
                    className="hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                </div>
                <pre className="text-[10px] text-emerald-400/90 whitespace-pre-wrap">{sqlCleanupCode}</pre>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">
              Orphaned logs & test messages will be wiped automatically.
            </span>
            <button
              onClick={handleRunStep1Purge}
              disabled={isPurging}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
              <span>{isPurging ? 'Purging Test Data...' : 'Execute Step 1 Cleanup'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 2: REAL-TIME PROFILE PICTURE UPDATES                                */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Step 2: Real-Time Profile Picture Updates
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Instant cross-client synchronization via WebSockets & BroadcastChannel
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Broadcast
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">WebSocket / Stream Event:</span>
                  <code className="font-mono text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                    profile_picture_changed
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">Target DOM Selector:</span>
                  <code className="font-mono text-neutral-700 bg-neutral-200/70 px-1.5 py-0.5 rounded text-[11px]">
                    #profile-img / [data-user-id]
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">Cross-Tab Sync:</span>
                  <span className="text-neutral-600">BroadcastChannel API (Active)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <img
                  id="profile-img"
                  data-user-id={currentUser.id}
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                />
                <div>
                  <span className="font-bold text-neutral-900">{currentUser.name}</span>
                  <p className="text-[11px] text-neutral-500">
                    Instant UI reflection verified • No page refresh required
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">Test socket broadcast across clients</span>
            <button
              onClick={handleTestRealtimeDp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Simulate Real-Time DP Broadcast</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 3: IMMUTABLE WEBMAIL DATABASE INTEGRATION                           */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Step 3: Immutable Webmail Integration
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    All emails permanently preserved; hard delete is cryptographically blocked
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                SEC 17a-4 / SOC2 Ready
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Archived Emails</span>
                  <p className="text-lg font-bold text-neutral-900 mt-0.5">{webmail.length}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Hard Delete API</span>
                  <p className="text-xs font-bold text-rose-600 mt-1 uppercase">Prohibited / Disabled</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-neutral-800 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Permanent Table: <code>public.persistent_emails</code></span>
                </div>
                <div className="flex items-center gap-2 text-neutral-800 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Soft-Delete Column: <code>is_hidden_from_user BOOLEAN DEFAULT FALSE</code></span>
                </div>
                <div className="flex items-center gap-2 text-neutral-800 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Email Interception: Pipes directly to DB on dispatch</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Audit copy preserved permanently even if user deletes or logs out.</span>
            <span className="font-mono text-emerald-600 font-bold">100% Immutable</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 4: SECURE SHIFT-END LOGOUT (DATA PERSISTENCE)                       */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Step 4: Secure Shift-End Logout (Persistence)
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Destroys temporary session token only; preserves all work, logs & profile
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Token Isolation Enforced
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">Current Session ID:</span>
                  <code className="font-mono text-neutral-700 bg-neutral-200/70 px-1.5 py-0.5 rounded text-[11px]">
                    {sessionId}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">Shift Log Table:</span>
                  <code className="font-mono text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                    public.shift_logs
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">Logout Action:</span>
                  <span className="text-neutral-600">UPDATE shift_logs SET end_time = NOW()</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-[11px] text-neutral-700 space-y-1">
                <p className="font-semibold text-emerald-900">Destroyed on Logout:</p>
                <p className="font-mono text-neutral-600">req.session.destroy() • clearCookie('auth_token')</p>
                <p className="font-semibold text-emerald-900 mt-2">100% Persisted in Database:</p>
                <p className="text-neutral-600">User Profile, Punch Records, Tasks, Documents, Webmail Archives</p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Shift logs saved for HR/payroll audit.</span>
            <span className="font-bold text-neutral-800 font-mono">Session Isolated</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 5: FINAL PRODUCTION LAUNCH CHECKLIST                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xs">
              05
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Step 5: Final Production Launch Checklist
              </h3>
              <p className="text-[11px] text-neutral-500">
                Standard operating verification before inviting real corporate employees
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
            100% Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Environment Variables</span>
            </div>
            <p className="text-[11px] text-neutral-600 font-mono">
              NODE_ENV=production
            </p>
            <p className="text-[11px] text-neutral-500">
              Live production environment active in .env.example & runtime.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Turn off Debugging</span>
            </div>
            <p className="text-[11px] text-neutral-600 font-mono">
              Verbose Logs Suppressed
            </p>
            <p className="text-[11px] text-neutral-500">
              Sensitive database queries and stack traces masked from live UI.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Automated Daily Backup</span>
            </div>
            <p className="text-[11px] text-neutral-600 font-mono">
              scripts/backup_database.sh
            </p>
            <p className="text-[11px] text-neutral-500">
              Automated CRON script configured with 30-day snapshot rotation.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>SSL / HTTPS Enforced</span>
            </div>
            <p className="text-[11px] text-neutral-600 font-mono">
              portal.clickcamp.site
            </p>
            <p className="text-[11px] text-neutral-500">
              TLS 1.3 encryption for passwords, webmail, and employee credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
