"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import PhotoUpload from "@/components/photo-upload"
import FeedbackSystem from "@/components/feedback-system"
import { Camera, MessageSquare, Star, Users, GraduationCap, Building } from "lucide-react"

export default function DemoFeaturesPage() {
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null)
  const [coachPhoto, setCoachPhoto] = useState<string | null>(null)
  const [centerPhoto, setCenterPhoto] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">New Features Demo</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the latest additions to Snigmay Pune FC Management System: 
            Photo Upload functionality and Comprehensive Feedback System
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-burgundy-200 hover:border-burgundy-300 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-burgundy-50 rounded-lg">
                  <Camera className="h-6 w-6 text-burgundy-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Photo Upload System</CardTitle>
                  <CardDescription>Add photos to player, coach, and center profiles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Upload, change, and remove profile photos</li>
                <li>• Support for JPG, PNG, GIF formats</li>
                <li>• File size validation (max 5MB)</li>
                <li>• Real-time preview and fallback avatars</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Feedback Management</CardTitle>
                  <CardDescription>Comprehensive feedback system for players and coaches</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Submit feedback with 5-star ratings</li>
                <li>• Categorized feedback types</li>
                <li>• Anonymous submission option</li>
                <li>• Super admin response system</li>
                <li>• Advanced filtering and status tracking</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Demo Tabs */}
        <Tabs defaultValue="photo-upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photo-upload" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photo Upload Demo
            </TabsTrigger>
            <TabsTrigger value="feedback-system" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback System Demo
            </TabsTrigger>
          </TabsList>

          {/* Photo Upload Demo */}
          <TabsContent value="photo-upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photo Upload Components
                </CardTitle>
                <CardDescription>
                  Try uploading photos for different profile types. In production, these would be integrated into the respective management forms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Student Photo Demo */}
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-burgundy-600" />
                      <h3 className="font-semibold text-lg">Student Profile</h3>
                    </div>
                    <PhotoUpload
                      currentPhoto={studentPhoto || undefined}
                      onPhotoChange={setStudentPhoto}
                      fallbackText="Student Name"
                      size="lg"
                    />
                    <Badge variant="outline" className="bg-burgundy-50 text-burgundy-700 border-burgundy-200">
                      Integrated in Student Management
                    </Badge>
                  </div>

                  {/* Coach Photo Demo */}
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">Coach Profile</h3>
                    </div>
                    <PhotoUpload
                      currentPhoto={coachPhoto || undefined}
                      onPhotoChange={setCoachPhoto}
                      fallbackText="Coach Name"
                      size="lg"
                    />
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Integrated in User Management
                    </Badge>
                  </div>

                  {/* Center Photo Demo */}
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Building className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-lg">Center Profile</h3>
                    </div>
                    <PhotoUpload
                      currentPhoto={centerPhoto || undefined}
                      onPhotoChange={setCenterPhoto}
                      fallbackText="Center Name"
                      size="lg"
                    />
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Ready for Center Management
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Implementation Details */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Technical Features:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Reusable PhotoUpload component</li>
                      <li>• Base64 encoding for demo (production would use cloud storage)</li>
                      <li>• TypeScript interfaces updated with photo fields</li>
                      <li>• Database schema includes photo columns</li>
                      <li>• Form validation and error handling</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">User Experience:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Click avatar or camera icon to upload</li>
                      <li>• Drag and drop support</li>
                      <li>• Real-time preview</li>
                      <li>• Loading states and success/error feedback</li>
                      <li>• Responsive design for mobile use</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback System Demo */}
          <TabsContent value="feedback-system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Feedback Management System
                </CardTitle>
                <CardDescription>
                  This is a fully functional feedback system. Super admins can manage all feedback, while other roles can submit feedback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-burgundy-50 rounded-lg border border-burgundy-200">
                      <h4 className="font-semibold text-burgundy-900 mb-2">For Coaches & Staff:</h4>
                      <ul className="text-sm text-burgundy-700 space-y-1">
                        <li>• Submit feedback about players</li>
                        <li>• Rate performance (1-5 stars)</li>
                        <li>• Choose from predefined categories</li>
                        <li>• Option for anonymous feedback</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">For Super Admin:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• View all feedback submissions</li>
                        <li>• Filter by type, status, rating</li>
                        <li>• Respond to feedback</li>
                        <li>• Track resolution status</li>
                      </ul>
                    </div>
                  </div>

                  {/* Demo Note */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> The feedback system below is fully functional but uses sample data for demonstration. 
                      In production, it would connect to real player and coach data from your database.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Embedded Feedback System */}
            <FeedbackSystem isAdmin={false} />
          </TabsContent>
        </Tabs>

        {/* Navigation Links */}
        <Card>
          <CardHeader>
            <CardTitle>Access These Features</CardTitle>
            <CardDescription>Navigate to the relevant sections to use these features in production</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="/students">
                  <div className="text-left">
                    <div className="font-semibold">Student Management</div>
                    <div className="text-sm text-gray-500">Add photos to student profiles</div>
                  </div>
                </a>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="/user-management">
                  <div className="text-left">
                    <div className="font-semibold">User Management</div>
                    <div className="text-sm text-gray-500">Add photos to coach profiles</div>
                  </div>
                </a>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="/feedback">
                  <div className="text-left">
                    <div className="font-semibold">Feedback Management</div>
                    <div className="text-sm text-gray-500">Manage player & coach feedback</div>
                  </div>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
