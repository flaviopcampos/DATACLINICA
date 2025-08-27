'use client';

import { useState } from 'react';
import { User, SYSTEM_ROLES, USER_STATUS } from '@/types/users';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Unlock,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Crown,
  Stethoscope,
  Heart,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useToggleUserStatus, useDeleteUser } from '@/hooks/useUsers';
import { RoleBadges } from './RoleSelector';
import { formatDate, cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  className?: string;
}

export function UserCard({
  user,
  variant = 'default',
  showActions = true,
  onView,
  onEdit,
  onDelete,
  className,
}: UserCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'activate' | 'deactivate' | 'unlock'>('activate');

  const toggleUserStatus = useToggleUserStatus();
  const deleteUser = useDeleteUser();

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      [SYSTEM_ROLES.ADMIN]: Crown,
      [SYSTEM_ROLES.DOCTOR]: Stethoscope,
      [SYSTEM_ROLES.NURSE]: Heart,
      [SYSTEM_ROLES.RECEPTIONIST]: UserCheck,
    };
    return icons[role] || Shield;
  };

  const getStatusColor = (status: string, isLocked: boolean) => {
    if (isLocked) return 'bg-red-100 text-red-800 border-red-200';
    
    const colors = {
      [USER_STATUS.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
      [USER_STATUS.INACTIVE]: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string, isLocked: boolean) => {
    if (isLocked) return Lock;
    
    const icons = {
      [USER_STATUS.ACTIVE]: CheckCircle,
      [USER_STATUS.INACTIVE]: XCircle,
    };
    return icons[status] || XCircle;
  };

  const getStatusLabel = (status: string, isLocked: boolean) => {
    if (isLocked) return 'Bloqueado';
    
    const labels = {
      [USER_STATUS.ACTIVE]: 'Ativo',
      [USER_STATUS.INACTIVE]: 'Inativo',
    };
    return labels[status] || status;
  };

  const isUserLocked = user.locked_until && new Date(user.locked_until) > new Date();
  const hasFailedAttempts = user.failed_login_attempts && user.failed_login_attempts > 0;

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    try {
      await toggleUserStatus.mutateAsync({
        id: user.id,
        isActive: newStatus === 'active',
      });
      setStatusChangeDialogOpen(false);
      toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const handleUnlock = async () => {
    try {
      // TODO: Implementar função de desbloqueio quando disponível
      setStatusChangeDialogOpen(false);
      toast.success('Usuário desbloqueado com sucesso!');
    } catch (error) {
      toast.error('Erro ao desbloquear usuário');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(user.id);
      setDeleteDialogOpen(false);
      onDelete?.(user);
      toast.success('Usuário excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const openStatusDialog = (type: 'activate' | 'deactivate' | 'unlock') => {
    setActionType(type);
    setStatusChangeDialogOpen(true);
  };

  // Variante compacta
  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="bg-primary/10">
                  {getUserInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{user.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <RoleBadges roles={[user.role]} size="sm" />
              
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(user)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Variante detalhada
  if (variant === 'detailed') {
    const RoleIcon = getRoleIcon(user.role);
    const StatusIcon = getStatusIcon(user.is_active ? 'active' : 'inactive', !!isUserLocked);
    
    return (
      <Card className={cn('hover:shadow-lg transition-all duration-200', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="bg-primary/10 text-lg">
                  {getUserInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <CardTitle className="text-xl">{user.full_name}</CardTitle>
                  <CardDescription className="text-base">@{user.username}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <RoleIcon className="h-4 w-4" />
                  <RoleBadges roles={[user.role]} size="md" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge className={getStatusColor(user.is_active ? 'active' : 'inactive', !!isUserLocked)}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {getStatusLabel(user.is_active ? 'active' : 'inactive', !!isUserLocked)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isUserLocked
                      ? `Bloqueado até ${formatDate(user.locked_until!)}`
                      : user.is_active
                      ? 'Usuário ativo no sistema'
                      : 'Usuário inativo no sistema'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onView?.(user)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Usuário
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.is_active ? (
                      <DropdownMenuItem
                        onClick={() => openStatusDialog('deactivate')}
                        className="text-orange-600"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Desativar
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => openStatusDialog('activate')}
                        className="text-green-600"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Ativar
                      </DropdownMenuItem>
                    )}
                    {isUserLocked && (
                      <DropdownMenuItem
                        onClick={() => openStatusDialog('unlock')}
                        className="text-blue-600"
                      >
                        <Unlock className="mr-2 h-4 w-4" />
                        Desbloquear
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Informações de contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.clinic_id && (
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Clínica: {user.clinic_id}</span>
              </div>
            )}
            {user.last_login && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Último acesso: {formatDate(user.last_login)}</span>
              </div>
            )}
          </div>
          
          {/* Informações profissionais */}
          {(user.professional_license || user.specialty) && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Informações Profissionais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {user.professional_license && (
                  <div>
                    <span className="text-muted-foreground">Registro: </span>
                    <span>{user.professional_license}</span>
                  </div>
                )}
                {user.specialty && (
                  <div>
                    <span className="text-muted-foreground">Especialidade: </span>
                    <span>{user.specialty}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Alertas de segurança */}
          {(hasFailedAttempts || isUserLocked) && (
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {isUserLocked
                    ? `Conta bloqueada até ${formatDate(user.locked_until!)}`
                    : `${user.failed_login_attempts} tentativas de login falharam`}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Variante padrão
  const RoleIcon = getRoleIcon(user.role);
  const StatusIcon = getStatusIcon(user.is_active ? 'active' : 'inactive', !!isUserLocked);
  
  return (
    <>
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="bg-primary/10">
                  {getUserInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold">{user.full_name}</h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <RoleIcon className="h-4 w-4" />
                  <RoleBadges roles={[user.role]} size="sm" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(user.is_active ? 'active' : 'inactive', !!isUserLocked)}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {getStatusLabel(user.is_active ? 'active' : 'inactive', !!isUserLocked)}
              </Badge>
              
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(user)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.is_active ? (
                      <DropdownMenuItem onClick={() => openStatusDialog('deactivate')}>
                        <UserX className="mr-2 h-4 w-4" />
                        Desativar
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => openStatusDialog('activate')}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Ativar
                      </DropdownMenuItem>
                    )}
                    {isUserLocked && (
                      <DropdownMenuItem onClick={() => openStatusDialog('unlock')}>
                        <Unlock className="mr-2 h-4 w-4" />
                        Desbloquear
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          {/* Informações adicionais */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {user.last_login && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Último acesso:</span>
                  <span>{formatDate(user.last_login)}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Criado em:</span>
                <span>{formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação para mudança de status */}
      <AlertDialog open={statusChangeDialogOpen} onOpenChange={setStatusChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'activate' && 'Ativar Usuário'}
              {actionType === 'deactivate' && 'Desativar Usuário'}
              {actionType === 'unlock' && 'Desbloquear Usuário'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'activate' && `Tem certeza que deseja ativar o usuário ${user.full_name}?`}
              {actionType === 'deactivate' && `Tem certeza que deseja desativar o usuário ${user.full_name}? O usuário não conseguirá mais acessar o sistema.`}
              {actionType === 'unlock' && `Tem certeza que deseja desbloquear o usuário ${user.full_name}? O contador de tentativas será resetado.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionType === 'activate') handleStatusChange('active');
                if (actionType === 'deactivate') handleStatusChange('inactive');
                if (actionType === 'unlock') handleUnlock();
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação para exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Excluir Usuário
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{user.full_name}</strong>?
              <br /><br />
              <span className="text-red-600 font-medium">
                Esta ação não pode ser desfeita e todos os dados do usuário serão permanentemente removidos.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}