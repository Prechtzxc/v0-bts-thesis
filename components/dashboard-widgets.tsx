// Dashboard Widgets - Server Components with Suspense
// Each widget fetches and renders independently

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react"
import { supabase } from "@/lib/storage"
import {
  ProfileSkeletonLoader,
  ApplicationTrackerSkeletonLoader,
  ScholarshipStatusSkeletonLoader,
  NotificationsSkeletonLoader,
} from "./dashboard-skeletons"
import { DashboardErrorBoundary } from "./dashboard-error-boundary"

// ==================== STUDENT PROFILE WIDGET ====================

async function StudentProfileWidget({ studentId }: { studentId: string }) {
  const { data: profile, error } = await supabase
    .from("student_profiles")
    .select("full_name, email, course, year_level, barangay, is_pwd")
    .eq("user_id", studentId)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    throw new Error("Failed to load profile")
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Student profile not found</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{profile.full_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Email:</span> {profile.email}
        </div>
        <div>
          <span className="text-muted-foreground">Course:</span> {profile.course}
        </div>
        <div>
          <span className="text-muted-foreground">Year Level:</span>{" "}
          {profile.year_level}
        </div>
        <div>
          <span className="text-muted-foreground">Barangay:</span>{" "}
          {profile.barangay}
        </div>
        {profile.is_pwd && (
          <Badge variant="outline" className="mt-2">
            PWD
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

export function StudentProfileSection({ studentId }: { studentId: string }) {
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<ProfileSkeletonLoader />}>
        <StudentProfileWidget studentId={studentId} />
      </Suspense>
    </DashboardErrorBoundary>
  )
}

// ==================== APPLICATION TRACKER WIDGET ====================

async function ApplicationTrackerWidget({ studentId }: { studentId: string }) {
  const { data: applications, error } = await supabase
    .from("applications")
    .select("id, status, created_at, updated_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    throw new Error("Failed to load applications")
  }

  const apps = applications || []
  const pendingCount = apps.filter((a) => a.status === "pending").length
  const approvedCount = apps.filter((a) => a.status === "approved").length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Application Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Total Applications</span>
          <Badge variant="secondary">{apps.length}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Pending
          </span>
          <Badge variant="outline">{pendingCount}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Approved
          </span>
          <Badge variant="outline" className="bg-green-50">
            {approvedCount}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export function ApplicationTrackerSection({
  studentId,
}: {
  studentId: string
}) {
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<ApplicationTrackerSkeletonLoader />}>
        <ApplicationTrackerWidget studentId={studentId} />
      </Suspense>
    </DashboardErrorBoundary>
  )
}

// ==================== SCHOLARSHIP STATUS WIDGET ====================

async function ScholarshipStatusWidget({ studentId }: { studentId: string }) {
  // Get student's barangay
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("barangay")
    .eq("user_id", studentId)
    .maybeSingle()

  if (!profile?.barangay) {
    return (
      <Alert>
        <AlertDescription>No barangay information available</AlertDescription>
      </Alert>
    )
  }

  const { data: schedule, error } = await supabase
    .from("financial_distribution_schedules")
    .select("start_date, end_date, distribution_amount, status, claimed")
    .contains("barangays", [profile.barangay])
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    throw new Error("Failed to load scholarship status")
  }

  if (!schedule) {
    return (
      <Alert>
        <AlertDescription>No active scholarship schedule</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Scholarship Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-sm text-muted-foreground">
            Distribution Amount
          </div>
          <div className="text-2xl font-semibold">
            ₱{Number(schedule.distribution_amount).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Status</span>
          <Badge variant={schedule.claimed ? "default" : "outline"}>
            {schedule.claimed ? "Claimed" : "Available"}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {schedule.start_date} to {schedule.end_date}
        </div>
      </CardContent>
    </Card>
  )
}

export function ScholarshipStatusSection({
  studentId,
}: {
  studentId: string
}) {
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<ScholarshipStatusSkeletonLoader />}>
        <ScholarshipStatusWidget studentId={studentId} />
      </Suspense>
    </DashboardErrorBoundary>
  )
}

// ==================== NOTIFICATIONS WIDGET ====================

async function NotificationsWidget({ studentId }: { studentId: string }) {
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, title, message, type, created_at")
    .eq("user_id", studentId)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    throw new Error("Failed to load notifications")
  }

  const notifs = notifications || []

  if (notifs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No unread notifications</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifs.map((notif) => (
          <div key={notif.id} className="flex gap-3 border-b pb-3 last:border-0">
            <FileText className="h-4 w-4 mt-1 flex-shrink-0 text-blue-500" />
            <div className="flex-1 min-w-0">
              <div className="font-sm font-semibold">{notif.title}</div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notif.message}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function NotificationsSection({ studentId }: { studentId: string }) {
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<NotificationsSkeletonLoader />}>
        <NotificationsWidget studentId={studentId} />
      </Suspense>
    </DashboardErrorBoundary>
  )
}
