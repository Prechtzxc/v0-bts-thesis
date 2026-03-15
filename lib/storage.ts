// Supabase-backed storage system - Real backend data only
// All data is persisted in PostgreSQL via Supabase

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client (anon key - respects RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for operations that need to bypass RLS (login, password reset, etc.)
// Only available server-side, never expose this to client
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null

// ==================== TYPE DEFINITIONS ====================

export type AdminRole = "head_admin" | "verifier_staff" | "scanner_staff"

export const ADMIN_PERMISSIONS: Record<AdminRole, string[]> = {
  head_admin: [
    "dashboard", "scholars", "applications", "approved-emails", 
    "verification", "reports", "scheduling", "staff-management", "settings"
  ],
  verifier_staff: [
    "dashboard", "scholars", "applications", "verification"
  ],
  scanner_staff: [
    "dashboard", "verification"
  ],
}

export type User = {
  id: string
  name: string
  email: string
  password: string
  role: "student" | "admin" | "verifier_staff" | "scanner_staff"
  admin_role?: AdminRole
  adminRole?: AdminRole
  profileData?: StudentProfile | AdminProfile
  isPWD?: boolean
  studentProfile?: any
  profile_picture?: string
  profilePicture?: string
  created_at?: string
  updated_at?: string
}

export type StudentProfile = {
  fullName: string
  email: string
  contactNumber: string
  address: string
  age: string
  barangay: string
  bio?: string
  schoolName: string
  course: string
  yearLevel: string
  studentId: string
  isPWD?: boolean
}

export type AdminProfile = {
  fullName: string
  email: string
  contactNumber: string
  position: string
  department: string
  bio?: string
}

export type Application = {
  id: string
  student_id: string
  full_name: string
  email: string
  course: string
  year_level: string
  school: string
  barangay: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  submitted_at: string
  feedback?: string
  is_pwd?: boolean
}

export type Document = {
  id: string
  studentId: string
  name: string
  type: string
  status: "pending" | "approved" | "rejected"
  uploadedAt: string
  reviewedAt?: string
  feedback?: string
  fileSize: string
  semester: string
  academicYear: string
  url?: string
}

export type Notification = {
  id: string
  user_id: string
  userId?: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "announcement"
  is_read: boolean
  isRead?: boolean
  created_at: string
  createdAt?: string
  action_url?: string
  actionUrl?: string
}

export type NewScholarApplication = {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  email: string
  barangayClearance?: string
  indigencyCertificate?: string
  voterCertification?: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  updatedAt: string
}

export type PreApprovedEmail = {
  id: string
  email: string
  fullName?: string
  notes?: string
  status: "available" | "used"
  addedBy: string
  addedAt: string
  isUsed: boolean
  usedAt?: string
  usedBy?: string
}

export type ApplicationHistory = {
  id: string
  studentId: string
  applicationData: {
    course: string
    yearLevel: string
    school: string
    schoolName: string
    barangay: string
    academicYear: string
  }
  outcome: "approved" | "rejected"
  completedAt: string
  completedDate: string
  financialAidAmount: number
  notes?: string
}

export type VerificationSchedule = {
  id: string
  barangay: string
  startDate: string
  endDate: string
  dailyLimit?: number
  status: "active" | "ended" | "upcoming"
  createdAt: string
  createdBy: string
  updatedAt: string
}

export type FinancialDistributionSchedule = {
  id: string
  barangays: string[]
  startDate: string
  endDate: string
  startTime: string
  distributionAmount: number
  status: "active" | "ended" | "upcoming"
  createdAt: string
  createdBy: string
  updatedAt: string
}

// ==================== PLACEHOLDER FUNCTIONS ====================
// These stub functions indicate areas where real Supabase queries should be implemented
// DO NOT use mock data - all queries must hit the actual database

// ==================== USER FUNCTIONS ====================

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
  
  if (error) throw error
  return data || []
}

export async function getAllUsers(): Promise<User[]> {
  return getUsers()
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!email) return null
  
  const normalizedEmail = email.toLowerCase()
  
  // Use service role client to bypass RLS during login (unauthenticated query)
  const client = supabaseAdmin || supabase
  
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('email', normalizedEmail)
    .single()
  
  if (error) return null
  return data || null
}

export async function getUserById(id: string): Promise<User | null> {
  if (!id) return null
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data || null
}

