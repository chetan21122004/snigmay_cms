"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCenterContext } from "@/context/center-context"
import { signOut } from "@/lib/auth"
import { useIsMobile } from "@/components/ui/use-mobile"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  CreditCard,
  UserCog,
  MapPin,
  LogOut,
  Settings,
  Bell,
  Database,
  Layers,
  Wallet,
  CalendarCheck,
  Menu,
  X,
  FileText,
  MessageSquare
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  email: string
  full_name: string
  role: string
  center_id?: string | null
}

// Optimized menu configuration with proper role-based access
const getMenuItems = (userRole: string) => [
  {
    section: "Dashboard",
    items: [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
        description: "Overview and analytics",
        roles: ["super_admin", "club_manager", "head_coach", "coach", "center_manager"]
      }
    ]
  },
  {
    section: "Training Management",
    items: [
  {
    title: "Students",
    href: "/students",
    icon: Users,
        description: "Manage student profiles",
        roles: ["super_admin", "club_manager", "head_coach", "coach", "center_manager"]
  },
  {
    title: "Batches",
    href: "/batches",
        icon: Layers,
        description: "Training batch schedules",
        roles: ["super_admin", "club_manager", "head_coach", "coach", "center_manager"]
  },
  {
    title: "Attendance",
    href: "/attendance",
        icon: CalendarCheck,
        description: "Mark and track attendance",
        roles: ["super_admin", "club_manager", "head_coach", "coach", "center_manager"]
      },
      {
        title: "Player Reports",
        href: "/coach/player-reports",
        icon: FileText,
        description: "Create player performance reports",
        roles: ["coach"]
      }
    ]
  },
  {
    section: "Financial Management",
    items: [
  {
        title: "Fee Collection",
    href: "/fees",
        icon: Wallet,
        description: "Manage fee payments",
        roles: ["super_admin", "club_manager", "center_manager"]
      }
    ]
  },
  {
    section: "Administration",
    items: [
  {
        title: "User Management",
    href: "/user-management",
    icon: UserCog,
        description: "Manage staff accounts",
        roles: ["super_admin", "club_manager"]
  },
  {
        title: "Feedback Management",
        href: "/feedback",
        icon: MessageSquare,
        description: "Manage player and coach feedback",
        roles: ["super_admin"]
      }
    ]
  }
].map(section => ({
  ...section,
  items: section.items.filter(item => item.roles.includes(userRole))
})).filter(section => section.items.length > 0)

