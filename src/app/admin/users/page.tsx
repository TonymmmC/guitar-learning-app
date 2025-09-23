'use client'

import { useEffect, useState } from 'react'
import { usePermissions } from '@/lib/auth/rbac'
import { userService, type User } from '@/lib/admin/userService'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  User as UserIcon,
  Crown,
  ChevronLeft,
  ChevronRight,
  Settings,
  RotateCcw
} from 'lucide-react'

// Importar modales
import CreateUserModal from '@/components/admin/modals/CreateUserModal'
import EditUserModal from '@/components/admin/modals/EditUserModal'
import DeleteUserModal from '@/components/admin/modals/DeleteUserModal'
import BulkActionsModal from '@/components/admin/modals/BulkActionsModal'
import RestoreUserModal from '@/components/admin/modals/RestoreUserModal'

// Configuración de paginación
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50]
const DEFAULT_PAGE_SIZE = 20

export default function UsersManagement() {
  const { hasPermission } = usePermissions()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [bulkAction, setBulkAction] = useState<'role' | 'delete'>('role')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Nuevo estado para modo de vista
  const [viewMode, setViewMode] = useState<'active' | 'deleted'>('active')

  // Función para cargar usuarios
  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = viewMode === 'active' 
        ? await userService.getAllUsers()
        : await userService.getDeletedUsers()
      
      if (error) {
        console.error('Error loading users:', error)
      } else if (data) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Unexpected error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cargar usuarios inicialmente
  useEffect(() => {
    loadUsers()
  }, [])

  // Efecto para recargar cuando cambie el modo de vista
  useEffect(() => {
    loadUsers()
  }, [viewMode])

  // Filtrar usuarios
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterRole === 'all' || user.role === filterRole
      return matchesSearch && matchesRole
    })
    
    setFilteredUsers(filtered)
    setCurrentPage(1)
    setSelectedUserIds(new Set())
  }, [users, searchTerm, filterRole])

  // Cálculos de paginación
  const totalUsers = filteredUsers.length
  const totalPages = Math.ceil(totalUsers / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  // Handlers de selección
  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUserIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedUserIds.size === currentUsers.length && currentUsers.length > 0) {
      setSelectedUserIds(new Set())
    } else {
      setSelectedUserIds(new Set(currentUsers.map(user => user.id)))
    }
  }

  // Handlers de modales
  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleRestoreUser = (user: User) => {
    setSelectedUser(user)
    setShowRestoreModal(true)
  }

  const handleBulkAction = (action: 'role' | 'delete') => {
    setBulkAction(action)
    setShowBulkModal(true)
  }

  // Funciones de utilidad
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <Crown className="w-4 h-4" />
      case 'content_admin': return <Shield className="w-4 h-4" />
      case 'support_admin': return <Settings className="w-4 h-4" />
      default: return <UserIcon className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-[#ff8a50]/20 text-[#ff8a50] border-[#ff8a50]/30'
      case 'content_admin': return 'bg-[#5c9eff]/20 text-[#5c9eff] border-[#5c9eff]/30'
      case 'support_admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-[#00d4aa]/20 text-[#00d4aa] border-[#00d4aa]/30'
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Super Admin'
      case 'content_admin': return 'Content Admin'
      case 'support_admin': return 'Support Admin'
      default: return 'Estudiante'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Obtener usuarios seleccionados
  const selectedUsers = users.filter(user => selectedUserIds.has(user.id))

  // Verificar permisos
  if (!hasPermission('users.read')) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-[#6b6b6b] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[#e8e8e8] mb-2">Sin permisos</h3>
        <p className="text-[#a8a8a8]">No tienes permisos para ver la gestión de usuarios</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-[#e8e8e8]">Gestión de Usuarios</h1>
            <p className="text-[#a8a8a8]">
              {totalUsers} usuario{totalUsers !== 1 ? 's' : ''} {viewMode === 'active' ? 'activos' : 'eliminados'}
            </p>
          </div>
          
          {/* Toggle para cambiar vista */}
          <div className="flex bg-[#242424] rounded-lg p-1">
            <button
              onClick={() => setViewMode('active')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'active'
                  ? 'bg-[#5c9eff] text-white'
                  : 'text-[#a8a8a8] hover:text-[#e8e8e8]'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setViewMode('deleted')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'deleted'
                  ? 'bg-[#ff8a50] text-white'
                  : 'text-[#a8a8a8] hover:text-[#e8e8e8]'
              }`}
            >
              Eliminados
            </button>
          </div>
        </div>
        
        {hasPermission('users.write') && viewMode === 'active' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#5c9eff] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b6b6b] w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg text-[#e8e8e8] placeholder-[#6b6b6b] focus:outline-none focus:border-[#5c9eff]"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#6b6b6b]" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="appearance-none bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg pl-3 pr-8 py-2 text-sm text-[#e8e8e8] focus:outline-none focus:border-[#5c9eff] cursor-pointer"
              >
                <option value="all">Todos los roles</option>
                <option value="student">Estudiantes</option>
                <option value="content_admin">Content Admin</option>
                <option value="support_admin">Support Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-[#6b6b6b]">
              <span>Mostrar:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded px-2 py-1 text-[#e8e8e8] focus:outline-none focus:border-[#5c9eff]"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5c9eff] mb-4"></div>
            <p className="text-[#a8a8a8]">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            {/* Header de tabla */}
            <div className="bg-[#242424] border-b border-[rgba(255,255,255,0.08)] px-6 py-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUserIds.size === currentUsers.length && currentUsers.length > 0}
                  onChange={handleSelectAll}
                  className="mr-4 rounded border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] text-[#5c9eff] focus:ring-[#5c9eff]"
                />
                <div className="grid grid-cols-12 gap-4 w-full text-sm font-medium text-[#a8a8a8]">
                  <div className="col-span-4">Usuario</div>
                  <div className="col-span-2">Rol</div>
                  <div className="col-span-2">Suscripción</div>
                  <div className="col-span-2">Registro</div>
                  <div className="col-span-2 text-center">Acciones</div>
                </div>
              </div>
            </div>

            {/* Filas de usuarios */}
            <div className="divide-y divide-[rgba(255,255,255,0.08)]">
              {currentUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  selected={selectedUserIds.has(user.id)}
                  onSelect={() => handleSelectUser(user.id)}
                  onEdit={() => handleEditUser(user)}
                  onDelete={() => handleDeleteUser(user)}
                  onRestore={() => handleRestoreUser(user)}
                  canEdit={hasPermission('users.write')}
                  canDelete={hasPermission('users.delete')}
                  viewMode={viewMode}
                  getRoleIcon={getRoleIcon}
                  getRoleColor={getRoleColor}
                  getRoleName={getRoleName}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {currentUsers.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-[#6b6b6b] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#e8e8e8] mb-2">No se encontraron usuarios</h3>
                <p className="text-[#a8a8a8]">
                  {viewMode === 'active' ? 'Intenta cambiar los filtros de búsqueda' : 'No hay usuarios eliminados'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-[#a8a8a8]">
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalUsers)} de {totalUsers} usuarios
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-[#a8a8a8] hover:text-[#e8e8e8] hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                if (page > totalPages) return null
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-[#5c9eff] text-white'
                        : 'text-[#a8a8a8] hover:text-[#e8e8e8] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-[#a8a8a8] hover:text-[#e8e8e8] hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Acciones en lote - Solo para usuarios activos */}
      {selectedUserIds.size > 0 && viewMode === 'active' && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg px-6 py-3 shadow-lg z-40">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-[#a8a8a8]">
              {selectedUserIds.size} usuario{selectedUserIds.size > 1 ? 's' : ''} seleccionado{selectedUserIds.size > 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              {hasPermission('users.write') && (
                <button 
                  onClick={() => handleBulkAction('role')}
                  className="bg-[#5c9eff] hover:opacity-90 text-white px-3 py-1.5 rounded text-sm transition-opacity"
                >
                  Cambiar Rol
                </button>
              )}
              {hasPermission('users.delete') && (
                <button 
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={loadUsers}
      />

      <EditUserModal
        isOpen={showEditModal}
        user={selectedUser}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUser(null)
        }}
        onUserUpdated={loadUsers}
      />

      <DeleteUserModal
        isOpen={showDeleteModal}
        user={selectedUser}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedUser(null)
        }}
        onUserDeleted={loadUsers}
      />

      <RestoreUserModal
        isOpen={showRestoreModal}
        user={selectedUser}
        onClose={() => {
          setShowRestoreModal(false)
          setSelectedUser(null)
        }}
        onUserRestored={loadUsers}
      />

      <BulkActionsModal
        isOpen={showBulkModal}
        selectedUsers={selectedUsers}
        action={bulkAction}
        onClose={() => setShowBulkModal(false)}
        onComplete={() => {
          loadUsers()
          setSelectedUserIds(new Set())
        }}
      />
    </div>
  )
}

// Componente para cada fila de usuario - ACTUALIZADO
interface UserRowProps {
  user: User
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onRestore: () => void
  canEdit: boolean
  canDelete: boolean
  viewMode: 'active' | 'deleted'
  getRoleIcon: (role: string) => React.ReactNode
  getRoleColor: (role: string) => string
  getRoleName: (role: string) => string
  formatDate: (dateString: string) => string
}

function UserRow({ 
  user, 
  selected, 
  onSelect, 
  onEdit,
  onDelete,
  onRestore,
  canEdit,
  canDelete,
  viewMode,
  getRoleIcon, 
  getRoleColor, 
  getRoleName,
  formatDate
}: UserRowProps) {
  return (
    <div className="px-6 py-4 hover:bg-[#1f1f1f] transition-colors">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="mr-4 rounded border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] text-[#5c9eff] focus:ring-[#5c9eff]"
        />
        <div className="grid grid-cols-12 gap-4 w-full items-center">
          {/* Usuario */}
          <div className="col-span-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#242424] rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-[#a8a8a8]">
                {user.full_name 
                  ? user.full_name.split(' ').map((n: string) => n[0]).join('') 
                  : user.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#e8e8e8]">
                {user.full_name || 'Sin nombre'}
              </p>
              <p className="text-xs text-[#6b6b6b]">{user.email}</p>
            </div>
          </div>

          {/* Rol */}
          <div className="col-span-2">
            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
              {getRoleIcon(user.role)}
              <span>{getRoleName(user.role)}</span>
            </span>
          </div>

          {/* Suscripción */}
          <div className="col-span-2">
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              user.subscription_status === 'premium' 
                ? 'bg-[#ff8a50]/20 text-[#ff8a50] border border-[#ff8a50]/30' 
                : 'bg-[#6b6b6b]/20 text-[#6b6b6b] border border-[#6b6b6b]/30'
            }`}>
              {user.subscription_status === 'premium' ? 'Premium' : 'Gratis'}
            </span>
          </div>

          {/* Fecha de registro */}
          <div className="col-span-2">
            <p className="text-sm text-[#a8a8a8]">{formatDate(user.created_at)}</p>
          </div>

          {/* Acciones */}
          <div className="col-span-2 flex items-center justify-center space-x-2">
            {viewMode === 'active' ? (
              // Acciones para usuarios activos
              <>
                {canEdit && (
                  <button 
                    onClick={onEdit}
                    className="text-[#6b6b6b] hover:text-[#5c9eff] p-2 rounded-lg hover:bg-[#242424] transition-colors"
                    title="Editar usuario"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {canDelete && user.role !== 'superadmin' && (
                  <button 
                    onClick={onDelete}
                    className="text-[#6b6b6b] hover:text-red-400 p-2 rounded-lg hover:bg-[#242424] transition-colors"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {user.role === 'superadmin' && (
                  <div className="text-xs text-[#6b6b6b] px-2">
                    Protegido
                  </div>
                )}
              </>
            ) : (
              // Acciones para usuarios eliminados
              <button 
                onClick={onRestore}
                className="text-[#6b6b6b] hover:text-[#00d4aa] p-2 rounded-lg hover:bg-[#242424] transition-colors"
                title="Restaurar usuario"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}