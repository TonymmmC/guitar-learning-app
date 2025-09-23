'use client'

import { useAuth } from '@/lib/auth/context'
import { usePermissions, type Permission } from '@/lib/auth/rbac'
import { userService } from '@/lib/admin/userService'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Users, BookOpen, Activity, TrendingUp, Clock, Shield } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  students: number
  contentAdmins: number
  superadmins: number
  totalLessons: number
  publishedLessons: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Cargar estadísticas reales
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true)
      try {
        const userStats = await userService.getUserStats()
        
        setStats({
          totalUsers: userStats.totalUsers,
          students: userStats.students,
          contentAdmins: userStats.contentAdmins,
          superadmins: userStats.superadmins,
          totalLessons: 0, // TODO: Implementar cuando tengamos lessons API
          publishedLessons: 0 // TODO: Implementar cuando tengamos lessons API
        })
      } catch (error) {
        console.error('Error loading stats:', error)
        // Fallback a datos por defecto
        setStats({
          totalUsers: 0,
          students: 0,
          contentAdmins: 0,
          superadmins: 0,
          totalLessons: 0,
          publishedLessons: 0
        })
      } finally {
        setStatsLoading(false)
      }
    }

    loadStats()
  }, [])

  const quickActions = [
    {
      title: 'Crear Usuario',
      description: 'Agregar nuevo usuario al sistema',
      action: () => router.push('/admin/users?action=create'),
      icon: Users,
      color: 'blue',
      permission: 'users.write' as Permission
    },
    {
      title: 'Nueva Lección',
      description: 'Crear contenido educativo',
      action: () => router.push('/admin/lessons?action=create'),
      icon: BookOpen,
      color: 'green',
      permission: 'lessons.write' as Permission
    },
    {
      title: 'Ver Actividad',
      description: 'Revisar logs del sistema',
      action: () => router.push('/admin/activity'),
      icon: Activity,
      color: 'purple',
      permission: 'analytics.system' as Permission
    }
  ]

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#e8e8e8] mb-2">
              Bienvenido, {user?.full_name || user?.email}
            </h2>
            <p className="text-[#a8a8a8]">
              Panel de administración - Rol: {user?.role}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[#00d4aa]">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Sistema Activo</span>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Usuarios"
          value={statsLoading ? '...' : stats?.totalUsers?.toString() || '0'}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          change="+12%"
          changeType="positive"
        />
        <StatCard
          title="Estudiantes Activos"
          value={statsLoading ? '...' : stats?.students?.toString() || '0'}
          icon={<Users className="w-6 h-6" />}
          color="green"
          change="+8%"
          changeType="positive"
        />
        <StatCard
          title="Total Lecciones"
          value={statsLoading ? '...' : stats?.totalLessons?.toString() || '0'}
          icon={<BookOpen className="w-6 h-6" />}
          color="purple"
          change="0%"
          changeType="neutral"
        />
        <StatCard
          title="Lecciones Publicadas"
          value={statsLoading ? '...' : stats?.publishedLessons?.toString() || '0'}
          icon={<Activity className="w-6 h-6" />}
          color="orange"
          change="0%"
          changeType="neutral"
        />
      </div>

      {/* Acciones rápidas */}
      <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#e8e8e8] mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              {...action}
              enabled={hasPermission(action.permission)}
            />
          ))}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios recientes */}
        <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e8e8e8] mb-4">Usuarios Recientes</h3>
          <div className="space-y-3">
            <UserActivity
              name="Alex Ergueta"
              email="alexergueta@gmail.com"
              action="Registro de cuenta"
              time="Hace 2 horas"
              status="student"
            />
            <UserActivity
              name="Juan Copatiti"
              email="juancopatiti@gmail.com"
              action="Registro de cuenta"
              time="Hace 3 horas"
              status="student"
            />
            <UserActivity
              name="Super Admin"
              email="sadminguitarsl@gmail.com"
              action="Acceso al panel admin"
              time="Hace 5 min"
              status="superadmin"
            />
          </div>
        </div>

        {/* Estadísticas del sistema */}
        <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e8e8e8] mb-4">Estado del Sistema</h3>
          <div className="space-y-4">
            <SystemStatus
              label="Base de Datos"
              status="Conectada"
              statusType="success"
              detail="Supabase operativo"
            />
            <SystemStatus
              label="Autenticación"
              status="Funcionando"
              statusType="success"
              detail="3 usuarios activos"
            />
            <SystemStatus
              label="Contenido"
              status="Sin lecciones"
              statusType="warning"
              detail="Crear contenido inicial"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Componentes auxiliares
interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange'
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

function StatCard({ title, value, icon, color, change, changeType }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-[#5c9eff]/20 text-[#5c9eff]',
    green: 'bg-[#00d4aa]/20 text-[#00d4aa]',
    purple: 'bg-purple-500/20 text-purple-400',
    orange: 'bg-[#ff8a50]/20 text-[#ff8a50]'
  }

  const changeClasses = {
    positive: 'text-[#00d4aa]',
    negative: 'text-red-400',
    neutral: 'text-[#6b6b6b]'
  }

  return (
    <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${changeClasses[changeType]}`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-[#6b6b6b] text-sm">{title}</p>
        <p className="text-2xl font-bold text-[#e8e8e8] mt-1">{value}</p>
      </div>
    </div>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  action: () => void
  icon: React.ComponentType<{ className?: string }>
  color: string
  enabled: boolean
}

function QuickActionCard({ title, description, action, icon: Icon, enabled }: QuickActionCardProps) {
  return (
    <button
      onClick={enabled ? action : undefined}
      disabled={!enabled}
      className={`p-4 rounded-lg border text-left transition-colors ${
        enabled
          ? 'bg-[#1f1f1f] border-[rgba(255,255,255,0.08)] hover:bg-[#242424] cursor-pointer'
          : 'bg-[#161616] border-[rgba(255,255,255,0.04)] opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${enabled ? 'bg-[#5c9eff]/20 text-[#5c9eff]' : 'bg-gray-600/20 text-gray-500'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-medium text-[#e8e8e8] mb-1">{title}</h4>
          <p className="text-sm text-[#a8a8a8]">{description}</p>
        </div>
      </div>
    </button>
  )
}

interface UserActivityProps {
  name: string
  email: string
  action: string
  time: string
  status: string
}

function UserActivity({ name, email, action, time, status }: UserActivityProps) {
  const statusColors = {
    student: 'bg-[#00d4aa]/20 text-[#00d4aa]',
    superadmin: 'bg-[#ff8a50]/20 text-[#ff8a50]',
    content_admin: 'bg-[#5c9eff]/20 text-[#5c9eff]'
  }

  return (
    <div className="flex items-center justify-between p-3 bg-[#1f1f1f] rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#242424] rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-[#a8a8a8]">
            {name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-[#e8e8e8]">{name}</p>
          <p className="text-xs text-[#6b6b6b]">{action}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status as keyof typeof statusColors] || statusColors.student}`}>
          {status}
        </span>
        <p className="text-xs text-[#6b6b6b] mt-1">{time}</p>
      </div>
    </div>
  )
}

interface SystemStatusProps {
  label: string
  status: string
  statusType: 'success' | 'warning' | 'error'
  detail: string
}

function SystemStatus({ label, status, statusType, detail }: SystemStatusProps) {
  const statusColors = {
    success: 'text-[#00d4aa]',
    warning: 'text-[#ff8a50]',
    error: 'text-red-400'
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-[#e8e8e8]">{label}</p>
        <p className="text-xs text-[#6b6b6b]">{detail}</p>
      </div>
      <span className={`text-sm font-medium ${statusColors[statusType]}`}>
        {status}
      </span>
    </div>
  )
}