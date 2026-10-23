import {
  UserAccount,
  PunchRecord,
  AttendanceRegularization,
  ClientAccount,
  LeadItem,
  LeaveRequest,
  ResignationRecord,
  PendingOnboarding,
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
  CompanyNotice
} from '../types';

export const initialUsers: UserAccount[] = [
  {
    id: 'usr-superadmin',
    name: 'Adnan Malik',
    email: 'adnan.malik@clickcamp.site',
    personalEmail: 'adnanmaliklyx@gmail.com',
    role: 'super_admin',
    roleLabel: 'Super Admin & Managing Director',
    department: 'Executive Leadership & Governance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    designation: 'Managing Director & Super Admin',
    phone: '+91 98765 00001',
    status: 'active',
    is2FAEnabled: true,
    totpSecret: 'CLICKCAMP-SEC-2FA-SUPERADMIN-9901',
    backupCodes: ['CC-9901', 'CC-8822', 'CC-7733'],
    initialPassword: 'Adnan@ClickCamp#2026',
    passwordHash: '$2a$12$K8xY0uQxJ7Z6eM5N4P3O2.vY9M4lK8X6P1B0LdF9pZ0K4wY5vS',
    dateOfJoining: '01 Jan 2024',
    dob: '1988-06-15',
    gender: 'Male',
    bloodGroup: 'O+',
    address: 'Tower 4, Penthouse 18B, Prestige High Fields, Financial District',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    emergencyContactName: 'Fatima Malik',
    emergencyContactPhone: '+91 98765 00099',
    emergencyContactRelation: 'Spouse',
    panNumber: 'ABCDE1234F',
    aadhaarNumber: 'XXXX-XXXX-9901',
    bankName: 'HDFC Bank Ltd',
    bankAccountNumber: '50100482910123',
    bankIfsc: 'HDFC0001234',
    bio: 'Founder and Managing Director overseeing ClickCamp business operations, executive technology strategies, and statutory governance.'
  }
];

export const mockUsers = initialUsers;

export const initialPunchRecords: PunchRecord[] = [
  {
    id: 'pnc-01',
    userId: 'usr-emp',
    userName: 'Rahul Verma',
    date: '2026-09-14',
    clockInTime: '09:32 AM',
    durationMinutes: 245,
    status: 'present',
    notes: 'Regular on-time punch'
  },
  {
    id: 'pnc-02',
    userId: 'usr-emp',
    userName: 'Rahul Verma',
    date: '2026-09-13',
    clockInTime: '09:30 AM',
    clockOutTime: '06:35 PM',
    durationMinutes: 545,
    status: 'present'
  },
  {
    id: 'pnc-03',
    userId: 'usr-emp',
    userName: 'Rahul Verma',
    date: '2026-09-12',
    clockInTime: '09:45 AM',
    clockOutTime: '02:00 PM',
    durationMinutes: 255,
    status: 'half_day',
    notes: 'Personal afternoon commitment'
  },
  {
    id: 'pnc-04',
    userId: 'usr-emp',
    userName: 'Rahul Verma',
    date: '2026-09-10',
    clockInTime: '09:28 AM',
    clockOutTime: '06:40 PM',
    durationMinutes: 552,
    status: 'present'
  },
  {
    id: 'pnc-05',
    userId: 'usr-emp',
    userName: 'Rahul Verma',
    date: '2026-09-09',
    clockInTime: '09:20 AM',
    clockOutTime: '06:30 PM',
    durationMinutes: 550,
    status: 'present'
  }
];

export const initialRegularizations: AttendanceRegularization[] = [
  {
    id: 'reg-01',
    userId: 'usr-emp',
    userName: 'Rahul Verma',
    date: '2026-09-11',
    reason: 'Biometric/System Glitch',
    requestedIn: '09:30 AM',
    requestedOut: '06:30 PM',
    explanation: 'Campus biometric reader was offline for morning sync. Punched with team leader verification.',
    status: 'pending'
  }
];

