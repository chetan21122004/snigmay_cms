"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useCenterContext } from "@/context/center-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Star, 
  Send, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  GraduationCap,
  Filter,
  Calendar,
  User
} from "lucide-react"
import { format } from "date-fns"

interface Feedback {
  id: string
  type: 'player' | 'coach'
  subject_id: string
  subject_name: string
  subject_photo?: string
  rating: number
  category: string
  feedback_text: string
  is_anonymous: boolean
  submitted_by: string
  submitted_by_name?: string
  created_at: string
  status: 'pending' | 'reviewed' | 'resolved'
  admin_response?: string
  center_name: string
  batch_name?: string
}

interface FeedbackFormData {
  type: 'player' | 'coach'
  subject_id: string
  rating: number
  category: string
  feedback_text: string
  is_anonymous: boolean
}

const FEEDBACK_CATEGORIES = {
  player: [
    'Performance',
    'Behavior',
    'Attendance',
    'Attitude',
    'Skill Development',
    'Teamwork',
    'Other'
  ],
  coach: [
    'Teaching Quality',
    'Communication',
    'Professionalism',
    'Training Methods',
    'Student Relations',
    'Punctuality',
    'Other'
  ]
}

interface FeedbackSystemProps {
  isAdmin?: boolean
}

export default function FeedbackSystem({ isAdmin = false }: FeedbackSystemProps) {
  const { user, selectedCenter } = useCenterContext()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [coaches, setCoaches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [adminResponse, setAdminResponse] = useState("")
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    rating: 'all'
  })

  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'player',
    subject_id: '',
    rating: 5,
    category: '',
    feedback_text: '',
    is_anonymous: false
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, selectedCenter])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadFeedbacks(),
        loadPlayers(),
        loadCoaches()
      ])
    } catch (error) {
      console.error('Error loading feedback data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFeedbacks = async () => {
    try {
      // For now, simulate feedback data. In production, this would come from a feedback table
      const sampleFeedbacks: Feedback[] = [
        {
          id: "1",
          type: "player",
          subject_id: "player1",
          subject_name: "Arjun Sharma",
          rating: 4,
          category: "Performance",
          feedback_text: "Great improvement in ball control and passing. Shows dedication during training sessions.",
          is_anonymous: false,
          submitted_by: user?.id || "",
          submitted_by_name: "Coach Rahul",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          center_name: "Kharadi Center",
          batch_name: "U12 Morning"
        },
        {
          id: "2",
          type: "coach",
          subject_id: "coach1",
          subject_name: "Coach Priya",
          rating: 5,
          category: "Teaching Quality",
          feedback_text: "Excellent coaching methods and very patient with students. Creates a positive learning environment.",
          is_anonymous: true,
          submitted_by: "anonymous",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "reviewed",
          center_name: "Viman Nagar Center",
          admin_response: "Thank you for the positive feedback. We'll share this with Coach Priya."
        }
      ]
      setFeedbacks(sampleFeedbacks)
    } catch (error) {
      console.error('Error loading feedbacks:', error)
    }
  }

  const loadPlayers = async () => {
    try {
      // Simulate player data
      const samplePlayers = [
        { id: "player1", full_name: "Arjun Sharma", batch_name: "U12 Morning", photo: null },
        { id: "player2", full_name: "Priya Patel", batch_name: "U14 Evening", photo: null },
        { id: "player3", full_name: "Rohan Kumar", batch_name: "U16 Morning", photo: null }
      ]
      setPlayers(samplePlayers)
    } catch (error) {
      console.error('Error loading players:', error)
    }
  }

  const loadCoaches = async () => {
    try {
      // Simulate coach data
      const sampleCoaches = [
        { id: "coach1", full_name: "Coach Priya", center_name: "Viman Nagar", photo: null },
        { id: "coach2", full_name: "Coach Rahul", center_name: "Kharadi", photo: null },
        { id: "coach3", full_name: "Coach Amit", center_name: "Hadapsar", photo: null }
      ]
      setCoaches(sampleCoaches)
    } catch (error) {
      console.error('Error loading coaches:', error)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!formData.subject_id || !formData.category || !formData.feedback_text.trim()) {
      setError("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      // In production, this would insert into a feedback table
      const newFeedback: Feedback = {
        id: Date.now().toString(),
        type: formData.type,
        subject_id: formData.subject_id,
        subject_name: formData.type === 'player' 
          ? players.find(p => p.id === formData.subject_id)?.full_name || "Unknown Player"
          : coaches.find(c => c.id === formData.subject_id)?.full_name || "Unknown Coach",
        rating: formData.rating,
        category: formData.category,
        feedback_text: formData.feedback_text,
        is_anonymous: formData.is_anonymous,
        submitted_by: formData.is_anonymous ? "anonymous" : user?.id || "",
        submitted_by_name: formData.is_anonymous ? undefined : user?.full_name,
        created_at: new Date().toISOString(),
        status: "pending",
        center_name: selectedCenter?.location || "Unknown Center"
      }

      setFeedbacks(prev => [newFeedback, ...prev])
      setSuccess("Feedback submitted successfully!")
      setShowFeedbackDialog(false)
      resetForm()
    } catch (error: any) {
      setError(error.message || "Failed to submit feedback")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdminResponse = async () => {
    if (!selectedFeedback || !adminResponse.trim()) return

    try {
      // Update feedback with admin response
      setFeedbacks(prev => prev.map(f => 
        f.id === selectedFeedback.id 
          ? { ...f, admin_response: adminResponse, status: 'resolved' as const }
          : f
      ))
      setSuccess("Response added successfully!")
      setShowDetailDialog(false)
      setAdminResponse("")
      setSelectedFeedback(null)
    } catch (error: any) {
      setError(error.message || "Failed to add response")
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'player',
      subject_id: '',
      rating: 5,
      category: '',
      feedback_text: '',
      is_anonymous: false
    })
  }

  const getFilteredFeedbacks = () => {
    return feedbacks.filter(feedback => {
      if (filters.type !== 'all' && feedback.type !== filters.type) return false
      if (filters.status !== 'all' && feedback.status !== filters.status) return false
      if (filters.rating !== 'all' && feedback.rating !== parseInt(filters.rating)) return false
      return true
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'reviewed':
        return <Badge variant="outline">Reviewed</Badge>
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (!isAdmin && user?.role !== 'super_admin') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">You don't have permission to access this feature.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600">Manage player and coach feedback</p>
        </div>
        {!isAdmin && (
          <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
            <DialogTrigger asChild>
              <Button className="bg-burgundy-600 hover:bg-burgundy-700">
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
                <DialogDescription>
                  Provide feedback about a player or coach
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Feedback Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'player' | 'coach') => 
                        setFormData({ ...formData, type: value, subject_id: '', category: '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="player">Player Feedback</SelectItem>
                        <SelectItem value="coach">Coach Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Subject</Label>
                    <Select
                      value={formData.subject_id}
                      onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${formData.type}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.type === 'player' ? players : coaches).map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {FEEDBACK_CATEGORIES[formData.type].map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Rating</Label>
                    <Select
                      value={formData.rating.toString()}
                      onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{rating}</span>
                              <div className="flex">
                                {getRatingStars(rating)}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Feedback</Label>
                  <Textarea
                    value={formData.feedback_text}
                    onChange={(e) => setFormData({ ...formData, feedback_text: e.target.value })}
                    placeholder="Enter your feedback..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="anonymous">Submit anonymously</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowFeedbackDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={submitting}
                  className="bg-burgundy-600 hover:bg-burgundy-700"
                >
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="player">Player Feedback</SelectItem>
                    <SelectItem value="coach">Coach Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Rating</Label>
                <Select
                  value={filters.rating}
                  onValueChange={(value) => setFilters({ ...filters, rating: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} Star{rating !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback List</CardTitle>
          <CardDescription>
            {getFilteredFeedbacks().length} feedback{getFilteredFeedbacks().length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getFilteredFeedbacks().map((feedback) => (
              <Card key={feedback.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={feedback.subject_photo} alt={feedback.subject_name} />
                        <AvatarFallback>
                          {feedback.type === 'player' ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <GraduationCap className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{feedback.subject_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Badge variant="outline" className="text-xs">
                            {feedback.type}
                          </Badge>
                          <span>•</span>
                          <span>{feedback.category}</span>
                          <span>•</span>
                          <span>{feedback.center_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {getRatingStars(feedback.rating)}
                      </div>
                      <span className="text-sm text-gray-600">({feedback.rating}/5)</span>
                    </div>

                    <p className="text-gray-700 mb-3">{feedback.feedback_text}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        By: {feedback.is_anonymous ? "Anonymous" : feedback.submitted_by_name}
                      </span>
                      <span>•</span>
                      <span>{format(new Date(feedback.created_at), "PPP")}</span>
                    </div>

                    {feedback.admin_response && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
                        <p className="text-sm text-blue-800">{feedback.admin_response}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(feedback.status)}
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedFeedback(feedback)
                          setShowDetailDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {feedback.status === 'pending' ? 'Respond' : 'View'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {getFilteredFeedbacks().length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No feedback found matching the current filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin Response Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              {selectedFeedback && `Feedback for ${selectedFeedback.subject_name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedFeedback.subject_photo} alt={selectedFeedback.subject_name} />
                    <AvatarFallback>
                      {selectedFeedback.type === 'player' ? (
                        <User className="h-6 w-6" />
                      ) : (
                        <GraduationCap className="h-6 w-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{selectedFeedback.subject_name}</h4>
                    <p className="text-sm text-gray-600">{selectedFeedback.center_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {selectedFeedback.type}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {selectedFeedback.category}
                  </div>
                  <div>
                    <span className="font-medium">Rating:</span>
                    <div className="flex items-center gap-1 mt-1">
                      {getRatingStars(selectedFeedback.rating)}
                      <span>({selectedFeedback.rating}/5)</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {getStatusBadge(selectedFeedback.status)}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="font-medium">Feedback:</span>
                  <p className="mt-1">{selectedFeedback.feedback_text}</p>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Submitted by: {selectedFeedback.is_anonymous ? "Anonymous" : selectedFeedback.submitted_by_name} 
                  on {format(new Date(selectedFeedback.created_at), "PPP")}
                </div>
              </div>

              {selectedFeedback.status === 'pending' && isAdmin && (
                <div>
                  <Label>Admin Response</Label>
                  <Textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Enter your response..."
                    rows={3}
                  />
                </div>
              )}

              {selectedFeedback.admin_response && (
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="font-medium text-blue-900 mb-2">Admin Response:</p>
                  <p className="text-blue-800">{selectedFeedback.admin_response}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
            >
              Close
            </Button>
            {selectedFeedback?.status === 'pending' && isAdmin && (
              <Button
                onClick={handleAdminResponse}
                className="bg-burgundy-600 hover:bg-burgundy-700"
                disabled={!adminResponse.trim()}
              >
                Send Response
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
