import { UserAccount, Department, UserRole } from '../types';

interface BotProfileTemplate {
  name: string;
  department: Department;
  role: UserRole;
  roleLabel: string;
  designation: string;
  gender: 'Male' | 'Female';
  avatarSeed: number;
}

const RAW_BOT_DATA: BotProfileTemplate[] = [
  // 1. Managers & Operations Verification Team (30 Profiles)
  { name: 'Aarav Mehta', department: 'Managers', role: 'ops', roleLabel: 'Senior Verification Analyst', designation: 'Senior Verification Specialist', gender: 'Male', avatarSeed: 101 },
  { name: 'Ananya Iyer', department: 'Managers', role: 'ops', roleLabel: 'Merchant KYC Specialist', designation: 'KYC & Compliance Officer', gender: 'Female', avatarSeed: 102 },
  { name: 'Rohan Kulkarni', department: 'Managers', role: 'team_leader', roleLabel: 'Verification Team Lead', designation: 'Operations Team Lead', gender: 'Male', avatarSeed: 103 },
  { name: 'Tanvi Deshmukh', department: 'Managers', role: 'ops', roleLabel: 'Google Ads Account Auditor', designation: 'Ad Platform Verification Analyst', gender: 'Female', avatarSeed: 104 },
  { name: 'Devansh Singhal', department: 'Managers', role: 'ops', roleLabel: 'Shopify Operations Analyst', designation: 'E-commerce Account Verifier', gender: 'Male', avatarSeed: 105 },
  { name: 'Kavita Chawla', department: 'Managers', role: 'ops', roleLabel: 'Tier-2 KYC Verification Lead', designation: 'Senior Ops Specialist', gender: 'Female', avatarSeed: 106 },
  { name: 'Manish Trivedi', department: 'Managers', role: 'ops', roleLabel: 'Telegram Merchant Auditor', designation: 'Risk & Fraud Analyst', gender: 'Male', avatarSeed: 107 },
  { name: 'Neha Bansal', department: 'Managers', role: 'ops', roleLabel: 'Meta Ads Platform Verifier', designation: 'Operations Specialist', gender: 'Female', avatarSeed: 108 },
  { name: 'Siddharth Nair', department: 'Managers', role: 'ops', roleLabel: 'AWS Account Verification Lead', designation: 'Cloud Verification Specialist', gender: 'Male', avatarSeed: 109 },
  { name: 'Pooja Reddy', department: 'Managers', role: 'team_leader', roleLabel: 'Night Shift Ops Team Leader', designation: 'Shift Operations Lead', gender: 'Female', avatarSeed: 110 },
  { name: 'Kunal Joshi', department: 'Managers', role: 'ops', roleLabel: 'Affiliate Network Auditor', designation: 'Operations Specialist', gender: 'Male', avatarSeed: 111 },
  { name: 'Ritu Saxena', department: 'Managers', role: 'ops', roleLabel: 'High-Value Deal Verifier', designation: 'Senior Verification Specialist', gender: 'Female', avatarSeed: 112 },
  { name: 'Amitabha Sengupta', department: 'Managers', role: 'ops', roleLabel: 'Document Authentication Lead', designation: 'Ops QA Analyst', gender: 'Male', avatarSeed: 113 },
  { name: 'Preeti Rao', department: 'Managers', role: 'ops', roleLabel: 'Custom CRM Integration Verifier', designation: 'Operations Specialist', gender: 'Female', avatarSeed: 114 },
  { name: 'Tarun Bhatia', department: 'Managers', role: 'ops', roleLabel: 'Anti-Fraud Verification Analyst', designation: 'Risk Operations Lead', gender: 'Male', avatarSeed: 115 },
  { name: 'Divya Menon', department: 'Managers', role: 'ops', roleLabel: 'Merchant Onboarding Auditor', designation: 'Operations Specialist', gender: 'Female', avatarSeed: 116 },
  { name: 'Harish Pillai', department: 'Managers', role: 'ops', roleLabel: 'Daily Target Verification QA', designation: 'Verification Associate', gender: 'Male', avatarSeed: 117 },
  { name: 'Swati Kapoor', department: 'Managers', role: 'ops', roleLabel: 'Account Batch Reviewer', designation: 'Operations Specialist', gender: 'Female', avatarSeed: 118 },
  { name: 'Varun Chopra', department: 'Managers', role: 'team_leader', roleLabel: 'Morning Shift Ops Lead', designation: 'Team Leader', gender: 'Male', avatarSeed: 119 },
  { name: 'Nidhi Agarwal', department: 'Managers', role: 'ops', roleLabel: 'Compliance Verification Lead', designation: 'Senior Verifier', gender: 'Female', avatarSeed: 120 },
  { name: 'Gaurav Mittal', department: 'Managers', role: 'ops', roleLabel: 'KYC Dispatch Specialist', designation: 'Operations Specialist', gender: 'Male', avatarSeed: 121 },
  { name: 'Simran Anand', department: 'Managers', role: 'ops', roleLabel: 'Verification SLA Tracker', designation: 'Operations Associate', gender: 'Female', avatarSeed: 122 },
  { name: 'Naveen Varma', department: 'Managers', role: 'ops', roleLabel: 'Platform Credentials Verifier', designation: 'Operations Specialist', gender: 'Male', avatarSeed: 123 },
  { name: 'Megha Sundaram', department: 'Managers', role: 'ops', roleLabel: 'Operations Escalation Officer', designation: 'Senior Verifier', gender: 'Female', avatarSeed: 124 },
  { name: 'Karthik Balan', department: 'Managers', role: 'ops', roleLabel: 'Ops Queue Queue Master', designation: 'Operations Specialist', gender: 'Male', avatarSeed: 125 },
  { name: 'Payal Somani', department: 'Managers', role: 'ops', roleLabel: 'Verification Audit Controller', designation: 'QA Specialist', gender: 'Female', avatarSeed: 126 },
  { name: 'Alok Pandey', department: 'Managers', role: 'ops', roleLabel: 'Client Tele-Verification Lead', designation: 'Operations Specialist', gender: 'Male', avatarSeed: 127 },
  { name: 'Sanya Mukherjee', department: 'Managers', role: 'ops', roleLabel: 'Ad Platform Integrity Officer', designation: 'Senior Verifier', gender: 'Female', avatarSeed: 128 },
  { name: 'Deepak Namboodiri', department: 'Managers', role: 'ops', roleLabel: 'Verification Operations Auditor', designation: 'Operations Specialist', gender: 'Male', avatarSeed: 129 },
  { name: 'Isha Grover', department: 'Managers', role: 'team_leader', roleLabel: 'Evening Shift Ops Lead', designation: 'Team Leader', gender: 'Female', avatarSeed: 130 },

  // 2. Business & Growth Team (25 Profiles)
  { name: 'Arjun Dasgupta', department: 'Business', role: 'employee', roleLabel: 'Senior Growth Manager', designation: 'Senior Growth Specialist', gender: 'Male', avatarSeed: 201 },
  { name: 'Bhavna Sethi', department: 'Business', role: 'employee', roleLabel: 'Client Acquisition Lead', designation: 'Account Executive', gender: 'Female', avatarSeed: 202 },
  { name: 'Chirag Parekh', department: 'Business', role: 'employee', roleLabel: 'CRM Dealer Partner Manager', designation: 'Partnership Manager', gender: 'Male', avatarSeed: 203 },
  { name: 'Deepika Sen', department: 'Business', role: 'employee', roleLabel: 'Enterprise Deal Closer', designation: 'Business Development Specialist', gender: 'Female', avatarSeed: 204 },
  { name: 'Eshaan Roy', department: 'Business', role: 'employee', roleLabel: 'Ad Revenue Strategist', designation: 'Growth Specialist', gender: 'Male', avatarSeed: 205 },
  { name: 'Farah Qureshi', department: 'Business', role: 'employee', roleLabel: 'Affiliate Marketing Manager', designation: 'Network Lead', gender: 'Female', avatarSeed: 206 },
  { name: 'Giridhar Rao', department: 'Business', role: 'employee', roleLabel: 'Key Accounts Executive', designation: 'Account Manager', gender: 'Male', avatarSeed: 207 },
  { name: 'Hemant Shekhawat', department: 'Business', role: 'employee', roleLabel: 'B2B Sales Specialist', designation: 'Sales Specialist', gender: 'Male', avatarSeed: 208 },
  { name: 'Ishita Mathur', department: 'Business', role: 'employee', roleLabel: 'Client Relationship Manager', designation: 'Relationship Lead', gender: 'Female', avatarSeed: 209 },
  { name: 'Jatin Bajaj', department: 'Business', role: 'employee', roleLabel: 'Inbound Sales Lead', designation: 'Sales Executive', gender: 'Male', avatarSeed: 210 },
  { name: 'Kritika Roy', department: 'Business', role: 'employee', roleLabel: 'Lead Conversion Specialist', designation: 'Growth Executive', gender: 'Female', avatarSeed: 211 },
  { name: 'Lalit Soni', department: 'Business', role: 'employee', roleLabel: 'Merchant Pipeline Coordinator', designation: 'Business Analyst', gender: 'Male', avatarSeed: 212 },
  { name: 'Monika Paul', department: 'Business', role: 'employee', roleLabel: 'Regional Account Manager', designation: 'Account Executive', gender: 'Female', avatarSeed: 213 },
  { name: 'Nikhil Kashyap', department: 'Business', role: 'employee', roleLabel: 'Campaign Expansion Lead', designation: 'Growth Specialist', gender: 'Male', avatarSeed: 214 },
  { name: 'Ojaswini Vyas', department: 'Business', role: 'employee', roleLabel: 'Enterprise Client Lead', designation: 'Account Executive', gender: 'Female', avatarSeed: 215 },
  { name: 'Pranav Kulkarni', department: 'Business', role: 'employee', roleLabel: 'Telegram Network Manager', designation: 'Channel Specialist', gender: 'Male', avatarSeed: 216 },
  { name: 'Radhika Nair', department: 'Business', role: 'employee', roleLabel: 'High-Value Lead Specialist', designation: 'Business Development', gender: 'Female', avatarSeed: 217 },
  { name: 'Sameer Wadhwa', department: 'Business', role: 'employee', roleLabel: 'Global Client Onboarder', designation: 'Account Manager', gender: 'Male', avatarSeed: 218 },
  { name: 'Trisha Bhattacharya', department: 'Business', role: 'employee', roleLabel: 'CRM Pipeline Auditor', designation: 'Growth Associate', gender: 'Female', avatarSeed: 219 },
  { name: 'Umesh Hegde', department: 'Business', role: 'employee', roleLabel: 'Affiliate Deal Negotiator', designation: 'Partnership Lead', gender: 'Male', avatarSeed: 220 },
  { name: 'Vidya Krishnan', department: 'Business', role: 'employee', roleLabel: 'Client Retention Specialist', designation: 'Account Executive', gender: 'Female', avatarSeed: 221 },
  { name: 'Waseem Akram', department: 'Business', role: 'employee', roleLabel: 'Daily Target Specialist', designation: 'Growth Associate', gender: 'Male', avatarSeed: 222 },
  { name: 'Yash Vardhan', department: 'Business', role: 'employee', roleLabel: 'Ad Spend Optimization Lead', designation: 'Campaign Specialist', gender: 'Male', avatarSeed: 223 },
  { name: 'Zoya Siddiqui', department: 'Business', role: 'employee', roleLabel: 'Strategic Deals Lead', designation: 'Senior Account Manager', gender: 'Female', avatarSeed: 224 },
  { name: 'Bhupesh Goel', department: 'Business', role: 'employee', roleLabel: 'Quarterly Target Coordinator', designation: 'Business Analyst', gender: 'Male', avatarSeed: 225 },

  // 3. HR & People Operations Team (20 Profiles)
  { name: 'Aakanksha Kaul', department: 'HR', role: 'hr', roleLabel: 'Talent Acquisition Partner', designation: 'HR Specialist', gender: 'Female', avatarSeed: 301 },
  { name: 'Bhaskar Jyoti', department: 'HR', role: 'hr', roleLabel: 'Attendance & Shift Compliance Lead', designation: 'People Operations Lead', gender: 'Male', avatarSeed: 302 },
  { name: 'Chaitali Roy', department: 'HR', role: 'hr', roleLabel: 'Employee Relations Specialist', designation: 'HR Generalist', gender: 'Female', avatarSeed: 303 },
  { name: 'Dharmendra Yadav', department: 'HR', role: 'hr', roleLabel: 'Statutory Compliance Officer', designation: 'HR Compliance Officer', gender: 'Male', avatarSeed: 304 },
  { name: 'Ekta Kapoor', department: 'HR', role: 'hr', roleLabel: 'Shift Anomaly Reviewer', designation: 'People Ops Associate', gender: 'Female', avatarSeed: 305 },
  { name: 'Faisal Khan', department: 'HR', role: 'hr', roleLabel: 'Workstation Policy Coordinator', designation: 'HR Generalist', gender: 'Male', avatarSeed: 306 },
  { name: 'Gitanjali Bose', department: 'HR', role: 'hr', roleLabel: 'Leave Administration Lead', designation: 'HR Specialist', gender: 'Female', avatarSeed: 307 },
  { name: 'Himanshu Shukla', department: 'HR', role: 'hr', roleLabel: 'Biometric & Punch Auditor', designation: 'Attendance Operations Specialist', gender: 'Male', avatarSeed: 308 },
  { name: 'Indu Prabha', department: 'HR', role: 'hr', roleLabel: 'HR Onboarding Concierge', designation: 'People Operations', gender: 'Female', avatarSeed: 309 },
  { name: 'Jaideep Sen', department: 'HR', role: 'hr', roleLabel: 'Employee Wellness Manager', designation: 'HR Lead', gender: 'Male', avatarSeed: 310 },
  { name: 'Komal Aggarwal', department: 'HR', role: 'hr', roleLabel: 'Payroll & Gratuity Admin', designation: 'HR Operations', gender: 'Female', avatarSeed: 311 },
  { name: 'Lakshman Murthy', department: 'HR', role: 'hr', roleLabel: 'Workplace Ethics Officer', designation: 'Compliance Lead', gender: 'Male', avatarSeed: 312 },
  { name: 'Mallika Sarabhai', department: 'HR', role: 'hr', roleLabel: 'Staff Verification Specialist', designation: 'People Ops Associate', gender: 'Female', avatarSeed: 313 },
  { name: 'Naveen Jindal', department: 'HR', role: 'hr', roleLabel: 'Performance Appraisal Lead', designation: 'HR Specialist', gender: 'Male', avatarSeed: 314 },
  { name: 'Pallavi Joshi', department: 'HR', role: 'hr', roleLabel: 'Shift Grace Period Auditor', designation: 'Attendance Officer', gender: 'Female', avatarSeed: 315 },
  { name: 'Qadir Hassan', department: 'HR', role: 'hr', roleLabel: 'DPDP Employee Consent Lead', designation: 'Data Privacy Officer', gender: 'Male', avatarSeed: 316 },
  { name: 'Rashmi Sawant', department: 'HR', role: 'hr', roleLabel: 'Regularization Appeals Reviewer', designation: 'HR Generalist', gender: 'Female', avatarSeed: 317 },
  { name: 'Siddheshwar Rao', department: 'HR', role: 'hr', roleLabel: 'PF & ESIC Compliance Manager', designation: 'Statutory Officer', gender: 'Male', avatarSeed: 318 },
  { name: 'Tara Vishwanath', department: 'HR', role: 'hr', roleLabel: 'HR Helpdesk Lead', designation: 'People Operations', gender: 'Female', avatarSeed: 319 },
  { name: 'Utkarsh Srivastava', department: 'HR', role: 'hr', roleLabel: 'Staff Attendance Anomaly Desk', designation: 'HR Specialist', gender: 'Male', avatarSeed: 320 },

  // 4. Accounts & Finance Team (20 Profiles)
  { name: 'Anil Deshmukh', department: 'Accounts', role: 'employee', roleLabel: 'Senior Financial Analyst', designation: 'Financial Analyst', gender: 'Male', avatarSeed: 401 },
  { name: 'Bindu Nambisan', department: 'Accounts', role: 'employee', roleLabel: 'Accounts Payable Specialist', designation: 'Accountant', gender: 'Female', avatarSeed: 402 },
  { name: 'Chetan Bhagat', department: 'Accounts', role: 'employee', roleLabel: 'Billing & Invoice Specialist', designation: 'Billing Lead', gender: 'Male', avatarSeed: 403 },
  { name: 'Damini Rathore', department: 'Accounts', role: 'employee', roleLabel: 'Expense Audit Specialist', designation: 'Finance Associate', gender: 'Female', avatarSeed: 404 },
  { name: 'Eswar Prasad', department: 'Accounts', role: 'employee', roleLabel: 'Client Payment Verifier', designation: 'Accountant', gender: 'Male', avatarSeed: 405 },
  { name: 'Falguni Shah', department: 'Accounts', role: 'employee', roleLabel: 'Taxation & GST Specialist', designation: 'Tax Lead', gender: 'Female', avatarSeed: 406 },
  { name: 'Gopichand Yadav', department: 'Accounts', role: 'employee', roleLabel: 'Dealer Commission Auditor', designation: 'Finance Specialist', gender: 'Male', avatarSeed: 407 },
  { name: 'Harini Swaminathan', department: 'Accounts', role: 'employee', roleLabel: 'Banking Reconciliation Lead', designation: 'Senior Accountant', gender: 'Female', avatarSeed: 408 },
  { name: 'Irfan Habib', department: 'Accounts', role: 'employee', roleLabel: 'Accounts Receivable Lead', designation: 'Accountant', gender: 'Male', avatarSeed: 409 },
  { name: 'Juhi Chawla', department: 'Accounts', role: 'employee', roleLabel: 'Reimbursement Claim Reviewer', designation: 'Finance Associate', gender: 'Female', avatarSeed: 410 },
  { name: 'Kailash Kher', department: 'Accounts', role: 'employee', roleLabel: 'Statutory Payroll Auditor', designation: 'Payroll Accountant', gender: 'Male', avatarSeed: 411 },
  { name: 'Lavanya Tripathi', department: 'Accounts', role: 'employee', roleLabel: 'Internal Financial Controller', designation: 'Assistant Controller', gender: 'Female', avatarSeed: 412 },
  { name: 'Madan Mohan', department: 'Accounts', role: 'employee', roleLabel: 'Vendor Payout Specialist', designation: 'Accountant', gender: 'Male', avatarSeed: 413 },
  { name: 'Namrata Shirodkar', department: 'Accounts', role: 'employee', roleLabel: 'Audit Trail Reconciler', designation: 'Finance Auditor', gender: 'Female', avatarSeed: 414 },
  { name: 'Omkar Nath', department: 'Accounts', role: 'employee', roleLabel: 'Corporate Ledger Keeper', designation: 'Senior Accountant', gender: 'Male', avatarSeed: 415 },
  { name: 'Pratibha Patil', department: 'Accounts', role: 'employee', roleLabel: 'TDS & Withholding Analyst', designation: 'Tax Specialist', gender: 'Female', avatarSeed: 416 },
  { name: 'Raghavan Pillai', department: 'Accounts', role: 'employee', roleLabel: 'Daily Ledger Settlement Lead', designation: 'Accountant', gender: 'Male', avatarSeed: 417 },
  { name: 'Sushmita Sen', department: 'Accounts', role: 'employee', roleLabel: 'Client Credit Risk Analyst', designation: 'Finance Analyst', gender: 'Female', avatarSeed: 418 },
  { name: 'Tapan Misra', department: 'Accounts', role: 'employee', roleLabel: 'Cash Flow Auditor', designation: 'Senior Accountant', gender: 'Male', avatarSeed: 419 },
  { name: 'Urmila Matondkar', department: 'Accounts', role: 'employee', roleLabel: 'Finance Operations Desk', designation: 'Accounts Specialist', gender: 'Female', avatarSeed: 420 },

  // 5. IT Systems & Security Infrastructure (15 Profiles)
  { name: 'Abhishek Bachchan', department: 'IT', role: 'admin', roleLabel: 'DevOps & CI/CD Lead', designation: 'DevOps Engineer', gender: 'Male', avatarSeed: 501 },
  { name: 'Bipasha Basu', department: 'IT', role: 'admin', roleLabel: 'Workstation Security Admin', designation: 'Security Analyst', gender: 'Female', avatarSeed: 502 },
  { name: 'Cyrus Broacha', department: 'IT', role: 'admin', roleLabel: 'Database Reliability Engineer', designation: 'DBA Lead', gender: 'Male', avatarSeed: 503 },
  { name: 'Dia Mirza', department: 'IT', role: 'admin', roleLabel: 'Network Infrastructure Lead', designation: 'Network Engineer', gender: 'Female', avatarSeed: 504 },
  { name: 'Emraan Hashmi', department: 'IT', role: 'admin', roleLabel: 'IAM & 2FA Governance Officer', designation: 'Security Specialist', gender: 'Male', avatarSeed: 505 },
  { name: 'Freida Pinto', department: 'IT', role: 'admin', roleLabel: 'Cloud Platform Architect', designation: 'Systems Architect', gender: 'Female', avatarSeed: 506 },
  { name: 'Govinda Ahuja', department: 'IT', role: 'admin', roleLabel: 'System Audit Log Custodian', designation: 'IT Systems Admin', gender: 'Male', avatarSeed: 507 },
  { name: 'Huma Qureshi', department: 'IT', role: 'admin', roleLabel: 'VPN & Endpoint Admin', designation: 'Infrastructure Engineer', gender: 'Female', avatarSeed: 508 },
  { name: 'Indraneil Sengupta', department: 'IT', role: 'admin', roleLabel: 'API Gateway Engineer', designation: 'Software Engineer', gender: 'Male', avatarSeed: 509 },
  { name: 'Jacqueline Fernandez', department: 'IT', role: 'admin', roleLabel: 'IT Helpdesk Lead', designation: 'IT Support Specialist', gender: 'Female', avatarSeed: 510 },
  { name: 'Kabir Bedi', department: 'IT', role: 'admin', roleLabel: 'Disaster Recovery Architect', designation: 'Senior Systems Engineer', gender: 'Male', avatarSeed: 511 },
  { name: 'Lara Dutta', department: 'IT', role: 'admin', roleLabel: 'Data Encryption Specialist', designation: 'Cybersecurity Analyst', gender: 'Female', avatarSeed: 512 },
  { name: 'Milind Soman', department: 'IT', role: 'admin', roleLabel: 'High-Availability DBA', designation: 'Database Administrator', gender: 'Male', avatarSeed: 513 },
  { name: 'Nandita Das', department: 'IT', role: 'admin', roleLabel: 'Compliance Tech Auditor', designation: 'Security Lead', gender: 'Female', avatarSeed: 514 },
  { name: 'Om Puri', department: 'IT', role: 'admin', roleLabel: 'Site Reliability Engineer', designation: 'SRE Lead', gender: 'Male', avatarSeed: 515 }
];

