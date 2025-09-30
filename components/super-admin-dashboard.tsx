"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useCenterContext } from "@/context/center-context"
import { UserCreationDialog } from "@/components/user-creation-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Calendar, 
  CreditCard, 
  BarChart3, 
  Building, 
  Settings,
  UserCheck,
  Clock,
  Target,
  Trophy,
  ArrowUpRight,
  Layers,
  User,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Users2,
  IndianRupee,
  Database,
  Shield,
  Activity,
  TrendingUp,
  Crown,
  Globe,
  Zap
} from "lucide-react"

interface DashboardStats {
  totalStudents: number
  totalBatches: number
  totalCoaches: number
  totalCenters: number
  totalUsers: number
  attendanceToday: number
  attendanceRate: number
  pendingFees: number
  totalRevenue: number
  recentPayments: number
  centerStats: CenterStats[]
}

interface CenterStats {
  centerId: string
  centerName: string
  location: string
  students: number
  batches: number
  coaches: number
  attendanceRate: number
  revenue: number
  pendingFees: number
}

interface RecentActivity {
  id: string
  type: 'payment' | 'attendance' | 'registration' | 'batch_creation' | 'user_creation'
  description: string
  timestamp: string
  amount?: number
  centerName?: string
}

export function SuperAdminDashboard() {
  const { selectedCenter } = useCenterContext()
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalBatches: 0,
    totalCoaches: 0,
    totalCenters: 0,
    totalUsers: 0,
    attendanceToday: 0,
    attendanceRate: 0,
    pendingFees: 0,
    totalRevenue: 0,
    recentPayments: 0,
    centerStats: []
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  // supabase client is imported

  useEffect(() => {
    loadDashboardData()
  }, [selectedCenter])

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadOverallStats(),
        loadCenterStats(),
        loadRecentActivities()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOverallStats = async () => {
    try {
      // Get overall statistics - filter by selected center if applicable
      const centerFilter = selectedCenter ? selectedCenter.id : null
      
      const [
        { data: students },
        { data: batches },
        { data: coaches },
        { data: centers },
        { data: users },
        { data: attendanceToday },
        { data: feePayments }
      ] = await Promise.all([
        // Students filtered by center using direct center_id
        centerFilter 
          ? supabase.from('students').select('id').eq('center_id', centerFilter)
          : supabase.from('students').select('id'),
        // Batches filtered by center
        centerFilter 
          ? supabase.from('batches').select('id').eq('center_id', centerFilter)
          : supabase.from('batches').select('id'),
        // Coaches filtered by center
        centerFilter 
          ? supabase.from('users').select('id').eq('role', 'coach').eq('center_id', centerFilter)
          : supabase.from('users').select('id').eq('role', 'coach'),
        // Centers - always show all for super admin
        supabase.from('centers').select('id'),
        // Users - always show all for super admin
        supabase.from('users').select('id'),
        // Attendance filtered by center using students.center_id
        centerFilter 
          ? supabase.from('attendance').select('status, students!inner(center_id)').eq('students.center_id', centerFilter).eq('date', new Date().toISOString().split('T')[0])
          : supabase.from('attendance').select('status').eq('date', new Date().toISOString().split('T')[0]),
        // Fee payments filtered by center using students.center_id
        centerFilter 
          ? supabase.from('fee_payments').select('amount, status, payment_date, students!inner(center_id)').eq('students.center_id', centerFilter)
          : supabase.from('fee_payments').select('amount, status, payment_date')
      ])

      const presentToday = attendanceToday?.filter(a => a.status === 'present').length || 0
      const totalStudents = students?.length || 0
      const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0

      const paidFees = feePayments?.filter(f => f.status === 'paid') || []
      const pendingFees = feePayments?.filter(f => f.status === 'due' || f.status === 'overdue') || []
      
      const totalRevenue = paidFees.reduce((sum, f) => sum + Number(f.amount), 0)
      const totalPendingFees = pendingFees.reduce((sum, f) => sum + Number(f.amount), 0)

      // Recent payments (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const recentPayments = paidFees
        .filter(f => f.payment_date >= sevenDaysAgo)
        .reduce((sum, f) => sum + Number(f.amount), 0)

      setStats(prev => ({
        ...prev,
        totalStudents,
        totalBatches: batches?.length || 0,
        totalCoaches: coaches?.length || 0,
        totalCenters: centers?.length || 0,
        totalUsers: users?.length || 0,
        attendanceToday: presentToday,
        attendanceRate,
        pendingFees: totalPendingFees,
        totalRevenue,
        recentPayments
      }))
    } catch (error) {
      console.error('Error loading overall stats:', error)
    }
  }

  const loadCenterStats = async () => {
    try {
      const { data: centers } = await supabase
        .from('centers')
        .select('id, name, location')

      if (!centers) return

      const centerStats = await Promise.all(
        centers.map(async (center) => {
          const [
            { data: students },
            { data: batches },
            { data: coaches },
            { data: attendance },
            { data: feePayments }
          ] = await Promise.all([
            supabase.from('students').select('id').eq('center_id', center.id),
            supabase.from('batches').select('id').eq('center_id', center.id),
            supabase.from('users').select('id').eq('role', 'coach').eq('center_id', center.id),
            supabase.from('attendance').select('status, students!inner(center_id)').eq('students.center_id', center.id).eq('date', new Date().toISOString().split('T')[0]),
            supabase.from('fee_payments').select('amount, status, students!inner(center_id)').eq('students.center_id', center.id)
          ])

          const centerStudents = students?.length || 0
          const centerAttendance = attendance?.filter(a => a.status === 'present').length || 0
          const centerAttendanceRate = centerStudents > 0 ? Math.round((centerAttendance / centerStudents) * 100) : 0

          const centerRevenue = feePayments?.filter(f => f.status === 'paid').reduce((sum, f) => sum + Number(f.amount), 0) || 0
          const centerPendingFees = feePayments?.filter(f => f.status === 'due' || f.status === 'overdue').reduce((sum, f) => sum + Number(f.amount), 0) || 0

          return {
            centerId: center.id,
            centerName: center.name,
            location: center.location,
            students: centerStudents,
            batches: batches?.length || 0,
            coaches: coaches?.length || 0,
            attendanceRate: centerAttendanceRate,
            revenue: centerRevenue,
            pendingFees: centerPendingFees
          }
        })
      )

      setStats(prev => ({
        ...prev,
        centerStats
      }))
    } catch (error) {
      console.error('Error loading center stats:', error)
    }
  }

  const loadRecentActivities = async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const centerFilter = selectedCenter ? selectedCenter.id : null
      
      const [
        { data: payments },
        { data: students },
        { data: batches },
        { data: users }
      ] = await Promise.all([
        // Fee payments with student and center info
        centerFilter
          ? supabase.from('fee_payments').select('id, amount, created_at, students!inner(full_name, center_id, centers!inner(location))').eq('students.center_id', centerFilter).eq('status', 'paid').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10)
          : supabase.from('fee_payments').select('id, amount, created_at, students(full_name, centers(location))').eq('status', 'paid').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10),
        // Students with center info
        centerFilter
          ? supabase.from('students').select('id, full_name, created_at, centers!inner(location)').eq('center_id', centerFilter).gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10)
          : supabase.from('students').select('id, full_name, created_at, centers(location)').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10),
        // Batches with center info
        centerFilter
          ? supabase.from('batches').select('id, name, created_at, centers!inner(location)').eq('center_id', centerFilter).gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10)
          : supabase.from('batches').select('id, name, created_at, centers(location)').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10),
        // Users with center info
        centerFilter
          ? supabase.from('users').select('id, full_name, created_at, centers!inner(location)').eq('center_id', centerFilter).gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10)
          : supabase.from('users').select('id, full_name, created_at, centers(location)').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10)
      ])

      const activities: RecentActivity[] = []

      // Process payments
      payments?.forEach((payment: any) => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          description: `Fee payment received from ${payment.students?.full_name || 'Unknown Student'}`,
          timestamp: payment.created_at,
          amount: Number(payment.amount),
          centerName: payment.students?.centers?.location || selectedCenter?.location || 'Unknown Center'
        })
      })

      // Process student registrations
      students?.forEach((student: any) => {
        activities.push({
          id: `registration-${student.id}`,
          type: 'registration',
          description: `New student registration - ${student.full_name}`,
          timestamp: student.created_at,
          centerName: student.centers?.location || selectedCenter?.location || 'Unknown Center'
        })
      })

      // Process batch creations
      batches?.forEach((batch: any) => {
        activities.push({
          id: `batch-${batch.id}`,
          type: 'batch_creation',
          description: `New batch created - ${batch.name}`,
          timestamp: batch.created_at,
          centerName: batch.centers?.location || selectedCenter?.location || 'Unknown Center'
        })
      })

      // Process user creations
      users?.forEach((user: any) => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user_creation',
          description: `New user created - ${user.full_name}`,
          timestamp: user.created_at,
          centerName: user.centers?.location || selectedCenter?.location || 'System'
        })
      })

      // Sort by timestamp and limit
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20)

      setRecentActivities(sortedActivities)
    } catch (error) {
      console.error('Error loading recent activities:', error)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <IndianRupee className="h-4 w-4 text-green-500" />
      case 'attendance':
        return <UserCheck className="h-4 w-4 text-blue-500" />
      case 'registration':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'batch_creation':
        return <Layers className="h-4 w-4 text-orange-500" />
      case 'user_creation':
        return <User className="h-4 w-4 text-indigo-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading Super Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6">
      {/* Modern Super Admin Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-burgundy-600 via-burgundy-700 to-burgundy-800 rounded-2xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-600/90 to-burgundy-800/90"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-300/10 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Crown className="h-8 w-8 text-gold-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
                <p className="text-burgundy-100 text-lg">Complete system control and oversight</p>
              </div>
            </div>
            {selectedCenter && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Building className="h-3 w-3 mr-1" />
                  Viewing: {selectedCenter.location}
                </Badge>
              </div>
            )}
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 justify-end">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">System Status</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-300" />
              <span className="text-xl font-bold">All Systems Online</span>
            </div>
            <p className="text-burgundy-100 text-sm">Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Enhanced System Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Users</CardTitle>
            <div className="p-2 bg-burgundy-50 rounded-lg group-hover:bg-burgundy-100 transition-colors">
              <Users className="h-5 w-5 text-burgundy-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-burgundy-700 mb-2">{stats.totalUsers}</div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-burgundy-500 h-2 rounded-full" style={{ width: `${Math.min((stats.totalUsers / 100) * 100, 100)}%` }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">All system users</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Centers</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-2">{stats.totalCenters}</div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((stats.totalCenters / 10) * 100, 100)}%` }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Active training centers</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Students</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <GraduationCap className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">{stats.totalStudents}</div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((stats.totalStudents / 500) * 100, 100)}%` }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Attendance</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 mb-2">{stats.attendanceRate}%</div>
            <div className="mt-2">
              <Progress value={stats.attendanceRate} className="h-2 bg-gray-200" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Today's attendance</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Revenue</CardTitle>
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
            <p className="text-xs text-gray-500 mt-2">Total collected</p>
          </CardContent>
        </Card>
      </div>

   

       

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.centerStats.map((center) => (
              <Card key={center.centerId} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{center.location}</CardTitle>
                      <CardDescription>{center.centerName}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{center.students}</div>
                        <div className="text-xs text-gray-500">Students</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{center.batches}</div>
                        <div className="text-xs text-gray-500">Batches</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{center.coaches}</div>
                        <div className="text-xs text-gray-500">Coaches</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{center.attendanceRate}%</div>
                        <div className="text-xs text-gray-500">Attendance</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-600">Revenue</span>
                        <span className="font-semibold text-green-600">₹{center.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="font-semibold text-red-600">₹{center.pendingFees.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-100">
                  <Button variant="outline" size="sm" className="w-full group hover:bg-burgundy-50 hover:border-burgundy-200">
                    <BarChart3 className="mr-2 h-4 w-4 text-burgundy-600 group-hover:text-burgundy-700" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

       
    </div>
  )
} 