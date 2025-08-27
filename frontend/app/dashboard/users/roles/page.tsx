'use client'

import { useState } from 'react'
import { Plus, Shield, Users, Settings, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { useRoles } from '@/hooks/useRoles'
import { useUsers } from '@/hooks/useUsers'
import { RoleForm } from '@/components/users/RoleForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { Role, RoleFormData } from '@/types/roles'

export default function RolesPage() {
  const { roles, isLoading, deleteRole, updateRole } = useRoles()
  const { users } = useUsers()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Filter roles based on search and status
  const filteredRoles = roles?.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || role.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  // Get user count for each role
  const getUserCountForRole = (roleId: string) => {
    return users?.filter(user => user.role === roleId).length || 0
  }

  const handleDeleteRole = async (role: Role) => {
    const userCount = getUserCountForRole(role.id)
    if (userCount > 0) {
      toast.error(`Não é possível excluir o perfil "${role.name}" pois existem ${userCount} usuário(s) associado(s).`)
      return
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o perfil "${role.name}"?\n\nEsta ação não pode ser desfeita.`
    )
    
    if (confirmed) {
      try {
        await deleteRole.mutateAsync(role.id)
        toast.success('Perfil excluído com sucesso!')
      } catch (error: any) {
        toast.error(error.message || 'Erro ao excluir perfil')
      }
    }
  }

  const handleToggleStatus = async (role: Role) => {
    const newStatus = role.status === 'active' ? 'inactive' : 'active'
    try {
      await updateRole.mutateAsync({
        id: role.id,
        data: { ...role, status: newStatus }
      })
      toast.success(`Perfil ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar status do perfil')
    }
  }

  const getRoleStats = () => {
    const total = roles?.length || 0
    const active = roles?.filter(role => role.status === 'active').length || 0
    const inactive = total - active
    return { total, active, inactive }
  }

  const stats = getRoleStats()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Perfis</h1>
          <p className="text-gray-600">Gerencie perfis de acesso e suas permissões</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Perfil</DialogTitle>
            </DialogHeader>
            <RoleForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Perfis</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Perfis Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Perfis Inativos</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar perfis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => {
          const userCount = getUserCountForRole(role.id)
          return (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedRole(role)
                        setIsViewDialogOpen(true)
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedRole(role)
                        setIsEditDialogOpen(true)
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleToggleStatus(role)}
                        className={role.status === 'active' ? 'text-red-600' : 'text-green-600'}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {role.status === 'active' ? 'Desativar' : 'Ativar'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteRole(role)}
                        className="text-red-600"
                        disabled={userCount > 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={role.status === 'active' ? 'default' : 'secondary'}>
                      {role.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Usuários:</span>
                    <Badge variant="outline">{userCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Permissões:</span>
                    <Badge variant="outline">{role.permissions?.length || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredRoles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum perfil encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro perfil de acesso'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeiro Perfil
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <RoleForm
              initialData={selectedRole}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                setSelectedRole(null)
              }}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedRole(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Perfil</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedRole.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge variant={selectedRole.status === 'active' ? 'default' : 'secondary'}>
                      {selectedRole.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <p className="text-sm text-gray-900 mt-1">{selectedRole.description || 'Sem descrição'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Permissões ({selectedRole.permissions?.length || 0})</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedRole.permissions?.map((permission) => (
                    <Badge key={permission} variant="outline">
                      {permission}
                    </Badge>
                  )) || <p className="text-sm text-gray-500">Nenhuma permissão definida</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false)
                  setIsEditDialogOpen(true)
                }}>
                  Editar Perfil
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}