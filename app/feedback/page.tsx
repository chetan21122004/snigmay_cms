"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import CenterProviderWrapper from "@/components/center-provider-wrapper"
import DashboardLayout from "@/components/dashboard-layout"
import FeedbackSystem from "@/components/feedback-system"

export default function FeedbackPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          router.push('/login')
          return
        }

        // Only super admin can access feedback management
        if (currentUser.role !== 'super_admin') {
          router.push('/unauthorized')
          return
        }

        setUser(currentUser)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy-600"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Router will handle redirect
  }

  return (
    <CenterProviderWrapper>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <FeedbackSystem isAdmin={true} />
          </div>
        </div>
      </DashboardLayout>
    </CenterProviderWrapper>
  )
}
