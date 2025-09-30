"use client"

import React, { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useCenterContext } from "@/context/center-context"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, User, Phone, Mail, MapPin, AlertCircle, Users, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import PhotoUpload from "@/components/photo-upload"
import DataSkeleton from "@/components/data-skeleton"

interface Student {
  id: string
  full_name: string
  age: number
  contact_info: string | null
  batch_id: string | null
  center_id: string | null
  parent_name: string | null
  parent_phone: string | null
  parent_email: string | null
  address: string | null
  emergency_contact: string | null
  medical_conditions: string | null
  photo: string | null
}

interface Batch {
  id: string
  name: string
  center_id: string | null
}

export default function StudentManagement() {
  const { 
    selectedCenter, 
    students: allStudents,
    batches: allBatches,
    getStudentsByCenter,
    getBatchesByCenter,
    user,
    loading: contextLoading,
    refreshData
  } = useCenterContext()
  
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    contact_info: "",
    batch_id: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    address: "",
    emergency_contact: "",
    medical_conditions: "",
    photo: null as string | null,
  })
  const [error, setError] = useState("")

  // Filter students and batches based on selected center and user role
  const students = useMemo(() => {
    if (!selectedCenter) return []
    
    if (user?.role === 'super_admin' || user?.role === 'club_manager' || user?.role === 'head_coach') {
      return getStudentsByCenter(selectedCenter.id)
    } else if ((user?.role === 'coach' || user?.role === 'center_manager') && user.center_id) {
      return getStudentsByCenter(user.center_id)
    }
    
    return []
  }, [selectedCenter, user, allStudents, getStudentsByCenter])

  const batches = useMemo(() => {
    if (!selectedCenter) return []
    
    if (user?.role === 'super_admin' || user?.role === 'club_manager' || user?.role === 'head_coach') {
      return getBatchesByCenter(selectedCenter.id)
    } else if ((user?.role === 'coach' || user?.role === 'center_manager') && user.center_id) {
      return getBatchesByCenter(user.center_id)
    }
    
    return []
  }, [selectedCenter, user, allBatches, getBatchesByCenter])

  // Reset form when dialog closes - MOVED BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    if (!dialogOpen) {
      setFormData({
        full_name: "",
        age: "",
        contact_info: "",
        batch_id: "",
        parent_name: "",
        parent_phone: "",
        parent_email: "",
        address: "",
        emergency_contact: "",
        medical_conditions: "",
        photo: null,
      })
      setEditingStudent(null)
      setError("")
    }
  }, [dialogOpen])

  // Helper function to get batch name
  const getBatchName = (batchId: string | null) => {
    if (!batchId) return "No batch assigned"
    const batch = batches.find(b => b.id === batchId)
    return batch ? batch.name : "Unknown batch"
  }

  // Show message if no center is selected
  if (!selectedCenter) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a center from the sidebar to manage students.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setError("You must be logged in to manage students")
        return
      }

      const studentData = {
        full_name: formData.full_name,
        age: parseInt(formData.age),
        contact_info: formData.contact_info || null,
        batch_id: formData.batch_id || null,
        center_id: selectedCenter?.id || null,
        parent_name: formData.parent_name || null,
        parent_phone: formData.parent_phone || null,
        parent_email: formData.parent_email || null,
        address: formData.address || null,
        emergency_contact: formData.emergency_contact || null,
        medical_conditions: formData.medical_conditions || null,
        photo: formData.photo || null,
      }

      if (editingStudent) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', editingStudent.id)

        if (error) throw error
      } else {
        // Create new student
        const { error } = await supabase
          .from('students')
          .insert([studentData])

        if (error) throw error
      }

      // Refresh data
      await refreshData()
      
      // Reset form
      setDialogOpen(false)
      setEditingStudent(null)
      setFormData({
        full_name: "",
        age: "",
        contact_info: "",
        batch_id: "",
        parent_name: "",
        parent_phone: "",
        parent_email: "",
        address: "",
        emergency_contact: "",
        medical_conditions: "",
        photo: null,
      })
    } catch (error: any) {
      console.error('Error saving student:', error)
      setError(error.message || "Failed to save student")
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      full_name: student.full_name,
      age: student.age.toString(),
      contact_info: student.contact_info || "",
      batch_id: student.batch_id || "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
      parent_email: student.parent_email || "",
      address: student.address || "",
      emergency_contact: student.emergency_contact || "",
      medical_conditions: student.medical_conditions || "",
      photo: student.photo || null,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete "${student.full_name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id)

      if (error) throw error

      // Refresh data
      await refreshData()
    } catch (error: any) {
      console.error('Error deleting student:', error)
      setError(error.message || "Failed to delete student")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <DataSkeleton type="table" rows={8} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Student Management</CardTitle>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) {
                  setFormData({
                    full_name: "",
                    age: "",
                    contact_info: "",
                    batch_id: "",
                    parent_name: "",
                    parent_phone: "",
                    parent_email: "",
                    address: "",
                    emergency_contact: "",
                    medical_conditions: "",
                    photo: null,
                  })
                  setEditingStudent(null)
                  setError("")
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
                  <DialogDescription>
                    {editingStudent ? "Update student information" : "Register a new student"}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto pr-2">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo Upload Section */}
                    <div className="flex justify-center py-4">
                      <PhotoUpload
                        currentPhoto={formData.photo || undefined}
                        onPhotoChange={(photo) => setFormData({ ...formData, photo })}
                        fallbackText={formData.full_name || "Student"}
                        size="lg"
                      />
                    </div>
                    
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Student Name *</Label>
                          <Input
                            id="name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="age">Age *</Label>
                          <Input
                            id="age"
                            type="number"
                            min="5"
                            max="25"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="contact_info">Contact Information</Label>
                        <Input
                          id="contact_info"
                          value={formData.contact_info}
                          onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                          placeholder="Email, phone number, etc."
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="batch">Assign to Batch</Label>
                        <Select value={formData.batch_id} onValueChange={(value) => setFormData({ ...formData, batch_id: value })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No batch assigned</SelectItem>
                            {batches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Parent/Guardian Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Parent/Guardian Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="parent_name">Parent Name</Label>
                          <Input
                            id="parent_name"
                            value={formData.parent_name}
                            onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="parent_phone">Parent Phone</Label>
                          <Input
                            id="parent_phone"
                            value={formData.parent_phone}
                            onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="parent_email">Parent Email</Label>
                        <Input
                          id="parent_email"
                          type="email"
                          value={formData.parent_email}
                          onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="emergency_contact">Emergency Contact</Label>
                        <Input
                          id="emergency_contact"
                          value={formData.emergency_contact}
                          onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                          placeholder="Emergency contact person and phone number"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="medical_conditions">Medical Conditions</Label>
                        <Input
                          id="medical_conditions"
                          value={formData.medical_conditions}
                          onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                          placeholder="Any medical conditions or allergies"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Form Actions - Sticky Footer */}
                    <div className="sticky bottom-0 bg-white pt-4 border-t mt-6">
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-burgundy-600 hover:bg-burgundy-700">
                          {editingStudent ? "Update Student" : "Create Student"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No students found. Add your first student to get started.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.photo || ""} alt={student.full_name} />
                        <AvatarFallback className="bg-burgundy-50 text-burgundy-600 text-sm font-medium">
                          {student.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{student.full_name}</span>
                        {student.parent_name && (
                          <span className="text-xs text-gray-500">Parent: {student.parent_name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{student.age}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {student.contact_info && (
                          <span className="text-sm">{student.contact_info}</span>
                        )}
                        {student.parent_phone && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {student.parent_phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {getBatchName(student.batch_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {selectedCenter?.name || "Unknown Center"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(student)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
