// src/lib/auth/context.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from './service'
import type { AuthUser, AuthError, LoginCredentials, RegisterData } from './types'

interface AuthContextType {
  // Estado
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: AuthError | null

  // Acciones
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

  // Inicializar usuario al cargar la app
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setError({
          message: 'Error al cargar la sesión',
          type: 'network'
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Escuchar cambios de auth
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

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

      if (newUser) {
        setUser(newUser)
        return true
      }

      return false
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  
  return context
}