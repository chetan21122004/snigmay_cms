"use client"
import { useState, useEffect } from "react"
import { signOut, getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CoachManagement } from "@/components/coach-management"
import StudentManagement from "@/components/student-management"
import BatchManagement from "@/components/batch-management"
import { AttendanceReports } from "@/components/attendance-reports"
import { 
  LogOut, 
  Users, 
  GraduationCap, 
  Calendar, 
  BarChart3, 
  Building, 
  CreditCard,
  Settings,
  User,
  Bell,
  Search,
  Menu
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState({
    totalCenters: 3,
    totalCoaches: 0,
    totalStudents: 0,
    totalBatches: 0,
    attendanceToday: 0,
    pendingFees: 0
  })

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      // In a real app, we would fetch these stats from the database
      // For now, we'll use dummy data
      setStats({
        totalCenters: 3,
        totalCoaches: 8,
        totalStudents: 120,
        totalBatches: 15,
        attendanceToday: 85,
        pendingFees: 12
      })
    }
    loadUser()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const centerLocations = ["Kharadi", "Viman Nagar", "Hadapsar"]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">Snigmay Pune FC</h1>
          <p className="text-xs text-gray-500 mt-1">Super Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Button 
            variant={activeTab === "dashboard" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("dashboard")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          
          <Button 
            variant={activeTab === "centers" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("centers")}
          >
            <Building className="mr-2 h-4 w-4" />
            Centers
          </Button>
          
          <Button 
            variant={activeTab === "batches" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("batches")}
          >
            <Users className="mr-2 h-4 w-4" />
            Batches
          </Button>
          
          <Button 
            variant={activeTab === "coaches" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("coaches")}
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Coaches
          </Button>
          
          <Button 
            variant={activeTab === "students" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("students")}
          >
            <User className="mr-2 h-4 w-4" />
            Students
          </Button>
          
          <Button 
            variant={activeTab === "attendance" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("attendance")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Attendance
          </Button>
          
          <Button 
            variant={activeTab === "fees" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("fees")}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Fee Management
          </Button>
          
          <Button 
            variant={activeTab === "reports" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("reports")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>
          
          <Button 
            variant={activeTab === "settings" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          {/* Coach Management (Super Admin only) */}
          {user?.role === "super_admin" && (
            <Button
              variant={activeTab === "user-management" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => { setActiveTab("user-management"); router.push("/user-management"); }}
            >
              <Users className="mr-2 h-4 w-4" />
              Coach Management
            </Button>
          )}
          {/* Change Password (all users) */}
          <Button
            variant={activeTab === "change-password" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => { setActiveTab("change-password"); router.push("/change-password"); }}
          >
            <Settings className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Button onClick={handleSignOut} variant="outline" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
      
      {/* Mobile menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-lg font-bold text-primary">Snigmay Pune FC</h1>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {mobileMenuOpen && (
          <nav className="p-4 space-y-2 bg-white border-b border-gray-200">
            <Button 
              variant={activeTab === "dashboard" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => {
                setActiveTab("dashboard")
                setMobileMenuOpen(false)
              }}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            
            <Button 
              variant={activeTab === "centers" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => {
                setActiveTab("centers")
                setMobileMenuOpen(false)
              }}
            >
              <Building className="mr-2 h-4 w-4" />
              Centers
            </Button>
            
            <Button 
              variant={activeTab === "batches" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => {
                setActiveTab("batches")
                setMobileMenuOpen(false)
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Batches
            </Button>
            
            <Button 
              variant={activeTab === "coaches" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => {
                setActiveTab("coaches")
                setMobileMenuOpen(false)
              }}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Coaches
            </Button>
            
            <Button 
              variant={activeTab === "students" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => {
                setActiveTab("students")
                setMobileMenuOpen(false)
              }}
            >
              <User className="mr-2 h-4 w-4" />
              Students
            </Button>
            
            <Button onClick={handleSignOut} variant="outline" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            {/* Coach Management (Super Admin only) */}
            {user?.role === "super_admin" && (
              <Button
                variant={activeTab === "user-management" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("user-management");
                  setMobileMenuOpen(false);
                  router.push("/user-management");
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                Coach Management
              </Button>
            )}
            {/* Change Password (all users) */}
            <Button
              variant={activeTab === "change-password" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab("change-password");
                setMobileMenuOpen(false);
                router.push("/change-password");
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </nav>
        )}
      </div>
      
      {/* Main content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
        {/* Header */}
        <div className="hidden md:flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "centers" && "Center Management"}
              {activeTab === "batches" && "Batch Management"}
              {activeTab === "coaches" && "Coach Management"}
              {activeTab === "students" && "Student Management"}
              {activeTab === "attendance" && "Attendance Management"}
              {activeTab === "fees" && "Fee Management"}
              {activeTab === "reports" && "Reports & Analytics"}
              {activeTab === "settings" && "System Settings"}
            </h1>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input 
                type="search" 
                placeholder="Search..." 
                className="w-64 pl-9" 
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-auto">
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">New coach registration</p>
                      <p className="text-sm text-gray-500">Coach Rahul requested approval</p>
                      <p className="text-xs text-gray-400">10 minutes ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">Fee payment reminder</p>
                      <p className="text-sm text-gray-500">12 students have pending fees</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium text-left hidden lg:block">
                    {user?.full_name || "Super Admin"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Centers</p>
                      <h3 className="text-2xl font-bold mt-1">{stats.totalCenters}</h3>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <div className="flex items-center text-green-600">
                      <span>All centers active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Coaches</p>
                      <h3 className="text-2xl font-bold mt-1">{stats.totalCoaches}</h3>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <div className="flex items-center text-green-600">
                      <span>+2 new this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Students</p>
                      <h3 className="text-2xl font-bold mt-1">{stats.totalStudents}</h3>
                    </div>
                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <div className="flex items-center text-green-600">
                      <span>+15 new this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Batches</p>
                      <h3 className="text-2xl font-bold mt-1">{stats.totalBatches}</h3>
                    </div>
                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <div className="flex items-center text-green-600">
                      <span>All batches active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Today's Attendance</p>
                      <h3 className="text-2xl font-bold mt-1">{stats.attendanceToday}%</h3>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <div className="flex items-center text-amber-600">
                      <span>-5% from yesterday</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending Fees</p>
                      <h3 className="text-2xl font-bold mt-1">{stats.pendingFees}</h3>
                    </div>
                    <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <div className="flex items-center text-red-600">
                      <span>Action needed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Center Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Centers Overview</CardTitle>
                <CardDescription>Performance metrics across all training centers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {centerLocations.map((center, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{center} Center</h3>
                        <p className="text-sm text-gray-500">
                          {index === 0 ? "5 batches · 45 students" : 
                           index === 1 ? "6 batches · 52 students" : 
                           "4 batches · 23 students"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Attendance</p>
                          <p className="font-medium">
                            {index === 0 ? "92%" : 
                             index === 1 ? "88%" : 
                             "78%"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Fee Collection</p>
                          <p className="font-medium">
                            {index === 0 ? "₹45,000" : 
                             index === 1 ? "₹52,000" : 
                             "₹23,000"}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest updates across all centers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mt-1">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">New student registered</p>
                      <p className="text-sm text-gray-500">Arjun Sharma joined Kharadi Center - U12 Batch</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Attendance marked</p>
                      <p className="text-sm text-gray-500">Coach Rahul marked attendance for Viman Nagar - U14 Batch</p>
                      <p className="text-xs text-gray-400">3 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mt-1">
                      <CreditCard className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Fee payment received</p>
                      <p className="text-sm text-gray-500">₹5,000 received from Rohan Patil - Hadapsar Center</p>
                      <p className="text-xs text-gray-400">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Batches Content */}
        {activeTab === "batches" && (
          <Card>
            <CardHeader>
              <CardTitle>Batch Management</CardTitle>
              <CardDescription>Create and manage training batches across all centers</CardDescription>
            </CardHeader>
            <CardContent>
              <BatchManagement />
            </CardContent>
          </Card>
        )}
        
        {/* Coaches Content */}
        {activeTab === "coaches" && (
          <Card>
            <CardHeader>
              <CardTitle>Coach Management</CardTitle>
              <CardDescription>Manage coach profiles and assignments across all centers</CardDescription>
            </CardHeader>
            <CardContent>
              <CoachManagement />
            </CardContent>
          </Card>
        )}
        
        {/* Students Content */}
        {activeTab === "students" && (
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>Manage student registrations and batch assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentManagement />
            </CardContent>
          </Card>
        )}
        
        {/* Attendance Content */}
        {activeTab === "attendance" && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Reports</CardTitle>
              <CardDescription>View and analyze attendance data across all centers</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceReports />
            </CardContent>
          </Card>
        )}
        
        {/* Other tabs would be implemented similarly */}
        {(activeTab === "centers" || activeTab === "fees" || activeTab === "reports" || activeTab === "settings") && (
          <Card className="h-[500px] flex items-center justify-center">
            <CardContent>
              <p className="text-center text-gray-500">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module will be implemented soon.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
