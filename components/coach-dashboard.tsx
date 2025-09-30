"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useCenterContext } from "@/context/center-context"
import { getCurrentUser } from "@/lib/auth"
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
  Activity,
  TrendingUp,
  Zap,
  Medal,
  FileText
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  totalStudents: number
  totalBatches: number
  attendanceToday: number
  attendanceRate: number
  pendingFees: number
  totalRevenue: number
  recentPayments: number
  myBatches: BatchInfo[]
}

interface BatchInfo {
  id: string
  name: string
  students: number
  attendanceRate: number
  feeCollectionRate: number
  ageGroup: string
}

interface User {
  id: string
  email: string
  full_name: string
  role: string
  center_id: string | null
}

interface RecentActivity {
  id: string
  type: 'payment' | 'attendance' | 'registration'
  description: string
  timestamp: string
  amount?: number
  batchName?: string
}

export function CoachDashboard() {
  const { 
    selectedCenter, 
    getStudentsByCenter, 
    getBatchesByCenter, 
    getAttendanceByCenter, 
    getFeesByCenter,
    user,
    loading: contextLoading 
  } = useCenterContext()
  
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalBatches: 0,
    attendanceToday: 0,
    attendanceRate: 0,
    pendingFees: 0,
    totalRevenue: 0,
    recentPayments: 0,
    myBatches: []
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

  // Calculate stats based on center data
  useEffect(() => {
    if (!selectedCenter || !user || contextLoading) return

    // Get center-specific data
    const centerStudents = getStudentsByCenter(selectedCenter.id)
    const centerBatches = getBatchesByCenter(selectedCenter.id)
    const centerAttendance = getAttendanceByCenter(selectedCenter.id)
    const centerFees = getFeesByCenter(selectedCenter.id)

    // Filter batches where this coach is assigned
    const myBatches = centerBatches.filter(batch => batch.coach_id === user.id)

    // Calculate attendance for today
    const today = new Date().toISOString().split('T')[0]
    const todayAttendance = centerAttendance.filter(a => a.date === today)
    const presentToday = todayAttendance.filter(a => a.status === 'present').length

    // Calculate fee stats
    const paidFees = centerFees.filter(f => f.status === 'paid')
    const pendingFees = centerFees.filter(f => f.status === 'due' || f.status === 'overdue')
    const totalRevenue = paidFees.reduce((sum, f) => sum + f.amount, 0)
    const totalPending = pendingFees.reduce((sum, f) => sum + f.amount, 0)

      // Recent payments (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentPayments = paidFees
      .filter(f => new Date(f.payment_date) >= sevenDaysAgo)
      .reduce((sum, f) => sum + f.amount, 0)

    // Create batch info
    const batchInfo: BatchInfo[] = myBatches.map(batch => {
      const batchStudents = centerStudents.filter(s => s.batch_id === batch.id)
      const batchAttendance = centerAttendance.filter(a => a.batch_id === batch.id)
      const batchPresentToday = batchAttendance.filter(a => a.date === today && a.status === 'present').length

          return {
            id: batch.id,
            name: batch.name,
        students: batchStudents.length,
        attendanceRate: batchStudents.length > 0 ? Math.round((batchPresentToday / batchStudents.length) * 100) : 0,
        feeCollectionRate: 85, // Placeholder
        ageGroup: batch.name.includes('Under') ? batch.name : 'Mixed'
          }
        })

      setStats({
      totalStudents: centerStudents.filter(s => myBatches.some(b => b.id === s.batch_id)).length,
      totalBatches: myBatches.length,
        attendanceToday: presentToday,
      attendanceRate: todayAttendance.length > 0 ? Math.round((presentToday / todayAttendance.length) * 100) : 0,
      pendingFees: totalPending,
        totalRevenue,
        recentPayments,
      myBatches: batchInfo
    })

    // Create recent activities
      const activities: RecentActivity[] = []

    // Add recent attendance
    centerAttendance.slice(0, 5).forEach(record => {
        activities.push({
        id: record.id,
          type: 'attendance',
        description: `Marked attendance for batch`,
          timestamp: record.created_at,
        batchName: centerBatches.find(b => b.id === record.batch_id)?.name
        })
      })

    // Add recent payments
    paidFees.slice(0, 5).forEach(payment => {
        activities.push({
        id: payment.id,
        type: 'payment',
        description: `Fee payment received`,
        timestamp: payment.created_at || payment.payment_date,
        amount: payment.amount
        })
      })

    setRecentActivities(
      activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
    )
  }, [selectedCenter, user, contextLoading, getStudentsByCenter, getBatchesByCenter, getAttendanceByCenter, getFeesByCenter])

  if (contextLoading || loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!selectedCenter) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Center Assigned</CardTitle>
            <CardDescription className="text-center">
              Please contact your administrator to assign you to a center.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <IndianRupee className="h-4 w-4 text-green-500" />
      case 'attendance':
        return <UserCheck className="h-4 w-4 text-blue-500" />
      case 'registration':
        return <Users className="h-4 w-4 text-purple-500" />
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

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600"
    if (rate >= 75) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Coach Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Coach Dashboard
            </h1>
            <p className="text-orange-100 mt-1">Manage your batches and students at {selectedCenter.name} Center</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-orange-100">Your Performance</p>
            <div className="flex items-center gap-2 mt-1">
              <Trophy className="h-4 w-4 text-yellow-300" />
              <span className="text-lg font-semibold">{stats.attendanceRate}% Attendance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coach Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <GraduationCap className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                <Layers className="mr-1 h-3 w-3" />
                {stats.totalBatches} Batches
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Under your coaching
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Batches</CardTitle>
            <Layers className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBatches}</div>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Users2 className="mr-1 h-3 w-3" />
                {stats.totalBatches > 0 ? Math.round(stats.totalStudents / stats.totalBatches) : 0} avg. size
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Assigned to you
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <UserCheck className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <div className="mt-2">
              <Progress value={stats.attendanceRate} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.attendanceToday} students present
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
            <IndianRupee className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              From your students
            </p>
            </CardContent>
          </Card>
        </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batches">My Batches</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activities</CardTitle>
                <CardDescription>Latest updates from your batches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {activity.batchName && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              {activity.batchName}
                            </Badge>
                          )}
                          {activity.amount && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              ₹{activity.amount.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common coaching tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/attendance">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Mark Attendance
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/students">
                    <Users className="mr-2 h-4 w-4" />
                    View Students
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/fees">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Check Fees
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/batches">
                    <Layers className="mr-2 h-4 w-4" />
                    Manage Batches
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/coach/player-reports">
                    <FileText className="mr-2 h-4 w-4" />
                    Player Reports
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batches" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {stats.myBatches.map((batch) => (
              <Card key={batch.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="h-5 w-5 text-blue-500" />
                        {batch.name}
                      </CardTitle>
                      <CardDescription>{selectedCenter.name} Center</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {batch.ageGroup}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{batch.students}</div>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getPerformanceColor(batch.attendanceRate)}`}>
                        {batch.attendanceRate}%
                      </div>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                      <Progress value={batch.attendanceRate} className="h-1 mt-1" />
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getPerformanceColor(batch.feeCollectionRate)}`}>
                        {batch.feeCollectionRate}%
                      </div>
                      <p className="text-xs text-muted-foreground">Fee Collection</p>
                      <Progress value={batch.feeCollectionRate} className="h-1 mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((batch.attendanceRate + batch.feeCollectionRate) / 2)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Batch Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attendance Management</CardTitle>
              <CardDescription>Mark and track attendance for your batches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Manage attendance for your students</p>
                <Button asChild>
                  <a href="/attendance">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Go to Attendance
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Management</CardTitle>
              <CardDescription>View and manage students in your batches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">View your students and their progress</p>
                <Button asChild>
                  <a href="/students">
                    <Users className="mr-2 h-4 w-4" />
                    Go to Students
                  </a>
                </Button>
              </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}
