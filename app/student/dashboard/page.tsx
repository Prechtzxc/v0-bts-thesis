// Student Dashboard - Server Component
// Secure server-side rendering with Suspense boundaries
// Zero client-side state, zero infinite loops

import { Metadata } from "next"
import { verifyStudentAccess } from "@/lib/auth-server"
import {
  StudentProfileSection,
  ApplicationTrackerSection,
  ScholarshipStatusSection,
  NotificationsSection,
} from "@/components/dashboard-widgets"

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "View your scholarship application status and documents",
}

/**
 * Student Dashboard - Pure Server Component
 *
 * Architecture:
 * - Server component validates auth on render (no client-side auth checks)
 * - Each widget in its own Suspense boundary for progressive rendering
 * - Stable skeleton loaders appear instantly
 * - Widgets load independently in parallel
 * - Error boundaries prevent section failures from crashing page
 * - Zero client-side state or re-render loops
 */
export default async function StudentDashboardPage() {
  try {
    // Verify student auth - will redirect to login if not authenticated
    const studentId = await verifyStudentAccess()

    return (
      <main className="flex-1">
        <div className="space-y-8 p-6 md:p-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your scholarship application status and documents
            </p>
          </div>

          {/* Dashboard Grid - Progressive UI with Suspense Boundaries */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Section - Static data, longer cache */}
            <div className="md:col-span-2 lg:col-span-1">
              <StudentProfileSection studentId={studentId} />
            </div>

            {/* Application Tracker - Dynamic data, shorter cache */}
            <div>
              <ApplicationTrackerSection studentId={studentId} />
            </div>

            {/* Scholarship Status - Schedule-based data */}
            <div>
              <ScholarshipStatusSection studentId={studentId} />
            </div>

            {/* Notifications - Real-time data */}
            <div className="md:col-span-2">
              <NotificationsSection studentId={studentId} />
            </div>
          </div>

          {/* Additional Content Sections - Add more as needed */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">
              Activity log and document history would appear here
            </p>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    // Auth errors and redirects are handled in auth-server
    // This catch shouldn't be reached under normal circumstances
    console.error("[Dashboard] Unexpected error:", error)
    throw error
  }
}
