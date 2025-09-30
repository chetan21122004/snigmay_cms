"use client"
import DashboardLayout from "@/components/dashboard-layout"
import CenterProviderWrapper from "@/components/center-provider-wrapper"
import StudentManagement from "@/components/student-management"

export default function StudentsPage() {
  return (
    <CenterProviderWrapper>
      <DashboardLayout>
        <StudentManagement />
      </DashboardLayout>
    </CenterProviderWrapper>
  )
} 