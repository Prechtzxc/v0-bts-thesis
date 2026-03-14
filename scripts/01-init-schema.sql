-- BTS Scholarship Platform - Database Schema
-- All tables for real backend data persistence

-- Users table (base authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student', -- 'student' or 'admin'
  admin_role VARCHAR(50), -- 'head_admin', 'verifier_staff', 'scanner_staff'
  profile_picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20),
  address TEXT,
  age INTEGER,
  barangay VARCHAR(255),
  bio TEXT,
  school_name VARCHAR(255),
  course VARCHAR(255),
  year_level VARCHAR(50),
  student_id VARCHAR(100),
  is_pwd BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20),
  position VARCHAR(255),
  department VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scholarship Applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  course VARCHAR(255),
  year_level VARCHAR(50),
  school VARCHAR(255),
  barangay VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  feedback TEXT,
  is_pwd BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents (student uploads)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  url TEXT,
  file_size VARCHAR(50),
  semester VARCHAR(50),
  academic_year VARCHAR(50),
  feedback TEXT,
  uploaded_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application History
CREATE TABLE IF NOT EXISTS application_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  application_data JSONB,
  outcome VARCHAR(50), -- 'approved', 'rejected'
  financial_aid_amount DECIMAL(10, 2),
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-Approved Emails
CREATE TABLE IF NOT EXISTS pre_approved_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'available', -- 'available', 'used'
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMP,
  used_at TIMESTAMP,
  used_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification Schedules
CREATE TABLE IF NOT EXISTS verification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barangay VARCHAR(255),
  start_date DATE,
  end_date DATE,
  daily_limit INTEGER,
  status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'active', 'ended'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Distribution Schedules
CREATE TABLE IF NOT EXISTS financial_distribution_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barangays TEXT[], -- Array of barangay names
  start_date DATE,
  end_date DATE,
  start_time TIME,
  distribution_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'active', 'ended'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50), -- 'info', 'success', 'warning', 'announcement'
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  name VARCHAR(255),
  role VARCHAR(255),
  quote TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents(student_id);
CREATE INDEX IF NOT EXISTS idx_pre_approved_emails_email ON pre_approved_emails(email);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
