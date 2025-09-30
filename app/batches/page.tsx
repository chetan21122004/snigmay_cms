"use client"
import { useCenterContext } from "@/context/center-context"
import DashboardLayout from "@/components/dashboard-layout"
import BatchManagement from "@/components/batch-management"
import CoachBatchManagement from "@/components/coach-batch-management"
import CenterProviderWrapper from "@/components/center-provider-wrapper"

function BatchesContent() {
  const { user, loading } = useCenterContext()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy-600"></div>
          <p className="text-sm text-gray-600">Loading batch management...</p>
        </div>
      </div>
    )
  }

  // Show coach-specific batch view for coaches
  if (user?.role === 'coach') {
    return <CoachBatchManagement />
  }

  // Show full batch management for managers and admins
  return <BatchManagement />
}

export default function BatchesPage() {
  return (
    <CenterProviderWrapper>
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <BatchesContent />
          </div>
        </div>
      </DashboardLayout>
    </CenterProviderWrapper>
  )
} 