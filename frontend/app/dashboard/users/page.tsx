'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreVertical, Shield, User, Mail, Phone } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { UserCard } from '@/components/users/UserCard'
import { UserStats } from '@/components/users/UserStats'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { toast } from 'sonner'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const {
    users,
    isLoading,
    error,
    stats,
    deleteUser,
    toggleUserStatus,
    resetPassword
  } = useUsers({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    role: roleFilter === 'all' ? undefined : roleFilter
  })

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser.mutateAsync(userId)
        toast.success('Usuário excluído com sucesso!')
      } catch (error) {
        toast.error('Erro ao excluir usuário')
      }
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      await toggleUserStatus.mutateAsync({
        userId,
        status: currentStatus === 'active' ? 'inactive' : 'active'
      })
      toast.success('Status do usuário atualizado!')
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja resetar a senha deste usuário?')) {
      try {
        await resetPassword.mutateAsync(userId)
        toast.success('Senha resetada! Nova senha enviada por email.')
      } catch (error) {
        toast.error('Erro ao resetar senha')
      }
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="font-medium">Erro ao carregar usuários</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600 mt-1">Gerencie usuários, permissões e perfis de acesso</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/users/roles">
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Perfis
            </Button>
          </Link>
          <Link href="/dashboard/users/permissions">
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Permissões
            </Button>
          </Link>
          <Link href="/dashboard/users/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <UserStats stats={stats} isLoading={isLoading} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Perfis</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="doctor">Médico</SelectItem>
                <SelectItem value="nurse">Enfermeiro</SelectItem>
                <SelectItem value="receptionist">Recepcionista</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('grid')}>
                  Visualização em Grade
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>
                  Visualização em Lista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users && users.length > 0 ? (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              viewMode={viewMode}
              onDelete={() => handleDeleteUser(user.id)}
              onToggleStatus={() => handleToggleStatus(user.id, user.status)}
              onResetPassword={() => handleResetPassword(user.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Nenhum usuário encontrado
              </h3>
              <p className="mt-2 text-gray-600">
                {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro usuário'}
              </p>
              {!searchTerm && statusFilter === 'all' && roleFilter === 'all' && (
                <Link href="/dashboard/users/new">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Usuário
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}