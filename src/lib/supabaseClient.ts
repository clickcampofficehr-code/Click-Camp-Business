import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Verify if credentials are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Database Table Types
export interface ProfileRow {
  id: string;
  role: 'super_admin' | 'hr_admin' | 'employee' | string;
  name: string;
  email: string;
  avatar_url?: string | null;
  department: string;
  designation: string;
  phone?: string | null;
  probation_status?: 'under_probation' | 'confirmed' | 'extended' | 'separated' | string;
  probation_end_date?: string | null;
  is_active: boolean;
  supervisor_passcode_hash?: string | null;
  totp_secret?: string | null;
  two_factor_enabled: boolean;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
  blood_group?: string | null;
  dob?: string | null;
  gender?: string | null;
  personal_email?: string | null;
  bio?: string | null;
  pan_number?: string | null;
  aadhaar_number?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
  bank_ifsc?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRow {
  id: string;
  employee_id: string;
  form_name: string;
  file_url: string;
  file_type?: string;
  file_size_bytes?: number;
  approval_status: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  upload_timestamp: string;
}

export interface TaskRow {
  id: string;
  title: string;
  description?: string | null;
  assignee_id: string;
  assigner_id: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id?: string | null;
  channel_name?: string | null;
  content: string;
  attachments?: any;
  is_read: boolean;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  user_id?: string | null;
  user_email: string;
  action_type: 'LOGIN' | 'AUTH_FAILURE' | 'TASK_ASSIGNED' | 'TASK_STATUS' | 'DOCUMENT_UPLOAD' | 'APPROVAL' | 'SECURITY_LOCK' | 'CREDENTIAL_CHANGE';
  description: string;
  ip_address?: string | null;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface NoticeRow {
  id: string;
  title: string;
  content: string;
  priority: 'urgent' | 'high' | 'normal' | 'info';
  category: 'General' | 'Operations' | 'HR & Policy' | 'System Maintenance' | 'Holiday & Event';
  target_department: string;
  author_id: string;
  author_name: string;
  author_role: string;
  is_pinned: boolean;
  acknowledgements?: string[];
  created_at: string;
  updated_at?: string | null;
}

export interface DatabaseSchema {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string; name: string; email: string };
        Update: Partial<ProfileRow>;
      };
      documents_compliance: {
        Row: DocumentRow;
        Insert: Omit<DocumentRow, 'id' | 'upload_timestamp'> & { id?: string };
        Update: Partial<DocumentRow>;
      };
      tasks: {
        Row: TaskRow;
        Insert: Omit<TaskRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<TaskRow>;
      };
      messages_chat: {
        Row: MessageRow;
        Insert: Omit<MessageRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<MessageRow>;
      };
      audit_logs: {
        Row: AuditLogRow;
        Insert: Omit<AuditLogRow, 'id' | 'timestamp'> & { id?: string };
        Update: Partial<AuditLogRow>;
      };
      notices: {
        Row: NoticeRow;
        Insert: Omit<NoticeRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<NoticeRow>;
      };
    };
  };
}

// Instantiate Supabase Client (safe fallback if not yet configured)
let supabaseInstance: SupabaseClient<DatabaseSchema> | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient<DatabaseSchema>(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
  }
}

export const supabase = supabaseInstance;
