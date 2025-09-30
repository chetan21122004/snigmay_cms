'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// Types
export interface Center {
  id: string
  name: string
  location: string
  description: string | null
}

export interface Student {
  id: string
  full_name: string
  age: number
  contact_info: string | null
  batch_id: string | null
  center_id: string | null
  parent_name: string | null
  parent_phone: string | null
  parent_email: string | null
  address: string | null
  emergency_contact: string | null
  medical_conditions: string | null
  photo: string | null
}

export interface Batch {
  id: string
  name: string
  description: string | null
  coach_id: string | null
  center_id: string | null
  start_time: string | null
  end_time: string | null
}

export interface AttendanceRecord {
  id: string
  student_id: string
  batch_id: string
  date: string
  status: 'present' | 'absent'
  marked_by: string | null
  center_id: string | null
  created_at: string
}

export interface FeeRecord {
  id: string
  student_id: string | null
  amount: number
  payment_date: string
  payment_mode: string
  receipt_number: string | null
  status: string
  due_date: string | null
  created_by: string | null
  center_id: string | null
  created_at: string | null
  updated_at: string | null
}

interface User {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'club_manager' | 'head_coach' | 'coach' | 'center_manager'
  center_id: string | null
}

interface CenterContextType {
  centers: Center[]
  selectedCenter: Center | null
  setSelectedCenter: (center: Center | null) => void
  availableCenters: Center[]
  students: Student[]
  batches: Batch[]
  attendanceRecords: AttendanceRecord[]
  feeRecords: FeeRecord[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  refreshCenterData: (centerId: string) => Promise<void>
  getStudentsByCenter: (centerId: string) => Student[]
  getBatchesByCenter: (centerId: string) => Batch[]
  getAttendanceByCenter: (centerId: string) => AttendanceRecord[]
  getFeesByCenter: (centerId: string) => FeeRecord[]
  user: User | null
}

const CenterContext = createContext<CenterContextType | undefined>(undefined)

export const useCenterContext = () => {
  const context = useContext(CenterContext)
  if (!context) {
    throw new Error('useCenterContext must be used within a CenterProvider')
  }
  return context
}

interface CenterProviderProps {
  children: React.ReactNode
  user: User | null
}

export function CenterProvider({ children, user }: CenterProviderProps) {
  const [centers, setCenters] = useState<Center[]>([])
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialFetchDone = useRef(false)
  const lastSelectedCenterId = useRef<string | null>(null)
  
  // Add caching mechanism
  const dataCache = useRef<Map<string, { data: any; timestamp: number }>>(new Map())
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Cache helper functions
  const getCachedData = useCallback((key: string) => {
    const cached = dataCache.current.get(key)
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data
    }
    return null
  }, [CACHE_DURATION])

  const setCachedData = useCallback((key: string, data: any) => {
    dataCache.current.set(key, { data, timestamp: Date.now() })
  }, [])

  // Get available centers based on user role
  const getAvailableCenters = useCallback((role: string, userCenterId: string | null): Center[] => {
    if (['super_admin', 'club_manager', 'head_coach'].includes(role)) {
      return centers
    } else if (['coach', 'center_manager'].includes(role) && userCenterId) {
      return centers.filter(c => c.id === userCenterId)
    }
    return []
  }, [centers])

  const availableCenters = useMemo(() => {
    if (!user) return []
    return getAvailableCenters(user.role, user.center_id)
  }, [user, getAvailableCenters])

  // Filter functions for center-specific data
  const getStudentsByCenter = useCallback((centerId: string) => {
    return students.filter(s => s.center_id === centerId)
  }, [students])

  const getBatchesByCenter = useCallback((centerId: string) => {
    return batches.filter(b => b.center_id === centerId)
  }, [batches])

  const getAttendanceByCenter = useCallback((centerId: string) => {
    return attendanceRecords.filter(a => a.center_id === centerId)
  }, [attendanceRecords])

  const getFeesByCenter = useCallback((centerId: string) => {
    return feeRecords.filter(f => f.center_id === centerId)
  }, [feeRecords])

