"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCenterContext } from "@/context/center-context"
import DashboardLayout from "@/components/dashboard-layout"
import CenterProviderWrapper from "@/components/center-provider-wrapper"
import { HeadCoachDashboard } from "@/components/head-coach-dashboard"

function HeadCoachContent() {
  const { user, loading } = useCenterContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }
      
      if (user.role !== 'head_coach') {
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
          <p className="text-sm text-gray-600">Loading head coach dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'head_coach') {
    return null // Router will handle redirect
  }

  return <HeadCoachDashboard />
}

export default function HeadCoachPage() {
  return (
    <CenterProviderWrapper>
      <DashboardLayout>
        <HeadCoachContent />
      </DashboardLayout>
    </CenterProviderWrapper>
  )
} 