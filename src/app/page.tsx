'use client'

import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Si está autenticado, enviar al dashboard
        router.push('/dashboard')
      } else {
        // Si no está autenticado, enviar al login
        router.push('/auth/login')
      }
    }
  }, [user, isLoading, router])

  // Mientras decide a dónde redireccionar
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Cargando Guitar Learning App...</p>
      </div>
    </div>
  )
}