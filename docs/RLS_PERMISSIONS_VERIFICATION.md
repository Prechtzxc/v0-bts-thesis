# Supabase RLS Permissions Verification

## Required Permissions for Admin Staff Management

### Users Table Policies

The staff management system requires the following RLS policies on the `users` table for admin users:

#### 1. **SELECT Policy (Read Staff Members)**
- **Condition**: `auth.role() = 'authenticated' AND user.role = 'admin'`
- **Purpose**: Allow authenticated admin users to view all admin staff members
- **Grant**: SELECT on users table where role = 'admin'

#### 2. **INSERT Policy (Create Staff Members)**
- **Condition**: `auth.role() = 'service_role' OR (auth.role() = 'authenticated' AND user.role = 'admin')`
- **Purpose**: Allow service role (via API) or head admin to create new staff members
- **Grant**: INSERT on users table

#### 3. **UPDATE Policy (Update Staff Roles)**
- **Condition**: `auth.role() = 'service_role' OR (auth.role() = 'authenticated' AND user.role = 'admin' AND user.admin_role = 'head_admin')`
- **Purpose**: Allow service role or head admin to update staff roles and permissions
- **Grant**: UPDATE on users table

#### 4. **DELETE Policy (Remove Staff Members)**
- **Condition**: `auth.role() = 'service_role' OR (auth.role() = 'authenticated' AND user.role = 'admin' AND user.admin_role = 'head_admin')`
- **Purpose**: Allow service role or head admin to remove staff members
- **Grant**: DELETE on users table

### Service Role Configuration

The API endpoints use the service role key for direct database operations, which bypasses RLS policies. This is secure because:
- Service role operations are server-side only
- API endpoints implement server-side validation
- Only authenticated requests from the application reach these endpoints

### Verification Checklist

- [ ] Verify all admin users can SELECT all admin staff members
- [ ] Verify API can INSERT new staff members via service role
- [ ] Verify API can UPDATE staff roles and permissions via service role
- [ ] Verify API can DELETE staff members via service role
- [ ] Verify email uniqueness constraint is enforced
- [ ] Verify admin role values are properly validated
- [ ] Verify timestamp fields auto-populate for created_at and updated_at

### Testing

To verify permissions:

```sql
-- Test SELECT as admin user
SELECT * FROM users WHERE role = 'admin' LIMIT 1;

-- Test INSERT via API (use service role client)
INSERT INTO users (name, email, password, role, admin_role)
VALUES ('Test Admin', 'test@example.com', 'hashed_password', 'admin', 'verifier_staff');

-- Test UPDATE via API
UPDATE users SET admin_role = 'scanner_staff' WHERE id = 'user_id';

-- Test DELETE via API
DELETE FROM users WHERE id = 'user_id' AND role = 'admin';
```
