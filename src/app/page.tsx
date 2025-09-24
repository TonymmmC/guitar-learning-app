// src/app/page.tsx - PÁGINA PRINCIPAL COMPLETA
'use client'

import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import InteractiveGuitar from '@/components/guitar/InteractiveGuitar'
import { User, Settings, LogOut, Mic, Target, ChevronDown } from 'lucide-react'

export default function HomePage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
      <header className="bg-[#111111] border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg border border-[rgba(255,255,255,0.08)]"></div>
              <span className="text-lg font-medium text-[#e8e8e8]">GuitarSL</span>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 hover:bg-[#1f1f1f] transition-colors"
              >
                <div className="w-8 h-8 bg-[#242424] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-[#a8a8a8]" />
                </div>
                <span className="text-sm text-[#a8a8a8]">
                  {user.full_name || user.email.split('@')[0]}
                </span>
                <ChevronDown className="w-4 h-4 text-[#6b6b6b]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.06)]">
                      <p className="text-sm text-[#e8e8e8] font-medium">{user.full_name || 'Usuario'}</p>
                      <p className="text-xs text-[#6b6b6b]">{user.email}</p>
                    </div>
                    
                    {user.role !== 'student' && (
                      <button
                        onClick={() => {
                          router.push('/admin')
                          setUserMenuOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-[#a8a8a8] hover:text-[#e8e8e8] hover:bg-[#1f1f1f] transition-colors flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Administración</span>
                      </button>
                    )}
                    
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-[#a8a8a8] hover:text-[#e8e8e8] hover:bg-[#1f1f1f] transition-colors flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configuración</span>
                    </button>
                    
                    <div className="border-t border-[rgba(255,255,255,0.06)] mt-2 pt-2">
                      <button
                        onClick={() => {
                          handleLogout()
                          setUserMenuOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-[#a8a8a8] hover:text-[#e8e8e8] hover:bg-[#1f1f1f] transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-medium mb-3 text-[#e8e8e8]">
            Panel principal
          </h1>
          <p className="text-[#a8a8a8] leading-relaxed">
            Aprende guitarra con herramientas interactivas y seguimiento de progreso
          </p>
        </div>

        {/* Guitarra interactiva */}
        <div className="mb-12">
          <InteractiveGuitar />
        </div>

        {/* Herramientas */}
        <div className="mb-12">
          <h2 className="text-xl font-medium mb-6 text-[#e8e8e8]">Herramientas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Afinador */}
            <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 opacity-60">
              <div className="flex items-center justify-between mb-4">
                <Mic className="w-6 h-6 text-[#6b6b6b]" />
                <span className="text-xs text-[#ff8a50] bg-[#ff8a50]/10 px-2 py-1 rounded">Desarrollo</span>
              </div>
              
              <h3 className="text-lg font-medium mb-2 text-[#e8e8e8]">Afinador</h3>
              <p className="text-[#a8a8a8] text-sm mb-6 leading-relaxed">
                Afinación precisa con detección de audio en tiempo real
              </p>
              
              <button 
                disabled
                className="w-full bg-[#242424] text-[#6b6b6b] font-medium py-2.5 rounded-lg cursor-not-allowed"
              >
                Próximamente
              </button>
            </div>

            {/* Acordes */}
            <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 opacity-60">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-6 h-6 text-[#6b6b6b]" />
                <span className="text-xs text-[#ff8a50] bg-[#ff8a50]/10 px-2 py-1 rounded">Desarrollo</span>
              </div>
              
              <h3 className="text-lg font-medium mb-2 text-[#e8e8e8]">Biblioteca de acordes</h3>
              <p className="text-[#a8a8a8] text-sm mb-6 leading-relaxed">
                Diccionario interactivo con patrones de digitación
              </p>
              
              <button 
                disabled
                className="w-full bg-[#242424] text-[#6b6b6b] font-medium py-2.5 rounded-lg cursor-not-allowed"
              >
                Próximamente
              </button>
            </div>
          </div>
        </div>

        {/* Estado del desarrollo */}
        <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4 text-[#e8e8e8]">Estado del desarrollo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#00d4aa]"></div>
                <span className="text-sm font-medium text-[#00d4aa]">Completado</span>
              </div>
              <ul className="space-y-1 text-sm text-[#a8a8a8] ml-4">
                <li>Sistema de usuarios</li>
                <li>Guitarra interactiva</li>
                <li>Audio síntesis</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#ff8a50]"></div>
                <span className="text-sm font-medium text-[#ff8a50]">En desarrollo</span>
              </div>
              <ul className="space-y-1 text-sm text-[#a8a8a8] ml-4">
                <li>Sistema de lecciones</li>
                <li>Detección de audio</li>
                <li>Seguimiento de progreso</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#6b6b6b]"></div>
                <span className="text-sm font-medium text-[#6b6b6b]">Planificado</span>
              </div>
              <ul className="space-y-1 text-sm text-[#a8a8a8] ml-4">
                <li>Reconocimiento de acordes</li>
                <li>Análisis de rendimiento</li>
                <li>Exportar progreso</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Click outside to close menu */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  )
}