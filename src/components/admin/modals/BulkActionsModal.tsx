// src/components/admin/modals/BulkActionsModal.tsx
'use client'

import { useState } from 'react'
import { userService, type User } from '@/lib/admin/userService'
import { Users, Shield, Trash2, AlertTriangle } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface BulkActionsModalProps {
  isOpen: boolean
  selectedUsers: User[]
  action: 'role' | 'delete'
  onClose: () => void
  onComplete: () => void
}

export default function BulkActionsModal({ 
  isOpen, 
  selectedUsers, 
  action, 
  onClose, 
  onComplete 
}: BulkActionsModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [newRole, setNewRole] = useState<'student' | 'content_admin' | 'support_admin'>('student')

  const confirmWord = action === 'delete' ? 'ELIMINAR' : 'CAMBIAR'
  const canProceed = confirmText === confirmWord

  // Filtrar superadmins para mostrar advertencia
  const superAdmins = selectedUsers.filter(user => user.role === 'superadmin')
  const editableUsers = selectedUsers.filter(user => user.role !== 'superadmin')

  const handleAction = async () => {
    if (!canProceed || editableUsers.length === 0) return

    setLoading(true)
    setError(null)

    try {
      if (action === 'role') {
        // Cambiar rol en lote
        const promises = editableUsers.map(user => 
          userService.changeUserRole(user.id, newRole)
        )
        
        const results = await Promise.all(promises)
        const errors = results.filter(result => result.error)
        
        if (errors.length > 0) {
          setError(`Error al cambiar rol de ${errors.length} usuario(s)`)
        } else {
          onComplete()
          handleClose()
        }
      } else if (action === 'delete') {
        // Eliminar en lote
        const promises = editableUsers.map(user => 
          userService.deleteUser(user.id)
        )
        
        const results = await Promise.all(promises)
        const errors = results.filter(result => result.error)
        
        if (errors.length > 0) {
          setError(`Error al eliminar ${errors.length} usuario(s)`)
        } else {
          onComplete()
          handleClose()
        }
      }
    } catch (error) {
      setError('Error inesperado en la operación')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setError(null)
    setNewRole('student')
    onClose()
  }

  const getActionTitle = () => {
    switch (action) {
      case 'role': return 'Cambiar Rol de Usuarios'
      case 'delete': return 'Eliminar Usuarios'
      default: return 'Acción en Lote'
    }
  }

  const getActionColor = () => {
    switch (action) {
      case 'delete': return 'red'
      default: return 'blue'
    }
  }

  const actionColor = getActionColor()

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getActionTitle()} size="lg">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Advertencia de SuperAdmins */}
        {superAdmins.length > 0 && (
          <div className="bg-[#ff8a50]/10 border border-[#ff8a50]/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-[#ff8a50] mt-0.5" />
              <div>
                <h4 className="font-medium text-[#ff8a50] mb-1">Advertencia</h4>
                <p className="text-sm text-[#ff8a50]/80">
                  {superAdmins.length} Super Administrador(es) no pueden ser modificados y serán omitidos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información de la acción */}
        <div className="bg-[#242424] rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              actionColor === 'red' ? 'bg-red-500/20' : 'bg-[#5c9eff]/20'
            }`}>
              {action === 'delete' ? (
                <Trash2 className={`w-5 h-5 ${actionColor === 'red' ? 'text-red-400' : 'text-[#5c9eff]'}`} />
              ) : (
                <Shield className={`w-5 h-5 ${actionColor === 'red' ? 'text-red-400' : 'text-[#5c9eff]'}`} />
              )}
            </div>
            <div>
              <h3 className="font-medium text-[#e8e8e8]">
                {action === 'delete' ? 'Eliminar' : 'Cambiar rol de'} {editableUsers.length} usuario
                {editableUsers.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-[#6b6b6b]">
                {selectedUsers.length} usuario{selectedUsers.length > 1 ? 's' : ''} seleccionado
                {selectedUsers.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {action === 'role' && (
            <div>
              <label className="block text-sm font-medium text-[#e8e8e8] mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Nuevo Rol
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as typeof newRole)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] focus:outline-none focus:border-[#5c9eff]"
              >
                <option value="student">Estudiante</option>
                <option value="content_admin">Administrador de Contenido</option>
                <option value="support_admin">Administrador de Soporte</option>
              </select>
            </div>
          )}

          {action === 'delete' && (
            <div className="text-center">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-[#a8a8a8] text-sm">
                Esta acción no se puede deshacer. Se eliminarán permanentemente todos los usuarios seleccionados.
              </p>
            </div>
          )}
        </div>

        {/* Lista de usuarios afectados */}
        <div>
          <h4 className="font-medium text-[#e8e8e8] mb-3">
            Usuarios que serán {action === 'delete' ? 'eliminados' : 'modificados'}:
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {editableUsers.map(user => (
              <div key={user.id} className="flex items-center space-x-3 p-2 bg-[#1a1a1a] rounded-lg">
                <div className="w-8 h-8 bg-[#242424] rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-[#a8a8a8]">
                    {user.full_name 
                      ? user.full_name.split(' ').map((n: string) => n[0]).join('') 
                      : user.email[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#e8e8e8]">
                    {user.full_name || 'Sin nombre'}
                  </p>
                  <p className="text-xs text-[#6b6b6b]">{user.email}</p>
                </div>
                <div className="text-xs text-[#6b6b6b] capitalize">
                  {user.role.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmación */}
        <div>
          <p className="text-[#a8a8a8] text-sm mb-2">
            Para confirmar, escribe <span className="font-mono text-[#e8e8e8] bg-[#242424] px-2 py-1 rounded">{confirmWord}</span>:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Escribe ${confirmWord}`}
            className="w-full px-3 py-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] placeholder-[#6b6b6b] focus:outline-none focus:border-[#5c9eff] text-center font-mono"
          />
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
            onClick={handleAction}
            disabled={!canProceed || loading || editableUsers.length === 0}
            className={`${
              actionColor === 'red' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-[#5c9eff] hover:opacity-90'
            } disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors`}
          >
            {loading 
              ? (action === 'delete' ? 'Eliminando...' : 'Cambiando...')
              : (action === 'delete' ? 'Eliminar Usuarios' : 'Cambiar Rol')
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}