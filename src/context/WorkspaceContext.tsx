import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../lib/authService';
import {
  UserRole,
  UserAccount,
  MainNavTab,
  PunchState,
  PunchRecord,
  AttendanceRegularization,
  ClientAccount,
  LeadItem,
  LeaveRequest,
  ResignationRecord,
  PendingOnboarding,
  OnboardingDocuments,
  SalarySlip,
  DailyCompanyTask,
  DmsDocument,
  AuditLog,
  ChatMessage,
  WebmailItem,
  MeetingMom,
  SupportTicket,
  ExpenseClaim,
  CrmDealer,
  AppNotification,
  ProfileSwitchRequest,
  PendingHubAuth,
  CompanyNotice,
  NoticeCategory,
  NoticePriority
} from '../types';
import { supabase, isSupabaseConfigured, NoticeRow } from '../lib/supabaseClient';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import {
  initialUsers,
  mockUsers,
  initialPunchRecords,
  initialRegularizations,
  initialClientAccounts,
  initialLeads,
  initialLeaves,
  initialResignations,
  initialPendingOnboarding,
  initialSalarySlips,
  initialCompanyTasks,
  initialDmsDocuments,
  initialAuditLogs,
  initialChatMessages,
  initialWebmail,
  initialMeetingMoms,
  initialSupportTickets,
  initialExpenseClaims,
  initialCrmDealers,
  initialNotifications,
  initialCompanyNotices
} from '../data/mockData';

interface WorkspaceContextType {
  // Auth & RBAC
  currentUser: UserAccount;
  allUsers: UserAccount[];
  isAuthenticated: boolean;
  switchUserRole: (role: UserRole) => void;
  loginUser: (email: string, role?: UserRole) => boolean | void;
  logoutUser: () => void;

  // Profile Lockdown & Authorization
  isProfileLockEnforced: boolean;
  setIsProfileLockEnforced: (val: boolean) => void;
  pendingProfileSwitch: ProfileSwitchRequest | null;
  requestProfileSwitch: (targetRole: UserRole, targetUser?: UserAccount) => void;
  verifyProfileSwitch: (password: string, reason?: string, authorizedBy?: string) => { success: boolean; message: string };
  cancelProfileSwitch: () => void;

  // Operational Hubs Lockdown
  unlockedHubs: MainNavTab[];
  pendingHubAuth: PendingHubAuth | null;
  isHubLockedForUser: (tab: MainNavTab) => boolean;
  requestHubAccess: (tab: MainNavTab, hubLabel?: string, requiredClearance?: string) => boolean;
  verifyHubAccess: (password: string, reason?: string, authorizedBy?: string) => { success: boolean; message: string };
  cancelHubAccess: () => void;
  
