"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCenterContext } from "@/context/center-context"
import DashboardLayout from "@/components/dashboard-layout"
import CenterProviderWrapper from "@/components/center-provider-wrapper"
import { ClubManagerDashboard } from "@/components/club-manager-dashboard"

function ClubManagerContent() {
  const { user, loading } = useCenterContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }
      
      if (user.role !== 'club_manager') {
        router.push("/unauthorized")
        return
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy-600"></div>
          <p className="text-sm text-gray-600">Loading club manager dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'club_manager') {
    return null // Router will handle redirect
  }

  return <ClubManagerDashboard />
}

export default function ClubManagerPage() {
  return (
    <CenterProviderWrapper>
      <DashboardLayout>
        <ClubManagerContent />
      </DashboardLayout>
    </CenterProviderWrapper>
  )
} 