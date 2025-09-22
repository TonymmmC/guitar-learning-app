// src/lib/auth/service.ts
import { supabase } from '@/lib/supabase/client'

export interface AuthUser {
  id: string
  email: string
  role: string
  full_name?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name?: string
}

export interface AuthError {
  message: string
  type: string
}

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
      // Por ahora retornamos un perfil básico
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      return {
        id: user.id,
        email: user.email || '',
        role: 'student',
        full_name: user.user_metadata?.full_name
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