  // Fetch centers
  const fetchCenters = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('centers')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching centers:', error)
      setError('Failed to load centers')
      return []
    }
  }, [])

  // Fetch data for a specific center - OPTIMIZED with caching
  const fetchCenterSpecificData = useCallback(async (centerId: string) => {
    const cacheKey = `center-${centerId}`
    const cachedData = getCachedData(cacheKey)
    
    if (cachedData) {
      console.log('Using cached data for center:', centerId)
      return cachedData
    }

    try {
      // Optimized queries with limited fields and pagination
      const [studentsRes, batchesRes, attendanceRes, feesRes] = await Promise.all([
        supabase
          .from('students')
          .select('id, full_name, age, contact_info, batch_id, center_id, photo, parent_name, parent_phone')
          .eq('center_id', centerId)
          .order('full_name')
          .limit(150), // Limit for faster loading
        supabase
          .from('batches')
          .select('id, name, description, start_time, end_time, coach_id, center_id, centers(name, location), users(full_name)')
          .eq('center_id', centerId)
          .order('name'),
        supabase
          .from('attendance')
          .select('id, student_id, batch_id, date, status, center_id')
          .eq('center_id', centerId)
          .order('date', { ascending: false })
          .limit(100), // Reduced from 500 to 100
        supabase
          .from('fee_payments')
          .select('id, student_id, amount, payment_date, payment_mode, status, center_id')
          .eq('center_id', centerId)
          .order('payment_date', { ascending: false })
          .limit(50) // Reduced from 500 to 50
      ])

      if (studentsRes.error) throw studentsRes.error
      if (batchesRes.error) throw batchesRes.error
      if (attendanceRes.error) throw attendanceRes.error
      if (feesRes.error) throw feesRes.error

      const result = {
        students: studentsRes.data || [],
        batches: batchesRes.data || [],
        attendance: attendanceRes.data || [],
        fees: feesRes.data || []
      }

      // Cache the result
      setCachedData(cacheKey, result)
      console.log('Cached data for center:', centerId)
      
      return result
    } catch (error) {
      console.error('Error fetching center data:', error)
      throw error
    }
  }, [getCachedData, setCachedData])

  // Fetch all data (for super admin, club manager, head coach) - OPTIMIZED with caching
  const fetchAllCentersData = useCallback(async () => {
    const cacheKey = 'all-centers-data'
    const cachedData = getCachedData(cacheKey)
    
    if (cachedData) {
      console.log('Using cached data for all centers')
      return cachedData
    }

    try {
      // Fetch only essential data with pagination
      const [studentsRes, batchesRes, recentAttendanceRes, recentFeesRes] = await Promise.all([
        supabase
          .from('students')
          .select('id, full_name, age, contact_info, batch_id, center_id, photo')
          .order('full_name')
          .limit(200), // Limit initial load
        supabase
          .from('batches')
          .select('id, name, description, start_time, end_time, coach_id, center_id, centers(name, location), users(full_name)')
          .order('name')
          .limit(100), // Limit initial load
        supabase
          .from('attendance')
          .select('id, student_id, batch_id, date, status, center_id')
          .order('date', { ascending: false })
          .limit(100), // Reduced limit for initial load
        supabase
          .from('fee_payments')
          .select('id, student_id, amount, payment_date, status, center_id')
          .order('payment_date', { ascending: false })
          .limit(50) // Reduced limit for initial load
      ])

      if (studentsRes.error) throw studentsRes.error
      if (batchesRes.error) throw batchesRes.error
      if (recentAttendanceRes.error) throw recentAttendanceRes.error
      if (recentFeesRes.error) throw recentFeesRes.error

      const result = {
        students: studentsRes.data || [],
        batches: batchesRes.data || [],
        attendance: recentAttendanceRes.data || [],
        fees: recentFeesRes.data || []
      }

      // Cache the result
      setCachedData(cacheKey, result)
      console.log('Cached data for all centers')
      
      return result
    } catch (error) {
      console.error('Error fetching all data:', error)
      throw error
    }
  }, [getCachedData, setCachedData])

  // Main data fetching function
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch centers first
      const centersData = await fetchCenters()
      setCenters(centersData)

      // Determine which center to load data for
      let targetCenterId: string | null = null

      if (user.role === 'coach' || user.role === 'center_manager') {
        // For restricted roles, use their assigned center
        targetCenterId = user.center_id
      } else if (selectedCenter) {
        // For unrestricted roles, use the selected center
        targetCenterId = selectedCenter.id
      } else if (centersData.length > 0) {
        // Try to restore from localStorage for unrestricted roles
        const savedCenterId = localStorage.getItem('selectedCenterId')
        const savedCenter = savedCenterId ? centersData.find(c => c.id === savedCenterId) : null
        
        if (savedCenter) {
          targetCenterId = savedCenter.id
        } else {
          // Default to Kharadi center if available, otherwise first center
          const kharadiCenter = centersData.find(c => c.name.includes('Kharadi'))
          const defaultCenter = kharadiCenter || centersData[0]
          targetCenterId = defaultCenter.id
        }
      }

      // Fetch data based on user role and target center
      if (targetCenterId) {
        const data = await fetchCenterSpecificData(targetCenterId)
        setStudents(data.students)
        setBatches(data.batches)
        setAttendanceRecords(data.attendance)
        setFeeRecords(data.fees)
      }

      // Set selected center if not already set
      if (!selectedCenter && centersData.length > 0) {
        const userAvailableCenters = getAvailableCenters(user.role, user.center_id)
        
        if (userAvailableCenters.length > 0) {
          if (user.role === 'coach' || user.role === 'center_manager') {
            // For restricted roles, always set their assigned center
            const userCenter = userAvailableCenters.find(c => c.id === user.center_id)
            if (userCenter) {
              setSelectedCenter(userCenter)
              lastSelectedCenterId.current = userCenter.id
            }
          } else {
            // For unrestricted roles, try to restore from localStorage first
            const savedCenterId = localStorage.getItem('selectedCenterId')
            const savedCenter = savedCenterId ? userAvailableCenters.find(c => c.id === savedCenterId) : null
            
            if (savedCenter) {
              setSelectedCenter(savedCenter)
              lastSelectedCenterId.current = savedCenter.id
            } else {
              // Default to Kharadi center if available, otherwise first center
              const kharadiCenter = userAvailableCenters.find(c => c.name.includes('Kharadi'))
              const defaultCenter = kharadiCenter || userAvailableCenters[0]
              setSelectedCenter(defaultCenter)
              lastSelectedCenterId.current = defaultCenter.id
              // Save to localStorage
              localStorage.setItem('selectedCenterId', defaultCenter.id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchData:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [user, selectedCenter, fetchCenters, fetchCenterSpecificData, getAvailableCenters])

  // Effect to handle selected center changes
  useEffect(() => {
    if (selectedCenter && selectedCenter.id !== lastSelectedCenterId.current && user) {
      lastSelectedCenterId.current = selectedCenter.id
      
      // Save to localStorage for unrestricted roles
      if (['super_admin', 'club_manager', 'head_coach'].includes(user.role)) {
        localStorage.setItem('selectedCenterId', selectedCenter.id)
      }
      
      // Load data for the newly selected center
      const loadCenterData = async () => {
        try {
          setLoading(true)
          const data = await fetchCenterSpecificData(selectedCenter.id)
          setStudents(data.students)
          setBatches(data.batches)
          setAttendanceRecords(data.attendance)
          setFeeRecords(data.fees)
        } catch (error) {
          console.error('Error loading center data:', error)
          setError('Failed to load center data')
        } finally {
          setLoading(false)
        }
      }
      
      loadCenterData()
    }
  }, [selectedCenter, user, fetchCenterSpecificData])

  // Initial data fetch
  useEffect(() => {
    if (!initialFetchDone.current && user) {
      initialFetchDone.current = true
      fetchData()
    }
  }, [user, fetchData])

  // Additional effect to restore center selection if it gets lost
  useEffect(() => {
    if (user && !selectedCenter && centers.length > 0 && !loading) {
      const savedCenterId = localStorage.getItem('selectedCenterId')
      if (savedCenterId) {
        const savedCenter = centers.find(c => c.id === savedCenterId)
        if (savedCenter) {
          setSelectedCenter(savedCenter)
        }
      }
    }
  }, [user, selectedCenter, centers, loading])

  // Refresh functions
  const refreshData = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const refreshCenterData = useCallback(async (centerId: string) => {
    try {
      setLoading(true)
      const data = await fetchCenterSpecificData(centerId)
      setStudents(data.students)
      setBatches(data.batches)
      setAttendanceRecords(data.attendance)
      setFeeRecords(data.fees)
    } catch (error) {
      console.error('Error refreshing center data:', error)
      setError('Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }, [fetchCenterSpecificData])

  // Wrapper for setSelectedCenter that handles localStorage
  const handleSetSelectedCenter = useCallback((center: Center | null) => {
    setSelectedCenter(center)
    
    // Save to localStorage for unrestricted roles
    if (user && ['super_admin', 'club_manager', 'head_coach'].includes(user.role)) {
      if (center) {
        localStorage.setItem('selectedCenterId', center.id)
        lastSelectedCenterId.current = center.id
        console.log('Center selection saved to localStorage:', center.name, center.id)
      } else {
        localStorage.removeItem('selectedCenterId')
        lastSelectedCenterId.current = null
        console.log('Center selection cleared from localStorage')
      }
    } else if (user) {
      // For restricted roles, still update the ref
      lastSelectedCenterId.current = center?.id || null
    }
  }, [user])

  const value = {
    centers,
    selectedCenter,
    setSelectedCenter: handleSetSelectedCenter,
    availableCenters,
    students,
    batches,
    attendanceRecords,
    feeRecords,
    loading,
    error,
    refreshData,
    refreshCenterData,
    getStudentsByCenter,
    getBatchesByCenter,
    getAttendanceByCenter,
    getFeesByCenter,
    user
  }

  return <CenterContext.Provider value={value}>{children}</CenterContext.Provider>
} 