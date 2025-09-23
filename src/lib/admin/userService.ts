// src/lib/admin/userService.ts - CORREGIDO
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

class UserService {
  // ... otros métodos igual ...

  // 🎯 MÉTODO UPDATE CORREGIDO - sin .single() problemático
  async updateUser(id: string, userData: UpdateUserData): Promise<{ data: User | null; error: string | null }> {
    try {
      console.log('🔍 Actualizando usuario:', id, userData)
      
      const updateData = {
        ...userData,
        updated_at: new Date().toISOString()
      }
      
      // Limpiar campos undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData]
        }
      })
      
      console.log('📝 Datos finales a actualizar:', updateData)
      
      // 🔥 QUERY SIMPLE sin .single() que puede estar causando problemas
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select()

      if (error) {
        console.error('❌ Error completo en update:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        return { data: null, error: `Error al actualizar usuario: ${error.message}` }
      }

      console.log('✅ Usuario actualizado - data recibida:', data)
      
      // Verificar que tenemos datos
      if (!data || data.length === 0) {
        console.error('❌ No se devolvió ningún registro actualizado')
        return { data: null, error: 'No se pudo actualizar el usuario - registro no encontrado' }
      }

      // Tomar el primer elemento si hay múltiples
      const updatedUser = Array.isArray(data) ? data[0] : data
      console.log('✅ Usuario actualizado exitosamente:', updatedUser)
      
      return { data: updatedUser as User, error: null }
    } catch (error) {
      console.error('❌ Error inesperado completo:', error)
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      return { data: null, error: `Error inesperado: ${errorMessage}` }
    }
  }

  // 🎯 MÉTODO CREATE usando API route (SIN afectar sesión actual)
  async createUser(userData: CreateUserData): Promise<{ data: User | null; error: string | null }> {
    try {
      console.log('🔍 Creando usuario via API:', userData.email)
      
      // Obtener token actual para autenticarse con la API
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        return { data: null, error: 'No hay sesión activa' }
      }

      // Llamar a nuestra API route
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
        console.error('❌ Error en API:', result.error)
        return { data: null, error: result.error || 'Error al crear usuario' }
      }

      console.log('✅ Usuario creado via API:', result.data)
      return { data: result.data as User, error: null }
    } catch (error) {
      console.error('❌ Error inesperado llamando API:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado'
      return { data: null, error: errorMessage }
    }
  }

  // ... resto de métodos igual ...

  async getAllUsers(): Promise<{ data: User[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        return { data: null, error: 'Error al cargar usuarios' }
      }

      return { data: data as User[], error: null }
    } catch (error) {
      console.error('Unexpected error:', error)
      return { data: null, error: 'Error inesperado' }
    }
  }

  async getUserById(id: string): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) {
        return { data: null, error: 'Usuario no encontrado' }
      }

      return { data: data as User, error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  async deleteUser(id: string): Promise<{ error: string | null }> {
    try {
      // Verificar que el usuario existe y no es superadmin
      const { data: user, error: fetchError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (fetchError) {
        return { error: 'Usuario no encontrado' }
      }

      if (user.role === 'superadmin') {
        return { error: 'No se puede eliminar un superadmin' }
      }

      // Soft delete
      const { error } = await supabase
        .from('profiles')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        return { error: 'Error al eliminar usuario' }
      }

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado'
      return { error: errorMessage }
    }
  }

  async restoreUser(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        return { error: 'Error al restaurar usuario' }
      }

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado'
      return { error: errorMessage }
    }
  }

  async changeUserRole(id: string, newRole: 'student' | 'content_admin' | 'support_admin' | 'superadmin'): Promise<{ error: string | null }> {
    const result = await this.updateUser(id, { role: newRole })
    return { error: result.error }
  }

  async getUserStats(): Promise<{
    totalUsers: number
    students: number
    contentAdmins: number
    supportAdmins: number
    superadmins: number
    premiumUsers: number
  }> {
    try {
      const { data: users } = await this.getAllUsers()
      
      if (!users) {
        return {
          totalUsers: 0,
          students: 0,
          contentAdmins: 0,
          supportAdmins: 0,
          superadmins: 0,
          premiumUsers: 0
        }
      }

      return {
        totalUsers: users.length,
        students: users.filter(u => u.role === 'student').length,
        contentAdmins: users.filter(u => u.role === 'content_admin').length,
        supportAdmins: users.filter(u => u.role === 'support_admin').length,
        superadmins: users.filter(u => u.role === 'superadmin').length,
        premiumUsers: users.filter(u => u.subscription_status === 'premium').length
      }
    } catch (error) {
      return {
        totalUsers: 0,
        students: 0,
        contentAdmins: 0,
        supportAdmins: 0,
        superadmins: 0,
        premiumUsers: 0
      }
    }
  }

  async searchUsers(query: string, role?: string): Promise<{ data: User[] | null; error: string | null }> {
    try {
      let queryBuilder = supabase
        .from('profiles')
        .select('*')
        .is('deleted_at', null)
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)

      if (role && role !== 'all') {
        queryBuilder = queryBuilder.eq('role', role)
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: 'Error en la búsqueda' }
      }

      return { data: data as User[], error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  async getDeletedUsers(): Promise<{ data: User[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })

      if (error) {
        return { data: null, error: 'Error al cargar usuarios eliminados' }
      }

      return { data: data as User[], error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  async searchDeletedUsers(query: string): Promise<{ data: User[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('deleted_at', 'is', null)
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .order('deleted_at', { ascending: false })

      if (error) {
        return { data: null, error: 'Error en la búsqueda' }
      }

      return { data: data as User[], error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }
}

export const userService = new UserService()