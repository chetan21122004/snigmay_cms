'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Activity,
  Users, 
  Calendar as CalendarIcon,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Building,
  Layers,
  UserCheck,
  Zap
} from 'lucide-react'
import { useCenterContext } from '@/context/center-context'

interface DashboardStats {
  totalStudents: number
  totalBatches: number
  attendanceRate: number
  feeCollection: number
  recentPayments: any[]
  upcomingBatches: any[]
  attendanceToday: any[]
}

export default function CenterManagerDashboard() {
  const { selectedCenter, getStudentsByCenter, getBatchesByCenter, getAttendanceByCenter, getFeesByCenter } = useCenterContext()
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)

  // Calculate stats based on center data
  const stats = useMemo((): DashboardStats => {
    if (!selectedCenter) {
      return {
    totalStudents: 0,
    totalBatches: 0,
    attendanceRate: 0,
        feeCollection: 0,
        recentPayments: [],
        upcomingBatches: [],
        attendanceToday: []
      }
    }

    const centerStudents = getStudentsByCenter(selectedCenter.id)
    const centerBatches = getBatchesByCenter(selectedCenter.id)
    const centerAttendance = getAttendanceByCenter(selectedCenter.id)
    const centerFees = getFeesByCenter(selectedCenter.id)

    // Calculate attendance rate (last 30 days)
    const attendanceRate = centerAttendance.length > 0
      ? (centerAttendance.filter(a => a.status === 'present').length / centerAttendance.length) * 100
      : 0

    // Calculate fee collection
    const feeCollection = centerFees
      .filter(f => f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0)

    // Get recent payments (last 5)
    const recentPayments = centerFees
      .filter(f => f.status === 'paid')
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
      .slice(0, 5)
      .map(payment => ({
        ...payment,
        student_name: centerStudents.find(s => s.id === payment.student_id)?.full_name || 'Unknown Student'
      }))

      // Get today's attendance
    const today = new Date().toISOString().split('T')[0]
    const attendanceToday = centerAttendance
      .filter(a => a.date === today)
      .map(record => ({
        ...record,
        student_name: centerStudents.find(s => s.id === record.student_id)?.full_name || 'Unknown Student',
        batch_name: centerBatches.find(b => b.id === record.batch_id)?.name || 'Unknown Batch'
      }))

    // Mock upcoming batches (in a real app, this would be calculated based on schedule)
    const upcomingBatches = centerBatches.slice(0, 5).map(batch => ({
      ...batch,
      coach_name: 'Coach Name' // This would come from a join with users table
    }))

          return {
      totalStudents: centerStudents.length,
      totalBatches: centerBatches.length,
        attendanceRate,
      feeCollection,
        recentPayments,
      upcomingBatches,
      attendanceToday
    }
  }, [selectedCenter, getStudentsByCenter, getBatchesByCenter, getAttendanceByCenter, getFeesByCenter])

  if (!selectedCenter) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Center Selected</h3>
          <p className="text-gray-500">Please select a center to view the dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6">
      {/* Modern Center Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-burgundy-600 via-burgundy-700 to-burgundy-800 rounded-2xl p-8 text-white shadow-2xl">
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
                <h1 className="text-3xl font-bold tracking-tight">{selectedCenter.name}</h1>
                <p className="text-burgundy-100 text-lg">{selectedCenter.location}</p>
                </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 justify-end">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Center Status</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-300" />
              <span className="text-xl font-bold">Active</span>
            </div>
            <p className="text-burgundy-100 text-sm">All systems operational</p>
          </div>
        </div>
            </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Total Students</p>
                <h3 className="text-3xl font-bold text-burgundy-700 mt-2">
                  {stats.totalStudents}
                </h3>
              </div>
              <div className="h-12 w-12 bg-burgundy-50 rounded-full flex items-center justify-center group-hover:bg-burgundy-100 transition-colors">
                <Users className="h-6 w-6 text-burgundy-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-burgundy-500 h-2 rounded-full" style={{ width: `${Math.min((stats.totalStudents / 50) * 100, 100)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round((stats.totalStudents / 50) * 100)}% capacity utilized
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Active Batches</p>
                <h3 className="text-3xl font-bold text-blue-700 mt-2">
                  {stats.totalBatches}
                </h3>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((stats.totalBatches / 20) * 100, 100)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Training groups active
              </p>
            </div>
            </CardContent>
          </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Attendance Rate</p>
                <h3 className="text-3xl font-bold text-green-700 mt-2">
                  {stats.attendanceRate}%
                </h3>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.attendanceRate}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Today's attendance
              </p>
            </div>
            </CardContent>
          </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Fee Collection</p>
                <h3 className="text-3xl font-bold text-gold-700 mt-2">
                  ₹{stats.feeCollection.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 bg-gold-50 rounded-full flex items-center justify-center group-hover:bg-gold-100 transition-colors">
                <Wallet className="h-6 w-6 text-gold-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gold-500 h-2 rounded-full" style={{ width: `${Math.min((stats.feeCollection / 100000) * 100, 100)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This month's collection
              </p>
            </div>
            </CardContent>
          </Card>
        </div>

      {/* Enhanced Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Payments */}
        <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/30">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Wallet className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Recent Payments</CardTitle>
                  <CardDescription>Latest fee payments and transactions</CardDescription>
                </div>
              </div>
              <Button className="bg-burgundy-600 hover:bg-burgundy-700">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                {stats.recentPayments.map((payment, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all duration-200">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={payment.avatar} alt={payment.studentName} />
                      <AvatarFallback className="bg-burgundy-50 text-burgundy-600">
                        {payment.studentName.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                      <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{payment.studentName}</p>
                      <p className="text-xs text-gray-500">{payment.batchName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">₹{payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{payment.date}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {payment.status}
                    </Badge>
                    </div>
                  ))}
            </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Upcoming Batches */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/30">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
          </div>
                  <div>
                  <CardTitle className="text-lg">Upcoming Batches</CardTitle>
                  <CardDescription>Today's schedule</CardDescription>
                </div>
                </div>
              </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {stats.upcomingBatches.map((batch, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">{batch.time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{batch.name}</p>
                      <p className="text-xs text-gray-500">{batch.coach}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {batch.students} students
                    </Badge>
                  </div>
                ))}
                </div>
              </CardContent>
            </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/30">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-burgundy-50 rounded-lg">
                  <Zap className="h-5 w-5 text-burgundy-600" />
                  </div>
                <div>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common management tasks</CardDescription>
                </div>
          </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button variant="outline" className="w-full justify-start h-12 text-left group hover:bg-burgundy-50 hover:border-burgundy-200" asChild>
                <a href="/attendance">
                  <UserCheck className="mr-3 h-5 w-5 text-burgundy-600 group-hover:text-burgundy-700" />
                  <div>
                    <div className="font-semibold">Mark Attendance</div>
                    <div className="text-xs text-gray-500">Record student attendance</div>
                  </div>
                    </a>
                  </Button>
              <Button variant="outline" className="w-full justify-start h-12 text-left group hover:bg-burgundy-50 hover:border-burgundy-200" asChild>
                <a href="/students">
                  <Users className="mr-3 h-5 w-5 text-burgundy-600 group-hover:text-burgundy-700" />
                  <div>
                    <div className="font-semibold">Manage Students</div>
                    <div className="text-xs text-gray-500">Add or edit students</div>
                  </div>
                    </a>
                  </Button>
              <Button variant="outline" className="w-full justify-start h-12 text-left group hover:bg-burgundy-50 hover:border-burgundy-200" asChild>
                <a href="/fees">
                  <Wallet className="mr-3 h-5 w-5 text-burgundy-600 group-hover:text-burgundy-700" />
                  <div>
                    <div className="font-semibold">Fee Management</div>
                    <div className="text-xs text-gray-500">Handle payments</div>
                </div>
                </a>
              </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
} 