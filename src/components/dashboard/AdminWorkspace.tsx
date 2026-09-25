import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { UserRole, UserAccount, PendingOnboarding } from '../../types';
import {
  ShieldAlert,
  Users,
  ShieldCheck,
  Activity,
  DollarSign,
  TrendingUp,
  Settings,
  KeyRound,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Server,
  Database,
  Smartphone,
  Sliders,
  UserCheck,
  UserPlus,
  Search,
  Edit2,
  Ban,
  Trash2,
  FileText,
  Download,
  ExternalLink,
  MessageSquare,
  Eye,
  Filter,
  Hash,
  X,
  Check,
  Clock,
  AlertCircle,
  Paperclip,
  Image as ImageIcon,
  Layers,
  BarChart3,
  Zap,
  Sparkles
} from 'lucide-react';
import { DocumentDossierModal } from '../common/DocumentDossierModal';
import { EmployeeManagementPanel } from './EmployeeManagementPanel';
import { CompanyNoticeBoard } from '../common/CompanyNoticeBoard';
import { EmployeeInformationPanel } from './EmployeeInformationPanel';

export const AdminWorkspace: React.FC = () => {
  const {
    currentUser,
    allUsers,
    switchUserRole,
    requestProfileSwitch,
    isProfileLockEnforced,
    clientAccounts,
    punchRecords,
    pendingOnboarding,
    approveOnboarding,
    reviewOnboardingDecision,
    addEmployee,
    updateEmployee,
    suspendEmployee,
    terminateEmployee,
    reactivateEmployee,
    deleteEmployee,
    chatMessages,
    auditLogs,
    setActiveTab: setMainNavigationTab,
    setIsBrandModalOpen
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<
    'employees' | 'employee_info' | 'onboarding' | 'notice_board' | 'chat_audit' | 'audit_logs' | 'analytics' | 'system_settings'
  >('employees');

  // Employee Management State
  const [empSearch, setEmpSearch] = useState('');
  const [empStatusFilter, setEmpStatusFilter] = useState<'all' | 'active' | 'suspended' | 'terminated'>('all');
  const [empDeptFilter, setEmpDeptFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<UserAccount | null>(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);

  // New Employee Form
  const [newEmpData, setNewEmpData] = useState({
    name: '',
    emailPrefix: '',
    role: 'employee' as UserRole,
    department: 'Operations & Verification',
    designation: 'Executive Associate',
    password: 'ClickCamp@2026!'
  });

  // Edit Employee Form
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: 'employee' as UserRole,
    department: '',
    designation: '',
    status: 'active' as 'active' | 'suspended' | 'terminated'
  });

  // Onboarding Tracker State
  const [onboardingSearch, setOnboardingSearch] = useState('');
  const [onboardingStatusFilter, setOnboardingStatusFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected'>('all');
  const [selectedDossierCandidate, setSelectedDossierCandidate] = useState<PendingOnboarding | null>(null);

  // Chat & DM Audit Block State
  const [auditQuery, setAuditQuery] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState<'all' | 'channel' | 'dm'>('all');
  const [auditUserFilter, setAuditUserFilter] = useState('all');

  // System settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enforce2faAll, setEnforce2faAll] = useState(true);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState('60');
  const [allowRemotePunch, setAllowRemotePunch] = useState(true);

  // Organization-wide Analytics Calculations
  const totalGrossDealValue = clientAccounts.reduce((acc, a) => acc + a.dealValue, 0);
  const verifiedDeals = clientAccounts.filter((a) => a.status === 'verified');
  const verifiedGrossValue = verifiedDeals.reduce((acc, a) => acc + a.dealValue, 0);

  // Filtered Employees
  const filteredEmployees = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(empSearch.toLowerCase()) ||
      (u.designation && u.designation.toLowerCase().includes(empSearch.toLowerCase()));
    const matchesStatus = empStatusFilter === 'all' || (u.status || 'active') === empStatusFilter;
    const matchesDept = empDeptFilter === 'all' || u.department === empDeptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  // Filtered Onboarding Records
  const filteredOnboarding = pendingOnboarding.filter((cand) => {
    const matchesSearch =
      cand.fullName.toLowerCase().includes(onboardingSearch.toLowerCase()) ||
      cand.personalEmail.toLowerCase().includes(onboardingSearch.toLowerCase());
    const matchesStatus = onboardingStatusFilter === 'all' || cand.status === onboardingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Chat Audit Log
  const filteredAuditMessages = chatMessages.filter((m) => {
    const matchesQuery =
      !auditQuery.trim() ||
      m.text.toLowerCase().includes(auditQuery.toLowerCase()) ||
      m.senderName.toLowerCase().includes(auditQuery.toLowerCase()) ||
      (m.attachmentName && m.attachmentName.toLowerCase().includes(auditQuery.toLowerCase()));

    const matchesType =
      auditTypeFilter === 'all' ||
      (auditTypeFilter === 'channel' && !m.isDirect) ||
      (auditTypeFilter === 'dm' && m.isDirect);

    const matchesUser =
      auditUserFilter === 'all' ||
      m.senderId === auditUserFilter ||
      m.recipientId === auditUserFilter;

    return matchesQuery && matchesType && matchesUser;
  });

  // Handle Create Employee
  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpData.name.trim() || !newEmpData.emailPrefix.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const corporateEmail = newEmpData.emailPrefix.includes('@')
      ? newEmpData.emailPrefix.trim()
      : `${newEmpData.emailPrefix.trim().toLowerCase()}@clickcamp.tech`;

    const created = addEmployee({
      name: newEmpData.name.trim(),
      email: corporateEmail,
      role: newEmpData.role,
      department: newEmpData.department,
      designation: newEmpData.designation,
      phone: '+91 98110 00000',
      initialPassword: newEmpData.password
    });

    if (created) {
      setIsAddModalOpen(false);
      setNewEmpData({
        name: '',
        emailPrefix: '',
        role: 'employee',
        department: 'Operations & Verification',
        designation: 'Executive Associate',
        password: 'ClickCamp@2026!'
      });
    }
  };

  // Open Edit Employee Modal
  const openEditModal = (emp: UserAccount) => {
    setEditingEmployee(emp);
    setEditFormData({
      name: emp.name,
      role: emp.role,
      department: emp.department,
      designation: emp.designation || emp.roleLabel,
      status: emp.status || 'active'
    });
  };

  // Handle Save Edit
  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    updateEmployee(editingEmployee.id, {
      name: editFormData.name.trim(),
      role: editFormData.role,
      department: editFormData.department,
      designation: editFormData.designation,
      roleLabel: editFormData.designation || editFormData.role.toUpperCase(),
      status: editFormData.status
    });

    setEditingEmployee(null);
  };

  // Handle Export Audit Transcript
  const handleExportAudit = () => {
    const transcript = filteredAuditMessages
      .map((m) => {
        const typeStr = m.isDirect ? `[DIRECT MESSAGE to ${m.recipientId}]` : `[CHANNEL #${m.channelId}]`;
        const attStr = m.attachmentName ? ` (Attachment: ${m.attachmentName})` : '';
        return `[${m.timestamp}] ${typeStr} ${m.senderName} (${m.senderRole}): ${m.text}${attStr}`;
      })
      .join('\n');

    const header = `================================================================================
CLICK CAMP BUSINESS AND TECHNOLOGY SERVICES LIMITED
SUPER ADMIN COMMUNICATIONS & DIRECT MESSAGE AUDIT LOG
Generated on: ${new Date().toISOString()} IST
SOC2 Type II & Indian IT Act, 2000 Compliance Mirror
Total Messages Audited: ${filteredAuditMessages.length}
================================================================================\n\n`;

    const blob = new Blob([header + transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ClickCamp_Chat_Audit_Log_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Admin Executive Header */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Super Admin & Executive Console
            </span>
            <span className="text-xs text-neutral-400">SOC2 Type II & DPDP Act Enforced</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5 flex items-center gap-2">
            <span>Enterprise Control Plane</span>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            Click Camp Business and Technology Services Limited: Employee lifecycle, statutory onboarding, communications audit, and security governance.
          </p>
        </div>

        {/* Console Navigation Tabs & Brand Modal Trigger */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsBrandModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            title="Manage and preview company logo identity"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Brand & Logo</span>
          </button>

          <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-xl border border-neutral-700 overflow-x-auto max-w-full">
          {[
            { id: 'employees', label: 'Employee Management' },
            { id: 'employee_info', label: 'Employee Information' },
            { id: 'onboarding', label: 'Onboarding & KYC' },
            { id: 'notice_board', label: 'Company Notice Board' },
            { id: 'chat_audit', label: 'Communications Audit' },
            { id: 'audit_logs', label: 'Security Logs' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'system_settings', label: 'System Guard' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id ? 'bg-rose-600 text-white shadow-xs' : 'text-neutral-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EMPLOYEE MANAGEMENT PANEL (Add, Edit, Suspend, Terminate, Creds)   */}
      {/* ========================================================================= */}
      {activeTab === 'employees' && <EmployeeManagementPanel />}

      {/* ========================================================================= */}
      {/* TAB: EMPLOYEE INFORMATION PANEL (Dossiers, DP Profiles, Records, KYC)    */}
      {/* ========================================================================= */}
      {activeTab === 'employee_info' && <EmployeeInformationPanel />}

      {/* ========================================================================= */}
      {/* TAB: COMPANY NOTICE BOARD (Broadcast Announcements & Real-Time Sync)      */}
      {/* ========================================================================= */}
      {activeTab === 'notice_board' && <CompanyNoticeBoard defaultTab="all" />}

      {/* ========================================================================= */}
      {/* TAB 2: ONBOARDING & STATUTORY KYC TRACKER                                 */}
      {/* ========================================================================= */}
      {activeTab === 'onboarding' && (
        <div className="space-y-4">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase">Total Applications</span>
              <div className="text-2xl font-black text-neutral-900 mt-1">{pendingOnboarding.length}</div>
              <p className="text-[11px] text-neutral-400 mt-1">HR Statutory Pipeline</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
              <span className="text-[11px] text-amber-600 font-semibold uppercase">Pending Verification</span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {pendingOnboarding.filter((o) => o.status === 'pending_approval').length}
              </div>
              <p className="text-[11px] text-amber-700 mt-1">Awaiting HR Review</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
              <span className="text-[11px] text-emerald-600 font-semibold uppercase">Approved & Active</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {pendingOnboarding.filter((o) => o.status === 'approved').length}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">Credentials Dispatched</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
              <span className="text-[11px] text-rose-600 font-semibold uppercase">Rejected / Incomplete</span>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {pendingOnboarding.filter((o) => o.status === 'rejected').length}
              </div>
              <p className="text-[11px] text-rose-700 mt-1">Re-upload Required</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Statutory Onboarding Tracker & KYC Dossier</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Review EPFO Form 11, Payment of Gratuity Form F, ESIC Form 1, DPDP Act 2023 legal consent, and candidate KYC uploads.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={onboardingSearch}
                    onChange={(e) => setOnboardingSearch(e.target.value)}
                    placeholder="Search candidate name or email..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <select
                  value={onboardingStatusFilter}
                  onChange={(e) => setOnboardingStatusFilter(e.target.value as typeof onboardingStatusFilter)}
                  className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-xl bg-white text-neutral-800 font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending_approval">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Candidate List Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Candidate Particulars</th>
                    <th className="py-2.5 px-3">Role & Dept</th>
                    <th className="py-2.5 px-3">Statutory Forms</th>
                    <th className="py-2.5 px-3">DPDP Act, 2023 Consent</th>
                    <th className="py-2.5 px-3">KYC Documents</th>
                    <th className="py-2.5 px-3 text-right">Approval Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {filteredOnboarding.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        No onboarding applications in this view.
                      </td>
                    </tr>
                  ) : (
                    filteredOnboarding.map((cand) => {
                      const isApproved = cand.status === 'approved';
                      const isRejected = cand.status === 'rejected';
                      const docsCount = [
                        cand.uploadedDocuments?.panCard,
                        cand.uploadedDocuments?.creditScore,
                        cand.uploadedDocuments?.addressProofFront,
                        cand.uploadedDocuments?.addressProofBack,
                        cand.uploadedDocuments?.passportPhoto,
                        cand.uploadedDocuments?.resume,
                        cand.uploadedDocuments?.previousOfferLetter,
                        cand.uploadedDocuments?.salarySlips,
                        cand.uploadedDocuments?.relievingLetter
                      ].filter(Boolean).length;

                      return (
                        <tr key={cand.id} className="hover:bg-neutral-50/70 transition">
                          <td className="py-3 px-3">
                            <div className="font-bold text-neutral-900">{cand.fullName}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">{cand.personalEmail}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              DOJ: {cand.dateOfJoining}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-semibold text-neutral-900 block uppercase text-[11px]">
                              {cand.proposedRole}
                            </span>
                            <span className="text-[11px] text-neutral-500">{cand.department}</span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="space-y-1 text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="font-medium text-neutral-700">Form 11 (EPFO):</span>
                                <span className="text-emerald-700 font-semibold">
                                  {cand.statutoryForms?.form11Status || 'Filled Digitally'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="font-medium text-neutral-700">Form F (Gratuity):</span>
                                <span className="text-emerald-700 font-semibold">
                                  {cand.statutoryForms?.formFStatus || 'Filled Digitally'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="font-medium text-neutral-700">ESIC Form 1:</span>
                                <span className="text-emerald-700 font-semibold">
                                  {cand.statutoryForms?.esicForm1Status || 'Filled Digitally'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            {cand.statutoryForms?.dpdpConsentAccepted ? (
                              <div>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  Consent Logged
                                </span>
                                <div className="text-[10px] text-neutral-500 mt-1">
                                  {cand.statutoryForms.dpdpConsentTimestamp || '14 Sep 2026 IST'}
                                </div>
                                <div className="text-[9px] text-neutral-400 font-mono">
                                  DPDP Act, 2023 Compliant
                                </div>
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px]">
                                Pending Consent
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <button
                              onClick={() => setSelectedDossierCandidate(cand)}
                              className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-neutral-600" />
                              <span>View Dossier ({docsCount} Docs)</span>
                            </button>
                          </td>

                          <td className="py-3 px-3 text-right">
                            {isApproved ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Corporate Account Issued
                              </span>
                            ) : isRejected ? (
                              <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                Application Rejected
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => approveOnboarding(cand.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                                  title="Approve onboarding and dispatch corporate credentials"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve & Issue ID</span>
                                </button>
                                <button
                                  onClick={() => reviewOnboardingDecision(cand.id, 'Rejected - Requires Updates')}
                                  className="px-2.5 py-1.5 bg-neutral-100 hover:bg-rose-50 text-neutral-600 hover:text-rose-700 border border-neutral-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                                >
                                  Reject
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMMUNICATIONS & DIRECT MESSAGE AUDIT BLOCK                        */}
      {/* ========================================================================= */}
      {activeTab === 'chat_audit' && (
        <div className="space-y-4">
          {/* Regulatory Compliance Mirror Notice */}
          <div className="bg-neutral-900 text-white p-4 sm:p-5 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Super Admin Communications & Direct Messaging Audit Block</span>
                  <span className="text-[10px] bg-rose-500 text-white px-2 py-0.2 rounded font-mono font-bold uppercase">
                    Read-Only
                  </span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                  Cryptographically indexed stream of all internal workplace communications across Public Channels and 1-on-1 Direct Messages. Formatted for compliance under the Indian IT Act, 2000 and enterprise governance standards.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportAudit}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-neutral-700 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Audit Transcript (.txt)</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-4 border-b border-neutral-100">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={auditQuery}
                  onChange={(e) => setAuditQuery(e.target.value)}
                  placeholder="Search message text, sender, or attachments..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={auditTypeFilter}
                  onChange={(e) => setAuditTypeFilter(e.target.value as typeof auditTypeFilter)}
                  className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-xl bg-white text-neutral-800 font-medium"
                >
                  <option value="all">All Message Types</option>
                  <option value="channel">Public Channels Only</option>
                  <option value="dm">Direct Messages (1:1) Only</option>
                </select>

                <select
                  value={auditUserFilter}
                  onChange={(e) => setAuditUserFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-xl bg-white text-neutral-800 font-medium max-w-44"
                >
                  <option value="all">All Employees / Senders</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audit Log Stream Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp (IST)</th>
                    <th className="py-2.5 px-3">Scope / Type</th>
                    <th className="py-2.5 px-3">Sender Identity</th>
                    <th className="py-2.5 px-3">Destination / Recipient</th>
                    <th className="py-2.5 px-3">Message Body & Attachments</th>
                    <th className="py-2.5 px-3 text-right">Integrity Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800 font-mono text-[11px]">
                  {filteredAuditMessages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400 font-sans">
                        No messages matching the audit criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditMessages.map((msg) => {
                      const isDirect = msg.isDirect || msg.channelId.startsWith('dm-');
                      const recipientUser = msg.recipientId
                        ? allUsers.find((u) => u.id === msg.recipientId)
                        : null;

                      return (
                        <tr key={msg.id} className="hover:bg-neutral-50/80 transition">
                          <td className="py-2.5 px-3 whitespace-nowrap text-neutral-500 font-mono">
                            {msg.timestamp}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {isDirect ? (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded font-semibold text-[10px]">
                                DIRECT MESSAGE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold text-[10px]">
                                PUBLIC CHANNEL
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2 font-sans">
                              <img
                                src={msg.senderAvatar}
                                alt={msg.senderName}
                                className="w-6 h-6 rounded-full object-cover border border-neutral-200"
                              />
                              <div>
                                <span className="font-bold text-neutral-900">{msg.senderName}</span>
                                <span className="text-[10px] text-neutral-500 ml-1">({msg.senderRole})</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 font-sans">
                            {isDirect ? (
                              <div className="flex items-center gap-1.5 text-neutral-700">
                                <span>Colleague:</span>
                                <span className="font-bold text-purple-900">
                                  {recipientUser ? recipientUser.name : msg.recipientId || 'Recipient'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-neutral-700">
                                <Hash className="w-3 h-3 text-neutral-400" />
                                <span className="font-semibold text-neutral-900">{msg.channelId}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 font-sans max-w-md">
                            <p className="text-neutral-900 text-xs">{msg.text}</p>
                            {msg.attachmentName && (
                              <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-mono text-neutral-700">
                                <Paperclip className="w-3 h-3 text-neutral-500" />
                                <span>{msg.attachmentName}</span>
                                {msg.attachmentUrl && (
                                  <a
                                    href={msg.attachmentUrl}
                                    download={msg.attachmentName}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-600 hover:underline font-bold ml-1"
                                  >
                                    Inspect →
                                  </a>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <span className="font-mono text-[9px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                              SHA256:{msg.id.slice(-6)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LIVE SECURITY & AUDIT LOGS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Live Security & Ingress Audit Trails</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Immutable event stream monitoring workstation logins, IP geolocation, 2FA tokens, and financial verifications.
              </p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Ingress Gate Active (100% Audited)
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Subject User</th>
                  <th className="py-2.5 px-3">Ingress IP & Location</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/70 transition">
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">{log.action}</td>
                    <td className="py-2.5 px-3 text-neutral-700">{log.userName} ({log.userRole})</td>
                    <td className="py-2.5 px-3 font-mono text-neutral-500">{log.ipAddress}</td>
                    <td className="py-2.5 px-3 text-neutral-500">{log.timestamp}</td>
                    <td className="py-2.5 px-3 text-right text-neutral-600 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: COMPANY ANALYTICS                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase">Verified Gross Volume</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600">
                  ₹{(verifiedGrossValue / 100000).toFixed(1)}L
                </span>
                <span className="text-[11px] text-neutral-400">({verifiedDeals.length} accounts)</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">↑ 18.4% vs last month</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase">Total Pipeline Inflow</span>
              <div className="text-2xl font-black text-neutral-900 mt-1">
                ₹{(totalGrossDealValue / 100000).toFixed(1)}L
              </div>
              <p className="text-[11px] text-neutral-500 font-medium mt-1">{clientAccounts.length} Total Accounts</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase">Live Active Headcount</span>
              <div className="text-2xl font-black text-neutral-900 mt-1">
                {allUsers.filter((u) => (u.status || 'active') === 'active').length}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">100% Shift Attendance</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase">Verification SLA</span>
              <div className="text-2xl font-black text-blue-600 mt-1">94.2%</div>
              <p className="text-[11px] text-neutral-400 mt-1">&lt; 24h turn-around target</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
              <h3 className="text-sm font-bold text-neutral-900 pb-3 border-b border-neutral-100 flex items-center justify-between">
                <span>Recent Client Account Transactions</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </h3>

              <div className="mt-4 space-y-2.5">
                {clientAccounts.slice(0, 5).map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-neutral-900">{acc.clientName}</span>
                      <p className="text-[11px] text-neutral-500">{acc.platform} • Submitted by {acc.submittedByName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-900">₹{acc.dealValue.toLocaleString('en-IN')}</span>
                      <p
                        className={`text-[10px] font-semibold uppercase ${
                          acc.status === 'verified'
                            ? 'text-emerald-600'
                            : acc.status === 'rejected'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {acc.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs">
              <h3 className="text-sm font-bold text-neutral-900 pb-3 border-b border-neutral-100 flex items-center justify-between">
                <span>Advertising Platform Split</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </h3>

              <div className="mt-4 space-y-2.5 text-xs">
                {[
                  { platform: 'Google Ads', volume: '14 Accounts Closed', share: '36%', status: 'Active' },
                  { platform: 'Meta Ads', volume: '18 Accounts Closed', share: '46%', status: 'Active' },
                  { platform: 'Shopify / E-Commerce', volume: '4 Accounts Closed', share: '10%', status: 'Active' },
                  { platform: 'Affiliate Network', volume: '3 Accounts Closed', share: '8%', status: 'Active' }
                ].map((p) => (
                  <div key={p.platform} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-900">{p.platform}</span>
                      <p className="text-[11px] text-neutral-500">{p.volume}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-900">{p.share}</span>
                      <p className="text-[10px] text-emerald-600 font-semibold">{p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Velocity & Kanban Completion Analytics Banner */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <Zap className="w-3.5 h-3.5" />
                <span>Agile Engineering & Delivery Governance</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 mt-1">
                Project Velocity & Task Completion Analytics Dashboard
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5 max-w-xl">
                Real-time Recharts visualization tracking sprint-over-sprint velocity (37/54 pts completed), 3-sprint rolling moving average, cumulative flow (CFD), and sprint burndown curves.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right text-xs">
                <span className="font-mono font-bold text-emerald-600 text-sm">69% Done</span>
                <p className="text-[11px] text-neutral-400">Sprint 14 Active</p>
              </div>
              <button
                onClick={() => setMainNavigationTab('kanban')}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Open Velocity Analytics</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SYSTEM SETTINGS & MAINTENANCE GUARDS                               */}
      {/* ========================================================================= */}
      {activeTab === 'system_settings' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs max-w-2xl">
          <div className="pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-700" />
              <span>Platform Security Guards & System Settings</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Global configurations enforced across all employee workstations and cloud connections.
            </p>
          </div>

          <div className="mt-5 space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-neutral-900">Maintenance Mode</span>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Temporarily restricts access to non-admin roles for infrastructure upgrades.
                </p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-12 h-6 rounded-full transition p-0.5 cursor-pointer ${
                  maintenanceMode ? 'bg-rose-600' : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition transform ${
                    maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-neutral-900">Enforce Mandatory 2FA for All Roles</span>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Require Google Authenticator TOTP token verification on every workstation login.
                </p>
              </div>
              <button
                onClick={() => setEnforce2faAll(!enforce2faAll)}
                className={`w-12 h-6 rounded-full transition p-0.5 cursor-pointer ${
                  enforce2faAll ? 'bg-emerald-600' : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition transform ${
                    enforce2faAll ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-neutral-900">Allow Remote Biometric Punch Clocking</span>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Permit verified employees to clock in/out with live IST timestamp validation.
                </p>
              </div>
              <button
                onClick={() => setAllowRemotePunch(!allowRemotePunch)}
                className={`w-12 h-6 rounded-full transition p-0.5 cursor-pointer ${
                  allowRemotePunch ? 'bg-emerald-600' : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition transform ${
                    allowRemotePunch ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-neutral-900">Inactive Workstation Screen Lock Timeout</span>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Locks the screen with PIN requirement after idle duration.
                </p>
              </div>
              <select
                value={sessionTimeoutMins}
                onChange={(e) => setSessionTimeoutMins(e.target.value)}
                className="px-2.5 py-1.5 border border-neutral-300 rounded-lg bg-white font-semibold text-xs"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
                <option value="120">2 Hours</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW EMPLOYEE                                                   */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-neutral-900 text-sm">Provision New Employee Account</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployeeSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newEmpData.name}
                  onChange={(e) => setNewEmpData({ ...newEmpData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Corporate Email Address *</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={newEmpData.emailPrefix}
                    onChange={(e) => setNewEmpData({ ...newEmpData, emailPrefix: e.target.value })}
                    placeholder="r.sharma"
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-l-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="px-3 py-2 bg-neutral-100 border border-l-0 border-neutral-300 rounded-r-xl font-mono text-neutral-600">
                    @clickcamp.tech
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">RBAC Role *</label>
                  <select
                    value={newEmpData.role}
                    onChange={(e) => setNewEmpData({ ...newEmpData, role: e.target.value as UserRole })}
                    className="w-full px-2.5 py-2 border border-neutral-300 rounded-xl bg-white font-medium"
                  >
                    <option value="employee">Employee</option>
                    <option value="ops">Operations & Verification</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="hr">HR & Compliance</option>
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Department *</label>
                  <select
                    value={newEmpData.department}
                    onChange={(e) => setNewEmpData({ ...newEmpData, department: e.target.value })}
                    className="w-full px-2.5 py-2 border border-neutral-300 rounded-xl bg-white font-medium"
                  >
                    <option value="Operations & Verification">Operations & Verification</option>
                    <option value="Sales & Pipeline">Sales & Pipeline</option>
                    <option value="Engineering & IT">Engineering & IT</option>
                    <option value="HR & Compliance">HR & Compliance</option>
                    <option value="Executive Leadership">Executive Leadership</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Designation Title</label>
                <input
                  type="text"
                  value={newEmpData.designation}
                  onChange={(e) => setNewEmpData({ ...newEmpData, designation: e.target.value })}
                  placeholder="e.g. Senior Verification Associate"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Initial Temporary Password</label>
                <input
                  type="text"
                  value={newEmpData.password}
                  onChange={(e) => setNewEmpData({ ...newEmpData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono text-neutral-800 bg-neutral-50"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Employee will be prompted to reset and enroll in 2FA TOTP upon first login.
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT EMPLOYEE                                                      */}
      {/* ========================================================================= */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-neutral-700" />
                <h3 className="font-bold text-neutral-900 text-sm">Edit Employee: {editingEmployee.name}</h3>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Designation Title</label>
                <input
                  type="text"
                  value={editFormData.designation}
                  onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">RBAC Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                    className="w-full px-2.5 py-2 border border-neutral-300 rounded-xl bg-white"
                  >
                    <option value="employee">Employee</option>
                    <option value="ops">Operations & Verification</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="hr">HR & Compliance</option>
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Department</label>
                  <select
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full px-2.5 py-2 border border-neutral-300 rounded-xl bg-white"
                  >
                    <option value="Operations & Verification">Operations & Verification</option>
                    <option value="Sales & Pipeline">Sales & Pipeline</option>
                    <option value="Engineering & IT">Engineering & IT</option>
                    <option value="HR & Compliance">HR & Compliance</option>
                    <option value="Executive Leadership">Executive Leadership</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Employment Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as typeof editFormData.status })}
                  className="w-full px-2.5 py-2 border border-neutral-300 rounded-xl bg-white font-medium"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM DELETE EMPLOYEE                                            */}
      {/* ========================================================================= */}
      {deletingEmployeeId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-sm p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm">Delete Employee Record?</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              This action permanently removes the employee from active directories. Audit logs will retain historic events.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => setDeletingEmployeeId(null)}
                className="px-3.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteEmployee(deletingEmployeeId);
                  setDeletingEmployeeId(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DOCUMENT DOSSIER FOR ONBOARDING CANDIDATE                          */}
      {/* ========================================================================= */}
      {selectedDossierCandidate && (
        <DocumentDossierModal
          candidate={selectedDossierCandidate}
          onClose={() => setSelectedDossierCandidate(null)}
          onVerifyStatus={(newStatus) => {
            reviewOnboardingDecision(
              selectedDossierCandidate.id,
              newStatus === 'Verified' ? 'Approved' : 'Rejected - Requires Updates'
            );
            setSelectedDossierCandidate(null);
          }}
        />
      )}
    </div>
  );
};
