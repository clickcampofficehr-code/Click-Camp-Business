import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Coffee,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  ChevronLeft,
  ChevronRight,
  Info,
  Timer,
  Bell,
  ArrowRight,
  Check,
  Building2,
  CalendarDays,
  FileCheck2,
  Hourglass,
  Layers,
  RefreshCw
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  ShiftSchedule,
  BreakRecord,
  AttendanceAnomaly,
  BreakCategory,
  AnomalyType,
  PunchRecord
} from '../../types';

// Pre-configured Corporate Shift Templates
const CORPORATE_SHIFTS: ShiftSchedule[] = [
  {
    id: 'shift-gen',
    name: 'General Corporate Shift',
    type: 'general',
    startTime: '09:30 AM',
    endTime: '06:30 PM',
    graceMinutes: 15,
    breakAllowanceMinutes: 60,
    workHoursRequired: 8.5,
    description: 'Standard day shift across Business, HR, Accounts, and Executive Governance departments.'
  },
  {
    id: 'shift-morning',
    name: 'Morning Operational Shift',
    type: 'morning',
    startTime: '07:00 AM',
    endTime: '04:00 PM',
    graceMinutes: 15,
    breakAllowanceMinutes: 60,
    workHoursRequired: 8.5,
    description: 'Early morning shift for Ops Verification team and active customer lifecycle onboarding.'
  },
  {
    id: 'shift-evening',
    name: 'Evening Support Shift',
    type: 'evening',
    startTime: '02:00 PM',
    endTime: '11:00 PM',
    graceMinutes: 15,
    breakAllowanceMinutes: 60,
    workHoursRequired: 8.5,
    description: 'Afternoon to late evening support shift for international client accounts & tier-2 verification.'
  },
  {
    id: 'shift-night',
    name: 'Night Infrastructure Shift',
    type: 'night',
    startTime: '10:00 PM',
    endTime: '07:00 AM',
    graceMinutes: 15,
    breakAllowanceMinutes: 60,
    workHoursRequired: 8.5,
    description: '24/7 high-availability IT system audit monitoring and automated database sync runs.'
  }
];

// Pre-configured Break Allowance Categories
const BREAK_TYPES: { category: BreakCategory; label: string; maxMinutes: number; description: string }[] = [
  { category: 'lunch', label: 'Lunch Break', maxMinutes: 45, description: 'Designated corporate cafeteria lunch window' },
  { category: 'tea', label: 'Morning Tea / Coffee', maxMinutes: 15, description: 'Quick morning refreshment and cognitive reset' },
  { category: 'coffee', label: 'Evening Tea / Coffee', maxMinutes: 15, description: 'Mid-afternoon team beverage break' },
  { category: 'wellness', label: 'Personal / Wellness', maxMinutes: 15, description: 'Desk stretch, prayer, or urgent personal phone call' }
];

