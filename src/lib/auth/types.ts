// src/lib/auth/types.ts
export type UserRole = 'student' | 'admin'
export type SubscriptionStatus = 'free' | 'premium'
export type Language = 'es' | 'en'
export type NotationPreference = 'spanish' | 'english'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  subscription_status: SubscriptionStatus
  language: Language
  notation_preference: NotationPreference
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name?: string
  language?: Language
  notation_preference?: NotationPreference
}

export interface AuthError {
  message: string
  type: 'validation' | 'auth' | 'network' | 'unknown'
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: AuthError | null
}

// Database profile interface (matches Supabase table)
export interface Profile {
  id: string
  email: string
  role: UserRole
  subscription_status: SubscriptionStatus
  language: Language
  notation_preference: NotationPreference
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}