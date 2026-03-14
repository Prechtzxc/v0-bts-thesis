-- TEMPORARY: Disable RLS on all tables to confirm admin access works
-- This is for debugging only - will be re-enabled with proper policies

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_approved_emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_distribution_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