export async function login(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  
  if (user && user.password === password) {
    return user
  }
  return null
}

export function logout(): void {
  // Handled by auth context
}

export async function createUser(userData: Omit<User, "id">, profileData?: StudentProfile | AdminProfile): Promise<User> {
  // Check if email already exists to prevent duplicate key violations
  const existingUser = await getUserByEmail(userData.email)
  
  if (existingUser) {
    throw new Error(`Email address already registered. Please login or use a different email address.`)
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error(`Email address already registered. Please login or use a different email address.`)
    }
    throw error
  }

  // Mark the pre-approved email as used
  if (data && data.id) {
    try {
      const { error: updateError } = await supabase
        .from('pre_approved_emails')
        .update({ 
          status: 'used', 
          used_by: data.id,
          used_at: new Date().toISOString() 
        })
        .eq('email', userData.email.toLowerCase())
      
      if (updateError) {
        console.warn("Warning: Could not mark pre-approved email as used:", updateError)
      }
    } catch (err) {
      console.warn("Warning: Error updating pre-approved email status:", err)
    }
  }
  
  return data
}

export async function updateUserProfile(userId: string, profileData: Partial<StudentProfile | AdminProfile>): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .update({ profileData })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) return null
  return data || null
}

export async function updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  const user = await getUserById(userId)
  if (!user || user.password !== currentPassword) return false
  
  const { error } = await supabase
    .from('users')
    .update({ password: newPassword })
    .eq('id', userId)
  
  return !error
}

export async function getUser(userId: string): Promise<User | null> {
  return getUserById(userId)
}

export async function updateUser(userId: string, profileData: Partial<StudentProfile | AdminProfile>): Promise<User | null> {
  return updateUserProfile(userId, profileData)
}

export async function updateEducationInfo(userId: string, educationData: Partial<StudentProfile>): Promise<User | null> {
  return updateUserProfile(userId, educationData)
}

// ==================== APPLICATION FUNCTIONS ====================

export async function getAllApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
  
  if (error) throw error
  return data || []
}

export async function getApplicationsByStudentId(studentId: string): Promise<Application[]> {
  if (!studentId) return []
  
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('student_id', studentId)
  
  if (error) throw error
  return data || []
}

export async function createApplication(
  data: Omit<Application, "id" | "created_at" | "updated_at" | "submitted_at">,
): Promise<Application> {
  const { data: result, error } = await supabase
    .from('applications')
    .insert([{
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
    }])
    .select()
    .single()
  
  if (error) throw error
  
  // Create initial application history record for audit trail
  if (result) {
    try {
      await supabase
        .from('application_history')
        .insert([{
          student_id: result.student_id,
          application_data: {
            course: result.course,
            year_level: result.year_level,
            school: result.school,
            barangay: result.barangay,
            academic_year: new Date().getFullYear().toString() + "-" + (new Date().getFullYear() + 1).toString(),
          },
          outcome: result.status,
          notes: result.feedback || null,
          created_at: new Date().toISOString(),
        }])
    } catch (historyError) {
      console.error("Error creating initial application history:", historyError)
      // Don't throw - the main creation succeeded, history is just for auditing
    }
  }
  
  return result
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "pending" | "approved" | "rejected",
  feedback?: string,
): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .update({ status, feedback, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select()
    .single()
  
  if (error) return null
  
  // Create application history record to maintain audit trail
  if (data) {
    try {
      await supabase
        .from('application_history')
        .insert([{
          student_id: data.student_id,
          application_data: {
            course: data.course,
            year_level: data.year_level,
            school: data.school,
            barangay: data.barangay,
            academicYear: new Date().getFullYear().toString() + "-" + (new Date().getFullYear() + 1).toString(),
          },
          outcome: status,
          notes: feedback || null,
          created_at: new Date().toISOString(),
        }])
    } catch (historyError) {
      console.error("Error creating application history:", historyError)
      // Don't throw - the main update succeeded, history is just for auditing
    }
  }
  
  return data || null
}

// ==================== DOCUMENT FUNCTIONS ====================

export async function getDocumentsByStudentId(studentId: string): Promise<Document[]> {
  if (!studentId) return []
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('student_id', studentId)
  
  if (error) throw error
  return data || []
}

export async function uploadDocument(documentData: Omit<Document, "id" | "uploaded_at">): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .insert([{ ...documentData, uploaded_at: new Date().toISOString() }])
    .select()
    .single()
  
  if (error) throw error
  return data || ({} as Document)
}

