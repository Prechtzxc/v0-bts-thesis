-- Fix missing foreign keys, add missing fields, and establish proper relationships

-- 1. Add missing fields to financial_distribution_schedules for tracking claims
ALTER TABLE IF EXISTS financial_distribution_schedules
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS claimed_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS eligible BOOLEAN DEFAULT TRUE;

-- 2. Add missing fields to verification_schedules for better tracking
ALTER TABLE IF EXISTS verification_schedules
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'upcoming';

-- 3. Ensure application_history has proper foreign key to applications
ALTER TABLE IF EXISTS application_history
ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE CASCADE;

-- 4. Add end_date tracking to verification
ALTER TABLE IF EXISTS verification_schedules
ADD COLUMN IF NOT EXISTS end_time TIME;

-- 5. Ensure documents have all required foreign keys and constraints
ALTER TABLE IF EXISTS documents
ADD CONSTRAINT fk_documents_student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

-- 6. Ensure applications have all required foreign keys
ALTER TABLE IF EXISTS applications
ADD CONSTRAINT fk_applications_student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

-- 7. Ensure student_profiles has proper constraint
ALTER TABLE IF EXISTS student_profiles
ADD CONSTRAINT fk_student_profiles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 8. Ensure admin_profiles has proper constraint
ALTER TABLE IF EXISTS admin_profiles
ADD CONSTRAINT fk_admin_profiles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 9. Ensure notifications have proper constraint
ALTER TABLE IF EXISTS notifications
ADD CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 10. Ensure pre_approved_emails references are correct
ALTER TABLE IF EXISTS pre_approved_emails
ADD CONSTRAINT fk_pre_approved_emails_added_by FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_pre_approved_emails_used_by FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL;

-- 11. Ensure testimonials reference is correct
ALTER TABLE IF EXISTS testimonials
ADD CONSTRAINT fk_testimonials_student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

-- 12. Ensure verification_schedules references are correct
ALTER TABLE IF EXISTS verification_schedules
ADD CONSTRAINT fk_verification_schedules_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 13. Ensure financial_distribution_schedules references are correct
ALTER TABLE IF EXISTS financial_distribution_schedules
ADD CONSTRAINT fk_financial_distribution_schedules_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_application_history_student_id ON application_history(student_id);
CREATE INDEX IF NOT EXISTS idx_application_history_application_id ON application_history(application_id);
CREATE INDEX IF NOT EXISTS idx_financial_distribution_schedules_student_id ON financial_distribution_schedules(student_id);
CREATE INDEX IF NOT EXISTS idx_financial_distribution_schedules_claimed ON financial_distribution_schedules(claimed);
CREATE INDEX IF NOT EXISTS idx_testimonials_student_id ON testimonials(student_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
