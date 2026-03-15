"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  getAdminRoleLabel,
  hasPermission,
  type User,
  type AdminRole,
  ADMIN_PERMISSIONS,
} from "@/lib/storage"
import {
  UserPlus,
  Shield,
  ShieldCheck,
  QrCode,
  Trash2,
  Edit,
  Users,
  Eye,
  EyeOff,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function StaffManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  
  const [staffMembers, setStaffMembers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    adminRole: "verifier_staff" as AdminRole,
  })

  // Load staff members once on component mount via API
  useEffect(() => {
    let isMounted = true

    const loadStaff = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/staff', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        
        if (!isMounted) return

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch staff")
        }

        const members = result.data || []
        const mappedMembers = members.map((member: User) => ({
          ...member,
          adminRole: member.admin_role || member.adminRole
        }))
        setStaffMembers(mappedMembers)
      } catch (error) {
        if (!isMounted) return
        console.error("Error loading staff members:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load staff members. Please refresh the page.",
        })
        setStaffMembers([])
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    
    loadStaff()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    try {
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create staff member",
        })
        return
      }

      // Reload staff list
      const listResponse = await fetch('/api/admin/staff', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const listResult = await listResponse.json()
      
      if (listResult.success) {
        const members = listResult.data || []
        const mappedMembers = members.map((member: User) => ({
          ...member,
          adminRole: member.admin_role || member.adminRole
        }))
        setStaffMembers(mappedMembers)
      }

      setIsAddDialogOpen(false)
      setNewStaff({
        name: "",
        email: "",
        password: "",
        adminRole: "verifier_staff" as AdminRole,
      })
      toast({
        title: "Success",
        description: "Staff member created successfully.",
      })
    } catch (error: any) {
      console.error("Error adding staff:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add staff member",
      })
    }
  }

  const handleEditRole = async () => {
    if (!selectedStaff) return

    try {
      const response = await fetch(`/api/admin/staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_role: selectedStaff.adminRole }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update staff role",
        })
        return
      }

      // Reload staff list
      const listResponse = await fetch('/api/admin/staff', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const listResult = await listResponse.json()
      
      if (listResult.success) {
        const members = listResult.data || []
        const mappedMembers = members.map((member: User) => ({
          ...member,
          adminRole: member.admin_role || member.adminRole
        }))
        setStaffMembers(mappedMembers)
      }

      setIsEditDialogOpen(false)
      const updatedStaff = { ...selectedStaff, adminRole: selectedStaff.adminRole as AdminRole }
      setSelectedStaff(null)

      toast({
        title: "Role Updated",
        description: `${updatedStaff.name}'s role has been updated to ${getAdminRoleLabel(updatedStaff.adminRole)}.`,
      })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
      })
    }
  }

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return

    try {
      const response = await fetch(`/api/admin/staff/${selectedStaff.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete staff member",
        })
        return
      }

      // Reload staff list
      const listResponse = await fetch('/api/admin/staff', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const listResult = await listResponse.json()
      
      if (listResult.success) {
        const members = listResult.data || []
        const mappedMembers = members.map((member: User) => ({
          ...member,
          adminRole: member.admin_role || member.adminRole
        }))
        setStaffMembers(mappedMembers)
      }

      setIsDeleteDialogOpen(false)
      toast({
        title: "Staff Removed",
        description: `${selectedStaff.name} has been removed from the system.`,
      })
      setSelectedStaff(null)
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete staff member",
      })
    }
  }

  const getRoleBadgeColor = (role: AdminRole) => {
    switch (role) {
      case "head_admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "verifier_staff":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "scanner_staff":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleIcon = (role: AdminRole) => {
    switch (role) {
      case "head_admin":
        return <ShieldCheck className="h-4 w-4" />
      case "verifier_staff":
        return <Shield className="h-4 w-4" />
      case "scanner_staff":
        return <QrCode className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  // If no user is authenticated, don't render (will redirect via middleware/layout)
  if (!user) {
    return null
  }

  // Check permission - try both snake_case and camelCase
  const adminRole = user?.admin_role || (user as any)?.adminRole
  const hasStaffPermission = hasPermission(adminRole as any, "staff-management")
  
  if (!hasStaffPermission) {
    return null
  }
  
  // Show loading state while fetching
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    )
  }
  
  // Show empty state if no staff members
  if (staffMembers.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">No staff members found</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
            <p className="text-slate-600">Manage admin staff accounts and their access permissions</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Create a new staff account with specific role permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@carmona.gov.ph"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Staff Role</Label>
                  <Select
                    value={newStaff.adminRole}
                    onValueChange={(value: AdminRole) => setNewStaff({ ...newStaff, adminRole: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verifier_staff">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span>Verification Staff</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="scanner_staff">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-green-600" />
                          <span>QR Scanner Staff</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {newStaff.adminRole === "verifier_staff" 
                      ? "Can view scholars, applications, and verify students"
                      : "Can only scan QR codes for verification"}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStaff} className="bg-emerald-600 hover:bg-emerald-700">
                  Add Staff
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role Permissions Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100">
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-base">Head Administrator</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Full system access</p>
              <div className="flex flex-wrap gap-1">
                {ADMIN_PERMISSIONS.head_admin.map((perm) => (
                  <Badge key={perm} variant="outline" className="text-xs bg-purple-50">
                    {perm}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-base">Verification Staff</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Verify scholars and manage applications</p>
              <div className="flex flex-wrap gap-1">
                {ADMIN_PERMISSIONS.verifier_staff.map((perm) => (
                  <Badge key={perm} variant="outline" className="text-xs bg-blue-50">
                    {perm}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100">
                  <QrCode className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-base">QR Scanner Staff</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">QR code scanning only</p>
              <div className="flex flex-wrap gap-1">
                {ADMIN_PERMISSIONS.scanner_staff.map((perm) => (
                  <Badge key={perm} variant="outline" className="text-xs bg-green-50">
                    {perm}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>
              {staffMembers.length} staff member{staffMembers.length !== 1 ? "s" : ""} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(staff.adminRole!)} flex items-center gap-1 w-fit`}>
                          {getRoleIcon(staff.adminRole!)}
                          {getAdminRoleLabel(staff.adminRole!)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ADMIN_PERMISSIONS[staff.adminRole!]?.slice(0, 3).map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                          {ADMIN_PERMISSIONS[staff.adminRole!]?.length > 3 && (
                            <Badge key="more" variant="outline" className="text-xs">
                              +{ADMIN_PERMISSIONS[staff.adminRole!].length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {staff.adminRole !== "head_admin" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedStaff(staff)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedStaff(staff)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {staff.adminRole === "head_admin" && (
                          <span className="text-xs text-muted-foreground">Protected</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Role</DialogTitle>
            <DialogDescription>
              Change the role and permissions for {selectedStaff?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <p className="text-sm text-muted-foreground">
                {selectedStaff && getAdminRoleLabel(selectedStaff.adminRole!)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select
                value={selectedStaff?.adminRole}
                onValueChange={(value: AdminRole) => 
                  setSelectedStaff(selectedStaff ? { ...selectedStaff, adminRole: value } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verifier_staff">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span>Verification Staff</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="scanner_staff">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-green-600" />
                      <span>QR Scanner Staff</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole} className="bg-emerald-600 hover:bg-emerald-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedStaff?.name} from the system? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