// Alias for backward compatibility
export const createDocument = uploadDocument

// ==================== PRE-APPROVED EMAILS ====================

export async function isEmailPreApproved(email: string): Promise<boolean> {
  if (!email) return false
  try {
    const { data, error } = await supabase
      .from('pre_approved_emails')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('status', 'available')
      .single()
    
    if (error || !data) return false
    return true
  } catch (err) {
    console.error("Error checking pre-approved email:", err)
    return false
  }
}

// Check email registration status - returns specific error messages
// CRITICAL: Validates in exact order - users table FIRST, then pre_approved_emails
export async function checkEmailRegistrationStatus(email: string): Promise<{ 
  isPreApproved: boolean
  isRegistered: boolean
  errorMessage?: string 
}> {
  if (!email) {
    return { isPreApproved: false, isRegistered: false, errorMessage: "Email is required" }
  }

  const normalizedEmail = email.toLowerCase()

  try {
    console.log("[v0] Step 1: Checking if email exists in users table:", normalizedEmail)
    
    // FIRST: Check if email is already registered in users table
    // Use maybeSingle() instead of single() to safely handle 0 rows
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (userError && userError.code !== 'PGRST116') {
      console.error("[v0] Error querying users table:", userError)
      throw userError
    }

    console.log("[v0] Users table lookup result:", existingUser ? "FOUND - Email already registered" : "NOT FOUND - Email not in users table")

    if (existingUser) {
      console.log("[v0] Registration blocked: Email already registered")
      return { 
        isPreApproved: false, 
        isRegistered: true, 
        errorMessage: "Email already registered. Please login." 
      }
    }

    // SECOND: Email not in users table, now check pre_approved_emails
    console.log("[v0] Step 2: Checking if email exists in pre_approved_emails table:", normalizedEmail)
    
    const { data: preApprovedEmail, error: preApprovedError } = await supabase
      .from('pre_approved_emails')
      .select('id, status')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (preApprovedError && preApprovedError.code !== 'PGRST116') {
      console.error("[v0] Error querying pre_approved_emails table:", preApprovedError)
      throw preApprovedError
    }

    console.log("[v0] Pre-approved emails lookup result:", preApprovedEmail ? `FOUND - Status: ${preApprovedEmail.status}` : "NOT FOUND - Email not pre-approved")

    if (!preApprovedEmail) {
      console.log("[v0] Registration blocked: Email not authorized")
      return { 
        isPreApproved: false, 
        isRegistered: false, 
        errorMessage: "This email is not authorized to register. Please contact the administrator." 
      }
    }

    if (preApprovedEmail.status !== 'available') {
      console.log("[v0] Registration blocked: Pre-approved email already used")
      return { 
        isPreApproved: false, 
        isRegistered: false, 
        errorMessage: "This email has already been used for registration." 
      }
    }

    console.log("[v0] Registration validation PASSED: Email is pre-approved and available")
    return { isPreApproved: true, isRegistered: false }
  } catch (err) {
    console.error("[v0] Unexpected error in checkEmailRegistrationStatus:", err)
    return { 
      isPreApproved: false, 
      isRegistered: false, 
      errorMessage: "Error validating email. Please try again." 
    }
  }
}

// ==================== PRE-APPROVED EMAIL MANAGEMENT ====================

export async function addPreApprovedEmail(email: string, fullName?: string, notes?: string, addedBy?: string): Promise<PreApprovedEmail | null> {
  try {
    // Use service role client to bypass RLS for admin operations
    const client = supabaseAdmin || supabase
    
    const { data, error } = await client
      .from('pre_approved_emails')
      .insert([{
        email: email.toLowerCase(),
        full_name: fullName || null,
        notes: notes || null,
        status: 'available',
        added_by: addedBy || null, // addedBy must be a UUID or null
        added_at: new Date().toISOString(),
      }])
      .select()
      .single()
    
    if (error) {
      console.error("Error adding pre-approved email:", error.message)
      throw new Error(error.message || "Failed to add pre-approved email")
    }
    
    return data || null
  } catch (err: any) {
    console.error("Error adding pre-approved email:", err.message)
    throw new Error(err.message || "Failed to add pre-approved email")
  }
}

