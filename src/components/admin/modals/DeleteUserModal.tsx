// src/components/admin/modals/DeleteUserModal.tsx
'use client'

import { useState } from 'react'
import { userService, type User } from '@/lib/admin/userService'
import { Trash2, AlertTriangle } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface DeleteUserModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onUserDeleted: () => void
}

export default function DeleteUserModal({ isOpen, user, onClose, onUserDeleted }: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await userService.deleteUser(user.id)
      
      if (deleteError) {
        setError(deleteError)
      } else {
        onUserDeleted()
        handleClose()
      }
    } catch (error) {
      setError('Error inesperado al eliminar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  if (!user) return null

  const isSuperAdmin = user.role === 'superadmin'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Eliminar Usuario" size="md">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {isSuperAdmin ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#ff8a50]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-[#ff8a50]" />
            </div>
            <h3 className="text-lg font-semibold text-[#e8e8e8] mb-2">
              No se puede eliminar
            </h3>
            <p className="text-[#a8a8a8] mb-6">
              Los Super Administradores no pueden ser eliminados por razones de seguridad.
            </p>
            <button
              onClick={handleClose}
              className="bg-[#5c9eff] hover:opacity-90 text-white px-6 py-2 rounded-lg transition-opacity"
            >
              Entendido
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#e8e8e8] mb-2">
                ¿Eliminar usuario?
              </h3>
              <p className="text-[#a8a8a8] mb-4">
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="bg-[#242424] rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-[#a8a8a8]">
                    {user.full_name 
                      ? user.full_name.split(' ').map((n: string) => n[0]).join('') 
                      : user.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[#e8e8e8]">
                    {user.full_name || 'Sin nombre'}
                  </p>
                  <p className="text-sm text-[#6b6b6b]">{user.email}</p>
                  <p className="text-xs text-[#6b6b6b] capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 text-[#a8a8a8] hover:text-[#e8e8e8] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                )}
                <span>{loading ? 'Eliminando...' : 'Eliminar Usuario'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}