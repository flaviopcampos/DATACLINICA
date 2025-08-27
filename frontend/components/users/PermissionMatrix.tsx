'use client';

import { useState, useMemo } from 'react';
import {
  User,
  UserRole,
  Module,
  RolePermission,
  SYSTEM_ROLES,
  RESOURCE_TYPES,
} from '@/types/users';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  RotateCcw,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Users,
  FileText,
  Calendar,
  Package,
  BarChart3,
  Lock,
  Unlock,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  usePermissions,
  useUserPermissions,
  usePermissionMatrix,
  useModules,
} from '@/hooks/usePermissions';
import { useUpdateRolePermissions } from '@/hooks/useRoles';
import { cn } from '@/lib/utils';

interface PermissionMatrixProps {
  user?: User;
  role?: string;
  mode?: 'user' | 'role' | 'overview';
  editable?: boolean;
  showActions?: boolean;
  className?: string;
}

type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

const PERMISSION_ACTIONS: PermissionAction[] = ['create', 'read', 'update', 'delete', 'manage'];

const ACTION_LABELS = {
  create: 'Criar',
  read: 'Visualizar',
  update: 'Editar',
  delete: 'Excluir',
  manage: 'Gerenciar',
};

const ACTION_ICONS = {
  create: Plus,
  read: Eye,
  update: Edit,
  delete: Trash2,
  manage: Settings,
};

const RESOURCE_ICONS = {
  [RESOURCE_TYPES.USERS]: Users,
  [RESOURCE_TYPES.PATIENTS]: Users,
  [RESOURCE_TYPES.APPOINTMENTS]: Calendar,
  [RESOURCE_TYPES.PRESCRIPTIONS]: FileText,
  [RESOURCE_TYPES.INVENTORY]: Package,
  [RESOURCE_TYPES.REPORTS]: BarChart3,
};

