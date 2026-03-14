-- SAFE, NON-RECURSIVE RLS POLICIES FOR HEAD_ADMIN
-- These policies use Supabase's auth.jwt() to check if the user is a head_admin
-- WITHOUT querying the users table, avoiding infinite recursion

-- USERS TABLE
-- head_admin can do everything, users can only view themselves
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "head_admin_full_access_users" ON users
  FOR ALL
  USING (auth.jwt() ->> 'user_metadata' ->> 'admin_role' = 'head_admin');

CREATE POLICY "users_view_self" ON users
  FOR SELECT
  USING (id = auth.uid());

-- STUDENT PROFILES TABLE
-- head_admin can do everything, students can only view/edit their own
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "head_admin_full_access_student_profiles" ON student_profiles
  FOR ALL
  USING (auth.jwt() ->> 'user_metadata' ->> 'admin_role' = 'head_admin');

CREATE POLICY "student_view_own_profile" ON student_profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "student_update_own_profile" ON student_profiles
  FOR UPDATE
  USING (user_id = auth.uid());

-- ADMIN PROFILES TABLE
-- head_admin can do everything
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "head_admin_full_access_admin_profiles" ON admin_profiles
  FOR ALL
  USING (auth.jwt() ->> 'user_metadata' ->> 'admin_role' = 'head_admin');

CREATE POLICY "admin_view_own_profile" ON admin_profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- APPLICATIONS TABLE
-- head_admin can do everything, students can view/edit their own
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "head_admin_full_access_applications" ON applications
  FOR ALL
  USING (auth.jwt() ->> 'user_metadata' ->> 'admin_role' = 'head_admin');

CREATE POLICY "student_view_own_applications" ON applications
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "student_insert_own_applications" ON applications
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "student_update_own_applications" ON applications
  FOR UPDATE
  USING (student_id = auth.uid());

-- DOCUMENTS TABLE
-- head_admin can do everything, students can view/manage their own
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "head_admin_full_access_documents" ON documents
  FOR ALL
  USING (auth.jwt() ->> 'user_metadata' ->> 'admin_role' = 'head_admin');

CREATE POLICY "student_view_own_documents" ON documents
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "student_insert_own_documents" ON documents
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "student_update_own_documents" ON documents
  FOR UPDATE
  USING (student_id = auth.uid());

-- APPLICATION_HISTORY TABLE
-- head_admin can view all, students can view their own
ALTER TABLE application_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "head_admin_full_access_history" ON application_history
  FOR ALL
  USING (auth.jwt() ->> 'user_metadata' ->> 'admin_role' = 'head_admin');

CREATE POLICY "student_view_own_history" ON application_history
  FOR SELECT
  USING (student_id = auth.uid());

-- PRE_APPROVED_EMAILS TABLE
-- head_admin has full access, public can read
ALTER TABLE pre_approved_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "head_admin_full_access_emails" ON pre_approved_emails
  FOR ALL
  USING (auth.jwt() ->> 'user_metadata' ->> 'admin_role' = 'head_admin');

CREATE POLICY "public_view_emails" ON pre_approved_emails
  FOR SELECT
  USING (true);

-- VERIFICATION_SCHEDULES TABLE
-- head_admin has full access, public can read
ALTER TABLE verification_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "head_admin_full_access_schedules" ON verification_schedules
  FOR ALL
  USING (auth.jwt() ->> 'user_metadata' ->> 'admin_role' = 'head_admin');

CREATE POLICY "public_view_schedules" ON verification_schedules
  FOR SELECT
  USING (true);

-- FINANCIAL_DISTRIBUTION_SCHEDULES TABLE
-- head_admin has full access, public can read
ALTER TABLE financial_distribution_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "head_admin_full_access_distribution" ON financial_distribution_schedules
  FOR ALL
  USING (auth.jwt() ->> 'user_metadata' ->> 'admin_role' = 'head_admin');

CREATE POLICY "public_view_distribution" ON financial_distribution_schedules
  FOR SELECT
  USING (true);

-- NOTIFICATIONS TABLE
-- head_admin can manage all, users can only view their own
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "head_admin_full_access_notifications" ON notifications
  FOR ALL
  USING (auth.jwt() ->> 'user_metadata' ->> 'admin_role' = 'head_admin');

CREATE POLICY "user_view_own_notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- TESTIMONIALS TABLE
-- head_admin can manage all, public can read, students can insert their own
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "head_admin_full_access_testimonials" ON testimonials
  FOR ALL
  USING (auth.jwt() ->> 'user_metadata' ->> 'admin_role' = 'head_admin');

CREATE POLICY "public_view_testimonials" ON testimonials
  FOR SELECT
  USING (true);

CREATE POLICY "student_insert_testimonials" ON testimonials
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- PASSWORD_RESET_TOKENS TABLE
-- Only service role should access (for password reset operations)
-- This table shouldn't be accessible via standard auth
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "no_direct_access_tokens" ON password_reset_tokens
  FOR ALL
  USING (false);
