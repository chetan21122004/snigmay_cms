import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'club_manager' | 'head_coach' | 'coach' | 'center_manager'
  center_id: string | null
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  full_name: string
  role: 'super_admin' | 'club_manager' | 'head_coach' | 'coach' | 'center_manager'
  center_id?: string
}

const AUTH_STORAGE_KEY = 'snigmay_auth_user'

// Hash password function
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password function
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const signIn = async (credentials: LoginCredentials): Promise<{ user: User }> => {
  try {
    // Query the users table to find the user
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email.toLowerCase().trim())
      .limit(1)

    if (queryError) {
      throw new Error(`Database error: ${queryError.message}`)
    }

    if (!users || users.length === 0) {
      throw new Error('Invalid email or password')
    }

    const user = users[0]
    
    // Verify password
    const isPasswordValid = await verifyPassword(credentials.password, user.password_hash)
    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Store user in localStorage for session management
    const userSession: User = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      center_id: user.center_id,
      created_at: user.created_at
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userSession))
    
    return { user: userSession }
  } catch (error: any) {
    console.error('Sign in error:', error)
    throw new Error(error.message || 'Login failed')
  }
}

export const signUp = async (signupData: SignupData): Promise<{ user: User }> => {
  try {
    // Validate input
    if (!signupData.email || !signupData.password || !signupData.full_name || !signupData.role) {
      throw new Error('All fields are required')
    }

    if (signupData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    const email = signupData.email.toLowerCase().trim()

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .limit(1)

    if (checkError) {
      throw new Error(`Database error: ${checkError.message}`)
    }

    if (existingUsers && existingUsers.length > 0) {
      throw new Error('User already exists with this email')
    }
    
    // Hash password
    const hashedPassword = await hashPassword(signupData.password)

    // Insert new user
    const { data: newUsers, error: insertError } = await supabase
      .from('users')
      .insert([{
        email: email,
        password_hash: hashedPassword,
        full_name: signupData.full_name.trim(),
        role: signupData.role,
        center_id: signupData.center_id || null
      }])
      .select()

    if (insertError) {
      throw new Error(`Failed to create user: ${insertError.message}`)
    }

    if (!newUsers || newUsers.length === 0) {
      throw new Error('Failed to create user')
    }

    const newUser = newUsers[0]
    const userSession: User = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
      center_id: newUser.center_id,
      created_at: newUser.created_at
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userSession))
    
    return { user: userSession }
  } catch (error: any) {
    console.error('Sign up error:', error)
    throw new Error(error.message || 'Signup failed')
  }
}

export const signOut = async (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
    resolve()
  })
}

export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }
    
    const userString = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!userString) {
      resolve(null)
      return
    }
    
    try {
      const user = JSON.parse(userString)
      resolve(user)
    } catch (error) {
      console.error('Error parsing user data:', error)
      localStorage.removeItem(AUTH_STORAGE_KEY)
      resolve(null)
    }
  })
}

export const updateUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const currentUserString = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!currentUserString) {
      throw new Error('No user logged in')
    }
    
    const currentUser = JSON.parse(currentUserString)
    
    // Update user in database
    const { data: updatedUsers, error } = await supabase
      .from('users')
      .update({
        full_name: userData.full_name || currentUser.full_name,
        role: userData.role || currentUser.role,
        center_id: userData.center_id !== undefined ? userData.center_id : currentUser.center_id
      })
      .eq('id', currentUser.id)
      .select()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    if (!updatedUsers || updatedUsers.length === 0) {
      throw new Error('Failed to update user')
    }

    const updatedUser = updatedUsers[0]
    const userSession: User = {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      role: updatedUser.role,
      center_id: updatedUser.center_id,
      created_at: updatedUser.created_at
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userSession))
    
    return userSession
  } catch (error: any) {
    throw new Error(error.message || 'Update failed')
  }
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const currentUserString = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!currentUserString) {
      throw new Error('No user logged in')
    }
    
    const currentUser = JSON.parse(currentUserString)
    
    // Get current user from database
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', currentUser.id)
      .limit(1)

    if (queryError) {
      throw new Error(`Database error: ${queryError.message}`)
    }

    if (!users || users.length === 0) {
      throw new Error('User not found')
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, users[0].password_hash)
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)
    
    // Update password in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedNewPassword })
      .eq('id', currentUser.id)

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`)
    }
  } catch (error: any) {
    throw new Error(error.message || 'Password change failed')
  }
}

// Role-based access control utilities
export const hasAccess = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole)
}

export const canAccessAllCenters = (userRole: string): boolean => {
  return ['super_admin', 'club_manager', 'head_coach'].includes(userRole)
}

export const canManageUsers = (userRole: string): boolean => {
  return ['super_admin', 'club_manager'].includes(userRole)
}

export const canManageFinances = (userRole: string): boolean => {
  return ['super_admin', 'club_manager', 'center_manager'].includes(userRole)
}

export const canMarkAttendance = (userRole: string): boolean => {
  return ['super_admin', 'club_manager', 'head_coach', 'coach', 'center_manager'].includes(userRole)
}

export const canViewReports = (userRole: string): boolean => {
  return ['super_admin', 'club_manager', 'head_coach'].includes(userRole)
}

export const getUserCenterAccess = (userRole: string, userCenterId: string | null): 'all' | 'single' | 'none' => {
  switch (userRole) {
    case 'super_admin':
    case 'club_manager':
    case 'head_coach':
      return 'all'
    case 'coach':
    case 'center_manager':
      return userCenterId ? 'single' : 'none'
    default:
      return 'none'
  }
}
