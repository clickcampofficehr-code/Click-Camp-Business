import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  FileText,
  Coffee,
  CalendarDays,
  Send,
  UserX,
  Target,
  Award,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  CheckSquare,
  Users,
  Mail,
  Video,
  LifeBuoy,
  MessageSquare,
  FolderOpen,
  Lock
} from 'lucide-react';
import { AttendanceRegularization, ClientAccount, LeadItem, LeaveRequest } from '../../types';
import { CompanyNoticeBoard } from '../common/CompanyNoticeBoard';

export const EmployeeWorkspace: React.FC = () => {
  const {
    currentUser,
    punchState,
    liveIstTime,
    elapsedSeconds,
    clockIn,
    clockOut,
    toggleBreak,
    punchRecords,
    regularizations,
    submitRegularization,
    clientAccounts,
    submitClientAccount,
    leads,
    updateLeadStage,
    addLead,
    leaves,
    applyLeave,
    resignations,
    submitResignation,
    dailyTasks,
    setActiveTab
  } = useWorkspace();

  // Modals state
  const [isSubmitAccountModalOpen, setIsSubmitAccountModalOpen] = useState(false);
  const [isRegularizeModalOpen, setIsRegularizeModalOpen] = useState(false);
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [isResignModalOpen, setIsResignModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  // Form states
  const [newAccName, setNewAccName] = useState('');
  const [newAccPlatform, setNewAccPlatform] = useState<ClientAccount['platform']>('Meta Ads');
  const [newAccRef, setNewAccRef] = useState(`REF-CC-${Math.floor(10000 + Math.random() * 90000)}`);
  const [newAccPhone, setNewAccPhone] = useState('+91 98200 ');
  const [newAccValue, setNewAccValue] = useState('150000');

  // Regularize form
  const [regDate, setRegDate] = useState('2026-09-11');
  const [regReason, setRegReason] = useState<AttendanceRegularization['reason']>('Forgot to Punch');
  const [regInTime, setRegInTime] = useState('09:30 AM');
  const [regOutTime, setRegOutTime] = useState('06:30 PM');
  const [regExplanation, setRegExplanation] = useState('');

  // Leave form
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Casual Leave');
  const [leaveStart, setLeaveStart] = useState('2026-09-22');
  const [leaveEnd, setLeaveEnd] = useState('2026-09-23');
  const [leaveDays, setLeaveDays] = useState('2');
  const [leaveReason, setLeaveReason] = useState('');

  // Resign form
  const [resignLwd, setResignLwd] = useState('2026-10-15');
  const [resignReason, setResignReason] = useState('');

  // Add Lead form
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadPhone, setLeadPhone] = useState('+91 ');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadValue, setLeadValue] = useState('200000');
  const [leadSource, setLeadSource] = useState('Inbound Website');

  // Format elapsed time HH:MM:SS
  const formatElapsed = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Filter client accounts submitted by current user
  const mySubmissions = clientAccounts.filter((acc) => acc.submittedBy === currentUser.id);

  // Filter regularizations of current user
  const myRegularizations = regularizations.filter((r) => r.userId === currentUser.id);

  // Filter leaves of current user
  const myLeaves = leaves.filter((l) => l.userId === currentUser.id);

  // Active resignation record if any
  const myResignation = resignations.find((r) => r.userId === currentUser.id);

  // Mock days for September 2026 attendance calendar
  const calendarDays = [
    { day: 1, status: 'present', hours: '9h 15m' },
    { day: 2, status: 'present', hours: '9h 05m' },
    { day: 3, status: 'present', hours: '8h 50m' },
    { day: 4, status: 'present', hours: '9h 20m' },
    { day: 5, status: 'weekend', hours: '-' },
    { day: 6, status: 'weekend', hours: '-' },
    { day: 7, status: 'present', hours: '9h 10m' },
    { day: 8, status: 'present', hours: '9h 00m' },
    { day: 9, status: 'present', hours: '9h 10m' },
    { day: 10, status: 'present', hours: '9h 12m' },
    { day: 11, status: 'regularization_pending', hours: 'Missed Punch' },
    { day: 12, status: 'half_day', hours: '4h 15m' },
    { day: 13, status: 'present', hours: '9h 05m' },
    { day: 14, status: punchState === 'clocked_in' ? 'present_live' : 'clocked_out', hours: formatElapsed(elapsedSeconds) },
    { day: 15, status: 'upcoming', hours: '-' },
    { day: 16, status: 'upcoming', hours: '-' },
    { day: 17, status: 'upcoming', hours: '-' },
    { day: 18, status: 'upcoming', hours: '-' },
    { day: 19, status: 'weekend', hours: '-' },
    { day: 20, status: 'weekend', hours: '-' },
    { day: 21, status: 'upcoming', hours: '-' },
    { day: 22, status: 'leave_pending', hours: 'Casual Leave' },
    { day: 23, status: 'leave_pending', hours: 'Casual Leave' },
    { day: 24, status: 'upcoming', hours: '-' },
    { day: 25, status: 'upcoming', hours: '-' },
    { day: 26, status: 'weekend', hours: '-' },
    { day: 27, status: 'weekend', hours: '-' },
    { day: 28, status: 'upcoming', hours: '-' },
    { day: 29, status: 'upcoming', hours: '-' },
    { day: 30, status: 'upcoming', hours: '-' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner with Targets & Performance */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 rounded-2xl p-5 sm:p-6 text-white border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Department: {currentUser.department}
            </span>
            <span className="text-xs text-neutral-400">Team: Alpha</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            Track your daily attendance punches, closed client accounts, active lead pipeline, and quota goals.
          </p>
        </div>

        {/* Quota Progress Pill */}
        <div className="bg-neutral-800/80 p-3.5 rounded-xl border border-neutral-700/80 flex items-center gap-4 shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Today's Closed Accounts</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-emerald-400">4</span>
              <span className="text-xs text-neutral-400">/ 5 target</span>
            </div>
            <div className="w-32 bg-neutral-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full w-4/5" />
            </div>
          </div>
          <div className="border-l border-neutral-700 pl-3">
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Department Rank</p>
            <div className="flex items-center gap-1 mt-0.5 text-amber-400 font-bold text-lg">
              <Award className="w-4 h-4" />
              <span>#2</span>
            </div>
            <span className="text-[10px] text-neutral-400">Team Alpha</span>
          </div>
        </div>
      </div>

      {/* AUTHORIZED OPERATIONAL HUBS QUICK DOCK */}
      <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                <span>Authorized Operational Hubs</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  5 Permitted Tools
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500">
                Employee profile locked to 5 core tools. Managerial and administrative operational hubs require supervisor password.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>Operational Hubs Locked</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-3">
          <button
            onClick={() => setActiveTab('webmail')}
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-800 truncate group-hover:text-blue-700">Webmail Client</p>
              <p className="text-[10px] text-neutral-500 truncate">Inbox & composition</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 hover:border-purple-300 hover:bg-purple-50/50 transition text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 group-hover:bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-800 truncate group-hover:text-purple-700">Meeting Hub & MOM</p>
              <p className="text-[10px] text-neutral-500 truncate">Schedules & minutes</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('support_finance')}
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50 transition text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 group-hover:bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-800 truncate group-hover:text-amber-700">Support & CRM</p>
              <p className="text-[10px] text-neutral-500 truncate">Tickets & client desk</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-800 truncate group-hover:text-emerald-700">Team Chat</p>
              <p className="text-[10px] text-neutral-500 truncate">Direct messaging</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('dms')}
            className="col-span-2 sm:col-span-1 flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 hover:border-teal-300 hover:bg-teal-50/50 transition text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 group-hover:bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-800 truncate group-hover:text-teal-700">Document System</p>
              <p className="text-[10px] text-neutral-500 truncate">DMS repository</p>
            </div>
          </button>
        </div>
      </div>

      {/* OFFICIAL COMPANY NOTICE BOARD */}
      <CompanyNoticeBoard defaultTab="all" />

      {/* SECTION 1: TIME & ATTENDANCE PUNCH CLOCK + CALENDAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PUNCH CLOCK CARD */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-neutral-900">Attendance Punch Clock</h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded border border-neutral-200">
                {liveIstTime}
              </span>
            </div>

            {/* Current status display */}
            <div className="my-5 text-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span className="text-xs text-neutral-500 font-medium">Session Elapsed Time</span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-neutral-900 tracking-wider my-1">
                {punchState === 'clocked_in' ? formatElapsed(elapsedSeconds) : '00:00:00'}
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {punchState === 'clocked_in' && (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Clocked In (Active Duty)
                  </span>
                )}
                {punchState === 'on_break' && (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5" />
                    On Meal / Tea Break
                  </span>
                )}
                {punchState === 'clocked_out' && (
                  <span className="px-2.5 py-0.5 bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-full">
                    Clocked Out
                  </span>
                )}
              </div>
            </div>

            {/* Punch Action Buttons */}
            <div className="space-y-2">
              {punchState === 'clocked_out' ? (
                <button
                  onClick={clockIn}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock In (Start Duty)</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={toggleBreak}
                    className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium rounded-xl text-xs transition border border-neutral-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5 text-amber-600" />
                    <span>{punchState === 'on_break' ? 'Resume Work' : 'Lunch Break'}</span>
                  </button>
                  <button
                    onClick={clockOut}
                    className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Clock Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Regularization link */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Missed a biometric punch?</span>
            <button
              onClick={() => setIsRegularizeModalOpen(true)}
              className="text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Regularize</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MONTHLY COLOR-CODED ATTENDANCE CALENDAR */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-700" />
                <span>Monthly Attendance Summary - September 2026</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Color-coded daily status with hours logged and shift validation.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-[11px] flex-wrap">
              <span className="flex items-center gap-1 text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Present (11)</span>
              <span className="flex items-center gap-1 text-blue-700"><span className="w-2 h-2 rounded-full bg-blue-500" /> Half-Day (1)</span>
              <span className="flex items-center gap-1 text-amber-700"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pending (1)</span>
              <span className="flex items-center gap-1 text-neutral-500"><span className="w-2 h-2 rounded-full bg-neutral-300" /> Weekend (4)</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="font-bold text-neutral-400 text-[11px] py-1 uppercase tracking-wider">
                {d}
              </div>
            ))}

            {calendarDays.map((c) => {
              let bg = 'bg-neutral-50 text-neutral-600 border-neutral-200/80';
              let badgeText = c.hours;
              if (c.status === 'present') {
                bg = 'bg-emerald-50 text-emerald-900 border-emerald-200 font-medium';
              } else if (c.status === 'present_live') {
                bg = 'bg-emerald-500 text-white border-emerald-600 font-bold ring-2 ring-emerald-400';
              } else if (c.status === 'half_day') {
                bg = 'bg-blue-50 text-blue-900 border-blue-200 font-medium';
              } else if (c.status === 'regularization_pending') {
                bg = 'bg-amber-50 text-amber-900 border-amber-200 font-medium';
              } else if (c.status === 'leave_pending') {
                bg = 'bg-purple-50 text-purple-900 border-purple-200 font-medium';
              } else if (c.status === 'weekend') {
                bg = 'bg-neutral-100/60 text-neutral-400 border-neutral-100';
              }

              return (
                <div
                  key={c.day}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-between min-h-[58px] transition hover:shadow-xs ${bg}`}
                >
                  <span className="text-xs font-bold leading-none">{c.day}</span>
                  <span className="text-[10px] mt-1 leading-tight opacity-90 truncate max-w-full">
                    {badgeText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pending Regularizations Notice */}
          {myRegularizations.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Regularization request for <strong>{myRegularizations[0].date}</strong> is pending HR approval.
                </span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                Pending HR
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: CLIENT ACCOUNT SUBMISSIONS (OPS QUEUE INTEGRATION) */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <span>Closed Client Account Submissions</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Submit newly closed client campaigns for real-time Operations verification and live KYC approval.
            </p>
          </div>

          <button
            onClick={() => setIsSubmitAccountModalOpen(true)}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Submit Closed Account</span>
          </button>
        </div>

        {/* Submissions Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Reference ID</th>
                <th className="py-2.5 px-3">Client / Business</th>
                <th className="py-2.5 px-3">Platform</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Value (INR)</th>
                <th className="py-2.5 px-3">Submitted At</th>
                <th className="py-2.5 px-3">Ops Status</th>
                <th className="py-2.5 px-3">Review Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {mySubmissions.map((acc) => {
                let statusBadge = (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-medium text-[11px]">
                    Pending Verification
                  </span>
                );
                if (acc.status === 'under_review') {
                  statusBadge = (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      Locked for Review
                    </span>
                  );
                } else if (acc.status === 'verified') {
                  statusBadge = (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified & Active
                    </span>
                  );
                } else if (acc.status === 'rejected') {
                  statusBadge = (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-medium text-[11px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      Rejected
                    </span>
                  );
                }

                return (
                  <tr key={acc.id} className="hover:bg-neutral-50/70 transition">
                    <td className="py-2.5 px-3 font-mono font-semibold text-neutral-900">{acc.referenceId}</td>
                    <td className="py-2.5 px-3 font-medium text-neutral-900">{acc.clientName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[11px] font-medium">
                        {acc.platform}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-600">{acc.clientPhone}</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">₹{acc.dealValue.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-neutral-500">{acc.submittedAt}</td>
                    <td className="py-2.5 px-3">{statusBadge}</td>
                    <td className="py-2.5 px-3 text-neutral-500 italic max-w-xs truncate">
                      {acc.reviewerNotes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: LEAD PIPELINE TRACKER */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Prospective Lead Pipeline Tracker</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage prospective clients across 3 stages from initial outreach to finalized account.
            </p>
          </div>

          <button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>

        {/* 3 Funnel Columns */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              stage: 'initial_contact' as const,
              label: '1. Initial Contact & Outreach',
              color: 'border-blue-200 bg-blue-50/30 text-blue-900'
            },
            {
              stage: 'document_submission' as const,
              label: '2. KYC & Document Submission',
              color: 'border-amber-200 bg-amber-50/30 text-amber-900'
            },
            {
              stage: 'active_account' as const,
              label: '3. Closed & Active Account',
              color: 'border-emerald-200 bg-emerald-50/30 text-emerald-900'
            }
          ].map((col) => {
            const stageLeads = leads.filter((l) => l.stage === col.stage);
            return (
              <div key={col.stage} className={`p-3 rounded-xl border ${col.color}`}>
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 mb-2.5">
                  <span className="font-bold text-xs">{col.label}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-white font-bold shadow-xs">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {stageLeads.length === 0 ? (
                    <p className="text-[11px] text-neutral-400 text-center py-4">No leads in this stage</p>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 bg-white rounded-xl border border-neutral-200/90 shadow-xs text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900">{lead.name}</span>
                          <span className="text-[11px] font-semibold text-emerald-700">
                            ₹{lead.value.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 font-medium">{lead.company}</p>
                        <p className="text-[11px] text-neutral-400">{lead.phone}</p>
                        <p className="text-[11px] text-neutral-500 italic mt-1 bg-neutral-50 p-1 rounded">
                          "{lead.lastActivity}"
                        </p>

                        {/* Action buttons to advance */}
                        <div className="pt-2 flex items-center justify-between border-t border-neutral-100 text-[11px]">
                          {col.stage === 'initial_contact' && (
                            <button
                              onClick={() => updateLeadStage(lead.id, 'document_submission')}
                              className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                            >
                              Advance to KYC →
                            </button>
                          )}
                          {col.stage === 'document_submission' && (
                            <button
                              onClick={() => updateLeadStage(lead.id, 'active_account')}
                              className="text-emerald-600 hover:underline font-semibold cursor-pointer"
                            >
                              Mark Account Closed →
                            </button>
                          )}
                          {col.stage === 'active_account' && (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: LEAVE MANAGEMENT & SELF-SERVICE RESIGNATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEAVE MANAGEMENT */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-purple-600" />
                <span>Leave Applications & Balance</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">Annual entitlement balances and requests.</p>
            </div>
            <button
              onClick={() => setIsApplyLeaveModalOpen(true)}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-semibold transition border border-purple-200 cursor-pointer"
            >
              + Apply Leave
            </button>
          </div>

          {/* Leave Balances */}
          <div className="grid grid-cols-3 gap-3 my-4 text-center">
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Casual Leave</span>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">8 / 12</p>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Sick Leave</span>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">5 / 7</p>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Earned Leave</span>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">12 / 15</p>
            </div>
          </div>

          {/* Leaves History */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-700">Recent Applications:</h4>
            {myLeaves.map((lv) => (
              <div
                key={lv.id}
                className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">{lv.leaveType}</span>
                    <span className="text-[11px] text-neutral-500">
                      ({lv.startDate} to {lv.endDate} • {lv.totalDays} days)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5 italic">Reason: {lv.reason}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    lv.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : lv.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {lv.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SELF-SERVICE RESIGNATION & EXIT WORKFLOW */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <UserX className="w-4 h-4 text-rose-600" />
                <span>Self-Service Resignation & Offboarding</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">Notice period filing and clearance tracker.</p>
            </div>
          </div>

          {!myResignation ? (
            <div className="my-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center text-xs">
              <p className="text-neutral-600">
                You are currently in good standing as an active full-time employee.
              </p>
              <p className="text-neutral-400 text-[11px] mt-1">
                Standard ClickCamp notice period is 30 days as per your employee agreement.
              </p>
              <button
                onClick={() => setIsResignModalOpen(true)}
                className="mt-3 px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                Initiate Resignation Request
              </button>
            </div>
          ) : (
            <div className="my-4 p-4 bg-rose-50/60 rounded-xl border border-rose-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-950">Resignation Status: {myResignation.status.toUpperCase()}</span>
                <span className="text-neutral-500 text-[11px]">Submitted: {myResignation.submittedAt}</span>
              </div>
              <p className="text-neutral-700">
                Proposed Last Working Day (LWD): <strong className="text-neutral-900">{myResignation.lastWorkingDay}</strong>
              </p>
              <p className="text-neutral-500 italic">"{myResignation.reason}"</p>

              {/* Clearance Checkpoints */}
              <div className="pt-2 border-t border-rose-200">
                <p className="text-[11px] font-bold text-neutral-700 mb-1.5">Exit Clearance Checklist:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={myResignation.clearance.assetsReturned ? 'text-emerald-600 font-bold' : 'text-neutral-400'}>
                      {myResignation.clearance.assetsReturned ? '✓' : '○'} Assets Handover
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={myResignation.clearance.documentationCompleted ? 'text-emerald-600 font-bold' : 'text-neutral-400'}>
                      {myResignation.clearance.documentationCompleted ? '✓' : '○'} SOP Documentation
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={myResignation.clearance.knowledgeTransferDone ? 'text-emerald-600 font-bold' : 'text-neutral-400'}>
                      {myResignation.clearance.knowledgeTransferDone ? '✓' : '○'} Knowledge Transfer
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={myResignation.clearance.financeCleared ? 'text-emerald-600 font-bold' : 'text-neutral-400'}>
                      {myResignation.clearance.financeCleared ? '✓' : '○'} Finance Settlement
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* SUBMIT CLOSED CLIENT ACCOUNT MODAL */}
      {isSubmitAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900">Submit Closed Client Account</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Submit newly closed account to the real-time Operations Verification Queue.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitClientAccount({
                  clientName: newAccName,
                  platform: newAccPlatform,
                  referenceId: newAccRef,
                  clientPhone: newAccPhone,
                  dealValue: Number(newAccValue) || 100000
                });
                setIsSubmitAccountModalOpen(false);
                setNewAccName('');
                setNewAccRef(`REF-CC-${Math.floor(10000 + Math.random() * 90000)}`);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Client / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Ventures Ltd"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Advertising / Cloud Platform</label>
                <select
                  value={newAccPlatform}
                  onChange={(e) => setNewAccPlatform(e.target.value as ClientAccount['platform'])}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="Google Ads">Google Ads</option>
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Shopify">Shopify</option>
                  <option value="AWS">AWS</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Affiliate Network">Affiliate Network</option>
                  <option value="Custom CRM">Custom CRM</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Reference ID</label>
                  <input
                    type="text"
                    required
                    value={newAccRef}
                    onChange={(e) => setNewAccRef(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Deal Value (INR)</label>
                  <input
                    type="number"
                    required
                    value={newAccValue}
                    onChange={(e) => setNewAccValue(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Client Contact Phone (for Ops KYC check)</label>
                <input
                  type="tel"
                  required
                  value={newAccPhone}
                  onChange={(e) => setNewAccPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitAccountModalOpen(false)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Submit to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGULARIZATION MODAL */}
      {isRegularizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900">Attendance Regularization Request</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Submit missing punch details for HR Lead approval.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitRegularization({
                  date: regDate,
                  reason: regReason,
                  requestedIn: regInTime,
                  requestedOut: regOutTime,
                  explanation: regExplanation
                });
                setIsRegularizeModalOpen(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Incident Date</label>
                <input
                  type="date"
                  required
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Reason for Missing Punch</label>
                <select
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value as AttendanceRegularization['reason'])}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="Forgot to Punch">Forgot to Punch</option>
                  <option value="Biometric/System Glitch">Biometric/System Glitch</option>
                  <option value="Official Field Visit">Official Field Visit</option>
                  <option value="Network Issue">Network Issue</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Requested In</label>
                  <input
                    type="text"
                    required
                    value={regInTime}
                    onChange={(e) => setRegInTime(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Requested Out</label>
                  <input
                    type="text"
                    required
                    value={regOutTime}
                    onChange={(e) => setRegOutTime(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Detailed Explanation</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explain why the punch was missed..."
                  value={regExplanation}
                  onChange={(e) => setRegExplanation(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsRegularizeModalOpen(false)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Submit to HR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLY LEAVE MODAL */}
      {isApplyLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900">Apply for Leave</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Submit application for HR approval.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyLeave({
                  leaveType,
                  startDate: leaveStart,
                  endDate: leaveEnd,
                  totalDays: Number(leaveDays) || 1,
                  reason: leaveReason
                });
                setIsApplyLeaveModalOpen(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveRequest['leaveType'])}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Total Days</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Reason for Leave</label>
                <textarea
                  required
                  rows={2}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="State reason for absence..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsApplyLeaveModalOpen(false)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Apply Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESIGNATION MODAL */}
      {isResignModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-rose-700">Self-Service Resignation Request</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Filing your resignation initiates the formal 30-day clearance handover.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitResignation(resignLwd, resignReason);
                setIsResignModalOpen(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Proposed Last Working Day (LWD)</label>
                <input
                  type="date"
                  required
                  value={resignLwd}
                  onChange={(e) => setResignLwd(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Reason for Resignation</label>
                <textarea
                  required
                  rows={3}
                  value={resignReason}
                  onChange={(e) => setResignReason(e.target.value)}
                  placeholder="Specify reason (e.g. Higher studies, Personal reasons, Career move)..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800">
                Notice: All company assets, access tokens, and project documentation must be cleared prior to final settlement.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsResignModalOpen(false)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Submit Resignation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900">Add Prospective Lead</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Register prospective business in pipeline.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addLead({
                  name: leadName,
                  company: leadCompany,
                  phone: leadPhone,
                  email: leadEmail,
                  stage: 'initial_contact',
                  assignedTo: currentUser.name,
                  value: Number(leadValue) || 100000,
                  source: leadSource
                });
                setIsAddLeadModalOpen(false);
                setLeadName('');
                setLeadCompany('');
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Est. Deal (INR)</label>
                  <input
                    type="number"
                    required
                    value={leadValue}
                    onChange={(e) => setLeadValue(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
