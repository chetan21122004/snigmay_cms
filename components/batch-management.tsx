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
import { Plus, Edit2, Trash2, AlertCircle, Users, Clock, Edit } from "lucide-react"

interface Batch {
  id: string
  name: string
  description: string | null
  start_time: string | null
  end_time: string | null
  coach_id: string | null
  center_id: string | null
}

export default function BatchManagement() {
  const { 
    selectedCenter, 
    batches: allBatches,
    getBatchesByCenter,
    centers,
    availableCenters,
    user,
    loading: contextLoading,
    refreshData
  } = useCenterContext()
  
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [coaches, setCoaches] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_time: "",
    end_time: "",
    coach_id: "none",
    center_id: selectedCenter?.id || "",
  })
  const [error, setError] = useState("")

  // Update form center_id when selectedCenter changes
  useEffect(() => {
    if (selectedCenter && !editingBatch) {
      setFormData(prev => ({
        ...prev,
        center_id: selectedCenter.id
      }))
    }
  }, [selectedCenter, editingBatch])
      
  // Load coaches
  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .in('role', ['coach', 'head_coach'])
          .order('full_name')
        
        if (error) throw error
        setCoaches(data || [])
      } catch (error) {
        console.error('Error loading coaches:', error)
      }
    }
    
    loadCoaches()
  }, [])

  // Filter batches based on selected center and user role
  const batches = useMemo(() => {
    if (!selectedCenter) return []
    
    if (user?.role === 'super_admin' || user?.role === 'club_manager' || user?.role === 'head_coach') {
      // These roles can see batches from the selected center
      return getBatchesByCenter(selectedCenter.id)
    } else if ((user?.role === 'coach' || user?.role === 'center_manager') && user.center_id) {
      // These roles can only see batches from their assigned center
      return getBatchesByCenter(user.center_id)
    }
    
    return []
  }, [selectedCenter, user, allBatches, getBatchesByCenter])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      start_time: "",
      end_time: "",
      coach_id: "none",
      center_id: selectedCenter?.id || "",
    })
    setError("")
      }

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch)
    setFormData({
      name: batch.name,
      description: batch.description || "",
      start_time: batch.start_time || "",
      end_time: batch.end_time || "",
      coach_id: batch.coach_id || "none",
      center_id: batch.center_id || "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setError("You must be logged in to manage batches")
      return
    }

      const batchData = {
        name: formData.name,
        description: formData.description || null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        coach_id: formData.coach_id === "none" ? null : formData.coach_id,
        center_id: formData.center_id || selectedCenter?.id || null,
      }

      if (editingBatch) {
        // Update existing batch
        const { error } = await supabase
          .from('batches')
          .update(batchData)
          .eq('id', editingBatch.id)

        if (error) throw error
      } else {
        // Create new batch
        const { error } = await supabase
          .from('batches')
          .insert([batchData])

        if (error) throw error
      }

      // Refresh data
      await refreshData()
      
      // Reset form
      setDialogOpen(false)
      setEditingBatch(null)
      resetForm()
    } catch (error: any) {
      console.error('Error saving batch:', error)
      setError(error.message || "Failed to save batch")
    }
  }

  const handleDelete = async (batch: Batch) => {
    if (!confirm(`Are you sure you want to delete "${batch.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', batch.id)

      if (error) throw error

      // Refresh data
      await refreshData()
    } catch (error: any) {
      console.error('Error deleting batch:', error)
      setError(error.message || "Failed to delete batch")
    }
  }

  // Show message if no center is selected
  if (!selectedCenter) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a center from the sidebar to manage batches.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <CardTitle>Batch Management</CardTitle>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Batch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingBatch ? "Edit Batch" : "Add New Batch"}</DialogTitle>
                  <DialogDescription>
                    {editingBatch ? "Update batch information" : "Create a new training batch"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Batch Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the batch (age group, skill level, etc.)"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="center">Center *</Label>
                      <Select
                        value={formData.center_id}
                        onValueChange={(value) => setFormData({ ...formData, center_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a center" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCenters.map((center) => (
                            <SelectItem key={center.id} value={center.id}>
                              {center.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="coach">Coach</Label>
                      <Select
                        value={formData.coach_id}
                        onValueChange={(value) => setFormData({ ...formData, coach_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a coach" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No coach assigned</SelectItem>
                          {coaches.map((coach) => (
                            <SelectItem key={coach.id} value={coach.id}>
                              {coach.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingBatch ? "Update" : "Create"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No batches found. Create your first batch to get started.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{batch.description || "No description"}</TableCell>
                    <TableCell>{batch.center_name || "Unknown Center"}</TableCell>
                    <TableCell>{batch.coach_name || "Unassigned"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(batch)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(batch)}>
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
