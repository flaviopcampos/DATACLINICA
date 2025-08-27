'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Shield, Save, X } from 'lucide-react';

const permissionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  resource_type: z.string().min(1, 'Tipo de recurso é obrigatório'),
  actions: z.array(z.string()).min(1, 'Pelo menos uma ação deve ser selecionada'),
  is_active: z.boolean().default(true),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

interface Permission {
  id: string;
  name: string;
  description?: string;
  resource_type: string;
  actions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PermissionFormProps {
  permission?: Permission;
  onSubmit: (data: PermissionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const AVAILABLE_ACTIONS = [
  { value: 'create', label: 'Criar' },
  { value: 'read', label: 'Visualizar' },
  { value: 'update', label: 'Editar' },
  { value: 'delete', label: 'Excluir' },
  { value: 'manage', label: 'Gerenciar' },
];

const RESOURCE_TYPES = [
  { value: 'patients', label: 'Pacientes' },
  { value: 'appointments', label: 'Consultas' },
  { value: 'medical_records', label: 'Prontuários' },
  { value: 'prescriptions', label: 'Prescrições' },
  { value: 'users', label: 'Usuários' },
  { value: 'reports', label: 'Relatórios' },
  { value: 'settings', label: 'Configurações' },
];

export function PermissionForm({ permission, onSubmit, onCancel, isLoading = false, mode }: PermissionFormProps) {
  const [selectedActions, setSelectedActions] = useState<string[]>(permission?.actions || []);

  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: permission?.name || '',
      description: permission?.description || '',
      resource_type: permission?.resource_type || '',
      actions: permission?.actions || [],
      is_active: permission?.is_active ?? true,
    },
  });

  const handleSubmit = async (data: PermissionFormData) => {
    try {
      await onSubmit({ ...data, actions: selectedActions });
    } catch (error) {
      console.error('Erro ao salvar permissão:', error);
    }
  };

  const toggleAction = (action: string) => {
    const newActions = selectedActions.includes(action)
      ? selectedActions.filter(a => a !== action)
      : [...selectedActions, action];
    setSelectedActions(newActions);
    form.setValue('actions', newActions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === 'create' ? 'Criar Nova Permissão' : 'Editar Permissão'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'create'
              ? 'Configure uma nova permissão para o sistema'
              : 'Modifique as configurações da permissão'}
          </p>
        </div>
        <Shield className="h-8 w-8 text-muted-foreground" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Defina o nome e descrição da permissão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Permissão *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Visualizar Pacientes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o que esta permissão permite fazer..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Configure o tipo de recurso e ações permitidas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="resource_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Recurso *</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="">Selecione um tipo de recurso</option>
                        {RESOURCE_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Ações Permitidas *</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AVAILABLE_ACTIONS.map((action) => (
                    <div
                      key={action.value}
                      className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedActions.includes(action.value)
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleAction(action.value)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedActions.includes(action.value)}
                        onChange={() => toggleAction(action.value)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">{action.label}</span>
                    </div>
                  ))}
                </div>
                {form.formState.errors.actions && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.actions.message}
                  </p>
                )}
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Permissão Ativa</FormLabel>
                      <FormDescription>
                        Permissões inativas não são aplicadas aos usuários
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {mode === 'create' ? 'Criar Permissão' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}