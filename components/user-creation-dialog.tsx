"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { UserPlus, Eye, EyeOff, Building, Shield, Users, GraduationCap, UserCog } from "lucide-react"
import bcrypt from 'bcryptjs'

interface Center {
  id: string
  name: string
  location: string
}

interface UserCreationDialogProps {
  onUserCreated?: () => void
}

const roleConfig = {
  super_admin: {
    label: "Super Administrator",
    description: "Full system access and control",
    icon: Shield,
    color: "bg-red-500",
    requiresCenter: false
  },
  club_manager: {
    label: "Club Manager",
    description: "Attendance and financial oversight across all centers",
    icon: Users,
    color: "bg-blue-500",
    requiresCenter: false
  },
  head_coach: {
    label: "Head Coach",
    description: "Training performance oversight across all centers",
    icon: GraduationCap,
    color: "bg-green-500",
    requiresCenter: false
  },
  coach: {
    label: "Coach",
    description: "Center-specific batch and student management",
    icon: UserCog,
    color: "bg-purple-500",
    requiresCenter: true
  },
  center_manager: {
    label: "Center Manager",
    description: "Single center operational coordination",
    icon: Building,
    color: "bg-orange-500",
    requiresCenter: true
  }
}

export function UserCreationDialog({ onUserCreated }: UserCreationDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [centers, setCenters] = useState<Center[]>([])
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "",
    centerId: ""
  })

  useEffect(() => {
    if (open) {
      loadCenters()
    }
  }, [open])

  const loadCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('centers')
        .select('id, name, location')
        .order('location')

      if (error) throw error
      setCenters(data || [])
    } catch (error) {
      console.error('Error loading centers:', error)
      toast({
        title: "Error",
        description: "Failed to load centers",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.fullName || !formData.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const selectedRole = roleConfig[formData.role as keyof typeof roleConfig]
    if (selectedRole?.requiresCenter && !formData.centerId) {
      toast({
        title: "Validation Error",
        description: "This role requires a center assignment",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Hash the password
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(formData.password, saltRounds)

      // Create user in database
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email: formData.email,
            password_hash: hashedPassword,
            full_name: formData.fullName,
            role: formData.role,
            center_id: formData.centerId || null
          }
        ])
        .select()

      if (error) throw error

      toast({
        title: "Success",
        description: `User ${formData.fullName} created successfully`,
      })

      // Reset form
      setFormData({
        email: "",
        password: "",
        fullName: "",
        role: "",
        centerId: ""
      })

      setOpen(false)
      onUserCreated?.()

    } catch (error: any) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "A user with this email already exists"
          : "Failed to create user",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedRoleConfig = formData.role ? roleConfig[formData.role as keyof typeof roleConfig] : null
  const RoleIcon = selectedRoleConfig?.icon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Create New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account with appropriate role and center assignment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pr-10"
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
            </CardContent>
          </Card>

          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Assignment</CardTitle>
              <CardDescription>
                Select the appropriate role based on the user's responsibilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">User Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value, centerId: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${config.color}`} />
                            <Icon className="h-4 w-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedRoleConfig && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full ${selectedRoleConfig.color}`} />
                    {RoleIcon && <RoleIcon className="h-5 w-5" />}
                    <span className="font-medium">{selectedRoleConfig.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedRoleConfig.description}</p>
                  {selectedRoleConfig.requiresCenter && (
                    <Badge variant="outline" className="mt-2">
                      <Building className="h-3 w-3 mr-1" />
                      Center Assignment Required
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Center Assignment */}
          {selectedRoleConfig?.requiresCenter && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Center Assignment</CardTitle>
                <CardDescription>
                  Assign the user to a specific training center
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="center">Training Center *</Label>
                  <Select value={formData.centerId} onValueChange={(value) => setFormData({ ...formData, centerId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a center" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{center.location}</span>
                            <span className="text-muted-foreground">- {center.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 