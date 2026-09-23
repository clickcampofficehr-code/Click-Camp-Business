import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  UserPlus,
  CalendarCheck,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  DollarSign,
  Radio,
  Send,
  UserX,
  FileText,
  Building2,
  Users,
  Check,
  Eye,
  FolderCheck
} from 'lucide-react';
import { PendingOnboarding, SalarySlip } from '../../types';
import { DocumentDossierModal } from '../common/DocumentDossierModal';

export const HRWorkspace: React.FC = () => {
  const {
    currentUser,
    pendingOnboarding,
    approveOnboarding,
    leaves,
    reviewLeave,
    resignations,
    toggleClearanceItem,
    updateResignationStatus,
    salarySlips,
    generateSalarySlip,
    markSalaryPaid,
    dailyTasks,
    broadcastTask
  } = useWorkspace();

  // Active sub-tab inside HR portal
  const [hrSubTab, setHrSubTab] = useState<
    'onboarding' | 'leaves' | 'payroll' | 'offboarding' | 'attendance_export' | 'task_allocator'
  >('onboarding');

  // Candidate Document Dossier Review Modal
  const [selectedDossierCandidate, setSelectedDossierCandidate] = useState<PendingOnboarding | null>(null);

  // Attendance Export date states
  const [exportStartDate, setExportStartDate] = useState('2026-09-01');
  const [exportEndDate, setExportEndDate] = useState('2026-09-14');
  const [exportDepartment, setExportDepartment] = useState('All Departments');

  // Payroll slip generator modal/form
  const [isGenerateSalaryOpen, setIsGenerateSalaryOpen] = useState(false);
  const [empName, setEmpName] = useState('Rahul Verma');
  const [empDesignation, setEmpDesignation] = useState('Client Operations Specialist');
  const [salaryMonth, setSalaryMonth] = useState('September 2026');
  const [basePay, setBasePay] = useState('65000');
  const [commission, setCommission] = useState('22000');

  // Task broadcast state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDept, setTaskDept] = useState('Client Acquisition & Growth');
  const [taskTarget, setTaskTarget] = useState('30');
  const [taskDeadline, setTaskDeadline] = useState('Today, 06:00 PM IST');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('high');

  // Handle download attendance report
  const handleDownloadAttendanceCSV = () => {
    const csvHeader = 'Employee ID,Name,Department,Date,In Time,Out Time,Hours Logged,Status\n';
    const sampleRows = [
      'usr-emp,Rahul Verma,Client Acquisition & Growth,2026-09-14,09:32 AM,Active,4h 15m,Present',
      'usr-emp,Rahul Verma,Client Acquisition & Growth,2026-09-13,09:30 AM,06:35 PM,9h 05m,Present',
      'usr-dev-02,Sneha Kapoor,Client Acquisition & Growth,2026-09-14,09:20 AM,Active,4h 27m,Present',
      'usr-dev-03,Amit Saxena,Client Acquisition & Growth,2026-09-14,10:15 AM,Active,3h 32m,Present',
      'usr-dev-04,Pooja Nair,Client Acquisition & Growth,2026-09-14,-,-,-,Casual Leave'
    ].join('\n');

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClickCamp_Attendance_${exportStartDate}_to_${exportEndDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              People Operations & HR Management
            </span>
            <span className="text-xs text-neutral-400">Head of People: {currentUser.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5 flex items-center gap-2">
            <span>Human Resources Administration</span>
            <Building2 className="w-5 h-5 text-purple-400" />
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            Manage onboarding approvals, leave applications, attendance reporting, offboarding clearances, and payroll slips.
          </p>
        </div>

        {/* Sub-tab navigation selector */}
        <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-xl border border-neutral-700 overflow-x-auto max-w-full">
          {[
            { id: 'onboarding', label: 'Onboarding' },
            { id: 'leaves', label: 'Leaves' },
            { id: 'payroll', label: 'Payroll' },
            { id: 'offboarding', label: 'Offboarding' },
            { id: 'attendance_export', label: 'Attendance Export' },
            { id: 'task_allocator', label: 'Task Broadcast' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setHrSubTab(tab.id as typeof hrSubTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                hrSubTab === tab.id ? 'bg-purple-600 text-white shadow-xs' : 'text-neutral-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-VIEW 1: EMPLOYEE ONBOARDING APPROVALS */}
      {hrSubTab === 'onboarding' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-600" />
                <span>Employee Onboarding Approvals</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Review pending employee registrations, allocate department, and bind designated Team Leaders.
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {pendingOnboarding.filter((o) => o.status === 'pending_approval').length} Pending Approval
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Candidate Name</th>
                  <th className="py-2.5 px-3">Personal Email</th>
                  <th className="py-2.5 px-3">Proposed Role</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Designated TL</th>
                  <th className="py-2.5 px-3">Joining Date</th>
                  <th className="py-2.5 px-3">KYC & Statutory</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {pendingOnboarding.map((cand) => (
                  <tr key={cand.id} className="hover:bg-neutral-50/70 transition">
                    <td className="py-2.5 px-3 font-bold text-neutral-900">{cand.fullName}</td>
                    <td className="py-2.5 px-3 text-neutral-600">{cand.personalEmail}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded font-medium text-[11px]">
                        {cand.proposedRole.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-neutral-900">{cand.department}</td>
                    <td className="py-2.5 px-3 text-neutral-600">Vikram Malhotra (TL Alpha)</td>
                    <td className="py-2.5 px-3 text-neutral-500">{cand.dateOfJoining}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                            cand.documentStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          KYC: {cand.documentStatus}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {cand.statutoryForms?.dpdpConsentAccepted ? '✓ DPDP & Forms Filed' : 'Forms Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {cand.status === 'approved' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Provisioned
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium text-[11px]">Awaiting HR Signoff</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDossierCandidate(cand)}
                          className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Inspect uploaded documents (PAN, Credit Score, Proof of Address, Photo, Experience Docs)"
                        >
                          <Eye className="w-3 h-3 text-purple-600" />
                          <span>View Docs</span>
                        </button>
                        {cand.status === 'pending_approval' && (
                          <button
                            type="button"
                            onClick={() => approveOnboarding(cand.id)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: LEAVE ADMINISTRATION */}
      {hrSubTab === 'leaves' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-purple-600" />
                <span>Employee Leave Applications</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Review and sanction employee absence requests with audit remarks.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {leaves.map((lv) => (
              <div
                key={lv.id}
                className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 text-sm">{lv.userName}</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-semibold rounded border border-purple-200 text-[11px]">
                      {lv.leaveType}
                    </span>
                    <span className="text-neutral-500 text-[11px]">({lv.department})</span>
                  </div>
                  <p className="text-neutral-700 mt-1">
                    Duration: <strong>{lv.startDate}</strong> to <strong>{lv.endDate}</strong> ({lv.totalDays} days)
                  </p>
                  <p className="text-neutral-500 mt-0.5 italic">Reason: "{lv.reason}"</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {lv.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => reviewLeave(lv.id, 'rejected', 'High campaign load during target cutoff')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => reviewLeave(lv.id, 'approved', 'Leave sanctioned by People Ops')}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs"
                      >
                        Approve Leave
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        lv.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {lv.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: PAYROLL PROCESSING */}
      {hrSubTab === 'payroll' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Monthly Payroll Engine & Salary Slips</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Calculates Base Pay + Performance Commissions - PF (12%) - TDS (10%) = Net Payout.
              </p>
            </div>

            <button
              onClick={() => setIsGenerateSalaryOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <DollarSign className="w-4 h-4" />
              <span>Generate Salary Slip</span>
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Slip ID</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Base Pay</th>
                  <th className="py-2.5 px-3">Commission</th>
                  <th className="py-2.5 px-3">PF Deduct</th>
                  <th className="py-2.5 px-3">TDS Deduct</th>
                  <th className="py-2.5 px-3">Net Payout</th>
                  <th className="py-2.5 px-3">Payment Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {salarySlips.map((slp) => (
                  <tr key={slp.id} className="hover:bg-neutral-50/70 transition">
                    <td className="py-2.5 px-3 font-mono font-semibold text-neutral-900">{slp.id}</td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">{slp.employeeName}</td>
                    <td className="py-2.5 px-3 text-neutral-600">{slp.monthYear}</td>
                    <td className="py-2.5 px-3">₹{slp.baseSalary.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-semibold">+₹{slp.performanceCommission.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-rose-600">-₹{slp.pfDeduction.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-rose-600">-₹{slp.tdsDeduction.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900 text-sm">
                      ₹{slp.netPayout.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3">
                      {slp.status === 'paid' ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Disbursed ({slp.paidDate})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-[11px]">
                          Draft (Pending Disbursal)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {slp.status === 'draft' && (
                        <button
                          onClick={() => markSalaryPaid(slp.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                        >
                          Disburse
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: OFFBOARDING & ASSET HANDOVER */}
      {hrSubTab === 'offboarding' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <UserX className="w-4 h-4 text-rose-600" />
                <span>Offboarding & Clearance Checklists</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage employee resignations, hardware returns, knowledge transfers, and final exit signoffs.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {resignations.map((res) => (
              <div key={res.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-neutral-900 text-sm">{res.userName}</span>
                    <span className="text-neutral-500 ml-2">({res.designation} • {res.department})</span>
                    <p className="text-neutral-600 text-[11px] mt-0.5">
                      Last Working Day: <strong className="text-neutral-900">{res.lastWorkingDay}</strong> | Reason: "{res.reason}"
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase self-start sm:self-auto ${
                      res.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {res.status.replace('_', ' ')}
                  </span>
                </div>

                {/* 4 Clearance Checkboxes */}
                <div className="pt-2 border-t border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'assetsReturned' as const, label: '1. Hardware / Laptop' },
                    { key: 'documentationCompleted' as const, label: '2. SOP Documentation' },
                    { key: 'knowledgeTransferDone' as const, label: '3. Knowledge Transfer' },
                    { key: 'financeCleared' as const, label: '4. Finance Clearance' }
                  ].map((chk) => (
                    <button
                      key={chk.key}
                      onClick={() => toggleClearanceItem(res.id, chk.key)}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                        res.clearance[chk.key]
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <span className="font-semibold text-[11px]">{chk.label}</span>
                      <span>{res.clearance[chk.key] ? '✓' : '○'}</span>
                    </button>
                  ))}
                </div>

                {/* Final Signoff */}
                {res.status !== 'completed' && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => updateResignationStatus(res.id, 'completed')}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Issue Relieving Letter & Complete Exit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: ATTENDANCE EXPORT */}
      {hrSubTab === 'attendance_export' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs max-w-xl">
          <div className="pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Comprehensive Attendance Report Generator</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select date interval and department to compile complete biometric and portal punch logs to CSV.
            </p>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Target Department</label>
              <select
                value={exportDepartment}
                onChange={(e) => setExportDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
              >
                <option value="All Departments">All Departments (Company-wide)</option>
                <option value="Client Acquisition & Growth">Client Acquisition & Growth</option>
                <option value="Account Operations & Risk">Account Operations & Risk</option>
                <option value="Engineering & Product">Engineering & Product</option>
              </select>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-800">Export Parameters Summary:</p>
              <p>• Interval: {exportStartDate} to {exportEndDate} (14 Days)</p>
              <p>• Format: RFC 4180 Standard CSV (Microsoft Excel / Google Sheets compatible)</p>
              <p>• Included fields: Employee ID, Name, In/Out Timestamps, Shift Duration, Shift Status</p>
            </div>

            <button
              onClick={handleDownloadAttendanceCSV}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Full Attendance CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: DAILY TASK ALLOCATOR */}
      {hrSubTab === 'task_allocator' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-600" />
                <span>Daily Company Objective & Task Allocator</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Broadcast daily milestones across teams and track collective submission quotas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                broadcastTask({
                  title: taskTitle,
                  department: taskDept,
                  targetCount: Number(taskTarget) || 20,
                  priority: taskPriority,
                  deadline: taskDeadline
                });
                setTaskTitle('');
              }}
              className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-3"
            >
              <h4 className="font-bold text-neutral-900">Broadcast New Objective</h4>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Objective Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 End-of-Quarter Account Verification Sprint"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Target Department</label>
                  <select
                    value={taskDept}
                    onChange={(e) => setTaskDept(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="Client Acquisition & Growth">Client Acquisition & Growth</option>
                    <option value="Account Operations & Risk">Account Operations & Risk</option>
                    <option value="All Departments">All Departments</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Target Units</label>
                  <input
                    type="number"
                    value={taskTarget}
                    onChange={(e) => setTaskTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Deadline</label>
                  <input
                    type="text"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as typeof taskPriority)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast to Workforce</span>
              </button>
            </form>

            {/* Active Objectives List */}
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-xs">Live Broadcasted Objectives:</h4>
              {dailyTasks.map((t) => (
                <div key={t.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">{t.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.priority === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-[11px]">
                    Dept: {t.department} | Deadline: {t.deadline}
                  </p>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span>Progress: {t.completedCount} / {t.targetCount} Completed</span>
                      <span>{Math.round((t.completedCount / t.targetCount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (t.completedCount / t.targetCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GENERATE SALARY SLIP MODAL */}
      {isGenerateSalaryOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900">Generate Salary Slip</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Automated PF (12%) and TDS (10%) statutory deduction calculation.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const b = Number(basePay) || 60000;
                const c = Number(commission) || 0;
                const pf = Math.round(b * 0.12);
                const tds = Math.round((b + c) * 0.10);
                const net = b + c - pf - tds;

                generateSalarySlip({
                  employeeId: 'usr-emp',
                  employeeName: empName,
                  designation: empDesignation,
                  monthYear: salaryMonth,
                  baseSalary: b,
                  performanceCommission: c,
                  pfDeduction: pf,
                  tdsDeduction: tds,
                  netPayout: net
                });
                setIsGenerateSalaryOpen(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Employee Name</label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Month / Year</label>
                  <input
                    type="text"
                    required
                    value={salaryMonth}
                    onChange={(e) => setSalaryMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={empDesignation}
                    onChange={(e) => setEmpDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Base Salary (INR)</label>
                  <input
                    type="number"
                    required
                    value={basePay}
                    onChange={(e) => setBasePay(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Commission (INR)</label>
                  <input
                    type="number"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-600">
                Statutory deductions (PF 12% + TDS 10%) are automatically computed and withheld.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateSalaryOpen(false)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Generate Slip Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT DOSSIER INSPECTOR MODAL */}
      {selectedDossierCandidate && (
        <DocumentDossierModal
          candidate={selectedDossierCandidate}
          onClose={() => setSelectedDossierCandidate(null)}
          onVerifyStatus={(status) => {
            if (status === 'Verified') {
              approveOnboarding(selectedDossierCandidate.id);
            }
          }}
        />
      )}
    </div>
  );
};
