-- ==================== FIX RLS POLICIES FOR HEAD_ADMIN ====================
-- This script explicitly grants head_admin full access to all tables
-- while maintaining student-level restrictions
-- Execute with service role key to bypass RLS during policy creation

-- ==================== USERS TABLE ====================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view themselves" ON users;
DROP POLICY IF EXISTS "Service role can access users" ON users;

-- Head admin can do anything
CREATE POLICY "Head admin can manage all users" ON users
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');

-- Users can view themselves
CREATE POLICY "Users can view themselves" ON users
  FOR SELECT
  USING (id = auth.uid());

-- ==================== STUDENT_PROFILES TABLE ====================
DROP POLICY IF EXISTS "Student can view own profile" ON student_profiles;
DROP POLICY IF EXISTS "Student can update own profile" ON student_profiles;

-- Head admin can do anything
CREATE POLICY "Head admin can manage all student profiles" ON student_profiles
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');

-- Students can view and update their own
CREATE POLICY "Student can view own profile" ON student_profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Student can update own profile" ON student_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==================== ADMIN_PROFILES TABLE ====================
DROP POLICY IF EXISTS "Admin can view own admin profile" ON admin_profiles;

-- Head admin can do anything
CREATE POLICY "Head admin can manage all admin profiles" ON admin_profiles
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');

-- Admins can view their own
CREATE POLICY "Admin can view own admin profile" ON admin_profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- ==================== APPLICATIONS TABLE ====================
DROP POLICY IF EXISTS "Student can view own application" ON applications;
DROP POLICY IF EXISTS "Student can update own application" ON applications;
DROP POLICY IF EXISTS "Student can insert own application" ON applications;

-- Head admin can do anything
CREATE POLICY "Head admin can manage all applications" ON applications
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');

-- Students can view, insert, and update their own
CREATE POLICY "Student can view own application" ON applications
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Student can insert own application" ON applications
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Student can update own application" ON applications
  FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ==================== DOCUMENTS TABLE ====================
DROP POLICY IF EXISTS "Student can view own documents" ON documents;
DROP POLICY IF EXISTS "Student can insert own documents" ON documents;
DROP POLICY IF EXISTS "Student can update own documents" ON documents;

-- Head admin can do anything
CREATE POLICY "Head admin can manage all documents" ON documents
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');

-- Students can view, insert, and update their own
CREATE POLICY "Student can view own documents" ON documents
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Student can insert own documents" ON documents
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Student can update own documents" ON documents
  FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ==================== APPLICATION_HISTORY TABLE ====================
DROP POLICY IF EXISTS "Student can view own application history" ON application_history;

-- Head admin can do anything
CREATE POLICY "Head admin can manage all application history" ON application_history
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');

-- Students can view their own history
CREATE POLICY "Student can view own application history" ON application_history
  FOR SELECT
  USING (student_id = auth.uid());

-- ==================== PRE_APPROVED_EMAILS TABLE ====================
DROP POLICY IF EXISTS "Anyone can view pre-approved emails" ON pre_approved_emails;

-- Head admin can do anything
CREATE POLICY "Head admin can manage pre-approved emails" ON pre_approved_emails
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');

-- Anyone can view
CREATE POLICY "Anyone can view pre-approved emails" ON pre_approved_emails
  FOR SELECT
  USING (true);

-- ==================== VERIFICATION_SCHEDULES TABLE ====================
DROP POLICY IF EXISTS "Anyone can view verification schedules" ON verification_schedules;

-- Head admin can do anything
CREATE POLICY "Head admin can manage verification schedules" ON verification_schedules
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');

-- Anyone can view
CREATE POLICY "Anyone can view verification schedules" ON verification_schedules
  FOR SELECT
  USING (true);

-- ==================== FINANCIAL_DISTRIBUTION_SCHEDULES TABLE ====================
DROP POLICY IF EXISTS "Anyone can view distribution schedules" ON financial_distribution_schedules;

-- Head admin can do anything
CREATE POLICY "Head admin can manage distribution schedules" ON financial_distribution_schedules
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');

-- Anyone can view
CREATE POLICY "Anyone can view distribution schedules" ON financial_distribution_schedules
  FOR SELECT
  USING (true);

-- ==================== NOTIFICATIONS TABLE ====================
DROP POLICY IF EXISTS "User can view own notifications" ON notifications;

-- Head admin can do anything
CREATE POLICY "Head admin can manage notifications" ON notifications
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');

-- Users can view their own
CREATE POLICY "User can view own notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- ==================== TESTIMONIALS TABLE ====================
DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
DROP POLICY IF EXISTS "Student can insert testimonials" ON testimonials;

-- Head admin can do anything
CREATE POLICY "Head admin can manage testimonials" ON testimonials
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');

-- Public can view
CREATE POLICY "Public can view testimonials" ON testimonials
  FOR SELECT
  USING (true);

-- Students can insert
CREATE POLICY "Student can insert testimonials" ON testimonials
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- ==================== PASSWORD_RESET_TOKENS TABLE ====================
DROP POLICY IF EXISTS "Service role only for reset tokens" ON password_reset_tokens;

-- Head admin can do anything
CREATE POLICY "Head admin can manage reset tokens" ON password_reset_tokens
  FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin')
  WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND (SELECT admin_role FROM users WHERE id = auth.uid()) = 'head_admin');