export const initialClientAccounts: ClientAccount[] = [
  {
    id: 'acc-101',
    clientName: 'Nexus E-Commerce Ltd',
    platform: 'Meta Ads',
    referenceId: 'REF-CC-90214',
    clientPhone: '+91 98200 44120',
    dealValue: 185000,
    submittedBy: 'usr-emp',
    submittedByName: 'Rahul Verma',
    submittedAt: '2026-09-14 10:15 AM',
    status: 'pending'
  },
  {
    id: 'acc-102',
    clientName: 'Apex Logistics SaaS',
    platform: 'Google Ads',
    referenceId: 'REF-CC-88319',
    clientPhone: '+91 99100 22910',
    dealValue: 340000,
    submittedBy: 'usr-emp',
    submittedByName: 'Rahul Verma',
    submittedAt: '2026-09-14 11:30 AM',
    status: 'under_review',
    lockedBy: 'usr-ops',
    lockedByName: 'Rohan Gupta',
    lockedAt: '2026-09-14 11:45 AM',
    reviewerNotes: 'Validating GSTIN certificate and telephone confirmation.'
  },
  {
    id: 'acc-103',
    clientName: 'SwiftPay Fintech Solutions',
    platform: 'AWS',
    referenceId: 'REF-CC-77102',
    clientPhone: '+91 97120 33491',
    dealValue: 520000,
    submittedBy: 'usr-emp',
    submittedByName: 'Rahul Verma',
    submittedAt: '2026-09-13 03:20 PM',
    status: 'verified',
    reviewedAt: '2026-09-13 04:45 PM',
    reviewerNotes: 'Client identity and prepaid billing agreement verified.'
  },
  {
    id: 'acc-104',
    clientName: 'Kaveri Herbals Online',
    platform: 'Shopify',
    referenceId: 'REF-CC-66410',
    clientPhone: '+91 96190 88210',
    dealValue: 120000,
    submittedBy: 'usr-emp',
    submittedByName: 'Rahul Verma',
    submittedAt: '2026-09-12 01:10 PM',
    status: 'rejected',
    reviewedAt: '2026-09-12 03:00 PM',
    reviewerNotes: 'Phone number unreachable and invalid shop domain registered.'
  }
];

export const initialLeads: LeadItem[] = [
  {
    id: 'lead-01',
    name: 'Sunil Mehta',
    company: 'Zenith Retails',
    phone: '+91 98330 11200',
    email: 'sunil@zenithretail.in',
    source: 'Direct Inbound',
    stage: 'initial_contact',
    assignedTo: 'Rahul Verma',
    value: 150000,
    lastActivity: 'Spoke with marketing director on introductory campaign.'
  },
  {
    id: 'lead-02',
    name: 'Divya Iyer',
    company: 'Krypton Media Agency',
    phone: '+91 97180 55430',
    email: 'divya@krypton.agency',
    source: 'Partner Referral',
    stage: 'document_submission',
    assignedTo: 'Rahul Verma',
    value: 290000,
    lastActivity: 'Awaiting PAN and business registration documents.'
  },
  {
    id: 'lead-03',
    name: 'Sameer Rao',
    company: 'BlueWave Mobility',
    phone: '+91 98450 77120',
    email: 'sameer@bluewave.co',
    source: 'Franchise Partner',
    stage: 'active_account',
    assignedTo: 'Rahul Verma',
    value: 480000,
    lastActivity: 'Account onboarded and initial wallet activated.'
  }
];

export const initialLeaves: LeaveRequest[] = [
  {
    id: 'lv-01',
    userId: 'usr-emp',
    userName: 'Rahul Verma',
    department: 'Client Acquisition & Growth',
    leaveType: 'Casual Leave',
    startDate: '2026-09-22',
    endDate: '2026-09-23',
    totalDays: 2,
    reason: 'Family function and travel to home town.',
    status: 'pending',
    appliedAt: '2026-09-14 09:00 AM'
  },
  {
    id: 'lv-02',
    userId: 'usr-emp',
    userName: 'Rahul Verma',
    department: 'Client Acquisition & Growth',
    leaveType: 'Sick Leave',
    startDate: '2026-08-18',
    endDate: '2026-08-18',
    totalDays: 1,
    reason: 'Seasonal viral flu.',
    status: 'approved',
    appliedAt: '2026-08-17 08:30 PM',
    hrNotes: 'Medical certificate approved.'
  }
];

export const initialResignations: ResignationRecord[] = [
  {
    id: 'res-01',
    userId: 'usr-dev-08',
    userName: 'Aditya Sen',
    department: 'Engineering Services',
    designation: 'Backend Engineer',
    lastWorkingDay: '2026-09-30',
    reason: 'Relocating overseas for graduate higher studies.',
    status: 'under_clearance',
    submittedAt: '2026-09-01',
    clearance: {
      assetsReturned: true,
      documentationCompleted: true,
      knowledgeTransferDone: false,
      financeCleared: false
    }
  }
];

