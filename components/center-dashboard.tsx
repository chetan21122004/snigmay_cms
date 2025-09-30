"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Users, GraduationCap, CreditCard, BarChart3, Clock, MapPin, UserCheck, Target, Trophy, ArrowUpRight, TrendingUp, AlertCircle, CheckCircle, Activity, Building, IndianRupee, Layers } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { useCenterContext } from "@/context/center-context"
import StudentManagement from "@/components/student-management"
import BatchManagement from "@/components/batch-management"
import CenterAttendanceManagement from "@/components/center-attendance-management"
import FeeManagement from "@/components/fee-management"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardFooter } from "@/components/ui/card"

interface Center {
  id: string
  name: string
  location: string
  description: string
}

interface DashboardStats {
  totalStudents: number
  totalBatches: number
  totalCoaches: number
  attendanceToday: number
  attendanceRate: number
  pendingFees: number
  totalRevenue: number
  recentPayments: number
}

interface User {
  id: string
  email: string
  full_name: string
  role: string
  center_id: string | null
}

// Sample data for charts
const attendanceData = [85, 78, 92, 88, 76, 82, 90];
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CenterDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [centers, setCenters] = useState<Center[]>([])
  const [selectedCenter, setSelectedCenter] = useState<string>("")
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalBatches: 0,
    totalCoaches: 0,
    attendanceToday: 0,
    attendanceRate: 0,
    pendingFees: 0,
    totalRevenue: 0,
    recentPayments: 0
  })
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly')

  useEffect(() => {
    loadUserAndCenters()
  }, [])

  useEffect(() => {
    // Get selected center from localStorage (set by layout)
    const storedCenter = localStorage.getItem("selectedCenter") || ""
    setSelectedCenter(storedCenter)
    if (storedCenter) {
      loadDashboardStats(storedCenter)
    }
  }, [])

  const loadUserAndCenters = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      // Fetch centers based on user role
      const response = await fetch('/api/centers')
      const centersData = await response.json()
      setCenters(centersData)

      // Get center from localStorage
      const storedCenter = localStorage.getItem("selectedCenter") || ""
      setSelectedCenter(storedCenter)
    } catch (error) {
      console.error('Error loading user and centers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardStats = async (centerId: string) => {
    try {
      const response = await fetch(`/api/dashboard/stats?center=${centerId}`)
      const statsData = await response.json()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    }
  }

  const canAccessCenter = (centerId: string) => {
    if (!user) return false
    
    // Super admin, club manager, and head coach can access all centers
    if (['super_admin', 'club_manager', 'head_coach'].includes(user.role)) {
      return true
    }
    
    // Coach and center manager can only access their assigned center
    if (['coach', 'center_manager'].includes(user.role)) {
      return user.center_id === centerId
    }
    
    return false
  }

  const getFilteredCenters = () => {
    if (!user) return []
    
    if (['super_admin', 'club_manager', 'head_coach'].includes(user.role)) {
      return centers
    }
    
    return centers.filter(center => center.id === user.center_id)
  }

  const getDashboardTitle = () => {
    if (!selectedCenter) {
      return 'Select Center'
    }
    const center = centers.find(c => c.id === selectedCenter)
    return center ? `${center.location} Center` : 'Center Dashboard'
  }

  // Function to get a color based on value
  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600"
    if (rate >= 75) return "text-amber-500"
    return "text-red-500"
  }

  const getFeeStatusColor = (pendingAmount: number, totalAmount: number) => {
    const ratio = pendingAmount / totalAmount
    if (ratio <= 0.1) return "text-green-600"
    if (ratio <= 0.25) return "text-amber-500"
    return "text-red-500"
  }

  // Calculate stats for display
  const collectionRate = stats.totalRevenue > 0 
    ? ((stats.totalRevenue / (stats.totalRevenue + stats.pendingFees)) * 100).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Modern Header with title and time selector */}
      <div className="relative overflow-hidden bg-gradient-to-br from-burgundy-600 via-burgundy-700 to-burgundy-800 rounded-2xl p-8 text-white shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-600/90 to-burgundy-800/90"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-300/10 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Building className="h-8 w-8 text-gold-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Football Academy Management Dashboard</h1>
                <p className="text-burgundy-100 text-lg">Comprehensive center management and analytics</p>
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 justify-end">
              <CalendarDays className="h-4 w-4 text-burgundy-100" />
              <span className="text-sm font-medium">Time Period</span>
            </div>
            <Select value={timeframe} onValueChange={(value: 'weekly' | 'monthly') => setTimeframe(value)}>
              <SelectTrigger className="w-[140px] h-9 bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enhanced Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Students</CardTitle>
            <div className="p-2 bg-burgundy-50 rounded-lg group-hover:bg-burgundy-100 transition-colors">
              <Users className="h-5 w-5 text-burgundy-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-burgundy-700 mb-2">{stats.totalStudents}</div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-burgundy-500 h-2 rounded-full" style={{ width: `${Math.min((stats.totalStudents / 500) * 100, 100)}%` }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Active Batches</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Layers className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-2">{stats.totalBatches}</div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((stats.totalBatches / 50) * 100, 100)}%` }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Training groups</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Attendance Rate</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">{stats.attendanceRate}%</div>
            <div className="mt-2">
              <Progress value={stats.attendanceRate} className="h-2 bg-gray-200" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Today's attendance</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Revenue</CardTitle>
            <div className="p-2 bg-gold-50 rounded-lg group-hover:bg-gold-100 transition-colors">
              <IndianRupee className="h-5 w-5 text-gold-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold-700 mb-2">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gold-500 h-2 rounded-full" style={{ width: `${Math.min((stats.totalRevenue / 1000000) * 100, 100)}%` }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Collected fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-burgundy-50 data-[state=active]:text-burgundy-700 data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-lg data-[state=active]:bg-burgundy-50 data-[state=active]:text-burgundy-700 data-[state=active]:shadow-sm">Attendance</TabsTrigger>
          <TabsTrigger value="fees" className="rounded-lg data-[state=active]:bg-burgundy-50 data-[state=active]:text-burgundy-700 data-[state=active]:shadow-sm">Fee Management</TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg data-[state=active]:bg-burgundy-50 data-[state=active]:text-burgundy-700 data-[state=active]:shadow-sm">Students</TabsTrigger>
          <TabsTrigger value="batches" className="rounded-lg data-[state=active]:bg-burgundy-50 data-[state=active]:text-burgundy-700 data-[state=active]:shadow-sm">Batches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced Weekly Attendance Chart */}
            <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/30">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Weekly Attendance Trends</CardTitle>
                    <CardDescription>Attendance percentage by day</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[200px] flex items-end justify-between gap-2">
                  {attendanceData.map((value, index) => (
                    <div key={index} className="relative flex flex-col items-center">
                      <div 
                        className={`w-12 rounded-t-md ${value > 85 ? 'bg-green-500' : value > 75 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ height: `${value * 1.5}px` }}
                      ></div>
                      <div className="absolute bottom-0 w-full h-full flex flex-col justify-between items-center">
                        <span className="text-xs font-medium text-white mt-1">{value}%</span>
                        <span className="text-xs text-muted-foreground mt-2">{daysOfWeek[index]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Financial Summary */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/30">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold-50 rounded-lg">
                    <IndianRupee className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Financial Summary</CardTitle>
                    <CardDescription>Revenue and collection overview</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Total Revenue</span>
                    <span className="font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Pending Fees</span>
                    <span className="font-bold text-red-600">₹{stats.pendingFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Collection Rate</span>
                    <span className={`font-bold ${parseFloat(collectionRate) > 85 ? 'text-green-500' : parseFloat(collectionRate) > 70 ? 'text-amber-500' : 'text-red-500'}`}>
                      {collectionRate}%
                    </span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Collection Progress</div>
                    <Progress value={parseFloat(collectionRate)} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      {parseFloat(collectionRate) > 85 ? 'Excellent' : parseFloat(collectionRate) > 70 ? 'Good' : 'Needs attention'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/30">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Attendance Management</CardTitle>
                  <CardDescription>Track and manage student attendance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="p-4 bg-green-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <UserCheck className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Attendance System</h3>
                <p className="text-gray-600 mb-6">Comprehensive attendance tracking and management coming soon...</p>
                <Button className="bg-green-600 hover:bg-green-700">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/30">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-50 rounded-lg">
                  <IndianRupee className="h-5 w-5 text-gold-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Fee Management</CardTitle>
                  <CardDescription>Manage fee collection and payments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="p-4 bg-gold-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <IndianRupee className="h-10 w-10 text-gold-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fee Management System</h3>
                <p className="text-gray-600 mb-6">Advanced fee collection and payment tracking coming soon...</p>
                <Button className="bg-gold-600 hover:bg-gold-700">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/30">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-burgundy-50 rounded-lg">
                  <Users className="h-5 w-5 text-burgundy-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Student Management</CardTitle>
                  <CardDescription>Manage student information and records</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="p-4 bg-burgundy-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-10 w-10 text-burgundy-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Directory</h3>
                <p className="text-gray-600 mb-6">Comprehensive student management system coming soon...</p>
                <Button className="bg-burgundy-600 hover:bg-burgundy-700">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/30">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Batch Management</CardTitle>
                  <CardDescription>Manage training batches and schedules</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="p-4 bg-blue-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Layers className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Batch Management</h3>
                <p className="text-gray-600 mb-6">Advanced batch scheduling and management coming soon...</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Placeholder components for different sections
function FeeManagementSection({ centerId }: { centerId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Management</CardTitle>
        <CardDescription>Manage student fees and payments</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Fee management interface for center: {centerId}</p>
        {/* This will be implemented with detailed fee management functionality */}
      </CardContent>
    </Card>
  )
}

function StudentsSection({ centerId }: { centerId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Management</CardTitle>
        <CardDescription>Manage student records and information</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Student management interface for center: {centerId}</p>
        {/* This will be implemented with detailed student management functionality */}
      </CardContent>
    </Card>
  )
}

function BatchesSection({ centerId }: { centerId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Management</CardTitle>
        <CardDescription>Manage training batches and schedules</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Batch management interface for center: {centerId}</p>
        {/* This will be implemented with detailed batch management functionality */}
      </CardContent>
    </Card>
  )
} 
} 