import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nqkpmwdmlkcelorvqyyl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xa3Btd2RtbGtjZWxvcnZxeXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Nzk2OTIsImV4cCI6MjA2NzA1NTY5Mn0.ryH5TeQPsAuz1BT6xKj11k-VIkrvZLU2501PGzberoI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          role: 'super_admin' | 'club_manager' | 'head_coach' | 'coach' | 'center_manager'
          center_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          role?: 'super_admin' | 'club_manager' | 'head_coach' | 'coach' | 'center_manager'
          center_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          role?: 'super_admin' | 'club_manager' | 'head_coach' | 'coach' | 'center_manager'
          center_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      centers: {
        Row: {
          id: string
          name: string
          location: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          location: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          location?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      students: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          age: number
          contact_info?: string | null
          batch_id?: string | null
          center_id?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          address?: string | null
          emergency_contact?: string | null
          medical_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          age?: number
          contact_info?: string | null
          batch_id?: string | null
          center_id?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          address?: string | null
          emergency_contact?: string | null
          medical_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      batches: {
        Row: {
          id: string
          name: string
          description: string | null
          coach_id: string | null
          center_id: string | null
          start_time: string | null
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          coach_id?: string | null
          center_id?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          coach_id?: string | null
          center_id?: string | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          batch_id: string
          date: string
          status: 'present' | 'absent'
          marked_by: string | null
          center_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          batch_id: string
          date: string
          status: 'present' | 'absent'
          marked_by?: string | null
          center_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          batch_id?: string
          date?: string
          status?: 'present' | 'absent'
          marked_by?: string | null
          center_id?: string | null
          created_at?: string
        }
      }
      fee_structures: {
        Row: {
          id: string
          batch_id: string | null
          amount: number
          frequency: 'monthly' | 'quarterly' | 'annually'
          description: string | null
          center_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          batch_id?: string | null
          amount: number
          frequency: 'monthly' | 'quarterly' | 'annually'
          description?: string | null
          center_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          batch_id?: string | null
          amount?: number
          frequency?: 'monthly' | 'quarterly' | 'annually'
          description?: string | null
          center_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      fee_payments: {
        Row: {
          id: string
          student_id: string | null
          amount: number
          payment_date: string
          payment_mode: 'cash' | 'upi' | 'bank_transfer' | 'check' | 'card' | 'online'
          receipt_number: string | null
          status: 'paid' | 'due' | 'overdue'
          due_date: string | null
          created_by: string | null
          center_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id?: string | null
          amount: number
          payment_date: string
          payment_mode: 'cash' | 'upi' | 'bank_transfer' | 'check' | 'card' | 'online'
          receipt_number?: string | null
          status: 'paid' | 'due' | 'overdue'
          due_date?: string | null
          created_by?: string | null
          center_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string | null
          amount?: number
          payment_date?: string
          payment_mode?: 'cash' | 'upi' | 'bank_transfer' | 'check' | 'card' | 'online'
          receipt_number?: string | null
          status?: 'paid' | 'due' | 'overdue'
          due_date?: string | null
          created_by?: string | null
          center_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