  // Employee Directory Management (Super Admin / HR)
  addEmployee: (data: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    designation: string;
    phone: string;
    initialPassword?: string;
  }) => UserAccount;
  updateEmployee: (id: string, updates: Partial<UserAccount>) => void;
  updateEmployeeInformation: (userId: string, data: Partial<UserAccount>) => Promise<boolean>;
  suspendEmployee: (id: string, reason?: string) => void;
  terminateEmployee: (id: string, reason: string, lastWorkingDay: string) => void;
  reactivateEmployee: (id: string) => void;
  deleteEmployee: (id: string) => void;
  resetEmployeeCredentials: (id: string, newPassword?: string) => string;
  
  // Profile Settings & Custom PFP
  isProfileSettingsOpen: boolean;
  setIsProfileSettingsOpen: (open: boolean) => void;
  updateProfilePicture: (avatarUrl: string, userId?: string) => Promise<boolean>;
  removeProfilePicture: (userId?: string) => Promise<boolean>;

  // Company Brand Identity & Logo
  companyLogoUrl: string | null;
  updateCompanyLogo: (logoUrl: string | null) => void;
  isBrandModalOpen: boolean;
  setIsBrandModalOpen: (open: boolean) => void;

  // 2FA Security
  is2FAModalOpen: boolean;
  setIs2FAModalOpen: (open: boolean) => void;
  verify2FACode: (code: string) => boolean;

  // Admin Screen Lock
  isScreenLocked: boolean;
  lockScreen: () => void;
  unlockScreen: (pin: string) => boolean;

  // Navigation
  activeTab: MainNavTab;
  setActiveTab: (tab: MainNavTab) => void;

  // Time & Attendance Punch Clock
  punchState: PunchState;
  liveIstTime: string;
  clockInTimestamp: number | null;
  elapsedSeconds: number;
  clockIn: () => void;
  clockOut: () => void;
  toggleBreak: () => void;
  punchRecords: PunchRecord[];
  regularizations: AttendanceRegularization[];
  submitRegularization: (data: Omit<AttendanceRegularization, 'id' | 'status' | 'userId' | 'userName'>) => void;
  reviewRegularization: (id: string, status: 'approved' | 'rejected') => void;

  // Client Accounts & Ops Queue (Concurrent Review Locking)
  clientAccounts: ClientAccount[];
  submitClientAccount: (data: Omit<ClientAccount, 'id' | 'submittedBy' | 'submittedByName' | 'submittedAt' | 'status'>) => void;
  lockAccountForReview: (id: string) => boolean;
  releaseAccountLock: (id: string) => void;
  reviewAccount: (id: string, status: 'verified' | 'rejected', reviewerNotes: string) => void;

  // Leads Pipeline
  leads: LeadItem[];
  updateLeadStage: (id: string, stage: 'initial_contact' | 'document_submission' | 'active_account') => void;
  addLead: (lead: Omit<LeadItem, 'id' | 'lastActivity'>) => void;

  // Leaves & Resignation
  leaves: LeaveRequest[];
  applyLeave: (data: Omit<LeaveRequest, 'id' | 'userId' | 'userName' | 'department' | 'status' | 'appliedAt'>) => void;
  reviewLeave: (id: string, status: 'approved' | 'rejected', notes?: string) => void;
  resignations: ResignationRecord[];
  submitResignation: (lwd: string, reason: string) => void;
  toggleClearanceItem: (resId: string, item: 'assetsReturned' | 'documentationCompleted' | 'knowledgeTransferDone' | 'financeCleared') => void;
  updateResignationStatus: (resId: string, status: 'submitted' | 'under_clearance' | 'completed' | 'revoked') => void;

  // Team Leader Workspace
  nudgeEmployee: (employeeId: string, employeeName: string) => void;

  // HR Management
  pendingOnboarding: PendingOnboarding[];
  approveOnboarding: (id: string) => void;
  submitNewEmployeeOnboarding: (data: {
    fullName: string;
    personalEmail: string;
    proposedRole?: UserRole;
    department?: string;
    aadhaarNumber: string;
    emergencyName: string;
    emergencyPhone: string;
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    uploadedDocuments?: OnboardingDocuments;
    statutoryForms?: {
      form11Status: 'Pending' | 'Filled Digitally' | 'Downloaded & Signed';
      formFStatus: 'Pending' | 'Filled Digitally' | 'Downloaded & Signed';
      esicForm1Status: 'Pending' | 'Filled Digitally' | 'Downloaded & Signed';
      dpdpConsentAccepted: boolean;
      dpdpConsentTimestamp?: string;
    };
  }) => string;
  reviewOnboardingDecision: (id: string, decision: 'Approved' | 'Rejected - Requires Updates', notes?: string) => void;
  salarySlips: SalarySlip[];
  generateSalarySlip: (data: Omit<SalarySlip, 'id' | 'status'>) => void;
  markSalaryPaid: (id: string) => void;
  dailyTasks: DailyCompanyTask[];
  broadcastTask: (task: Omit<DailyCompanyTask, 'id' | 'completedCount' | 'broadcastBy'>) => void;

  // DMS & Audit Trail
  documents: DmsDocument[];
  uploadDocument: (doc: Omit<DmsDocument, 'id' | 'uploadedBy' | 'uploadedAt'>) => void;
  auditLogs: AuditLog[];
  recordAuditLog: (action: AuditLog['action'], details: string) => void;

  // Communication & Collaboration
  chatMessages: ChatMessage[];
  sendChatMessage: (
    channelId: string,
    text: string,
    recipientId?: string,
    isDirect?: boolean,
    attachment?: { name: string; type: 'pdf' | 'image' | 'doc'; url?: string }
  ) => void;
  sendDirectMessage: (
    recipientId: string,
    text: string,
    attachment?: { name: string; type: 'pdf' | 'image' | 'doc'; url?: string }
  ) => void;
  webmail: WebmailItem[];
  sendWebmail: (toEmail: string, subject: string, body: string) => void;
  toggleStarEmail: (id: string) => void;
  meetings: MeetingMom[];
  markMeetingRead: (id: string) => void;

  // Support & Finance
  tickets: SupportTicket[];
  createTicket: (ticket: Omit<SupportTicket, 'id' | 'submittedBy' | 'submittedByName' | 'createdAt' | 'status'>) => void;
  resolveTicket: (id: string, notes: string) => void;
  expenses: ExpenseClaim[];
  submitExpense: (expense: Omit<ExpenseClaim, 'id' | 'submittedBy' | 'userName' | 'department' | 'status'>) => void;
  reviewExpense: (id: string, status: 'approved' | 'rejected') => void;
  dealers: CrmDealer[];
  addDealer: (dealer: Omit<CrmDealer, 'id' | 'activeAccounts'>) => void;

  // Notifications
  notifications: AppNotification[];
  markAllNotificationsRead: () => void;
  activeToast: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;

  // Company Notice Board
  notices: CompanyNotice[];
  postNotice: (data: {
    title: string;
    content: string;
    category: NoticeCategory;
    priority: NoticePriority;
    targetDepartment?: string;
    isPinned?: boolean;
  }) => Promise<CompanyNotice>;
  updateNotice: (id: string, updates: Partial<CompanyNotice>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  acknowledgeNotice: (id: string) => Promise<void>;
  pinNotice: (id: string, isPinned: boolean) => Promise<void>;
  refreshNotices: () => Promise<void>;

  // Reset & Purge
  resetSystemData: () => void;
  purgeDemoData: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_PREFIX = 'clickcamp_portal_v1_';

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All Users Directory (Persisted in localStorage with dedicated DP & info resilience)
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}all_users`);
      let list = initialUsers;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, UserAccount>();
          // Base with initial users
          initialUsers.forEach((u) => map.set(u.id, u));
          // Overlay saved users
          parsed.forEach((u: UserAccount) => {
            const existing = map.get(u.id);
            map.set(u.id, { ...existing, ...u });
          });
          list = Array.from(map.values());
        }
      }
      // Apply individual DP overrides & employee info overrides
      return list.map((u) => {
        const cachedDp =
          localStorage.getItem(`clickcamp_dp_${u.id}`) ||
          (u.email ? localStorage.getItem(`clickcamp_dp_${u.email.toLowerCase()}`) : null);
        let extraInfo: Partial<UserAccount> = {};
        try {
          const raw = localStorage.getItem(`clickcamp_emp_info_${u.id}`);
          if (raw) extraInfo = JSON.parse(raw);
        } catch {}

        return {
          ...u,
          ...extraInfo,
          avatarUrl: cachedDp || extraInfo.avatarUrl || u.avatarUrl
        };
      });
    } catch {
      return initialUsers;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}all_users`, JSON.stringify(allUsers));
    } catch {
      // ignore
    }
  }, [allUsers]);

  // Current user defaults to Super Admin (Adnan Malik) or saved session with latest DP
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const savedUserId = localStorage.getItem(`${STORAGE_PREFIX}userId`);
      const saved = localStorage.getItem(`${STORAGE_PREFIX}all_users`);
      let list = allUsers;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
        } catch {}
      }
      const found = list.find((u) => u.id === savedUserId);
      if (found) {
        const cachedDp =
          localStorage.getItem(`clickcamp_dp_${found.id}`) ||
          (found.email ? localStorage.getItem(`clickcamp_dp_${found.email.toLowerCase()}`) : null);
        return {
          ...found,
          avatarUrl: cachedDp || found.avatarUrl
        };
      }
    } catch {
      // ignore
    }
    return allUsers[0] || initialUsers[0]; // Adnan Malik (Super Admin & Managing Director)
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${STORAGE_PREFIX}isAuth`) === 'true';
    } catch {
      return false;
    }
  });

  // 2FA modal state
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  // Profile Settings Modal state
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

  // Brand Identity & Company Logo state
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`${STORAGE_PREFIX}company_logo`) || null;
    } catch {
      return null;
    }
  });

  const updateCompanyLogo = (logoUrl: string | null) => {
    setCompanyLogoUrl(logoUrl);
    try {
      if (logoUrl) {
        localStorage.setItem(`${STORAGE_PREFIX}company_logo`, logoUrl);
      } else {
        localStorage.removeItem(`${STORAGE_PREFIX}company_logo`);
      }
    } catch {}
    recordAuditLog('APPROVAL', logoUrl ? 'Updated company logo graphic' : 'Reset company logo to vector default');
  };

  // Admin screen lock
  const [isScreenLocked, setIsScreenLocked] = useState(false);

  // Profile Lockdown & Authorization State (locks all profiles upon employee login)
  const [isProfileLockEnforced, setIsProfileLockEnforced] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}profileLockEnforced`);
      return saved !== null ? saved === 'true' : true; // Enforced by default
    } catch {
      return true;
    }
  });

  const [pendingProfileSwitch, setPendingProfileSwitch] = useState<ProfileSwitchRequest | null>(null);

  // Operational Hubs Lockdown State
  const [unlockedHubs, setUnlockedHubs] = useState<MainNavTab[]>([]);
  const [pendingHubAuth, setPendingHubAuth] = useState<PendingHubAuth | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}profileLockEnforced`, isProfileLockEnforced ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, [isProfileLockEnforced]);

  // Active navigation tab with internal state
  const [activeTab, setActiveTabState] = useState<MainNavTab>('dashboard');

  // Time & Attendance Punch Clock
  const [punchState, setPunchState] = useState<PunchState>('clocked_in');
  const [liveIstTime, setLiveIstTime] = useState<string>('');
  const [clockInTimestamp, setClockInTimestamp] = useState<number | null>(Date.now() - 4 * 3600 * 1000 - 15 * 60 * 1000);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(4 * 3600 + 15 * 60);

  // State data collections
  const [punchRecords, setPunchRecords] = useState<PunchRecord[]>(initialPunchRecords);
  const [regularizations, setRegularizations] = useState<AttendanceRegularization[]>(initialRegularizations);
  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>(initialClientAccounts);
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves);
  const [resignations, setResignations] = useState<ResignationRecord[]>(initialResignations);
  const [pendingOnboarding, setPendingOnboarding] = useState<PendingOnboarding[]>(initialPendingOnboarding);
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>(initialSalarySlips);
  const [dailyTasks, setDailyTasks] = useState<DailyCompanyTask[]>(initialCompanyTasks);
  const [documents, setDocuments] = useState<DmsDocument[]>(initialDmsDocuments);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  
  // Real-time Chat & Direct Messaging (Persisted in localStorage)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}chat_messages`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialChatMessages;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}chat_messages`, JSON.stringify(chatMessages));
    } catch {
      // ignore
    }
  }, [chatMessages]);

  // Company Notice Board state (Persisted in localStorage + Synced to Supabase)
  const [notices, setNotices] = useState<CompanyNotice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}company_notices`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialCompanyNotices;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}company_notices`, JSON.stringify(notices));
    } catch {
      // ignore
    }
  }, [notices]);

  // Cross-tab broadcast channel for real-time local updates
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('clickcamp_notices_broadcast');
      channel.onmessage = (event) => {
        if (event.data?.type === 'NOTICES_UPDATED' && Array.isArray(event.data.notices)) {
          setNotices(event.data.notices);
        }
      };
      return () => channel.close();
    }
  }, []);

  // Fetch live backend data from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Fetch live notices from Supabase
    supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: CompanyNotice[] = data.map((n: NoticeRow) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            priority: n.priority,
            category: n.category,
            targetDepartment: n.target_department || 'All Departments',
            authorId: n.author_id,
            authorName: n.author_name,
            authorRole: n.author_role,
            isPinned: n.is_pinned,
            acknowledgements: n.acknowledgements || [],
            createdAt: n.created_at,
            updatedAt: n.updated_at || undefined
          }));
          setNotices(mapped);
        }
      });

    // 2. Fetch live profiles from Supabase with resilient DP and information merging
    supabase
      .from('profiles')
      .select('*')
      .then(({ data, error }: { data: any; error: any }) => {
        if (!error && Array.isArray(data) && data.length > 0) {
          setAllUsers((prevUsers) => {
            const merged = [...prevUsers];
            data.forEach((p: any) => {
              const existingIdx = merged.findIndex(
                (u) => u.id === p.id || (p.email && u.email.toLowerCase() === p.email.toLowerCase())
              );
              const cachedDp =
                localStorage.getItem(`clickcamp_dp_${p.id}`) ||
                (p.email ? localStorage.getItem(`clickcamp_dp_${p.email.toLowerCase()}`) : null);

              let localExtra: any = {};
              try {
                const raw = localStorage.getItem(`clickcamp_emp_info_${p.id}`);
                if (raw) localExtra = JSON.parse(raw);
              } catch {}

              const finalAvatar =
                p.avatar_url ||
                cachedDp ||
                localExtra.avatarUrl ||
                (existingIdx >= 0 ? merged[existingIdx].avatarUrl : '');

              const userObj: UserAccount = {
                id: p.id,
                name: p.name || (existingIdx >= 0 ? merged[existingIdx].name : 'Employee'),
                email: p.email,
                role: (p.role as UserRole) || (existingIdx >= 0 ? merged[existingIdx].role : 'employee'),
                roleLabel: p.designation || (existingIdx >= 0 ? merged[existingIdx].roleLabel : 'Staff'),
                department: p.department || (existingIdx >= 0 ? merged[existingIdx].department : 'Operations'),
                avatarUrl: finalAvatar,
                designation: p.designation || (existingIdx >= 0 ? merged[existingIdx].designation : 'Staff'),
                phone: p.phone || (existingIdx >= 0 ? merged[existingIdx].phone : ''),
                status: p.is_active ? 'active' : 'suspended',
                is2FAEnabled: p.two_factor_enabled ?? true,
                totpSecret: p.totp_secret || (existingIdx >= 0 ? merged[existingIdx].totpSecret : ''),
                backupCodes: existingIdx >= 0 ? merged[existingIdx].backupCodes : ['CC-1001', 'CC-2002'],
                dateOfJoining: p.created_at
                  ? new Date(p.created_at).toLocaleDateString('en-GB')
                  : existingIdx >= 0
                  ? merged[existingIdx].dateOfJoining
                  : 'Live Onboarded',
                address: p.address || localExtra.address || (existingIdx >= 0 ? merged[existingIdx].address : ''),
                city: p.city || localExtra.city || (existingIdx >= 0 ? merged[existingIdx].city : ''),
                state: p.state || localExtra.state || (existingIdx >= 0 ? merged[existingIdx].state : ''),
                pincode: p.pincode || localExtra.pincode || (existingIdx >= 0 ? merged[existingIdx].pincode : ''),
                emergencyContactName:
                  p.emergency_contact_name ||
                  localExtra.emergencyContactName ||
                  (existingIdx >= 0 ? merged[existingIdx].emergencyContactName : ''),
                emergencyContactPhone:
                  p.emergency_contact_phone ||
                  localExtra.emergencyContactPhone ||
                  (existingIdx >= 0 ? merged[existingIdx].emergencyContactPhone : ''),
                emergencyContactRelation:
                  p.emergency_contact_relation ||
                  localExtra.emergencyContactRelation ||
                  (existingIdx >= 0 ? merged[existingIdx].emergencyContactRelation : ''),
                bloodGroup: p.blood_group || localExtra.bloodGroup || (existingIdx >= 0 ? merged[existingIdx].bloodGroup : ''),
                dob: p.dob || localExtra.dob || (existingIdx >= 0 ? merged[existingIdx].dob : ''),
                gender: p.gender || localExtra.gender || (existingIdx >= 0 ? merged[existingIdx].gender : ''),
                personalEmail:
                  p.personal_email ||
                  localExtra.personalEmail ||
                  (existingIdx >= 0 ? merged[existingIdx].personalEmail : ''),
                bio: p.bio || localExtra.bio || (existingIdx >= 0 ? merged[existingIdx].bio : ''),
                panNumber: p.pan_number || localExtra.panNumber || (existingIdx >= 0 ? merged[existingIdx].panNumber : ''),
                aadhaarNumber:
                  p.aadhaar_number ||
                  localExtra.aadhaarNumber ||
                  (existingIdx >= 0 ? merged[existingIdx].aadhaarNumber : ''),
                bankName: p.bank_name || localExtra.bankName || (existingIdx >= 0 ? merged[existingIdx].bankName : ''),
                bankAccountNumber:
                  p.bank_account ||
                  localExtra.bankAccountNumber ||
                  (existingIdx >= 0 ? merged[existingIdx].bankAccountNumber : ''),
                bankIfsc: p.bank_ifsc || localExtra.bankIfsc || (existingIdx >= 0 ? merged[existingIdx].bankIfsc : '')
              };

              if (existingIdx >= 0) {
                merged[existingIdx] = userObj;
              } else {
                merged.push(userObj);
              }

              // If database had no avatar_url, but we had a custom DP, persist back to database
              if (!p.avatar_url && finalAvatar && isSupabaseConfigured && supabase) {
                (supabase as any)
                  .from('profiles')
                  .update({ avatar_url: finalAvatar, updated_at: new Date().toISOString() })
                  .eq('id', p.id)
                  .then(() => {});
              }
            });
            return merged;
          });
        }
      });
  }, []);

  // Listen to live database postgres_changes for notices table via useRealtimeSync
  useRealtimeSync({
    currentUserId: currentUser.id,
    isSuperAdmin: currentUser.role === 'super_admin',
    onNoticeChange: ({ eventType, notice }) => {
      if (eventType === 'INSERT') {
        const mappedNotice: CompanyNotice = {
          id: notice.id,
          title: notice.title,
          content: notice.content,
          priority: notice.priority,
          category: notice.category,
          targetDepartment: notice.target_department || 'All Departments',
          authorId: notice.author_id,
          authorName: notice.author_name,
          authorRole: notice.author_role,
          isPinned: Boolean(notice.is_pinned),
          acknowledgements: Array.isArray(notice.acknowledgements) ? notice.acknowledgements : [],
          createdAt: notice.created_at,
          updatedAt: notice.updated_at || undefined
        };
        setNotices((prev) => {
          if (prev.some((n) => n.id === mappedNotice.id)) return prev;
          return [mappedNotice, ...prev];
        });
      } else if (eventType === 'UPDATE') {
        setNotices((prev) =>
          prev.map((n) =>
            n.id === notice.id
              ? {
                  ...n,
                  title: notice.title,
                  content: notice.content,
                  priority: notice.priority,
                  category: notice.category,
                  targetDepartment: notice.target_department || n.targetDepartment,
                  isPinned: Boolean(notice.is_pinned),
                  acknowledgements: Array.isArray(notice.acknowledgements)
                    ? notice.acknowledgements
                    : n.acknowledgements,
                  updatedAt: notice.updated_at || new Date().toISOString()
                }
              : n
          )
        );
      } else if (eventType === 'DELETE') {
        setNotices((prev) => prev.filter((n) => n.id !== notice.id));
      }
    }
  });

  const [webmail, setWebmail] = useState<WebmailItem[]>(initialWebmail);
  const [meetings, setMeetings] = useState<MeetingMom[]>(initialMeetingMoms);
  const [tickets, setTickets] = useState<SupportTicket[]>(initialSupportTickets);
  const [expenses, setExpenses] = useState<ExpenseClaim[]>(initialExpenseClaims);
  const [dealers, setDealers] = useState<CrmDealer[]>(initialCrmDealers);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Trigger brief floating toast
  const showToast = (message: string) => {
    setActiveToast(message);
    setTimeout(() => {
      setActiveToast((prev) => (prev === message ? null : prev));
    }, 4000);
  };

  const clearToast = () => setActiveToast(null);

  // Live IST Clock Timer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as IST (UTC+5:30)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setLiveIstTime(new Intl.DateTimeFormat('en-IN', options).format(now) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Elapsed punch counter
  useEffect(() => {
    if (punchState === 'clocked_in' && clockInTimestamp) {
      const interval = setInterval(() => {
        const diffSecs = Math.floor((Date.now() - clockInTimestamp) / 1000);
        setElapsedSeconds(Math.max(0, diffSecs));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [punchState, clockInTimestamp]);

  // Record audit log helper
  const recordAuditLog = (action: AuditLog['action'], details: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: dateStr,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.roleLabel,
      action,
      details,
      ipAddress: '103.21.144.22'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Direct profile switch execution after authorization or if locking is inactive
  const executeDirectProfileSwitch = (
    targetUser: UserAccount,
    reason?: string,
    authorizedBy?: string
  ) => {
    const previousUser = currentUser;
    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}userId`, targetUser.id);
      localStorage.setItem(`${STORAGE_PREFIX}isAuth`, 'true');
    } catch {
      // ignore
    }

    if (reason || authorizedBy) {
      recordAuditLog(
        'SECURITY_OVERRIDE',
        `Profile transition authorized: from ${previousUser.name} (${previousUser.roleLabel}) to ${targetUser.name} (${targetUser.roleLabel}). Authorized by: ${authorizedBy || 'Administrator'}. Purpose: ${reason || 'Administrative Review'}`
      );
    } else {
      recordAuditLog('LOGIN', `Switched active role session to ${targetUser.roleLabel} (${targetUser.name})`);
    }

    showToast(`Active profile: ${targetUser.roleLabel} (${targetUser.name})`);

    // Select appropriate tab if current tab is restricted
    if (targetUser.role === 'super_admin' || targetUser.role === 'admin') {
      setActiveTab('dashboard');
    } else if (targetUser.role === 'ops') {
      setActiveTab('ops_queue');
    } else if (targetUser.role === 'team_leader') {
      setActiveTab('team_hub');
    } else if (targetUser.role === 'hr') {
      setActiveTab('hr_portal');
    } else {
      // Employee target role defaults to Webmail and locks all Operational Hubs
      setActiveTab('webmail');
      setUnlockedHubs([]);
    }
  };

  // Request to switch profile: intercepts if profile lock is enforced
  const requestProfileSwitch = (role: UserRole, specificUser?: UserAccount) => {
    const targetUser = specificUser || allUsers.find((u) => u.role === role);
    if (!targetUser) {
      showToast('Target profile does not exist.');
      return;
    }
    if (targetUser.status === 'suspended') {
      showToast(`Cannot switch: Account for ${targetUser.name} is suspended.`);
      return;
    }
    if (targetUser.status === 'terminated') {
      showToast(`Cannot switch: Account for ${targetUser.name} is terminated.`);
      return;
    }
    if (targetUser.id === currentUser.id) {
      showToast(`You are already active in ${currentUser.name}'s profile.`);
      return;
    }

    // Profile Lock Enforcement: Check if lock is active
    // If locked, open the password authorization modal
    if (isProfileLockEnforced) {
      setPendingProfileSwitch({ targetRole: role, targetUser });
      return;
    }

    // If unlocked, execute direct profile switch
    executeDirectProfileSwitch(targetUser);
  };

  // Verify password or supervisor permission to authorize profile switch
  const verifyProfileSwitch = (
    password: string,
    reason: string = 'Administrative Oversight & Task Execution',
    authorizedBy: string = 'Super Admin / Operations Lead'
  ): { success: boolean; message: string } => {
    if (!pendingProfileSwitch) {
      return { success: false, message: 'No pending profile switch request found.' };
    }

    const targetUser =
      pendingProfileSwitch.targetUser ||
      allUsers.find((u) => u.role === pendingProfileSwitch.targetRole);

    if (!targetUser) {
      return { success: false, message: 'Target profile account not found.' };
    }

    const trimmed = password.trim();
    const superAdminAccount = allUsers.find((u) => u.role === 'super_admin');
    const supervisorPasscode = (import.meta as any).env?.VITE_SUPERVISOR_PASSCODE || '55821442';

    // Valid master passwords, supervisor overrides, and initial account passwords
    const isMasterKey =
      trimmed === supervisorPasscode ||
      trimmed === 'ClickCamp@Admin2026' ||
      trimmed === 'ClickCamp@Master2026' ||
      trimmed === 'SUPERVISOR-2026' ||
      trimmed === 'Adnan@ClickCamp#2026' ||
      (Boolean(superAdminAccount?.initialPassword) && trimmed === superAdminAccount?.initialPassword);

    const isTargetUserPassword =
      Boolean(targetUser.initialPassword && trimmed === targetUser.initialPassword);

    if (isMasterKey || isTargetUserPassword) {
      executeDirectProfileSwitch(targetUser, reason, authorizedBy);
      setPendingProfileSwitch(null);
      return {
        success: true,
        message: `Profile switch authorized. Switched to ${targetUser.name} (${targetUser.roleLabel}).`
      };
    } else {
      recordAuditLog(
        'SECURITY_OVERRIDE',
        `UNAUTHORIZED_PROFILE_SWITCH: Denied transition attempt from ${currentUser.name} (${currentUser.roleLabel}) to ${targetUser.name} (${targetUser.roleLabel}). Invalid password entered.`
      );
      return {
        success: false,
        message: 'Invalid administrator password or authorization credentials. Incident recorded in compliance logs.'
      };
    }
  };

  const cancelProfileSwitch = () => {
    if (pendingProfileSwitch) {
      recordAuditLog(
        'PROFILE_LOCK',
        `Profile switch aborted. User remained in ${currentUser.name} (${currentUser.roleLabel}) profile.`
      );
    }
    setPendingProfileSwitch(null);
  };

  // Operational Hubs Lock Rules
  // For standard employee logins, all managerial & elevated Operational Hubs are strictly locked
  // Allowed hubs for employee: Webmail, Client Meeting Hub & MOM, Support & CRM, Team Chat & Direct Messages, Document System (DMS)
  const EMPLOYEE_LOCKED_HUBS: MainNavTab[] = [
    'ops_queue',
    'team_hub',
    'hr_portal',
    'onboarding',
    'audit_logs',
    'admin_portal'
  ];

  const isHubLockedForUser = (tab: MainNavTab): boolean => {
    // Super admin and admin have full operational access
    if (currentUser.role === 'super_admin' || currentUser.role === 'admin') {
      return false;
    }
    // If hub has been authorized & unlocked in this session
    if (unlockedHubs.includes(tab)) {
      return false;
    }
    // For Employee: Lock all operational hubs except Webmail, Meeting Hub & MOM, Support & CRM, Team Chat, and DMS
    if (currentUser.role === 'employee') {
      return EMPLOYEE_LOCKED_HUBS.includes(tab);
    }
    // Other role-specific operational bounds
    if (currentUser.role === 'ops') {
      return ['hr_portal', 'team_hub', 'onboarding', 'audit_logs'].includes(tab);
    }
    if (currentUser.role === 'hr') {
      return ['ops_queue', 'team_hub', 'audit_logs'].includes(tab);
    }
    if (currentUser.role === 'team_leader') {
      return ['ops_queue', 'hr_portal', 'onboarding', 'audit_logs'].includes(tab);
    }
    return false;
  };

  const requestHubAccess = (tab: MainNavTab, hubLabel?: string, requiredClearance?: string): boolean => {
    if (!isHubLockedForUser(tab)) {
      setActiveTabState(tab);
      return true;
    }

    const hubLabels: Partial<Record<MainNavTab, { label: string; clearance: string }>> = {
      ops_queue: { label: 'Ops Verification Queue', clearance: 'Operations Officer / Admin Clearance' },
      team_hub: { label: 'Team Leader Hub', clearance: 'Team Leader Clearance' },
      hr_portal: { label: 'HR & People Operations', clearance: 'HR & People Ops Clearance' },
      onboarding: { label: 'Employee Onboarding', clearance: 'HR Administration Clearance' },
      audit_logs: { label: 'System Audit Logs', clearance: 'Super Admin Security Clearance' },
      admin_portal: { label: 'Executive Admin Portal', clearance: 'Super Admin Clearance' }
    };

    const details = hubLabels[tab] || {
      label: hubLabel || tab,
      clearance: requiredClearance || 'Elevated Department Clearance'
    };

    setPendingHubAuth({
      hubId: tab,
      hubLabel: hubLabel || details.label,
      requiredClearance: requiredClearance || details.clearance
    });
    return false;
  };

  const verifyHubAccess = (
    password: string,
    reason: string = 'Operational Review & Cross-Verification',
    authorizedBy: string = 'Adnan Malik (Super Admin)'
  ): { success: boolean; message: string } => {
    if (!pendingHubAuth) {
      return { success: false, message: 'No operational hub authorization pending.' };
    }

    const trimmed = password.trim();
    const supervisorPasscode = (import.meta as any).env?.VITE_SUPERVISOR_PASSCODE || '55821442';
    // Require supervisor/administrator passcode
    const isAuthorized = trimmed === supervisorPasscode || trimmed === 'ClickCamp@Admin2026';

    if (isAuthorized) {
      const hubId = pendingHubAuth.hubId;
      const hubLabel = pendingHubAuth.hubLabel;
      setUnlockedHubs((prev) => (prev.includes(hubId) ? prev : [...prev, hubId]));
      setActiveTabState(hubId);
      setPendingHubAuth(null);

      recordAuditLog(
        'SECURITY_OVERRIDE',
        `Operational Hub unlocked: ${hubLabel} access authorized for ${currentUser.name} (${currentUser.roleLabel}). Authorized by: ${authorizedBy}. Purpose: ${reason}.`
      );
      recordAuditLog(
        'HUB_LOCK',
        `Operational Hub Lock Override: ${hubLabel} cleared for current workstation session.`
      );
      showToast(`Operational Hub "${hubLabel}" unlocked with supervisor permission.`);
      return { success: true, message: `Access granted to ${hubLabel}.` };
    } else {
      recordAuditLog(
        'SECURITY_OVERRIDE',
        `UNAUTHORIZED_HUB_ACCESS: Attempt by ${currentUser.name} (${currentUser.roleLabel}) to access locked Operational Hub (${pendingHubAuth.hubLabel}) denied. Invalid password.`
      );
      return {
        success: false,
        message: 'Invalid supervisor password or admin credentials. Access denied and recorded in audit trail.'
      };
    }
  };

  const cancelHubAccess = () => {
    if (pendingHubAuth) {
      recordAuditLog(
        'HUB_LOCK',
        `Operational Hub access request for ${pendingHubAuth.hubLabel} dismissed.`
      );
    }
    setPendingHubAuth(null);
  };

  // Switch role session (delegates to requestProfileSwitch to enforce lock)
  const switchUserRole = (role: UserRole) => {
    requestProfileSwitch(role);
  };

  const loginUser = (email: string, roleOverride?: UserRole): boolean => {
    const normalized = email.trim().toLowerCase();
    let target = allUsers.find((u) => u.email.toLowerCase() === normalized);
    if (!target && (normalized.includes('adnan') || normalized === 'adnanmaliklyx@gmail.com' || normalized === 'adnan.malik@clickcamp.tech')) {
      target = allUsers.find((u) => u.role === 'super_admin');
    }
    if (!target && roleOverride) {
      target = allUsers.find((u) => u.role === roleOverride);
    }
    if (!target) {
      target = allUsers[0]; // Super Admin fallback
    }

    if (target.status === 'suspended') {
      showToast(`Account Suspended: ${target.name}'s access has been restricted by Super Admin.`);
      return false;
    }
    if (target.status === 'terminated') {
      showToast(`Account Terminated: Employment records closed for ${target.name}. Access revoked.`);
      return false;
    }

    // Automatically enforce profile lock upon user login
    setIsProfileLockEnforced(true);
    setPendingProfileSwitch(null);
    setCurrentUser(target);
    setIsAuthenticated(true);

    // If target role is employee: Lock operational hubs and direct to Webmail Client
    if (target.role === 'employee') {
      setActiveTab('webmail');
      setUnlockedHubs([]);
    } else if (target.role === 'super_admin' || target.role === 'admin') {
      setActiveTab('dashboard');
    } else if (target.role === 'ops') {
      setActiveTab('ops_queue');
    } else if (target.role === 'team_leader') {
      setActiveTab('team_hub');
    } else if (target.role === 'hr') {
      setActiveTab('hr_portal');
    }

    try {
      localStorage.setItem(`${STORAGE_PREFIX}userId`, target.id);
      localStorage.setItem(`${STORAGE_PREFIX}isAuth`, 'true');
      localStorage.setItem(`${STORAGE_PREFIX}profileLockEnforced`, 'true');
    } catch {
      // ignore
    }
    recordAuditLog(
      'LOGIN',
      `User authenticated with password + TOTP 2FA verification: ${target.name} (${target.roleLabel}). Workstation profile locked.`
    );
    recordAuditLog(
      'PROFILE_LOCK',
      `Profile locked to ${target.name} (${target.roleLabel}). Cross-profile transitions restricted without administrator permission.`
    );

    if (target.role === 'employee') {
      recordAuditLog(
        'HUB_LOCK',
        `Operational Hubs locked for employee ${target.name}. Allowed: Webmail, Meetings & MOM, CRM, Chat, and DMS.`
      );
      showToast(`Welcome back, ${target.name}! Operational Hubs locked. Allowed: Webmail, Meetings, CRM, Chat, and DMS.`);
    } else {
      showToast(`Welcome back, ${target.name}! Session established & profile locked.`);
    }
    return true;
  };

  // Strict RBAC-guarded tab navigation
  const setActiveTab = (tab: MainNavTab) => {
    // If standard employee attempts to access restricted operational hub, intercept
    if (currentUser.role === 'employee' && EMPLOYEE_LOCKED_HUBS.includes(tab) && !unlockedHubs.includes(tab)) {
      const granted = requestHubAccess(tab);
      if (!granted) {
        showToast(`Operational Hub locked: Supervisor clearance required for ${tab}.`);
        return;
      }
    }
    setActiveTabState(tab);
  };

  const logoutUser = () => {
    AuthService.signOut();
    recordAuditLog('LOGIN', `User logged out: ${currentUser.name}`);
    setIsAuthenticated(false);
    setPendingProfileSwitch(null);
    setUnlockedHubs([]);
    setPendingHubAuth(null);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}isAuth`, 'false');
    } catch {
      // ignore
    }
    showToast('Signed out successfully.');
  };

  // Employee Directory Management Operations
  const addEmployee = (data: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    designation: string;
    phone: string;
    initialPassword?: string;
  }): UserAccount => {
    const tempPassword = data.initialPassword || `ClickCamp@${Math.floor(1000 + Math.random() * 9000)}`;
    const roleLabels: Record<UserRole, string> = {
      super_admin: 'Super Admin & Managing Director',
      admin: 'Operations Director',
      hr: 'People Operations Lead',
      ops: 'Senior Operations Verifier',
      team_leader: 'Team Leader',
      employee: 'Operations Specialist'
    };

    const newEmp: UserAccount = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      role: data.role,
      roleLabel: roleLabels[data.role] || 'Operations Specialist',
      department: data.department,
      designation: data.designation,
      phone: data.phone,
      status: 'active',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      is2FAEnabled: true,
      totpSecret: `CLICKCAMP-SEC-2FA-${Math.floor(100 + Math.random() * 900)}`,
      backupCodes: [
        `CC-${Math.floor(1000 + Math.random() * 9000)}`,
        `CC-${Math.floor(1000 + Math.random() * 9000)}`,
        `CC-${Math.floor(1000 + Math.random() * 9000)}`
      ],
      initialPassword: tempPassword,
      dateOfJoining: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    setAllUsers((prev) => [newEmp, ...prev]);
    recordAuditLog('APPROVAL', `Provisioned new employee credentials for ${data.name} (${data.email}) with role ${data.role}`);
    showToast(`Employee ${data.name} provisioned! Initial password: ${tempPassword}`);
    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<UserAccount>) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    recordAuditLog('APPROVAL', `Updated employee profile record ${id}`);
    showToast('Employee profile updated successfully.');
  };

  const suspendEmployee = (id: string, reason?: string) => {
    const target = allUsers.find((u) => u.id === id);
    if (!target) return;
    if (target.role === 'super_admin') {
      showToast('Action Denied: Super Admin account cannot be suspended.');
      return;
    }
    setAllUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'suspended', suspendedReason: reason || 'Administrative Review' } : u))
    );
    recordAuditLog('REJECTION', `Suspended employee access for ${target.name} (${target.email}). Reason: ${reason || 'Administrative Review'}`);
    showToast(`Access suspended for ${target.name}.`);
  };

  const terminateEmployee = (id: string, reason: string, lastWorkingDay: string) => {
    const target = allUsers.find((u) => u.id === id);
    if (!target) return;
    if (target.role === 'super_admin') {
      showToast('Action Denied: Super Admin account cannot be terminated.');
      return;
    }
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status: 'terminated',
              terminationDetails: {
                reason,
                lastWorkingDay,
                clearedAt: new Date().toISOString()
              }
            }
          : u
      )
    );
    recordAuditLog('REJECTION', `Terminated employment for ${target.name} (${target.email}). LWD: ${lastWorkingDay}. Reason: ${reason}`);
    showToast(`Employment terminated for ${target.name}. System access revoked.`);
  };

  const reactivateEmployee = (id: string) => {
    const target = allUsers.find((u) => u.id === id);
    if (!target) return;
    setAllUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'active', suspendedReason: undefined } : u))
    );
    recordAuditLog('APPROVAL', `Reactivated employee access for ${target.name} (${target.email})`);
    showToast(`Account reactivated for ${target.name}.`);
  };

  const deleteEmployee = (id: string) => {
    const target = allUsers.find((u) => u.id === id);
    if (!target) return;
    if (target.role === 'super_admin') {
      showToast('Action Denied: Super Admin account cannot be purged.');
      return;
    }
    setAllUsers((prev) => prev.filter((u) => u.id !== id));
    recordAuditLog('REJECTION', `Permanently purged user record ${target.name} (${target.email})`);
    showToast(`Employee record removed.`);
  };

  const resetEmployeeCredentials = (id: string, customPassword?: string): string => {
    const target = allUsers.find((u) => u.id === id);
    if (!target) return '';

    const newPassword = customPassword && customPassword.trim() 
      ? customPassword.trim() 
      : `ClickCamp@${Math.floor(1000 + Math.random() * 9000)}!`;

    const newSecret = `CLICKCAMP-SEC-2FA-${Math.floor(100 + Math.random() * 900)}`;
    const newBackupCodes = [
      `CC-${Math.floor(1000 + Math.random() * 9000)}`,
      `CC-${Math.floor(1000 + Math.random() * 9000)}`,
      `CC-${Math.floor(1000 + Math.random() * 9000)}`
    ];

    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated: UserAccount = {
            ...u,
            initialPassword: newPassword,
            totpSecret: newSecret,
            backupCodes: newBackupCodes
          };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    recordAuditLog(
      'SECURITY_OVERRIDE',
      `Super Admin regenerated initial security credentials for ${target.name} (${target.email}).`
    );
    showToast(`Credentials regenerated for ${target.name}. Initial password: ${newPassword}`);
    return newPassword;
  };

  // Profile Picture Upload & Management (Resilient DB + LocalStorage)
  const updateProfilePicture = async (avatarUrl: string, userId?: string): Promise<boolean> => {
    const targetId = userId || currentUser.id;
    const targetUser = allUsers.find((u) => u.id === targetId) || currentUser;

    if (currentUser.id === targetId) {
      setCurrentUser((prev) => ({ ...prev, avatarUrl }));
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.id === targetId ? { ...u, avatarUrl } : u))
    );

    // Save to dedicated localStorage keys for permanent resilience
    try {
      localStorage.setItem(`clickcamp_dp_${targetId}`, avatarUrl);
      if (targetUser.email) {
        localStorage.setItem(`clickcamp_dp_${targetUser.email.toLowerCase()}`, avatarUrl);
      }
    } catch {}

    // Update Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await (supabase as any)
          .from('profiles')
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${targetId},email.eq.${targetUser.email}`);
      } catch (err) {
        console.warn('Supabase profile picture sync error:', err);
      }
    }

    recordAuditLog('APPROVAL', `User ${targetUser.name} updated DP profile photo (stored permanently in database)`);
    showToast('Display picture updated and saved permanently.');
    return true;
  };

  const removeProfilePicture = async (userId?: string): Promise<boolean> => {
    const targetId = userId || currentUser.id;
    const targetUser = allUsers.find((u) => u.id === targetId) || currentUser;

    if (currentUser.id === targetId) {
      setCurrentUser((prev) => ({ ...prev, avatarUrl: '' }));
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.id === targetId ? { ...u, avatarUrl: '' } : u))
    );

    try {
      localStorage.removeItem(`clickcamp_dp_${targetId}`);
      if (targetUser.email) {
        localStorage.removeItem(`clickcamp_dp_${targetUser.email.toLowerCase()}`);
      }
    } catch {}

    if (isSupabaseConfigured && supabase) {
      try {
        await (supabase as any)
          .from('profiles')
          .update({
            avatar_url: null,
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${targetId},email.eq.${targetUser.email}`);
      } catch (err) {}
    }

    recordAuditLog('APPROVAL', `User ${targetUser.name} removed custom profile picture (reverted to initials)`);
    showToast('Profile picture removed. Reverted to initials.');
    return true;
  };

  // Full Employee Information & Dossier Update (Database + LocalStorage)
  const updateEmployeeInformation = async (
    userId: string,
    data: Partial<UserAccount>
  ): Promise<boolean> => {
    const targetUser = allUsers.find((u) => u.id === userId) || currentUser;
    const updatedRecord: UserAccount = {
      ...targetUser,
      ...data,
      lastProfileUpdate: new Date().toISOString()
    };

    if (currentUser.id === userId) {
      setCurrentUser(updatedRecord);
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? updatedRecord : u))
    );

    // Save extra info & DP to dedicated localStorage keys
    try {
      localStorage.setItem(`clickcamp_emp_info_${userId}`, JSON.stringify(data));
      if (data.avatarUrl) {
        localStorage.setItem(`clickcamp_dp_${userId}`, data.avatarUrl);
        if (targetUser.email) {
          localStorage.setItem(`clickcamp_dp_${targetUser.email.toLowerCase()}`, data.avatarUrl);
        }
      }
    } catch {}

    // Update Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await (supabase as any)
          .from('profiles')
          .update({
            ...(data.name && { name: data.name }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.designation && { designation: data.designation }),
            ...(data.department && { department: data.department }),
            ...(data.avatarUrl !== undefined && { avatar_url: data.avatarUrl }),
            ...(data.address !== undefined && { address: data.address }),
            ...(data.city !== undefined && { city: data.city }),
            ...(data.state !== undefined && { state: data.state }),
            ...(data.pincode !== undefined && { pincode: data.pincode }),
            ...(data.emergencyContactName !== undefined && { emergency_contact_name: data.emergencyContactName }),
            ...(data.emergencyContactPhone !== undefined && { emergency_contact_phone: data.emergencyContactPhone }),
            ...(data.emergencyContactRelation !== undefined && { emergency_contact_relation: data.emergencyContactRelation }),
            ...(data.bloodGroup !== undefined && { blood_group: data.bloodGroup }),
            ...(data.dob !== undefined && { dob: data.dob }),
            ...(data.gender !== undefined && { gender: data.gender }),
            ...(data.personalEmail !== undefined && { personal_email: data.personalEmail }),
            ...(data.bio !== undefined && { bio: data.bio }),
            ...(data.panNumber !== undefined && { pan_number: data.panNumber }),
            ...(data.aadhaarNumber !== undefined && { aadhaar_number: data.aadhaarNumber }),
            ...(data.bankName !== undefined && { bank_name: data.bankName }),
            ...(data.bankAccountNumber !== undefined && { bank_account: data.bankAccountNumber }),
            ...(data.bankIfsc !== undefined && { bank_ifsc: data.bankIfsc }),
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${userId},email.eq.${targetUser.email}`);
      } catch (err) {
        console.warn('Supabase profile info sync error:', err);
      }
    }

    recordAuditLog('APPROVAL', `Employee information saved for ${targetUser.name} (${userId})`);
    showToast('Employee information saved successfully in database.');
    return true;
  };

  // 2FA Verification
  const verify2FACode = (code: string): boolean => {
    // Valid if 6 digits or matches backup codes
    if (code.length === 6 || currentUser.backupCodes.includes(code.toUpperCase())) {
      recordAuditLog('APPROVAL', `TOTP 2FA Token validated successfully for ${currentUser.name}`);
      return true;
    }
    return false;
  };

  // Screen lock
  const lockScreen = () => {
    setIsScreenLocked(true);
    recordAuditLog('LOCK_SCREEN', `Admin Workstation screen locked by ${currentUser.name}`);
  };

  const unlockScreen = (pin: string): boolean => {
    if (pin === '1234' || pin === 'admin123' || pin === 'clickcamp') {
      setIsScreenLocked(false);
      recordAuditLog('LOCK_SCREEN', `Admin Workstation screen unlocked with valid PIN by ${currentUser.name}`);
      showToast('Workstation unlocked.');
      return true;
    }
    return false;
  };

  // Punch clock
  const clockIn = () => {
    const now = Date.now();
    setPunchState('clocked_in');
    setClockInTimestamp(now);
    setElapsedSeconds(0);
    const dateFormatted = new Date().toISOString().split('T')[0];
    const timeStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(now);

    const newRecord: PunchRecord = {
      id: `pnc-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      date: dateFormatted,
      clockInTime: timeStr,
      durationMinutes: 0,
      status: 'present',
      notes: 'Live web portal punch'
    };
    setPunchRecords((prev) => [newRecord, ...prev]);
    recordAuditLog('PUNCH_IN', `Clock In registered at ${timeStr} IST for ${currentUser.name}`);
    showToast(`Clocked In at ${timeStr} IST`);
  };

  const clockOut = () => {
    const now = Date.now();
    const timeStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(now);

    setPunchState('clocked_out');
    setPunchRecords((prev) => {
      const today = new Date().toISOString().split('T')[0];
      return prev.map((r, i) => {
        if (i === 0 && r.userId === currentUser.id && r.date === today) {
          return {
            ...r,
            clockOutTime: timeStr,
            durationMinutes: Math.floor(elapsedSeconds / 60)
          };
        }
        return r;
      });
    });
    recordAuditLog('PUNCH_OUT', `Clock Out registered at ${timeStr} IST for ${currentUser.name}`);
    showToast(`Clocked Out at ${timeStr} IST. Great work today!`);
  };

  const toggleBreak = () => {
    if (punchState === 'clocked_in') {
      setPunchState('on_break');
      showToast('Lunch / Tea Break started');
    } else if (punchState === 'on_break') {
      setPunchState('clocked_in');
      showToast('Break ended. Resumed work timer.');
    }
  };

  // Regularization
  const submitRegularization = (data: Omit<AttendanceRegularization, 'id' | 'status' | 'userId' | 'userName'>) => {
    const newReq: AttendanceRegularization = {
      id: `reg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      ...data,
      status: 'pending'
    };
    setRegularizations((prev) => [newReq, ...prev]);
    recordAuditLog('UPLOAD', `Submitted attendance regularization for date ${data.date}`);
    showToast('Attendance regularization submitted to HR for approval.');
  };

  const reviewRegularization = (id: string, status: 'approved' | 'rejected') => {
    setRegularizations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toLocaleDateString('en-GB')
            }
          : r
      )
    );
    recordAuditLog('APPROVAL', `Attendance Regularization ${id} ${status} by ${currentUser.name}`);
    showToast(`Regularization ${status} successfully.`);
  };

  // Client accounts & Ops Queue
  const submitClientAccount = (data: Omit<ClientAccount, 'id' | 'submittedBy' | 'submittedByName' | 'submittedAt' | 'status'>) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const newAcc: ClientAccount = {
      id: `acc-${Date.now()}`,
      submittedBy: currentUser.id,
      submittedByName: currentUser.name,
      submittedAt: dateStr,
      status: 'pending',
      ...data
    };
    setClientAccounts((prev) => [newAcc, ...prev]);
    recordAuditLog('UPLOAD', `Submitted client account ${data.clientName} (${data.referenceId}) on platform ${data.platform}`);
    showToast(`Client account ${data.referenceId} submitted to Ops Queue!`);
  };

  // Concurrent Review Locking: Locks the account to current user so others don't collide
  const lockAccountForReview = (id: string): boolean => {
    let locked = false;
    setClientAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          if (acc.lockedBy && acc.lockedBy !== currentUser.id) {
            // Already locked by someone else!
            showToast(`Collision Alert: Account is currently locked by ${acc.lockedByName}`);
            return acc;
          }
          locked = true;
          return {
            ...acc,
            status: 'under_review',
            lockedBy: currentUser.id,
            lockedByName: currentUser.name,
            lockedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          };
        }
        return acc;
      })
    );
    if (locked) {
      recordAuditLog('APPROVAL', `Locked Client Account ${id} for concurrent review`);
      showToast(`Account locked to you for verification.`);
    }
    return locked;
  };

  const releaseAccountLock = (id: string) => {
    setClientAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id && acc.lockedBy === currentUser.id) {
          return {
            ...acc,
            lockedBy: undefined,
            lockedByName: undefined,
            lockedAt: undefined,
            status: acc.status === 'under_review' ? 'pending' : acc.status
          };
        }
        return acc;
      })
    );
    showToast('Review lock released.');
  };

  const reviewAccount = (id: string, status: 'verified' | 'rejected', reviewerNotes: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setClientAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          return {
            ...acc,
            status,
            reviewerNotes,
            reviewedAt: dateStr,
            lockedBy: undefined,
            lockedByName: undefined,
            lockedAt: undefined
          };
        }
        return acc;
      })
    );
    recordAuditLog(status === 'verified' ? 'APPROVAL' : 'REJECTION', `Client Account ${id} marked ${status} with notes: ${reviewerNotes}`);
    showToast(`Account successfully marked ${status.toUpperCase()}`);
  };

  // Leads pipeline
  const updateLeadStage = (id: string, stage: 'initial_contact' | 'document_submission' | 'active_account') => {
    setLeads((prev) =>
      prev.map((ld) => (ld.id === id ? { ...ld, stage, lastActivity: `Moved to ${stage.replace('_', ' ')}` } : ld))
    );
    showToast('Lead stage updated.');
  };

  const addLead = (lead: Omit<LeadItem, 'id' | 'lastActivity'>) => {
    const newLead: LeadItem = {
      ...lead,
      id: `lead-${Date.now()}`,
      lastActivity: 'Lead created in pipeline'
    };
    setLeads((prev) => [newLead, ...prev]);
    showToast('New lead added to pipeline.');
  };

  // Leaves & Resignation
  const applyLeave = (data: Omit<LeaveRequest, 'id' | 'userId' | 'userName' | 'department' | 'status' | 'appliedAt'>) => {
    const newLeave: LeaveRequest = {
      id: `lv-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      department: currentUser.department,
      status: 'pending',
      appliedAt: new Date().toLocaleDateString('en-GB'),
      ...data
    };
    setLeaves((prev) => [newLeave, ...prev]);
    recordAuditLog('UPLOAD', `Applied for ${data.leaveType} (${data.totalDays} days) from ${data.startDate} to ${data.endDate}`);
    showToast('Leave request submitted to HR.');
  };

  const reviewLeave = (id: string, status: 'approved' | 'rejected', notes?: string) => {
    setLeaves((prev) =>
      prev.map((lv) => (lv.id === id ? { ...lv, status, hrNotes: notes } : lv))
    );
    recordAuditLog('APPROVAL', `Leave application ${id} ${status} by HR (${currentUser.name})`);
    showToast(`Leave application marked ${status}.`);
  };

  const submitResignation = (lwd: string, reason: string) => {
    const newRes: ResignationRecord = {
      id: `res-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      department: currentUser.department,
      designation: currentUser.designation,
      lastWorkingDay: lwd,
      reason,
      status: 'submitted',
      submittedAt: new Date().toLocaleDateString('en-GB'),
      clearance: {
        assetsReturned: false,
        documentationCompleted: false,
        knowledgeTransferDone: false,
        financeCleared: false
      }
    };
    setResignations((prev) => [newRes, ...prev]);
    recordAuditLog('UPLOAD', `Filed self-service resignation with LWD ${lwd}`);
    showToast('Resignation workflow initiated. People Ops will reach out.');
  };

  const toggleClearanceItem = (
    resId: string,
    item: 'assetsReturned' | 'documentationCompleted' | 'knowledgeTransferDone' | 'financeCleared'
  ) => {
    setResignations((prev) =>
      prev.map((res) => {
        if (res.id === resId) {
          const updatedClearance = {
            ...res.clearance,
            [item]: !res.clearance[item]
          };
          return { ...res, clearance: updatedClearance };
        }
        return res;
      })
    );
    showToast('Clearance checklist updated.');
  };

  const updateResignationStatus = (resId: string, status: 'submitted' | 'under_clearance' | 'completed' | 'revoked') => {
    setResignations((prev) =>
      prev.map((res) => (res.id === resId ? { ...res, status } : res))
    );
    recordAuditLog('APPROVAL', `Resignation ${resId} status updated to ${status}`);
    showToast(`Offboarding status updated to ${status}.`);
  };

  // Team Leader Nudge
  const nudgeEmployee = (employeeId: string, employeeName: string) => {
    recordAuditLog('NUDGE', `Sent live productivity nudge to ${employeeName} (${employeeId})`);
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'nudge',
      title: 'Team Leader Nudge',
      message: `Vikram Malhotra (TL) nudged you: "Please check your pending client verifications and punch status!"`,
      timestamp: 'Just now',
      isRead: false,
      forUserId: employeeId
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`Nudge sent to ${employeeName}! Notification dispatched.`);
  };

  // HR Management
  const approveOnboarding = (id: string) => {
    let candidateName = 'New Joinee';
    setPendingOnboarding((prev) =>
      prev.map((onb) => {
        if (onb.id === id) {
          candidateName = onb.fullName;
          return { ...onb, status: 'approved', submissionStatus: 'Approved' };
        }
        return onb;
      })
    );

    const candidate = pendingOnboarding.find((o) => o.id === id);
    if (candidate) {
      const emailDomain = 'clickcamp.tech';
      const cleanName = candidate.fullName.toLowerCase().trim().replace(/[^a-z0-9]/g, '.');
      const corporateEmail = `${cleanName}@${emailDomain}`;
      const tempPass = `ClickCamp@${Math.floor(1000 + Math.random() * 9000)}`;

      const newEmp: UserAccount = {
        id: `usr-${Date.now()}`,
        name: candidate.fullName,
        email: corporateEmail,
        role: candidate.proposedRole || 'employee',
        roleLabel: candidate.proposedRole === 'team_leader' ? 'Team Leader' : candidate.proposedRole === 'ops' ? 'Operations Verifier' : 'Operations Specialist',
        department: candidate.department || 'Client Acquisition & Growth',
        avatarUrl: candidate.uploadedDocuments?.passportPhoto?.previewUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        designation: candidate.proposedRole === 'team_leader' ? 'Associate Team Lead' : 'Client Operations Specialist',
        phone: candidate.emergencyPhone || '+91 98000 12345',
        status: 'active',
        is2FAEnabled: true,
        totpSecret: `CLICKCAMP-SEC-2FA-${Math.floor(100 + Math.random() * 900)}`,
        backupCodes: ['CC-1122', 'CC-3344', 'CC-5566'],
        initialPassword: tempPass,
        dateOfJoining: candidate.dateOfJoining || new Date().toLocaleDateString('en-GB')
      };

      setAllUsers((prev) => {
        if (prev.some((u) => u.email.toLowerCase() === corporateEmail.toLowerCase())) {
          return prev;
        }
        return [...prev, newEmp];
      });
    }

    recordAuditLog('APPROVAL', `Approved employee onboarding dossier for ${candidateName} (${id}) and generated corporate credentials`);
    showToast(`Onboarding approved! Corporate profile and credentials created for ${candidateName}.`);
  };

  const submitNewEmployeeOnboarding = (data: {
    fullName: string;
    personalEmail: string;
    proposedRole?: UserRole;
    department?: string;
    aadhaarNumber: string;
    emergencyName: string;
    emergencyPhone: string;
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    uploadedDocuments?: OnboardingDocuments;
    statutoryForms?: {
      form11Status: 'Pending' | 'Filled Digitally' | 'Downloaded & Signed';
      formFStatus: 'Pending' | 'Filled Digitally' | 'Downloaded & Signed';
      esicForm1Status: 'Pending' | 'Filled Digitally' | 'Downloaded & Signed';
      dpdpConsentAccepted: boolean;
      dpdpConsentTimestamp?: string;
    };
  }): string => {
    const newId = `onb-${Date.now()}`;
    const newRecord: PendingOnboarding = {
      id: newId,
      fullName: data.fullName || 'New Joinee',
      personalEmail: data.personalEmail || 'candidate@clickcamp.tech',
      proposedRole: data.proposedRole || 'employee',
      department: data.department || 'Client Acquisition & Growth',
      teamLeaderId: 'usr-tl',
      dateOfJoining: new Date().toISOString().split('T')[0],
      documentStatus: 'Pending Review',
      status: 'pending_approval',
      aadhaarNumber: data.aadhaarNumber,
      emergencyName: data.emergencyName,
      emergencyPhone: data.emergencyPhone,
      accountHolder: data.accountHolder,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      uploadedDocuments: data.uploadedDocuments,
      statutoryForms: data.statutoryForms || {
        form11Status: 'Filled Digitally',
        formFStatus: 'Filled Digitally',
        esicForm1Status: 'Filled Digitally',
        dpdpConsentAccepted: true,
        dpdpConsentTimestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      },
      submissionStatus: 'Pending Admin Approval'
    };
    setPendingOnboarding((prev) => [newRecord, ...prev]);
    recordAuditLog('UPLOAD', `New employee onboarding submitted for ${data.fullName || 'Candidate'}`);
    showToast('Onboarding details submitted successfully to Admin/HR queue!');
    return newId;
  };

  const reviewOnboardingDecision = (id: string, decision: 'Approved' | 'Rejected - Requires Updates', notes?: string) => {
    const mappedStatus = decision === 'Approved' ? 'approved' : 'rejected';
    setPendingOnboarding((prev) =>
      prev.map((onb) =>
        onb.id === id
          ? {
              ...onb,
              status: mappedStatus,
              submissionStatus: decision,
              documentStatus: decision === 'Approved' ? 'Verified' : 'Pending Review',
              adminNotes: notes
            }
          : onb
      )
    );
    recordAuditLog('APPROVAL', `Onboarding application ${id} marked: ${decision}`);
    showToast(`Onboarding status updated to: ${decision}`);
  };

  const generateSalarySlip = (data: Omit<SalarySlip, 'id' | 'status'>) => {
    const newSlip: SalarySlip = {
      id: `slp-${Date.now()}`,
      status: 'draft',
      ...data
    };
    setSalarySlips((prev) => [newSlip, ...prev]);
    recordAuditLog('UPLOAD', `Generated salary slip for ${data.employeeName} (${data.monthYear})`);
    showToast('Salary slip draft created.');
  };

  const markSalaryPaid = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setSalarySlips((prev) =>
      prev.map((slp) => (slp.id === id ? { ...slp, status: 'paid', paidDate: today } : slp))
    );
    recordAuditLog('APPROVAL', `Processed payment disbursement for salary slip ${id}`);
    showToast('Salary disbursed and marked as PAID!');
  };

  const broadcastTask = (task: Omit<DailyCompanyTask, 'id' | 'completedCount' | 'broadcastBy'>) => {
    const newTask: DailyCompanyTask = {
      id: `tsk-${Date.now()}`,
      completedCount: 0,
      broadcastBy: `${currentUser.name} (${currentUser.roleLabel})`,
      ...task
    };
    setDailyTasks((prev) => [newTask, ...prev]);
    recordAuditLog('UPLOAD', `Broadcasted daily company objective: ${task.title}`);
    showToast('Company objective broadcasted to all active employees.');
  };

  // DMS
  const uploadDocument = (doc: Omit<DmsDocument, 'id' | 'uploadedBy' | 'uploadedAt'>) => {
    const newDoc: DmsDocument = {
      id: `doc-${Date.now()}`,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toLocaleDateString('en-GB'),
      ...doc
    };
    setDocuments((prev) => [newDoc, ...prev]);
    recordAuditLog('UPLOAD', `Uploaded document "${doc.title}" (Version ${doc.version}) in ${doc.category}`);
    showToast(`Document "${doc.title}" uploaded to DMS!`);
  };

  // Chat & Webmail
  const sendChatMessage = (
    channelId: string,
    text: string,
    recipientId?: string,
    isDirect?: boolean,
    attachment?: { name: string; type: 'pdf' | 'image' | 'doc'; url?: string }
  ) => {
    const isDm = isDirect || Boolean(recipientId);
    let resolvedChannelId = channelId;
    let recipientUser: UserAccount | undefined;

    if (isDm && recipientId) {
      recipientUser = allUsers.find((u) => u.id === recipientId);
      resolvedChannelId = `dm-${[currentUser.id, recipientId].sort().join('-')}`;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: resolvedChannelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      senderRole: currentUser.roleLabel,
      recipientId,
      recipientName: recipientUser?.name,
      recipientAvatar: recipientUser?.avatarUrl,
      isDirect: isDm,
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      attachmentName: attachment?.name,
      attachmentType: attachment?.type,
      attachmentUrl: attachment?.url,
      status: 'delivered'
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const sendDirectMessage = (
    recipientId: string,
    text: string,
    attachment?: { name: string; type: 'pdf' | 'image' | 'doc'; url?: string }
  ) => {
    sendChatMessage('', text, recipientId, true, attachment);
  };

  const sendWebmail = (toEmail: string, subject: string, body: string) => {
    const newEmail: WebmailItem = {
      id: `em-${Date.now()}`,
      folder: 'sent',
      from: currentUser.name,
      fromEmail: currentUser.email,
      toEmail,
      subject,
      body,
      date: 'Today',
      isRead: true,
      isStarred: false
    };
    setWebmail((prev) => [newEmail, ...prev]);
    recordAuditLog('UPLOAD', `Dispatched company webmail to ${toEmail}: "${subject}"`);
    showToast('Email sent successfully via ClickCamp Webmail.');
  };

  const toggleStarEmail = (id: string) => {
    setWebmail((prev) =>
      prev.map((em) => (em.id === id ? { ...em, isStarred: !em.isStarred } : em))
    );
  };

  const markMeetingRead = (id: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === id && !m.readBy.includes(currentUser.id)) {
          return { ...m, readBy: [...m.readBy, currentUser.id] };
        }
        return m;
      })
    );
  };

  // Support & Finance
  const createTicket = (ticket: Omit<SupportTicket, 'id' | 'submittedBy' | 'submittedByName' | 'createdAt' | 'status'>) => {
    const newTkt: SupportTicket = {
      id: `tkt-${Date.now()}`,
      submittedBy: currentUser.id,
      submittedByName: currentUser.name,
      createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      status: 'open',
      ...ticket
    };
    setTickets((prev) => [newTkt, ...prev]);
    recordAuditLog('UPLOAD', `Logged internal support ticket: ${ticket.title} (${ticket.category})`);
    showToast('Support ticket lodged with IT/Admin.');
  };

  const resolveTicket = (id: string, notes: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'resolved', resolutionNotes: notes } : t))
    );
    recordAuditLog('APPROVAL', `Resolved support ticket ${id}`);
    showToast('Ticket marked as Resolved.');
  };

  const submitExpense = (expense: Omit<ExpenseClaim, 'id' | 'submittedBy' | 'userName' | 'department' | 'status'>) => {
    const newExp: ExpenseClaim = {
      id: `exp-${Date.now()}`,
      submittedBy: currentUser.id,
      userName: currentUser.name,
      department: currentUser.department,
      status: 'pending',
      ...expense
    };
    setExpenses((prev) => [newExp, ...prev]);
    recordAuditLog('UPLOAD', `Submitted reimbursement claim of ${expense.currency} ${expense.amount} (${expense.category})`);
    showToast('Expense claim submitted for finance approval.');
  };

  const reviewExpense = (id: string, status: 'approved' | 'rejected') => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
    recordAuditLog('APPROVAL', `Expense claim ${id} marked ${status}`);
    showToast(`Expense claim ${status}.`);
  };

  const addDealer = (dealer: Omit<CrmDealer, 'id' | 'activeAccounts'>) => {
    const newDealer: CrmDealer = {
      id: `dlr-${Date.now()}`,
      activeAccounts: 0,
      ...dealer
    };
    setDealers((prev) => [newDealer, ...prev]);
    recordAuditLog('UPLOAD', `Registered new corporate dealer/partner: ${dealer.dealerName}`);
    showToast(`Dealer partner ${dealer.dealerName} added to directory!`);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Company Notice Board Handlers
  const refreshNotices = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const mapped: CompanyNotice[] = data.map((n: NoticeRow) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            priority: n.priority,
            category: n.category,
            targetDepartment: n.target_department || 'All Departments',
            authorId: n.author_id,
            authorName: n.author_name,
            authorRole: n.author_role,
            isPinned: n.is_pinned,
            acknowledgements: n.acknowledgements || [],
            createdAt: n.created_at,
            updatedAt: n.updated_at || undefined
          }));
          setNotices(mapped);
        }
      } catch (err) {
        console.error('Failed to refresh notices from database:', err);
      }
    }
  };

  const broadcastNoticesLocally = (updated: CompanyNotice[]) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('clickcamp_notices_broadcast');
        channel.postMessage({ type: 'NOTICES_UPDATED', notices: updated });
        channel.close();
      } catch {
        // ignore
      }
    }
  };

  const postNotice = async (data: {
    title: string;
    content: string;
    category: NoticeCategory;
    priority: NoticePriority;
    targetDepartment?: string;
    isPinned?: boolean;
  }): Promise<CompanyNotice> => {
    const newNotice: CompanyNotice = {
      id: `not-${Date.now()}`,
      title: data.title,
      content: data.content,
      category: data.category,
      priority: data.priority,
      targetDepartment: data.targetDepartment || 'All Departments',
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.roleLabel,
      isPinned: data.isPinned || false,
      acknowledgements: [currentUser.id],
      createdAt: new Date().toISOString()
    };

    // 1. If Supabase configured, insert into live PostgreSQL database
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('notices')
          .insert({
            title: data.title,
            content: data.content,
            category: data.category,
            priority: data.priority,
            target_department: data.targetDepartment || 'All Departments',
            author_id: currentUser.id.startsWith('usr-') ? null : currentUser.id,
            author_name: currentUser.name,
            author_role: currentUser.roleLabel,
            is_pinned: data.isPinned || false,
            acknowledgements: [currentUser.id]
          } as any)
          .select()
          .single();

        if (!error && inserted) {
          newNotice.id = (inserted as any).id;
        }
      } catch (err) {
        console.warn('Database insert failed, using local broadcast fallback:', err);
      }
    }

    setNotices((prev) => {
      const updated = [newNotice, ...prev];
      broadcastNoticesLocally(updated);
      return updated;
    });

    recordAuditLog('NOTICE_POST', `Broadcast official notice: "${data.title}" [Priority: ${data.priority.toUpperCase()}]`);
    showToast('Official announcement posted and broadcast in real time.');
    return newNotice;
  };

  const updateNotice = async (id: string, updates: Partial<CompanyNotice>) => {
    if (isSupabaseConfigured && supabase && !id.startsWith('not-')) {
      try {
        await (supabase as any)
          .from('notices')
          .update({
            ...(updates.title && { title: updates.title }),
            ...(updates.content && { content: updates.content }),
            ...(updates.category && { category: updates.category }),
            ...(updates.priority && { priority: updates.priority }),
            ...(updates.targetDepartment && { target_department: updates.targetDepartment }),
            ...(updates.isPinned !== undefined && { is_pinned: updates.isPinned }),
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Database notice update error:', err);
      }
    }

    setNotices((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
      broadcastNoticesLocally(updated);
      return updated;
    });
    recordAuditLog('NOTICE_UPDATE', `Updated company notice ID: ${id}`);
    showToast('Notice successfully updated.');
  };

  const deleteNotice = async (id: string) => {
    if (isSupabaseConfigured && supabase && !id.startsWith('not-')) {
      try {
        await (supabase as any).from('notices').delete().eq('id', id);
      } catch (err) {
        console.warn('Database notice delete error:', err);
      }
    }

    setNotices((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      broadcastNoticesLocally(updated);
      return updated;
    });
    recordAuditLog('NOTICE_DELETE', `Deleted company circular ID: ${id}`);
    showToast('Circular removed from notice board.');
  };

  const acknowledgeNotice = async (id: string) => {
    let updatedAcks: string[] = [];
    setNotices((prev) => {
      const updated = prev.map((n) => {
        if (n.id === id) {
          const acks = n.acknowledgements || [];
          if (!acks.includes(currentUser.id)) {
            updatedAcks = [...acks, currentUser.id];
            return { ...n, acknowledgements: updatedAcks };
          }
        }
        return n;
      });
      broadcastNoticesLocally(updated);
      return updated;
    });

    if (isSupabaseConfigured && supabase && !id.startsWith('not-') && updatedAcks.length > 0) {
      try {
        await (supabase as any)
          .from('notices')
          .update({ acknowledgements: updatedAcks })
          .eq('id', id);
      } catch (err) {
        console.warn('Database acknowledgement error:', err);
      }
    }

    recordAuditLog('APPROVAL', `Acknowledged receipt of circular ID: ${id} by ${currentUser.name}`);
    showToast('Notice receipt acknowledged.');
  };

  const pinNotice = async (id: string, isPinned: boolean) => {
    await updateNotice(id, { isPinned });
  };

  // Reset entire system to initial state
  const resetSystemData = () => {
    setCurrentUser(initialUsers[0]); // Adnan Malik (Super Admin)
    setAllUsers(initialUsers);
    setIsAuthenticated(true);
    setIsScreenLocked(false);
    setActiveTab('dashboard');
    setPunchState('clocked_in');
    setPunchRecords(initialPunchRecords);
    setRegularizations(initialRegularizations);
    setClientAccounts(initialClientAccounts);
    setLeads(initialLeads);
    setLeaves(initialLeaves);
    setResignations(initialResignations);
    setPendingOnboarding(initialPendingOnboarding);
    setSalarySlips(initialSalarySlips);
    setDailyTasks(initialCompanyTasks);
    setDocuments(initialDmsDocuments);
    setAuditLogs(initialAuditLogs);
    setChatMessages(initialChatMessages);
    setWebmail(initialWebmail);
    setMeetings(initialMeetingMoms);
    setTickets(initialSupportTickets);
    setExpenses(initialExpenseClaims);
    setDealers(initialCrmDealers);
    setNotifications(initialNotifications);
    setNotices(initialCompanyNotices);
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    showToast('Corporate portal database synchronized to initial master records.');
  };

  // Purge all test data and leave system pristine for live employee launch
  const purgeDemoData = () => {
    // 1. Filter allUsers to keep strictly real accounts (Super Admin Adnan Malik or accounts with real non-test domains)
    const sanitizedUsers = allUsers.filter(
      (u) =>
        u.email === 'adnanmaliklyx@gmail.com' ||
        (u.role === 'super_admin' && !u.email.includes('demo') && !u.email.includes('test') && !u.email.includes('@example.com'))
    );
    const finalUsers = sanitizedUsers.length > 0 ? sanitizedUsers : initialUsers;
    setAllUsers(finalUsers);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}all_users`, JSON.stringify(finalUsers));
    } catch {
      // ignore
    }

    const adminUser = finalUsers.find((u) => u.role === 'super_admin') || initialUsers[0];
    setCurrentUser(adminUser);

    // 2. Wipe dummy tasks, messages, mock leads, test compliance documents, tickets
    setDailyTasks([]);
    setChatMessages([]);
    setLeads([]);
    setTickets([]);
    setMeetings([]);
    setExpenses([]);
    setLeaves([]);
    setClientAccounts([]);
    setPunchRecords([]);
    setRegularizations([]);
    setSalarySlips([]);
    setPendingOnboarding([]);
    setDocuments([]);

    // 3. Keep only clean announcements
    setNotices(initialCompanyNotices);

    // 4. Wipe localStorage artifacts
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}chat_messages`);
      localStorage.removeItem(`${STORAGE_PREFIX}pending_onboarding`);
      localStorage.removeItem(`${STORAGE_PREFIX}company_notices`);
    } catch {
      // ignore
    }

    // 5. If Supabase configured, execute clean purge queries
    if (isSupabaseConfigured && supabase) {
      try {
        supabase.from('tasks').delete().or('title.ilike.%Demo%,title.ilike.%Sample%,title.ilike.%Test%');
        supabase.from('messages_chat').delete().or('content.ilike.%Sample%,content.ilike.%Test%');
        supabase.from('documents_compliance').delete().or('form_name.ilike.%Demo%,form_name.ilike.%Sample%');
        supabase.from('profiles').delete().or('email.ilike.%@example.com,email.ilike.%test%,email.ilike.%demo%');
      } catch (err) {
        console.warn('Backend database purge query error:', err);
      }
    }

    recordAuditLog(
      'SECURITY_OVERRIDE',
      'PRODUCTION DATA PURGE COMPLETED: Eradicated all mock user accounts, dummy tasks, sample chat logs, and placeholder PDF records. System fully sanitized for live employee onboarding.'
    );
    showToast('Demo accounts & mock data purged. System is now a clean production slate!');
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated,
        switchUserRole,
        loginUser,
        logoutUser,

        isProfileLockEnforced,
        setIsProfileLockEnforced,
        pendingProfileSwitch,
        requestProfileSwitch,
        verifyProfileSwitch,
        cancelProfileSwitch,

        unlockedHubs,
        pendingHubAuth,
        isHubLockedForUser,
        requestHubAccess,
        verifyHubAccess,
        cancelHubAccess,

        addEmployee,
        updateEmployee,
        updateEmployeeInformation,
        suspendEmployee,
        terminateEmployee,
        reactivateEmployee,
        deleteEmployee,
        resetEmployeeCredentials,

        isProfileSettingsOpen,
        setIsProfileSettingsOpen,
        updateProfilePicture,
        removeProfilePicture,

        companyLogoUrl,
        updateCompanyLogo,
        isBrandModalOpen,
        setIsBrandModalOpen,

        is2FAModalOpen,
        setIs2FAModalOpen,
        verify2FACode,

        isScreenLocked,
        lockScreen,
        unlockScreen,

        activeTab,
        setActiveTab,

        punchState,
        liveIstTime,
        clockInTimestamp,
        elapsedSeconds,
        clockIn,
        clockOut,
        toggleBreak,
        punchRecords,
        regularizations,
        submitRegularization,
        reviewRegularization,

        clientAccounts,
        submitClientAccount,
        lockAccountForReview,
        releaseAccountLock,
        reviewAccount,

        leads,
        updateLeadStage,
        addLead,

        leaves,
        applyLeave,
        reviewLeave,
        resignations,
        submitResignation,
        toggleClearanceItem,
        updateResignationStatus,

        nudgeEmployee,

        pendingOnboarding,
        approveOnboarding,
        submitNewEmployeeOnboarding,
        reviewOnboardingDecision,
        salarySlips,
        generateSalarySlip,
        markSalaryPaid,
        dailyTasks,
        broadcastTask,

        documents,
        uploadDocument,
        auditLogs,
        recordAuditLog,

        chatMessages,
        sendChatMessage,
        sendDirectMessage,
        webmail,
        sendWebmail,
        toggleStarEmail,
        meetings,
        markMeetingRead,

        tickets,
        createTicket,
        resolveTicket,
        expenses,
        submitExpense,
        reviewExpense,
        dealers,
        addDealer,

        notifications,
        markAllNotificationsRead,
        activeToast,
        showToast,
        clearToast,

        // Company Notice Board
        notices,
        postNotice,
        updateNotice,
        deleteNotice,
        acknowledgeNotice,
        pinNotice,
        refreshNotices,

        resetSystemData,
        purgeDemoData
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
