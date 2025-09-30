"use client"

import React, { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useCenterContext } from "@/context/center-context"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { CalendarDays, CheckCircle, XCircle, AlertCircle, Users, Clock, CalendarIcon, Download, Filter, Search, UserCheck } from "lucide-react"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"

interface AttendanceRecord {
  id: string
  student_name: string
  batch_name: string
  center_name: string
  date: string
  status: 'present' | 'absent'
  marked_by: string
}

interface Batch {
  id: string
  name: string
  center_id: string
  center_name: string
}

interface Student {
  id: string
  name: string
  batch_id: string
  batch_name: string
  center_name: string
}

interface CenterAttendanceProps {
  selectedCenter: string
}

export default function CenterAttendanceManagement() {
  const { selectedCenter, user, getStudentsByCenter, getBatchesByCenter } = useCenterContext()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedBatch, setSelectedBatch] = useState<string>("")
  const [attendanceData, setAttendanceData] = useState<{[key: string]: 'present' | 'absent'}>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [markingMode, setMarkingMode] = useState(false)

  // Get center-specific data
  const centerBatches = user?.role === 'super_admin' || user?.role === 'club_manager' || user?.role === 'head_coach'
    ? getBatchesByCenter(selectedCenter?.id || '')
    : (user?.center_id ? getBatchesByCenter(user.center_id) : [])

  const centerStudents = user?.role === 'super_admin' || user?.role === 'club_manager' || user?.role === 'head_coach'
    ? getStudentsByCenter(selectedCenter?.id || '')
    : (user?.center_id ? getStudentsByCenter(user.center_id) : [])

  // MOVED BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    if (user && selectedCenter) {
      loadAttendanceRecords()
    }
  }, [user, selectedCenter, selectedDate])

  useEffect(() => {
    if (user && selectedCenter && selectedBatch) {
      loadBatchStudents()
    }
  }, [user, selectedCenter, selectedBatch])

  const loadAttendanceRecords = async () => {
    if (!selectedCenter?.id) return
    
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('center_id', selectedCenter.id)
        .eq('date', dateStr)
      
      if (error) throw error
      
      // Convert to attendance data format
      const attendanceMap: {[key: string]: 'present' | 'absent'} = {}
      data?.forEach((record: any) => {
        attendanceMap[record.student_id] = record.status
      })
      setAttendanceData(attendanceMap)
    } catch (error) {
      console.error('Error loading attendance records:', error)
    }
  }

  const loadBatchStudents = async () => {
    if (!selectedBatch) return
    
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('batch_id', selectedBatch)
        .order('full_name')
      
      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const markAttendance = async (studentId: string, status: 'present' | 'absent') => {
    if (!selectedCenter || !selectedBatch) return

    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        console.error('No user logged in')
        return
      }

      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      
      // Check if attendance record exists
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('date', dateStr)
        .single()

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({ 
            status,
            marked_by: currentUser.id,
            batch_id: selectedBatch,
            center_id: selectedCenter.id
          })
          .eq('id', existing.id)
        
        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase
          .from('attendance')
          .insert([{
            student_id: studentId,
            batch_id: selectedBatch,
            date: dateStr,
            status,
            marked_by: currentUser.id,
            center_id: selectedCenter.id
          }])
        
        if (error) throw error
      }

      // Update local state
      setAttendanceData(prev => ({
        ...prev,
        [studentId]: status
      }))
    } catch (error) {
      console.error('Error marking attendance:', error)
    }
  }

  // Show message if no center is selected
  if (!selectedCenter) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Center Selected</CardTitle>
            <CardDescription className="text-center">
              Please select a center from the sidebar to manage attendance.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const exportAttendance = () => {
    // In production, this would generate and download a CSV/Excel file
    console.log('Exporting attendance data...')
  }

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesBatch = selectedBatch === '' || record.batch_name === selectedBatch
    return matchesSearch && matchesBatch
  })

  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBatch = selectedBatch === '' || student.batch_name === selectedBatch
      return matchesSearch && matchesBatch
    })
  }

  const getFilteredBatches = () => {
    return batches
  }

  const canMarkAttendance = () => {
    return user && ['super_admin', 'club_manager', 'head_coach', 'coach', 'center_manager'].includes(user.role)
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading attendance data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedCenter.name} - Attendance Management
          </h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
          <Button onClick={exportAttendance} variant="outline">
            <Download className="h-4 w-4 mr-2" />
          Export Data
            </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(new Date(selectedDate), 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                    mode="single"
                      selected={selectedDate}
                      onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="batch">Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredBatches().map(batch => (
                    <SelectItem key={batch.id} value={batch.name}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSelectedBatch("")
                setSearchTerm("")
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Marking Mode */}
      {markingMode && canMarkAttendance() && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance - {format(new Date(selectedDate), 'PPP')}</CardTitle>
            <CardDescription>Click on student names to mark their attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredStudents().map(student => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-600">{student.batch_name}</div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAttendance(student.id, 'present')}
                      className="flex-1"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAttendance(student.id, 'absent')}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Marked By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map(record => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.student_name}</TableCell>
                  <TableCell>{record.batch_name}</TableCell>
                  <TableCell>{record.center_name}</TableCell>
                  <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.marked_by}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendance records found for the selected filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 