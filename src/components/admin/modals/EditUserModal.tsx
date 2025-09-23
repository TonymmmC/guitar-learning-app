// src/components/admin/modals/EditUserModal.tsx - CON API REAL
'use client'

import { useState, useEffect } from 'react'
import { userService, type User, type UpdateUserData } from '@/lib/admin/userService'
import { User as UserIcon, Mail, Globe, Music, Shield } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface EditUserModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onUserUpdated: () => void
}

export default function EditUserModal({ isOpen, user, onClose, onUserUpdated }: EditUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<UpdateUserData>({})

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        full_name: user.full_name || '',
        role: user.role,
        subscription_status: user.subscription_status,
        language: user.language,
        notation_preference: user.notation_preference
      })
      setError(null)
    }
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      console.log('Enviando actualización:', formData)
      
      // Llamada REAL a la API de Supabase
      const { error: updateError } = await userService.updateUser(user.id, formData)
      
      if (updateError) {
        setError(updateError)
      } else {
        console.log('✅ Usuario actualizado exitosamente')
        onUserUpdated() // Recargar la lista
        onClose() // Cerrar modal
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      setError('Error inesperado al actualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UpdateUserData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <Shield className="w-4 h-4 text-[#ff8a50]" />
      case 'content_admin': return <Shield className="w-4 h-4 text-[#5c9eff]" />
      case 'support_admin': return <Shield className="w-4 h-4 text-purple-400" />
      default: return <UserIcon className="w-4 h-4 text-[#00d4aa]" />
    }
  }

  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Usuario">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Email (solo lectura) */}
        <div>
          <label className="flex items-center text-sm font-medium text-[#e8e8e8] mb-2">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </label>
          <div className="w-full px-3 py-2 bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#6b6b6b]">
            {user.email}
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="flex items-center text-sm font-medium text-[#e8e8e8] mb-2">
            <UserIcon className="w-4 h-4 mr-2" />
            Nombre completo
          </label>
          <input
            type="text"
            value={formData.full_name || ''}
            onChange={handleInputChange('full_name')}
            className="w-full px-3 py-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] placeholder-[#6b6b6b] focus:outline-none focus:border-[#5c9eff]"
            placeholder="Nombre del usuario"
          />
        </div>

        {/* Rol */}
        <div>
          <label className="flex items-center text-sm font-medium text-[#e8e8e8] mb-2">
            {getRoleIcon(user.role)}
            <span className="ml-2">Rol</span>
          </label>
          <select
            value={formData.role}
            onChange={handleInputChange('role')}
            disabled={user.role === 'superadmin'} // Superadmin no puede cambiar su rol
            className="w-full px-3 py-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] focus:outline-none focus:border-[#5c9eff] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="student">Estudiante</option>
            <option value="content_admin">Administrador de Contenido</option>
            <option value="support_admin">Administrador de Soporte</option>
            {user.role === 'superadmin' && (
              <option value="superadmin">Super Administrador</option>
            )}
          </select>
          {user.role === 'superadmin' && (
            <p className="text-xs text-[#6b6b6b] mt-1">
              Los Super Administradores no pueden cambiar su propio rol
            </p>
          )}
        </div>

        {/* Suscripción */}
        <div>
          <label className="flex items-center text-sm font-medium text-[#e8e8e8] mb-2">
            <Shield className="w-4 h-4 mr-2" />
            Suscripción
          </label>
          <select
            value={formData.subscription_status}
            onChange={handleInputChange('subscription_status')}
            className="w-full px-3 py-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] focus:outline-none focus:border-[#5c9eff]"
          >
            <option value="free">Gratis</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {/* Configuraciones */}
        <div className="grid grid-cols-2 gap-4">
          {/* Idioma */}
          <div>
            <label className="flex items-center text-sm font-medium text-[#e8e8e8] mb-2">
              <Globe className="w-4 h-4 mr-2" />
              Idioma
            </label>
            <select
              value={formData.language}
              onChange={handleInputChange('language')}
              className="w-full px-3 py-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] focus:outline-none focus:border-[#5c9eff]"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Notación */}
          <div>
            <label className="flex items-center text-sm font-medium text-[#e8e8e8] mb-2">
              <Music className="w-4 h-4 mr-2" />
              Notación
            </label>
            <select
              value={formData.notation_preference}
              onChange={handleInputChange('notation_preference')}
              className="w-full px-3 py-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] focus:outline-none focus:border-[#5c9eff]"
            >
              <option value="spanish">Do-Re-Mi</option>
              <option value="english">C-D-E</option>
            </select>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-[#1a1a1a] rounded-lg p-3">
          <div className="text-xs text-[#6b6b6b] space-y-1">
            <p>Creado: {new Date(user.created_at).toLocaleDateString('es-ES')}</p>
            <p>Última actualización: {new Date(user.updated_at).toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-[#a8a8a8] hover:text-[#e8e8e8] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#5c9eff] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-opacity flex items-center space-x-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            )}
            <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}