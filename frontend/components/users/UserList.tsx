'use client';

import { useState } from 'react';
import { User, UserFilters } from '@/types/users';
import { UserCard } from './UserCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Users,
  UserPlus,
  Download,
  Upload,
  RefreshCw,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SYSTEM_ROLES, USER_STATUS } from '@/types/users';

interface UserListProps {
  users: User[];
  loading?: boolean;
  error?: string | null;
  filters?: UserFilters;
  onFiltersChange?: (filters: UserFilters) => void;
  onUserView?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
  onCreateUser?: () => void;
  onImportUsers?: () => void;
  onExportUsers?: () => void;
  onRefresh?: () => void;
  className?: string;
}

type ViewMode = 'grid' | 'list' | 'compact';
type SortField = 'name' | 'email' | 'role' | 'status' | 'created_at' | 'last_login';
type SortOrder = 'asc' | 'desc';

export function UserList({
  users,
  loading = false,
  error = null,
  filters = {},
  onFiltersChange,
  onUserView,
  onUserEdit,
  onUserDelete,
  onCreateUser,
  onImportUsers,
  onExportUsers,
  onRefresh,
  className,
}: UserListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(filters.roles || []);
  const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || 'all');

  // Aplicar filtros e ordenação
  const filteredAndSortedUsers = users
    .filter(user => {
      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          user.full_name.toLowerCase().includes(searchLower) ||
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.phone && user.phone.includes(searchTerm)) ||
          (user.cpf && user.cpf.includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      // Filtro de roles
      if (selectedRoles.length > 0 && !selectedRoles.includes(user.role)) {
        return false;
      }

      // Filtro de status
      if (selectedStatus !== 'all') {
        const isLocked = user.locked_until && new Date(user.locked_until) > new Date();
        
        if (selectedStatus === 'active' && (!user.is_active || isLocked)) return false;
        if (selectedStatus === 'inactive' && user.is_active && !isLocked) return false;
        if (selectedStatus === 'locked' && !isLocked) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'status':
          aValue = a.is_active ? 'active' : 'inactive';
          bValue = b.is_active ? 'active' : 'inactive';
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'last_login':
          aValue = a.last_login ? new Date(a.last_login) : new Date(0);
          bValue = b.last_login ? new Date(b.last_login) : new Date(0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const handleFiltersUpdate = () => {
    onFiltersChange?.({
      search: searchTerm || undefined,
      roles: selectedRoles.length > 0 ? selectedRoles : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRoles([]);
    setSelectedStatus('all');
    onFiltersChange?.({});
  };

  const hasActiveFilters = searchTerm || selectedRoles.length > 0 || selectedStatus !== 'all';

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
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

  if (error) {
    return (
      <Card className={cn('border-red-200', className)}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-2">Erro ao carregar usuários</div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header com ações principais */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            {loading ? 'Carregando...' : `${filteredAndSortedUsers.length} usuário(s) encontrado(s)`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          )}
          
          {onImportUsers && (
            <Button variant="outline" size="sm" onClick={onImportUsers}>
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          )}
          
          {onExportUsers && (
            <Button variant="outline" size="sm" onClick={onExportUsers}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
          
          {onCreateUser && (
            <Button onClick={onCreateUser}>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          )}
        </div>
      </div>

      {/* Filtros e controles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, username, telefone ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFiltersUpdate()}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filtros */}
            <div className="flex items-center gap-2">
              {/* Filtro de Role */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Perfis
                    {selectedRoles.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedRoles.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrar por Perfil</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.values(SYSTEM_ROLES).map((role) => (
                    <DropdownMenuCheckboxItem
                      key={role}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRoles([...selectedRoles, role]);
                        } else {
                          setSelectedRoles(selectedRoles.filter(r => r !== role));
                        }
                      }}
                    >
                      {getRoleLabel(role)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Filtro de Status */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="locked">Bloqueados</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Ordenação */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortOrder === 'asc' ? (
                      <SortAsc className="mr-2 h-4 w-4" />
                    ) : (
                      <SortDesc className="mr-2 h-4 w-4" />
                    )}
                    Ordenar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[
                    { field: 'name' as SortField, label: 'Nome' },
                    { field: 'email' as SortField, label: 'Email' },
                    { field: 'role' as SortField, label: 'Perfil' },
                    { field: 'status' as SortField, label: 'Status' },
                    { field: 'created_at' as SortField, label: 'Data de Criação' },
                    { field: 'last_login' as SortField, label: 'Último Acesso' },
                  ].map(({ field, label }) => (
                    <DropdownMenuCheckboxItem
                      key={field}
                      checked={sortField === field}
                      onCheckedChange={() => toggleSort(field)}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Modo de visualização */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-x"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                  className="rounded-l-none"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Aplicar filtros */}
              <Button onClick={handleFiltersUpdate} size="sm">
                Aplicar
              </Button>
              
              {/* Limpar filtros */}
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
          
          {/* Filtros ativos */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {searchTerm && (
                <Badge variant="secondary">
                  Busca: {searchTerm}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedRoles.map((role) => (
                <Badge key={role} variant="secondary">
                  {getRoleLabel(role)}
                  <button
                    onClick={() => setSelectedRoles(selectedRoles.filter(r => r !== role))}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedStatus !== 'all' && (
                <Badge variant="secondary">
                  Status: {selectedStatus === 'active' ? 'Ativo' : selectedStatus === 'inactive' ? 'Inativo' : 'Bloqueado'}
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedUsers.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {hasActiveFilters ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? 'Tente ajustar os filtros para encontrar usuários.'
                  : 'Comece criando o primeiro usuário do sistema.'}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              ) : onCreateUser ? (
                <Button onClick={onCreateUser}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Primeiro Usuário
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            viewMode === 'grid' && 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
            viewMode === 'list' && 'space-y-4',
            viewMode === 'compact' && 'space-y-2'
          )}
        >
          {filteredAndSortedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              variant={viewMode === 'grid' ? 'default' : viewMode === 'list' ? 'detailed' : 'compact'}
              onView={onUserView}
              onEdit={onUserEdit}
              onDelete={onUserDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}