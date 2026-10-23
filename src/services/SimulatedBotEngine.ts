import { ChatMessage, WebmailItem, UserAccount } from '../types';
import { SIMULATED_BOT_USERS } from '../data/simulatedBotDirectory';

export interface BotActivityLog {
  id: string;
  timestamp: string;
  botName: string;
  botEmail: string;
  department: string;
  type: 'chat' | 'email';
  destination: string;
  topic: 'verification_targets' | 'ops_progress' | 'hr_attendance' | 'tech_infra' | 'business_growth';
  preview: string;
}

// Scenarios library for high-fidelity enterprise bot generation
const VERIFICATION_TARGET_MESSAGES = [
  'Morning shift account verification update: 68/75 Google Ads accounts cleared. On track to exceed the 150 daily target before 16:00 IST.',
  'Bulk KYC verification for 22 Telegram merchant accounts completed. All documents authenticated against MCA registry.',
  'Meta Ads verification batch #418 completed: 34 active advertiser accounts audited, 0 policy violations detected.',
  'Daily Target Tracker: Ops team has verified 142 client accounts so far today! Target of 150 will be locked shortly.',
  'Shopify merchant verification batch #882 signed off. Deal value INR 4,80,000 processed into CRM ledger.',
  'AWS cloud account verification queue cleared. All 18 pending API credentials confirmed active and secured.',
  'Verification SLA benchmark: 99.4% of today accounts processed within the mandatory 45-minute inspection window.',
  'Affiliate Network accounts review: 15 tier-1 affiliate publishers verified and forwarded to Accounts for commission setup.'
];

const OPS_PROGRESS_MESSAGES = [
  'Ops Queue status: Verification backlog down to 4 accounts. Shift turnaround time averaging 14 minutes.',
  'Concurrent review locking enabled for high-value client account #CC-VAL-9022. Escalated to Vikram Malhotra for final approval.',
  'Anti-fraud check passed for 12 newly submitted corporate advertiser accounts from CyberCity branch.',
  'Document Authentication Desk: 31 PAN cards and GST certificates verified with live government sandbox.',
  'Ops handover for Evening Shift: 9 pending verification tickets assigned to Pooja Reddy and team. Clear roadmap for tonight.',
  'Operations verification progress: Zero critical bottlenecks across Google Ads and Telegram merchant streams today.',
  'Verification quality audit completed for week 43: 100% compliance score across statutory documentation checks.',
  'Client verification report dispatched for deal ref #DL-9914 (Value: INR 2,50,000). Forwarded to finance ledger.'
];

const HR_ATTENDANCE_MESSAGES = [
  'HR Notice: Please ensure all morning punches are completed within the 15-minute grace window (09:45 AM IST cutoff).',
  'Attendance Regularization reminder: Staff with unpunched shifts from yesterday must submit regularizations with TL justification before 18:00 IST.',
  'Friendly reminder regarding break governance: Cumulative daily break allowance is 60 minutes. Overstays automatically flag HR review.',
  'HR Helpdesk update: All 14 pending leave requests for Diwali operational coverage have been processed and updated in the roster.',
  'Statutory DPDP employee consent forms are now 98% complete. Remaining staff please sign digitally via Employee Onboarding portal.',
  'Shift Schedule Notice: Night Infrastructure Shift starts at 22:00 IST. Grace period applies up to 22:15 IST.',
  'Clarification on Half-Day policy: Minimum 4.5 hours of continuous workstation presence required for half-day credit.',
  'Wellness reminder: Ergonomic desk stretches and water breaks recommended during intensive verification review sprints!'
];

const TECH_INFRA_MESSAGES = [
  'IT Infrastructure: Workstation VPN and biometric auth server operating with 99.98% uptime across all campuses.',
  'Database sync run completed successfully. 1,420 immutable audit logs archived into primary compliance storage.',
  'System security scan: 0 unauthorized endpoint access attempts recorded. 2FA enforcement active on 100% of accounts.',
  'API gateway latency stable at 42ms for external KYC document validation services.'
];

