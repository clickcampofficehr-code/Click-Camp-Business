export type UserRole = 'super_admin' | 'admin' | 'hr' | 'ops' | 'team_leader' | 'employee';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  teamId?: string;
  avatarUrl: string;
  designation: string;
  phone: string;
  status: 'active' | 'suspended' | 'terminated';
  is2FAEnabled: boolean;
  totpSecret: string;
  backupCodes: string[];
  initialPassword?: string;
  passwordHash?: string;
  dateOfJoining?: string;
  suspendedReason?: string;
  terminationDetails?: {
    reason: string;
    lastWorkingDay: string;
    clearedAt?: string;
  };
  // Detailed Employee Information & Dossier (Persistent in DB & LocalStorage)
  personalEmail?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say' | string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bio?: string;
  lastProfileUpdate?: string;
}

export type MainNavTab =
  | 'dashboard'
  | 'kanban'
  | 'admin_portal'
  | 'ops_queue'
  | 'team_hub'
  | 'hr_portal'
  | 'onboarding'
  | 'dms'
  | 'chat'
  | 'webmail'
  | 'meetings'
  | 'support_finance'
  | 'resources'
  | 'audit_logs';

export type PunchState = 'clocked_out' | 'clocked_in' | 'on_break';

export interface PunchRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // Live IST formatted string
  clockOutTime?: string;
  durationMinutes: number;
  status: 'present' | 'half_day' | 'absent' | 'weekend';
  notes?: string;
}

export interface AttendanceRegularization {
  id: string;
  userId: string;
  userName: string;
  date: string;
  reason: 'Forgot to Punch' | 'Biometric/System Glitch' | 'Official Field Visit' | 'Network Issue';
  requestedIn: string;
  requestedOut: string;
  explanation: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}

export type ClientVerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';

export interface ClientAccount {
  id: string;
  clientName: string;
  platform: 'Google Ads' | 'Meta Ads' | 'Shopify' | 'AWS' | 'Telegram' | 'Affiliate Network' | 'Custom CRM';
  referenceId: string;
  clientPhone: string;
  dealValue: number; // in INR
  submittedBy: string; // user id
  submittedByName: string;
  submittedAt: string;
  status: ClientVerificationStatus;
  lockedBy?: string; // reviewer user id for concurrent review locking
  lockedByName?: string;
  lockedAt?: string;
  reviewerNotes?: string;
  reviewedAt?: string;
}

export interface LeadItem {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: string;
  stage: 'initial_contact' | 'document_submission' | 'active_account';
  assignedTo: string;
  value: number;
  lastActivity: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  department: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Emergency Leave';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  hrNotes?: string;
}

export interface ResignationRecord {
  id: string;
  userId: string;
  userName: string;
  department: string;
  designation: string;
  lastWorkingDay: string;
  reason: string;
  status: 'submitted' | 'under_clearance' | 'completed' | 'revoked';
  submittedAt: string;
  clearance: {
    assetsReturned: boolean;
    documentationCompleted: boolean;
    knowledgeTransferDone: boolean;
    financeCleared: boolean;
  };
}

export interface UploadedDocFile {
  name: string;
  size?: string;
  type: 'pdf' | 'image';
  previewUrl?: string;
  uploadedAt: string;
}

export interface OnboardingDocuments {
  hasPriorExperience: boolean;
  panCard?: UploadedDocFile;
  creditScore?: UploadedDocFile;
  addressProofFront?: UploadedDocFile;
  addressProofBack?: UploadedDocFile;
  passportPhoto?: UploadedDocFile;
  // Prior work experience documents
  resume?: UploadedDocFile;
  previousOfferLetter?: UploadedDocFile;
  salarySlips?: UploadedDocFile;
  relievingLetter?: UploadedDocFile;
}

export interface PendingOnboarding {
  id: string;
  fullName: string;
  personalEmail: string;
  proposedRole: UserRole;
  department: string;
  teamLeaderId: string;
  dateOfJoining: string;
  documentStatus: 'Verified' | 'Pending Review';
  status: 'pending_approval' | 'approved' | 'rejected';
  aadhaarNumber?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  accountHolder?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  uploadedDocuments?: OnboardingDocuments;
  statutoryForms?: {
    form11Status: 'Pending' | 'Filled Digitally' | 'Downloaded & Signed';
    formFStatus: 'Pending' | 'Filled Digitally' | 'Downloaded & Signed';
    esicForm1Status: 'Pending' | 'Filled Digitally' | 'Downloaded & Signed';
    dpdpConsentAccepted: boolean;
    dpdpConsentTimestamp?: string;
  };
  submissionStatus?: 'Pending Submission' | 'Pending Admin Approval' | 'Approved' | 'Rejected - Requires Updates';
  adminNotes?: string;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  monthYear: string;
  baseSalary: number;
  performanceCommission: number;
  pfDeduction: number;
  tdsDeduction: number;
  netPayout: number;
  status: 'draft' | 'paid';
  paidDate?: string;
}

export interface DailyCompanyTask {
  id: string;
  title: string;
  department: string;
  targetCount: number;
  completedCount: number;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  broadcastBy: string;
}

export interface DmsDocument {
  id: string;
  title: string;
  category: 'HR' | 'Engineering' | 'Legal' | 'Operations' | 'Finance';
  version: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  fileType: string;
}

