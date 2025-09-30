"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { useCenterContext } from "@/context/center-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Users, GraduationCap, CreditCard, BarChart3, Clock, MapPin, UserCheck, Target, Trophy, ArrowUpRight, TrendingUp, AlertCircle, CheckCircle, Activity, IndianRupee, UserPlus, ClipboardList, Plus, Eye, Zap, CheckCircle2, Building } from "lucide-react"
import Image from "next/image"

interface User {
  id: string
  email: string
  full_name: string
  role: string
  center_id: string | null
}

interface DashboardStats {
  totalStudents: number
  totalBatches: number
  totalCenters: number
  attendanceToday: number
  attendanceRate: number
  pendingFees: number
  totalRevenue: number
}

interface RecentActivity {
  id: string
  type: 'payment' | 'attendance' | 'registration' | 'batch_creation'
  description: string
  timestamp: string
  amount?: number
  centerName?: string // Added for enhanced activity display
}

export default function MainDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { 
    selectedCenter, 
    getStudentsByCenter, 
    getBatchesByCenter, 
    getAttendanceByCenter, 
    getFeesByCenter 
  } = useCenterContext()

  useEffect(() => {
  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
        console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }
    loadUser()
  }, [])

  // Calculate center-specific stats
  const getCenterStats = (): DashboardStats => {
    if (!selectedCenter) {
      return {
        totalStudents: 0,
        totalBatches: 0,
        totalCenters: 1,
        attendanceToday: 0,
        attendanceRate: 0,
        pendingFees: 0,
        totalRevenue: 0
      }
    }

    const centerStudents = getStudentsByCenter(selectedCenter.id)
    const centerBatches = getBatchesByCenter(selectedCenter.id)
    const centerAttendance = getAttendanceByCenter(selectedCenter.id)
    const centerFees = getFeesByCenter(selectedCenter.id)

    // Calculate today's attendance
    const today = new Date().toISOString().split('T')[0]
    const todayAttendance = centerAttendance.filter(record => record.date === today)
    const presentToday = todayAttendance.filter(record => record.status === 'present').length
    const attendanceRate = centerStudents.length > 0 ? (presentToday / centerStudents.length) * 100 : 0

    // Calculate fees
    const pendingFees = centerFees.filter(fee => fee.status === 'due' || fee.status === 'overdue').length
    const totalRevenue = centerFees
      .filter(fee => fee.status === 'paid')
      .reduce((sum, fee) => sum + Number(fee.amount), 0)

    return {
      totalStudents: centerStudents.length,
      totalBatches: centerBatches.length,
      totalCenters: 1,
      attendanceToday: presentToday,
      attendanceRate: Math.round(attendanceRate),
      pendingFees,
      totalRevenue
    }
  }

  // Get center-specific recent activities
  const getRecentActivities = (): RecentActivity[] => {
    if (!selectedCenter) return []

    const activities: RecentActivity[] = []
    const centerFees = getFeesByCenter(selectedCenter.id)
    const centerAttendance = getAttendanceByCenter(selectedCenter.id)
    const centerStudents = getStudentsByCenter(selectedCenter.id)

    // Add recent fee payments
    centerFees
      .filter(fee => fee.status === 'paid')
      .slice(0, 3)
      .forEach(fee => {
        const student = centerStudents.find(s => s.id === fee.student_id)
        activities.push({
          id: fee.id,
          type: 'payment',
          description: `Fee payment received from ${student?.full_name || 'Student'} - ₹${fee.amount}`,
          timestamp: fee.payment_date,
          amount: Number(fee.amount),
          centerName: selectedCenter.name // Add center name for enhanced display
        })
      })

    // Add recent attendance
    centerAttendance
      .slice(0, 3)
      .forEach(record => {
        const student = centerStudents.find(s => s.id === record.student_id)
        activities.push({
          id: record.id,
          type: 'attendance',
          description: `${student?.full_name || 'Student'} marked ${record.status}`,
          timestamp: record.created_at,
          centerName: selectedCenter.name // Add center name for enhanced display
        })
      })

    // Sort by timestamp and take latest 5
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }

  const stats = getCenterStats()
  const recentActivities = getRecentActivities()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <IndianRupee className="h-4 w-4 text-green-500" />
      case 'attendance':
        return <UserCheck className="h-4 w-4 text-blue-500" />
      case 'registration':
        return <UserPlus className="h-4 w-4 text-purple-500" />
      case 'batch_creation':
        return <ClipboardList className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Compact Professional Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-burgundy-600 via-burgundy-700 to-burgundy-800 rounded-lg md:rounded-xl p-3 md:p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-600/90 to-burgundy-800/90"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-gold-300" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight">{getGreeting()}, {user?.full_name || 'User'}!</h1>
              <p className="text-burgundy-100 text-sm md:text-base">
                {selectedCenter ? `${selectedCenter.name}` : 'Dashboard'}
              </p>
            </div>
          </div>
          <div className="text-left lg:text-right">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs md:text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-burgundy-600" />
              <div className="text-right">
                <div className="text-lg md:text-2xl font-bold text-burgundy-700">{stats.totalStudents}</div>
                <p className="text-xs text-gray-500">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <ClipboardList className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              <div className="text-right">
                <div className="text-lg md:text-2xl font-bold text-blue-700">{stats.totalBatches}</div>
                <p className="text-xs text-gray-500">Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              <div className="text-right">
                <div className="text-lg md:text-2xl font-bold text-green-700">{stats.attendanceRate}%</div>
                <p className="text-xs text-gray-500">Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
              <div className="text-right">
                <div className="text-lg md:text-2xl font-bold text-red-700">{stats.pendingFees}</div>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center Management */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-100 p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-burgundy-50 rounded-lg">
              <Building className="h-5 w-5 text-burgundy-600" />
            </div>
            <div>
              <CardTitle className="text-lg md:text-xl">Center Management</CardTitle>
              <CardDescription className="text-sm">Manage your training center operations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Button variant="outline" className="h-auto p-3 text-left group hover:bg-burgundy-50 hover:border-burgundy-200" asChild>
              <a href="/attendance">
                <div className="w-full">
                  <UserCheck className="h-5 w-5 text-burgundy-600 mb-2" />
                  <div className="font-semibold text-sm">Attendance</div>
                  <div className="text-xs text-gray-500">Mark daily attendance</div>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="h-auto p-3 text-left group hover:bg-burgundy-50 hover:border-burgundy-200" asChild>
              <a href="/students">
                <div className="w-full">
                  <Users className="h-5 w-5 text-burgundy-600 mb-2" />
                  <div className="font-semibold text-sm">Students</div>
                  <div className="text-xs text-gray-500">Manage enrollments</div>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="h-auto p-3 text-left group hover:bg-burgundy-50 hover:border-burgundy-200" asChild>
              <a href="/batches">
                <div className="w-full">
                  <ClipboardList className="h-5 w-5 text-burgundy-600 mb-2" />
                  <div className="font-semibold text-sm">Batches</div>
                  <div className="text-xs text-gray-500">Training schedules</div>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="h-auto p-3 text-left group hover:bg-burgundy-50 hover:border-burgundy-200" asChild>
              <a href="/fees">
                <div className="w-full">
                  <CreditCard className="h-5 w-5 text-burgundy-600 mb-2" />
                  <div className="font-semibold text-sm">Fees</div>
                  <div className="text-xs text-gray-500">Payment collection</div>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 