export const initialPendingOnboarding: PendingOnboarding[] = [
  {
    id: 'onb-01',
    fullName: 'Sneha Chawla',
    personalEmail: 'sneha.chawla@gmail.com',
    proposedRole: 'employee',
    department: 'Client Acquisition & Growth',
    teamLeaderId: 'usr-tl',
    dateOfJoining: '2026-09-18',
    documentStatus: 'Verified',
    status: 'pending_approval',
    aadhaarNumber: '894210348712',
    emergencyName: 'Rajesh Chawla (Father)',
    emergencyPhone: '9820011234',
    accountHolder: 'Sneha Chawla',
    bankName: 'HDFC Bank',
    accountNumber: '50100492819234',
    ifscCode: 'HDFC0000128',
    uploadedDocuments: {
      hasPriorExperience: true,
      panCard: {
        name: 'Sneha_Chawla_PAN_Card.pdf',
        size: '420 KB',
        type: 'pdf',
        previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 09:45 AM'
      },
      creditScore: {
        name: 'CIBIL_Report_Experian_790.pdf',
        size: '850 KB',
        type: 'pdf',
        previewUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 09:48 AM'
      },
      addressProofFront: {
        name: 'Driving_License_Front.jpg',
        size: '1.2 MB',
        type: 'image',
        previewUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 09:50 AM'
      },
      addressProofBack: {
        name: 'Driving_License_Back.jpg',
        size: '1.1 MB',
        type: 'image',
        previewUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 09:51 AM'
      },
      passportPhoto: {
        name: 'Sneha_Passport_Photograph.jpg',
        size: '680 KB',
        type: 'image',
        previewUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 09:53 AM'
      },
      resume: {
        name: 'Sneha_Chawla_Senior_Resume_2026.pdf',
        size: '310 KB',
        type: 'pdf',
        previewUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 09:55 AM'
      },
      previousOfferLetter: {
        name: 'FinTech_Global_Offer_Letter.pdf',
        size: '940 KB',
        type: 'pdf',
        previewUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 09:58 AM'
      },
      salarySlips: {
        name: 'Last_3_Months_PaySlips_Merged.pdf',
        size: '1.8 MB',
        type: 'pdf',
        previewUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 10:02 AM'
      },
      relievingLetter: {
        name: 'Relieving_Experience_Certificate.pdf',
        size: '620 KB',
        type: 'pdf',
        previewUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 10:05 AM'
      }
    },
    statutoryForms: {
      form11Status: 'Filled Digitally',
      formFStatus: 'Filled Digitally',
      esicForm1Status: 'Filled Digitally',
      dpdpConsentAccepted: true,
      dpdpConsentTimestamp: '2026-09-14 10:15 AM'
    },
    submissionStatus: 'Pending Admin Approval'
  },
  {
    id: 'onb-02',
    fullName: 'Harsh Vardhan',
    personalEmail: 'harsh.v@outlook.com',
    proposedRole: 'ops',
    department: 'Account Operations & Risk',
    teamLeaderId: 'usr-ops',
    dateOfJoining: '2026-09-25',
    documentStatus: 'Pending Review',
    status: 'pending_approval',
    aadhaarNumber: '782190341123',
    emergencyName: 'Sunita Vardhan (Mother)',
    emergencyPhone: '9910044567',
    accountHolder: 'Harsh Vardhan',
    bankName: 'ICICI Bank',
    accountNumber: '001205019283',
    ifscCode: 'ICIC0000012',
    uploadedDocuments: {
      hasPriorExperience: false,
      panCard: {
        name: 'Harsh_Vardhan_PAN.pdf',
        size: '390 KB',
        type: 'pdf',
        previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 11:20 AM'
      },
      creditScore: {
        name: 'CIBIL_Report_Experian_760.pdf',
        size: '720 KB',
        type: 'pdf',
        previewUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 11:22 AM'
      },
      addressProofFront: {
        name: 'Voter_ID_Card_Front.jpg',
        size: '950 KB',
        type: 'image',
        previewUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 11:25 AM'
      },
      addressProofBack: {
        name: 'Voter_ID_Card_Back.jpg',
        size: '890 KB',
        type: 'image',
        previewUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 11:26 AM'
      },
      passportPhoto: {
        name: 'Harsh_Formal_Photo.jpg',
        size: '540 KB',
        type: 'image',
        previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        uploadedAt: '14 Sep 2026, 11:28 AM'
      }
    },
    statutoryForms: {
      form11Status: 'Filled Digitally',
      formFStatus: 'Pending',
      esicForm1Status: 'Filled Digitally',
      dpdpConsentAccepted: true,
      dpdpConsentTimestamp: '2026-09-14 11:30 AM'
    },
    submissionStatus: 'Pending Admin Approval'
  }
];

