-- PRODUCTION-READY ROW LEVEL SECURITY (RLS) POLICIES
-- Enforce data access integrity at the database level

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_approved_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_distribution_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- ==================== USERS TABLE RLS ====================
-- Admin can view all users; students can only view themselves
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can view themselves" ON users
  FOR SELECT
  USING (id = auth.uid());

-- Only admins can update users
CREATE POLICY "Admin can update users" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- ==================== STUDENT PROFILES TABLE RLS ====================
-- Students can view/edit their own profile; admins can view all
CREATE POLICY "Student can view own profile" ON student_profiles
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Student can update own profile" ON student_profiles
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admin can update student profiles" ON student_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== ADMIN PROFILES TABLE RLS ====================
-- Admins can view all admin profiles; staff can view themselves
CREATE POLICY "Admin can view all admin profiles" ON admin_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update admin profiles" ON admin_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== APPLICATIONS TABLE RLS ====================
-- Students can view/edit their own application; admins can view all
CREATE POLICY "Student can view own application" ON applications
  FOR SELECT
  USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Student can insert own application" ON applications
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Student can update own application" ON applications
  FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Admin can update applications" ON applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== DOCUMENTS TABLE RLS ====================
-- Students can view/upload their own documents; admins can view all
CREATE POLICY "Student can view own documents" ON documents
  FOR SELECT
  USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Student can insert own documents" ON documents
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Student can update own documents" ON documents
  FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Admin can update document status" ON documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== APPLICATION_HISTORY TABLE RLS ====================
-- Students can view their own history; admins can view all
CREATE POLICY "Student can view own application history" ON application_history
  FOR SELECT
  USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ==================== PRE_APPROVED_EMAILS TABLE RLS ====================
-- Only admins can manage pre-approved emails
CREATE POLICY "Admin can view pre-approved emails" ON pre_approved_emails
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can insert pre-approved emails" ON pre_approved_emails
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update pre-approved emails" ON pre_approved_emails
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete pre-approved emails" ON pre_approved_emails
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== VERIFICATION_SCHEDULES TABLE RLS ====================
-- Admins can manage verification schedules
CREATE POLICY "Admin can view verification schedules" ON verification_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can insert verification schedules" ON verification_schedules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update verification schedules" ON verification_schedules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== FINANCIAL_DISTRIBUTION_SCHEDULES TABLE RLS ====================
-- Admins can manage; scanner staff can view and mark as claimed
CREATE POLICY "Admin can manage distribution schedules" ON financial_distribution_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can insert distribution schedules" ON financial_distribution_schedules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update distribution schedules" ON financial_distribution_schedules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== NOTIFICATIONS TABLE RLS ====================
-- Users can only see their own notifications
CREATE POLICY "User can view own notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin can insert notifications" ON notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== TESTIMONIALS TABLE RLS ====================
-- Students can view testimonials; only their own visible for edit
CREATE POLICY "Public can view testimonials" ON testimonials
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Student can insert testimonials" ON testimonials
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- ==================== PASSWORD_RESET_TOKENS TABLE RLS ====================
-- Service role only; no direct user access
CREATE POLICY "Service role only for reset tokens" ON password_reset_tokens
  FOR ALL
  USING (FALSE);
