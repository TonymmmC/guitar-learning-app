// src/lib/auth/context.tsx - IMPORTS CORREGIDOS
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/lib/auth/service'  // ✅ Ruta absoluta
import type { 
  AuthUser, 
  AuthError, 
  LoginCredentials, 
  RegisterData 
} from '@/lib/auth/types'  // ✅ Ruta absoluta

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
  const [mounted, setMounted] = useState(false)

  const isAuthenticated = !!user

  useEffect(() => {
    console.log('🔍 AuthProvider: Iniciando...')
    setMounted(true)
    
    const initializeAuth = async () => {
      try {
        console.log('🔍 AuthProvider: Iniciando auth...')
        setIsLoading(true)
        
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
        
        const currentUser = await authService.getCurrentUser()
        console.log('🔍 Usuario actual:', currentUser)
        
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

    initializeAuth()

    // Escuchar cambios de auth
    console.log('🔍 AuthProvider: Configurando listener...')
    const { data: { subscription } } = authService.onAuthStateChange((user: AuthUser | null) => {
      console.log('🔍 Auth state change:', user)
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
    console.log('🔍 Estado actual:', { user: !!user, isLoading, mounted })
  }, [user, isLoading, mounted])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const { user: loggedUser, error: loginError } = await authService.login(credentials)

      if (loginError) {
        setError(loginError)
        return false
      }

      if (loggedUser) {
        setUser(loggedUser)
        return true
      }

      return false
    } catch (error) {
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
      setIsLoading(true)
      setError(null)

      const { user: newUser, error: registerError } = await authService.register(userData)

      if (registerError) {
        setError(registerError)
        return false
      }

      return true
    } catch (error) {
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
      setIsLoading(true)
      
      const { error: logoutError } = await authService.logout()
      
      if (logoutError) {
        setError(logoutError)
      } else {
        setUser(null)
      }
    } catch (error) {
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
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error refreshing user:', error)
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

  // Prevent hydration mismatch - SIMPLIFICADO
  if (!mounted) {
    console.log('🔍 No mounted, mostrando fallback...')
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Inicializando...</div>
      </div>
    )
  }

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