export const initialSalarySlips: SalarySlip[] = [
  {
    id: 'slp-2026-08-01',
    employeeId: 'usr-emp',
    employeeName: 'Rahul Verma',
    designation: 'Client Operations Specialist',
    monthYear: 'August 2026',
    baseSalary: 65000,
    performanceCommission: 24500,
    pfDeduction: 1800,
    tdsDeduction: 3500,
    netPayout: 84200,
    status: 'paid',
    paidDate: '2026-09-01'
  },
  {
    id: 'slp-2026-08-02',
    employeeId: 'usr-tl',
    employeeName: 'Vikram Malhotra',
    designation: 'Senior Team Lead',
    monthYear: 'August 2026',
    baseSalary: 110000,
    performanceCommission: 48000,
    pfDeduction: 1800,
    tdsDeduction: 12500,
    netPayout: 143700,
    status: 'paid',
    paidDate: '2026-09-01'
  },
  {
    id: 'slp-2026-09-01',
    employeeId: 'usr-emp',
    employeeName: 'Rahul Verma',
    designation: 'Client Operations Specialist',
    monthYear: 'September 2026',
    baseSalary: 65000,
    performanceCommission: 18200,
    pfDeduction: 1800,
    tdsDeduction: 3200,
    netPayout: 78200,
    status: 'draft'
  }
];

export const initialCompanyTasks: DailyCompanyTask[] = [
  {
    id: 'tsk-01',
    title: 'September Mid-Sprint Client Verification Milestone',
    department: 'Client Acquisition & Growth',
    targetCount: 25,
    completedCount: 19,
    priority: 'high',
    deadline: 'Today, 06:00 PM IST',
    broadcastBy: 'Vikram Malhotra (TL)'
  },
  {
    id: 'tsk-02',
    title: 'Bi-annual SOC2 Type II Password & MFA Audit',
    department: 'All Departments',
    targetCount: 45,
    completedCount: 38,
    priority: 'medium',
    deadline: 'Tomorrow, 05:00 PM IST',
    broadcastBy: 'Ananya Sharma (Director)'
  }
];

