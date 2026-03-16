// Server-Side Authentication & Authorization
// Validates student session before rendering dashboard

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import type { User } from "@/lib/storage"
import { supabase } from "@/lib/storage"

/**
 * Get current user session from Supabase
 * Server-side only: retrieves session from cookies/headers
 */
export async function getCurrentUserSession(): Promise<User | null> {
  try {
    // Get Supabase session from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get("sb-auth-token")?.value

    if (!authToken) {
      console.log("[Auth] No auth token found in cookies")
      return null
    }

    // Verify session with Supabase
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(authToken)

    if (error || !supabaseUser) {
      console.warn("[Auth] Supabase session invalid:", error?.message)
      return null
    }

    // Fetch user record from database
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", supabaseUser.id)
      .maybeSingle()

    if (userError && userError.code !== "PGRST116") {
      console.error("[Auth] Error fetching user record:", userError)
      throw userError
    }

    if (!userRecord) {
      console.warn("[Auth] User record not found in database")
      return null
    }

    return userRecord as User
  } catch (error) {
    console.error("[Auth] Error getting user session:", error)
    return null
  }
}

/**
 * Validate student has active session
 * Throws redirect if not authenticated
 */
export async function requireStudentAuth(user: User | null): Promise<string> {
  if (!user) {
    console.warn("[Auth] No user session found")
    redirect("/login")
  }

  if (user.role !== "student") {
    console.warn("[Auth] User is not a student, redirecting")
    redirect("/")
  }

  if (!user.id) {
    console.warn("[Auth] Invalid user ID")
    redirect("/login")
  }

  return user.id
}

/**
 * Validate student exists in database
 * Ensures RLS policies and permissions are correct
 */
export async function validateStudentRecord(studentId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", studentId)
      .eq("role", "student")
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("[Auth] Database error validating student:", error)
      throw error
    }

    if (!data) {
      console.warn("[Auth] Student record not found in database")
      return false
    }

    return true
  } catch (error) {
    console.error("[Auth] Error validating student record:", error)
    throw error
  }
}

/**
 * Verify student can access dashboard
 * Comprehensive check: session + database + RLS permissions
 */
export async function verifyStudentAccess(user: User | null): Promise<string> {
  // 1. Validate session on server
  const studentId = await requireStudentAuth(user)

  // 2. Verify student exists and has correct role
  const isValid = await validateStudentRecord(studentId)
  if (!isValid) {
    console.error("[Auth] Student validation failed")
    redirect("/login")
  }

  // 3. Attempt to read student profile (tests RLS permissions)
  try {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", studentId)
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("[Auth] RLS permission error:", error)
      throw error
    }

    if (!data) {
      console.warn("[Auth] Student profile not found - may be incomplete registration")
      // Allow access even if profile incomplete
    }
  } catch (error) {
    console.error("[Auth] Failed to verify RLS permissions:", error)
    throw error
  }

  return studentId
}

/**
 * Handle auth errors gracefully
 * Returns fallback or redirects based on error type
 */
export function handleAuthError(error: Error): never {
  const message = error.message.toLowerCase()

  if (message.includes("unauthorized") || message.includes("no session")) {
    console.error("[Auth] Session expired or invalid")
    redirect("/login")
  }

  if (message.includes("forbidden") || message.includes("not a student")) {
    console.error("[Auth] Access denied")
    redirect("/")
  }

  console.error("[Auth] Unexpected error:", error)
  throw error
}
