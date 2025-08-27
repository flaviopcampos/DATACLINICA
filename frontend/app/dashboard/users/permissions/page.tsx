'use client'

import { useState } from 'react'
import { Plus, Shield, Lock, Settings, Search, Filter, MoreVertical, Edit, Trash2, Eye, Users } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { useRoles } from '@/hooks/useRoles'
import { PermissionForm } from '@/components/users/PermissionForm'
import { PermissionMatrix } from '@/components/users/PermissionMatrix'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { Permission, PermissionFormData } from '@/types/permissions'

export default function PermissionsPage() {
  const { permissions, isLoading, deletePermission, updatePermission } = usePermissions()
  const { roles } = useRoles()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('list')

  // Get unique categories
  const categories = Array.from(new Set(permissions?.map(p => p.category).filter(Boolean))) || []

  // Filter permissions based on search and category
  const filteredPermissions = permissions?.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || permission.category === categoryFilter
    return matchesSearch && matchesCategory
  }) || []

  // Get roles that have a specific permission
  const getRolesWithPermission = (permissionName: string) => {
    return roles?.filter(role => role.permissions?.includes(permissionName)) || []
  }

  const handleDeletePermission = async (permission: Permission) => {
    const rolesWithPermission = getRolesWithPermission(permission.name)
    if (rolesWithPermission.length > 0) {
      toast.error(
        `Não é possível excluir a permissão "${permission.name}" pois está sendo usada por ${rolesWithPermission.length} perfil(s).`
      )
      return
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a permissão "${permission.name}"?\n\nEsta ação não pode ser desfeita.`
    )
    
    if (confirmed) {
      try {
        await deletePermission.mutateAsync(permission.id)
        toast.success('Permissão excluída com sucesso!')
      } catch (error: any) {
        toast.error(error.message || 'Erro ao excluir permissão')
      }
    }
  }

  const handleToggleStatus = async (permission: Permission) => {
    const newStatus = permission.status === 'active' ? 'inactive' : 'active'
    try {
      await updatePermission.mutateAsync({
        id: permission.id,
        data: { ...permission, status: newStatus }
      })
      toast.success(`Permissão ${newStatus === 'active' ? 'ativada' : 'desativada'} com sucesso!`)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar status da permissão')
    }
  }

  const getPermissionStats = () => {
    const total = permissions?.length || 0
    const active = permissions?.filter(p => p.status === 'active').length || 0
    const inactive = total - active
    const categoriesCount = categories.length
    return { total, active, inactive, categoriesCount }
  }

  const stats = getPermissionStats()

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Permissões</h1>
          <p className="text-gray-600">Gerencie permissões do sistema e controle de acesso</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Permissão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Permissão</DialogTitle>
            </DialogHeader>
            <PermissionForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Permissões</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Permissões Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Permissões Inativas</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-purple-600">{stats.categoriesCount}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Permissões</TabsTrigger>
          <TabsTrigger value="matrix">Matriz de Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar permissões..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPermissions.map((permission) => {
              const rolesWithPermission = getRolesWithPermission(permission.name)
              return (
                <Card key={permission.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{permission.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                        {permission.category && (
                          <Badge variant="outline" className="mt-2">
                            {permission.category}
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedPermission(permission)
                            setIsViewDialogOpen(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedPermission(permission)
                            setIsEditDialogOpen(true)
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(permission)}
                            className={permission.status === 'active' ? 'text-red-600' : 'text-green-600'}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            {permission.status === 'active' ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePermission(permission)}
                            className="text-red-600"
                            disabled={rolesWithPermission.length > 0}
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
                        <Badge variant={permission.status === 'active' ? 'default' : 'secondary'}>
                          {permission.status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Perfis com acesso:</span>
                        <Badge variant="outline">{rolesWithPermission.length}</Badge>
                      </div>
                      {permission.resource && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Recurso:</span>
                          <Badge variant="outline">{permission.resource}</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredPermissions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma permissão encontrada</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando sua primeira permissão'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeira Permissão
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Permissões por Perfil</CardTitle>
              <p className="text-sm text-gray-600">
                Visualize e gerencie as permissões de cada perfil de forma matricial
              </p>
            </CardHeader>
            <CardContent>
              <PermissionMatrix 
                roles={roles || []} 
                permissions={permissions || []} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Permissão</DialogTitle>
          </DialogHeader>
          {selectedPermission && (
            <PermissionForm
              initialData={selectedPermission}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                setSelectedPermission(null)
              }}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedPermission(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Permissão</DialogTitle>
          </DialogHeader>
          {selectedPermission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPermission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge variant={selectedPermission.status === 'active' ? 'default' : 'secondary'}>
                      {selectedPermission.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Categoria</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPermission.category || 'Sem categoria'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Recurso</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPermission.resource || 'Não especificado'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <p className="text-sm text-gray-900 mt-1">{selectedPermission.description || 'Sem descrição'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Perfis com esta permissão ({getRolesWithPermission(selectedPermission.name).length})
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {getRolesWithPermission(selectedPermission.name).map((role) => (
                    <Badge key={role.id} variant="outline">
                      {role.name}
                    </Badge>
                  )) || <p className="text-sm text-gray-500">Nenhum perfil possui esta permissão</p>}
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
                  Editar Permissão
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}