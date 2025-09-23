'use client'

import { useAuth } from '@/lib/auth/context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  Activity,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Simplificamos la lógica - solo verificamos si es admin directamente
  const isAdmin = user?.role && user.role !== 'student'

  useEffect(() => {
    // Solo redirigir cuando estemos seguros de que no es admin
    if (!isLoading && user && !isAdmin) {
      console.log('User role:', user.role, 'Redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [isLoading, user, isAdmin, router])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  // Estado de carga mejorado
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5c9eff] mb-4"></div>
          <div className="text-[#e8e8e8]">Cargando...</div>
        </div>
      </div>
    )
  }

  // Si no hay usuario, el middleware debería haber redirigido
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#e8e8e8] mb-4">Sin autenticación</h1>
          <p className="text-[#a8a8a8] mb-6">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Si no es admin, mostrar acceso denegado pero permitir que el useEffect redirija
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#e8e8e8] mb-4">Acceso Denegado</h1>
          <p className="text-[#a8a8a8] mb-6">
            Tu rol: {user.role} - Solo administradores pueden acceder
          </p>
          <p className="text-[#6b6b6b] mb-4">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Navegación simplificada basada en rol directo
  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: pathname === '/admin',
      show: true
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: Users,
      current: pathname.startsWith('/admin/users'),
      show: ['superadmin', 'support_admin'].includes(user.role)
    },
    {
      name: 'Lecciones',
      href: '/admin/lessons',
      icon: BookOpen,
      current: pathname.startsWith('/admin/lessons'),
      show: ['superadmin', 'content_admin'].includes(user.role)
    },
    {
      name: 'Actividad',
      href: '/admin/activity',
      icon: Activity,
      current: pathname.startsWith('/admin/activity'),
      show: user.role === 'superadmin'
    },
    {
      name: 'Configuración',
      href: '/admin/settings',
      icon: Settings,
      current: pathname.startsWith('/admin/settings'),
      show: user.role === 'superadmin'
    }
  ].filter(item => item.show)

  return (
    <div className="h-screen flex bg-[#0f0f0f] text-[#e8e8e8]">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-[rgba(255,255,255,0.06)] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Header del sidebar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#5c9eff] rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">GA</span>
            </div>
            <span className="font-semibold text-[#e8e8e8]">Guitar Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#a8a8a8] hover:text-[#e8e8e8]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href)
                  setSidebarOpen(false)
                }}
                className={`${
                  item.current
                    ? 'bg-[#5c9eff] text-white'
                    : 'text-[#a8a8a8] hover:text-[#e8e8e8] hover:bg-[#1a1a1a]'
                } group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            )
          })}
        </nav>

        {/* Usuario en sidebar */}
        <div className="border-t border-[rgba(255,255,255,0.06)] p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center mr-3">
              <User className="w-4 h-4 text-[#a8a8a8]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e8e8e8] truncate">
                {user?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-[#6b6b6b] truncate">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-[#a8a8a8] hover:text-[#e8e8e8] hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header principal */}
        <header className="bg-[#111111] border-b border-[rgba(255,255,255,0.06)] h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#a8a8a8] hover:text-[#e8e8e8] mr-4"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-[#e8e8e8]">
              {navigation.find(item => item.current)?.name || 'Panel de Administración'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-[#6b6b6b]">
              Rol: {user.role}
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[rgba(255,255,255,0.08)] px-4 py-2 rounded-lg text-[#e8e8e8] transition-colors text-sm"
            >
              Ver App
            </button>
          </div>
        </header>

        {/* Área de contenido */}
        <main className="flex-1 overflow-auto bg-[#0f0f0f] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}