"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import { format } from "date-fns"

interface AttendanceRecord {
  id: string
  date: string
  status: "present" | "absent"
  student_name: string
  batch_name: string
  marked_by_name: string
}

interface Batch {
  id: string
  name: string
}

interface Student {
  id: string
  name: string
  batch_name: string
}

export function AttendanceReports() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    batch_id: "all",
    student_id: "all",
    date_from: "",
    date_to: "",
  })

  useEffect(() => {
    loadBatches()
    loadStudents()
    loadAttendanceRecords()
  }, [])

  useEffect(() => {
    loadAttendanceRecords()
  }, [filters])

  const loadBatches = async () => {
    try {
      const { data, error } = await supabase.from("batches").select("id, name").order("name")

      if (error) throw error
      setBatches(data || [])
    } catch (error) {
      console.error("Error loading batches:", error)
    }
  }

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          name,
          batches:batch_id (
            name
          )
        `)
        .order("name")

      if (error) throw error

      const studentsWithBatch =
        data?.map((student) => ({
          id: student.id,
          name: student.name,
          batch_name: student.batches?.name || "No batch",
        })) || []

      setStudents(studentsWithBatch)
    } catch (error) {
      console.error("Error loading students:", error)
    }
  }

  const loadAttendanceRecords = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("attendance")
        .select(`
          id,
          date,
          status,
          students:student_id (
            name
          ),
          batches:batch_id (
            name
          ),
          users:marked_by (
            full_name
          )
        `)
        .order("date", { ascending: false })

      // Apply filters
      if (filters.batch_id !== "all") {
        query = query.eq("batch_id", filters.batch_id)
      }
      if (filters.student_id !== "all") {
        query = query.eq("student_id", filters.student_id)
      }
      if (filters.date_from) {
        query = query.gte("date", filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte("date", filters.date_to)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedRecords =
        data?.map((record) => ({
          id: record.id,
          date: record.date,
          status: record.status,
          student_name: record.students?.name || "Unknown",
          batch_name: record.batches?.name || "Unknown",
          marked_by_name: record.users?.full_name || "Unknown",
        })) || []

      setAttendanceRecords(formattedRecords)
    } catch (error) {
      console.error("Error loading attendance records:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ["Date", "Student", "Batch", "Status", "Marked By"]
    const csvContent = [
      headers.join(","),
      ...attendanceRecords.map((record) =>
        [record.date, record.student_name, record.batch_name, record.status, record.marked_by_name].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-report-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setFilters({
      batch_id: "all",
      student_id: "all",
      date_from: "",
      date_to: "",
    })
  }

  const presentCount = attendanceRecords.filter((r) => r.status === "present").length
  const absentCount = attendanceRecords.filter((r) => r.status === "absent").length
  const totalRecords = attendanceRecords.length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Batch</label>
              <Select value={filters.batch_id} onValueChange={(value) => setFilters({ ...filters, batch_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Student</label>
              <Select
                value={filters.student_id}
                onValueChange={(value) => setFilters({ ...filters, student_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All students</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.batch_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">From Date</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">To Date</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={exportToCSV} disabled={totalRecords === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marked By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), "PPP")}</TableCell>
                    <TableCell className="font-medium">{record.student_name}</TableCell>
                    <TableCell>{record.batch_name}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "present" ? "default" : "destructive"}>{record.status}</Badge>
                    </TableCell>
                    <TableCell>{record.marked_by_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && attendanceRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendance records found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
