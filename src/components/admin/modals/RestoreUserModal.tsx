// src/components/admin/modals/RestoreUserModal.tsx
'use client'

import { useState } from 'react'
import { userService, type User } from '@/lib/admin/userService'
import { RotateCcw } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface RestoreUserModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onUserRestored: () => void
}

export default function RestoreUserModal({ isOpen, user, onClose, onUserRestored }: RestoreUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRestore = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { error: restoreError } = await userService.restoreUser(user.id)
      
      if (restoreError) {
        setError(restoreError)
      } else {
        onUserRestored()
        handleClose()
      }
    } catch (error) {
      setError('Error inesperado al restaurar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Restaurar Usuario" size="md">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="text-center">
          <div className="w-16 h-16 bg-[#00d4aa]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-8 h-8 text-[#00d4aa]" />
          </div>
          <h3 className="text-lg font-semibold text-[#e8e8e8] mb-2">
            ¿Restaurar usuario?
          </h3>
          <p className="text-[#a8a8a8] mb-4">
            El usuario podrá acceder al sistema nuevamente.
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
            onClick={handleRestore}
            disabled={loading}
            className="bg-[#00d4aa] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-opacity flex items-center space-x-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            )}
            <RotateCcw className="w-4 h-4" />
            <span>{loading ? 'Restaurando...' : 'Restaurar Usuario'}</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}