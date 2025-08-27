'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role, RoleCreate, RoleUpdate } from '@/types/users';
import { RoleSelector, PermissionMatrix } from '@/components/users';
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useUpdateRolePermissions,
} from '@/hooks/useRoles';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  Users,
  Settings,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  UserCheck,
  Stethoscope,
  Heart,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

const roleIcons = {
  admin: Crown,
  doctor: Stethoscope,
  nurse: Heart,
  receptionist: Phone,
  default: Shield,
};

const roleColors = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  doctor: 'bg-blue-100 text-blue-800 border-blue-200',
  nurse: 'bg-green-100 text-green-800 border-green-200',
  receptionist: 'bg-purple-100 text-purple-800 border-purple-200',
  default: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function ProfilesPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<RoleCreate>>({});
  const [activeTab, setActiveTab] = useState('roles');

  const { data: roles, isLoading: rolesLoading, refetch: refetchRoles } = useRoles();
  const { data: permissions, isLoading: permissionsLoading } = usePermissions();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const updatePermissionsMutation = useUpdateRolePermissions();

  const handleCreateRole = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Nome e descrição são obrigatórios');
      return;
    }

    try {
      await createRoleMutation.mutateAsync(formData as RoleCreate);
      toast.success('Perfil criado com sucesso!');
      setShowCreateDialog(false);
      setFormData({});
      refetchRoles();
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      toast.error('Erro ao criar perfil');
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole || !formData.name || !formData.description) {
      toast.error('Nome e descrição são obrigatórios');
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        id: selectedRole.id,
        data: formData as RoleUpdate,
      });
      toast.success('Perfil atualizado com sucesso!');
      setShowEditDialog(false);
      setSelectedRole(null);
      setFormData({});
      refetchRoles();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await deleteRoleMutation.mutateAsync(selectedRole.id);
      toast.success('Perfil excluído com sucesso!');
      setShowDeleteDialog(false);
      setSelectedRole(null);
      refetchRoles();
    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
      toast.error('Erro ao excluir perfil');
    }
  };

  const handleUpdatePermissions = async (roleId: string, permissions: string[]) => {
    try {
      await updatePermissionsMutation.mutateAsync({ roleId, permissions });
      toast.success('Permissões atualizadas com sucesso!');
      refetchRoles();
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      toast.error('Erro ao atualizar permissões');
    }
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      is_active: role.is_active,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteDialog(true);
  };

  const openPermissionsDialog = (role: Role) => {
    setSelectedRole(role);
    setShowPermissionsDialog(true);
  };

  const getRoleIcon = (roleName: string) => {
    const iconKey = roleName.toLowerCase() as keyof typeof roleIcons;
    return roleIcons[iconKey] || roleIcons.default;
  };

  const getRoleColor = (roleName: string) => {
    const colorKey = roleName.toLowerCase() as keyof typeof roleColors;
    return roleColors[colorKey] || roleColors.default;
  };

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex space-x-1">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Gestão de Perfis e Permissões
          </h1>
          <p className="text-muted-foreground">
            Configure os perfis de usuário e suas respectivas permissões no sistema
          </p>
        </div>
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Perfil
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Perfis
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Matriz de Permissões
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          {roles && roles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => {
                const IconComponent = getRoleIcon(role.name);
                const colorClass = getRoleColor(role.name);
                
                return (
                  <Card key={role.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(role)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPermissionsDialog(role)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Permissões
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(role)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant={role.is_active ? 'default' : 'secondary'}
                          className={role.is_active ? 'bg-green-100 text-green-800' : ''}
                        >
                          {role.is_active ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {role.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Usuários:</span>
                        <span className="font-medium">{role.user_count || 0}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Permissões:</span>
                        <span className="font-medium">{role.permissions?.length || 0}</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Criado em {formatDate(role.created_at)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum perfil encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crie o primeiro perfil para começar a gerenciar permissões de usuários.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Perfil
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          {roles && permissions ? (
            <PermissionMatrix
              roles={roles}
              permissions={permissions}
              onUpdatePermissions={handleUpdatePermissions}
            />
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Carregando matriz de permissões...
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Perfil</DialogTitle>
            <DialogDescription>
              Defina um novo perfil de usuário com suas respectivas permissões.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Perfil</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Médico, Enfermeiro, Recepcionista"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva as responsabilidades deste perfil"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setFormData({});
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateRole}
              disabled={createRoleMutation.isPending}
            >
              {createRoleMutation.isPending ? 'Criando...' : 'Criar Perfil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize as informações do perfil selecionado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome do Perfil</Label>
              <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Médico, Enfermeiro, Recepcionista"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva as responsabilidades deste perfil"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedRole(null);
                setFormData({});
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditRole}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o perfil <strong>{selectedRole?.name}</strong>?
              Esta ação não pode ser desfeita e afetará todos os usuários com este perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedRole(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={deleteRoleMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteRoleMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Permissões - {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Configure as permissões específicas para este perfil.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRole && permissions && (
            <PermissionMatrix
              roles={[selectedRole]}
              permissions={permissions}
              onUpdatePermissions={handleUpdatePermissions}
              showOnlyRole={selectedRole.id}
            />
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPermissionsDialog(false);
                setSelectedRole(null);
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}