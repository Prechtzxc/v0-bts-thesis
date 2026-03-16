// Server-Side Authentication & Authorization
// Validates student session before rendering dashboard

import { cookies } from "next/headers"
import type { User } from "@/lib/storage"
import { supabase } from "@/lib/storage"

/**
 * Get current user session from Supabase
 * Server-side only: retrieves session from cookies/headers
 * Returns null if no valid session (allows demo/unauthenticated access)
 */
export async function getCurrentUserSession(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    
    // Try to get Supabase session token from cookies
    const authToken = cookieStore.get("sb-auth-token")?.value || 
                      cookieStore.get("sb-access-token")?.value

    if (!authToken) {
      // No token - user is not logged in, return null
      return null
    }

    // Verify session with Supabase using the auth token
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(authToken)

    if (error || !supabaseUser) {
      // Invalid or expired token
      return null
    }

    // Fetch user record from database
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", supabaseUser.id)
      .maybeSingle()

    if (userError && userError.code !== "PGRST116") {
      console.error("[Auth] Database error:", userError)
      return null
    }

    if (!userRecord) {
      return null
    }

    return userRecord as User
  } catch (error) {
    console.error("[Auth] Session retrieval failed:", error)
    return null
  }
}

/**
 * Verify student can access dashboard
 * For demo purposes: allows unauthenticated access
 * In production: would require valid authentication
 */
export async function verifyStudentAccess(): Promise<string | null> {
  try {
    // Get user session if available
    const user = await getCurrentUserSession()

    // If user exists and is a student, return their ID
    if (user && user.id && user.role === "student") {
      return user.id
    }

    // Allow unauthenticated access for demo (returns null)
    // In production, you would: redirect("/login")
    return null
  } catch (error) {
    console.error("[Auth] Access verification failed:", error)
    return null
  }
}
