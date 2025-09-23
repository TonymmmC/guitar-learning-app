'use client'

import { useEffect, useState, useRef } from 'react'
import { usePermissions } from '@/lib/auth/rbac'
import { userService, type User } from '@/lib/admin/userService'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Shield,
  User as UserIcon,
  Crown
} from 'lucide-react'

export default function UsersManagement() {
  const { hasPermission } = usePermissions()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  // Cargar usuarios desde la API real
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      try {
        const { data, error } = await userService.getAllUsers()
        
        if (error) {
          console.error('Error loading users:', error)
          // TODO: Mostrar toast de error
        } else if (data) {
          setUsers(data)
        }
      } catch (error) {
        console.error('Unexpected error loading users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)))
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <Crown className="w-4 h-4" />
      case 'content_admin': return <Shield className="w-4 h-4" />
      case 'support_admin': return <Shield className="w-4 h-4" />
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8e8]">Gestión de Usuarios</h1>
          <p className="text-[#a8a8a8]">Administra usuarios del sistema</p>
        </div>
        {hasPermission('users.write') && (
          <button className="bg-[#5c9eff] hover:opacity-90 text-white px-3 py-2 rounded-lg transition-opacity flex items-center space-x-2 text-sm">
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#6b6b6b]" />
              <div className="relative">
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
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-[#6b6b6b]">
              {filteredUsers.length} de {users.length} usuarios
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5c9eff]"></div>
            <p className="mt-4 text-[#a8a8a8]">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            {/* Header de tabla */}
            <div className="bg-[#242424] border-b border-[rgba(255,255,255,0.08)] px-6 py-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="mr-4 rounded border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] text-[#5c9eff] focus:ring-[#5c9eff]"
                />
                <div className="grid grid-cols-12 gap-4 w-full text-sm font-medium text-[#a8a8a8]">
                  <div className="col-span-4">Usuario</div>
                  <div className="col-span-2">Rol</div>
                  <div className="col-span-2">Suscripción</div>
                  <div className="col-span-2">Registro</div>
                  <div className="col-span-2">Acciones</div>
                </div>
              </div>
            </div>

            {/* Filas de usuarios */}
            <div className="divide-y divide-[rgba(255,255,255,0.08)]">
              {filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  selected={selectedUsers.has(user.id)}
                  onSelect={() => handleSelectUser(user.id)}
                  getRoleIcon={getRoleIcon}
                  getRoleColor={getRoleColor}
                  getRoleName={getRoleName}
                  canEdit={hasPermission('users.write')}
                  canDelete={hasPermission('users.delete')}
                />
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-[#6b6b6b] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#e8e8e8] mb-2">No se encontraron usuarios</h3>
                <p className="text-[#a8a8a8]">Intenta cambiar los filtros de búsqueda</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Acciones en lote */}
      {selectedUsers.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg px-6 py-3 shadow-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-[#a8a8a8]">
              {selectedUsers.size} usuario{selectedUsers.size > 1 ? 's' : ''} seleccionado{selectedUsers.size > 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              {hasPermission('users.write') && (
                <button className="bg-[#5c9eff] hover:opacity-90 text-white px-3 py-1 rounded text-sm transition-opacity">
                  Cambiar Rol
                </button>
              )}
              {hasPermission('users.delete') && (
                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para cada fila de usuario
interface UserRowProps {
  user: User
  selected: boolean
  onSelect: () => void
  getRoleIcon: (role: string) => React.ReactNode
  getRoleColor: (role: string) => string
  getRoleName: (role: string) => string
  canEdit: boolean
  canDelete: boolean
}

function UserRow({ 
  user, 
  selected, 
  onSelect, 
  getRoleIcon, 
  getRoleColor, 
  getRoleName, 
  canEdit, 
  canDelete 
}: UserRowProps) {
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="px-6 py-4 hover:bg-[#1f1f1f] transition-colors">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="mr-4 rounded border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] text-[#5c9eff] focus:ring-[#5c9eff]"
        />
        <div className="grid grid-cols-12 gap-4 w-full">
          {/* Usuario */}
          <div className="col-span-4 flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#242424] rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-[#a8a8a8]">
                {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : user.email[0].toUpperCase()}
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
                ? 'bg-[#ff8a50]/20 text-[#ff8a50]' 
                : 'bg-[#6b6b6b]/20 text-[#6b6b6b]'
            }`}>
              {user.subscription_status === 'premium' ? 'Premium' : 'Gratis'}
            </span>
          </div>

          {/* Fecha de registro */}
          <div className="col-span-2">
            <p className="text-sm text-[#a8a8a8]">{formatDate(user.created_at)}</p>
          </div>

          {/* Acciones - Simplificado */}
          <div className="col-span-2 flex items-center justify-end space-x-2">
            {canEdit && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Implementar edición
                }}
                className="text-[#6b6b6b] hover:text-[#5c9eff] p-1.5 rounded transition-colors"
                title="Editar usuario"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {canDelete && user.role !== 'superadmin' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Implementar eliminación
                }}
                className="text-[#6b6b6b] hover:text-red-400 p-1.5 rounded transition-colors"
                title="Eliminar usuario"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}