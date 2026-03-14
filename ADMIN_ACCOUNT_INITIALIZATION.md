# Admin Account Initialization Guide

## Overview

This guide provides instructions to initialize the System Admin account in the BTS Scholarship system. The admin account is required for the application to function and provide access to all administrative features.

### Account Details
- **Name**: System Admin
- **Email**: admin@carmona.gov.ph
- **Password**: Admin123
- **Role**: admin
- **Admin Role**: head_admin (full permissions)

## Prerequisites

- Access to Supabase Dashboard for your project
- Admin/service role permissions to execute SQL
- The users table must exist (created by `scripts/01-init-schema.sql`)

## Method 1: Using Supabase Dashboard (Recommended for Quick Setup)

### Step 1: Access Supabase SQL Editor
1. Go to https://supabase.com and log in to your project
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query** or open an existing query window

### Step 2: Copy and Execute the SQL Script
1. Open `/scripts/06-insert-admin-account.sql` from your project
2. Copy the entire SQL content
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press `Ctrl+Enter`)

### Step 3: Verify the Account Was Created
The script includes a verification query at the end. You should see output like:

```
id                                   | name        | email                   | role  | admin_role | created_at
-------------------------------------+-------------+-------------------------+-------+------------+--------------------
550e8400-e29b-41d4-a716-446655440000 | System Admin | admin@carmona.gov.ph    | admin | head_admin | 2024-01-15 10:30:00
```

If you see this result, the admin account has been successfully created.

## Method 2: Using psql Command Line (For Advanced Users)

### Prerequisites
```bash
# Install PostgreSQL client tools
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client
# Windows: Download from https://www.postgresql.org/download/windows/
```

### Execute the Script
```bash
# Set your Supabase connection variables
export PGHOST="your-project.supabase.co"
export PGPORT="5432"
export PGDATABASE="postgres"
export PGUSER="postgres"
export PGPASSWORD="your-postgres-password"

# Run the SQL script
psql -f scripts/06-insert-admin-account.sql
```

## Method 3: Using the Vercel CLI (If Deployed)

After deploying to Vercel:

```bash
# Set environment variables from Vercel
vercel env pull

# Execute using Node.js
node -e "
const { createClient } = require('@supabase/supabase-js');
const sql = require('fs').readFileSync('./scripts/06-insert-admin-account.sql', 'utf8');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.rpc('exec_sql', { sql }).then(console.log).catch(console.error);
"
```

## Testing the Admin Account

After the script runs successfully, test the login:

### Test in Development
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Enter credentials:
   - **Email**: admin@carmona.gov.ph
   - **Password**: Admin123
4. You should be redirected to the admin dashboard

### Verify in Database
1. Go to Supabase Dashboard → SQL Editor
2. Run this query:
   ```sql
   SELECT id, name, email, role, admin_role, created_at 
   FROM public.users 
   WHERE email = 'admin@carmona.gov.ph';
   ```
3. Confirm the account exists with correct credentials

### Test Admin Features
After logging in, verify you can access:
- ✅ Admin Dashboard (`/admin/dashboard`)
- ✅ User Management (`/admin/staff-management`)
- ✅ Applications (`/admin/applications`)
- ✅ Verification (`/admin/verification`)
- ✅ Reports (`/admin/reports`)
- ✅ Settings (`/admin/settings`)

## Troubleshooting

### Error: "Invalid email or password"
**Cause**: Admin account not found in database
**Solution**: 
1. Run the SQL script again using Method 1
2. Verify the account exists with the SELECT query above
3. Check browser cache (Ctrl+Shift+Delete) and try again

### Error: "User not allowed" or Permission Denied
**Cause**: The role or admin_role is not set correctly
**Solution**:
1. Check the account has `role = 'admin'` and `admin_role = 'head_admin'`
2. Run this update query:
   ```sql
   UPDATE public.users 
   SET role = 'admin', admin_role = 'head_admin' 
   WHERE email = 'admin@carmona.gov.ph';
   ```

### Error: "Unique constraint violation on email"
**Cause**: The email already exists in the database with different data
**Solution**: The script handles this with `ON CONFLICT DO UPDATE`, so the existing account will be updated with the correct credentials

### Account Exists But Still Can't Login
**Steps to debug**:
1. Check the email matches exactly: `admin@carmona.gov.ph`
2. Verify password is exactly: `Admin123` (case-sensitive)
3. Check `created_at` and `updated_at` timestamps are recent
4. Clear browser cookies and localStorage: 
   ```javascript
   localStorage.clear(); 
   sessionStorage.clear();
   // Then refresh the page
   ```

## Security Notes

⚠️ **Important**: The admin account uses a plain-text password storage method (as designed in the system). This is acceptable for:
- Development environments
- Closed internal systems
- Environments with other security controls

⚠️ **Recommended Actions**:
1. **Change the password immediately** after first login via Admin Settings
2. **Enable 2FA** if available (future enhancement)
3. **Rotate credentials regularly** (monthly recommended)
4. **Use strong password** when changing from default
5. **Limit admin account usage** - create separate user accounts for daily work

## Script Details

### What the Script Does
1. **Inserts new admin record** with auto-generated UUID
2. **Sets correct role fields**: `role = 'admin'` and `admin_role = 'head_admin'`
3. **Handles conflicts**: If email exists, updates with correct credentials
4. **Records timestamps**: Automatically sets `created_at` and `updated_at`
5. **Verifies insertion**: Returns the created account details

### SQL Used
```sql
INSERT INTO public.users (...) 
VALUES (gen_random_uuid(), 'System Admin', 'admin@carmona.gov.ph', 'Admin123', 'admin', 'head_admin', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET ...
```

This ensures:
- ✅ Idempotent (safe to run multiple times)
- ✅ Auto-generates UUID
- ✅ Uses server timestamps (NOW())
- ✅ Handles existing accounts gracefully

## Next Steps After Admin Account Creation

1. ✅ Log in with admin account
2. ✅ Navigate to Admin Profile (`/admin/profile`)
3. ✅ Change password to something secure
4. ✅ Add staff accounts (`/admin/staff-management`)
5. ✅ Configure system settings (`/admin/settings`)
6. ✅ Set up verification schedules (`/admin/scheduling`)
7. ✅ Create financial distribution schedules if needed

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify Supabase connection and environment variables
3. Ensure the users table exists
4. Review Supabase logs for SQL errors
5. Contact system administrator if problems persist

---

**Last Updated**: 2024
**Version**: 1.0
**Script Location**: `/scripts/06-insert-admin-account.sql`
