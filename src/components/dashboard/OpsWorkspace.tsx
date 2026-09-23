import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ClientAccount, ClientVerificationStatus } from '../../types';
import {
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  PhoneCall,
  Search,
  Filter,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  Zap,
  TrendingUp,
  Flame,
  FileCheck
} from 'lucide-react';

export const OpsWorkspace: React.FC = () => {
  const {
    currentUser,
    clientAccounts,
    lockAccountForReview,
    releaseAccountLock,
    reviewAccount
  } = useWorkspace();

  const [statusFilter, setStatusFilter] = useState<'all' | ClientVerificationStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuditAccount, setSelectedAuditAccount] = useState<ClientAccount | null>(null);

  // Audit form state
  const [auditNotes, setAuditNotes] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [gstinVerified, setGstinVerified] = useState(false);
  const [billingTermsVerified, setBillingTermsVerified] = useState(false);

  // Filter accounts
  const filteredAccounts = clientAccounts.filter((acc) => {
    const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
    const matchesSearch =
      acc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.submittedByName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate Ops KPIs
  const totalVerifiedToday = clientAccounts.filter((a) => a.status === 'verified').length;
  const totalPending = clientAccounts.filter((a) => a.status === 'pending' || a.status === 'under_review').length;
  const totalRejected = clientAccounts.filter((a) => a.status === 'rejected').length;

  const handleStartReview = (acc: ClientAccount) => {
    // If not already locked by current user, lock it
    if (!acc.lockedBy || acc.lockedBy === currentUser.id) {
      lockAccountForReview(acc.id);
      setSelectedAuditAccount(acc);
      setAuditNotes(acc.reviewerNotes || '');
      setPhoneVerified(true);
      setGstinVerified(true);
      setBillingTermsVerified(true);
    }
  };

  const handleAuditDecision = (decision: 'verified' | 'rejected') => {
    if (!selectedAuditAccount) return;
    reviewAccount(selectedAuditAccount.id, decision, auditNotes);
    setSelectedAuditAccount(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Ops KPI Metrics */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Ops Review Hub
              </span>
              <span className="text-xs text-neutral-400">Concurrent Collision Protection Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5 flex items-center gap-2">
              <span>Account Verification Queue & Ops Hub</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">
              Verify closed client submissions, perform telephonic and platform audits, and release accounts in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-800/80 px-3 py-2 rounded-xl border border-neutral-700">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Active Reviewer: <strong>{currentUser.name}</strong></span>
          </div>
        </div>

        {/* Real-time Ops KPIs */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-neutral-800">
          <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/60">
            <span className="text-[11px] text-neutral-400 font-semibold uppercase">Pending Verification</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-amber-400">{totalPending}</span>
              <span className="text-[11px] text-neutral-400">accounts</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/60">
            <span className="text-[11px] text-neutral-400 font-semibold uppercase">Verified Today</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-400">{totalVerifiedToday}</span>
              <span className="text-[11px] text-emerald-400/80">98.2% SLA</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/60">
            <span className="text-[11px] text-neutral-400 font-semibold uppercase">Avg Turnaround</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-white">28m</span>
              <span className="text-[11px] text-emerald-400">-12m vs SLA</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/60">
            <span className="text-[11px] text-neutral-400 font-semibold uppercase">Rejection Rate</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-rose-400">
                {clientAccounts.length > 0 ? ((totalRejected / clientAccounts.length) * 100).toFixed(0) : 0}%
              </span>
              <span className="text-[11px] text-neutral-400">{totalRejected} flagged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Concurrent Review Queue Table */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'All Accounts' },
                { id: 'pending', label: 'Pending Review' },
                { id: 'under_review', label: 'Under Review (Locked)' },
                { id: 'verified', label: 'Verified' },
                { id: 'rejected', label: 'Rejected' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by client, ref or submitter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Verification Queue Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Lock Status</th>
                <th className="py-2.5 px-3">Reference ID</th>
                <th className="py-2.5 px-3">Client & Platform</th>
                <th className="py-2.5 px-3">Phone Verification</th>
                <th className="py-2.5 px-3">Deal Value</th>
                <th className="py-2.5 px-3">Submitted By</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Ops Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-neutral-400">
                    No accounts matching the filter.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isLockedByMe = acc.lockedBy === currentUser.id;
                  const isLockedByOther = acc.lockedBy && acc.lockedBy !== currentUser.id;

                  return (
                    <tr
                      key={acc.id}
                      className={`hover:bg-neutral-50/80 transition ${
                        isLockedByMe ? 'bg-amber-50/30' : isLockedByOther ? 'bg-neutral-50/40 opacity-70' : ''
                      }`}
                    >
                      {/* Lock Status Column */}
                      <td className="py-2.5 px-3">
                        {acc.lockedBy ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isLockedByMe
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-neutral-200 text-neutral-700'
                            }`}
                            title={isLockedByMe ? 'Locked by you' : `Locked by ${acc.lockedByName}`}
                          >
                            <Lock className="w-3 h-3" />
                            {isLockedByMe ? 'You' : acc.lockedByName?.split(' ')[0]}
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-medium">
                            <Unlock className="w-3 h-3" />
                            Available
                          </span>
                        )}
                      </td>

                      {/* Reference ID */}
                      <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">{acc.referenceId}</td>

                      {/* Client & Platform */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-neutral-900">{acc.clientName}</div>
                        <span className="text-[10px] px-1.5 py-0.2 bg-neutral-100 text-neutral-600 rounded font-medium">
                          {acc.platform}
                        </span>
                      </td>

                      {/* Client Phone */}
                      <td className="py-2.5 px-3 font-mono text-neutral-700 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-emerald-600" />
                        <span>{acc.clientPhone}</span>
                      </td>

                      {/* Deal Value */}
                      <td className="py-2.5 px-3 font-bold text-neutral-900">₹{acc.dealValue.toLocaleString('en-IN')}</td>

                      {/* Submitter */}
                      <td className="py-2.5 px-3 text-neutral-600">{acc.submittedByName}</td>

                      {/* Time */}
                      <td className="py-2.5 px-3 text-neutral-400 text-[11px]">{acc.submittedAt}</td>

                      {/* Ops Status */}
                      <td className="py-2.5 px-3">
                        {acc.status === 'pending' && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold text-[11px]">
                            Pending
                          </span>
                        )}
                        {acc.status === 'under_review' && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-semibold text-[11px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Reviewing
                          </span>
                        )}
                        {acc.status === 'verified' && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        )}
                        {acc.status === 'rejected' && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-semibold text-[11px] flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        {isLockedByOther ? (
                          <span className="text-[11px] text-neutral-400 italic">Locked by peer</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {isLockedByMe && (
                              <button
                                onClick={() => releaseAccountLock(acc.id)}
                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[11px] font-medium transition cursor-pointer"
                                title="Release lock back to general pool"
                              >
                                Release
                              </button>
                            )}
                            <button
                              onClick={() => handleStartReview(acc)}
                              className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{acc.status === 'verified' || acc.status === 'rejected' ? 'Re-audit' : 'Audit'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED VERIFICATION AUDIT MODAL */}
      {selectedAuditAccount && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                  OPS
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Detailed Verification Audit</h3>
                  <p className="text-xs text-neutral-500">Ref: {selectedAuditAccount.referenceId}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-[11px]">
                Active Review
              </span>
            </div>

            {/* Account Details Brief */}
            <div className="my-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-400 font-medium">Client / Business:</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{selectedAuditAccount.clientName}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Platform:</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{selectedAuditAccount.platform}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Phone Number:</span>
                  <p className="font-bold text-emerald-700 mt-0.5 font-mono">{selectedAuditAccount.clientPhone}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Contract Value:</span>
                  <p className="font-bold text-neutral-900 mt-0.5">₹{selectedAuditAccount.dealValue.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-500 flex justify-between">
                <span>Submitted by: <strong>{selectedAuditAccount.submittedByName}</strong></span>
                <span>{selectedAuditAccount.submittedAt}</span>
              </div>
            </div>

            {/* Ops Checkpoints Checklist */}
            <div className="space-y-2 mb-4 text-xs">
              <p className="font-bold text-neutral-800">Review Checklist (SOC2 & Financial Controls):</p>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={phoneVerified}
                  onChange={(e) => setPhoneVerified(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-medium text-neutral-700">
                  Client Telephonic Confirmation Completed ({selectedAuditAccount.clientPhone})
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gstinVerified}
                  onChange={(e) => setGstinVerified(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-medium text-neutral-700">
                  Business Entity / Domain Credentials Authenticated
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={billingTermsVerified}
                  onChange={(e) => setBillingTermsVerified(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-medium text-neutral-700">
                  Commercial Commission Terms & Wallet Prepaid Balance Cleared
                </span>
              </label>
            </div>

            {/* Reviewer Notes textarea */}
            <div className="text-xs mb-4">
              <label className="block font-bold text-neutral-800 mb-1">Ops Auditor Notes & Reason</label>
              <textarea
                rows={2}
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="E.g., Telephonic confirmation completed. Domain verified. Ready for deployment."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
              />
            </div>

            {/* Decision Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setSelectedAuditAccount(null)}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium hover:bg-neutral-100 cursor-pointer"
              >
                Close Without Decision
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAuditDecision('rejected')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Account</span>
                </button>

                <button
                  type="button"
                  disabled={!phoneVerified || !gstinVerified}
                  onClick={() => handleAuditDecision('verified')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Verify</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