// ==================== STUDENT ELIGIBILITY ====================

export async function markStudentAsEligible(studentId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!studentId) {
      return { success: false, message: "Student ID is required" }
    }

    const { error: checkError } = await supabase
      .from('financial_distribution_schedules')
      .select('id')
      .eq('student_id', studentId)
      .single()

    if (!checkError) {
      // Record exists, update it
      const { error: updateError } = await supabase
        .from('financial_distribution_schedules')
        .update({ eligible: true, updated_at: new Date().toISOString() })
        .eq('student_id', studentId)
      
      if (updateError) {
        return { success: false, message: "Failed to mark student as eligible" }
      }
    } else {
      // Record doesn't exist, create it
      const { error: insertError } = await supabase
        .from('financial_distribution_schedules')
        .insert([{
          student_id: studentId,
          eligible: true,
          claimed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
      
      if (insertError) {
        return { success: false, message: "Failed to create eligibility record" }
      }
    }

    return { success: true, message: "Student marked as eligible for financial distribution" }
  } catch (err) {
    console.error("Error marking student as eligible:", err)
    return { success: false, message: "An error occurred while marking student as eligible" }
  }
}

// ==================== NOTIFICATION FUNCTIONS ====================

export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  if (!userId) return []
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
  return data || []
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
  
  return !error
}

export async function createNotification(notificationData: Omit<Notification, "id" | "created_at">): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{ ...notificationData, created_at: new Date().toISOString() }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ==================== PERMISSION FUNCTIONS ====================

export function hasPermission(adminRole: AdminRole | undefined, requiredPermission: string): boolean {
  if (!adminRole) {
    return false
  }
  
  // head_admin is a super administrator with full access to everything
  if (adminRole === 'head_admin') {
    return true
  }
  
  // For other roles, check against their defined permission list
  const permissions = ADMIN_PERMISSIONS[adminRole]
  if (!permissions) {
    return false
  }
  return permissions.includes(requiredPermission)
}

export function getAdminRoleLabel(role: AdminRole): string {
  switch (role) {
    case 'head_admin':
      return 'Head Administrator'
    case 'verifier_staff':
      return 'Verification Staff'
    case 'scanner_staff':
      return 'Scanner Staff'
    default:
      return 'Administrator'
  }
}

// ==================== SCHEDULE FUNCTIONS ====================

export async function getVerificationSchedules(): Promise<VerificationSchedule[]> {
  const { data, error } = await supabase
    .from('verification_schedules')
    .select('*')
  
  if (error) throw error
  return data || []
}

export async function getFinancialDistributionScheduleForBarangay(barangay: string): Promise<FinancialDistributionSchedule | null> {
  const { data, error } = await supabase
    .from('financial_distribution_schedules')
    .select('*')
    .contains('barangays', [barangay])
    .single()
  
  if (error) return null
  return data || null
}

// ==================== HISTORY FUNCTIONS ====================

export async function getApplicationHistoryByStudentId(studentId: string): Promise<ApplicationHistory[]> {
  if (!studentId) return []
  
  const { data, error } = await supabase
    .from('application_history')
    .select('*')
    .eq('student_id', studentId)
  
  if (error) throw error
  return data || []
}

// ==================== STUB FUNCTIONS - IMPLEMENT WITH REAL BACKEND ====================
// These functions need proper Supabase table implementations

export async function hasStudentClaimed(userId: string): Promise<boolean> {
  // TODO: Query claimed_records table from Supabase
  return false
}

export async function getClaimedRecord(userId: string): Promise<any> {
  // TODO: Query claimed_records table from Supabase
  return null
}

export async function getAllNewScholarApplications(): Promise<NewScholarApplication[]> {
  const { data, error } = await supabase
    .from('new_scholar_applications')
    .select('*')
  
  if (error) throw error
  return data || []
}

