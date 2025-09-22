// src/lib/types/database.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'student' | 'admin'
          subscription_status: 'free' | 'premium'
          language: 'es' | 'en'
          notation_preference: 'spanish' | 'english'
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'student' | 'admin'
          subscription_status?: 'free' | 'premium'
          language?: 'es' | 'en'
          notation_preference?: 'spanish' | 'english'
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'student' | 'admin'
          subscription_status?: 'free' | 'premium'
          language?: 'es' | 'en'
          notation_preference?: 'spanish' | 'english'
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Aquí irán las demás tablas cuando las creemos
      lessons: {
        Row: {
          id: string
          title: string
          difficulty_level: number
          is_premium: boolean
          duration_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          difficulty_level: number
          is_premium?: boolean
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          difficulty_level?: number
          is_premium?: boolean
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          progress_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          progress_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          progress_percentage?: number
          created_at?: string
          updated_at?: string
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
      user_role: 'student' | 'admin'
      subscription_status: 'free' | 'premium'
      language: 'es' | 'en'
      notation_preference: 'spanish' | 'english'
      progress_status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}