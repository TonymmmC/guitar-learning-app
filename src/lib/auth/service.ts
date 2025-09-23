// src/lib/auth/service.ts - IMPORTS CORREGIDOS
import { supabase } from '@/lib/supabase/client'  // ✅ Ruta absoluta
import type { 
  AuthUser, 
  LoginCredentials, 
  RegisterData, 
  AuthError,
  UserRole,
  SubscriptionStatus,
  Language,
  NotationPreference
} from '@/lib/auth/types'  // ✅ Ruta absoluta

class AuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      console.log('🔍 AuthService: Obteniendo usuario actual...')
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('❌ Error getting auth user:', error)
        return null
      }
      
      if (!user) {
        console.log('🔍 No hay usuario autenticado')
        return null
      }
      
      console.log('✅ Usuario auth encontrado:', user.id)
      return await this.getProfile(user.id)
    } catch (error) {
      console.error('❌ Error getting current user:', error)
      return null
    }
  }

  private async getProfile(userId: string): Promise<AuthUser | null> {
    try {
      console.log('🔍 AuthService: Obteniendo perfil para:', userId)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('❌ No hay usuario auth')
        return null
      }

      // Obtener perfil de la tabla profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('❌ Error getting profile from DB:', error)
        console.log('🔍 Creando perfil fallback...')
        
        // Fallback: retornar perfil básico si no existe en profiles
        const fallbackProfile = {
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
        
        console.log('✅ Perfil fallback creado:', fallbackProfile)
        return fallbackProfile
      }

      if (!profile) {
        console.log('❌ No se encontró perfil en DB')
        return null
      }

      // Retornar el perfil de la base de datos
      const dbProfile = {
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
      
      console.log('✅ Perfil DB encontrado:', dbProfile)
      return dbProfile
    } catch (error) {
      console.error('❌ Error in getProfile:', error)
      return null
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      console.log('🔍 AuthService: Intentando login...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        console.error('❌ Login error:', error)
        return {
          user: null,
          error: {
            message: this.getErrorMessage(error.message),
            type: 'auth'
          }
        }
      }

      if (data.user) {
        console.log('✅ Login exitoso')
        const profile = await this.getProfile(data.user.id)
        return { user: profile, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error('❌ Unexpected login error:', error)
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
      console.log('🔍 AuthService: Intentando registro...')
      
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
        console.error('❌ Register error:', error)
        return {
          user: null,
          error: {
            message: this.getErrorMessage(error.message),
            type: 'auth'
          }
        }
      }

      console.log('✅ Registro exitoso')
      
      // Si el usuario se creó pero necesita confirmación
      if (data.user && !data.session) {
        return { user: null, error: null }
      }

      // Si el usuario se creó y tiene sesión activa
      if (data.user && data.session) {
        const profile = await this.getProfile(data.user.id)
        return { user: profile, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error('❌ Unexpected register error:', error)
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
      console.log('🔍 AuthService: Cerrando sesión...')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Logout error:', error)
        return {
          error: {
            message: 'Error al cerrar sesión',
            type: 'auth'
          }
        }
      }

      console.log('✅ Logout exitoso')
      return { error: null }
    } catch (error) {
      console.error('❌ Unexpected logout error:', error)
      return {
        error: {
          message: 'Error de conexión',
          type: 'network'
        }
      }
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    console.log('🔍 AuthService: Configurando auth state listener...')
    
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 Auth state changed:', event, !!session)
      
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