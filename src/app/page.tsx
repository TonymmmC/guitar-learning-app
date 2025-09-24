'use client'

import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import InteractiveGuitar from '@/components/guitar/InteractiveGuitar'
import { User, Settings, LogOut, Mic, Target, ChevronDown, BookOpen, Play } from 'lucide-react'
import Image from 'next/image'

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
    window.location.href = '/auth/login'
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
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#5c9eff] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="text-lg font-medium text-[#e8e8e8]">GuitarSL</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 text-[#e8e8e8] bg-[#1a1a1a] rounded-lg"
                >
                  Inicio
                </button>
                <button
                  onClick={() => router.push('/lessons')}
                  className="px-4 py-2 text-[#a8a8a8] hover:text-[#e8e8e8] hover:bg-[#1a1a1a] rounded-lg transition-colors"
                >
                  Lecciones
                </button>
              </nav>
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
                      onClick={() => {
                        router.push('/lessons')
                        setUserMenuOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#a8a8a8] hover:text-[#e8e8e8] hover:bg-[#1f1f1f] transition-colors flex items-center space-x-2 md:hidden"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Lecciones</span>
                    </button>
                    
                    <button className="w-full px-4 py-2 text-left text-sm text-[#a8a8a8] hover:text-[#e8e8e8] hover:bg-[#1f1f1f] transition-colors flex items-center space-x-2">
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

      {/* Hero Section con imagen */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/guitarpage.jpg"
            alt="Guitarra clásica"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Overlay gradiente para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/60" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Aprende a tocar guitarra
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light leading-relaxed">
            Domina el diapasón con herramientas interactivas y audio en tiempo real
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/lessons')}
              className="bg-[#5c9eff] hover:bg-[#4a8ce8] text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center space-x-3 justify-center shadow-lg"
            >
              <Play className="w-5 h-5" />
              <span>Comenzar ahora</span>
            </button>
            
            <button
              onClick={() => document.getElementById('interactive-guitar')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:bg-white/10"
            >
              Explorar herramientas
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Guitarra interactiva */}
        <div id="interactive-guitar" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[#e8e8e8]">
              Guitarra Interactiva
            </h2>
            <p className="text-[#a8a8a8] max-w-2xl mx-auto">
              Explora el diapasón, aprende las notas y escucha cómo suena cada cuerda
            </p>
          </div>
          <InteractiveGuitar />
        </div>

        {/* Herramientas futuras - más compacto */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[#e8e8e8]">Próximas herramientas</h2>
            <p className="text-[#a8a8a8]">Funciones que estamos desarrollando para ti</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 opacity-70">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#ff8a50]/20 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-[#ff8a50]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#e8e8e8]">Afinador inteligente</h3>
                  <p className="text-xs text-[#ff8a50]">En desarrollo</p>
                </div>
              </div>
              <p className="text-[#a8a8a8] text-sm">
                Afinación precisa con detección de audio en tiempo real
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 opacity-70">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#00d4aa]/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#00d4aa]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#e8e8e8]">Biblioteca de acordes</h3>
                  <p className="text-xs text-[#ff8a50]">Planificado</p>
                </div>
              </div>
              <p className="text-[#a8a8a8] text-sm">
                Diccionario interactivo con patrones de digitación
              </p>
            </div>
          </div>
        </div>

        {/* Stats de desarrollo - más visual */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#242424] border border-[rgba(255,255,255,0.08)] rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-[#e8e8e8] mb-2">Estado del proyecto</h2>
            <p className="text-[#6b6b6b] text-sm">Desarrollo transparente y continuo</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00d4aa]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-[#00d4aa] rounded-full" />
              </div>
              <h3 className="font-medium text-[#00d4aa] mb-2">Completado</h3>
              <ul className="text-sm text-[#a8a8a8] space-y-1">
                <li>Sistema de usuarios</li>
                <li>Guitarra interactiva</li>
                <li>Audio síntesis</li>
                <li>Sistema de lecciones</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#ff8a50]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-[#ff8a50] rounded-full animate-pulse" />
              </div>
              <h3 className="font-medium text-[#ff8a50] mb-2">En desarrollo</h3>
              <ul className="text-sm text-[#a8a8a8] space-y-1">
                <li>Detección de audio</li>
                <li>Seguimiento de progreso</li>
                <li>Más lecciones</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#6b6b6b]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-[#6b6b6b] rounded-full" />
              </div>
              <h3 className="font-medium text-[#6b6b6b] mb-2">Planificado</h3>
              <ul className="text-sm text-[#a8a8a8] space-y-1">
                <li>Reconocimiento de acordes</li>
                <li>Análisis de rendimiento</li>
                <li>Exportar progreso</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Click outside menu */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  )
}