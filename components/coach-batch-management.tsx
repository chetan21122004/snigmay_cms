"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useCenterContext } from "@/context/center-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Clock, MapPin, GraduationCap, Eye, CalendarDays, AlertCircle, UserCheck } from "lucide-react"

interface CoachBatch {
  id: string
  name: string
  description: string | null
  start_time: string | null
  end_time: string | null
  center_name: string
  center_location: string
  student_count: number
  students: Student[]
}

interface Student {
  id: string
  full_name: string
  age: number
  contact_info: string | null
  parent_name: string | null
  parent_phone: string | null
}

export default function CoachBatchManagement() {
  const { user, loading: contextLoading } = useCenterContext()
  const [batches, setBatches] = useState<CoachBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedBatch, setSelectedBatch] = useState<CoachBatch | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Load coach's assigned batches
  useEffect(() => {
    if (user?.role === 'coach' && user?.id) {
      loadCoachBatches()
    }
  }, [user])

  const loadCoachBatches = async () => {
    setLoading(true)
    setError("")
    
    try {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      // Get batches assigned to this coach with student details
      const { data, error } = await supabase
        .from("batches")
        .select(`
          id,
          name,
          description,
          start_time,
          end_time,
          centers!inner(name, location),
          students(
            id,
            full_name,
            age,
            contact_info,
            parent_name,
            parent_phone
          )
        `)
        .eq("coach_id", user.id)
        .order("start_time", { ascending: true, nullsFirst: false })

      if (error) throw error

      const formattedBatches: CoachBatch[] = (data || []).map((batch: any) => ({
        id: batch.id,
        name: batch.name,
        description: batch.description,
        start_time: batch.start_time,
        end_time: batch.end_time,
        center_name: batch.centers?.name || "Unknown Center",
        center_location: batch.centers?.location || "Unknown Location",
        student_count: Array.isArray(batch.students) ? batch.students.length : 0,
        students: batch.students || []
      }))

      setBatches(formattedBatches)

    } catch (error: any) {
      console.error('Error loading coach batches:', error)
      setError(error.message || "Failed to load your assigned batches")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "TBD"
    try {
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

  const handleViewDetails = (batch: CoachBatch) => {
    setSelectedBatch(batch)
    setDetailsDialogOpen(true)
  }

  const getAgeGroupColor = (name: string) => {
    if (name.toLowerCase().includes('under 8') || name.toLowerCase().includes('u8')) return 'bg-green-100 text-green-800'
    if (name.toLowerCase().includes('under 10') || name.toLowerCase().includes('u10')) return 'bg-blue-100 text-blue-800'
    if (name.toLowerCase().includes('under 12') || name.toLowerCase().includes('u12')) return 'bg-purple-100 text-purple-800'
    if (name.toLowerCase().includes('under 15') || name.toLowerCase().includes('u15')) return 'bg-orange-100 text-orange-800'
    if (name.toLowerCase().includes('under 18') || name.toLowerCase().includes('u18')) return 'bg-red-100 text-red-800'
    if (name.toLowerCase().includes('girls')) return 'bg-pink-100 text-pink-800'
    if (name.toLowerCase().includes('adult')) return 'bg-gray-100 text-gray-800'
    return 'bg-indigo-100 text-indigo-800'
  }

  // Loading state
  if (contextLoading || loading) {
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
  if (batches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <GraduationCap className="h-6 w-6" />
              Your Training Batches
            </CardTitle>
            <CardDescription>View and manage your assigned training groups</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">No Batches Assigned</h3>
                <p className="text-gray-600 mt-1">
                  You don't have any training batches assigned to you yet. Please contact your manager for batch assignments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="h-6 w-6" />
            Your Training Batches
          </CardTitle>
          <CardDescription>
            View your assigned training groups, schedules, and student information
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Batches Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((batch) => (
          <Card key={batch.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{batch.name}</CardTitle>
                  <Badge className={`mt-2 text-xs ${getAgeGroupColor(batch.name)}`}>
                    {batch.name.split(' ')[0]} {batch.name.split(' ')[1] || ''}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Schedule */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{getBatchTimeDisplay(batch)}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="truncate">{batch.center_name}</span>
              </div>

              {/* Students */}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{batch.student_count} students</span>
              </div>

              {/* Description */}
              {batch.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{batch.description}</p>
              )}

              {/* View Details Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => handleViewDetails(batch)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Batches Table for larger screens */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle>Batch Schedule Overview</CardTitle>
          <CardDescription>All your assigned batches in detail</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{batch.name}</span>
                      <Badge className={`text-xs ${getAgeGroupColor(batch.name)}`}>
                        {batch.name.split(' ')[0]} {batch.name.split(' ')[1] || ''}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {getBatchTimeDisplay(batch)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      {batch.center_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      {batch.student_count} students
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(batch)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Batch Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedBatch && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {selectedBatch.name}
                </DialogTitle>
                <DialogDescription>
                  Batch details and student information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Batch Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Schedule</span>
                    </div>
                    <p className="text-sm text-gray-600 pl-6">
                      {getBatchTimeDisplay(selectedBatch)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="text-sm text-gray-600 pl-6">
                      {selectedBatch.center_name}<br />
                      <span className="text-xs text-gray-500">{selectedBatch.center_location}</span>
                    </p>
                  </div>
                </div>

                {/* Description */}
                {selectedBatch.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-sm text-gray-600">{selectedBatch.description}</p>
                  </div>
                )}

                {/* Students List */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <h4 className="text-sm font-medium">
                      Students ({selectedBatch.student_count})
                    </h4>
                  </div>

                  {selectedBatch.students.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs">Age</TableHead>
                            <TableHead className="text-xs">Parent Contact</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBatch.students.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="text-sm font-medium">
                                {student.full_name}
                              </TableCell>
                              <TableCell className="text-sm">
                                {student.age} years
                              </TableCell>
                              <TableCell className="text-sm">
                                {student.parent_name && (
                                  <div>
                                    <div className="font-medium">{student.parent_name}</div>
                                    {student.parent_phone && (
                                      <div className="text-xs text-gray-500">{student.parent_phone}</div>
                                    )}
                                  </div>
                                )}
                                {!student.parent_name && student.contact_info && (
                                  <div className="text-xs text-gray-500">{student.contact_info}</div>
                                )}
                                {!student.parent_name && !student.contact_info && (
                                  <span className="text-xs text-gray-400">No contact info</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No students enrolled in this batch yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
