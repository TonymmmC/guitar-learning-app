// src/app/page.tsx
'use client'

import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import InteractiveGuitar from '@/components/guitar/InteractiveGuitar'

export default function HomePage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user && mounted) {
      router.push('/auth/login')
    }
  }, [isLoading, user, mounted, router])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const goToAdmin = () => {
    router.push('/admin')
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5c9eff]"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-[#e8e8e8]">Redirigiendo...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e8e8e8]">
      {/* Header */}
      <header className="bg-[#111111] border-b border-[rgba(255,255,255,0.06)] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Guitar Learning App</h1>
          <div className="flex items-center gap-4">
            <span className="text-[#a8a8a8] text-sm">
              {user.full_name || user.email} • {user.role}
            </span>
            {user.role !== 'student' && (
              <button
                onClick={goToAdmin}
                className="bg-[#5c9eff] hover:opacity-90 px-4 py-2 rounded-lg transition-opacity text-sm"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[rgba(255,255,255,0.08)] px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome */}
        <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">
            ¡Bienvenido a Guitar Learning!
          </h2>
          <p className="text-[#a8a8a8]">
            Aprende guitarra clásica con tecnología interactiva
          </p>
        </div>

        {/* Interactive Guitar - MAIN FEATURE */}
        <InteractiveGuitar />

        {/* Quick Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 hover:bg-[#1f1f1f] transition-colors">
            <h3 className="text-lg font-semibold mb-3">🎵 Afinador</h3>
            <p className="text-[#a8a8a8] mb-4 text-sm">
              Afina tu guitarra con precisión
            </p>
            <button className="bg-[#00d4aa] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity text-sm">
              Abrir Afinador
            </button>
          </div>

          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 hover:bg-[#1f1f1f] transition-colors">
            <h3 className="text-lg font-semibold mb-3">📚 Lecciones</h3>
            <p className="text-[#a8a8a8] mb-4 text-sm">
              Progresa con lecciones estructuradas
            </p>
            <button className="bg-[#ff8a50] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity text-sm">
              Ver Lecciones
            </button>
          </div>

          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 hover:bg-[#1f1f1f] transition-colors">
            <h3 className="text-lg font-semibold mb-3">🎼 Acordes</h3>
            <p className="text-[#a8a8a8] mb-4 text-sm">
              Diccionario de acordes interactivo
            </p>
            <button className="bg-[#5c9eff] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity text-sm">
              Explorar
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Tu Progreso</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[#a8a8a8] text-sm">Conocer las cuerdas</span>
                <span className="text-[#6b6b6b] text-sm">0%</span>
              </div>
              <div className="bg-[#242424] rounded-full h-2">
                <div className="bg-[#5c9eff] h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[#a8a8a8] text-sm">Primeros acordes</span>
                <span className="text-[#6b6b6b] text-sm">0%</span>
              </div>
              <div className="bg-[#242424] rounded-full h-2">
                <div className="bg-[#00d4aa] h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}