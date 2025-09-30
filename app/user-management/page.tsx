"use client"

import DashboardLayout from "@/components/dashboard-layout"
import CenterProviderWrapper from "@/components/center-provider-wrapper"
import UserManagement from "@/components/user-management"

export default function CoachManagementPage() {
  return (
    <CenterProviderWrapper>
      <DashboardLayout>
        <UserManagement />
      </DashboardLayout>
    </CenterProviderWrapper>
  )
} 