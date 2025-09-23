// src/lib/auth/context.tsx - FIXED HYDRATION
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/lib/auth/service'
import type { 
  AuthUser, 
  AuthError, 
  LoginCredentials, 
  RegisterData 
} from '@/lib/auth/types'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: AuthError | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  const isAuthenticated = !!user

  useEffect(() => {
    console.log('🔍 AuthProvider: Iniciando - VERSIÓN SIMPLIFICADA...')
    
    const initializeAuth = async () => {
      try {
        console.log('🔍 AuthProvider: Verificando variables de entorno...')
        
        // Verificar variables de entorno
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
          console.error('❌ NEXT_PUBLIC_SUPABASE_URL no encontrada')
          throw new Error('Variables de entorno faltantes')
        }
        
        if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no encontrada')
          throw new Error('Variables de entorno faltantes')
        }
        
        console.log('✅ Variables de entorno OK')
        console.log('🔍 AuthProvider: Obteniendo usuario actual...')
        
        const currentUser = await authService.getCurrentUser()
        console.log('🔍 Usuario obtenido:', currentUser ? `${currentUser.email} (${currentUser.role})` : 'null')
        
        setUser(currentUser)
        console.log('✅ Auth inicializada correctamente')
      } catch (error) {
        console.error('❌ Error initializing auth:', error)
        setError({
          message: 'Error al cargar la sesión',
          type: 'network'
        })
      } finally {
        console.log('🔍 AuthProvider: Finalizando loading...')
        setIsLoading(false)
      }
    }

    // Inicializar inmediatamente
    initializeAuth()

    // Escuchar cambios de auth
    console.log('🔍 AuthProvider: Configurando listener...')
    const { data: { subscription } } = authService.onAuthStateChange((user: AuthUser | null) => {
      console.log('🔍 Auth state change:', user ? `${user.email} (${user.role})` : 'null')
      setUser(user)
      setIsLoading(false)
    })

    return () => {
      console.log('🔍 AuthProvider: Limpiando subscription...')
      subscription.unsubscribe()
    }
  }, [])

  // Log cuando cambie el estado
  useEffect(() => {
    console.log('🔍 Estado actual:', { 
      userEmail: user?.email, 
      userRole: user?.role,
      isLoading, 
      isAuthenticated 
    })
  }, [user, isLoading, isAuthenticated])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      console.log('🔍 AuthProvider: Iniciando login para:', credentials.email)
      setIsLoading(true)
      setError(null)

      const { user: loggedUser, error: loginError } = await authService.login(credentials)

      if (loginError) {
        console.error('❌ Login error:', loginError)
        setError(loginError)
        return false
      }

      if (loggedUser) {
        console.log('✅ Login exitoso:', loggedUser.email, loggedUser.role)
        setUser(loggedUser)
        return true
      }

      return false
    } catch (error) {
      console.error('❌ Unexpected login error:', error)
      setError({
        message: 'Error inesperado al iniciar sesión',
        type: 'unknown'
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('🔍 AuthProvider: Iniciando registro para:', userData.email)
      setIsLoading(true)
      setError(null)

      const { user: newUser, error: registerError } = await authService.register(userData)

      if (registerError) {
        console.error('❌ Register error:', registerError)
        setError(registerError)
        return false
      }

      console.log('✅ Registro exitoso')
      return true
    } catch (error) {
      console.error('❌ Unexpected register error:', error)
      setError({
        message: 'Error inesperado al registrarse',
        type: 'unknown'
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      console.log('🔍 AuthProvider: Cerrando sesión...')
      setIsLoading(true)
      
      const { error: logoutError } = await authService.logout()
      
      if (logoutError) {
        console.error('❌ Logout error:', logoutError)
        setError(logoutError)
      } else {
        console.log('✅ Logout exitoso')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Unexpected logout error:', error)
      setError({
        message: 'Error al cerrar sesión',
        type: 'unknown'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = (): void => {
    setError(null)
  }

  const refreshUser = async (): Promise<void> => {
    try {
      console.log('🔍 AuthProvider: Refrescando usuario...')
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('❌ Error refreshing user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser
  }

  // ✅ REMOVIDO: El bloqueo de "mounted" que causaba el problema
  // Ahora renderiza inmediatamente y maneja el loading con isLoading

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  
  return context
}