const BUSINESS_GROWTH_MESSAGES = [
  'New enterprise client lead onboarded: FastTrack Digital Solutions (Projected Deal Value: INR 7,50,000).',
  'CRM Dealer Network update: 3 new corporate dealers registered in Telangana & Maharashtra regions.',
  'Q4 Growth milestone reached: Cross-department collaboration enabled 15% increase in verified ad campaigns this month!'
];

// Operational Email Templates
const EMAIL_TEMPLATES = [
  {
    topic: 'verification_targets' as const,
    subject: '[DAILY TARGETS] Operations Account Verification Status Report - 142/150 Cleared',
    body: `Dear Team & Leadership,

Here is the midday operational report on daily account verification targets:

1. Target Allocation: 150 Corporate Accounts
2. Completed & Verified: 142 Accounts (94.6% Target Attained)
3. Platform Breakdown:
   - Google Ads Accounts: 68 Verified (100% cleared)
   - Meta Ads Platform: 34 Verified
   - Telegram Merchant Network: 22 Verified
   - Shopify & E-commerce: 18 Verified
4. Pending Verification: 8 Accounts (Under Tier-2 KYC inspection)

Shift productivity is running 12% ahead of schedule with an average review turnaround time of 14.2 minutes per account.

Warm regards,
Aarav Mehta | Senior Verification Analyst
ClickCamp Operations Verification Suite`
  },
  {
    topic: 'ops_progress' as const,
    subject: '[OPS PROGRESS] Batch #409 Account Verification Sign-Off & KYC Clearance',
    body: `To: adnan.malik@clickcamp.site, operations@clickcamp.site
From: Vikram Malhotra & Ops Verification Team

Team,

We are pleased to report that Batch #409 consisting of 45 high-value advertiser accounts has completed multi-point verification:

- MCA Company Registration verified against active government registry
- Corporate Bank Mandates & IFSC confirmation authenticated
- Dual supervisor authorization completed in the Ops Verification Queue
- Deal values totaling INR 18,40,000 forwarded to Accounts for financial ledger balancing

All verification audit logs have been cryptographically committed to the system compliance archive.

Best regards,
Operations Verification Management
ClickCamp Digital Hub`
  },
  {
    topic: 'hr_attendance' as const,
    subject: '[HR POLICY] Workstation Attendance Regularization & Shift Grace Window Guidelines',
    body: `Dear ClickCamp Employees,

People & Talent Operations has published updated guidance regarding attendance and shift governance:

1. Daily Shift Timings & Grace Periods:
   - General Shift (09:30 AM - 06:30 PM IST): Grace window permits punches up to 09:45 AM IST.
   - Punches recorded after 09:45 AM will automatically trigger a Late Login Anomaly in the Anomaly Engine.

2. Break Management Rules:
   - Standard lunch allotment: 45 minutes max.
   - Cumulative daily breaks must not exceed 60 minutes.
   - Please utilize the interactive Break Management timer in the Calendar & Attendance portal.

3. Regularization Requests:
   - Any punch anomalies must be regularized within 48 hours with team leader endorsement.

For queries, reach out to hr@clickcamp.site or ping in the #hr-and-attendance chat channel.

Sincerely,
Priya Nambiar | Lead - People & Talent Operations
ClickCamp HR Governance`
  },
  {
    topic: 'ops_progress' as const,
    subject: '[RISK ALERT RESOLUTION] High-Value Merchant KYC Anomaly Successfully Waived',
    body: `Attention: Super Admin & Managing Director

Regarding client account #CC-VAL-9022 (Deal Value INR 5,00,000):

The initial mismatch regarding the GST trade name has been resolved following secondary director identity submission and video KYC verification. 

- Status updated to: VERIFIED
- Reviewer: Vikram Malhotra (Operations Lead)
- Immutable audit log reference: AUD-2026-10-8812

The account is now active and unrestricted for full campaign execution.

Regards,
Kavita Chawla | Senior Ops Verification Specialist`
  },
  {
    topic: 'hr_attendance' as const,
    subject: '[ATTENDANCE AUDIT] Weekly Biometric Presence & Shift Compliance Summary',
    body: `Confidential - For Executive Review

Executive Summary for Week 43 Attendance:
- Total Active Workforce: 116 Personnel
- Average Daily Attendance Rate: 98.2%
- Total Approved Regularizations: 6
- Late Arrival Anomalies: 3 (All within permissible monthly threshold)
- Full Day Credit Compliance: 97.4%

No unexcused absences or statutory deductions were incurred this week.

People Operations Department
ClickCamp Enterprise Workspace`
  }
];