export const CalendarAttendanceWorkspace: React.FC = () => {
  const {
    currentUser,
    liveIstTime,
    punchState,
    clockInTimestamp,
    elapsedSeconds,
    clockIn,
    clockOut,
    toggleBreak,
    punchRecords,
    regularizations,
    submitRegularization,
    recordAuditLog,
    showToast,
    notifications
  } = useWorkspace();

  const [activeSubTab, setActiveSubTab] = useState<'punch_clock' | 'shifts' | 'breaks' | 'anomalies'>('punch_clock');
  const [selectedBreakType, setSelectedBreakType] = useState<BreakCategory>('lunch');
  const [isPunchOutConfirmOpen, setIsPunchOutConfirmOpen] = useState(false);
  const [isRegularizeModalOpen, setIsRegularizeModalOpen] = useState(false);
  const [isShiftRequestModalOpen, setIsShiftRequestModalOpen] = useState(false);

  // Form states for Regularization
  const [regDate, setRegDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [regReason, setRegReason] = useState<'Forgot to Punch' | 'Biometric/System Glitch' | 'Official Field Visit' | 'Network Issue'>('Forgot to Punch');
  const [regInTime, setRegInTime] = useState('09:30 AM');
  const [regOutTime, setRegOutTime] = useState('06:30 PM');
  const [regExplanation, setRegExplanation] = useState('');

  // Form states for Shift Change Request
  const [requestedShiftId, setRequestedShiftId] = useState('shift-gen');
  const [shiftRequestReason, setShiftRequestReason] = useState('');

  // Persistent Break Logs for Current Day
  const [breakRecords, setBreakRecords] = useState<BreakRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`clickcamp_breaks_${currentUser.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'brk-01',
        userId: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        category: 'tea',
        categoryLabel: 'Morning Tea / Coffee',
        startTime: '11:15 AM',
        endTime: '11:28 AM',
        durationMinutes: 13,
        maxAllowedMinutes: 15,
        isOverstayed: false
      }
    ];
  });

  // Persistent Attendance Anomalies (Stored per user and company-wide)
  const [anomalies, setAnomalies] = useState<AttendanceAnomaly[]>(() => {
    try {
      const saved = localStorage.getItem('clickcamp_attendance_anomalies');
      if (saved) {
        const parsed: AttendanceAnomaly[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    // Default initial seeded anomalies
    return [
      {
        id: 'anom-101',
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        department: currentUser.department,
        date: '2026-10-22',
        type: 'late_login',
        title: 'Late Workstation Login (>15m Grace Period)',
        description: 'Punched in at 09:54 AM IST (Shift starts at 09:30 AM, grace cutoff was 09:45 AM). Late by 9 minutes beyond grace window.',
        severity: 'medium',
        detectedAt: '2026-10-22 09:54:12 IST',
        reportedToHR: true,
        reportedAt: '2026-10-22 10:02:00 IST',
        hrStatus: 'pending_explanation',
        employeeExplanation: 'Heavy traffic congestion on Delhi-Gurugram Expressway due to road maintenance.',
        regularizationRequested: true
      },
      {
        id: 'anom-102',
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        department: currentUser.department,
        date: '2026-10-18',
        type: 'overstay_break',
        title: 'Break Quota Overstay Exceeded (Lunch Break)',
        description: 'Lunch break exceeded allotted 45-minute policy limit. Duration recorded: 54 minutes (9 minutes overstay).',
        severity: 'low',
        detectedAt: '2026-10-18 14:24:00 IST',
        reportedToHR: true,
        reportedAt: '2026-10-18 14:30:15 IST',
        hrStatus: 'regularized',
        employeeExplanation: 'Held in company town hall meeting extending through the designated lunch hour.',
        hrNotes: 'Verified with team manager. Anomaly waived without deduction.'
      }
    ];
  });

  // Current Break tracking state
  const [activeBreakStart, setActiveBreakStart] = useState<Date | null>(() => {
    if (punchState === 'on_break') {
      const saved = localStorage.getItem(`clickcamp_active_break_start_${currentUser.id}`);
      return saved ? new Date(saved) : new Date();
    }
    return null;
  });

  const [activeBreakElapsedSeconds, setActiveBreakElapsedSeconds] = useState<number>(0);

  // Sync Break elapsed timer
  useEffect(() => {
    let timer: any;
    if (punchState === 'on_break' && activeBreakStart) {
      timer = setInterval(() => {
        const secs = Math.floor((new Date().getTime() - activeBreakStart.getTime()) / 1000);
        setActiveBreakElapsedSeconds(secs > 0 ? secs : 0);
      }, 1000);
    } else {
      setActiveBreakElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [punchState, activeBreakStart]);

  // Persist Break Records
  useEffect(() => {
    try {
      localStorage.setItem(`clickcamp_breaks_${currentUser.id}`, JSON.stringify(breakRecords));
    } catch {}
  }, [breakRecords, currentUser.id]);

  // Persist Anomalies
  useEffect(() => {
    try {
      localStorage.setItem('clickcamp_attendance_anomalies', JSON.stringify(anomalies));
    } catch {}
  }, [anomalies]);

  // Determine current user's assigned shift
  const assignedShift = useMemo(() => {
    const dept = (currentUser.department || '').toLowerCase();
    if (dept.includes('manager') || currentUser.role === 'ops') {
      return CORPORATE_SHIFTS[1]; // Morning Ops Shift
    }
    if (dept.includes('it') || currentUser.role === 'admin') {
      return CORPORATE_SHIFTS[0]; // General Shift
    }
    return CORPORATE_SHIFTS[0]; // Default General Shift
  }, [currentUser]);

  // Daily Break totals
  const totalBreakMinutesUsed = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysBreaks = breakRecords.filter((b) => b.date === today);
    const completedMinutes = todaysBreaks.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const activeMinutes = Math.floor(activeBreakElapsedSeconds / 60);
    return completedMinutes + activeMinutes;
  }, [breakRecords, activeBreakElapsedSeconds]);

  const remainingBreakMinutes = Math.max(0, 60 - totalBreakMinutesUsed);

  // Format seconds to HH:MM:SS
  const formatSeconds = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Automated Anomaly Detection Trigger
  const triggerAutomatedAnomaly = (
    type: AnomalyType,
    title: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST';
    const newAnomaly: AttendanceAnomaly = {
      id: `anom-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      department: currentUser.department,
      date: new Date().toISOString().split('T')[0],
      type,
      title,
      description,
      severity,
      detectedAt: `${new Date().toLocaleDateString('en-GB')} ${nowStr}`,
      reportedToHR: false,
      hrStatus: 'pending_explanation',
      regularizationRequested: false
    };

    setAnomalies((prev) => [newAnomaly, ...prev]);
    recordAuditLog('APPROVAL', `[ANOMALY_ENGINE] Detected attendance anomaly for ${currentUser.name}: ${title}`);
    showToast(`Attendance Anomaly Registered: ${title}`);
  };

  // Handle Clock In with Automated Shift Grace Verification
  const handleClockInAction = () => {
    clockIn();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    // In general shift (09:30 AM with 15m grace cut-off at 09:45 AM):
    // If clocked in after 09:45 AM (or before 14:00 for evening), detect late login anomaly
    if (assignedShift.type === 'general' && (currentHour > 9 || (currentHour === 9 && currentMin > 45))) {
      triggerAutomatedAnomaly(
        'late_login',
        'Late Shift Punch-In Detected (>09:45 AM Grace Window)',
        `Punched in at ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} IST. Grace cutoff for ${assignedShift.name} is 09:45 AM IST.`,
        'medium'
      );
    }
  };

  // Handle Clock Out with Shift Completion Validation
  const handleConfirmClockOut = () => {
    setIsPunchOutConfirmOpen(false);
    clockOut();

    // Check if shift duration was under 8.5 hours
    const workedHours = elapsedSeconds / 3600;
    if (workedHours < 8.0) {
      triggerAutomatedAnomaly(
        'early_logout',
        'Early Workstation Logout (< 8.0 Hours Completed)',
        `Clocked out with ${workedHours.toFixed(1)} hours recorded. Standard shift minimum is 8.5 hours. Requires supervisor or HR authorization.`,
        'high'
      );
    }
  };

  // Handle Break Start & End
  const handleStartBreak = (cat: BreakCategory) => {
    if (punchState !== 'clocked_in') {
      showToast('You must be clocked into your workstation to initiate a break.');
      return;
    }
    const catObj = BREAK_TYPES.find((b) => b.category === cat) || BREAK_TYPES[0];
    setSelectedBreakType(cat);
    const now = new Date();
    setActiveBreakStart(now);
    localStorage.setItem(`clickcamp_active_break_start_${currentUser.id}`, now.toISOString());
    toggleBreak();
    recordAuditLog('APPROVAL', `Initiated ${catObj.label} (Max allowance: ${catObj.maxMinutes}m)`);
    showToast(`Break Started: ${catObj.label}. Allowed: ${catObj.maxMinutes} mins.`);
  };

  const handleEndBreak = () => {
    if (punchState !== 'on_break') return;

    const catObj = BREAK_TYPES.find((b) => b.category === selectedBreakType) || BREAK_TYPES[0];
    const durationMins = Math.max(1, Math.round(activeBreakElapsedSeconds / 60));
    const isOverstay = durationMins > catObj.maxMinutes;

    const newRecord: BreakRecord = {
      id: `brk-${Date.now()}`,
      userId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      category: selectedBreakType,
      categoryLabel: catObj.label,
      startTime: activeBreakStart
        ? activeBreakStart.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : 'Earlier',
      endTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      durationMinutes: durationMins,
      maxAllowedMinutes: catObj.maxMinutes,
      isOverstayed: isOverstay
    };

    setBreakRecords((prev) => [newRecord, ...prev]);
    localStorage.removeItem(`clickcamp_active_break_start_${currentUser.id}`);
    setActiveBreakStart(null);
    toggleBreak();

    if (isOverstay) {
      triggerAutomatedAnomaly(
        'overstay_break',
        `Break Overstay Anomaly: ${catObj.label} (+${durationMins - catObj.maxMinutes}m)`,
        `Break exceeded designated limit of ${catObj.maxMinutes} minutes. Recorded break time was ${durationMins} minutes.`,
        'low'
      );
    }

    recordAuditLog('APPROVAL', `Concluded break ${catObj.label} (${durationMins} mins)`);
    showToast(`Break concluded. Returned to active workstation duty.`);
  };

  // Automatically Notify HR of Anomaly
  const handleReportAnomalyToHR = (anomalyId: string) => {
    const target = anomalies.find((a) => a.id === anomalyId);
    if (!target) return;

    const reportedTimestamp = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';

    setAnomalies((prev) =>
      prev.map((a) =>
        a.id === anomalyId
          ? {
              ...a,
              reportedToHR: true,
              reportedAt: reportedTimestamp,
              hrStatus: 'under_review'
            }
          : a
      )
    );

    // Record Immutable HR audit entry
    recordAuditLog(
      'SECURITY_OVERRIDE',
      `[HR_AUTOMATION] Attendance anomaly reported to HR Lead (Priya Nambiar): "${target.title}" for ${target.userName} (${target.department}).`
    );

    showToast(`Anomaly officially logged and dispatched to HR People Operations for review.`);
  };

  // Regularize Anomaly with Employee Explanation
  const handleSaveAnomalyExplanation = (anomalyId: string, explanation: string) => {
    if (!explanation.trim()) {
      showToast('Please provide a brief explanation for HR records.');
      return;
    }

    setAnomalies((prev) =>
      prev.map((a) =>
        a.id === anomalyId
          ? {
              ...a,
              employeeExplanation: explanation.trim(),
              reportedToHR: true,
              reportedAt: a.reportedAt || new Date().toISOString(),
              hrStatus: 'under_review',
              regularizationRequested: true
            }
          : a
      )
    );

    // Dispatch formal regularization to context
    submitRegularization({
      date: regDate,
      reason: 'Forgot to Punch',
      requestedIn: '09:30 AM',
      requestedOut: '06:30 PM',
      explanation
    });

    recordAuditLog(
      'APPROVAL',
      `Submitted attendance anomaly regularization for ${currentUser.name}: ${explanation}`
    );
    showToast(`Regularization and formal explanation submitted to HR.`);
  };

  // Admin / HR Action to resolve anomaly
  const handleResolveAnomaly = (anomalyId: string, status: 'regularized' | 'deduction_applied', notes: string) => {
    setAnomalies((prev) =>
      prev.map((a) =>
        a.id === anomalyId
          ? {
              ...a,
              hrStatus: status,
              hrNotes: notes
            }
          : a
      )
    );
    recordAuditLog('APPROVAL', `HR resolved attendance anomaly ${anomalyId} with decision: ${status}`);
    showToast(`Anomaly marked as ${status === 'regularized' ? 'Approved & Regularized' : 'Deduction Applied'}.`);
  };

  // Submit manual regularization form
  const handleRegularizationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regExplanation.trim()) {
      showToast('Please state the valid operational justification.');
      return;
    }

    submitRegularization({
      date: regDate,
      reason: regReason,
      requestedIn: regInTime,
      requestedOut: regOutTime,
      explanation: regExplanation
    });

    setIsRegularizeModalOpen(false);
    setRegExplanation('');
    showToast('Regularization request dispatched to HR & Team Leader.');
  };

  // Submit Shift Change Request
  const handleShiftRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftRequestReason.trim()) {
      showToast('Please provide a reason for the shift adjustment.');
      return;
    }
    const targetShift = CORPORATE_SHIFTS.find((s) => s.id === requestedShiftId);
    recordAuditLog(
      'APPROVAL',
      `Requested shift change to ${targetShift?.name} for ${currentUser.name}. Reason: ${shiftRequestReason}`
    );
    setIsShiftRequestModalOpen(false);
    setShiftRequestReason('');
    showToast(`Shift swap request for ${targetShift?.name} sent to HR Operations.`);
  };

  // Check if current user is HR or Super Admin
  const isHROrAdmin =
    currentUser.department === 'HR' ||
    currentUser.role === 'hr' ||
    currentUser.role === 'super_admin' ||
    currentUser.email?.toLowerCase() === 'adnan.malik@clickcamp.site';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner & Universal Access Status */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Universal Staff Tool
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                Department: {currentUser.department || 'All Departments'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                Shift: {assignedShift.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-400" />
              <span>Calendar & Attendance Operations</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Unified enterprise punch console, shift roster management, real-time break governance, and automated anomaly reporting to HR.
            </p>
          </div>

          {/* Real-time IST Digital Clock & Regularization Trigger */}
          <div className="flex flex-wrap items-center gap-3 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
            <div className="text-right pr-3 border-r border-neutral-800">
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Live IST (Asia/Kolkata)</span>
              </div>
              <div className="text-lg font-mono font-bold text-white tracking-wider">
                {liveIstTime || '09:30:00 AM'}
              </div>
            </div>

            <button
              onClick={() => setIsRegularizeModalOpen(true)}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Regularize Punch</span>
            </button>
          </div>
        </div>

        {/* Top Operational Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-neutral-800/80">
          {/* Metric 1: Current Punch State */}
          <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
              <span>Workstation State</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  punchState === 'clocked_in'
                    ? 'bg-emerald-400 animate-pulse'
                    : punchState === 'on_break'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-neutral-500'
                }`}
              />
            </div>
            <div className="text-sm sm:text-base font-bold text-white mt-1 capitalize flex items-center gap-1.5">
              {punchState === 'clocked_in' && <span className="text-emerald-400">Clocked In</span>}
              {punchState === 'on_break' && <span className="text-amber-400">On Active Break</span>}
              {punchState === 'clocked_out' && <span className="text-neutral-400">Clocked Out</span>}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
              Shift Timer: {formatSeconds(elapsedSeconds)}
            </div>
          </div>

          {/* Metric 2: Assigned Corporate Shift */}
          <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Assigned Shift
            </div>
            <div className="text-sm sm:text-base font-bold text-neutral-200 mt-1 truncate">
              {assignedShift.name}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
              {assignedShift.startTime} – {assignedShift.endTime} (15m grace)
            </div>
          </div>

          {/* Metric 3: Daily Break Allowance */}
          <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
              <span>Daily Break Quota</span>
              <span className="font-mono text-[9px] text-neutral-400">60m Max</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white mt-1 flex items-center gap-1">
              <span className={totalBreakMinutesUsed > 60 ? 'text-rose-400' : 'text-amber-400'}>
                {totalBreakMinutesUsed}m
              </span>
              <span className="text-xs text-neutral-500 font-normal">/ 60m used</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  totalBreakMinutesUsed > 60 ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, (totalBreakMinutesUsed / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* Metric 4: Anomaly Detection Status */}
          <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
              <span>Anomalies Detected</span>
              {anomalies.some((a) => !a.reportedToHR || a.hrStatus === 'pending_explanation') && (
                <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded text-[9px] font-bold border border-rose-500/30">
                  Action Required
                </span>
              )}
            </div>
            <div className="text-sm sm:text-base font-bold text-white mt-1 flex items-center gap-1.5">
              <span className="text-rose-400 font-mono">{anomalies.length}</span>
              <span className="text-xs text-neutral-400 font-normal">recorded</span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              {anomalies.filter((a) => a.hrStatus === 'regularized').length} regularized with HR
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs across the 4 Required Modules */}
      <div className="flex items-center gap-2 border-b border-neutral-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSubTab('punch_clock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'punch_clock'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Timer className="w-4 h-4 text-emerald-500" />
          <span>Daily Login / Logout Tracking</span>
        </button>

        <button
          onClick={() => setActiveSubTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'shifts'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-emerald-500" />
          <span>Shift Scheduling & Roster</span>
        </button>

        <button
          onClick={() => setActiveSubTab('breaks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'breaks'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Coffee className="w-4 h-4 text-amber-500" />
          <span>Break Management ({remainingBreakMinutes}m left)</span>
          {punchState === 'on_break' && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('anomalies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'anomalies'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Anomaly Engine & HR Reporting</span>
          {anomalies.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
              {anomalies.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. MODULE 1: Daily Login / Logout Tracking */}
      {activeSubTab === 'punch_clock' && (
        <div className="space-y-6">
          {/* Workstation Digital Punch Terminal Card */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left Column: Terminal Status & Time */}
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      punchState === 'clocked_in'
                        ? 'bg-emerald-500 animate-pulse'
                        : punchState === 'on_break'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-neutral-400'
                    }`}
                  />
                  <span>
                    Terminal Node: ClickCamp HQ Gurugram (Tower B, Fl 4) • Workstation #04
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl sm:text-5xl font-mono font-extrabold tracking-tight text-neutral-900">
                    {liveIstTime}
                  </div>
                  <p className="text-xs text-neutral-500">
                    Indian Standard Time (IST UTC+05:30) • Synchronized to Atomic Biometric Time
                  </p>
                </div>

                {clockInTimestamp && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 pt-1">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                      Punched In at: {clockInTimestamp}
                    </span>
                    <span className="bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-lg border border-neutral-200 font-mono">
                      Duty Duration: {formatSeconds(elapsedSeconds)}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Dynamic Punch Action Trigger */}
              <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
                {punchState === 'clocked_out' ? (
                  <button
                    onClick={handleClockInAction}
                    className="w-full sm:w-64 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span>Clock In / Punch Workstation</span>
                  </button>
                ) : punchState === 'clocked_in' ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleStartBreak('lunch')}
                      className="w-full sm:w-44 py-3.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span>Take Break</span>
                    </button>

                    <button
                      onClick={() => setIsPunchOutConfirmOpen(true)}
                      className="w-full sm:w-48 py-3.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Hourglass className="w-4 h-4" />
                      <span>Clock Out / End Shift</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                    <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-mono font-bold animate-pulse flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-amber-600" />
                      <span>Break in Progress: {formatSeconds(activeBreakElapsedSeconds)}</span>
                    </div>
                    <button
                      onClick={handleEndBreak}
                      className="w-full sm:w-64 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>End Break & Resume Shift</span>
                    </button>
                  </div>
                )}

                <div className="text-[11px] text-neutral-400 text-center">
                  Corporate Policy: Minimum 8.5 Hours required for full day credit.
                </div>
              </div>
            </div>
          </div>

          {/* Today's Shift Ledger Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-4">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Expected In / Out Window
              </div>
              <div className="text-base font-bold text-neutral-900">
                {assignedShift.startTime} — {assignedShift.endTime}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Grace period applies up to 15 minutes past start time without anomaly penalty.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Net Workstation Hours Today
              </div>
              <div className="text-base font-bold text-emerald-600 font-mono">
                {formatSeconds(Math.max(0, elapsedSeconds - totalBreakMinutesUsed * 60))}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Excludes {totalBreakMinutesUsed} minutes of taken break time.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Monthly Attendance Credit
              </div>
              <div className="text-base font-bold text-neutral-900">
                96.4% Compliance Rate
              </div>
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                0 Unexcused Absences • 1 Late Mark Regularized
              </p>
            </div>
          </div>

          {/* Attendance Log History Table */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Workstation Attendance History</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Biometric punch log verified with corporate IP and session authentication tokens.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRegularizeModalOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg border border-neutral-200 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Submit Regularization</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100/70 text-neutral-600 font-bold uppercase tracking-wider text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Punch In</th>
                    <th className="py-3 px-4">Punch Out</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes / Anomaly</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {punchRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-neutral-900 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-700 whitespace-nowrap">
                        {rec.clockInTime}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-700 whitespace-nowrap">
                        {rec.clockOutTime || <span className="text-emerald-600 font-bold">Active Shift</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-700 whitespace-nowrap">
                        {Math.floor(rec.durationMinutes / 60)}h {rec.durationMinutes % 60}m
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {rec.status === 'present' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Present
                          </span>
                        ) : rec.status === 'half_day' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Half Day
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-700">
                            {rec.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 max-w-xs truncate">
                        {rec.notes || 'Normal Corporate Hours'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setRegDate(rec.date);
                            setIsRegularizeModalOpen(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer hover:underline text-[11px]"
                        >
                          Regularize
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODULE 2: Shift Scheduling & Weekly Roster */}
      {activeSubTab === 'shifts' && (
        <div className="space-y-6">
          {/* Active Employee Shift Assignment Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-white shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Current Assigned Roster
                </span>
                <h3 className="text-xl font-bold mt-1 text-white">{assignedShift.name}</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                  {assignedShift.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsShiftRequestModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Request Shift Swap / Adjustment</span>
                </button>
              </div>
            </div>

            {/* Shift Rules Quick Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-neutral-800">
              <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Working Timings</div>
                <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                  {assignedShift.startTime} – {assignedShift.endTime}
                </div>
              </div>

              <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Grace Period</div>
                <div className="text-sm font-mono font-bold text-white mt-0.5">
                  +{assignedShift.graceMinutes} Minutes Allowed
                </div>
              </div>

              <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Mandatory Presence</div>
                <div className="text-sm font-mono font-bold text-white mt-0.5">
                  {assignedShift.workHoursRequired} Hours (Full Day)
                </div>
              </div>

              <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Break Allotment</div>
                <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">
                  {assignedShift.breakAllowanceMinutes} Mins Daily Quota
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Roster Calendar Matrix */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  <span>Weekly Operational Roster (Current Week)</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Standard enterprise operational schedule with assigned duty supervisors.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-lg">
                Week 43 • Oct 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {[
                { day: 'Monday', date: 'Oct 19', type: assignedShift.name, in: assignedShift.startTime, out: assignedShift.endTime, status: 'Completed' },
                { day: 'Tuesday', date: 'Oct 20', type: assignedShift.name, in: assignedShift.startTime, out: assignedShift.endTime, status: 'Completed' },
                { day: 'Wednesday', date: 'Oct 21', type: assignedShift.name, in: assignedShift.startTime, out: assignedShift.endTime, status: 'Completed' },
                { day: 'Thursday', date: 'Oct 22', type: assignedShift.name, in: assignedShift.startTime, out: assignedShift.endTime, status: 'Completed' },
                { day: 'Friday', date: 'Oct 23', type: assignedShift.name, in: assignedShift.startTime, out: assignedShift.endTime, status: 'Today (Active)' },
                { day: 'Saturday', date: 'Oct 24', type: 'Weekend Off', in: '--', out: '--', status: 'Rest Day' },
                { day: 'Sunday', date: 'Oct 25', type: 'Weekend Off', in: '--', out: '--', status: 'Rest Day' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition ${
                    item.status.includes('Today')
                      ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400'
                      : item.status === 'Rest Day'
                      ? 'bg-neutral-50/60 border-neutral-200 opacity-75'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-neutral-900">{item.day}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{item.date}</span>
                  </div>

                  <div className="text-xs font-semibold text-neutral-700 truncate mt-1">
                    {item.type}
                  </div>

                  <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                    {item.in} – {item.out}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                        item.status.includes('Today')
                          ? 'bg-emerald-600 text-white'
                          : item.status === 'Completed'
                          ? 'bg-neutral-100 text-neutral-700'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Corporate Shifts Directory */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-neutral-900 mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Available Corporate Shift Profiles</span>
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Official shift schedules approved by HR People Operations and Managing Director.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {CORPORATE_SHIFTS.map((shift) => (
                <div
                  key={shift.id}
                  className={`p-4 rounded-xl border transition ${
                    shift.id === assignedShift.id
                      ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/50'
                      : 'bg-neutral-50/40 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-neutral-900">{shift.name}</div>
                    {shift.id === assignedShift.id && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                        Your Active Shift
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-mono font-semibold text-emerald-700 mt-1">
                    {shift.startTime} to {shift.endTime} IST
                  </div>

                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    {shift.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-neutral-200 text-[10px] text-neutral-500">
                    <span className="bg-white px-2 py-0.5 rounded border border-neutral-200">
                      Grace: +{shift.graceMinutes}m
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-neutral-200">
                      Break: {shift.breakAllowanceMinutes}m
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-neutral-200">
                      Min Req: {shift.workHoursRequired}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODULE 3: Break Management */}
      {activeSubTab === 'breaks' && (
        <div className="space-y-6">
          {/* Active Break State Card */}
          {punchState === 'on_break' ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-amber-950">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md animate-bounce">
                    <Coffee className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                      Active Break in Progress
                    </span>
                    <h3 className="text-xl font-bold mt-0.5 text-neutral-900">
                      {BREAK_TYPES.find((b) => b.category === selectedBreakType)?.label || 'Workstation Break'}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Allowed duration for this break: {BREAK_TYPES.find((b) => b.category === selectedBreakType)?.maxMinutes} minutes
                    </p>
                  </div>
                </div>

                <div className="text-center md:text-right">
                  <div className="text-3xl sm:text-4xl font-mono font-bold text-amber-700">
                    {formatSeconds(activeBreakElapsedSeconds)}
                  </div>
                  <button
                    onClick={handleEndBreak}
                    className="mt-3 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-2 mx-auto md:ml-auto"
                  >
                    <Check className="w-4 h-4" />
                    <span>Conclude Break & Resume Work</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Break Launchpad */
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900 flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-amber-500" />
                    <span>Enterprise Break Governance Console</span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Select a designated corporate break window to record accurate presence.
                  </p>
                </div>

                <div className="bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-right">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase">Available Allowance</div>
                  <div className="text-sm font-bold text-neutral-900 font-mono">
                    {remainingBreakMinutes} Mins Left Today
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {BREAK_TYPES.map((item) => (
                  <div
                    key={item.category}
                    className="p-4 rounded-xl border border-neutral-200 hover:border-amber-400 transition bg-neutral-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-neutral-900">{item.label}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          {item.maxMinutes}m
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartBreak(item.category)}
                      disabled={punchState !== 'clocked_in'}
                      className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        punchState === 'clocked_in'
                          ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                          : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5 text-amber-400" />
                      <span>Start {item.label}</span>
                    </button>
                  </div>
                ))}
              </div>

              {punchState !== 'clocked_in' && (
                <div className="mt-4 p-3 bg-neutral-100 rounded-xl text-xs text-neutral-600 flex items-center gap-2">
                  <Info className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>Workstation shift must be active (Clocked In) before starting any break timer.</span>
                </div>
              )}
            </div>
          )}

          {/* Today's Break Activity Log */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50/50">
              <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-600" />
                <span>Today's Logged Breaks</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Break records are linked to your workstation session and reviewed for compliance.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100/70 text-neutral-600 font-bold uppercase tracking-wider text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Break Category</th>
                    <th className="py-3 px-4">Start Time</th>
                    <th className="py-3 px-4">End Time</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Allowance</th>
                    <th className="py-3 px-4 text-right">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {breakRecords.map((brk) => (
                    <tr key={brk.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-neutral-900 flex items-center gap-2">
                        <Coffee className="w-3.5 h-3.5 text-amber-500" />
                        <span>{brk.categoryLabel}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-700">{brk.startTime}</td>
                      <td className="py-3 px-4 font-mono text-neutral-700">{brk.endTime || 'In Progress'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                        {brk.durationMinutes} mins
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-500">{brk.maxAllowedMinutes} mins</td>
                      <td className="py-3 px-4 text-right">
                        {brk.isOverstayed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Overstay (+{brk.durationMinutes - brk.maxAllowedMinutes}m)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Within Limit
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODULE 4: Attendance Anomaly Engine & Automated HR Reporting */}
      {activeSubTab === 'anomalies' && (
        <div className="space-y-6">
          {/* Anomaly Engine Explainer Banner */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 text-rose-950">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900">
                    Automated Shift & Attendance Anomaly Detection
                  </h3>
                  <p className="text-xs text-neutral-600 mt-0.5 max-w-2xl leading-relaxed">
                    The ClickCamp Anomaly Engine autonomously flags late logins past the 15-minute grace window, early logouts prior to 8.0 hours, and overstayed breaks. Anomalies can be directly dispatched to HR for administrative regularization or waiver.
                  </p>
                </div>
              </div>

              {/* Manual Anomaly Test Dispatch */}
              <button
                onClick={() =>
                  triggerAutomatedAnomaly(
                    'late_login',
                    'Late Shift Login Flagged (Automated Test)',
                    'Shift started at 09:30 AM IST. Clock-in logged at 10:04 AM (+19m beyond 15m grace window).',
                    'medium'
                  )
                }
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Simulate Anomaly Check</span>
              </button>
            </div>
          </div>

          {/* Anomaly Roster Table with One-Click HR Reporting */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Detected Shift Anomalies & HR Regularization Pipeline</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Click "Log & Report to HR" to automatically dispatch notifications and open an audit review ticket.
                </p>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                {anomalies.length} Records Registered
              </span>
            </div>

            <div className="divide-y divide-neutral-200">
              {anomalies.map((anom) => (
                <div key={anom.id} className="p-4 sm:p-5 hover:bg-neutral-50/60 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          anom.severity === 'critical'
                            ? 'bg-rose-600 text-white'
                            : anom.severity === 'high'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : anom.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {anom.severity} Severity
                      </span>
                      <span className="text-xs font-mono text-neutral-500">{anom.date}</span>
                      <span className="text-xs font-semibold text-neutral-400">•</span>
                      <span className="text-xs text-neutral-600 font-medium">{anom.detectedAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {anom.hrStatus === 'regularized' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved & Regularized</span>
                        </span>
                      ) : anom.hrStatus === 'deduction_applied' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Deduction Applied</span>
                        </span>
                      ) : anom.reportedToHR ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Hourglass className="w-3.5 h-3.5" />
                          <span>HR Review Pending</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-200 text-neutral-800 border border-neutral-300 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Unreported to HR</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">{anom.title}</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      {anom.description}
                    </p>
                  </div>

                  {anom.employeeExplanation && (
                    <div className="bg-neutral-100/80 p-3 rounded-xl text-xs text-neutral-700 border border-neutral-200/80 space-y-1">
                      <span className="font-bold text-neutral-900">Employee Explanation on Record:</span>
                      <p className="text-neutral-600 italic">"{anom.employeeExplanation}"</p>
                    </div>
                  )}

                  {anom.hrNotes && (
                    <div className="bg-emerald-50 p-3 rounded-xl text-xs text-emerald-800 border border-emerald-200 space-y-1">
                      <span className="font-bold text-emerald-900">HR Resolution Notes:</span>
                      <p className="text-emerald-700">{anom.hrNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons for Employee and HR */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100">
                    <div className="text-[11px] text-neutral-500 font-mono">
                      Staff ID: {anom.userId} • Dept: {anom.department}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!anom.reportedToHR && (
                        <button
                          onClick={() => handleReportAnomalyToHR(anom.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Auto-Log & Report to HR</span>
                        </button>
                      )}

                      {!anom.employeeExplanation && anom.hrStatus !== 'regularized' && (
                        <button
                          onClick={() => {
                            const exp = prompt('Enter your formal explanation for HR review:');
                            if (exp) handleSaveAnomalyExplanation(anom.id, exp);
                          }}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Submit Formal Explanation</span>
                        </button>
                      )}

                      {/* HR / Super Admin Review Controls */}
                      {isHROrAdmin && anom.hrStatus !== 'regularized' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleResolveAnomaly(
                                anom.id,
                                'regularized',
                                'Approved by People Operations as a one-time emergency waiver.'
                              )
                            }
                            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-300 transition cursor-pointer"
                          >
                            Waive & Approve (HR)
                          </button>
                          <button
                            onClick={() =>
                              handleResolveAnomaly(
                                anom.id,
                                'deduction_applied',
                                'Policy non-compliance confirmed. 0.5 Day leave balance deducted.'
                              )
                            }
                            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-lg border border-rose-300 transition cursor-pointer"
                          >
                            Apply Deduction (HR)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: Clock Out Confirmation Modal */}
      {isPunchOutConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-neutral-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Hourglass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">End Workstation Shift?</h3>
                <p className="text-xs text-neutral-500">
                  Confirm clock-out and save today's shift presence record.
                </p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-neutral-600">
                <span>Total Elapsed Time:</span>
                <span className="font-bold text-neutral-900">{formatSeconds(elapsedSeconds)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Total Breaks:</span>
                <span className="font-bold text-neutral-900">{totalBreakMinutesUsed} mins</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Net Work Duration:</span>
                <span className="font-bold text-emerald-600">
                  {formatSeconds(Math.max(0, elapsedSeconds - totalBreakMinutesUsed * 60))}
                </span>
              </div>
            </div>

            {elapsedSeconds / 3600 < 8.0 && (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs border border-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Warning: You have worked under 8.0 hours. Clocking out now will register an Early Exit anomaly for HR review.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPunchOutConfirmOpen(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClockOut}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
              >
                Confirm Clock Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: Submit Attendance Regularization Form */}
      {isRegularizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-neutral-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">Attendance Regularization Request</h3>
                  <p className="text-xs text-neutral-500">Formal appeal dispatched directly to HR People Operations.</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegularizeModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegularizationSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Date to Regularize
                  </label>
                  <input
                    type="date"
                    value={regDate}
                    onChange={(e) => setRegDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Justification Category
                  </label>
                  <select
                    value={regReason}
                    onChange={(e) => setRegReason(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-emerald-500 bg-white"
                  >
                    <option value="Forgot to Punch">Forgot to Punch</option>
                    <option value="Biometric/System Glitch">Biometric / System Glitch</option>
                    <option value="Official Field Visit">Official Field / Client Visit</option>
                    <option value="Network Issue">Campus Network Issue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Requested In Time
                  </label>
                  <input
                    type="text"
                    value={regInTime}
                    onChange={(e) => setRegInTime(e.target.value)}
                    placeholder="e.g. 09:30 AM"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Requested Out Time
                  </label>
                  <input
                    type="text"
                    value={regOutTime}
                    onChange={(e) => setRegOutTime(e.target.value)}
                    placeholder="e.g. 06:30 PM"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Detailed Explanation & Justification
                </label>
                <textarea
                  value={regExplanation}
                  onChange={(e) => setRegExplanation(e.target.value)}
                  placeholder="Detail the operational reason (e.g. Biometric reader offline, verified with Team Leader)..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegularizeModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to HR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL: Shift Swap / Request Form */}
      {isShiftRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-neutral-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">Shift Swap / Change Request</h3>
                  <p className="text-xs text-neutral-500">Request allocation to an alternate corporate shift.</p>
                </div>
              </div>
              <button
                onClick={() => setIsShiftRequestModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleShiftRequestSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Target Shift Schedule
                </label>
                <select
                  value={requestedShiftId}
                  onChange={(e) => setRequestedShiftId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-emerald-500 bg-white"
                >
                  {CORPORATE_SHIFTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime} – {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Operational Reason for Shift Swap
                </label>
                <textarea
                  value={shiftRequestReason}
                  onChange={(e) => setShiftRequestReason(e.target.value)}
                  placeholder="Detail reason for requesting alternate schedule (e.g. Cross-timezone client verification coverage)..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShiftRequestModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request to HR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
