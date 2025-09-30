"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCenterContext } from "@/context/center-context"
import DashboardLayout from "@/components/dashboard-layout"
import CenterProviderWrapper from "@/components/center-provider-wrapper"

export default function DashboardPage() {
  const { user, loading } = useCenterContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect to role-specific dashboard page
      switch (user.role) {
        case 'super_admin':
          router.push('/super-admin')
          break
        case 'club_manager':
          router.push('/club-manager')
          break
        case 'head_coach':
          router.push('/head-coach')
          break
        case 'coach':
          router.push('/coach')
          break
        case 'center_manager':
          router.push('/center-manager')
          break
        default:
          router.push('/unauthorized')
          break
      }
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96 bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy-600"></div>
            <p className="text-sm text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // This should not render as useEffect will redirect
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy-600"></div>
          <p className="text-sm text-gray-600">Redirecting...</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
