"use client"

import DashboardLayout from "@/components/dashboard-layout"
import FeeManagement from "@/components/fee-management"
import { FinanceManagement } from "@/components/finance-management"
import CenterProviderWrapper from "@/components/center-provider-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FeesPage() {
  return (
    <CenterProviderWrapper>
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="fees" className="space-y-6">
              <TabsList>
                <TabsTrigger value="fees">Fee Collection</TabsTrigger>
                <TabsTrigger value="finance">Finance Management</TabsTrigger>
              </TabsList>
              <TabsContent value="fees">
                <FeeManagement />
              </TabsContent>
              <TabsContent value="finance">
                <FinanceManagement />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </CenterProviderWrapper>
  )
} 