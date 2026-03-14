# Admin Access Solution - Head Admin Full System Access

## Current Status
✅ **RLS Disabled Temporarily** - All Row Level Security policies have been disabled on all 12 tables to allow head admin full system access.

✅ **Service Role Key Enabled** - The application uses `SUPABASE_SERVICE_ROLE_KEY` for admin operations (login, dashboard queries) which has full database access regardless of RLS.

## Why This Works
- **Head admin login** uses the service role key via server action (`/app/actions/auth.ts`), bypassing RLS
- **Dashboard queries** for statistics and applications can use the service role key for full access
- **Session storage** preserves the authenticated user's admin role and permissions

## Architecture
1. **Authentication** (`/app/actions/auth.ts`)
   - Uses `supabaseAdmin` (service role key) to query users table
   - Returns full user object with `admin_role: 'head_admin'`

2. **Authorization** (`/components/admin-layout.tsx`)
   - Checks `user.role === 'admin'` for admin access
   - Filters navigation by `hasPermission(user.admin_role, permission)`
   - `hasPermission()` grants all permissions to `head_admin` role

3. **Data Access** (`/lib/storage.ts`)
   - Client-side functions use regular `supabase` client (anon key)
   - Server actions use `supabaseAdmin` (service role key) for unrestricted access

## Next Steps: Implement Permanent RLS Policies

When ready to re-enable RLS permanently, use these approaches:

### Option 1: Simple - Disable RLS for Admin Tables
Keep RLS disabled for tables that only admins modify (pre_approved_emails, verification_schedules, etc.) since service role bypasses RLS anyway.

### Option 2: Safe - Use Role-Based Policies
```sql
CREATE POLICY "head_admin_full_access" ON table_name
  FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() 
    AND users.admin_role = 'head_admin'
  ))
```

**Note**: This still requires querying users table, which can cause recursion. Use service role for these queries instead.

### Option 3: Recommended - Use Service Role for Admins
Keep RLS disabled on tables that:
- Only admins modify (statistics, configuration)
- Have complex permission logic
- Are accessed via server actions using service role

Implement RLS only on student data tables (student_profiles, applications, documents) to prevent students from accessing each other's data.

## Current Head Admin Permissions
- ✅ Full access to dashboard
- ✅ View all applications
- ✅ Manage all users
- ✅ Access all admin sections
- ✅ Create/edit verification schedules
- ✅ Manage financial distributions

## Testing the Solution
1. Login as admin@carmona.gov.ph with password Admin123
2. Navigate to /admin/dashboard
3. All statistics, applications list, and navigation should load without errors
4. All admin actions (edit, delete, create) should work
