'use client'

import { useEffect, useState } from 'react'
import { CenterProvider } from '@/context/center-context'
import { getCurrentUser } from '@/lib/auth'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  center_id?: string | null
}

interface CenterProviderWrapperProps {
  children: React.ReactNode
}

export default function CenterProviderWrapper({ children }: CenterProviderWrapperProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error initializing user:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy-600"></div>
          <p className="text-sm text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <CenterProvider user={user}>
      {children}
    </CenterProvider>
  )
} 