'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserUpdate } from '@/types/users';
import { UserDialog, UserCard, UserStats } from '@/components/users';
import {
  useUser,
  useUpdateUser,
  useDeleteUser,
  useToggleUserStatus,
  useUnlockUser,
} from '@/hooks/useUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  ArrowLeft,
  Edit,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
  Unlock,
  AlertTriangle,
  Eye,
  Settings,
  Activity,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

  // Resolve params Promise
  React.useEffect(() => {
    params.then(resolvedParams => {
      setUserId(resolvedParams.id);
    });
  }, [params]);

  const { data: user, isLoading, error, refetch } = useUser(userId);
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const updateStatusMutation = useToggleUserStatus();
  const unlockUserMutation = useUnlockUser();

  const handleEdit = async (data: UserUpdate) => {
    try {
      await updateUserMutation.mutateAsync({ id: userId, data });
      toast.success('Usuário atualizado com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
      throw error;
    }
  };

  const handleDelete = async () => {
    setActionLoading('delete');
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.success('Usuário excluído com sucesso!');
      router.push('/users');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    } finally {
      setActionLoading(null);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    
    setActionLoading('status');
    try {
      await updateStatusMutation.mutateAsync({
        id: userId,
        isActive: !user.is_active,
      });
      toast.success(
        `Usuário ${!user.is_active ? 'ativado' : 'desativado'} com sucesso!`
      );
      refetch();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do usuário');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlock = async () => {
    setActionLoading('unlock');
    try {
      await unlockUserMutation.mutateAsync(userId);
      toast.success('Usuário desbloqueado com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      toast.error('Erro ao desbloquear usuário');
    } finally {
      setActionLoading(null);
    }
  };

  const isUserLocked = user?.locked_until && new Date(user.locked_until) > new Date();

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-9 w-20" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/users')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Eye className="h-6 w-6" />
                Detalhes do Usuário
              </h1>
            </div>
          </div>
        </div>

        <Alert variant="destructive" className="max-w-4xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar os dados do usuário. 
            {error instanceof Error ? error.message : 'Tente novamente mais tarde.'}
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={() => router.push('/users')}>
            Voltar para Lista de Usuários
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/users')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Eye className="h-6 w-6" />
                Detalhes do Usuário
              </h1>
            </div>
          </div>
        </div>

        <Alert className="max-w-4xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Usuário não encontrado. Verifique se o ID está correto.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={() => router.push('/users')}>
            Voltar para Lista de Usuários
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/users')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="h-6 w-6" />
              Detalhes do Usuário
            </h1>
            <p className="text-muted-foreground">
              {user.full_name} (@{user.username})
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
              Ações
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push(`/users/${userId}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleToggleStatus} disabled={!!actionLoading}>
              {user.is_active ? (
                <UserX className="mr-2 h-4 w-4" />
              ) : (
                <UserCheck className="mr-2 h-4 w-4" />
              )}
              {user.is_active ? 'Desativar' : 'Ativar'}
            </DropdownMenuItem>
            
            {isUserLocked && (
              <DropdownMenuItem onClick={handleUnlock} disabled={!!actionLoading}>
                <Unlock className="mr-2 h-4 w-4" />
                Desbloquear
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Card */}
          <UserCard
            user={user}
            variant="detailed"
            showActions={false}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/users/${userId}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Usuário
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleStatus}
                  disabled={!!actionLoading}
                >
                  {user.is_active ? (
                    <UserX className="mr-2 h-4 w-4" />
                  ) : (
                    <UserCheck className="mr-2 h-4 w-4" />
                  )}
                  {user.is_active ? 'Desativar' : 'Ativar'}
                </Button>
                
                {isUserLocked && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnlock}
                    disabled={!!actionLoading}
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    Desbloquear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Stats */}
          <UserStats users={[user]} />
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último acesso:</span>
                  <span className="font-medium">
                    {user.last_login ? formatDate(user.last_login) : 'Nunca'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span className="font-medium">{formatDate(user.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atualizado em:</span>
                  <span className="font-medium">{formatDate(user.updated_at)}</span>
                </div>
                {user.failed_login_attempts && user.failed_login_attempts > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Tentativas falharam:</span>
                    <span className="font-medium">{user.failed_login_attempts}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <UserDialog
        user={user}
        mode="view"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleEdit}
        loading={updateUserMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{user.full_name}</strong>?
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!actionLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!!actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === 'delete' ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}