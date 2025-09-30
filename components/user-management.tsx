"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Users, Shield, AlertCircle, Eye, EyeOff, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PhotoUpload from "@/components/photo-upload"
import { useRouter } from "next/navigation"
type UserRole = 'super_admin' | 'club_manager' | 'head_coach' | 'coach' | 'center_manager'
import { 
  GraduationCap, 
  UserCog, 
  Building, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Key, 
  Search, 
  Filter, 
  UserPlus
} from "lucide-react"

interface User {
  id: string
  full_name: string
  email: string
  role: UserRole
  center_id: string | null
  center_name: string
  created_at?: string
  photo?: string | null
}

interface Center {
  id: string
  name: string
  location: string
}

const roleConfig = {
  super_admin: {
    label: "Super Administrator",
    description: "Full system access and control",
    icon: Shield,
    color: "bg-red-500 text-white",
    requiresCenter: false
  },
  club_manager: {
    label: "Club Manager", 
    description: "Attendance and financial oversight across all centers",
    icon: Users,
    color: "bg-blue-500 text-white",
    requiresCenter: false
  },
  head_coach: {
    label: "Head Coach",
    description: "Training performance oversight across all centers", 
    icon: GraduationCap,
    color: "bg-green-500 text-white",
    requiresCenter: false
  },
  coach: {
    label: "Coach",
    description: "Center-specific batch and student management",
    icon: UserCog,
    color: "bg-purple-500 text-white",
    requiresCenter: true
  },
  center_manager: {
    label: "Center Manager",
    description: "Single center operational coordination",
    icon: Building,
    color: "bg-orange-500 text-white",
    requiresCenter: true
  }
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState<{ open: boolean; user?: User }>({ open: false })
  const [showReset, setShowReset] = useState<{ open: boolean; user?: User }>({ open: false })
  const [showDelete, setShowDelete] = useState<{ open: boolean; user?: User }>({ open: false })
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [centerFilter, setCenterFilter] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  
  const [form, setForm] = useState<{
    email: string
    fullName: string
    password: string
    role: UserRole
    centerId: string
    photo: string | null
  }>({ email: "", fullName: "", password: "", role: "coach", centerId: "", photo: null })
  
  const [resetPassword, setResetPassword] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuthAndLoad()
  }, [router])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, centerFilter])

  const checkAuthAndLoad = async () => {
    try {
      const user = await getCurrentUser()
      if (!user || user.role !== "super_admin") {
        router.push("/unauthorized")
        return
      }
      await Promise.all([loadUsers(), loadCenters()])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({ title: "Error loading data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      let query = supabase
        .from("users")
        .select(`
          *,
          centers!left(
            name,
            location
          )
        `)
        .order("created_at", { ascending: false })

      // Apply center filter if specified
      if (centerFilter && centerFilter !== "") {
        query = query.eq("center_id", centerFilter)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Transform data to include center_name from the joined centers table
      const transformedData = data.map(user => ({
        ...user,
        center_name: user.centers?.name || "No Center Assigned"
      }))
      
      setUsers(transformedData)
    } catch (error) {
      console.error("Error loading users:", error)
      toast({ title: "Error loading users", variant: "destructive" })
    }
  }

  const loadCenters = async () => {
    try {
      const { data, error } = await supabase
        .from("centers")
        .select("*")
        .order("name")

      if (error) throw error
      setCenters(data as Center[])
    } catch (error) {
      console.error("Error loading centers:", error)
      toast({ title: "Error loading centers", variant: "destructive" })
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filter by center
    if (centerFilter && centerFilter !== "") {
      filtered = filtered.filter(user => user.center_id === centerFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleCreate = async () => {
    if (!form.email || !form.fullName || !form.password || !form.role) {
      toast({ title: "All fields are required", variant: "destructive" })
      return
    }

    const selectedRole = roleConfig[form.role]
    if (selectedRole?.requiresCenter && !form.centerId) {
      toast({ title: "This role requires a center assignment", variant: "destructive" })
      return
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .insert({
          full_name: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role,
          center_id: form.centerId || null
        })
        .select()
        .single()

      if (error) throw error

      toast({ title: "Coach created successfully" })
      setShowCreate(false)
      resetForm()
      await loadUsers()
    } catch (error: any) {
      toast({ title: error.message, variant: "destructive" })
    }
  }

  const handleUpdate = async () => {
    if (!showEdit.user || !form.email || !form.fullName || !form.role) {
      toast({ title: "All fields are required", variant: "destructive" })
      return
    }

    const selectedRole = roleConfig[form.role]
    if (selectedRole?.requiresCenter && !form.centerId) {
      toast({ title: "This role requires a center assignment", variant: "destructive" })
      return
    }

    try {
      const updateData: any = {
        full_name: form.fullName,
        email: form.email,
        role: form.role,
        center_id: form.centerId || null
      }

      if (form.password) {
        updateData.password = form.password
      }

      const { data, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", showEdit.user.id)
        .select()
        .single()

      if (error) throw error

      toast({ title: "Coach updated successfully" })
      setShowEdit({ open: false })
      resetForm()
      await loadUsers()
    } catch (error: any) {
      toast({ title: error.message, variant: "destructive" })
    }
  }

  const handleDelete = async () => {
    if (!showDelete.user) return

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", showDelete.user.id)

      if (error) throw error

      toast({ title: "Coach deleted successfully" })
      setShowDelete({ open: false })
      await loadUsers()
    } catch (error: any) {
      toast({ title: error.message, variant: "destructive" })
    }
  }

  const handlePasswordReset = async () => {
    if (!resetPassword.trim()) {
      toast({ 
        title: "Please enter a new password",
        variant: "destructive" 
      })
      return
    }

    try {
      // For now, we'll store the password directly
      if (!showReset.user) return

      // In production, this should be handled by a server-side function
      const { error } = await supabase
        .from("users")
        .update({ password_hash: resetPassword }) // This should be hashed server-side
        .eq("id", showReset.user.id)

      if (error) throw error

      toast({ title: "Password reset successfully" })
      setShowReset({ open: false, user: undefined })
      setResetPassword("")
    } catch (error: any) {
      console.error("Error resetting password:", error)
      toast({ 
        title: "Failed to reset password",
        description: error.message,
        variant: "destructive" 
      })
    }
  }

  const resetForm = () => {
    setForm({ email: "", fullName: "", password: "", role: "coach", centerId: "" })
    setShowPassword(false)
  }

  const openEditDialog = (user: User) => {
    setForm({
      email: user.email,
      fullName: user.full_name,
      password: "",
      role: user.role,
      centerId: user.center_id || ""
    })
    setShowEdit({ open: true, user })
  }

  const getRoleIcon = (role: UserRole) => {
    const config = roleConfig[role]
    const Icon = config.icon
    return <Icon className="h-4 w-4" />
  }

  const getRoleBadge = (role: UserRole) => {
    const config = roleConfig[role]
    return (
      <Badge className={`${config.color} text-xs`}>
        {getRoleIcon(role)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    )
  }

  const getStats = () => {
    const totalUsers = users.length
    const roleStats = Object.keys(roleConfig).map(role => ({
      role: role as UserRole,
      count: users.filter(u => u.role === role).length,
      label: roleConfig[role as UserRole].label
    })).filter(stat => stat.count > 0)

    return { totalUsers, roleStats }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Coach Management</h1>
            <p className="text-gray-600 mt-1">Manage coaches and staff members across all centers</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Coach
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          {stats.roleStats.slice(0, 3).map((stat) => (
            <Card key={stat.role}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                  </div>
                  {getRoleIcon(stat.role)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search coaches by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={centerFilter} onValueChange={setCenterFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by center" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center) => (
                    <SelectItem key={center.id} value={center.id}>{center.location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Coaches List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No users found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader className="bg-gray-100">
                        <TableRow>
                          <TableHead className="text-left p-3 font-medium text-gray-600">Coach</TableHead>
                          <TableHead className="text-left p-3 font-medium text-gray-600">Role</TableHead>
                          <TableHead className="text-left p-3 font-medium text-gray-600">Center</TableHead>
                          <TableHead className="text-right p-3 font-medium text-gray-600">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id} className="border-b hover:bg-gray-50">
                            <TableCell className="p-3">
                              <div>
                                <p className="font-medium text-gray-900">{user.full_name}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="p-3">
                              {getRoleBadge(user.role)}
                            </TableCell>
                            <TableCell className="p-3">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                {user.center_name}
                              </div>
                            </TableCell>
                            <TableCell className="p-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditDialog(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowReset({ open: true, user })}
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowDelete({ open: true, user })}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                          {getRoleBadge(user.role)}
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                          <MapPin className="h-3 w-3" />
                          {user.center_name}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowReset({ open: true, user })}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDelete({ open: true, user })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Coach Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Coach
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={form.role} onValueChange={(val) => setForm(f => ({ ...f, role: val as UserRole }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(key as UserRole)}
                        <div>
                          <p className="font-medium">{config.label}</p>
                          <p className="text-xs text-gray-500">{config.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {roleConfig[form.role]?.requiresCenter && (
              <div>
                <Label htmlFor="center">Center</Label>
                <Select value={form.centerId} onValueChange={(val) => setForm(f => ({ ...f, centerId: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select center" />
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{center.name}</p>
                            <p className="text-xs text-gray-500">{center.location}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Coach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coach Dialog */}
      <Dialog open={showEdit.open} onOpenChange={(open) => setShowEdit({ open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Coach
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFullName">Full Name</Label>
              <Input
                id="editFullName"
                value={form.fullName}
                onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="editPassword">New Password (optional)</Label>
              <div className="relative">
                <Input
                  id="editPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Leave blank to keep current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="editRole">Role</Label>
              <Select value={form.role} onValueChange={(val) => setForm(f => ({ ...f, role: val as UserRole }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(key as UserRole)}
                        <div>
                          <p className="font-medium">{config.label}</p>
                          <p className="text-xs text-gray-500">{config.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {roleConfig[form.role]?.requiresCenter && (
              <div>
                <Label htmlFor="editCenter">Center</Label>
                <Select value={form.centerId} onValueChange={(val) => setForm(f => ({ ...f, centerId: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select center" />
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{center.name}</p>
                            <p className="text-xs text-gray-500">{center.location}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update Coach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showReset.open} onOpenChange={(open) => setShowReset({ open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Reset Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="coach-info">Coach</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{showReset.user?.full_name}</p>
                <p className="text-sm text-gray-600">{showReset.user?.email}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showResetPassword ? "text" : "password"}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                >
                  {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReset({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handlePasswordReset}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Coach Dialog */}
      <Dialog open={showDelete.open} onOpenChange={(open) => setShowDelete({ open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Coach
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-medium">Are you sure you want to delete this coach?</p>
              <p className="text-red-600 text-sm mt-1">This action cannot be undone.</p>
            </div>
            <div>
              <Label>Coach Details</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{showDelete.user?.full_name}</p>
                <p className="text-sm text-gray-600">{showDelete.user?.email}</p>
                <p className="text-sm text-gray-600">{showDelete.user?.center_name}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete({ open: false })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Coach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 