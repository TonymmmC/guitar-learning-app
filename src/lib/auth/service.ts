// src/lib/auth/service.ts
import { supabase } from '../supabase/client'
import type { 
  AuthUser, 
  LoginCredentials, 
  RegisterData, 
  AuthError,
  UserRole,
  SubscriptionStatus,
  Language,
  NotationPreference
} from './types'

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return {
          user: null,
          error: {
            message: this.getErrorMessage(error.message),
            type: 'auth'
          }
        }
      }

      if (data.user) {
        const profile = await this.getProfile(data.user.id)
        return { user: profile, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      return {
        user: null,
        error: {
          message: 'Error de conexión. Intenta nuevamente.',
          type: 'network'
        }
      }
    }
  }

  async register(userData: RegisterData): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name || '',
          }
        }
      })

      if (error) {
        return {
          user: null,
          error: {
            message: this.getErrorMessage(error.message),
            type: 'auth'
          }
        }
      }

      // Si el usuario se creó pero necesita confirmación
      if (data.user && !data.session) {
        return {
          user: null,
          error: null // Sin error, registro exitoso
        }
      }

      // Si el usuario se creó y tiene sesión activa
      if (data.user && data.session) {
        const profile = await this.getProfile(data.user.id)
        return { user: profile, error: null }
      }

      // Registro exitoso en cualquier caso
      return { user: null, error: null }
    } catch (error) {
      return {
        user: null,
        error: {
          message: 'Error de conexión. Intenta nuevamente.',
          type: 'network'
        }
      }
    }
  }

  async logout(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return {
          error: {
            message: 'Error al cerrar sesión',
            type: 'auth'
          }
        }
      }

      return { error: null }
    } catch (error) {
      return {
        error: {
          message: 'Error de conexión',
          type: 'network'
        }
      }
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null
      
      return await this.getProfile(user.id)
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  private async getProfile(userId: string): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Obtener perfil de la tabla profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      console.error('Error getting profile:', error)
      
      // Fallback: retornar perfil básico si no existe en profiles
      return {
        id: user.id,
        email: user.email || '',
        role: 'student' as UserRole,
        subscription_status: 'free' as SubscriptionStatus,
        language: 'es' as Language,
        notation_preference: 'spanish' as NotationPreference,
        full_name: user.user_metadata?.full_name,
        avatar_url: undefined,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      }
    }

    // Retornar el perfil de la base de datos
    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      subscription_status: profile.subscription_status as SubscriptionStatus,
      language: profile.language as Language,
      notation_preference: profile.notation_preference as NotationPreference,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }
  } catch (error) {
    console.error('Error in getProfile:', error)
    return null
  }
}

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getProfile(session.user.id)
        callback(profile)
      } else {
        callback(null)
      }
    })
  }

  private getErrorMessage(error: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Email o contraseña incorrectos',
      'Email not confirmed': 'Verifica tu email antes de continuar',
      'User already registered': 'Este email ya está registrado'
    }

    return errorMap[error] || 'Ha ocurrido un error. Intenta nuevamente.'
  }
}

export const authService = new AuthService()