export async function getPreApprovedEmails(): Promise<PreApprovedEmail[]> {
  try {
    // Use service role client to bypass RLS for admin operations
    const client = supabaseAdmin || supabase
    
    const { data, error } = await client
      .from('pre_approved_emails')
      .select('*')
      .order('added_at', { ascending: false })
    
    if (error) {
      console.error("Error fetching pre-approved emails:", error)
      throw error
    }
    
    return data || []
  } catch (err) {
    console.error("Error fetching pre-approved emails:", err)
    return []
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
  
  return !error
}

// ==================== SESSION MANAGEMENT ====================
// Store current user in session storage (client-side only)
let currentUserSession: User | null = null

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = sessionStorage.getItem('currentUser')
  return stored ? JSON.parse(stored) : currentUserSession
}

export function setCurrentUser(user: User | null): void {
  if (typeof window !== 'undefined') {
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user))
    } else {
      sessionStorage.removeItem('currentUser')
    }
  }
  currentUserSession = user
}

export const loginStorage = login
export const logoutStorage = logout

export function initializeStorage(): void {
  // Initialize from session storage if available
  const stored = typeof window !== 'undefined' ? sessionStorage.getItem('currentUser') : null
  if (stored) {
    currentUserSession = JSON.parse(stored)
  }
}

// ==================== DASHBOARD STATISTICS ====================

export async function getStatistics() {
  try {
    const applications = await getAllApplications()
    
    const totalApplications = applications.length
    const pendingApplications = applications.filter(a => a.status === 'pending').length
    const approvedApplications = applications.filter(a => a.status === 'approved').length
    const rejectedApplications = applications.filter(a => a.status === 'rejected').length
    const totalScholars = approvedApplications
    
    return {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalScholars,
      totalFunds: totalScholars * 5000, // Placeholder
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return {
      totalApplications: 0,
      pendingApplications: 0,
      approvedApplications: 0,
      rejectedApplications: 0,
      totalScholars: 0,
      totalFunds: 0,
    }
  }
}

export const getApplications = getAllApplications
export const getNewScholarApplications = getAllNewScholarApplications

// ==================== MISSING WRAPPER FUNCTIONS ====================

export async function removePreApprovedEmail(id: string): Promise<boolean> {
  try {
    console.log("[v0] Removing pre-approved email:", id)
    
    // Use service role client to bypass RLS for admin operations
    const client = supabaseAdmin || supabase
    
    const { error } = await client
      .from('pre_approved_emails')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error("[v0] Error removing pre-approved email:", error)
      return false
    }
    
    console.log("[v0] Pre-approved email removed successfully")
    return true
  } catch (err) {
    console.error("[v0] Error removing pre-approved email:", err)
    return false
  }
}

export async function updateNewScholarApplication(
  id: string, 
  updates: Partial<NewScholarApplication>
): Promise<NewScholarApplication | null> {
  const { data, error } = await supabase
    .from('new_scholar_applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) return null
  return data || null
}

// ==================== FINANCIAL AID CLAIM FUNCTIONS ====================

export async function markStudentAsClaimed(
  studentId: string,
  adminId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('financial_distribution_schedules')
      .update({
        claimed: true,
        claimed_by: adminId,
        claimed_date: new Date().toISOString(),
      })
      .eq('student_id', studentId)

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true, message: "Student marked as claimed successfully" }
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to mark as claimed" }
  }
}

export async function isStudentEligible(studentId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('financial_distribution_schedules')
      .select('id')
      .eq('student_id', studentId)
      .eq('eligible', true)
      .single()

    return !error && !!data
  } catch {
    return false
  }
}

// ==================== MISSING SCHEDULE FUNCTIONS ====================

export async function getFinancialDistributionSchedules(): Promise<FinancialDistributionSchedule[]> {
  const { data, error } = await supabase
    .from('financial_distribution_schedules')
    .select('*')
  
  if (error) throw error
  return data || []
}

