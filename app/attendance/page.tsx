"use client"
import { useCenterContext } from "@/context/center-context"
import DashboardLayout from "@/components/dashboard-layout"
import CenterAttendanceManagement from "@/components/center-attendance-management"
import CoachAttendanceManagement from "@/components/coach-attendance-management"
import CenterProviderWrapper from "@/components/center-provider-wrapper"

function AttendanceContent() {
  const { user, loading } = useCenterContext()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy-600"></div>
          <p className="text-sm text-gray-600">Loading attendance management...</p>
        </div>
      </div>
    )
  }

  // Show coach-specific attendance for coaches
  if (user?.role === 'coach') {
    return <CoachAttendanceManagement />
  }

  // Show center-wide attendance for managers and admins
  return <CenterAttendanceManagement />
}

export default function AttendancePage() {
  return (
    <CenterProviderWrapper>
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <AttendanceContent />
          </div>
        </div>
      </DashboardLayout>
    </CenterProviderWrapper>
  )
} 