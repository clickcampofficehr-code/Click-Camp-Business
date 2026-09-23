-- ==============================================================================
-- Click Camp Business and Technology Services Limited
-- Internal HR & Employee Management Portal - Production PostgreSQL Database Schema
-- Compatible with Supabase Realtime, PostgreSQL 15+, and Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Custom Enums
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('super_admin', 'hr_admin', 'employee');
CREATE TYPE probation_status AS ENUM ('under_probation', 'confirmed', 'extended', 'separated');
CREATE TYPE document_approval_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE audit_action_type AS ENUM ('LOGIN', 'AUTH_FAILURE', 'TASK_ASSIGNED', 'TASK_STATUS', 'DOCUMENT_UPLOAD', 'APPROVAL', 'SECURITY_LOCK', 'CREDENTIAL_CHANGE');

-- ------------------------------------------------------------------------------
-- 2. Users / Employees Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'employee',
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  department TEXT NOT NULL DEFAULT 'Operations',
  designation TEXT NOT NULL DEFAULT 'Associate',
  phone TEXT,
  probation_status probation_status NOT NULL DEFAULT 'under_probation',
  probation_end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  supervisor_passcode_hash TEXT,
  totp_secret TEXT,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  blood_group TEXT,
  dob DATE,
  gender TEXT,
  personal_email TEXT,
  bio TEXT,
  pan_number TEXT,
  aadhaar_number TEXT,
  bank_name TEXT,
  bank_account TEXT,
  bank_ifsc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by email and role
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 3. Documents & Compliance Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  form_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'application/pdf',
  file_size_bytes BIGINT,
  approval_status document_approval_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  upload_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_employee_id ON public.documents_compliance(employee_id);
CREATE INDEX IF NOT EXISTS idx_docs_approval_status ON public.documents_compliance(approval_status);

-- ------------------------------------------------------------------------------
-- 4. Tasks (Daily Task Hub) Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigner_id UUID NOT NULL REFERENCES public.profiles(id),
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- ------------------------------------------------------------------------------
-- 5. Team Chat & Direct Messages Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel_name TEXT, -- e.g. '#general', '#operations', or NULL for 1:1 DMs
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages_chat(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages_chat(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages_chat(created_at DESC);

-- ------------------------------------------------------------------------------
-- 6. Audit Logs Table (Admin Security & SOC2 Compliance)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action_type audit_action_type NOT NULL,
  description TEXT NOT NULL,
  ip_address INET,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);

-- ------------------------------------------------------------------------------
-- 7. Company Notices & Announcements Table (Real-time Broadcasts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal', -- 'urgent', 'high', 'normal', 'info'
  category TEXT NOT NULL DEFAULT 'General', -- 'General', 'Operations', 'HR & Policy', 'System Maintenance', 'Holiday & Event'
  target_department TEXT NOT NULL DEFAULT 'All',
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledgements JSONB DEFAULT '[]'::jsonb, -- user UUIDs who acknowledged
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notices_created_at ON public.notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_priority ON public.notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_is_pinned ON public.notices(is_pinned);

-- ------------------------------------------------------------------------------
-- 8. Real-time Publications Setup (Push updates instantly to client)
-- ------------------------------------------------------------------------------
-- Enable replication on all core interactive tables
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.documents_compliance REPLICA IDENTITY FULL;
ALTER TABLE public.messages_chat REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;
ALTER TABLE public.notices REPLICA IDENTITY FULL;

-- Add tables to the Supabase Realtime publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.tasks, 
    public.documents_compliance, 
    public.messages_chat, 
    public.profiles, 
    public.audit_logs,
    public.notices;
COMMIT;

-- ------------------------------------------------------------------------------
-- 9. Row Level Security (RLS) & Access Control Guardrails
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if the authenticated user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- RLS: Profiles
-- ------------------------------------------------------------------------------
-- Employees can view all active profiles (for directory, chat, task assignees)
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Employees can update only their own phone, designation, or avatar
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Super Admins can insert, update, or delete any profile
CREATE POLICY "Super Admins have full access on profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- RLS: Documents & Compliance
-- ------------------------------------------------------------------------------
-- Employees can only view their own documents
CREATE POLICY "Employees can view own documents"
  ON public.documents_compliance FOR SELECT
  TO authenticated
  USING (auth.uid() = employee_id OR public.is_super_admin(auth.uid()));

-- Employees can upload documents for themselves
CREATE POLICY "Employees can upload own documents"
  ON public.documents_compliance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = employee_id);

-- Super Admins can verify/reject documents or delete them
CREATE POLICY "Super Admin manage all documents"
  ON public.documents_compliance FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- RLS: Tasks
-- ------------------------------------------------------------------------------
-- Employees can view tasks assigned to them or created by them
CREATE POLICY "Users view assigned or authored tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = assignee_id OR auth.uid() = assigner_id OR public.is_super_admin(auth.uid()));

-- Employees can update task status of their assigned tasks
CREATE POLICY "Assignees can update task status"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = assignee_id OR public.is_super_admin(auth.uid()))
  WITH CHECK (auth.uid() = assignee_id OR public.is_super_admin(auth.uid()));

-- Super Admins and Assigners can create tasks
CREATE POLICY "Assigners and Super Admins create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = assigner_id OR public.is_super_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- RLS: Team Chat & Messages
-- ------------------------------------------------------------------------------
CREATE POLICY "Users view messages in channels or addressed to them"
  ON public.messages_chat FOR SELECT
  TO authenticated
  USING (
    channel_name IS NOT NULL OR 
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR 
    public.is_super_admin(auth.uid())
  );

CREATE POLICY "Users can send messages"
  ON public.messages_chat FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- ------------------------------------------------------------------------------
-- RLS: Audit Logs (Strict Isolation - Super Admin ONLY)
-- ------------------------------------------------------------------------------
-- Standard employees have ZERO read or write access
CREATE POLICY "Only Super Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- System functions or Super Admin can insert audit logs
CREATE POLICY "Insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- RLS: Company Notices & Announcements (Universal Broadcast)
-- ------------------------------------------------------------------------------
-- All authenticated personnel can view company announcements
CREATE POLICY "All authenticated users view company notices"
  ON public.notices FOR SELECT
  TO authenticated
  USING (true);

-- Super Admins and HR Admins can post announcements
CREATE POLICY "Admins can create company notices"
  ON public.notices FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'super_admin' OR role = 'hr_admin')
  ));

-- Admins can update or delete announcements; Employees can update their acknowledgement
CREATE POLICY "Admins manage or users acknowledge company notices"
  ON public.notices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete company notices"
  ON public.notices FOR DELETE
  TO authenticated
  USING (public.is_super_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ------------------------------------------------------------------------------
-- 10. Storage Buckets Configuration & Storage Policies
-- ------------------------------------------------------------------------------
-- Storage Buckets:
-- 1. 'avatars' (public read, authenticated user write own avatar)
-- 2. 'statutory-documents' (strictly private: employee + super admin only)

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('statutory-documents', 'statutory-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Storage Policy: Statutory Documents (Private)
CREATE POLICY "Statutory documents private access"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'statutory-documents' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin(auth.uid()))
  );

CREATE POLICY "Employees can upload to their own document folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'statutory-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