export async function createVerificationSchedule(
  data: Omit<VerificationSchedule, "id" | "created_at" | "updated_at">
): Promise<VerificationSchedule> {
  const { data: result, error } = await supabase
    .from('verification_schedules')
    .insert([{
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single()
  
  if (error) throw error
  return result
}

export async function createFinancialDistributionSchedule(
  data: Omit<FinancialDistributionSchedule, "id" | "created_at" | "updated_at">
): Promise<FinancialDistributionSchedule> {
  const { data: result, error } = await supabase
    .from('financial_distribution_schedules')
    .insert([{
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single()
  
  if (error) throw error
  return result
}

export async function updateVerificationSchedule(
  id: string,
  updates: Partial<VerificationSchedule>
): Promise<VerificationSchedule | null> {
  const { data, error } = await supabase
    .from('verification_schedules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) return null
  return data || null
}

export async function updateFinancialDistributionSchedule(
  id: string,
  updates: Partial<FinancialDistributionSchedule>
): Promise<FinancialDistributionSchedule | null> {
  const { data, error } = await supabase
    .from('financial_distribution_schedules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) return null
  return data || null
}

export async function getVerificationSchedule(barangay?: string): Promise<VerificationSchedule | null> {
  try {
    let query = supabase
      .from('verification_schedules')
      .select('*')
    
    if (barangay) {
      query = query.eq('barangay', barangay)
    }
    
    const { data, error } = await query.maybeSingle()
    
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (err) {
    console.error("Error getting verification schedule:", err)
    return null
  }
}

export async function getFinancialDistributionSchedule(barangay?: string): Promise<FinancialDistributionSchedule | null> {
  try {
    let query = supabase
      .from('financial_distribution_schedules')
      .select('*')
    
    if (barangay) {
      query = query.eq('barangay', barangay)
    }
    
    const { data, error } = await query.maybeSingle()
    
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (err) {
    console.error("Error getting financial distribution schedule:", err)
    return null
  }
}

// ==================== APPLICATION UPDATE ALIAS ====================

export async function updateApplication(
  applicationId: string,
  updates: Partial<Application>
): Promise<Application | null> {
  return updateApplicationStatus(applicationId, updates.status as "pending" | "approved" | "rejected", updates.feedback)
}

export async function deleteVerificationSchedule(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('verification_schedules')
    .delete()
    .eq('id', id)
  
  return !error
}

export async function deleteFinancialDistributionSchedule(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('financial_distribution_schedules')
    .delete()
    .eq('id', id)
  
  return !error
}

export async function endVerificationSchedule(id: string): Promise<VerificationSchedule | null> {
  return updateVerificationSchedule(id, { status: "ended" })
}

export async function endFinancialDistributionSchedule(id: string): Promise<FinancialDistributionSchedule | null> {
  return updateFinancialDistributionSchedule(id, { status: "ended" })
}

// ==================== STAFF MANAGEMENT FUNCTIONS ====================

export async function getStaffMembers(): Promise<User[]> {
  try {
    // Use service role client to bypass RLS
    const client = supabaseAdmin || supabase
    
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .limit(100) // Limit to prevent large queries
    
    if (error) {
      console.error("Error fetching staff members:", error)
      return []
    }
    
    return data || []
  } catch (err) {
    console.error("Error in getStaffMembers:", err)
    return []
  }
}

export async function createStaffMember(staffData: {
  name: string
  email: string
  password: string
  adminRole: AdminRole
  profileData?: AdminProfile
}): Promise<User | null> {
  try {
    // Use service role client to bypass RLS for admin operations
    const client = supabaseAdmin || supabase
    
    // Create the staff member with all required fields
    const { data, error } = await client
      .from('users')
      .insert([{
        name: staffData.name,
        email: staffData.email,
        password: staffData.password,
        role: 'admin',
        admin_role: staffData.adminRole,
      }])
      .select()
      .single()
    
    if (error) {
      console.error("Error creating staff member:", error.message)
      return null
    }
    
    return data || null
  } catch (error) {
    console.error("Error in createStaffMember:", error)
    return null
  }
}

export async function updateStaffRole(staffId: string, newRole: AdminRole): Promise<boolean> {
  try {
    // Use service role client to bypass RLS
    
    // Use service role client to bypass RLS
    const client = supabaseAdmin || supabase
    
    const { error } = await client
      .from('users')
      .update({ admin_role: newRole })
      .eq('id', staffId)
    
    if (error) {
      console.error("Error updating staff role:", error)
      return false
    }
    
    return true
  } catch (err) {
    console.error("Error in updateStaffRole:", err)
    return false
  }
}

export async function deleteStaffMember(staffId: string): Promise<boolean> {
  try {
    // Use service role client to bypass RLS
    const client = supabaseAdmin || supabase
    
    const { error } = await client
      .from('users')
      .delete()
      .eq('id', staffId)
    
    if (error) {
      console.error("Error deleting staff member:", error)
      return false
    }
    
    return true
  } catch (err) {
    console.error("Error in deleteStaffMember:", err)
    return false
  }
}