export function PermissionMatrix({
  user,
  role,
  mode = 'overview',
  editable = false,
  showActions = true,
  className,
}: PermissionMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>(role || 'all');
  const [editingPermissions, setEditingPermissions] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const { data: modules, isLoading: modulesLoading } = useModules();
  const { data: permissions, isLoading: permissionsLoading } = usePermissions();
  const { data: userPermissions, isLoading: userPermissionsLoading } = useUserPermissions(
    user?.id,
    { enabled: !!user && mode === 'user' }
  );
  const { data: permissionMatrix, isLoading: matrixLoading } = usePermissionMatrix({
    enabled: mode === 'overview'
  });
  const updateRolePermissions = useUpdateRolePermissions();

  const isLoading = modulesLoading || permissionsLoading || userPermissionsLoading || matrixLoading;

  // Filtrar recursos baseado na busca e filtros
  const filteredResources = useMemo(() => {
    if (!modules) return [];
    
    return modules.filter(module => {
      const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesResource = selectedResource === 'all' || module.resource_type === selectedResource;
      
      return matchesSearch && matchesResource;
    });
  }, [modules, searchTerm, selectedResource]);

  // Obter permissões para um recurso e ação específicos
  const getPermissionKey = (resourceType: string, action: PermissionAction) => {
    return `${resourceType}:${action}`;
  };

  const hasPermission = (resourceType: string, action: PermissionAction) => {
    const key = getPermissionKey(resourceType, action);
    
    if (mode === 'user' && userPermissions) {
      return userPermissions.some(p => 
        p.resource_type === resourceType && p.action === action
      );
    }
    
    if (editingPermissions.hasOwnProperty(key)) {
      return editingPermissions[key];
    }
    
    // Lógica padrão baseada no papel
    if (selectedRole === SYSTEM_ROLES.ADMIN) {
      return true; // Admin tem todas as permissões
    }
    
    // Outras lógicas de permissão baseadas no papel
    return false;
  };

  const togglePermission = (resourceType: string, action: PermissionAction) => {
    if (!editable) return;
    
    const key = getPermissionKey(resourceType, action);
    const currentValue = hasPermission(resourceType, action);
    
    setEditingPermissions(prev => ({
      ...prev,
      [key]: !currentValue,
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedRole || selectedRole === 'all') {
      toast.error('Selecione um perfil para salvar as alterações');
      return;
    }

    try {
      // Converter editingPermissions para o formato esperado pela API
      const permissionsToUpdate = Object.entries(editingPermissions).map(([key, enabled]) => {
        const [resourceType, action] = key.split(':');
        return {
          resource_type: resourceType,
          action: action as PermissionAction,
          enabled,
        };
      });

      await updateRolePermissions.mutateAsync({
        role: selectedRole,
        permissions: permissionsToUpdate,
      });

      setEditingPermissions({});
      setHasChanges(false);
      setIsSaveDialogOpen(false);
      toast.success('Permissões atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar permissões');
    }
  };

  const handleResetChanges = () => {
    setEditingPermissions({});
    setHasChanges(false);
  };

  const getActionColor = (action: PermissionAction, hasPermission: boolean) => {
    if (!hasPermission) return 'text-gray-400';
    
    const colors = {
      create: 'text-green-600',
      read: 'text-blue-600',
      update: 'text-yellow-600',
      delete: 'text-red-600',
      manage: 'text-purple-600',
    };
    return colors[action];
  };

  const getResourceIcon = (resourceType: string) => {
    return RESOURCE_ICONS[resourceType] || Shield;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Matriz de Permissões</h2>
          <p className="text-muted-foreground">
            {mode === 'user' && user
              ? `Permissões do usuário ${user.full_name}`
              : mode === 'role' && selectedRole !== 'all'
              ? `Permissões do perfil ${selectedRole}`
              : 'Visão geral das permissões do sistema'}
          </p>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <>
                <Button variant="outline" size="sm" onClick={handleResetChanges}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Resetar
                </Button>
                <Button size="sm" onClick={() => setIsSaveDialogOpen(true)}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </>
            )}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Recursos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resource-filter">Filtrar por Recurso</Label>
              <Select value={selectedResource} onValueChange={setSelectedResource}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os recursos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os recursos</SelectItem>
                  {Object.values(RESOURCE_TYPES).map((resourceType) => {
                    const Icon = getResourceIcon(resourceType);
                    return (
                      <SelectItem key={resourceType} value={resourceType}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span className="capitalize">{resourceType}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            {mode !== 'user' && (
              <div className="space-y-2">
                <Label htmlFor="role-filter">Filtrar por Perfil</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os perfis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os perfis</SelectItem>
                    {Object.values(SYSTEM_ROLES).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Matriz de Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Matriz de Permissões
          </CardTitle>
          <CardDescription>
            {editable
              ? 'Clique nas células para alterar as permissões'
              : 'Visualização das permissões atuais'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Recurso</TableHead>
                  {PERMISSION_ACTIONS.map((action) => {
                    const Icon = ACTION_ICONS[action];
                    return (
                      <TableHead key={action} className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Icon className="h-4 w-4" />
                          <span>{ACTION_LABELS[action]}</span>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((module) => {
                  const ResourceIcon = getResourceIcon(module.resource_type);
                  
                  return (
                    <TableRow key={module.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <ResourceIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{module.name}</div>
                            {module.description && (
                              <div className="text-sm text-muted-foreground">
                                {module.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      {PERMISSION_ACTIONS.map((action) => {
                        const hasPermissionValue = hasPermission(module.resource_type, action);
                        const isEditable = editable && selectedRole !== 'all';
                        
                        return (
                          <TableCell key={action} className="text-center">
                            <div className="flex justify-center">
                              {isEditable ? (
                                <Checkbox
                                  checked={hasPermissionValue}
                                  onCheckedChange={() => togglePermission(module.resource_type, action)}
                                  className="h-5 w-5"
                                />
                              ) : (
                                <div className={cn(
                                  'flex items-center justify-center w-5 h-5 rounded',
                                  hasPermissionValue
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-400'
                                )}>
                                  {hasPermissionValue ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <X className="h-3 w-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredResources.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum recurso encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {PERMISSION_ACTIONS.map((action) => {
              const Icon = ACTION_ICONS[action];
              return (
                <div key={action} className="flex items-center space-x-2">
                  <Icon className={cn('h-4 w-4', getActionColor(action, true))} />
                  <span className="text-sm">{ACTION_LABELS[action]}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação para salvar */}
      <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Save className="mr-2 h-5 w-5" />
              Salvar Alterações
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja salvar as alterações nas permissões do perfil <strong>{selectedRole}</strong>?
              <br /><br />
              Esta ação irá afetar todos os usuários com este perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveChanges}>
              {updateRolePermissions.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              Salvar Alterações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Componente para exibir resumo de permissões
interface PermissionSummaryProps {
  user?: User;
  role?: string;
  compact?: boolean;
}

export function PermissionSummary({ user, role, compact = false }: PermissionSummaryProps) {
  const { data: userPermissions, isLoading } = useUserPermissions(
    user?.id,
    { enabled: !!user }
  );

  if (isLoading) {
    return <LoadingSpinner size="sm" />;
  }

  if (!userPermissions || userPermissions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Nenhuma permissão específica
      </div>
    );
  }

  const permissionsByResource = userPermissions.reduce((acc, permission) => {
    if (!acc[permission.resource_type]) {
      acc[permission.resource_type] = [];
    }
    acc[permission.resource_type].push(permission.action);
    return acc;
  }, {} as Record<string, string[]>);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(permissionsByResource).map(([resource, actions]) => {
          const Icon = getResourceIcon(resource);
          return (
            <Badge key={resource} variant="outline" className="text-xs">
              <Icon className="mr-1 h-3 w-3" />
              {resource} ({actions.length})
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(permissionsByResource).map(([resource, actions]) => {
        const Icon = getResourceIcon(resource);
        return (
          <div key={resource} className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium capitalize">{resource}:</span>
            <div className="flex space-x-1">
              {actions.map((action) => (
                <Badge key={action} variant="secondary" className="text-xs">
                  {ACTION_LABELS[action as PermissionAction]}
                </Badge>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}