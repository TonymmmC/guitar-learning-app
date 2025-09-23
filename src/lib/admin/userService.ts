// src/lib/admin/userService.ts
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
  // Obtener todos los usuarios
  async getAllUsers(): Promise<{ data: User[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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

  // Obtener un usuario por ID
  async getUserById(id: string): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching user:', error)
        return { data: null, error: 'Usuario no encontrado' }
      }

      return { data: data as User, error: null }
    } catch (error) {
      console.error('Unexpected error:', error)
      return { data: null, error: 'Error inesperado' }
    }
  }

  // Crear nuevo usuario (solo para superadmin)
  async createUser(userData: CreateUserData): Promise<{ data: User | null; error: string | null }> {
    try {
      // 1. Crear usuario en auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          full_name: userData.full_name
        }
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        return { data: null, error: 'Error al crear usuario en autenticación' }
      }

      // 2. Crear perfil en profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role || 'student',
          language: userData.language || 'es',
          notation_preference: userData.notation_preference || 'spanish'
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        
        // Limpiar usuario de auth si falla el perfil
        await supabase.auth.admin.deleteUser(authData.user.id)
        
        return { data: null, error: 'Error al crear perfil de usuario' }
      }

      return { data: profileData as User, error: null }
    } catch (error) {
      console.error('Unexpected error:', error)
      return { data: null, error: 'Error inesperado' }
    }
  }

  // Actualizar usuario
  async updateUser(id: string, userData: UpdateUserData): Promise<{ data: User | null; error: string | null }> {
    try {
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
        console.error('Error updating user:', error)
        return { data: null, error: 'Error al actualizar usuario' }
      }

      return { data: data as User, error: null }
    } catch (error) {
      console.error('Unexpected error:', error)
      return { data: null, error: 'Error inesperado' }
    }
  }

  // Eliminar usuario (solo superadmin, no puede eliminar otros superadmin)
  async deleteUser(id: string): Promise<{ error: string | null }> {
    try {
      // Verificar que no sea superadmin
      const { data: user } = await this.getUserById(id)
      if (user?.role === 'superadmin') {
        return { error: 'No se puede eliminar un superadmin' }
      }

      // Eliminar de auth (cascade eliminará de profiles)
      const { error } = await supabase.auth.admin.deleteUser(id)

      if (error) {
        console.error('Error deleting user:', error)
        return { error: 'Error al eliminar usuario' }
      }

      return { error: null }
    } catch (error) {
      console.error('Unexpected error:', error)
      return { error: 'Error inesperado' }
    }
  }

  // Cambiar rol de usuario
  async changeUserRole(id: string, newRole: 'student' | 'content_admin' | 'support_admin' | 'superadmin'): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Error changing user role:', error)
        return { error: 'Error al cambiar rol de usuario' }
      }

      return { error: null }
    } catch (error) {
      console.error('Unexpected error:', error)
      return { error: 'Error inesperado' }
    }
  }

  // Obtener estadísticas de usuarios
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
      console.error('Error getting user stats:', error)
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

  // Buscar usuarios
  async searchUsers(query: string, role?: string): Promise<{ data: User[] | null; error: string | null }> {
    try {
      let queryBuilder = supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)

      if (role && role !== 'all') {
        queryBuilder = queryBuilder.eq('role', role)
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching users:', error)
        return { data: null, error: 'Error en la búsqueda' }
      }

      return { data: data as User[], error: null }
    } catch (error) {
      console.error('Unexpected error:', error)
      return { data: null, error: 'Error inesperado' }
    }
  }
}

export const userService = new UserService()