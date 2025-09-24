// src/lib/types/database.ts - ACTUALIZADO con schema real
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'student' | 'content_admin' | 'support_admin' | 'superadmin'
          subscription_status: 'free' | 'premium'
          language: 'es' | 'en'
          notation_preference: 'spanish' | 'english'
          full_name: string | null
          avatar_url: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'student' | 'content_admin' | 'support_admin' | 'superadmin'
          subscription_status?: 'free' | 'premium'
          language?: 'es' | 'en'
          notation_preference?: 'spanish' | 'english'
          full_name?: string | null
          avatar_url?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'student' | 'content_admin' | 'support_admin' | 'superadmin'
          subscription_status?: 'free' | 'premium'
          language?: 'es' | 'en'
          notation_preference?: 'spanish' | 'english'
          full_name?: string | null
          avatar_url?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          category_id: string | null
          technique_category_id: string | null
          difficulty_level_id: string | null
          tuning_id: string | null
          lesson_number: number
          duration_minutes: number
          is_premium: boolean
          is_published: boolean
          thumbnail_url: string | null
          video_url: string | null
          audio_demo_url: string | null
          bpm_recommendation: number | null
          capo_position: number
          tags: any[] // jsonb
          prerequisites: any[] // jsonb
          learning_objectives: any[] // jsonb
          physical_requirements: any[] // jsonb
          created_by: string | null
          module_id: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          category_id?: string | null
          technique_category_id?: string | null
          difficulty_level_id?: string | null
          tuning_id?: string | null
          lesson_number: number
          duration_minutes: number
          is_premium?: boolean
          is_published?: boolean
          thumbnail_url?: string | null
          video_url?: string | null
          audio_demo_url?: string | null
          bpm_recommendation?: number | null
          capo_position?: number
          tags?: any[]
          prerequisites?: any[]
          learning_objectives?: any[]
          physical_requirements?: any[]
          created_by?: string | null
          module_id: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          category_id?: string | null
          technique_category_id?: string | null
          difficulty_level_id?: string | null
          tuning_id?: string | null
          lesson_number?: number
          duration_minutes?: number
          is_premium?: boolean
          is_published?: boolean
          thumbnail_url?: string | null
          video_url?: string | null
          audio_demo_url?: string | null
          bpm_recommendation?: number | null
          capo_position?: number
          tags?: any[]
          prerequisites?: any[]
          learning_objectives?: any[]
          physical_requirements?: any[]
          created_by?: string | null
          module_id?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      lesson_steps: {
        Row: {
          id: string
          lesson_id: string
          title: string
          content: any // jsonb - el contenido varía según step_type
          step_type: 'intro' | 'theory' | 'interactive' | 'practice' | 'quiz'
          step_order: number
          is_required: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          content: any
          step_type: 'intro' | 'theory' | 'interactive' | 'practice' | 'quiz'
          step_order: number
          is_required?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          content?: any
          step_type?: 'intro' | 'theory' | 'interactive' | 'practice' | 'quiz'
          step_order?: number
          is_required?: boolean
          created_at?: string
        }
      }
      user_lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          progress_percentage: number
          time_spent_minutes: number
          attempts_count: number
          best_score: number | null
          last_accessed_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          progress_percentage?: number
          time_spent_minutes?: number
          attempts_count?: number
          best_score?: number | null
          last_accessed_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          progress_percentage?: number
          time_spent_minutes?: number
          attempts_count?: number
          best_score?: number | null
          last_accessed_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      difficulty_levels: {
        Row: {
          id: string
          name: string
          level_number: number
          description: string | null
          color_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          level_number: number
          description?: string | null
          color_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          level_number?: number
          description?: string | null
          color_code?: string | null
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
      user_role: 'student' | 'content_admin' | 'support_admin' | 'superadmin'
      subscription_status: 'free' | 'premium'
      language: 'es' | 'en'
      notation_preference: 'spanish' | 'english'
      progress_status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
      step_type: 'intro' | 'theory' | 'interactive' | 'practice' | 'quiz'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Interfaces de trabajo
export interface Lesson {
  id: string
  title: string
  slug: string
  description: string | null
  lesson_number: number
  duration_minutes: number
  is_premium: boolean
  is_published: boolean
  tags: string[]
  learning_objectives: string[]
  created_at: string
  steps?: LessonStep[]
}

export interface LessonStep {
  id: string
  lesson_id: string
  title: string
  content: StepContent
  step_type: 'intro' | 'theory' | 'interactive' | 'practice' | 'quiz'
  step_order: number
  is_required: boolean
}

// Tipos específicos de contenido por step
export type StepContent = 
  | IntroStepContent 
  | TheoryStepContent 
  | InteractiveStepContent 
  | PracticeStepContent 
  | QuizStepContent

export interface IntroStepContent {
  type: 'intro'
  title: string
  content: string
  key_points: string[]
}

export interface TheoryStepContent {
  type: 'theory'
  title: string
  key_facts?: Array<{
    title: string
    content: string
  }>
  string_names?: Array<{
    name: string
    number: number
    name_english: string
  }>
}

export interface InteractiveStepContent {
  type: 'interactive'
  required_interactions: Array<{
    label: string
    string: number
  }>
}

export interface PracticeStepContent {
  type: 'practice'
  tips: string[]
}

export interface QuizStepContent {
  type: 'quiz'
  questions: Array<{
    id: number
    question: string
    options: string[]
    correct: number
    explanation: string
  }>
  passing_score: number
}

export interface UserLessonProgress {
  id: string
  user_id: string
  lesson_id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
  progress_percentage: number
  time_spent_minutes: number
  attempts_count: number
  best_score: number | null
  last_accessed_at: string | null
  completed_at: string | null
  current_step?: number
}