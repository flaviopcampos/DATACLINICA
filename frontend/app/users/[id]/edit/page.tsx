'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserUpdate } from '@/types/users';
import { UserForm } from '@/components/users';
import { useUser, useUpdateUser } from '@/hooks/useUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Edit, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('');
  
  // Resolve params Promise
  React.useEffect(() => {
    params.then(resolvedParams => {
      setUserId(resolvedParams.id);
    });
  }, [params]);
  
  const { data: user, isLoading, error } = useUser(userId);
  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (data: UserUpdate) => {
    setIsSubmitting(true);
    try {
      await updateUserMutation.mutateAsync({ id: userId, data });
      toast.success('Usuário atualizado com sucesso!');
      router.push(`/users/${userId}`);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/users/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-9 w-20" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>

        {/* Form Skeleton */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
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
                <Edit className="h-6 w-6" />
                Editar Usuário
              </h1>
            </div>
          </div>
        </div>

        {/* Error Alert */}
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
                <Edit className="h-6 w-6" />
                Editar Usuário
              </h1>
            </div>
          </div>
        </div>

        {/* Not Found Alert */}
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
            onClick={() => router.push(`/users/${userId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Edit className="h-6 w-6" />
              Editar Usuário
            </h1>
            <p className="text-muted-foreground">
              Editando: {user.full_name} (@{user.username})
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>
            Edite as informações do usuário. Campos marcados com * são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            user={user}
            mode="edit"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}