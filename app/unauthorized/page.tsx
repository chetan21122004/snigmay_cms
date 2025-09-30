"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft, Home, LogOut } from "lucide-react"
import { getCurrentUser, signOut } from "@/lib/auth"

export default function UnauthorizedPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-burgundy-50 to-gold-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 text-center">
          <CardHeader className="pb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/snigmay_logo.png"
                alt="Snigmay Pune FC"
                width={80}
                height={80}
                className="h-20 w-auto"
                priority
              />
            </div>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 rounded-full">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-600">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-sm text-gray-600">
              {user ? (
                <div className="space-y-2">
                  <p>
                    <strong>Current User:</strong> {user.full_name}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    Your current role doesn't have permission to access this resource.
                    Please contact your administrator if you believe this is an error.
                  </p>
                </div>
              ) : (
                <p>Please log in to access this resource.</p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button
                asChild
                className="w-full bg-burgundy-600 hover:bg-burgundy-700"
              >
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>

              {user && (
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </div>

            <div className="pt-4 text-xs text-gray-500 border-t">
              <p>Contact your system administrator for access requests</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