export class SimulatedBotEngine {
  private static instance: SimulatedBotEngine;
  private intervalId: any = null;
  private isRunning: boolean = false;
  private botPool: UserAccount[] = SIMULATED_BOT_USERS;
  private activityLogs: BotActivityLog[] = [];
  private listeners: ((log: BotActivityLog) => void)[] = [];

  private constructor() {
    // Seed initial activity logs
    this.seedInitialActivity();
  }

  public static getInstance(): SimulatedBotEngine {
    if (!SimulatedBotEngine.instance) {
      SimulatedBotEngine.instance = new SimulatedBotEngine();
    }
    return SimulatedBotEngine.instance;
  }

  public getBotPool(): UserAccount[] {
    return this.botPool;
  }

  public getActivityLogs(): BotActivityLog[] {
    return this.activityLogs;
  }

  public subscribe(fn: (log: BotActivityLog) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notifyListeners(log: BotActivityLog) {
    this.activityLogs = [log, ...this.activityLogs.slice(0, 49)];
    this.listeners.forEach((l) => {
      try {
        l(log);
      } catch (e) {
        console.error('Error in bot listener:', e);
      }
    });
  }

  private seedInitialActivity() {
    this.activityLogs = [
      {
        id: 'act-01',
        timestamp: 'Just now',
        botName: 'Aarav Mehta',
        botEmail: 'aarav.mehta@clickcamp.site',
        department: 'Managers',
        type: 'chat',
        destination: '#ops-verifications',
        topic: 'verification_targets',
        preview: 'Ops verification target tracker: 142/150 accounts verified.'
      },
      {
        id: 'act-02',
        timestamp: '2 mins ago',
        botName: 'Priya Nambiar',
        botEmail: 'priya.nambiar@clickcamp.site',
        department: 'HR',
        type: 'email',
        destination: 'all-staff@clickcamp.site',
        topic: 'hr_attendance',
        preview: 'Workstation Attendance Regularization & Shift Grace Window Guidelines'
      },
      {
        id: 'act-03',
        timestamp: '4 mins ago',
        botName: 'Tanvi Deshmukh',
        botEmail: 'tanvi.deshmukh@clickcamp.site',
        department: 'Managers',
        type: 'chat',
        destination: '#ops-verifications',
        topic: 'ops_progress',
        preview: 'Shopify merchant verification batch #882 signed off.'
      }
    ];
  }

  // Start 24/7 automated generation (default: triggers every 45-60 seconds)
  public start(
    onNewChatMessage: (msg: ChatMessage) => void,
    onNewWebmail: (mail: WebmailItem) => void,
    intervalMs: number = 50000 // ~50 seconds (at least once per minute)
  ) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      this.executeRandomBotActivity(onNewChatMessage, onNewWebmail);
    }, intervalMs);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  // Force trigger an instant simulation action
  public triggerInstantSimulation(
    onNewChatMessage: (msg: ChatMessage) => void,
    onNewWebmail: (mail: WebmailItem) => void
  ) {
    this.executeRandomBotActivity(onNewChatMessage, onNewWebmail);
  }

  // Execute a randomized realistic action
  private executeRandomBotActivity(
    onNewChatMessage: (msg: ChatMessage) => void,
    onNewWebmail: (mail: WebmailItem) => void
  ) {
    // 70% chat messages, 30% emails
    const isEmail = Math.random() < 0.3;

    if (isEmail) {
      this.generateSimulatedEmail(onNewWebmail);
    } else {
      this.generateSimulatedChatMessage(onNewChatMessage);
    }
  }

  private generateSimulatedChatMessage(onNewChatMessage: (msg: ChatMessage) => void) {
    // Pick topic
    const topics: ('verification_targets' | 'ops_progress' | 'hr_attendance' | 'tech_infra' | 'business_growth')[] = [
      'verification_targets',
      'ops_progress',
      'hr_attendance',
      'verification_targets',
      'ops_progress',
      'business_growth'
    ];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    let channelId = 'c-ops';
    let messagePool = VERIFICATION_TARGET_MESSAGES;
    let deptFilter: string[] = ['Managers'];

    if (topic === 'verification_targets') {
      channelId = 'c-ops';
      messagePool = VERIFICATION_TARGET_MESSAGES;
      deptFilter = ['Managers', 'Business'];
    } else if (topic === 'ops_progress') {
      channelId = 'c-ops';
      messagePool = OPS_PROGRESS_MESSAGES;
      deptFilter = ['Managers'];
    } else if (topic === 'hr_attendance') {
      channelId = 'c-general';
      messagePool = HR_ATTENDANCE_MESSAGES;
      deptFilter = ['HR', 'Managers'];
    } else if (topic === 'tech_infra') {
      channelId = 'c-tech';
      messagePool = TECH_INFRA_MESSAGES;
      deptFilter = ['IT'];
    } else {
      channelId = 'c-leads';
      messagePool = BUSINESS_GROWTH_MESSAGES;
      deptFilter = ['Business'];
    }

    // Pick a bot from the pool matching the department
    const eligibleBots = this.botPool.filter((b) => deptFilter.includes(b.department));
    const bot = eligibleBots.length > 0 ? eligibleBots[Math.floor(Math.random() * eligibleBots.length)] : this.botPool[0];

    const text = messagePool[Math.floor(Math.random() * messagePool.length)];
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newMsg: ChatMessage = {
      id: `msg-bot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      channelId,
      senderId: bot.id,
      senderName: bot.name,
      senderAvatar: bot.avatarUrl,
      senderRole: bot.roleLabel,
      isDirect: false,
      text,
      timestamp: timeStr,
      status: 'delivered'
    };

    onNewChatMessage(newMsg);

    this.notifyListeners({
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      botName: bot.name,
      botEmail: bot.email,
      department: bot.department,
      type: 'chat',
      destination: `#${channelId.replace('c-', '')}`,
      topic,
      preview: text
    });
  }

  private generateSimulatedEmail(onNewWebmail: (mail: WebmailItem) => void) {
    const template = EMAIL_TEMPLATES[Math.floor(Math.random() * EMAIL_TEMPLATES.length)];

    // Pick a bot matching the topic
    let dept = 'Managers';
    if (template.topic === 'hr_attendance') dept = 'HR';
    else if (template.topic === 'verification_targets') dept = 'Managers';

    const eligible = this.botPool.filter((b) => b.department === dept);
    const bot = eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : this.botPool[0];

    const newEmail: WebmailItem = {
      id: `em-bot-${Date.now()}`,
      folder: 'inbox',
      from: bot.name,
      fromEmail: bot.email,
      toEmail: 'adnan.malik@clickcamp.site',
      subject: template.subject,
      body: template.body,
      date: 'Today',
      isRead: false,
      isStarred: false,
      isHiddenFromUser: false
    };

    onNewWebmail(newEmail);

    this.notifyListeners({
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      botName: bot.name,
      botEmail: bot.email,
      department: bot.department,
      type: 'email',
      destination: 'Webmail Inbox',
      topic: template.topic,
      preview: template.subject
    });
  }
}

export const botEngine = SimulatedBotEngine.getInstance();
