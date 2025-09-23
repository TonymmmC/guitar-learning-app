// src/lib/auth/context.tsx - LIMPIO, SIN DEBUG SPAM
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (mounted) {
          setUser(currentUser)
        }
      } catch (error) {
        if (mounted) {
          setError({ message: 'Error al cargar la sesión', type: 'network' })
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = authService.onAuthStateChange((user: AuthUser | null) => {
      if (mounted) {
        setUser(user)
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
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
      setError({ message: 'Error inesperado', type: 'unknown' })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: registerError } = await authService.register(userData)
      
      if (registerError) {
        setError(registerError)
        return false
      }
      return true
    } catch (error) {
      setError({ message: 'Error inesperado', type: 'unknown' })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      setError({ message: 'Error al cerrar sesión', type: 'unknown' })
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)
  
  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      // Silently fail
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      error,
      login,
      register,
      logout,
      clearError,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}