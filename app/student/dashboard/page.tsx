"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { StudentLayout } from "@/components/student-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  getApplicationsByStudentId, 
  getVerificationSchedule, 
  getFinancialDistributionSchedule 
} from "@/lib/storage"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"

interface DashboardData {
  applications: any[]
  verificationSchedule: any | null
  financialDistributionSchedule: any | null
}

export default function StudentDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    applications: [],
    verificationSchedule: null,
    financialDistributionSchedule: null,
  })
  const [verificationStatus, setVerificationStatus] = useState<string>("none")
  const [financialScheduleStatus, setFinancialScheduleStatus] = useState<string>("none")

  // Load dashboard data on mount and when user changes
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || user.role !== "student") {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const [applications, verificationSchedule, financialDistributionSchedule] = await Promise.all([
          getApplicationsByStudentId(user.id),
          getVerificationSchedule(user.id),
          getFinancialDistributionSchedule(user.id),
        ])

        setDashboardData({
          applications: applications || [],
          verificationSchedule: verificationSchedule || null,
          financialDistributionSchedule: financialDistributionSchedule || null,
        })
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setDashboardData({
          applications: [],
          verificationSchedule: null,
          financialDistributionSchedule: null,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  // Update verification and financial schedule statuses
  useEffect(() => {
    if (dashboardData.verificationSchedule) {
      const schedule = dashboardData.verificationSchedule
      if (schedule.completed_at) {
        setVerificationStatus("completed")
      } else if (schedule.scheduled_date) {
        setVerificationStatus("scheduled")
      } else {
        setVerificationStatus("pending")
      }
    } else {
      setVerificationStatus("none")
    }

    if (dashboardData.financialDistributionSchedule) {
      const schedule = dashboardData.financialDistributionSchedule
      if (schedule.claimed) {
        setFinancialScheduleStatus("claimed")
      } else if (schedule.eligible) {
        setFinancialScheduleStatus("eligible")
      } else {
        setFinancialScheduleStatus("pending")
      }
    } else {
      setFinancialScheduleStatus("none")
    }
  }, [dashboardData])

  if (!user || user.role !== "student") {
    return null
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {user.name}</p>
        </div>

        {/* Status Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.applications.length}</div>
              <p className="text-xs text-muted-foreground mt-1">submitted applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {verificationStatus === "completed" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {verificationStatus === "scheduled" && <Clock className="h-4 w-4 text-blue-600" />}
                {verificationStatus === "pending" && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                <span className="text-sm font-medium capitalize">{verificationStatus}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Financial Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {financialScheduleStatus === "claimed" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {financialScheduleStatus === "eligible" && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                {financialScheduleStatus !== "claimed" && financialScheduleStatus !== "eligible" && (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium capitalize">{financialScheduleStatus}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your latest scholarship applications</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No applications yet</p>
                <Button className="mt-4" onClick={() => router.push("/student/applications")}>
                  Submit Application
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{app.course}</p>
                      <p className="text-sm text-muted-foreground">{app.school}</p>
                    </div>
                    <Badge variant={app.status === "approved" ? "default" : "secondary"}>{app.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  )
}
