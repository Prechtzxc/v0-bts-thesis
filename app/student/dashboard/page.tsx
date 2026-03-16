// Student Dashboard - Server Component
// Secure server-side rendering with minimal dependencies

import { Metadata } from "next"
import Link from "next/link"
import { verifyStudentAccess } from "@/lib/auth-server"
import { supabase } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "View your scholarship application status and documents",
}

/**
 * Student Dashboard - Pure Server Component
 * Renders directly without complex widgets or Suspense boundaries
 */
export default async function StudentDashboardPage() {
  // Verify student auth - returns null if not authenticated (demo mode)
  const studentId = await verifyStudentAccess()

  // For demo: show sample data if no student ID
  // In production: would redirect to login instead
  const demoMode = !studentId

  // Fetch student profile data (if authenticated)
  let profile = null
  let applications = null
  let appCount = 0

  if (studentId && !demoMode) {
    const { data } = await supabase
      .from("student_profiles")
      .select("full_name, email, course, year_level, barangay, is_pwd")
      .eq("user_id", studentId)
      .maybeSingle()
    profile = data

    // Fetch applications count
    const { data: apps, count } = await supabase
      .from("applications")
      .select("id, status", { count: "exact" })
      .eq("user_id", studentId)
      .limit(5)
    applications = apps
    appCount = count || 0
  }

  return (
    <main className="flex-1">
      <div className="space-y-8 p-6 md:p-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {demoMode
              ? "Welcome to the demo dashboard. Sign in to see your actual data."
              : "Welcome back. Here's your scholarship application status."}
          </p>
        </div>

        {/* Demo Mode Alert */}
        {demoMode && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              You are viewing the demo dashboard with sample data.{" "}
              <Link href="/login" className="font-semibold underline hover:no-underline">
                Sign in
              </Link>{" "}
              to access your personal data.
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        {profile ? (
          <Card>
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profile.full_name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{profile.course || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year Level</p>
                  <p className="font-medium">{profile.year_level || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <div className="h-6 bg-secondary rounded animate-pulse w-32"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <div className="h-6 bg-secondary rounded animate-pulse w-40"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Course</p>
                    <div className="h-6 bg-secondary rounded animate-pulse w-32"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Year Level</p>
                    <div className="h-6 bg-secondary rounded animate-pulse w-24"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applications Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Applications ({appCount || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app: any) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="text-sm">Application {app.id.slice(0, 8)}</span>
                    <Badge variant={app.status === "approved" ? "default" : "secondary"}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {demoMode ? "No applications in demo data" : "No applications yet"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{appCount || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Barangay</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{profile?.barangay || "—"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">PWD Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{profile?.is_pwd ? "Yes" : "No"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