export const initialDmsDocuments: DmsDocument[] = [
  {
    id: 'doc-01',
    title: 'ClickCamp Client Account Verification SOP v2.4',
    category: 'Operations',
    version: 'v2.4',
    fileSize: '3.4 MB',
    uploadedBy: 'Ananya Sharma',
    uploadedAt: '2026-09-01',
    fileType: 'PDF'
  },
  {
    id: 'doc-02',
    title: 'Employee Leave Policy & Attendance Regularization Guidelines',
    category: 'HR',
    version: 'v1.8',
    fileSize: '1.8 MB',
    uploadedBy: 'Priya Nambiar',
    uploadedAt: '2026-08-15',
    fileType: 'PDF'
  },
  {
    id: 'doc-03',
    title: 'Information Security & 2FA Enforcement Standard',
    category: 'Legal',
    version: 'v3.1',
    fileSize: '2.1 MB',
    uploadedBy: 'Ananya Sharma',
    uploadedAt: '2026-09-05',
    fileType: 'PDF'
  },
  {
    id: 'doc-04',
    title: 'FY26-27 Incentive Scheme & Bonus Calculation Model',
    category: 'Finance',
    version: 'v1.0',
    fileSize: '4.2 MB',
    uploadedBy: 'Priya Nambiar',
    uploadedAt: '2026-09-10',
    fileType: 'XLSX'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-09-14 11:45:10 IST',
    userId: 'usr-ops',
    userName: 'Rohan Gupta',
    userRole: 'Operations',
    action: 'APPROVAL',
    details: 'Locked and initiated audit on Client Account REF-CC-88319 (Apex Logistics)',
    ipAddress: '103.21.144.18'
  },
  {
    id: 'log-02',
    timestamp: '2026-09-14 10:15:22 IST',
    userId: 'usr-emp',
    userName: 'Rahul Verma',
    userRole: 'Employee',
    action: 'UPLOAD',
    details: 'Submitted new closed client account REF-CC-90214 for Meta Ads platform',
    ipAddress: '103.21.144.22'
  },
  {
    id: 'log-03',
    timestamp: '2026-09-14 09:32:04 IST',
    userId: 'usr-emp',
    userName: 'Rahul Verma',
    userRole: 'Employee',
    action: 'PUNCH_IN',
    details: 'Clocked In via Web Portal. Timestamp synchronized with IST server clock',
    ipAddress: '103.21.144.22'
  },
  {
    id: 'log-04',
    timestamp: '2026-09-14 09:00:15 IST',
    userId: 'usr-admin',
    userName: 'Ananya Sharma',
    userRole: 'Admin',
    action: 'LOGIN',
    details: 'Authenticated successfully with Bcrypt Password + TOTP 2FA verification',
    ipAddress: '49.36.18.91'
  }
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-01',
    channelId: 'c-general',
    senderId: 'usr-superadmin',
    senderName: 'Adnan Malik',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Super Admin',
    text: 'Good morning Click Camp team! Welcome to the operations hub. Please adhere to daily verification SOPs and ensure client KYC is complete before submission.',
    timestamp: '09:15 AM'
  },
  {
    id: 'msg-02',
    channelId: 'c-general',
    senderId: 'usr-tl',
    senderName: 'Vikram Malhotra',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Team Leader',
    text: 'Team Alpha is currently at 19 closed accounts today. Targeting 25+ before EOD!',
    timestamp: '09:40 AM'
  },
  {
    id: 'msg-03',
    channelId: 'c-ops',
    senderId: 'usr-ops',
    senderName: 'Rohan Gupta',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Operations',
    text: 'Apex Logistics client account (REF-CC-88319) is currently locked under my review. Processing verification.',
    timestamp: '11:46 AM'
  },
  {
    id: 'msg-04',
    channelId: 'c-tech',
    senderId: 'usr-superadmin',
    senderName: 'Adnan Malik',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Super Admin',
    text: 'SOC2 Type II logging and audit trail encryption is enabled for all workspace endpoints.',
    timestamp: '12:10 PM'
  },
  // Direct Messages between team members
  {
    id: 'msg-dm-01',
    channelId: 'dm-usr-emp-usr-tl',
    senderId: 'usr-emp',
    senderName: 'Rahul Verma',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Employee',
    recipientId: 'usr-tl',
    recipientName: 'Vikram Malhotra',
    recipientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isDirect: true,
    text: 'Hi Vikram, I have uploaded the Google Ads onboarding checklist for client REF-CC-90214. Could you please review when free?',
    timestamp: '11:20 AM'
  },
  {
    id: 'msg-dm-02',
    channelId: 'dm-usr-emp-usr-tl',
    senderId: 'usr-tl',
    senderName: 'Vikram Malhotra',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Team Leader',
    recipientId: 'usr-emp',
    recipientName: 'Rahul Verma',
    recipientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isDirect: true,
    text: 'Checked and approved, Rahul. Sent over to Ops Verification queue.',
    timestamp: '11:24 AM'
  },
  {
    id: 'msg-dm-03',
    channelId: 'dm-usr-hr-usr-superadmin',
    senderId: 'usr-hr',
    senderName: 'Priya Nambiar',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    senderRole: 'HR Lead',
    recipientId: 'usr-superadmin',
    recipientName: 'Adnan Malik',
    recipientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isDirect: true,
    text: 'Good afternoon Adnan sir. The onboarding dossier for candidate Harsh Vardhan has been uploaded with Form 11, Form F, and PAN card. Ready for your executive review.',
    timestamp: '12:30 PM'
  },
  {
    id: 'msg-dm-04',
    channelId: 'dm-usr-hr-usr-superadmin',
    senderId: 'usr-superadmin',
    senderName: 'Adnan Malik',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Super Admin',
    recipientId: 'usr-hr',
    recipientName: 'Priya Nambiar',
    recipientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    isDirect: true,
    text: 'Thank you Priya. I am opening the Onboarding Tracker now to verify documents and execute the provisioning.',
    timestamp: '12:35 PM'
  }
];

