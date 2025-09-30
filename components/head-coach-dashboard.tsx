"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useCenterContext } from "@/context/center-context"
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
  Medal
} from "lucide-react"


interface DashboardStats {
  totalStudents: number
  totalBatches: number
  totalCoaches: number
  totalCenters: number
  attendanceToday: number
  attendanceRate: number
  pendingFees: number
  totalRevenue: number
  recentPayments: number
  centerStats: CenterStats[]
  batchPerformance: BatchPerformance[]
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

interface BatchPerformance {
  batchId: string
  batchName: string
  centerName: string
  students: number
  attendanceRate: number
  feeCollectionRate: number
  coachName: string
  ageGroup: string
}

interface RecentActivity {
  id: string
  type: 'payment' | 'attendance' | 'registration' | 'batch_creation' | 'coaching'
  description: string
  timestamp: string
  amount?: number
  centerName?: string
  batchName?: string
}

export function HeadCoachDashboard() {
  const { 
    selectedCenter,
    getStudentsByCenter,
    getBatchesByCenter,
    getAttendanceByCenter,
    getFeesByCenter,
    centers,
    user,
    loading: contextLoading
  } = useCenterContext()
  
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalBatches: 0,
    totalCoaches: 0,
    totalCenters: 0,
    attendanceToday: 0,
    attendanceRate: 0,
    pendingFees: 0,
    totalRevenue: 0,
    recentPayments: 0,
    centerStats: [],
    batchPerformance: []
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
        loadBatchPerformance(),
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
      if (!selectedCenter) {
        // If no center selected, show overall stats across all centers
        const [
          { data: students },
          { data: batches },
          { data: coaches },
          { data: attendanceToday },
          { data: feePayments }
        ] = await Promise.all([
          supabase.from('students').select('id'),
          supabase.from('batches').select('id'),
          supabase.from('users').select('id').eq('role', 'coach'),
          supabase.from('attendance').select('status').eq('date', new Date().toISOString().split('T')[0]),
          supabase.from('fee_payments').select('amount, status, payment_date')
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
          totalCenters: centers.length,
          attendanceToday: presentToday,
          attendanceRate,
          pendingFees: totalPendingFees,
          totalRevenue,
          recentPayments
        }))
      } else {
        // If center is selected, show stats for that center only
        const centerStudents = getStudentsByCenter(selectedCenter.id)
        const centerBatches = getBatchesByCenter(selectedCenter.id)
        const centerAttendance = getAttendanceByCenter(selectedCenter.id)
        const centerFees = getFeesByCenter(selectedCenter.id)

        // Get coaches for this center
        const { data: coaches } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'coach')
          .eq('center_id', selectedCenter.id)

        // Calculate today's attendance
        const today = new Date().toISOString().split('T')[0]
        const todayAttendance = centerAttendance.filter(a => a.date === today)
        const presentToday = todayAttendance.filter(a => a.status === 'present').length

        // Calculate fee stats
        const paidFees = centerFees.filter(f => f.status === 'paid')
        const pendingFeesArr = centerFees.filter(f => f.status === 'due' || f.status === 'overdue')
        const totalRevenue = paidFees.reduce((sum, f) => sum + f.amount, 0)
        const totalPendingFees = pendingFeesArr.reduce((sum, f) => sum + f.amount, 0)

        // Recent payments (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const recentPayments = paidFees
          .filter(f => new Date(f.payment_date) >= sevenDaysAgo)
          .reduce((sum, f) => sum + f.amount, 0)

