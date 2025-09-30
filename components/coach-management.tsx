"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { signUp } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Coach {
  id: string
  email: string
  full_name: string
  created_at: string
}

export function CoachManagement() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    loadCoaches()
  }, [])

  const loadCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "coach")
        .order("created_at", { ascending: false })

      if (error) throw error
      setCoaches(data || [])
    } catch (error) {
      console.error("Error loading coaches:", error)
      setError("Failed to load coaches")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (editingCoach) {
        // Update existing coach
        const { error } = await supabase
          .from("users")
          .update({
            email: formData.email,
            full_name: formData.full_name,
          })
          .eq("id", editingCoach.id)

        if (error) throw error
      } else {
        // Create new coach
        const { error } = await signUp(formData.email, formData.password, formData.full_name, "coach")
        if (error) throw error
      }

      setDialogOpen(false)
      setEditingCoach(null)
      setFormData({ email: "", full_name: "", password: "" })
      loadCoaches()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach)
    setFormData({
      email: coach.email,
      full_name: coach.full_name,
      password: "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coach? This will also unassign them from all batches.")) return

    try {
      // First, unassign coach from all batches
      await supabase.from("batches").update({ coach_id: null }).eq("coach_id", id)

      // Then delete the coach
      const { error } = await supabase.from("users").delete().eq("id", id)

      if (error) throw error
      loadCoaches()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const resetForm = () => {
    setEditingCoach(null)
    setFormData({ email: "", full_name: "", password: "" })
    setError("")
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Coaches</h3>
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
              Add Coach
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCoach ? "Edit Coach" : "Add New Coach"}</DialogTitle>
              <DialogDescription>
                {editingCoach ? "Update coach information" : "Create a new coach account"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              {!editingCoach && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingCoach ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coaches.map((coach) => (
            <TableRow key={coach.id}>
              <TableCell className="font-medium">{coach.full_name}</TableCell>
              <TableCell>{coach.email}</TableCell>
              <TableCell>{new Date(coach.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(coach)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(coach.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