export const initialWebmail: WebmailItem[] = [
  {
    id: 'em-01',
    folder: 'inbox',
    from: 'Corporate Operations',
    fromEmail: 'operations@clickcamp.site',
    toEmail: 'adnan.malik@clickcamp.site',
    subject: 'Production Launch Status: Identity Directory & Domain Routing Activated',
    body: 'Dear Adnan,\n\nThe ClickCamp enterprise portal has been successfully provisioned for live production use under the clickcamp.site domain. All test credentials have been purged, and strict credential verification is enforced.\n\nBest Regards,\nClickCamp Business & Technology Services Operations Desk',
    date: 'Oct 23, 2026',
    isRead: false,
    isStarred: true
  },
  {
    id: 'em-02',
    folder: 'inbox',
    from: 'IT Security Desk',
    fromEmail: 'security@clickcamp.site',
    toEmail: 'adnan.malik@clickcamp.site',
    subject: 'Two-Factor Authentication (2FA) & Workstation Security Active',
    body: 'Your Super Admin credentials and TOTP Authenticator have been verified for clickcamp.site Single-Sign-On.',
    date: 'Oct 23, 2026',
    isRead: true,
    isStarred: false
  }
];

export const initialMeetingMoms: MeetingMom[] = [
  {
    id: 'mom-01',
    title: 'Weekly Operations & Client Acquisition Sync',
    date: '2026-09-14',
    time: '10:00 AM - 10:45 AM IST',
    organizer: 'Vikram Malhotra (TL)',
    attendees: ['Vikram Malhotra', 'Rahul Verma', 'Rohan Gupta', 'Ananya Sharma'],
    keyDecisions: [
      'Ops queue SLA reduced to 45 minutes for verified high-tier accounts.',
      'Team Alpha daily quota increased from 20 to 25 closed accounts.',
      'New 2FA TOTP requirement made mandatory for all portal operators.'
    ],
    actionItems: [
      { task: 'Implement review locking mechanism in Ops portal', owner: 'Rohan Gupta', status: 'done' },
      { task: 'Follow up with Nexus E-Commerce KYC documents', owner: 'Rahul Verma', status: 'pending' },
      { task: 'Export weekly attendance and KPI summary', owner: 'Vikram Malhotra', status: 'pending' }
    ],
    readBy: ['usr-emp', 'usr-tl']
  }
];

export const initialSupportTickets: SupportTicket[] = [
  {
    id: 'tkt-01',
    title: 'Request second monitor for dual-window account verification',
    category: 'IT Support',
    priority: 'Medium',
    submittedBy: 'usr-emp',
    submittedByName: 'Rahul Verma',
    createdAt: '2026-09-12 11:30 AM',
    status: 'in_progress',
    resolutionNotes: 'Hardware approved by TL; IT department dispatching Dell 27" monitor.'
  },
  {
    id: 'tkt-02',
    title: 'Query regarding Maternity & Paternity benefits amendment',
    category: 'HR Query',
    priority: 'Low',
    submittedBy: 'usr-emp',
    submittedByName: 'Rahul Verma',
    createdAt: '2026-09-08 04:15 PM',
    status: 'resolved',
    resolutionNotes: 'HR policy document shared via DMS library.'
  }
];

export const initialExpenseClaims: ExpenseClaim[] = [
  {
    id: 'exp-01',
    submittedBy: 'usr-emp',
    userName: 'Rahul Verma',
    department: 'Client Acquisition & Growth',
    category: 'Client Meals',
    amount: 3250,
    currency: 'INR',
    receiptRef: 'RCP-BLR-8831',
    date: '2026-09-11',
    status: 'approved',
    notes: 'Working lunch with Nexus E-Commerce founder.'
  },
  {
    id: 'exp-02',
    submittedBy: 'usr-emp',
    userName: 'Rahul Verma',
    department: 'Client Acquisition & Growth',
    category: 'Travel & Commute',
    amount: 1450,
    currency: 'INR',
    receiptRef: 'RCP-UBER-9920',
    date: '2026-09-13',
    status: 'pending',
    notes: 'On-site client meeting transit in Bangalore Tech Park.'
  }
];

