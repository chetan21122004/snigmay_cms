"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useCenterContext } from "@/context/center-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertCircle, Users, Clock, CalendarIcon, UserCheck, GraduationCap, TrendingUp, BarChart3, Calendar as CalendarView, ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns"

interface CoachBatch {
  id: string
  name: string
  start_time: string | null
  end_time: string | null
  student_count: number
  center_name: string
  description: string | null
}

interface Student {
  id: string
  full_name: string
  age: number
  batch_id: string
}

interface AttendanceRecord {
  student_id: string
  status: "present" | "absent"
}

interface ExistingAttendance {
  student_id: string
  status: "present" | "absent"
}

interface AttendanceHistory {
  id: string
  student_id: string
  student_name: string
  batch_id: string
  batch_name: string
  date: string
  status: "present" | "absent"
  marked_by: string
}

interface WeeklyStats {
  totalClasses: number
  totalPresent: number
  totalAbsent: number
  attendanceRate: number
  studentStats: StudentWeeklyStats[]
}

interface StudentWeeklyStats {
  id: string
  name: string
  present: number
  absent: number
  total: number
  rate: number
}

export default function CoachAttendanceManagement() {
  const { user, selectedCenter, loading: contextLoading } = useCenterContext()
  const [coachBatches, setCoachBatches] = useState<CoachBatch[]>([])
  const [selectedBatch, setSelectedBatch] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [existingAttendance, setExistingAttendance] = useState<ExistingAttendance[]>([])
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistory[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("mark-attendance")

  // Load coach's assigned batches
  useEffect(() => {
    if (user?.role === 'coach' && user?.id) {
      loadCoachBatches()
    }
  }, [user])

  // Load students when batch changes
  useEffect(() => {
    if (selectedBatch) {
      loadStudents()
      loadExistingAttendance()
    }
  }, [selectedBatch, selectedDate])

  // Load attendance history and weekly stats when batch or week changes
  useEffect(() => {
    if (selectedBatch) {
      loadAttendanceHistory()
      loadWeeklyStats()
    }
  }, [selectedBatch, currentWeek])

  const loadCoachBatches = async () => {
    setLoading(true)
    setError("")
    
    try {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      // Get batches assigned to this coach
      const { data, error } = await supabase
        .from("batches")
        .select(`
          id,
          name,
          start_time,
          end_time,
          description,
          center_id,
          centers!inner(name),
          students(count)
        `)
        .eq("coach_id", user.id)
        .order("start_time", { ascending: true, nullsFirst: false })

      if (error) throw error

      const formattedBatches: CoachBatch[] = (data || []).map((batch: any) => ({
        id: batch.id,
        name: batch.name,
        start_time: batch.start_time,
        end_time: batch.end_time,
        description: batch.description,
        center_name: batch.centers?.name || "Unknown Center",
        student_count: Array.isArray(batch.students) ? batch.students.length : 0
      }))

      setCoachBatches(formattedBatches)

      // Auto-select first batch if available
      if (formattedBatches.length > 0 && !selectedBatch) {
        setSelectedBatch(formattedBatches[0].id)
      }

    } catch (error: any) {
      console.error('Error loading coach batches:', error)
      setError(error.message || "Failed to load your assigned batches")
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    if (!selectedBatch) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, age, batch_id")
        .eq("batch_id", selectedBatch)
        .order("full_name")

      if (error) throw error
      
      setStudents(data || [])

      // Initialize attendance records for all students
      const initialAttendance: AttendanceRecord[] = (data || []).map(student => ({
        student_id: student.id,
        status: "present" as const,
      }))
      setAttendance(initialAttendance)

    } catch (error: any) {
      console.error('Error loading students:', error)
      setError(error.message || "Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  const loadExistingAttendance = async () => {
    if (!selectedBatch) return

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      
      const { data, error } = await supabase
        .from("attendance")
        .select("student_id, status")
        .eq("batch_id", selectedBatch)
        .eq("date", dateStr)

      if (error) throw error

      if (data && data.length > 0) {
        setExistingAttendance(data)
        
        // Update attendance state with existing records
        setAttendance(prev => prev.map(record => {
          const existing = data.find(ex => ex.student_id === record.student_id)
          return existing ? { ...record, status: existing.status } : record
        }))
      } else {
        setExistingAttendance([])
      }

    } catch (error: any) {
      console.error("Error loading existing attendance:", error)
    }
  }

  const updateAttendance = (studentId: string, status: "present" | "absent") => {
    setAttendance(prev => 
      prev.map(record => 
        record.student_id === studentId ? { ...record, status } : record
      )
    )
  }

  const saveAttendance = async () => {
    if (!selectedBatch || !user?.id) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")

      // Delete existing attendance for this batch and date
      await supabase
        .from("attendance")
        .delete()
        .eq("batch_id", selectedBatch)
        .eq("date", dateStr)

      // Insert new attendance records
      const attendanceRecords = attendance.map(record => ({
        student_id: record.student_id,
        batch_id: selectedBatch,
        date: dateStr,
        status: record.status,
        marked_by: user.id,
        center_id: user.center_id
      }))

      const { error } = await supabase
        .from("attendance")
        .insert(attendanceRecords)

      if (error) throw error

      setSuccess("Attendance saved successfully!")
      setExistingAttendance(attendance)
      
      // Reload attendance history and stats
      loadAttendanceHistory()
      loadWeeklyStats()

    } catch (error: any) {
      console.error('Error saving attendance:', error)
      setError(error.message || "Failed to save attendance")
    } finally {
      setSaving(false)
    }
  }

  const loadAttendanceHistory = async () => {
    if (!selectedBatch) return

    try {
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }) // Sunday

      const { data, error } = await supabase
        .from("attendance")
        .select(`
          id,
          student_id,
          batch_id,
          date,
          status,
          marked_by,
          students!inner(full_name),
          batches!inner(name)
        `)
        .eq("batch_id", selectedBatch)
        .gte("date", format(weekStart, "yyyy-MM-dd"))
        .lte("date", format(weekEnd, "yyyy-MM-dd"))
        .order("date", { ascending: false })

      if (error) throw error

      const formattedHistory: AttendanceHistory[] = (data || []).map((record: any) => ({
        id: record.id,
        student_id: record.student_id,
        student_name: record.students?.full_name || "Unknown Student",
        batch_id: record.batch_id,
        batch_name: record.batches?.name || "Unknown Batch",
        date: record.date,
        status: record.status,
        marked_by: record.marked_by
      }))

      setAttendanceHistory(formattedHistory)

    } catch (error: any) {
      console.error("Error loading attendance history:", error)
    }
  }

  const loadWeeklyStats = async () => {
    if (!selectedBatch) return

    try {
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })

      const { data: attendanceData, error } = await supabase
        .from("attendance")
        .select(`
          student_id,
          status,
          date,
          students!inner(id, full_name)
        `)
        .eq("batch_id", selectedBatch)
        .gte("date", format(weekStart, "yyyy-MM-dd"))
        .lte("date", format(weekEnd, "yyyy-MM-dd"))

      if (error) throw error

      // Calculate weekly stats
      const studentStatsMap = new Map<string, StudentWeeklyStats>()
      let totalPresent: number = 0
      let totalAbsent: number = 0

      (attendanceData || []).forEach((record: any) => {
        const studentId = record.student_id
        const studentName = record.students?.full_name || "Unknown"
        
        if (!studentStatsMap.has(studentId)) {
          studentStatsMap.set(studentId, {
            id: studentId,
            name: studentName,
            present: 0,
            absent: 0,
            total: 0,
            rate: 0
          })
        }

        const studentStat = studentStatsMap.get(studentId)!
        if (record.status === "present") {
          studentStat.present++
          totalPresent++
        } else {
          studentStat.absent++
          totalAbsent++
        }
        studentStat.total++
      })

      // Calculate rates
      const studentStats = Array.from(studentStatsMap.values()).map(stat => ({
        ...stat,
        rate: stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0
      }))

      const totalClasses = totalPresent + totalAbsent
      const attendanceRate = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0

      setWeeklyStats({
        totalClasses,
        totalPresent,
        totalAbsent,
        attendanceRate,
        studentStats
      })

    } catch (error: any) {
      console.error("Error loading weekly stats:", error)
    }
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "Time TBD"
    try {
      // Parse time string (assuming format like "10:00:00")
      const [hours, minutes] = timeStr.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return timeStr
    }
  }

  const getBatchTimeDisplay = (batch: CoachBatch) => {
    if (batch.start_time && batch.end_time) {
      return `${formatTime(batch.start_time)} - ${formatTime(batch.end_time)}`
    } else if (batch.start_time) {
      return `${formatTime(batch.start_time)}`
    } else {
      return "Time TBD"
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(prev => subWeeks(prev, 1))
    } else {
      setCurrentWeek(prev => addWeeks(prev, 1))
    }
  }

  const getWeekRange = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
    return {
      start: weekStart,
      end: weekEnd,
      display: `${format(weekStart, "MMM dd")} - ${format(weekEnd, "MMM dd, yyyy")}`
    }
  }

  const getAttendanceForDate = (studentId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return attendanceHistory.find(record => 
      record.student_id === studentId && record.date === dateStr
    )
  }

  const selectedBatchInfo = coachBatches.find(b => b.id === selectedBatch)

  // Loading state
  if (contextLoading || (loading && coachBatches.length === 0)) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy-600"></div>
          <p className="text-sm text-gray-600">Loading your assigned batches...</p>
        </div>
      </div>
    )
  }

  // No batches assigned
  if (coachBatches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <GraduationCap className="h-6 w-6" />
              Attendance Management
            </CardTitle>
            <CardDescription>Mark attendance for your assigned batches</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">No Batches Assigned</h3>
                <p className="text-gray-600 mt-1">
                  You don't have any batches assigned to you yet. Please contact your manager to get batch assignments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserCheck className="h-6 w-6" />
            Attendance Management
          </CardTitle>
          <CardDescription>
            Mark attendance, view weekly reports, and track student progress
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Batch Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Your Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Assigned Batches</label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
                <SelectContent>
                  {coachBatches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{batch.name}</span>
                        <span className="text-xs text-gray-500">
                          {getBatchTimeDisplay(batch)} • {batch.student_count} students • {batch.center_name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Batch Info */}
            {selectedBatchInfo && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-semibold text-lg">{selectedBatchInfo.name}</h4>
                    <p className="text-sm text-gray-600">{selectedBatchInfo.center_name}</p>
                    {selectedBatchInfo.description && (
                      <p className="text-sm text-gray-500 mt-1">{selectedBatchInfo.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="h-4 w-4" />
                      {getBatchTimeDisplay(selectedBatchInfo)}
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <Users className="h-4 w-4" />
                      {selectedBatchInfo.student_count} students
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      {selectedBatch && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mark-attendance" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Mark Attendance
            </TabsTrigger>
            <TabsTrigger value="weekly-view" className="flex items-center gap-2">
              <CalendarView className="h-4 w-4" />
              Weekly View
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Mark Attendance Tab */}
          <TabsContent value="mark-attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Mark Attendance</CardTitle>
                    <CardDescription>Select date and mark attendance for students</CardDescription>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {existingAttendance.length > 0 && (
                  <Badge variant="secondary" className="text-xs w-fit">
                    Previously recorded for this date
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="space-y-3">
                    {students.map((student) => {
                      const studentAttendance = attendance.find(a => a.student_id === student.id)
                      const isPresent = studentAttendance?.status === "present"

                      return (
                        <div 
                          key={student.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{student.full_name}</h4>
                            <p className="text-sm text-gray-600">Age: {student.age}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant={isPresent ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateAttendance(student.id, "present")}
                              className={isPresent ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Present
                            </Button>
                            <Button
                              variant={!isPresent ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => updateAttendance(student.id, "absent")}
                              className={!isPresent ? "" : "hover:bg-red-50 hover:text-red-700 hover:border-red-300"}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Absent
                            </Button>
                          </div>
                        </div>
                      )
                    })}

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t">
                      <Button 
                        onClick={saveAttendance} 
                        disabled={saving}
                        className="bg-burgundy-600 hover:bg-burgundy-700"
                      >
                        {saving ? "Saving..." : "Save Attendance"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center space-y-4">
                      <Users className="h-12 w-12 text-gray-400" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">No Students in This Batch</h3>
                        <p className="text-gray-600 mt-1">
                          This batch doesn't have any students enrolled yet.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly View Tab */}
          <TabsContent value="weekly-view" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Weekly Attendance View</CardTitle>
                    <CardDescription>
                      View attendance patterns for the week of {getWeekRange().display}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigateWeek('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous Week
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigateWeek('next')}
                    >
                      Next Week
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Student Name</TableHead>
                          {eachDayOfInterval({
                            start: getWeekRange().start,
                            end: getWeekRange().end
                          }).map((date) => (
                            <TableHead key={date.toISOString()} className="text-center min-w-[100px]">
                              <div className="flex flex-col">
                                <span className="text-xs">{format(date, "EEE")}</span>
                                <span className="text-sm font-medium">{format(date, "MMM dd")}</span>
                              </div>
                            </TableHead>
                          ))}
                          <TableHead className="text-center">Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div>{student.full_name}</div>
                                <div className="text-xs text-gray-500">Age: {student.age}</div>
                              </div>
                            </TableCell>
                            {eachDayOfInterval({
                              start: getWeekRange().start,
                              end: getWeekRange().end
                            }).map((date) => {
                              const attendanceRecord = getAttendanceForDate(student.id, date)
                              return (
                                <TableCell key={date.toISOString()} className="text-center">
                                  {attendanceRecord ? (
                                    <Badge 
                                      variant={attendanceRecord.status === 'present' ? 'default' : 'destructive'}
                                      className={attendanceRecord.status === 'present' ? 'bg-green-500' : 'bg-red-500'}
                                    >
                                      {attendanceRecord.status === 'present' ? 'P' : 'A'}
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center">
                              {weeklyStats?.studentStats.find(s => s.id === student.id)?.rate || 0}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center space-y-4">
                      <CalendarView className="h-12 w-12 text-gray-400" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">No Students to Display</h3>
                        <p className="text-gray-600 mt-1">
                          This batch doesn't have any students enrolled yet.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Weekly Overview
                  </CardTitle>
                  <CardDescription>
                    {getWeekRange().display}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {weeklyStats?.attendanceRate || 0}%
                    </div>
                    <p className="text-sm text-gray-600">Overall Attendance Rate</p>
                  </div>
                  <Progress value={weeklyStats?.attendanceRate || 0} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-semibold text-green-600">
                        {weeklyStats?.totalPresent || 0}
                      </div>
                      <p className="text-gray-600">Present</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-lg font-semibold text-red-600">
                        {weeklyStats?.totalAbsent || 0}
                      </div>
                      <p className="text-gray-600">Absent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weeklyStats?.studentStats
                      .sort((a, b) => b.rate - a.rate)
                      .slice(0, 5)
                      .map((student, index) => (
                        <div key={student.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium">{student.name}</span>
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            {student.rate}%
                          </Badge>
                        </div>
                      )) || []}
                    {(!weeklyStats?.studentStats || weeklyStats.studentStats.length === 0) && (
                      <p className="text-center text-gray-500 py-4">No attendance data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Need Attention */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Need Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weeklyStats?.studentStats
                      .filter(student => student.rate < 70)
                      .sort((a, b) => a.rate - b.rate)
                      .slice(0, 5)
                      .map((student) => (
                        <div key={student.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{student.name}</span>
                          <Badge variant="destructive">
                            {student.rate}%
                          </Badge>
                        </div>
                      )) || []}
                    {(!weeklyStats?.studentStats || weeklyStats.studentStats.filter(s => s.rate < 70).length === 0) && (
                      <p className="text-center text-gray-500 py-4">All students have good attendance!</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
