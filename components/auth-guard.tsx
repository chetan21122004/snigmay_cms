"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, hasAccess } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallback?: React.ReactNode
}

export function AuthGuard({ children, requiredRoles = [], fallback }: AuthGuardProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)

        // Check role-based access if required roles are specified
        if (requiredRoles.length > 0) {
          const hasRequiredAccess = hasAccess(currentUser.role, requiredRoles)
          if (!hasRequiredAccess) {
            router.push('/unauthorized')
            return
          }
        }

        setAuthorized(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRoles])

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="space-y-6 w-full max-w-4xl mx-auto p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    )
  }

  if (!authorized) {
    return null // Router will handle redirect
  }

  return <>{children}</>
}

// Higher-order component for easier usage
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard requiredRoles={requiredRoles}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

// Role-specific guards for common use cases
export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={['super_admin']}>
      {children}
    </AuthGuard>
  )
}

export function ManagerGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={['super_admin', 'club_manager']}>
      {children}
    </AuthGuard>
  )
}

export function CoachGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={['super_admin', 'club_manager', 'head_coach']}>
      {children}
    </AuthGuard>
  )
}

export function StaffGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={['super_admin', 'club_manager', 'head_coach', 'coach', 'center_manager']}>
      {children}
    </AuthGuard>
  )
}