// Helper to generate consistent avatar URLs from Unsplash
const getAvatarUrl = (seed: number, gender: 'Male' | 'Female'): string => {
  // Collection of realistic professional headshots
  const maleAvatars = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  ];
  const femaleAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'
  ];

  const pool = gender === 'Male' ? maleAvatars : femaleAvatars;
  return pool[seed % pool.length];
};

// Convert raw templates into full UserAccount objects
export const SIMULATED_BOT_USERS: UserAccount[] = RAW_BOT_DATA.map((t, idx) => {
  const emailName = t.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
  const id = `bot-emp-${(idx + 1).toString().padStart(3, '0')}`;
  const email = `${emailName}@clickcamp.site`;
  const avatarUrl = getAvatarUrl(t.avatarSeed, t.gender);

  return {
    id,
    name: t.name,
    email,
    personalEmail: `${emailName}.personal@gmail.com`,
    role: t.role,
    roleLabel: t.roleLabel,
    department: t.department,
    designation: t.designation,
    phone: `+91 98765 ${(10000 + idx).toString()}`,
    status: 'active' as const,
    is2FAEnabled: true,
    totpSecret: `CLICKCAMP-BOT-2FA-${idx + 100}`,
    backupCodes: [`CC-BOT-${idx + 100}A`, `CC-BOT-${idx + 100}B`],
    avatarUrl,
    dateOfJoining: '01 Jan 2024'
  };
});
