'use client'

import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // ✅ TODOS los hooks SIEMPRE en el mismo orden
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ useEffect para redirección - SIEMPRE se ejecuta
  useEffect(() => {
    // Solo redirigir cuando no esté cargando y no haya usuario
    if (!isLoading && !user && mounted) {
      router.push('/auth/login')
    }
  }, [isLoading, user, mounted, router])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  // ✅ Mostrar loading estático hasta que esté mounted
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-white">Cargando...</div>
        </div>
      </div>
    )
  }

  // ✅ Si no hay usuario, mostrar loading (el useEffect se encarga de redirigir)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white">Redirigiendo...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Guitar Learning App</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              Hola, {user?.full_name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">🎸 Guitarra Interactiva</h2>
            <p className="text-gray-400 mb-4">
              Aprende las notas en el diapasón
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              Empezar
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">🎵 Afinador</h2>
            <p className="text-gray-400 mb-4">
              Afina tu guitarra con precisión
            </p>
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
              Abrir Afinador
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">📚 Lecciones</h2>
            <p className="text-gray-400 mb-4">
              Progresa con lecciones estructuradas
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
              Ver Lecciones
            </button>
          </div>
        </div>

        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Tu Progreso</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Conocer las cuerdas</span>
                <span className="text-gray-400">0%</span>
              </div>
              <div className="bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}