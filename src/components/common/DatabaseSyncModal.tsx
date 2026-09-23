import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import {
  Database,
  Radio,
  CheckCircle2,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  FileCode,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface DatabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSyncModal: React.FC<DatabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, broadcastTask, recordAuditLog, purgeDemoData, refreshNotices } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'test' | 'purge'>('status');
  const [copied, setCopied] = useState(false);
  const [copiedPurge, setCopiedPurge] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Connect to realtime hook
  const { status, lastEvent, eventCount } = useRealtimeSync({
    currentUserId: currentUser.id,
    isSuperAdmin: currentUser.role === 'super_admin',
    onNoticeChange: () => {
      refreshNotices();
      showNotification('Company Notice Board synchronized in real time!');
    }
  });

  if (!isOpen) return null;

  const sqlSchemaSnippet = `-- Run this in your Supabase SQL Editor:
-- 1. Tables: profiles, documents_compliance, tasks, messages_chat, audit_logs, notices
-- 2. Row Level Security (RLS) is pre-configured
-- 3. Supabase Realtime publication enabled

ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.documents_compliance REPLICA IDENTITY FULL;
ALTER TABLE public.messages_chat REPLICA IDENTITY FULL;
ALTER TABLE public.notices REPLICA IDENTITY FULL;

BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.tasks, 
    public.documents_compliance, 
    public.messages_chat, 
    public.profiles, 
    public.audit_logs,
    public.notices;
COMMIT;`;

  const copySqlSchema = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    showNotification('SQL Schema snippet copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  // Test Realtime Event Simulator
  const handleSimulateAdminTaskAssignment = () => {
    broadcastTask({
      title: 'Urgent: Complete Q3 Statutory Compliance Filing',
      priority: 'high',
      department: 'Operations',
      targetCount: 15,
      deadline: 'Today, 6:00 PM IST'
    });
    recordAuditLog('SECURITY_OVERRIDE', 'Super Admin assigned task broadcast via Realtime Engine');
    showNotification('Simulated real-time task assignment broadcast!');
  };

  const handleSimulateEmployeeTaskCompletion = () => {
    recordAuditLog('APPROVAL', 'Employee marked task as COMPLETED. Realtime notification triggered to Admin.');
    showNotification('Simulated employee real-time status update to Admin!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Database & Real-Time Sync Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  Supabase + PostgreSQL
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                PostgreSQL Change Data Capture (CDC), Row Level Security & WebSocket Streams
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-4 pt-2 gap-2 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Connection & Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'schema'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>SQL Schema & RLS</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'test'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Real-time Event Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('purge')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'purge'
                ? 'border-rose-600 text-rose-700 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Purge Demo Data</span>
          </button>
        </div>

        {notice && (
          <div className="mx-4 mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Connection Status Card */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-700 font-bold">Realtime Channel Status:</span>
                    {status === 'connected' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        LIVE (WebSockets Active)
                      </span>
                    ) : isSupabaseConfigured ? (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                        Connecting...
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 font-mono font-bold flex items-center gap-1">
                        <Radio className="w-3 h-3 text-emerald-600" />
                        Local Active Mode (Ready for Supabase URL & Key)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Live subscriptions listening on <code className="text-emerald-700 font-mono">clickcamp-realtime-hub</code>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-neutral-400 block font-mono">Events Received</span>
                  <span className="text-base font-bold text-neutral-900 font-mono">{eventCount}</span>
                </div>
              </div>

              {/* Environment Setup Guide */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2.5">
                <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-neutral-700" />
                  Connect Your Supabase Project
                </h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  To connect your hosted Supabase instance, set the following keys in your environment (or AI Studio Settings):
                </p>
                <div className="bg-neutral-900 text-neutral-200 p-3 rounded-xl font-mono text-[11px] space-y-1 select-all">
                  <p className="text-emerald-400">VITE_SUPABASE_URL="https://your-project.supabase.co"</p>
                  <p className="text-emerald-400">VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."</p>
                </div>
              </div>

              {/* Architecture & Security Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Row Level Security (RLS)</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Strict PostgreSQL policies guarantee employees can only read/write their own records, while Adnan Malik (Super Admin) has full cross-org clearance.
                  </p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Zero-Latency CDC</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    PostgreSQL replication pushes task delegations, status transitions, and document approvals instantly via low-overhead WebSockets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-neutral-600">
                  Execute this SQL in the Supabase SQL Editor to provision all tables and real-time publications:
                </p>
                <button
                  onClick={copySqlSchema}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="bg-neutral-900 text-neutral-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-72 border border-neutral-800">
                <pre>{sqlSchemaSnippet}</pre>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
                <strong>Full Schema File:</strong> Located in <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-800">/src/db/schema.sql</code> including complete table constraints, foreign keys, and storage bucket security.
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <p className="text-[11px] text-neutral-600">
                Test the real-time pipeline behavior. Triggering actions will update the portal and record SOC2 audit logs instantly without a page refresh:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Admin Task Assignment</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Simulates Adnan Malik assigning a high-priority task. The employee's Daily Task Hub updates in real-time.
                  </p>
                  <button
                    onClick={handleSimulateAdminTaskAssignment}
                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Radio className="w-3 h-3 text-emerald-400" />
                    <span>Broadcast Task Assignment</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Employee Task Completion</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Simulates an employee completing their task. The Admin Dashboard reflects this live.
                  </p>
                  <button
                    onClick={handleSimulateEmployeeTaskCompletion}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Broadcast Task Completion</span>
                  </button>
                </div>
              </div>

              {lastEvent && (
                <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 space-y-1 font-mono text-[10.5px]">
                  <span className="text-neutral-500 block font-bold">Latest Realtime Event Caught:</span>
                  <div className="text-emerald-700">
                    [{lastEvent.timestamp.split('T')[1].slice(0, 8)}] Table: {lastEvent.table} | Event: {lastEvent.eventType}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'purge' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 space-y-1">
                  <span className="font-bold block">Production Launch Sanitization</span>
                  <p className="leading-relaxed">
                    Prior to official onboarding of real ClickCamp personnel, execute this purge to sanitize the local state and remove all mock tasks, demo chat channels, placeholder leads, and simulated tickets.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">1. Instant Workstation State Purge</h4>
                    <p className="text-[11px] text-neutral-500">
                      Wipes all memory collections and local session mock artifacts.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsPurging(true);
                      setTimeout(() => {
                        purgeDemoData();
                        setIsPurging(false);
                        showNotification('Demo data successfully purged. Workstation sanitized.');
                      }, 500);
                    }}
                    disabled={isPurging}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isPurging ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Purging...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Execute Purge</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">2. Production Database SQL Script</h4>
                    <p className="text-[11px] text-neutral-500">
                      Targeted SQL statements for Supabase SQL Editor (<code className="font-mono">/src/db/purge_demo_data.sql</code>)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`-- Click Camp Production Purge
DELETE FROM public.tasks WHERE title ILIKE '%Demo%' OR title ILIKE '%Sample%' OR title ILIKE '%Test%';
DELETE FROM public.messages_chat WHERE content ILIKE '%Sample%' OR content ILIKE '%Welcome to ClickCamp team chat%';
DELETE FROM public.documents_compliance WHERE form_name ILIKE '%Demo%' OR form_name ILIKE '%Sample%';
DELETE FROM public.audit_logs WHERE description ILIKE '%Simulated%' OR description ILIKE '%demo%';
COMMIT;`);
                      setCopiedPurge(true);
                      showNotification('Purge SQL copied to clipboard');
                      setTimeout(() => setCopiedPurge(false), 2500);
                    }}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedPurge ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPurge ? 'Copied' : 'Copy Purge SQL'}</span>
                  </button>
                </div>

                <div className="bg-neutral-900 text-neutral-300 p-3 rounded-lg font-mono text-[10.5px] max-h-36 overflow-y-auto border border-neutral-800">
                  <pre>{`-- Purge sample records before production launch
DELETE FROM public.tasks WHERE title ILIKE '%Demo%' OR title ILIKE '%Test%';
DELETE FROM public.messages_chat WHERE content ILIKE '%Sample%';
DELETE FROM public.documents_compliance WHERE file_url ILIKE '%placeholder%';
DELETE FROM public.audit_logs WHERE description ILIKE '%Simulated%';`}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-neutral-500">
            Click Camp Business and Technology Services Limited
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
