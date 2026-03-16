// Next.js Cache Configuration & Revalidation Strategy
// Use route segments config for intelligent cache control

// Enable static rendering with automatic revalidation
// Place this at the top of your dashboard page.tsx or in next.config.js

/**
 * CACHE STRATEGY FOR STUDENT DASHBOARD
 * 
 * Static Data (1 hour revalidation):
 * - Student profile information
 * - Verification schedules
 * 
 * Dynamic Data (5 minute revalidation):
 * - Applications and status
 * - Financial distribution amounts
 * 
 * Real-time Data (1 minute revalidation):
 * - Notifications
 * - Claims and status updates
 * 
 * Implementation:
 * - Next.js 13+ automatically caches fetch() calls by default
 * - Use cache: 'no-store' for real-time data
 * - Use revalidate: N for ISR (Incremental Static Regeneration)
 * - Use revalidatePath() in server actions to purge cache on mutations
 */

// Route segment configuration for dashboard page
export const revalidate = 60 // 1 minute global revalidation
export const dynamic = "force-dynamic" // Allow streaming & suspense

/**
 * When to call revalidatePath:
 * - After student profile updates
 * - After application status changes
 * - After document uploads
 * - After manual admin updates
 */

export const dashboardCacheConfig = {
  // Static profile data - cache for 1 hour
  studentProfile: {
    revalidate: 3600,
    tags: ["student-profile"],
  },

  // Application status - cache for 5 minutes
  applications: {
    revalidate: 300,
    tags: ["student-applications"],
  },

  // Schedules - cache for 1 hour
  schedules: {
    revalidate: 3600,
    tags: ["schedules"],
  },

  // Notifications - cache for 1 minute
  notifications: {
    revalidate: 60,
    tags: ["notifications"],
  },

  // Documents - cache for 5 minutes
  documents: {
    revalidate: 300,
    tags: ["student-documents"],
  },
}

/**
 * Server Action to manually invalidate cache
 * Call after student profile updates
 */
"use server"

import { revalidatePath, revalidateTag } from "next/cache"

export async function revalidateStudentDashboard(studentId: string) {
  try {
    // Revalidate specific tags to purge related cache
    revalidateTag("student-profile")
    revalidateTag("student-applications")
    revalidateTag("notifications")

    // Also revalidate the entire dashboard path
    revalidatePath(`/student/dashboard`)

    console.log("[Cache] Revalidated student dashboard cache")
    return { success: true }
  } catch (error) {
    console.error("[Cache] Error revalidating cache:", error)
    throw error
  }
}

/**
 * Batch cache invalidation for admin updates
 */
export async function revalidateStudentRecord(studentId: string) {
  try {
    // Full revalidation for admin-initiated changes
    revalidatePath(`/student/dashboard`, "layout")
    revalidatePath(`/admin/scholars/${studentId}`, "page")

    console.log(`[Cache] Revalidated all cache for student ${studentId}`)
    return { success: true }
  } catch (error) {
    console.error("[Cache] Error revalidating student record:", error)
    throw error
  }
}
