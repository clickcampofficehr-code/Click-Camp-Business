import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ShieldCheck, Filter, Search, Download, Clock, User, Globe } from 'lucide-react';

export const AuditLogWorkspace: React.FC = () => {
  const { auditLogs } = useWorkspace();
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const exportCsv = () => {
    const header = 'Timestamp,Actor,Role,Action,Details,IP Address\n';
    const rows = filteredLogs
      .map((l) => `"${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.details}","${l.ipAddress}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClickCamp_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Security & Compliance
            </span>
            <span className="text-xs text-neutral-400">SOC2 Type II Immutable Audit Trail</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5 flex items-center gap-2">
            <span>System Audit Logs & Security Events</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            Real-time forensic ledger tracking user authentications, punch states, document uploads, and administrative approvals.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-neutral-700 shadow-xs"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="ALL">All Event Types</option>
              <option value="LOGIN">LOGIN</option>
              <option value="PUNCH_IN">PUNCH_IN</option>
              <option value="PUNCH_OUT">PUNCH_OUT</option>
              <option value="APPROVAL">APPROVAL</option>
              <option value="REJECTION">REJECTION</option>
              <option value="UPLOAD">UPLOAD</option>
              <option value="LOCK_SCREEN">LOCK_SCREEN</option>
              <option value="NUDGE">NUDGE</option>
            </select>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search user, action, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 px-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400 font-sans">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/70 transition">
                    <td className="py-2.5 px-3 text-neutral-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900 font-sans">{log.userName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] uppercase font-sans font-semibold">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action.includes('PUNCH') || log.action === 'APPROVAL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'REJECTION' || log.action === 'LOCK_SCREEN'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-700 font-sans max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-500">{log.ipAddress}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
