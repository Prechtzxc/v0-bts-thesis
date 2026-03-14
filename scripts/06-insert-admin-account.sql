-- Insert System Admin Account into Users Table
-- This script creates an admin account with plain text password (as per system design)
-- Email: admin@carmona.gov.ph
-- Password: Admin123
-- Role: System Admin with head_admin privileges

INSERT INTO public.users (
  id,
  name,
  email,
  password,
  role,
  admin_role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'System Admin',
  'admin@carmona.gov.ph',
  'Admin123',
  'admin',
  'head_admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = 'Admin123',
  role = 'admin',
  admin_role = 'head_admin',
  name = 'System Admin',
  updated_at = NOW();

-- Verify the account was created
SELECT id, name, email, role, admin_role, created_at FROM public.users WHERE email = 'admin@carmona.gov.ph';