// Optimized Center Selector Component
const CenterSelector = ({ user }: { user: User | null }) => {
  const { selectedCenter, setSelectedCenter, availableCenters, loading } = useCenterContext()

  const handleCenterChange = useCallback((centerId: string) => {
    const center = availableCenters.find(c => c.id === centerId)
    if (center) {
      setSelectedCenter(center)
    }
  }, [availableCenters, setSelectedCenter])

  if (loading) {
    return (
      <div className="p-3 md:p-4 border-b border-gray-100">
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!user || availableCenters.length === 0) {
    return null
  }

  // For users with access to multiple centers (super admin, club manager, head coach)
  if (['super_admin', 'club_manager', 'head_coach'].includes(user.role)) {
  return (
      <div className="p-3 md:p-4 border-b border-gray-100">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Training Center
          </label>
    <Select 
            value={selectedCenter?.id || ""} 
            onValueChange={handleCenterChange}
    >
      <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a center">
                {selectedCenter ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{selectedCenter.name}</span>
                  </div>
                ) : (
                  "Select a center"
                )}
              </SelectValue>
      </SelectTrigger>
      <SelectContent>
              {availableCenters.map((center) => (
          <SelectItem key={center.id} value={center.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{center.name}</span>
                    <span className="text-xs text-gray-500">{center.location}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
        </div>
      </div>
  )
}

  // For restricted users (coach, center manager) - show their assigned center
  if (availableCenters.length === 1 && selectedCenter) {
    return (
      <div className="p-3 md:p-4 border-b border-gray-100">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Your Center
          </label>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <span className="font-medium text-gray-900">{selectedCenter.name}</span>
              <p className="text-xs text-gray-500">{selectedCenter.location}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Optimized User Dropdown Component
const UserDropdown = ({ user }: { user: User | null }) => {
  const router = useRouter()

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [router])

  const formatRole = useCallback((role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }, [])

  if (!user) {
    return <Skeleton className="h-16 w-full" />
  }

    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full p-2 h-auto hover:bg-gray-100 rounded-lg">
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-burgundy-100 text-burgundy-700 font-semibold">
                {user.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
              </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.full_name}
              </p>
              <Badge variant="secondary" className="text-xs bg-burgundy-100 text-burgundy-700">
                {formatRole(user.role)}
              </Badge>
            </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
          <Link href="/change-password" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
                Change Password
              </Link>
            </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell className="mr-2 h-4 w-4" />
          Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
          Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  )
}

// Mobile Header Component
const MobileHeader = ({ user, onMenuToggle }: { user: User | null; onMenuToggle: () => void }) => {
  return (
    <header className="lg:hidden bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-14">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMenuToggle}
          className="p-1.5 h-8 w-8"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Image
            src="/snigmay_logo.png"
            alt="Snigmay Pune FC"
            width={20}
            height={20}
            className="h-5 w-auto"
          />
          <span className="font-semibold text-base text-burgundy-900">
            Snigmay FC
          </span>
        </div>
      </div>
      <div className="scale-90">
        <UserDropdown user={user} />
      </div>
    </header>
  )
}

// Optimized Sidebar Component
const Sidebar = ({ user, isOpen, onClose }: { user: User | null; isOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  
  const isActive = useCallback((path: string) => pathname === path, [pathname])
  
  const menuItems = useMemo(() => 
    user ? getMenuItems(user.role) : [], 
    [user]
  )

  // Close sidebar when route changes on mobile (but don't reset center)
  useEffect(() => {
    if (isMobile && isOpen) {
      // Small delay to ensure navigation completes before closing
      const timer = setTimeout(() => {
        onClose()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [pathname, isMobile, isOpen, onClose])

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "h-screen w-72 flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-50 transition-transform duration-300",
        isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "lg:flex",
        isMobile ? "flex" : "hidden lg:flex"
      )}>
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Image
            src="/snigmay_logo.png"
            alt="Snigmay Pune FC"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="font-semibold text-lg text-burgundy-900">
            Snigmay Pune FC
          </span>
        </div>
        {isMobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="p-2"
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Center Selection */}
      <CenterSelector user={user} />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-6 px-4">
          {menuItems.map((section, idx) => (
            <div key={idx} className="space-y-2">
              {section.section && (
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.section}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      isActive(item.href)
                        ? "bg-burgundy-50 text-burgundy-900"
                        : "text-gray-700 hover:bg-burgundy-50/50 hover:text-burgundy-900"
                    )}
                  >
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all",
                      isActive(item.href)
                        ? "border-burgundy-200 bg-burgundy-100 text-burgundy-900"
                        : "border-transparent bg-gray-50 text-gray-500 group-hover:border-burgundy-100 group-hover:bg-burgundy-50 group-hover:text-burgundy-900"
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.title}</span>
                        {isActive(item.href) && (
                          <div className="h-1.5 w-1.5 rounded-full bg-burgundy-500" />
                        )}
                      </div>
                      <p className={cn(
                        "text-xs font-normal",
                        isActive(item.href)
                          ? "text-burgundy-700"
                          : "text-gray-500 group-hover:text-burgundy-700"
                      )}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          </div>
      </nav>

      {/* User Section */}
      <div className="mt-auto border-t border-gray-100 p-4">
        <UserDropdown user={user} />
      </div>
    </aside>
    </>
  )
}

// Main Dashboard Layout Component
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const isMobile = useIsMobile()
  
  // Get user from center context instead of fetching separately
  const { user, loading } = useCenterContext()

  // Handle authentication redirect
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <MobileHeader user={user} onMenuToggle={toggleMobileMenu} />
      
      {/* Sidebar */}
      <Sidebar user={user} isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      
      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        isMobile ? "pt-14" : "lg:pl-72"
      )}>
        <div className="min-h-screen">
          {loading ? (
            <div className="flex items-center justify-center h-96 bg-gray-50">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-burgundy-600"></div>
                <p className="text-xs text-gray-500">Loading content...</p>
              </div>
            </div>
          ) : !user ? (
            <div className="flex items-center justify-center h-96 bg-gray-50">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-burgundy-600"></div>
                <p className="text-xs text-gray-500">Redirecting...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  )
} 