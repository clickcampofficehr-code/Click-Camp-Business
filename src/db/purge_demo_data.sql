-- ==============================================================================
-- Click Camp Business and Technology Services Limited
-- Production Database Wipe & Demo Data Purge Script
-- Run this in Supabase SQL Editor to clean all test data before production rollout
-- ==============================================================================

BEGIN;

-- 1. Purge all test and demo tasks
DELETE FROM public.tasks 
WHERE title ILIKE '%Demo%' 
   OR title ILIKE '%Sample%' 
   OR title ILIKE '%Test%' 
   OR title ILIKE '%Simulated%';

-- 2. Purge sample chat messages and team channels
DELETE FROM public.messages_chat 
WHERE content ILIKE '%Sample%' 
   OR content ILIKE '%Welcome to ClickCamp team chat%'
   OR content ILIKE '%Test message%';

-- 3. Purge placeholder documents and demo compliance uploads
DELETE FROM public.documents_compliance 
WHERE form_name ILIKE '%Demo%' 
   OR form_name ILIKE '%Sample%'
   OR file_url ILIKE '%placeholder%';

-- 4. Purge demo audit log entries
DELETE FROM public.audit_logs 
WHERE description ILIKE '%Simulated%' 
   OR description ILIKE '%demo%'
   OR description ILIKE '%Test%';

-- 5. Purge test circulars from company notice board
DELETE FROM public.notices
WHERE title ILIKE '%Test%' 
   OR title ILIKE '%Sample%' 
   OR content ILIKE '%Lorem ipsum%';

-- 6. Purge test employee profiles (retaining only real enterprise administrators)
-- Keep Adnan Malik (Super Admin) or real registered corporate emails
DELETE FROM public.profiles 
WHERE email NOT IN (
  'adnanmaliklyx@gmail.com',
  'adnan.malik@clickcamp.tech'
) 
AND (
  email LIKE '%test%' 
  OR name LIKE '%Test User%' 
  OR email LIKE '%example.com'
);

-- 7. Clean and re-seed clean baseline audit entry
INSERT INTO public.audit_logs (
  user_email,
  action_type,
  description,
  metadata
) VALUES (
  'adnanmaliklyx@gmail.com',
  'SECURITY_LOCK',
  'Production Database Sanitization Completed: Purged all development artifacts, test tasks, and demo records.',
  '{"status": "production_ready", "environment": "live"}'::jsonb
);

COMMIT;

-- Verification query
SELECT 'tasks_count' as metric, count(*) FROM public.tasks
UNION ALL
SELECT 'documents_count', count(*) FROM public.documents_compliance
UNION ALL
SELECT 'notices_count', count(*) FROM public.notices
UNION ALL
SELECT 'profiles_count', count(*) FROM public.profiles;
