"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Check, X } from "lucide-react"
import { format } from "date-fns"

interface Batch {
  id: string
  name: string
}

interface Student {
  id: string
  name: string
  age: number
}

interface AttendanceRecord {
  student_id: string
  status: "present" | "absent"
}

interface AttendanceMarkingProps {
  batches: Batch[]
}

export function AttendanceMarking({ batches }: AttendanceMarkingProps) {
  const [selectedBatch, setSelectedBatch] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (selectedBatch) {
      loadStudents()
      loadExistingAttendance()
    }
  }, [selectedBatch, selectedDate])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("students").select("*").eq("batch_id", selectedBatch).order("name")

      if (error) throw error
      setStudents(data || [])

      // Initialize attendance records
      const initialAttendance = (data || []).map((student) => ({
        student_id: student.id,
        status: "present" as const,
      }))
      setAttendance(initialAttendance)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadExistingAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("student_id, status")
        .eq("batch_id", selectedBatch)
        .eq("date", format(selectedDate, "yyyy-MM-dd"))

      if (error) throw error

      if (data && data.length > 0) {
        setAttendance(
          data.map((record) => ({
            student_id: record.student_id,
            status: record.status,
          })),
        )
      }
    } catch (error: any) {
      console.error("Error loading existing attendance:", error)
    }
  }

  const updateAttendance = (studentId: string, status: "present" | "absent") => {
    setAttendance((prev) => prev.map((record) => (record.student_id === studentId ? { ...record, status } : record)))
  }

  const saveAttendance = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const user = await getCurrentUser()
      if (!user) throw new Error("User not authenticated")

      const dateStr = format(selectedDate, "yyyy-MM-dd")

      // Delete existing attendance for this batch and date
      await supabase.from("attendance").delete().eq("batch_id", selectedBatch).eq("date", dateStr)

      // Insert new attendance records
      const attendanceRecords = attendance.map((record) => ({
        student_id: record.student_id,
        batch_id: selectedBatch,
        date: dateStr,
        status: record.status,
        marked_by: user.id,
      }))

      const { error } = await supabase.from("attendance").insert(attendanceRecords)

      if (error) throw error

      setSuccess("Attendance saved successfully!")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Batch</label>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
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
      </div>

      {selectedBatch && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance - {format(selectedDate, "PPP")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => {
                const studentAttendance = attendance.find((a) => a.student_id === student.id)
                const isPresent = studentAttendance?.status === "present"

                return (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-gray-600">Age: {student.age}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant={isPresent ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateAttendance(student.id, "present")}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Present
                      </Button>
                      <Button
                        variant={!isPresent ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => updateAttendance(student.id, "absent")}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Absent
                      </Button>
                    </div>
                  </div>
                )
              })}

              <div className="flex justify-end pt-4">
                <Button onClick={saveAttendance} disabled={saving}>
                  {saving ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedBatch && students.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">No students found in this batch.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
