// Server-Side Authentication & Authorization
// Validates student session before rendering dashboard

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import type { User } from "@/lib/storage"
import { supabase } from "@/lib/storage"

/**
 * Get current user session from Supabase
 * Server-side only: retrieves session from cookies/headers
 * Redirects to login if no valid session (does not return null)
 */
export async function getCurrentUserSession(): Promise<User> {
  try {
    const cookieStore = cookies()
    
    // Try to get Supabase session token from cookies
    const authToken = cookieStore.get("sb-auth-token")?.value || 
                      cookieStore.get("sb-access-token")?.value

    if (!authToken) {
      // No token in cookies - user is not logged in
      redirect("/login")
    }

    // Verify session with Supabase using the auth token
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(authToken)

    if (error || !supabaseUser) {
      // Invalid or expired token - redirect to login
      redirect("/login")
    }

    // Fetch user record from database
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", supabaseUser.id)
      .maybeSingle()

    if (userError && userError.code !== "PGRST116") {
      console.error("[Auth] Database error:", userError)
      redirect("/login")
    }

    if (!userRecord) {
      console.error("[Auth] User record not found")
      redirect("/login")
    }

    return userRecord as User
  } catch (error) {
    // If it's a NEXT_REDIRECT error, let it propagate (don't catch it)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    
    console.error("[Auth] Session retrieval failed:", error)
    redirect("/login")
  }
}

/**
 * Verify student can access dashboard
 * Ensures user is logged in, is a student, and has valid database record
 * Returns the student ID on success, or redirects to appropriate page
 */
export async function verifyStudentAccess(): Promise<string> {
  // Get user session - will redirect to login if not authenticated
  const user = await getCurrentUserSession()

  // Validate user is a student
  if (user.role !== "student") {
    console.warn("[Auth] User is not a student, access denied")
    redirect("/")
  }

  // Validate user has valid ID
  if (!user.id) {
    console.error("[Auth] Invalid user ID in session")
    redirect("/login")
  }

  return user.id
}
