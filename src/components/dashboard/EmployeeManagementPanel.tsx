import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { UserRole, UserAccount } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Ban,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  Briefcase,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  UserX,
  UserCheck
} from 'lucide-react';

export const EmployeeManagementPanel: React.FC = () => {
  const {
    currentUser,
    allUsers,
    addEmployee,
    updateEmployee,
    suspendEmployee,
    terminateEmployee,
    reactivateEmployee,
    deleteEmployee,
    resetEmployeeCredentials,
    requestProfileSwitch,
    isProfileLockEnforced
  } = useWorkspace();

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'terminated'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<UserAccount | null>(null);
  const [credentialsModalEmp, setCredentialsModalEmp] = useState<UserAccount | null>(null);
  const [suspensionModalEmp, setSuspensionModalEmp] = useState<UserAccount | null>(null);
  const [terminationModalEmp, setTerminationModalEmp] = useState<UserAccount | null>(null);
  const [deletingEmpId, setDeletingEmpId] = useState<string | null>(null);

  // Newly generated credentials modal state
  const [generatedCreds, setGeneratedCreds] = useState<{
    name: string;
    email: string;
    password: string;
    totpSecret?: string;
    backupCodes?: string[];
  } | null>(null);

  // Copy indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Add Employee Form State
  const [newEmp, setNewEmp] = useState({
    name: '',
    emailPrefix: '',
    role: 'employee' as UserRole,
    department: 'Operations & Verification',
    designation: 'Operations Specialist',
    phone: '+91 98110 00000',
    initialPassword: 'ClickCamp@2026!',
    autoGeneratePassword: true
  });

  // Edit Employee Form State
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'employee' as UserRole,
    department: '',
    designation: '',
    phone: '',
    status: 'active' as 'active' | 'suspended' | 'terminated'
  });

  // Suspension Form State
  const [suspendReason, setSuspendReason] = useState('Administrative Security Review');

  // Termination Form State
  const [terminateData, setTerminateData] = useState({
    reason: 'Voluntary Resignation / Mutual Administrative Separation',
    lastWorkingDay: new Date().toISOString().split('T')[0]
  });

  // Regenerate Password form state
  const [customNewPassword, setCustomNewPassword] = useState('');
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  // Filtered List
  const filteredUsers = allUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.designation && u.designation.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;
    const matchesDept = departmentFilter === 'all' || u.department === departmentFilter;

    return matchesQuery && matchesRole && matchesStatus && matchesDept;
  });

  // Summary Metrics
  const totalCount = allUsers.length;
  const activeCount = allUsers.filter((u) => (u.status || 'active') === 'active').length;
  const suspendedCount = allUsers.filter((u) => u.status === 'suspended').length;
  const terminatedCount = allUsers.filter((u) => u.status === 'terminated').length;

  // Generator Helpers
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = 'ClickCamp@';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res + '!';
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Submit Add Employee
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name.trim() || !newEmp.emailPrefix.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const email = newEmp.emailPrefix.includes('@')
      ? newEmp.emailPrefix.trim().toLowerCase()
      : `${newEmp.emailPrefix.trim().toLowerCase()}@clickcamp.tech`;

    const finalPassword = newEmp.autoGeneratePassword
      ? generateStrongPassword()
      : newEmp.initialPassword || generateStrongPassword();

    const created = addEmployee({
      name: newEmp.name.trim(),
      email,
      role: newEmp.role,
      department: newEmp.department,
      designation: newEmp.designation.trim() || 'Operations Specialist',
      phone: newEmp.phone.trim() || '+91 98110 00000',
      initialPassword: finalPassword
    });

    setIsAddModalOpen(false);
    // Show newly generated credentials modal
    setGeneratedCreds({
      name: created.name,
      email: created.email,
      password: finalPassword,
      totpSecret: created.totpSecret,
      backupCodes: created.backupCodes
    });

    // Reset Form
    setNewEmp({
      name: '',
      emailPrefix: '',
      role: 'employee',
      department: 'Operations & Verification',
      designation: 'Operations Specialist',
      phone: '+91 98110 00000',
      initialPassword: 'ClickCamp@2026!',
      autoGeneratePassword: true
    });
  };

  // Open Edit Modal
  const openEditModal = (emp: UserAccount) => {
    setEditingEmployee(emp);
    setEditForm({
      name: emp.name,
      role: emp.role,
      department: emp.department,
      designation: emp.designation || emp.roleLabel,
      phone: emp.phone || '',
      status: emp.status || 'active'
    });
  };

  // Save Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    updateEmployee(editingEmployee.id, {
      name: editForm.name.trim(),
      role: editForm.role,
      department: editForm.department,
      designation: editForm.designation.trim(),
      phone: editForm.phone.trim(),
      status: editForm.status
    });

    setEditingEmployee(null);
  };

  // Confirm Suspend
  const handleSuspendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspensionModalEmp) return;
    suspendEmployee(suspensionModalEmp.id, suspendReason);
    setSuspensionModalEmp(null);
    setSuspendReason('Administrative Security Review');
  };

  // Confirm Terminate
  const handleTerminateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminationModalEmp) return;
    terminateEmployee(terminationModalEmp.id, terminateData.reason, terminateData.lastWorkingDay);
    setTerminationModalEmp(null);
  };

  // Regenerate Credentials
  const handleRegenerateCredentials = (emp: UserAccount) => {
    const password = resetEmployeeCredentials(emp.id, customNewPassword || undefined);
    setCustomNewPassword('');
    setCredentialsModalEmp(null);
    setGeneratedCreds({
      name: emp.name,
      email: emp.email,
      password,
      totpSecret: emp.totpSecret,
      backupCodes: emp.backupCodes
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider block">
              Total Accounts
            </span>
            <div className="text-2xl font-black text-neutral-900 mt-1">{totalCount}</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">All directory profiles</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider block">
              Active Authorized
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</div>
            <p className="text-[11px] text-emerald-700/80 mt-0.5">Standard system access</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-600 font-semibold uppercase tracking-wider block">
              Suspended Accounts
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">{suspendedCount}</div>
            <p className="text-[11px] text-amber-700/80 mt-0.5">Access temporarily revoked</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Ban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-rose-600 font-semibold uppercase tracking-wider block">
              Terminated Records
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1">{terminatedCount}</div>
            <p className="text-[11px] text-rose-700/80 mt-0.5">Archived offboarding</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Employee Directory Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Card Header with Controls */}
        <div className="p-5 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold uppercase rounded-md border border-rose-200">
                Super Admin Clearance
              </span>
              <span className="text-xs text-neutral-400 font-mono">RBAC Directory v3.0</span>
            </div>
            <h2 className="text-base font-bold text-neutral-900 mt-1 flex items-center gap-2">
              <span>Employee & Access Management</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Provision user accounts, configure role permissions, generate initial temporary credentials, or perform account lifecycle enforcement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Add New User / Employee</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, role, or title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-1.5 text-xs border border-neutral-200 rounded-xl bg-white text-neutral-800 font-medium"
            >
              <option value="all">All Statuses ({totalCount})</option>
              <option value="active">Active Only ({activeCount})</option>
              <option value="suspended">Suspended Only ({suspendedCount})</option>
              <option value="terminated">Terminated Only ({terminatedCount})</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="px-3 py-1.5 text-xs border border-neutral-200 rounded-xl bg-white text-neutral-800 font-medium"
            >
              <option value="all">All Roles</option>
              <option value="employee">Employee / Specialist</option>
              <option value="ops">Operations & Verification</option>
              <option value="team_leader">Team Leader</option>
              <option value="hr">HR & Compliance</option>
              <option value="admin">Administrator</option>
              <option value="super_admin">Super Admin</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-neutral-200 rounded-xl bg-white text-neutral-800 font-medium"
            >
              <option value="all">All Departments</option>
              <option value="Operations & Verification">Operations & Verification</option>
              <option value="Sales & Pipeline">Sales & Pipeline</option>
              <option value="Engineering & IT">Engineering & IT</option>
              <option value="HR & Compliance">HR & Compliance</option>
              <option value="Executive Leadership">Executive Leadership</option>
            </select>
          </div>
        </div>

        {/* User Accounts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">User Profile</th>
                <th className="py-3 px-4">Corporate Credentials</th>
                <th className="py-3 px-4">Role & Clearance</th>
                <th className="py-3 px-4">Department & Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-neutral-400">
                    No accounts found matching current search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((emp) => {
                  const isSuspended = emp.status === 'suspended';
                  const isTerminated = emp.status === 'terminated';
                  const isSuperAdmin = emp.role === 'super_admin';
                  const isMe = emp.id === currentUser.id;

                  return (
                    <tr key={emp.id} className="hover:bg-neutral-50/80 transition">
                      {/* User Profile */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-900">{emp.name}</span>
                              {isMe && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 block">{emp.phone || 'No phone'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Credentials */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-neutral-700 font-medium">{emp.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {emp.initialPassword ? (
                            <span className="text-[10px] font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 border border-neutral-200">
                              Init Pwd: {emp.initialPassword}
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400">Password customized</span>
                          )}
                          <button
                            onClick={() => {
                              setCredentialsModalEmp(emp);
                              setCustomNewPassword('');
                            }}
                            className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer inline-flex items-center gap-0.5"
                            title="Generate / Reset Initial Password"
                          >
                            <KeyRound className="w-2.5 h-2.5" />
                            <span>Reset Credentials</span>
                          </button>
                        </div>
                      </td>

                      {/* Role & Clearance */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase inline-block ${
                            isSuperAdmin
                              ? 'bg-rose-900 text-rose-100'
                              : emp.role === 'admin'
                              ? 'bg-neutral-900 text-white'
                              : emp.role === 'hr'
                              ? 'bg-purple-100 text-purple-800'
                              : emp.role === 'ops'
                              ? 'bg-blue-100 text-blue-800'
                              : emp.role === 'team_leader'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          {emp.role}
                        </span>
                        <span className="text-[11px] text-neutral-500 block mt-0.5">{emp.roleLabel}</span>
                      </td>

                      {/* Department & Designation */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900 block">{emp.department}</span>
                        <span className="text-[11px] text-neutral-500">{emp.designation || 'Specialist'}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isSuspended ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px]">
                            <Ban className="w-2.5 h-2.5 text-amber-600" />
                            <span>Suspended</span>
                          </div>
                        ) : isTerminated ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-full font-bold text-[10px]">
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                            <span>Terminated</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Active</span>
                          </div>
                        )}
                        {emp.suspendedReason && isSuspended && (
                          <p className="text-[10px] text-amber-700 mt-0.5 truncate max-w-36" title={emp.suspendedReason}>
                            Reason: {emp.suspendedReason}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                            title="Edit User Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspension & Termination actions for non-superadmin */}
                          {!isSuperAdmin && (
                            <>
                              {isSuspended ? (
                                <button
                                  onClick={() => reactivateEmployee(emp.id)}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-semibold text-[10px] transition cursor-pointer"
                                  title="Reactivate Account"
                                >
                                  Reactivate
                                </button>
                              ) : !isTerminated ? (
                                <button
                                  onClick={() => setSuspensionModalEmp(emp)}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded font-semibold text-[10px] transition cursor-pointer"
                                  title="Suspend Access"
                                >
                                  Suspend
                                </button>
                              ) : null}

                              {!isTerminated ? (
                                <button
                                  onClick={() => setTerminationModalEmp(emp)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-semibold text-[10px] transition cursor-pointer"
                                  title="Terminate Employment"
                                >
                                  Terminate
                                </button>
                              ) : (
                                <button
                                  onClick={() => reactivateEmployee(emp.id)}
                                  className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded font-semibold text-[10px] transition cursor-pointer"
                                  title="Reactivate / Rehire Record"
                                >
                                  Rehire
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => setDeletingEmpId(emp.id)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Purge Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Profile Switch View */}
                          <button
                            onClick={() => requestProfileSwitch(emp.role, emp)}
                            className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-semibold text-[10px] transition flex items-center gap-1 cursor-pointer"
                            title="Switch / View As Role"
                          >
                            {isProfileLockEnforced && <Lock className="w-2.5 h-2.5 text-neutral-500" />}
                            <span>Switch</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW USER / EMPLOYEE & GENERATE CREDENTIALS                   */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Provision New User Account</h3>
                  <p className="text-[11px] text-neutral-400">Generate initial temporary credentials and RBAC access</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newEmp.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const prefix = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
                    setNewEmp({
                      ...newEmp,
                      name,
                      emailPrefix: newEmp.emailPrefix ? newEmp.emailPrefix : prefix
                    });
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Corporate Email Handle *</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={newEmp.emailPrefix}
                    onChange={(e) => setNewEmp({ ...newEmp, emailPrefix: e.target.value })}
                    placeholder="rahul.sharma"
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-l-xl focus:outline-none focus:ring-1 focus:ring-neutral-900"
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
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value as UserRole })}
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
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Designation Title</label>
                  <input
                    type="text"
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                    placeholder="e.g. Operations Specialist"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    placeholder="+91 98110 00000"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Initial Credentials Generation Section */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Initial Temporary Password</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const pass = generateStrongPassword();
                      setNewEmp({ ...newEmp, initialPassword: pass, autoGeneratePassword: false });
                    }}
                    className="text-[11px] text-amber-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Randomize</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newEmp.initialPassword}
                    onChange={(e) =>
                      setNewEmp({ ...newEmp, initialPassword: e.target.value, autoGeneratePassword: false })
                    }
                    className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-xl font-mono text-neutral-800 font-bold"
                  />
                </div>
                <p className="text-[10px] text-neutral-500">
                  Initial credentials will be displayed with quick-copy options upon creation. Employee will be prompted to reset password and verify 2FA TOTP.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NEWLY GENERATED CREDENTIALS DOSSIER                              */}
      {/* ========================================================================= */}
      {generatedCreds && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-neutral-100 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Account Provisioned Successfully</h3>
                  <p className="text-[11px] text-emerald-200">Initial credentials generated for user</p>
                </div>
              </div>
              <button
                onClick={() => setGeneratedCreds(null)}
                className="text-emerald-200 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Employee Name</span>
                  <p className="font-bold text-neutral-900 text-sm">{generatedCreds.name}</p>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Corporate Email</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono font-bold text-neutral-800">{generatedCreds.email}</span>
                    <button
                      onClick={() => handleCopy(generatedCreds.email, 'email')}
                      className="p-1 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                      title="Copy Email"
                    >
                      {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Temporary Password</span>
                  <div className="flex items-center justify-between mt-0.5 p-2 bg-white rounded-lg border border-amber-200">
                    <span className="font-mono font-bold text-amber-900">{generatedCreds.password}</span>
                    <button
                      onClick={() => handleCopy(generatedCreds.password, 'pwd')}
                      className="p-1 text-amber-700 hover:text-amber-900 cursor-pointer"
                      title="Copy Password"
                    >
                      {copiedKey === 'pwd' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {generatedCreds.totpSecret && (
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">2FA TOTP Secret</span>
                    <p className="font-mono text-[11px] text-neutral-600 mt-0.5">{generatedCreds.totpSecret}</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Share these credentials securely with the employee. They will be required to change their temporary password upon first login.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    const text = `ClickCamp Corporate Credentials:\nEmployee: ${generatedCreds.name}\nEmail: ${generatedCreds.email}\nInitial Password: ${generatedCreds.password}\nPortal URL: https://ais-pre-db7ee5yrb4yaovjvturu5i-709091618521.asia-southeast1.run.app`;
                    handleCopy(text, 'all');
                  }}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Full Credentials</span>
                </button>

                <button
                  onClick={() => setGeneratedCreds(null)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold cursor-pointer transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT EMPLOYEE PROFILE                                            */}
      {/* ========================================================================= */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-neutral-700" />
                <h3 className="font-bold text-neutral-900 text-sm">Edit User: {editingEmployee.name}</h3>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Designation Title</label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">RBAC Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
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
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Employment Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as typeof editForm.status })}
                    className="w-full px-2.5 py-2 border border-neutral-300 rounded-xl bg-white font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RESET / GENERATE CREDENTIALS                                     */}
      {/* ========================================================================= */}
      {credentialsModalEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-neutral-900 text-sm">Reset Credentials: {credentialsModalEmp.name}</h3>
              </div>
              <button
                onClick={() => setCredentialsModalEmp(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-neutral-500 block mb-1">Corporate Email Address</span>
                <p className="font-mono font-bold text-neutral-800 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                  {credentialsModalEmp.email}
                </p>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Specify New Password (or leave blank to auto-generate)
                </label>
                <div className="relative">
                  <input
                    type={showPasswordInModal ? 'text' : 'password'}
                    value={customNewPassword}
                    onChange={(e) => setCustomNewPassword(e.target.value)}
                    placeholder="e.g. ClickCamp@2026! or leave blank"
                    className="w-full px-3 py-2 pr-9 border border-neutral-300 rounded-xl font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    {showPasswordInModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                Regenerating credentials will create a new initial password and rotate the user's 2FA TOTP secret key.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCredentialsModalEmp(null)}
                  className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRegenerateCredentials(credentialsModalEmp)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New Credentials</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: SUSPEND EMPLOYEE ACCOUNT                                         */}
      {/* ========================================================================= */}
      {suspensionModalEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-amber-500 text-neutral-950">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-neutral-950" />
                <h3 className="font-bold text-sm">Suspend Account: {suspensionModalEmp.name}</h3>
              </div>
              <button
                onClick={() => setSuspensionModalEmp(null)}
                className="text-neutral-950 hover:opacity-75 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSuspendSubmit} className="p-5 space-y-4 text-xs">
              <p className="text-neutral-600">
                Suspending this account will immediately revoke workspace login and operational hub access while retaining historical punch, audit, and verification logs.
              </p>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Reason for Suspension *</label>
                <select
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white mb-2"
                >
                  <option value="Administrative Security Review">Administrative Security Review</option>
                  <option value="Statutory Document / KYC Discrepancy">Statutory Document / KYC Discrepancy</option>
                  <option value="Disciplinary Investigation">Disciplinary Investigation</option>
                  <option value="Extended Unplanned Absence">Extended Unplanned Absence</option>
                  <option value="Other Policy Violation">Other Policy Violation</option>
                </select>
                <input
                  type="text"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Custom explanation..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSuspensionModalEmp(null)}
                  className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl transition cursor-pointer"
                >
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: TERMINATE EMPLOYEE ACCOUNT                                       */}
      {/* ========================================================================= */}
      {terminationModalEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-rose-600 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">Terminate Employment: {terminationModalEmp.name}</h3>
              </div>
              <button
                onClick={() => setTerminationModalEmp(null)}
                className="text-white hover:opacity-75 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTerminateSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 leading-relaxed">
                Termination initiates formal employee offboarding under the Indian Industrial Relations and statutory compliance guidelines. All active API tokens, DMS credentials, and mailbox routes will be closed.
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Termination / Separation Reason *</label>
                <input
                  type="text"
                  required
                  value={terminateData.reason}
                  onChange={(e) => setTerminateData({ ...terminateData, reason: e.target.value })}
                  placeholder="e.g. End of contract / Administrative separation"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Last Working Day (LWD) *</label>
                <input
                  type="date"
                  required
                  value={terminateData.lastWorkingDay}
                  onChange={(e) => setTerminateData({ ...terminateData, lastWorkingDay: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTerminationModalEmp(null)}
                  className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Confirm Termination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: PURGE EMPLOYEE RECORD                                            */}
      {/* ========================================================================= */}
      {deletingEmpId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-sm p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm">Purge Employee Record?</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              This action permanently deletes this record from the active directory. Audit history entries will remain preserved for SOC2 Type II compliance.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => setDeletingEmpId(null)}
                className="px-3.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteEmployee(deletingEmpId);
                  setDeletingEmpId(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
