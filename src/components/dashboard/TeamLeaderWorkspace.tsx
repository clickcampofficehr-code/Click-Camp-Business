import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Users,
  Clock,
  BellRing,
  Download,
  Printer,
  TrendingUp,
  Target,
  Award,
  CheckCircle2,
  AlertCircle,
  Coffee,
  ChevronRight,
  ShieldCheck,
  Send,
  FileSpreadsheet
} from 'lucide-react';

export const TeamLeaderWorkspace: React.FC = () => {
  const {
    currentUser,
    punchState,
    liveIstTime,
    clientAccounts,
    nudgeEmployee,
    dailyTasks
  } = useWorkspace();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Direct Team Isolation: Employees belonging to Team Alpha (assigned to Vikram Malhotra)
  const teamAlphaMembers = [
    {
      id: 'usr-emp',
      name: 'Rahul Verma',
      role: 'Client Operations Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      punchStatus: punchState === 'clocked_in' ? 'Clocked In (09:32 AM)' : punchState === 'on_break' ? 'On Lunch Break' : 'Clocked Out',
      punchStateBadge: punchState,
      submissionsToday: clientAccounts.filter((a) => a.submittedBy === 'usr-emp').length,
      weeklyQuota: 22,
      weeklyTarget: 25,
      attendanceRate: '96.4%'
    },
    {
      id: 'usr-dev-02',
      name: 'Sneha Kapoor',
      role: 'Ad Campaign Associate',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      punchStatus: 'Clocked In (09:20 AM)',
      punchStateBadge: 'clocked_in',
      submissionsToday: 5,
      weeklyQuota: 24,
      weeklyTarget: 25,
      attendanceRate: '100%'
    },
    {
      id: 'usr-dev-03',
      name: 'Amit Saxena',
      role: 'Outreach & Lead Specialist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      punchStatus: 'Late Punch (10:15 AM)',
      punchStateBadge: 'clocked_in',
      submissionsToday: 3,
      weeklyQuota: 18,
      weeklyTarget: 25,
      attendanceRate: '88.5%'
    },
    {
      id: 'usr-dev-04',
      name: 'Pooja Nair',
      role: 'Account Growth Executive',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      punchStatus: 'Absent (Casual Leave)',
      punchStateBadge: 'absent',
      submissionsToday: 0,
      weeklyQuota: 14,
      weeklyTarget: 25,
      attendanceRate: '92.0%'
    }
  ];

  // Team Alpha summary totals
  const totalTeamSubmissions = teamAlphaMembers.reduce((acc, m) => acc + m.submissionsToday, 0);
  const totalWeeklyTeam = teamAlphaMembers.reduce((acc, m) => acc + m.weeklyQuota, 0);
  const activeClockedInCount = teamAlphaMembers.filter((m) => m.punchStateBadge === 'clocked_in').length;

  const handleDownloadCSV = () => {
    const csvContent =
      'Employee ID,Name,Designation,Punch Status,Submissions Today,Weekly Quota,Weekly Target,Attendance Rate\n' +
      teamAlphaMembers
        .map(
          (m) =>
            `${m.id},"${m.name}","${m.role}","${m.punchStatus}",${m.submissionsToday},${m.weeklyQuota},${m.weeklyTarget},${m.attendanceRate}`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Team_Alpha_Performance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Direct Team Isolation info */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Team Isolation: Team Alpha
            </span>
            <span className="text-xs text-neutral-400">Team Leader: {currentUser.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5 flex items-center gap-2">
            <span>Team Leader Operations Console</span>
            <Users className="w-5 h-5 text-blue-400" />
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            Monitor real-time team punch activity, track target quotas, nudge inactive employees, and export formatted reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Team Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 font-semibold uppercase">Assigned Team Size</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-neutral-900">{teamAlphaMembers.length}</span>
            <span className="text-xs text-neutral-500">Members</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 font-semibold uppercase">Currently Clocked In</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{activeClockedInCount}</span>
            <span className="text-xs text-neutral-500">/ {teamAlphaMembers.length} on shift</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 font-semibold uppercase">Team Closed Today</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-neutral-900">{totalTeamSubmissions}</span>
            <span className="text-xs text-emerald-600 font-medium">Goal: 25</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 font-semibold uppercase">Weekly Quota Run-Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-600">
              {Math.round((totalWeeklyTeam / (teamAlphaMembers.length * 25)) * 100)}%
            </span>
            <span className="text-xs text-neutral-500">of weekly target</span>
          </div>
        </div>
      </div>

      {/* Team Members Live Monitoring & Nudge Table */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Direct Team Live Punch & Quota Monitoring</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live status refreshed every second. Use the Nudge button to dispatch a real-time prompt to any team member.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Live Punch Status</th>
                <th className="py-2.5 px-3">Submissions Today</th>
                <th className="py-2.5 px-3">Weekly Quota</th>
                <th className="py-2.5 px-3">Attendance Rate</th>
                <th className="py-2.5 px-3 text-right">Quick Nudge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {teamAlphaMembers.map((member) => (
                <tr key={member.id} className="hover:bg-neutral-50/70 transition">
                  {/* Member Name + Role */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                      />
                      <div>
                        <span className="font-bold text-neutral-900">{member.name}</span>
                        <p className="text-[11px] text-neutral-500">{member.role}</p>
                      </div>
                    </div>
                  </td>

                  {/* Live Punch Status */}
                  <td className="py-2.5 px-3">
                    {member.punchStateBadge === 'clocked_in' && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-semibold text-[11px] inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {member.punchStatus}
                      </span>
                    )}
                    {member.punchStateBadge === 'on_break' && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-semibold text-[11px] inline-flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-amber-600" />
                        {member.punchStatus}
                      </span>
                    )}
                    {member.punchStateBadge === 'absent' && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-full font-semibold text-[11px]">
                        {member.punchStatus}
                      </span>
                    )}
                    {member.punchStateBadge === 'clocked_out' && (
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-full font-semibold text-[11px]">
                        {member.punchStatus}
                      </span>
                    )}
                  </td>

                  {/* Submissions Today */}
                  <td className="py-2.5 px-3 font-bold text-neutral-900">
                    <span className="text-emerald-700">{member.submissionsToday}</span> / 5 accounts
                  </td>

                  {/* Weekly Quota Bar */}
                  <td className="py-2.5 px-3">
                    <div className="w-36">
                      <div className="flex justify-between text-[11px] mb-1 font-medium">
                        <span>{member.weeklyQuota} closed</span>
                        <span className="text-neutral-400">/ {member.weeklyTarget} target</span>
                      </div>
                      <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, (member.weeklyQuota / member.weeklyTarget) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Attendance Rate */}
                  <td className="py-2.5 px-3 font-semibold text-neutral-900">{member.attendanceRate}</td>

                  {/* Nudge Action */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => nudgeEmployee(member.id, member.name)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                      title="Send instant notification to employee"
                    >
                      <BellRing className="w-3 h-3 text-amber-700" />
                      <span>Nudge</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORT EXPORT MODAL (PDF / PRINT / CSV) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Team Performance & Attendance Report</h3>
                  <p className="text-xs text-neutral-500">Team Alpha Summary • ClickCamp Technologies</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-semibold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Formatted Report Preview */}
            <div className="my-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-3 font-sans">
              <div className="flex justify-between items-start pb-2 border-b border-neutral-200">
                <div>
                  <h4 className="font-bold text-neutral-900">ClickCamp Technologies - Team Alpha Report</h4>
                  <p className="text-[11px] text-neutral-500">Date: {new Date().toLocaleDateString('en-GB')}</p>
                  <p className="text-[11px] text-neutral-500">Supervised by: {currentUser.name} (TL)</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                    OFFICIAL INTERNAL AUDIT
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-1">Generated from Operations Engine</p>
                </div>
              </div>

              {/* Preview table */}
              <table className="w-full text-left text-[11px]">
                <thead className="bg-neutral-200/70 text-neutral-700 font-bold">
                  <tr>
                    <th className="p-1.5">Employee</th>
                    <th className="p-1.5">Status</th>
                    <th className="p-1.5">Today's Deals</th>
                    <th className="p-1.5">Weekly Output</th>
                    <th className="p-1.5">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {teamAlphaMembers.map((m) => (
                    <tr key={m.id}>
                      <td className="p-1.5 font-semibold text-neutral-900">{m.name}</td>
                      <td className="p-1.5 text-neutral-600">{m.punchStatus}</td>
                      <td className="p-1.5 font-bold text-neutral-900">{m.submissionsToday}</td>
                      <td className="p-1.5 text-neutral-900">{m.weeklyQuota} / {m.weeklyTarget}</td>
                      <td className="p-1.5 font-semibold text-emerald-700">{m.attendanceRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-500 flex justify-between">
                <span>Total Active Shift Strength: <strong>{activeClockedInCount} / 4</strong></span>
                <span>Team Goal Completion: <strong>{Math.round((totalWeeklyTeam / 100) * 100)}%</strong></span>
              </div>
            </div>

            {/* Export action triggers */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Download CSV / Excel</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPDF}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