export interface ProfileSwitchRequest {
  targetRole: UserRole;
  targetUser?: UserAccount;
}

export interface PendingHubAuth {
  hubId: MainNavTab;
  hubLabel: string;
  requiredClearance: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action:
    | 'UPLOAD'
    | 'VIEW'
    | 'DOWNLOAD'
    | 'APPROVAL'
    | 'REJECTION'
    | 'LOGIN'
    | 'PUNCH_IN'
    | 'PUNCH_OUT'
    | 'LOCK_SCREEN'
    | 'NUDGE'
    | 'SECURITY_OVERRIDE'
    | 'PROFILE_LOCK'
    | 'HUB_LOCK'
    | 'NOTICE_POST'
    | 'NOTICE_UPDATE'
    | 'NOTICE_DELETE';
  details: string;
  ipAddress: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  text: string;
  timestamp: string;
  recipientId?: string;
  recipientName?: string;
  recipientAvatar?: string;
  isDirect?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  attachmentName?: string;
  attachmentType?: 'pdf' | 'image' | 'doc';
  attachmentUrl?: string;
}

export interface WebmailItem {
  id: string;
  folder: 'inbox' | 'sent' | 'starred' | 'trash';
  from: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
}

export interface MeetingMom {
  id: string;
  title: string;
  date: string;
  time: string;
  organizer: string;
  attendees: string[];
  keyDecisions: string[];
  actionItems: { task: string; owner: string; status: 'pending' | 'done' }[];
  readBy: string[];
}

export interface SupportTicket {
  id: string;
  title: string;
  category: 'IT Support' | 'HR Query' | 'Admin & Facilities';
  priority: 'High' | 'Medium' | 'Low';
  submittedBy: string;
  submittedByName: string;
  createdAt: string;
  status: 'open' | 'in_progress' | 'resolved';
  resolutionNotes?: string;
}

export interface ExpenseClaim {
  id: string;
  submittedBy: string;
  userName: string;
  department: string;
  category: 'Travel & Commute' | 'Client Meals' | 'Hardware & Supplies' | 'Software Subscriptions';
  amount: number;
  currency: 'INR' | 'USD';
  receiptRef: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface CrmDealer {
  id: string;
  dealerName: string;
  partnerType: 'Tier 1 Elite' | 'Direct Dealer' | 'Franchise Partner' | 'Channel Partner';
  contactPerson: string;
  phone: string;
  email: string;
  region: string;
  activeAccounts: number;
  contractStatus: 'Active' | 'Pending Renewal' | 'Under Review';
}

export interface AppNotification {
  id: string;
  type: 'leave' | 'verification' | 'nudge' | 'payroll' | 'security' | 'ticket' | 'task';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  forRole?: UserRole;
  forUserId?: string;
}

export type NoticePriority = 'urgent' | 'high' | 'normal' | 'info';
export type NoticeCategory = 'General' | 'Operations' | 'HR & Policy' | 'System Maintenance' | 'Holiday & Event';

export interface CompanyNotice {
  id: string;
  title: string;
  content: string;
  priority: NoticePriority;
  category: NoticeCategory;
  targetDepartment: string; // 'All' or specific e.g. 'Operations & Verification', 'Engineering'
  authorId: string;
  authorName: string;
  authorRole: string;
  isPinned: boolean;
  acknowledgements: string[]; // user IDs who acknowledged receipt
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// KANBAN & PROJECT VELOCITY ANALYTICS TYPES
// ==========================================

export type KanbanTaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type KanbanPriority = 'urgent' | 'high' | 'medium' | 'low';
export type KanbanCategory = 'Feature' | 'Bug' | 'Improvement' | 'Security' | 'DevOps';

export interface KanbanProject {
  id: string;
  name: string;
  key: string;
  description: string;
  leadId: string;
  leadName: string;
  leadAvatar?: string;
  status: 'active' | 'planning' | 'completed' | 'on_hold';
  currentSprintId: string;
  startDate: string;
  targetDate: string;
  budgetInr?: number;
}

export interface KanbanSprint {
  id: string;
  projectId: string;
  name: string;
  status: 'active' | 'completed' | 'future';
  startDate: string;
  endDate: string;
  goal: string;
  committedPoints: number;
  completedPoints: number;
}

export interface KanbanTask {
  id: string;
  projectId: string;
  sprintId: string;
  code: string;
  title: string;
  description: string;
  status: KanbanTaskStatus;
  priority: KanbanPriority;
  storyPoints: number;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  assigneeRole: string;
  category: KanbanCategory;
  createdAt: string;
  completedAt?: string;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
}

export interface VelocityDataPoint {
  sprintName: string;
  sprintId: string;
  committedPoints: number;
  completedPoints: number;
  velocityRate: number; // percentage
  movingAverage: number;
}

export interface TaskThroughputDataPoint {
  date: string;
  dayLabel: string;
  completedTasks: number;
  createdTasks: number;
  cumulativeCompleted: number;
}

export interface CumulativeFlowDataPoint {
  date: string;
  dayLabel: string;
  done: number;
  inReview: number;
  inProgress: number;
  todo: number;
  backlog: number;
}

export interface BurndownDataPoint {
  day: string;
  idealRemaining: number;
  actualRemaining: number;
}


