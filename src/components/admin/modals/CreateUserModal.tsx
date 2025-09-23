// src/components/admin/modals/CreateUserModal.tsx
'use client'

import { useState } from 'react'
import { userService, type CreateUserData } from '@/lib/admin/userService'
import { X, User, Mail, Lock, Globe, Music } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: () => void
}

export default function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    full_name: '',
    role: 'student',
    language: 'es',
    notation_preference: 'spanish'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: createError } = await userService.createUser(formData)
      
      if (createError) {
        setError(createError)
      } else {
        // Éxito
        onUserCreated()
        handleClose()
      }
    } catch (error) {
      setError('Error inesperado al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'student',
      language: 'es',
      notation_preference: 'spanish'
    })
    setError(null)
    onClose()
  }

  const handleInputChange = (field: keyof CreateUserData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nuevo Usuario">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="flex items-center text-sm font-medium text-[#e8e8e8] mb-2">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            className="w-full px-3 py-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] placeholder-[#6b6b6b] focus:outline-none focus:border-[#5c9eff]"
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>

        {/* Contraseña */}
        <div>
          <label className="flex items-center text-sm font-medium text-[#e8e8e8] mb-2">
            <Lock className="w-4 h-4 mr-2" />
            Contraseña
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            className="w-full px-3 py-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] placeholder-[#6b6b6b] focus:outline-none focus:border-[#5c9eff]"
            placeholder="••••••••"
            minLength={6}
            required
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="flex items-center text-sm font-medium text-[#e8e8e8] mb-2">
            <User className="w-4 h-4 mr-2" />
            Nombre completo
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={handleInputChange('full_name')}
            className="w-full px-3 py-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] placeholder-[#6b6b6b] focus:outline-none focus:border-[#5c9eff]"
            placeholder="Nombre del usuario"
          />
        </div>

        {/* Rol */}
        <div>
          <label className="flex items-center text-sm font-medium text-[#e8e8e8] mb-2">
            <User className="w-4 h-4 mr-2" />
            Rol
          </label>
          <select
            value={formData.role}
            onChange={handleInputChange('role')}
            className="w-full px-3 py-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] focus:outline-none focus:border-[#5c9eff]"
          >
            <option value="student">Estudiante</option>
            <option value="content_admin">Administrador de Contenido</option>
            <option value="support_admin">Administrador de Soporte</option>
            {/* No permitimos crear superadmin */}
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

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-[#a8a8a8] hover:text-[#e8e8e8] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#5c9eff] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-opacity"
          >
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </Modal>
  )
}