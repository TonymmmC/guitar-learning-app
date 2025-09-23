// src/lib/admin/userService.ts - CORREGIDO CONSTRAINTS
import { supabase } from '../supabase/client'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: 'student' | 'content_admin' | 'support_admin' | 'superadmin'
  subscription_status: 'free' | 'premium'
  language: 'es' | 'en'
  notation_preference: 'spanish' | 'english'
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateUserData {
  email: string
  password: string
  full_name?: string
  role?: 'student' | 'content_admin' | 'support_admin'
  language?: 'es' | 'en'
  notation_preference?: 'spanish' | 'english'
}

export interface UpdateUserData {
  full_name?: string
  role?: 'student' | 'content_admin' | 'support_admin' | 'superadmin'
  subscription_status?: 'free' | 'premium'
  language?: 'es' | 'en'
  notation_preference?: 'spanish' | 'english'
}

// Mapeo de roles válidos en la DB
const VALID_ROLES = ['student', 'content_admin', 'support_admin', 'superadmin']

class UserService {
  async updateUser(id: string, userData: UpdateUserData): Promise<{ data: User | null; error: string | null }> {
    try {
      // Validar role si está presente
      if (userData.role && !VALID_ROLES.includes(userData.role)) {
        return { data: null, error: 'Rol inválido' }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { data: null, error: 'Error al actualizar usuario' }
      }

      return { data: data as User, error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  async createUser(userData: CreateUserData): Promise<{ data: User | null; error: string | null }> {
    try {
      const role = userData.role || 'student'
      if (!VALID_ROLES.includes(role)) {
        return { data: null, error: 'Rol inválido' }
      }

      // Usar API route para no afectar sesión actual
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        return { data: null, error: 'No hay sesión admin' }
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(userData)
      })

      const result = await response.json()

      if (!response.ok) {
        return { data: null, error: result.error || 'Error creando usuario' }
      }

      return { data: result.data as User, error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  async getAllUsers(): Promise<{ data: User[] | null; error: string | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    return error ? { data: null, error: 'Error cargando usuarios' } : { data: data as User[], error: null }
  }

  async deleteUser(id: string): Promise<{ error: string | null }> {
    const { data: user } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', id)
      .single()

    if (user?.role === 'superadmin') {
      return { error: 'No se puede eliminar superadmin' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    return { error: error ? 'Error eliminando usuario' : null }
  }

  async restoreUser(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        deleted_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    return { error: error ? 'Error restaurando usuario' : null }
  }

  async getDeletedUsers(): Promise<{ data: User[] | null; error: string | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    return error ? { data: null, error: 'Error cargando eliminados' } : { data: data as User[], error: null }
  }

  async changeUserRole(id: string, newRole: string): Promise<{ error: string | null }> {
    if (!VALID_ROLES.includes(newRole)) {
      return { error: 'Rol inválido' }
    }
    
    const result = await this.updateUser(id, { role: newRole as any })
    return { error: result.error }
  }

  async getUserStats() {
    const { data: users } = await this.getAllUsers()
    if (!users) return { totalUsers: 0, students: 0, contentAdmins: 0, supportAdmins: 0, superadmins: 0, premiumUsers: 0 }
    
    return {
      totalUsers: users.length,
      students: users.filter(u => u.role === 'student').length,
      contentAdmins: users.filter(u => u.role === 'content_admin').length,
      supportAdmins: users.filter(u => u.role === 'support_admin').length,
      superadmins: users.filter(u => u.role === 'superadmin').length,
      premiumUsers: users.filter(u => u.subscription_status === 'premium').length
    }
  }
}

export const userService = new UserService()