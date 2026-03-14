"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin-layout"
import { getStatistics, getApplications, getUsers } from "@/lib/storage"
import { FileText, Clock, LayoutDashboard, CheckCircle, XCircle, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalScholars: 0,
    totalFunds: 0,
  })
  const [recentApplications, setRecentApplications] = useState<any[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const statistics = await getStatistics()
        setStats(statistics)

        const applications = await getApplications()
        
        const sortedApplications = applications
          .sort(
            (a, b) =>
              new Date(b.submittedAt || b.updatedAt || "").getTime() -
              new Date(a.submittedAt || a.updatedAt || "").getTime(),
          )
          .slice(0, 10)

        setRecentApplications(sortedApplications)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      }
    }

    loadDashboardData()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-amber-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600">Manage scholarship applications and monitor program statistics</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Total Applications</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalApplications}</div>
              <p className="text-xs text-slate-600 mt-1">Total scholarship applications</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Pending Applications</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.pendingApplications}</div>
              <p className="text-xs text-slate-600 mt-1">
                {stats.totalApplications > 0
                  ? Math.round((stats.pendingApplications / stats.totalApplications) * 100)
                  : 0}
                % of total applications
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Approved Scholars</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.approvedApplications}</div>
              <p className="text-xs text-slate-600 mt-1">
                {stats.totalApplications > 0
                  ? Math.round((stats.approvedApplications / stats.totalApplications) * 100)
                  : 0}
                % approval rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Calendar className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Recent Applications</CardTitle>
                <CardDescription className="text-slate-600">
                  Latest scholarship applications with submission dates and times
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">{getStatusIcon(application.status)}</div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{application.fullName}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>{application.course}</span>
                          <span>•</span>
                          <span>{application.school}</span>
                          <span>•</span>
                          <span>{application.yearLevel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {formatDate(application.submittedAt || application.createdAt || new Date().toISOString())}
                        </div>
                        <div className="text-xs text-slate-500">{application.barangay}</div>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No applications found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