export const initialCrmDealers: CrmDealer[] = [
  {
    id: 'dlr-01',
    dealerName: 'Apex Media Global Partners',
    partnerType: 'Tier 1 Elite',
    contactPerson: 'Karan Mehra',
    phone: '+91 98210 99450',
    email: 'karan@apexpartners.in',
    region: 'Mumbai & West India',
    activeAccounts: 48,
    contractStatus: 'Active'
  },
  {
    id: 'dlr-02',
    dealerName: 'Deccan Growth Ventures',
    partnerType: 'Franchise Partner',
    contactPerson: 'Suresh Babu',
    phone: '+91 94440 22180',
    email: 'suresh@deccangrowth.com',
    region: 'Bangalore & Hyderabad',
    activeAccounts: 32,
    contractStatus: 'Active'
  },
  {
    id: 'dlr-03',
    dealerName: 'Capital Reach Network',
    partnerType: 'Channel Partner',
    contactPerson: 'Amitabh Sen',
    phone: '+91 98100 44320',
    email: 'amitabh@capitalreach.in',
    region: 'Delhi NCR',
    activeAccounts: 19,
    contractStatus: 'Pending Renewal'
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-01',
    type: 'verification',
    title: 'Account Verification Update',
    message: 'SwiftPay Fintech Solutions (REF-CC-77102) was Verified by Ops.',
    timestamp: '15 mins ago',
    isRead: false
  },
  {
    id: 'notif-02',
    type: 'task',
    title: 'Daily Quota Target',
    message: 'Team Alpha is 6 accounts away from meeting today’s target of 25!',
    timestamp: '45 mins ago',
    isRead: false
  },
  {
    id: 'notif-03',
    type: 'security',
    title: 'Admin Security Notice',
    message: 'Workstation screen lock enabled with PIN protection for ClickCamp security compliance.',
    timestamp: '2 hours ago',
    isRead: true
  }
];

export const initialCompanyNotices: CompanyNotice[] = [
  {
    id: 'ntc-01',
    title: 'Q4 Operations Guidelines & 15-Minute Client Verification SLA',
    content: 'All operational verifiers, team leads, and account managers must adhere strictly to the revised 15-minute response SLA for inbound client verification requests. Ensure all statutory checks, PAN number validations, and deal confirmations are properly timestamped in the portal before passing accounts to Active status.',
    priority: 'urgent',
    category: 'Operations',
    targetDepartment: 'All Departments',
    authorId: 'usr-superadmin',
    authorName: 'Adnan Malik',
    authorRole: 'Managing Director & Super Admin',
    isPinned: true,
    acknowledgements: ['usr-ops', 'usr-tl'],
    createdAt: '2026-09-15T08:30:00.000Z'
  },
  {
    id: 'ntc-02',
    title: 'Mandatory Information Security & Workstation Screen Lock Policy',
    content: 'In compliance with SOC2 Type II audit readiness and Indian Digital Personal Data Protection (DPDP) statutory standards, all employees must lock workstations whenever leaving desks. Unattended unlocked workstations will automatically enter lockdown and log security events.',
    priority: 'high',
    category: 'HR & Policy',
    targetDepartment: 'All Departments',
    authorId: 'usr-superadmin',
    authorName: 'Adnan Malik',
    authorRole: 'Managing Director & Super Admin',
    isPinned: true,
    acknowledgements: ['usr-hr', 'usr-emp'],
    createdAt: '2026-09-14T14:15:00.000Z'
  },
  {
    id: 'ntc-03',
    title: 'Upcoming Festival Office Holiday Calendar & Leave Submission Deadlines',
    content: 'The corporate office will observe declared company holidays next month. Team members intending to take bridge leaves or casual time off are requested to submit their leave applications through the HR Portal at least 7 days in advance to ensure operational coverage.',
    priority: 'normal',
    category: 'Holiday & Event',
    targetDepartment: 'All Departments',
    authorId: 'usr-hr',
    authorName: 'Priya Nambiar',
    authorRole: 'Senior HR Business Partner',
    isPinned: false,
    acknowledgements: ['usr-emp'],
    createdAt: '2026-09-13T10:00:00.000Z'
  },
  {
    id: 'ntc-04',
    title: 'ClickCamp Q3 Performance Highlights: 142% Target Realization',
    content: 'Heartiest congratulations to our Client Acquisition and Operations divisions for achieving 142% of our quarterly milestone targets! Special commendation goes to Team Alpha for achieving zero verification discrepancies across all high-ticket campaigns.',
    priority: 'info',
    category: 'General',
    targetDepartment: 'All Departments',
    authorId: 'usr-superadmin',
    authorName: 'Adnan Malik',
    authorRole: 'Managing Director & Super Admin',
    isPinned: false,
    acknowledgements: ['usr-ops', 'usr-tl', 'usr-emp', 'usr-hr'],
    createdAt: '2026-09-12T16:45:00.000Z'
  }
];

