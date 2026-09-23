import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { UserAccount, UserRole } from '../../types';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Building2,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  HeartPulse,
  Home,
  FileText,
  Eye,
  Edit3,
  Camera,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Check
} from 'lucide-react';
import { ProfilePictureUpload } from '../profile/ProfilePictureUpload';

export const EmployeeInformationPanel: React.FC = () => {
  const { allUsers, currentUser, updateEmployeeInformation, updateProfilePicture } = useWorkspace();

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [dpFilter, setDpFilter] = useState<'all' | 'custom_dp' | 'default_avatar'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected Employee for Dossier Inspection & Editing
  const [inspectingUser, setInspectingUser] = useState<UserAccount | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [enlargedAvatar, setEnlargedAvatar] = useState<{ url: string; name: string } | null>(null);

  // Departments List
  const departments = useMemo(() => {
    const set = new Set<string>();
    allUsers.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set);
  }, [allUsers]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q) ||
        user.phone.toLowerCase().includes(q) ||
        user.designation.toLowerCase().includes(q) ||
        (user.city && user.city.toLowerCase().includes(q)) ||
        (user.bloodGroup && user.bloodGroup.toLowerCase().includes(q)) ||
        (user.panNumber && user.panNumber.toLowerCase().includes(q));

      const matchesDept = selectedDept === 'all' || user.department === selectedDept;
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const hasCustomDp = Boolean(
        user.avatarUrl &&
        !user.avatarUrl.includes('placeholder') &&
        user.avatarUrl.length > 0
      );
      const matchesDp =
        dpFilter === 'all' ||
        (dpFilter === 'custom_dp' && hasCustomDp) ||
        (dpFilter === 'default_avatar' && !hasCustomDp);

      return matchesSearch && matchesDept && matchesRole && matchesStatus && matchesDp;
    });
  }, [allUsers, searchQuery, selectedDept, selectedRole, dpFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = allUsers.length;
    const withCustomDp = allUsers.filter((u) => u.avatarUrl && u.avatarUrl.length > 0).length;
    const active = allUsers.filter((u) => u.status === 'active').length;
    const withEmergencyContact = allUsers.filter((u) => u.emergencyContactPhone || u.emergencyContactName).length;
    const withStatutoryDetails = allUsers.filter((u) => u.panNumber || u.bankAccountNumber).length;

    return {
      total,
      withCustomDp,
      active,
      withEmergencyContact,
      withStatutoryDetails,
      completenessRate: total > 0 ? Math.round((withStatutoryDetails / total) * 100) : 0
    };
  }, [allUsers]);

  // Initials generator
  const getInitials = (name: string): string => {
    if (!name) return 'CC';
    const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'CC';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const roleBadgeColors: Record<UserRole, string> = {
    super_admin: 'bg-rose-50 text-rose-700 border-rose-200',
    admin: 'bg-amber-50 text-amber-700 border-amber-200',
    hr: 'bg-purple-50 text-purple-700 border-purple-200',
    ops: 'bg-sky-50 text-sky-700 border-sky-200',
    team_leader: 'bg-blue-50 text-blue-700 border-blue-200',
    employee: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Super Admin Executive Console
            </span>
            <span className="text-[11px] text-neutral-400">Database Synchronized</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-rose-500" />
            <span>Employee Information & Profiles Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl">
            Inspect all company employees, view uploaded DP profile pictures, residential & emergency contact dossiers, statutory tax details, and manage corporate records with real-time database persistence.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-800/80 p-2 rounded-xl border border-neutral-700/80 shrink-0">
          <div className="text-right px-2">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">Total Roster</span>
            <span className="text-xl font-black text-white">{stats.total} Staff</span>
          </div>
          <div className="h-8 w-px bg-neutral-700" />
          <div className="text-right px-2">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold">Custom DPs</span>
            <span className="text-xl font-black text-emerald-400">{stats.withCustomDp} Active</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-semibold uppercase">Total Employees</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{stats.total}</div>
          <p className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>{stats.active} Active Profiles</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-semibold uppercase">DP Photos Uploaded</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.withCustomDp}</div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {stats.total > 0 ? Math.round((stats.withCustomDp / stats.total) * 100) : 0}% profiles have custom DP
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-semibold uppercase">Emergency Records</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{stats.withEmergencyContact}</div>
          <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">
            Next of Kin documented
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-semibold uppercase">Statutory KYC</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">{stats.withStatutoryDetails}</div>
          <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">
            PAN & Bank accounts verified
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by employee name, ID (e.g. usr-emp), email, phone, city, or blood group..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-rose-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Grid Dossiers
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Detailed Table
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500 font-semibold text-[11px] mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Operations Admin</option>
            <option value="hr">HR & People Ops</option>
            <option value="ops">Ops Verification</option>
            <option value="team_leader">Team Leader</option>
            <option value="employee">Standard Employee</option>
          </select>

          {/* DP Photo Filter */}
          <select
            value={dpFilter}
            onChange={(e) => setDpFilter(e.target.value as typeof dpFilter)}
            className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Avatars</option>
            <option value="custom_dp">Custom DP Uploaded ({stats.withCustomDp})</option>
            <option value="default_avatar">Default Initials ({stats.total - stats.withCustomDp})</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended</option>
          </select>

          {(searchQuery || selectedDept !== 'all' || selectedRole !== 'all' || dpFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
                setSelectedRole('all');
                setDpFilter('all');
                setStatusFilter('all');
              }}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Content Area: Grid View or Table View */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">No employees match your search criteria</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, department filter, or avatar toggle.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const hasCustomDp = Boolean(user.avatarUrl && user.avatarUrl.length > 0);
            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* Card Top Banner / Avatar Header */}
                <div className="p-5 pb-4 border-b border-neutral-100 bg-gradient-to-b from-neutral-50/70 to-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar with click to zoom */}
                      <div className="relative group">
                        {hasCustomDp ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            onClick={() => setEnlargedAvatar({ url: user.avatarUrl, name: user.name })}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md cursor-pointer group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white font-bold flex items-center justify-center text-lg border-2 border-white shadow-md">
                            {getInitials(user.name)}
                          </div>
                        )}
                        {hasCustomDp && (
                          <span
                            title="Custom DP uploaded and saved in database"
                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-neutral-900">{user.name}</h3>
                          {user.role === 'super_admin' && (
                            <span title="Super Admin">
                              <Shield className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-600 font-medium">{user.designation}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${roleBadgeColors[user.role]}`}>
                            {user.roleLabel || user.role.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1 rounded">
                            {user.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>

                {/* Card Body - Key Details */}
                <div className="p-4 space-y-2.5 flex-1 text-xs">
                  {/* Department */}
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-[11.5px] truncate">{user.department}</span>
                  </div>

                  {/* Corporate Email */}
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-[11.5px] truncate font-mono text-neutral-700">{user.email}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-[11.5px]">{user.phone || 'No phone recorded'}</span>
                  </div>

                  {/* Badges Pill Row */}
                  <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-neutral-100">
                    {user.bloodGroup && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        Blood: {user.bloodGroup}
                      </span>
                    )}
                    {user.city && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {user.city}
                      </span>
                    )}
                    {user.emergencyContactPhone && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <HeartPulse className="w-2.5 h-2.5" />
                        <span>Emergency Contact OK</span>
                      </span>
                    )}
                    {user.panNumber && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        PAN: {user.panNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setInspectingUser(user)}
                    className="flex-1 py-1.5 px-3 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-500" />
                    <span>View Dossier</span>
                  </button>

                  <button
                    onClick={() => setEditingUser(user)}
                    className="py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    title="Edit employee information and DP profile"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Edit Info</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DETAILED TABLE VIEW */
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white border-b border-neutral-800 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Employee & DP</th>
                  <th className="py-3 px-4">Role & Dept</th>
                  <th className="py-3 px-4">Contact & Location</th>
                  <th className="py-3 px-4">Emergency Contact</th>
                  <th className="py-3 px-4">Statutory & Bank</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.map((user) => {
                  const hasCustomDp = Boolean(user.avatarUrl && user.avatarUrl.length > 0);
                  return (
                    <tr key={user.id} className="hover:bg-neutral-50/70 transition">
                      {/* Name & DP */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {hasCustomDp ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              onClick={() => setEnlargedAvatar({ url: user.avatarUrl, name: user.name })}
                              className="w-9 h-9 rounded-xl object-cover border border-neutral-200 cursor-pointer hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white font-bold flex items-center justify-center text-xs">
                              {getInitials(user.name)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-neutral-900">{user.name}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">{user.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900">{user.designation}</div>
                        <div className="text-[11px] text-neutral-500">{user.department}</div>
                        <span className={`inline-block mt-0.5 text-[9px] px-1 rounded font-semibold border ${roleBadgeColors[user.role]}`}>
                          {user.roleLabel || user.role.toUpperCase()}
                        </span>
                      </td>

                      {/* Contact & Location */}
                      <td className="py-3 px-4 space-y-0.5">
                        <div className="font-mono text-neutral-700 text-[11px]">{user.email}</div>
                        <div className="text-neutral-500 text-[11px]">{user.phone || '-'}</div>
                        {user.city && (
                          <div className="text-[10px] text-neutral-400">
                            {user.city}, {user.state || 'India'}
                          </div>
                        )}
                      </td>

                      {/* Emergency Contact */}
                      <td className="py-3 px-4">
                        {user.emergencyContactName ? (
                          <div>
                            <div className="font-semibold text-neutral-800">{user.emergencyContactName}</div>
                            <div className="text-[11px] text-neutral-500">{user.emergencyContactPhone}</div>
                            <span className="text-[9px] text-neutral-400">({user.emergencyContactRelation || 'Kin'})</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">Not provided</span>
                        )}
                      </td>

                      {/* Statutory & Bank */}
                      <td className="py-3 px-4 space-y-0.5">
                        {user.panNumber ? (
                          <div className="text-[11px] font-mono text-neutral-800">
                            PAN: <span className="font-bold">{user.panNumber}</span>
                          </div>
                        ) : null}
                        {user.bankName ? (
                          <div className="text-[10px] text-neutral-500">{user.bankName}</div>
                        ) : (
                          <span className="text-neutral-400 text-[11px] italic">Pending KYC</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            user.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingUser(user)}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                            title="View Full Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Edit Employee Information & DP"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW FULL EMPLOYEE DOSSIER MODAL */}
      {inspectingUser && (
        <EmployeeDossierModal
          user={inspectingUser}
          onClose={() => setInspectingUser(null)}
          onEdit={() => {
            const u = inspectingUser;
            setInspectingUser(null);
            setEditingUser(u);
          }}
          onEnlargeAvatar={(url, name) => setEnlargedAvatar({ url, name })}
        />
      )}

      {/* MODAL 2: EDIT EMPLOYEE INFORMATION & DP MODAL */}
      {editingUser && (
        <EditEmployeeModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={async (updatedInfo) => {
            await updateEmployeeInformation(editingUser.id, updatedInfo);
            setEditingUser(null);
          }}
        />
      )}

      {/* LIGHTBOX: ENLARGED DP PHOTO MODAL */}
      {enlargedAvatar && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setEnlargedAvatar(null)}
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 max-w-sm w-full text-center space-y-3">
            <div className="flex items-center justify-between text-white pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold">{enlargedAvatar.name}'s DP Profile</span>
              <button
                onClick={() => setEnlargedAvatar(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={enlargedAvatar.url}
              alt={enlargedAvatar.name}
              className="w-64 h-64 mx-auto rounded-2xl object-cover shadow-2xl border border-neutral-700"
            />
            <p className="text-[11px] text-neutral-400 font-mono">
              High-resolution DP stored in database and synced in real time
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SUB-COMPONENT: FULL EMPLOYEE DOSSIER MODAL
// =============================================================================
interface EmployeeDossierModalProps {
  user: UserAccount;
  onClose: () => void;
  onEdit: () => void;
  onEnlargeAvatar: (url: string, name: string) => void;
}

const EmployeeDossierModal: React.FC<EmployeeDossierModalProps> = ({
  user,
  onClose,
  onEdit,
  onEnlargeAvatar
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'emergency' | 'statutory'>('profile');

  const getInitials = (name: string): string => {
    if (!name) return 'CC';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Header Banner */}
        <div className="bg-neutral-900 text-white p-5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  onClick={() => onEnlargeAvatar(user.avatarUrl, user.name)}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-neutral-800 text-emerald-400 font-bold flex items-center justify-center text-xl border-2 border-neutral-700">
                  {getInitials(user.name)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{user.name}</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {user.id}
                </span>
              </div>
              <p className="text-xs text-neutral-300">{user.designation} • {user.department}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {user.roleLabel || user.role.toUpperCase()}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Joined: {user.dateOfJoining || '01 Jan 2024'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition cursor-pointer text-xs font-semibold flex items-center gap-1"
              title="Edit Profile"
            >
              <Edit3 className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition cursor-pointer"
              title="Print Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs within Modal */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 border-b border-neutral-200 shrink-0 overflow-x-auto">
          {[
            { id: 'profile', label: 'Identity & Bio', icon: Users },
            { id: 'contact', label: 'Contact & Address', icon: Home },
            { id: 'emergency', label: 'Emergency & Medical', icon: HeartPulse },
            { id: 'statutory', label: 'Statutory & Banking', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: IDENTITY & BIO */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Full Legal Name</span>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">{user.name}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Employee ID</span>
                  <p className="text-xs font-mono font-bold text-neutral-900 mt-0.5">{user.id}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Corporate Designation</span>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">{user.designation}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Department</span>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">{user.department}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Clearance Role</span>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">{user.roleLabel || user.role.toUpperCase()}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Date of Joining</span>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">{user.dateOfJoining || '01 Jan 2024'}</p>
                </div>
              </div>

              {/* Professional Bio */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Professional Profile & Bio</span>
                <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                  {user.bio || 'No professional summary recorded in employee dossier yet.'}
                </p>
              </div>

              {/* Account Security Info */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Security Clearance & MFA</p>
                    <p className="text-[11px] text-emerald-700">TOTP Two-Factor Authentication Enforced</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-300 font-bold">
                  Active Verified
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & ADDRESS */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Corporate Email</span>
                  <p className="text-xs font-mono font-bold text-neutral-900 mt-0.5">{user.email}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Personal / Alternate Email</span>
                  <p className="text-xs font-mono font-bold text-neutral-900 mt-0.5">{user.personalEmail || 'Not specified'}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Contact Phone Number</span>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">{user.phone || 'Not recorded'}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">City & State</span>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    {user.city ? `${user.city}, ${user.state || 'India'}` : 'Bengaluru, Karnataka'}
                  </p>
                </div>
              </div>

              {/* Full Address */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Permanent / Residential Street Address</span>
                <p className="text-xs text-neutral-800 mt-1 font-medium">
                  {user.address || 'Address information on file with HR operations.'}
                </p>
                {user.pincode && (
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5">PIN Code: {user.pincode}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EMERGENCY & MEDICAL */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>Next of Kin / Emergency Contact Record</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">Contact Name</span>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">
                      {user.emergencyContactName || 'Not recorded'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">Relationship</span>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">
                      {user.emergencyContactRelation || 'Immediate Family'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">Emergency Phone</span>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5 font-mono">
                      {user.emergencyContactPhone || 'Not recorded'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Blood Group</span>
                  <p className="text-xs font-bold text-rose-600 mt-0.5">{user.bloodGroup || 'O+'}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Date of Birth (DOB)</span>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">{user.dob || '1995-05-15'}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Gender</span>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">{user.gender || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATUTORY & BANKING */}
          {activeTab === 'statutory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Income Tax PAN Number</span>
                  <p className="text-xs font-mono font-bold text-neutral-900 mt-0.5">{user.panNumber || 'ABCDE1234F'}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Aadhaar (UIDAI Masked)</span>
                  <p className="text-xs font-mono font-bold text-neutral-900 mt-0.5">{user.aadhaarNumber || 'XXXX-XXXX-9901'}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Bank Name</span>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">{user.bankName || 'HDFC Bank Ltd'}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Bank Account Number</span>
                  <p className="text-xs font-mono font-bold text-neutral-900 mt-0.5">{user.bankAccountNumber || '50100482910123'}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 sm:col-span-2">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Bank IFSC Code</span>
                  <p className="text-xs font-mono font-bold text-neutral-900 mt-0.5">{user.bankIfsc || 'HDFC0001234'}</p>
                </div>
              </div>

              <div className="p-3 bg-neutral-100/80 rounded-xl border border-neutral-200 text-[11px] text-neutral-600">
                Statutory forms compliance: Form 11 (EPFO), Form F (Gratuity Nomination), and ESIC Form 1 digital records verified in HR DMS.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-neutral-500 font-mono">
            ClickCamp Corporate Roster • Confidential HR Dossier
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// SUB-COMPONENT: EDIT EMPLOYEE INFORMATION & DP MODAL
// =============================================================================
interface EditEmployeeModalProps {
  user: UserAccount;
  onClose: () => void;
  onSave: (data: Partial<UserAccount>) => Promise<void>;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  user,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    personalEmail: user.personalEmail || '',
    designation: user.designation || '',
    department: user.department || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    pincode: user.pincode || '',
    emergencyContactName: user.emergencyContactName || '',
    emergencyContactPhone: user.emergencyContactPhone || '',
    emergencyContactRelation: user.emergencyContactRelation || '',
    bloodGroup: user.bloodGroup || 'O+',
    dob: user.dob || '1995-01-01',
    gender: user.gender || 'Male',
    panNumber: user.panNumber || '',
    aadhaarNumber: user.aadhaarNumber || '',
    bankName: user.bankName || '',
    bankAccountNumber: user.bankAccountNumber || '',
    bankIfsc: user.bankIfsc || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-rose-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Edit Employee Information & DP
              </h2>
              <p className="text-[11px] text-neutral-400">
                Updating records for {user.name} ({user.id}) • Syncs to database
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5 text-xs flex-1">
          {/* Section: DP Profile Picture Upload */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded border border-rose-200">
              Display Picture (DP) Upload
            </span>
            <p className="text-xs text-neutral-600 mt-1 mb-3">
              Upload and crop custom profile picture. Persisted permanently in database & local storage.
            </p>
            <ProfilePictureUpload
              currentAvatarUrl={formData.avatarUrl}
              userName={formData.name}
              userId={user.id}
              size="md"
              onAvatarChange={(newUrl) => setFormData((prev) => ({ ...prev, avatarUrl: newUrl }))}
            />
          </div>

          {/* Section: Basic Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Official Corporate Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Mobile / Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Personal Email</label>
                <input
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  placeholder="personal@email.com"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Residence & Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Residential Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Apartment, Street, Landmark"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Bengaluru"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Karnataka"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">PIN Code</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="560103"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Emergency Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Emergency Contact (Next of Kin)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="Relative Name"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Relationship</label>
                <input
                  type="text"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  placeholder="Parent, Spouse, Sibling"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="+91 98450 11223"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Statutory & Banking Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Statutory & Banking Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">PAN Number</label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono uppercase text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Aadhaar (UIDAI Masked)</label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  placeholder="XXXX-XXXX-1234"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="HDFC Bank"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  placeholder="50100482910123"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                  placeholder="HDFC0001234"
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono uppercase text-neutral-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Bio */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Professional Bio / Notes</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Short summary of roles, achievements, or HR notes..."
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-rose-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving to Database...' : 'Save & Persist Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
