// src/lib/auth/rbac.ts
import React from 'react'
import { useAuth } from './context'
import type { AuthUser } from './types'

// Roles específicos del dominio
export type UserRole = 
  | 'student'           // Estudiante de guitarra
  | 'content_admin'     // Músico/profesor que crea contenido
  | 'support_admin'     // Soporte técnico y asistencia
  | 'superadmin'        // Control total del sistema

// Permisos granulares
export type Permission = 
  // Gestión de usuarios
  | 'users.read' | 'users.write' | 'users.delete'
  // Contenido educativo
  | 'lessons.read' | 'lessons.write' | 'lessons.delete'
  | 'exercises.read' | 'exercises.write' | 'exercises.delete'
  // Análisis y métricas
  | 'analytics.student_progress' 
  | 'analytics.content_performance' 
  | 'analytics.system'
  // Soporte técnico
  | 'support.tickets' | 'support.user_assistance'
  // Sistema
  | 'system.settings' | 'system.billing' | 'system.logs'

// Configuración de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [
    // Los estudiantes solo ven su propio contenido
    // Los permisos se manejan a nivel de RLS en la DB
  ],
  
  content_admin: [
    'lessons.read', 'lessons.write', 'lessons.delete',
    'exercises.read', 'exercises.write', 'exercises.delete',
    'analytics.content_performance', // Ve rendimiento de sus lecciones
    'users.read' // Ve estudiantes para entender progreso
  ],
  
  support_admin: [
    'users.read', 'users.write', // Puede ayudar y editar usuarios
    'support.tickets', 'support.user_assistance',
    'analytics.student_progress', // Para diagnosticar problemas
    'lessons.read', 'exercises.read' // Ve contenido para asistir mejor
  ],
  
  superadmin: [
    // Acceso completo
    'users.read', 'users.write', 'users.delete',
    'lessons.read', 'lessons.write', 'lessons.delete',
    'exercises.read', 'exercises.write', 'exercises.delete',
    'analytics.student_progress', 'analytics.content_performance', 'analytics.system',
    'support.tickets', 'support.user_assistance',
    'system.settings', 'system.billing', 'system.logs'
  ]
}

// Helper para obtener permisos de un rol
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

// Helper para verificar si un rol tiene un permiso específico
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return getRolePermissions(role).includes(permission)
}

// Hook para usar en componentes
export function usePermissions() {
  const { user } = useAuth()
  
  const userPermissions = user ? getRolePermissions(user.role as UserRole) : []
  
  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission)
  }
  
  const canRead = (resource: string): boolean => {
    return hasPermission(`${resource}.read` as Permission)
  }
  
  const canWrite = (resource: string): boolean => {
    return hasPermission(`${resource}.write` as Permission)
  }
  
  const canDelete = (resource: string): boolean => {
    return hasPermission(`${resource}.delete` as Permission)
  }
  
  const canAccess = (section: string): boolean => {
    // Lógica para secciones completas
    switch (section) {
      case 'admin_panel':
        return user?.role !== 'student'
      case 'content_management':
        return hasPermission('lessons.write') || hasPermission('exercises.write')
      case 'user_management':
        return hasPermission('users.read')
      case 'system_settings':
        return hasPermission('system.settings')
      default:
        return false
    }
  }
  
  return {
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    canAccess,
    userRole: user?.role || 'student',
    isAdmin: user?.role !== 'student',
    isSuperAdmin: user?.role === 'superadmin'
  }
}

// Componente para proteger rutas/secciones
interface ProtectedSectionProps {
  permission?: Permission
  section?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function ProtectedSection({ 
  permission, 
  section, 
  fallback = null, 
  children 
}: ProtectedSectionProps) {
  const { hasPermission, canAccess } = usePermissions()
  
  const hasAccess = permission 
    ? hasPermission(permission)
    : section 
    ? canAccess(section)
    : false
  
  if (!hasAccess) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Tipos para el usuario extendido
export interface AuthUserWithPermissions extends AuthUser {
  role: UserRole
  permissions: Permission[]
}

// Helper para crear el usuario con permisos
export function createUserWithPermissions(user: AuthUser): AuthUserWithPermissions {
  return {
    ...user,
    permissions: getRolePermissions(user.role as UserRole)
  }
}