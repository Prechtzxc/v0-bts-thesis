"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentLayout } from "@/components/student-layout"
import { ApplicationStatus } from "@/components/application-status"
import { useAuth } from "@/contexts/auth-context"
import {
  getApplicationsByStudentId,
  getDocumentsByStudentId,
  getApplicationHistoryByStudentId,
  getVerificationSchedules,
  getFinancialDistributionScheduleForBarangay,
  hasStudentClaimed,
  getClaimedRecord,
  type StudentProfile,
  type VerificationSchedule,
  type FinancialDistributionSchedule,
  type Application,
} from "@/lib/storage"
import {
  FileText,
  Calendar,
  School,
  ChevronRight,
  Clock,
  History,
  AlertCircle,
  CheckCircle,
  Info,
  DollarSign,
  Wallet,
  XCircle,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Not yet"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function getTimelineSteps(application: Application | null, userId?: string) {
  const steps = [
    { title: "Application Submitted", status: "completed", date: "Submitted", description: "Your application has been received." },
    { title: "Document Verification", status: "pending", date: "Pending", description: "We are reviewing your documents." },
    { title: "Scholarship Committee Review", status: "pending", date: "Pending", description: "Your application is pending committee review." },
    { title: "Financial Aid Disbursement", status: "pending", date: "Pending", description: "Once approved, you can claim your funds." },
  ]

  if (!application || application.status === "pending") {
    steps[1].status = "pending"
    steps[1].date = "Pending"
    steps[2].status = "pending"
    steps[2].date = "Pending"
    steps[3].status = "pending"
    steps[3].date = "Pending"
  } else if (application.status === "approved") {
    steps[1].status = "completed"
    steps[1].date = "Verified"
    steps[2].status = "completed"
    steps[2].date = formatDate(application.updated_at)
    steps[2].description = "Your application has been approved by the scholarship committee."
    
    steps[3].status = "current"
    steps[3].date = "Ready for release"
    steps[3].description = "You are eligible to receive your scholarship funds during the distribution schedule."
  } else if (application.status === "rejected") {
    steps[1].status = "completed"
    steps[1].date = "Reviewed"
    steps[2].status = "completed"
    steps[2].date = formatDate(application.updated_at)
    steps[2].title = "Application Rejected"
    steps[2].description =
      application.feedback || "Your application was not approved. Please contact the office for more information."
    steps[3].status = "pending"
    steps[3].date = "N/A"
  }

  return steps
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [studentData, setStudentData] = useState({
    id: "",
    name: "",
    email: "",
    course: "",
    yearLevel: "",
    school: "",
    applicationStatus: "pending",
    semester: "1st Semester",
    academicYear: "2023-2024",
    barangay: "",
  })

  const [currentApplication, setCurrentApplication] = useState<Application | null>(null)
  const [applicationHistory, setApplicationHistory] = useState([])
  const [verificationSchedule, setVerificationSchedule] = useState<VerificationSchedule | null>(null)
  const [scheduleStatus, setScheduleStatus] = useState<"active" | "ended" | "upcoming" | "none">("none")
  const [financialSchedule, setFinancialSchedule] = useState<FinancialDistributionSchedule | null>(null)
  const [financialScheduleStatus, setFinancialScheduleStatus] = useState<"active" | "ended" | "upcoming" | "none">("none")
  const [hasClaimed, setHasClaimed] = useState(false)
  const [claimedDate, setClaimedDate] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const loadDashboardData = async () => {
      try {
        // Check if student has claimed their financial aid
        const claimed = await hasStudentClaimed(user.id)
        setHasClaimed(claimed)
        if (claimed) {
          const record = await getClaimedRecord(user.id)
          if (record) {
            setClaimedDate(record.claimed_date || record.created_at)
          }
        }

        // Get student application data
        const applications = getApplicationsByStudentId(user.id)
        const history = getApplicationHistoryByStudentId(user.id)
        setApplicationHistory(history)

        // Get student's barangay from profile
        const profile = user.profileData as StudentProfile
        const studentBarangay = profile?.barangay || ""

        if (applications.length > 0) {
          const latestApplication = applications[applications.length - 1]
          setCurrentApplication(latestApplication)
          setStudentData({
            id: user.id,
            name: user.profileData?.fullName || user.name,
            email: user.profileData?.email || user.email,
            course: latestApplication.course || user.profileData?.course || "",
            yearLevel: latestApplication.year_level || user.profileData?.yearLevel || "",
            school: latestApplication.school || user.profileData?.schoolName || "",
            applicationStatus: latestApplication.status,
            semester: "1st Semester",
            academicYear: "2023-2024",
            barangay: studentBarangay,
          })
        } else {
          setCurrentApplication(null)
          setStudentData({
            id: user.id,
            name: user.profileData?.fullName || user.name,
            email: user.profileData?.email || user.email,
            course: user.profileData?.course || "",
            yearLevel: user.profileData?.yearLevel || "",
            school: user.profileData?.schoolName || "",
            applicationStatus: "pending",
            semester: "1st Semester",
            academicYear: "2023-2024",
            barangay: studentBarangay,
          })
        }

        // Load verification and financial schedules
        if (studentBarangay) {
          const schedules = getVerificationSchedules()
          const matchingSchedule = schedules.find((schedule) => schedule.barangay === studentBarangay)

          if (matchingSchedule) {
            setVerificationSchedule(matchingSchedule)
            const now = new Date()
            const start = new Date(matchingSchedule.start_date)
            const end = new Date(matchingSchedule.end_date)

            if (now < start) {
              setScheduleStatus("upcoming")
            } else if (now > end) {
              setScheduleStatus("ended")
            } else {
              setScheduleStatus("active")
            }
          } else {
            setScheduleStatus("none")
          }

          const financialDistributionSchedule = getFinancialDistributionScheduleForBarangay(studentBarangay)
          if (financialDistributionSchedule) {
            setFinancialSchedule(financialDistributionSchedule)
            const now = new Date()
            const start = new Date(financialDistributionSchedule.start_date)
            const end = new Date(financialDistributionSchedule.end_date)

            if (now < start) {
              setFinancialScheduleStatus("upcoming")
            } else if (now > end) {
              setFinancialScheduleStatus("ended")
            } else {
              setFinancialScheduleStatus("active")
            }
          } else {
            setFinancialScheduleStatus("none")
          }
        }
      } catch (error) {
        console.error("Error loading student dashboard data:", error)
      }
    }

    loadDashboardData()
  }, [user])

  if (!user) {
    return null
  }

  return (
    <StudentLayout>
      <div className="relative overflow-hidden rounded-xl bg-pattern p-6 mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 rounded-full filter blur-3xl opacity-10 -mr-20 -mt-20"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back, {studentData.name}</h1>
          <p className="text-gray-600 mt-1">Here's an overview of your scholarship application</p>
        </div>
      </div>

      {hasClaimed && (
        <div className="mb-6 animate-fade-in">
          <Alert className="border-emerald-300 bg-emerald-50">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <AlertTitle className="text-emerald-900 font-semibold">Financial Aid Successfully Claimed</AlertTitle>
            <AlertDescription className="text-emerald-800">
              <div className="mt-2 space-y-2">
                <p>Your financial aid has been successfully claimed and is being processed.</p>
                {claimedDate && <p className="text-sm">Claimed on: {formatDate(claimedDate)}</p>}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="border-2 border-emerald-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <School className="h-4 w-4 text-emerald-600" />
              Your Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationStatus status={studentData.applicationStatus} />
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Verification Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {verificationSchedule ? (
              <>
                <p className="text-2xl font-bold text-gray-900">
                  {scheduleStatus === "active" ? "Active Now" : scheduleStatus === "upcoming" ? "Coming Soon" : "Ended"}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(verificationSchedule.start_date)} - {formatDate(verificationSchedule.end_date)}
                </p>
              </>
            ) : (
              <p className="text-gray-500">No schedule available</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-amber-600" />
              Financial Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {financialSchedule ? (
              <>
                <p className="text-2xl font-bold text-gray-900">
                  {financialScheduleStatus === "active" ? "Active Now" : financialScheduleStatus === "upcoming" ? "Coming Soon" : "Ended"}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(financialSchedule.start_date)} - {formatDate(financialSchedule.end_date)}
                </p>
              </>
            ) : (
              <p className="text-gray-500">No schedule available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {getTimelineSteps(currentApplication, user?.id).map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        step.status === "completed"
                          ? "bg-emerald-600"
                          : step.status === "current"
                            ? "bg-blue-600"
                            : "bg-gray-300"
                      }`}
                    >
                      {step.status === "completed" ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < 3 && <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-gray-900">{step.title}</p>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/student/applications">
              <Button className="w-full justify-start gap-2" variant="outline">
                <FileText className="h-4 w-4" />
                View All Applications
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
            <Link href="/student/documents">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Clock className="h-4 w-4" />
                Upload Documents
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
            {currentApplication?.status === "approved" && !hasClaimed && (
              <Link href="/student/claim-aid">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <DollarSign className="h-4 w-4" />
                  Claim Financial Aid
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  )
}