        setStats(prev => ({
          ...prev,
          totalStudents: centerStudents.length,
          totalBatches: centerBatches.length,
          totalCoaches: coaches?.length || 0,
          totalCenters: 1, // Single center selected
          attendanceToday: presentToday,
          attendanceRate: todayAttendance.length ? Math.round((presentToday / todayAttendance.length) * 100) : 0,
          pendingFees: totalPendingFees,
          totalRevenue: totalRevenue,
          recentPayments
        }))
      }
    } catch (error) {
      console.error('Error loading overall stats:', error)
    }
  }

  const loadCenterStats = async () => {
    try {
      // Use centers from context instead of fetching them again
      const centerStats = centers.map((center) => {
        const centerStudents = getStudentsByCenter(center.id)
        const centerBatches = getBatchesByCenter(center.id)
        const centerAttendance = getAttendanceByCenter(center.id)
        const centerFees = getFeesByCenter(center.id)

        // Calculate today's attendance for this center
        const today = new Date().toISOString().split('T')[0]
        const todayAttendance = centerAttendance.filter(a => a.date === today)
        const presentToday = todayAttendance.filter(a => a.status === 'present').length
        const centerAttendanceRate = todayAttendance.length > 0 ? Math.round((presentToday / todayAttendance.length) * 100) : 0

        // Calculate fee stats for this center
        const paidFees = centerFees.filter(f => f.status === 'paid')
        const pendingFees = centerFees.filter(f => f.status === 'due' || f.status === 'overdue')
        const centerRevenue = paidFees.reduce((sum, f) => sum + f.amount, 0)
        const centerPendingFees = pendingFees.reduce((sum, f) => sum + f.amount, 0)

        return {
          centerId: center.id,
          centerName: center.name,
          location: center.location,
          students: centerStudents.length,
          batches: centerBatches.length,
          coaches: centerBatches.filter((batch, index, self) => 
            batch.coach_id && self.findIndex(b => b.coach_id === batch.coach_id) === index
          ).length, // Unique coaches count
          attendanceRate: centerAttendanceRate,
          revenue: centerRevenue,
          pendingFees: centerPendingFees
        }
      })

      setStats(prev => ({
        ...prev,
        centerStats
      }))
    } catch (error) {
      console.error('Error loading center stats:', error)
    }
  }

  const loadBatchPerformance = async () => {
    try {
      const { data: batches } = await supabase
        .from('batches')
        .select(`
          id,
          name,
          centers(name, location),
          users(full_name),
          students(id),
          fee_payments(amount, status),
          attendance(status, date)
        `)

      if (!batches) return

      const batchPerformance = batches.map(batch => {
        const students = batch.students || []
        const payments = batch.fee_payments || []
        const attendance = batch.attendance || []

        // Calculate attendance rate (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const recentAttendance = attendance.filter(a => a.date >= thirtyDaysAgo)
        const presentCount = recentAttendance.filter(a => a.status === 'present').length
        const attendanceRate = recentAttendance.length > 0 ? Math.round((presentCount / recentAttendance.length) * 100) : 0

        // Calculate fee collection rate
        const paidPayments = payments.filter(p => p.status === 'paid')
        const totalPayments = payments.length
        const feeCollectionRate = totalPayments > 0 ? Math.round((paidPayments.length / totalPayments) * 100) : 0

        // Extract age group from batch name
        const ageGroup = batch.name.match(/U-(\d+)/)?.[0] || 'Unknown'

        return {
          batchId: batch.id,
          batchName: batch.name,
          centerName: batch.centers?.location || 'Unknown',
          students: students.length,
          attendanceRate,
          feeCollectionRate,
          coachName: batch.users?.full_name || 'Unassigned',
          ageGroup
        }
      })

      setStats(prev => ({
        ...prev,
        batchPerformance
      }))
    } catch (error) {
      console.error('Error loading batch performance:', error)
    }
  }

  const loadRecentActivities = async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      
      const [
        { data: payments },
        { data: attendance },
        { data: students },
        { data: batches }
      ] = await Promise.all([
        supabase.from('fee_payments').select('id, amount, created_at, students(full_name, batches(name, centers(location)))').eq('status', 'paid').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10),
        supabase.from('attendance').select('id, created_at, batches(name, centers(location))').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10),
        supabase.from('students').select('id, full_name, created_at, batches(name, centers(location))').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10),
        supabase.from('batches').select('id, name, created_at, centers(location)').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(10)
      ])

      const activities: RecentActivity[] = []

      // Process payments
      payments?.forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          description: `Fee payment from ${payment.students?.full_name || 'Unknown Student'}`,
          timestamp: payment.created_at,
          amount: Number(payment.amount),
          centerName: payment.students?.batches?.centers?.location || 'Unknown',
          batchName: payment.students?.batches?.name || 'Unknown'
        })
      })

      // Process attendance
      attendance?.forEach(record => {
        activities.push({
          id: `attendance-${record.id}`,
          type: 'attendance',
          description: `Attendance marked for ${record.batches?.name || 'Unknown Batch'}`,
          timestamp: record.created_at,
          centerName: record.batches?.centers?.location || 'Unknown',
          batchName: record.batches?.name || 'Unknown'
        })
      })

      // Process student registrations
      students?.forEach(student => {
        activities.push({
          id: `registration-${student.id}`,
          type: 'registration',
          description: `New student joined - ${student.full_name}`,
          timestamp: student.created_at,
          centerName: student.batches?.centers?.location || 'Unknown',
          batchName: student.batches?.name || 'Unknown'
        })
      })

      // Process batch creations
      batches?.forEach(batch => {
        activities.push({
          id: `batch-${batch.id}`,
          type: 'batch_creation',
          description: `New batch created - ${batch.name}`,
          timestamp: batch.created_at,
          centerName: batch.centers?.location || 'Unknown',
          batchName: batch.name
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
      case 'coaching':
        return <Target className="h-4 w-4 text-indigo-500" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading Head Coach Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Head Coach Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6" />
              Head Coach Dashboard
            </h1>
            <p className="text-green-100 mt-1">Oversee training performance and development across all centers</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-100">Overall Performance</p>
            <div className="flex items-center gap-2 mt-1">
              <Trophy className="h-4 w-4 text-yellow-300" />
              <span className="text-lg font-semibold">{stats.attendanceRate}% Attendance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Building className="mr-1 h-3 w-3" />
                {stats.totalCenters} Centers
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Under training supervision
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Layers className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBatches}</div>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Users2 className="mr-1 h-3 w-3" />
                {stats.totalCoaches} Coaches
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Training groups managed
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <UserCheck className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <div className="mt-2">
              <Progress value={stats.attendanceRate} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Training participation today
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
            <IndianRupee className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Total revenue collected
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Batch Performance</TabsTrigger>
          <TabsTrigger value="centers">Centers</TabsTrigger>
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Training Activities */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Recent Training Activities</CardTitle>
                <CardDescription>Latest coaching and training updates</CardDescription>
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
                          {activity.centerName && (
                            <Badge variant="outline" className="text-xs">
                              {activity.centerName}
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

            {/* Coaching Actions */}
          <Card>
            <CardHeader>
                <CardTitle className="text-lg">Coaching Actions</CardTitle>
                <CardDescription>Training management tools</CardDescription>
            </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/attendance">
                    <UserCheck className="mr-2 h-4 w-4" />
                    View Attendance
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/batches">
                    <Layers className="mr-2 h-4 w-4" />
                    Manage Batches
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/students">
                    <Users className="mr-2 h-4 w-4" />
                    Student Progress
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/fees">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Fee Status
                  </a>
                </Button>
            </CardContent>
          </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {stats.batchPerformance.map((batch) => (
              <Card key={batch.batchId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="h-5 w-5 text-blue-500" />
                        {batch.batchName}
                      </CardTitle>
                      <CardDescription>{batch.centerName} • Coach: {batch.coachName}</CardDescription>
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
                    View Detailed Performance
                  </Button>
                </CardFooter>
          </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="centers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.centerStats.map((center) => (
              <Card key={center.centerId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-500" />
                    {center.location}
                  </CardTitle>
                  <CardDescription>{center.centerName}</CardDescription>
            </CardHeader>
            <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Students</span>
                      <span className="font-medium">{center.students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Batches</span>
                      <span className="font-medium">{center.batches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Coaches</span>
                      <span className="font-medium">{center.coaches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Attendance</span>
                      <span className={`font-medium ${getPerformanceColor(center.attendanceRate)}`}>
                        {center.attendanceRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue</span>
                      <span className="font-medium text-green-600">₹{center.revenue.toLocaleString()}</span>
                    </div>
                  </div>
            </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Training Reports
                  </Button>
                </CardFooter>
          </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="coaching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coaching Resources</CardTitle>
              <CardDescription>Tools and resources for effective coaching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Advanced coaching tools and resources coming soon...</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/attendance">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Attendance Tracking
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/batches">
                      <Layers className="mr-2 h-4 w-4" />
                      Batch Management
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 