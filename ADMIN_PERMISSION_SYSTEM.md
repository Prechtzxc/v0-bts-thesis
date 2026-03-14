# Admin Permission System - Refactored

## Overview
The admin permission system has been refactored to support a proper role hierarchy with `head_admin` as a super administrator that automatically bypasses all permission checks.

## Role Hierarchy

### 1. **head_admin** (Super Administrator)
- **Status**: Full access to all system features
- **Bypass behavior**: Automatically returns `true` for ALL permission checks
- **Permissions**: Dashboard, Scholars, Applications, Approved Emails, Verification, Reports, Scheduling, Staff Management, Settings
- **Use case**: System administrators with complete control

### 2. **admin** (Standard Administrator)
- **Status**: Limited access based on explicit permissions
- **Bypass behavior**: None - must have explicit permission
- **Permissions**: Defined in ADMIN_PERMISSIONS object
- **Use case**: Department heads or designated administrators

### 3. **verifier_staff** (Verification Staff)
- **Permissions**: Dashboard, Scholars, Applications, Verification
- **Use case**: Staff responsible for verifying applications

### 4. **scanner_staff** (Scanner Staff)
- **Permissions**: Dashboard, Verification
- **Use case**: Entry-level staff for document scanning/verification

## Implementation Details

### hasPermission() Function
Located in `/lib/storage.ts` (line 576):

```typescript
export function hasPermission(adminRole: AdminRole | undefined, requiredPermission: string): boolean {
  if (!adminRole) return false
  
  // head_admin is a super administrator with full access to everything
  if (adminRole === 'head_admin') return true
  
  // For other roles, check against their defined permission list
  const permissions = ADMIN_PERMISSIONS[adminRole]
  if (!permissions) return false
  return permissions.includes(requiredPermission)
}
```

**Key Features**:
- Treats `head_admin` as super administrator that always returns `true`
- Safe guard: Returns `false` if adminRole is undefined
- Safe guard: Returns `false` if role has no defined permissions
- Other roles follow defined permission lists

### Authentication Flow
1. User logs in via `/app/actions/auth.ts` (server action)
2. Server verifies password and retrieves user from database
3. User object includes `role` (admin/student) and `admin_role` (head_admin/verifier_staff/scanner_staff)
4. User is stored in session storage via `setCurrentUser()`
5. Auth context provides user to all components
6. AdminLayout checks `user.role === "admin"` for access
7. Navigation items filtered by `hasPermission(user?.admin_role, permission)`

### Session Storage
User data stored in sessionStorage includes:
- `id`: UUID
- `name`: Display name
- `email`: Email address
- `role`: "admin" or "student"
- `admin_role`: "head_admin", "verifier_staff", or "scanner_staff"
- `profile_picture`: Optional profile picture URL
- `created_at`, `updated_at`: Timestamps

### Admin Navigation
In `/components/admin-layout.tsx` (line 155):
```typescript
const navigationItems = allNavigationItems.filter((item) => 
  hasPermission(user?.admin_role as AdminRole, item.permission)
)
```

When user has `admin_role: "head_admin"`:
- All navigation items are included
- No pages are access-restricted
- User can access `/admin/dashboard` and all other admin routes

## Type Definitions

### User Type
- `role`: "student" | "admin" | "verifier_staff" | "scanner_staff"
- `admin_role`: "head_admin" | "verifier_staff" | "scanner_staff" (optional for students)

### Notification Type
Supports both snake_case (from database) and camelCase (for backward compatibility):
- `user_id` / `userId`
- `is_read` / `isRead`
- `created_at` / `createdAt`
- `action_url` / `actionUrl`

## Safeguards
1. **Undefined role check**: If `admin_role` is undefined, `hasPermission` returns `false`
2. **Missing permission list check**: If role has no entry in `ADMIN_PERMISSIONS`, returns `false`
3. **Fallback to empty array**: Notifications default to empty array if fetch fails
4. **Error handling**: All async operations wrapped in try-catch with fallbacks

## Testing head_admin Access
To verify a `head_admin` user has full access:

1. Login with email: `admin@carmona.gov.ph`, password: `Admin123`
2. Verify user data shows: `role: "admin"`, `admin_role: "head_admin"`
3. Access `/admin/dashboard` - should load without access denied
4. Navigate to all admin pages - all should be accessible
5. No permission errors should appear in console

## Limitations & Future Improvements
- RLS policies on `users` table still cause "infinite recursion" errors on client-side queries
  - **Solution**: Dashboard statistics should use server actions to bypass RLS
- Notifications table queries fail due to RLS
  - **Solution**: Implement notification server action with service role key
