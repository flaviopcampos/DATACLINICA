'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCreate } from '@/types/users';
import { UserForm } from '@/components/users';
import { useCreateUser } from '@/hooks/useUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function NewUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createUserMutation = useCreateUser();

  const handleSubmit = async (data: UserCreate) => {
    setIsSubmitting(true);
    try {
      await createUserMutation.mutateAsync(data);
      toast.success('Usuário criado com sucesso!');
      router.push('/users');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/users');
  };

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
              <UserPlus className="h-6 w-6" />
              Novo Usuário
            </h1>
            <p className="text-muted-foreground">
              Preencha as informações para criar um novo usuário no sistema
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>
            Preencha todos os campos obrigatórios para criar o usuário.
            O usuário receberá um email com as instruções de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}