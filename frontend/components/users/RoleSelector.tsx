'use client';

import { useState } from 'react';
import {
  UserRole,
  SYSTEM_ROLES,
  User,
  UserRoleAssignment,
} from '@/types/users';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Shield,
  Plus,
  Trash2,
  Edit,
  Users,
  Crown,
  Stethoscope,
  Heart,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRoles, useAssignRoleToUser, useRemoveRoleFromUser } from '@/hooks/useRoles';
import { formatDate } from '@/lib/utils';

interface RoleSelectorProps {
  user?: User;
  selectedRoles?: string[];
  onRoleChange?: (roles: string[]) => void;
  mode?: 'single' | 'multiple';
  disabled?: boolean;
  showDescription?: boolean;
  className?: string;
}

export function RoleSelector({
  user,
  selectedRoles = [],
  onRoleChange,
  mode = 'single',
  disabled = false,
  showDescription = true,
  className,
}: RoleSelectorProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [roleToRemove, setRoleToRemove] = useState<string | null>(null);

  const { data: roles, isLoading: rolesLoading } = useRoles();
  const assignRole = useAssignRoleToUser();
  const removeRole = useRemoveRoleFromUser();

  const getRoleIcon = (role: string) => {
    const icons = {
      [SYSTEM_ROLES.ADMIN]: Crown,
      [SYSTEM_ROLES.DOCTOR]: Stethoscope,
      [SYSTEM_ROLES.NURSE]: Heart,
      [SYSTEM_ROLES.RECEPTIONIST]: UserCheck,
    };
    return icons[role] || Shield;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      [SYSTEM_ROLES.ADMIN]: 'bg-red-100 text-red-800 border-red-200',
      [SYSTEM_ROLES.DOCTOR]: 'bg-blue-100 text-blue-800 border-blue-200',
      [SYSTEM_ROLES.NURSE]: 'bg-green-100 text-green-800 border-green-200',
      [SYSTEM_ROLES.RECEPTIONIST]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getRoleDescription = (role: string) => {
    const descriptions = {
      [SYSTEM_ROLES.ADMIN]: 'Acesso total ao sistema, pode gerenciar usuários e configurações',
      [SYSTEM_ROLES.DOCTOR]: 'Pode criar prescrições, visualizar pacientes e agendar consultas',
      [SYSTEM_ROLES.NURSE]: 'Pode auxiliar em consultas e gerenciar medicamentos',
      [SYSTEM_ROLES.RECEPTIONIST]: 'Pode agendar consultas e gerenciar pacientes',
    };
    return descriptions[role] || '';
  };

  const handleSingleRoleChange = (role: string) => {
    onRoleChange?.([role]);
  };

  const handleMultipleRoleToggle = (role: string, checked: boolean) => {
    if (checked) {
      onRoleChange?.([...selectedRoles, role]);
    } else {
      onRoleChange?.(selectedRoles.filter(r => r !== role));
    }
  };

  const handleAssignRole = async () => {
    if (!user || !selectedRole) return;

    try {
      await assignRole.mutateAsync({
        user_id: user.id,
        role: selectedRole,
      });
      setIsAssignDialogOpen(false);
      setSelectedRole('');
      toast.success('Perfil atribuído com sucesso!');
    } catch (error) {
      toast.error('Erro ao atribuir perfil');
    }
  };

  const handleRemoveRole = async () => {
    if (!user || !roleToRemove) return;

    try {
      await removeRole.mutateAsync({
        user_id: user.id,
        role: roleToRemove,
      });
      setRoleToRemove(null);
      toast.success('Perfil removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover perfil');
    }
  };

  const availableRoles = Object.values(SYSTEM_ROLES).filter(
    role => !selectedRoles.includes(role)
  );

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  // Modo de seleção única
  if (mode === 'single') {
    return (
      <div className={className}>
        <Select
          value={selectedRoles[0] || ''}
          onValueChange={handleSingleRoleChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um perfil" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(SYSTEM_ROLES).map((role) => {
              const Icon = getRoleIcon(role);
              return (
                <SelectItem key={role} value={role}>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{getRoleLabel(role)}</div>
                      {showDescription && (
                        <div className="text-xs text-muted-foreground">
                          {getRoleDescription(role)}
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Modo de seleção múltipla
  if (mode === 'multiple' && !user) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(SYSTEM_ROLES).map((role) => {
            const Icon = getRoleIcon(role);
            const isSelected = selectedRoles.includes(role);
            
            return (
              <Card
                key={role}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (!disabled) {
                    handleMultipleRoleToggle(role, !isSelected);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      disabled={disabled}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5" />
                        <h3 className="font-medium">{getRoleLabel(role)}</h3>
                      </div>
                      {showDescription && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {getRoleDescription(role)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Modo de gestão de perfis para usuário específico
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Perfis do Usuário</h3>
        {availableRoles.length > 0 && (
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={disabled}>
                <Plus className="mr-2 h-4 w-4" />
                Atribuir Perfil
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atribuir Novo Perfil</DialogTitle>
                <DialogDescription>
                  Selecione um perfil para atribuir ao usuário {user?.full_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => {
                      const Icon = getRoleIcon(role);
                      return (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{getRoleLabel(role)}</div>
                              <div className="text-xs text-muted-foreground">
                                {getRoleDescription(role)}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAssignDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssignRole}
                  disabled={!selectedRole || assignRole.isPending}
                >
                  {assignRole.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Atribuir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {selectedRoles.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum perfil atribuído</p>
              <p className="text-sm">Clique em "Atribuir Perfil" para começar</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedRoles.map((role) => {
            const Icon = getRoleIcon(role);
            const isSystemRole = Object.values(SYSTEM_ROLES).includes(role as any);
            
            return (
              <Card key={role} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getRoleColor(role)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{getRoleLabel(role)}</h4>
                        {showDescription && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {getRoleDescription(role)}
                          </p>
                        )}
                        {isSystemRole && (
                          <Badge variant="outline" className="mt-2">
                            Perfil do Sistema
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {!disabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRoleToRemove(role)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmação de remoção */}
      <AlertDialog open={!!roleToRemove} onOpenChange={() => setRoleToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              Remover Perfil
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o perfil <strong>{getRoleLabel(roleToRemove || '')}</strong> do usuário <strong>{user?.full_name}</strong>?
              <br /><br />
              Esta ação pode afetar as permissões do usuário no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveRole}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeRole.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Componente para exibir perfis de forma compacta
interface RoleBadgesProps {
  roles: string[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcons?: boolean;
}

export function RoleBadges({ roles, maxDisplay = 3, size = 'md', showIcons = true }: RoleBadgesProps) {
  const displayRoles = roles.slice(0, maxDisplay);
  const remainingCount = roles.length - maxDisplay;

  const getRoleIcon = (role: string) => {
    const icons = {
      [SYSTEM_ROLES.ADMIN]: Crown,
      [SYSTEM_ROLES.DOCTOR]: Stethoscope,
      [SYSTEM_ROLES.NURSE]: Heart,
      [SYSTEM_ROLES.RECEPTIONIST]: UserCheck,
    };
    return icons[role] || Shield;
  };

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
      [SYSTEM_ROLES.ADMIN]: 'Admin',
      [SYSTEM_ROLES.DOCTOR]: 'Médico',
      [SYSTEM_ROLES.NURSE]: 'Enfermeiro',
      [SYSTEM_ROLES.RECEPTIONIST]: 'Recepcionista',
    };
    return labels[role] || role;
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center space-x-1 flex-wrap">
      {displayRoles.map((role) => {
        const Icon = getRoleIcon(role);
        return (
          <Badge
            key={role}
            className={`${getRoleColor(role)} ${sizeClasses[size]} flex items-center space-x-1`}
          >
            {showIcons && <Icon className={iconSizes[size]} />}
            <span>{getRoleLabel(role)}</span>
          </Badge>
        );
      })}
      {remainingCount > 0 && (
        <Badge variant="outline" className={sizeClasses[size]}>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}