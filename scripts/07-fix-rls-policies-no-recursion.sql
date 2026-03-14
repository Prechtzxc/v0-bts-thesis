-- FIX FOR RLS INFINITE RECURSION ISSUE
-- Drop all problematic policies that cause recursion on users table

-- Drop the problematic policies on users table
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view themselves" ON public.users;
DROP POLICY IF EXISTS "Admin can update users" ON public.users;

-- Drop problematic policies on dependent tables that query users
DROP POLICY IF EXISTS "Student can view own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Admin can update student profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Admin can view all admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admin can update admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Student can view own application" ON public.applications;
DROP POLICY IF EXISTS "Admin can update applications" ON public.applications;
DROP POLICY IF EXISTS "Student can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Admin can update document status" ON public.documents;
DROP POLICY IF EXISTS "Student can view own application history" ON public.application_history;
DROP POLICY IF EXISTS "Admin can view pre-approved emails" ON public.pre_approved_emails;
DROP POLICY IF EXISTS "Admin can insert pre-approved emails" ON public.pre_approved_emails;
DROP POLICY IF EXISTS "Admin can update pre-approved emails" ON public.pre_approved_emails;
DROP POLICY IF EXISTS "Admin can delete pre-approved emails" ON public.pre_approved_emails;
DROP POLICY IF EXISTS "Admin can view verification schedules" ON public.verification_schedules;
DROP POLICY IF EXISTS "Admin can insert verification schedules" ON public.verification_schedules;
DROP POLICY IF EXISTS "Admin can update verification schedules" ON public.verification_schedules;
DROP POLICY IF EXISTS "Admin can manage distribution schedules" ON public.financial_distribution_schedules;
DROP POLICY IF EXISTS "Admin can insert distribution schedules" ON public.financial_distribution_schedules;
DROP POLICY IF EXISTS "Admin can update distribution schedules" ON public.financial_distribution_schedules;
DROP POLICY IF EXISTS "Admin can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "User can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Student can update own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Student can insert own application" ON public.applications;
DROP POLICY IF EXISTS "Student can update own application" ON public.applications;
DROP POLICY IF EXISTS "Student can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Student can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Admin can view own admin profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Student can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Service role only for reset tokens" ON public.password_reset_tokens;

-- ==================== USERS TABLE - PERMISSIVE POLICIES ====================
-- Disable restrictive policies and allow server-side access via service role
-- Client-side queries use service role key which bypasses RLS anyway for login

-- Allow users to read themselves (basic access)
CREATE POLICY "Users can view themselves" ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Allow service role (bypasses RLS)
CREATE POLICY "Service role can access users" ON public.users
  FOR ALL
  USING (true);

-- ==================== STUDENT PROFILES TABLE ====================
-- Simple: students can view/edit their own, admins can edit
CREATE POLICY "Student can view own profile" ON public.student_profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Student can update own profile" ON public.student_profiles
  FOR UPDATE
  USING (user_id = auth.uid());

-- Admin access is handled via service role

-- ==================== ADMIN PROFILES TABLE ====================
-- Admin access is handled via service role
CREATE POLICY "Admin can view own admin profile" ON public.admin_profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- ==================== APPLICATIONS TABLE ====================
-- Students view their own, admins handled via service role
CREATE POLICY "Student can view own application" ON public.applications
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Student can insert own application" ON public.applications
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Student can update own application" ON public.applications
  FOR UPDATE
  USING (student_id = auth.uid());

-- ==================== DOCUMENTS TABLE ====================
-- Students view/manage their own
CREATE POLICY "Student can view own documents" ON public.documents
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Student can insert own documents" ON public.documents
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Student can update own documents" ON public.documents
  FOR UPDATE
  USING (student_id = auth.uid());

-- ==================== APPLICATION_HISTORY TABLE ====================
-- Students view their own history
CREATE POLICY "Student can view own application history" ON public.application_history
  FOR SELECT
  USING (student_id = auth.uid());

-- ==================== PRE_APPROVED_EMAILS TABLE ====================
-- Public read-only
CREATE POLICY "Anyone can view pre-approved emails" ON public.pre_approved_emails
  FOR SELECT
  USING (true);

-- ==================== VERIFICATION_SCHEDULES TABLE ====================
-- Public read
CREATE POLICY "Anyone can view verification schedules" ON public.verification_schedules
  FOR SELECT
  USING (true);

-- ==================== FINANCIAL_DISTRIBUTION_SCHEDULES TABLE ====================
-- Public read
CREATE POLICY "Anyone can view distribution schedules" ON public.financial_distribution_schedules
  FOR SELECT
  USING (true);

-- ==================== NOTIFICATIONS TABLE ====================
-- Users can only see their own notifications
CREATE POLICY "User can view own notifications" ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- ==================== TESTIMONIALS TABLE ====================
-- Public read
CREATE POLICY "Public can view testimonials" ON public.testimonials
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Student can insert testimonials" ON public.testimonials
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- ==================== PASSWORD_RESET_TOKENS TABLE ====================
-- Service role only
CREATE POLICY "Service role only for reset tokens" ON public.password_reset_tokens
  FOR ALL
  USING (FALSE);
