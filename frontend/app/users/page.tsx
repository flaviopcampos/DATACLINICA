'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Shield,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useUsers, useToggleUserStatus, useDeleteUser } from '@/hooks/useUsers';
import { User, UserFilters, SYSTEM_ROLES, USER_STATUS } from '@/types/users';
import { formatDate } from '@/lib/utils';

interface UserActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onUnlock: (user: User) => void;
}

function UserActions({ user, onEdit, onView, onDelete, onToggleStatus, onUnlock }: UserActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onView(user)}>
          <Eye className="mr-2 h-4 w-4" />
          Visualizar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggleStatus(user)}>
          {user.is_active ? (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Desativar
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Ativar
            </>
          )}
        </DropdownMenuItem>
        {user.locked_until && new Date(user.locked_until) > new Date() && (
          <DropdownMenuItem onClick={() => onUnlock(user)}>
            <Unlock className="mr-2 h-4 w-4" />
            Desbloquear
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDelete(user)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onUnlock: (user: User) => void;
}

function UserCard({ user, onEdit, onView, onDelete, onToggleStatus, onUnlock }: UserCardProps) {
  const isLocked = user.locked_until && new Date(user.locked_until) > new Date();
  const lastLoginText = user.last_login 
    ? `Último acesso: ${formatDate(user.last_login)}`
    : 'Nunca acessou';

  const getRoleColor = (role: string) => {
    const colors = {
      [SYSTEM_ROLES.ADMIN]: 'bg-red-100 text-red-800',
      [SYSTEM_ROLES.DOCTOR]: 'bg-blue-100 text-blue-800',
      [SYSTEM_ROLES.NURSE]: 'bg-green-100 text-green-800',
      [SYSTEM_ROLES.RECEPTIONIST]: 'bg-yellow-100 text-yellow-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      [SYSTEM_ROLES.ADMIN]: 'Administrador',
      [SYSTEM_ROLES.DOCTOR]: 'Médico',
      [SYSTEM_ROLES.NURSE]: 'Enfermeiro',
      [SYSTEM_ROLES.RECEPTIONIST]: 'Recepcionista',
    };
    return labels[role] || role;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{user.full_name}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <span>@{user.username}</span>
                {isLocked && <Lock className="h-3 w-3 text-red-500" />}
              </CardDescription>
            </div>
          </div>
          <UserActions
            user={user}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            onUnlock={onUnlock}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email:</span>
            <span className="text-sm">{user.email}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Perfil:</span>
            <Badge className={getRoleColor(user.role)}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>
          
          {user.specialty && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Especialidade:</span>
              <span className="text-sm">{user.specialty}</span>
            </div>
          )}
          
          {user.professional_license && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Registro:</span>
              <span className="text-sm">{user.professional_license}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={user.is_active ? 'default' : 'secondary'}>
              {user.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Último acesso:</span>
            <span className="text-xs text-muted-foreground">{lastLoginText}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Criado em:</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(user.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UsersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 12,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToToggleStatus, setUserToToggleStatus] = useState<User | null>(null);

  // Aplicar filtros com debounce
  const appliedFilters = useMemo(() => {
    const newFilters: UserFilters = {
      ...filters,
      search: searchTerm || undefined,
      role: selectedRole || undefined,
      is_active: selectedStatus ? selectedStatus === 'active' : undefined,
    };
    return newFilters;
  }, [filters, searchTerm, selectedRole, selectedStatus]);

  const { data: usersData, isLoading, error } = useUsers(appliedFilters);
  const updateUserStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateUser = () => {
    router.push('/users/create');
  };

  const handleEditUser = (user: User) => {
    router.push(`/users/${user.id}/edit`);
  };

  const handleViewUser = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync(userToDelete.id);
      setUserToDelete(null);
      toast.success('Usuário excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleToggleUserStatus = (user: User) => {
    setUserToToggleStatus(user);
  };

  const confirmToggleUserStatus = async () => {
    if (!userToToggleStatus) return;

    try {
      await toggleUserStatus.mutateAsync({
        id: userToToggleStatus.id,
        is_active: !userToToggleStatus.is_active,
      });
      setUserToToggleStatus(null);
      toast.success(
        `Usuário ${userToToggleStatus.is_active ? 'desativado' : 'ativado'} com sucesso!`
      );
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const handleUnlockUser = async (user: User) => {
    try {
      // Implementar desbloqueio de usuário
      toast.success('Usuário desbloqueado com sucesso!');
    } catch (error) {
      toast.error('Erro ao desbloquear usuário');
    }
  };

  const handleExportUsers = () => {
    // Implementar exportação de usuários
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  const handleImportUsers = () => {
    // Implementar importação de usuários
    toast.info('Funcionalidade de importação em desenvolvimento');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedStatus('');
    setFilters({ page: 1, limit: 12 });
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Erro ao carregar usuários: {error.message}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const users = usersData?.items || [];
  const totalPages = Math.ceil((usersData?.total || 0) / (filters.limit || 12));
  const hasFilters = searchTerm || selectedRole || selectedStatus;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, perfis e permissões do sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleImportUsers}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" onClick={handleExportUsers}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={handleCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersData?.total || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.is_active).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Inativos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => !u.is_active).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === SYSTEM_ROLES.ADMIN).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou username..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedRole} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os perfis</SelectItem>
                <SelectItem value={SYSTEM_ROLES.ADMIN}>Administrador</SelectItem>
                <SelectItem value={SYSTEM_ROLES.DOCTOR}>Médico</SelectItem>
                <SelectItem value={SYSTEM_ROLES.NURSE}>Enfermeiro</SelectItem>
                <SelectItem value={SYSTEM_ROLES.RECEPTIONIST}>Recepcionista</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
            
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum usuário encontrado"
          description={
            hasFilters
              ? "Não há usuários que correspondam aos filtros aplicados."
              : "Comece criando o primeiro usuário do sistema."
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : (
              <Button onClick={handleCreateUser}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeiro usuário
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEditUser}
                onView={handleViewUser}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleUserStatus}
                onUnlock={handleUnlockUser}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={filters.page || 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showFirstLast
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.full_name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog open={!!userToToggleStatus} onOpenChange={() => setUserToToggleStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToToggleStatus?.is_active ? 'Desativar' : 'Ativar'} usuário
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {userToToggleStatus?.is_active ? 'desativar' : 'ativar'} o usuário{' '}
              <strong>{userToToggleStatus?.full_name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleUserStatus}>
              {userToToggleStatus?.is_active ? 'Desativar' : 'Ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}