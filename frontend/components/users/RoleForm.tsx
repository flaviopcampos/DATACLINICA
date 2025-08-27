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
import { UserCog, Save, X, Shield } from 'lucide-react';

const roleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  level: z.number().min(1).max(10),
  permissions: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
  is_system_role: z.boolean().default(false),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface Role {
  id: string;
  name: string;
  description?: string;
  level: number;
  permissions?: string[];
  is_active: boolean;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

interface RoleFormProps {
  role?: Role;
  onSubmit: (data: RoleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const ROLE_LEVELS = [
  { value: 1, label: 'Nível 1 - Básico', description: 'Acesso limitado apenas às funcionalidades essenciais' },
  { value: 2, label: 'Nível 2 - Operacional', description: 'Acesso às operações do dia a dia' },
  { value: 3, label: 'Nível 3 - Supervisor', description: 'Supervisão de equipes e processos' },
  { value: 4, label: 'Nível 4 - Gerencial', description: 'Gestão de departamentos e relatórios' },
  { value: 5, label: 'Nível 5 - Administrativo', description: 'Administração completa do sistema' },
];

const AVAILABLE_PERMISSIONS = [
  { id: 'patients_read', name: 'Visualizar Pacientes', category: 'Pacientes' },
  { id: 'patients_create', name: 'Criar Pacientes', category: 'Pacientes' },
  { id: 'patients_update', name: 'Editar Pacientes', category: 'Pacientes' },
  { id: 'patients_delete', name: 'Excluir Pacientes', category: 'Pacientes' },
  { id: 'appointments_read', name: 'Visualizar Consultas', category: 'Consultas' },
  { id: 'appointments_create', name: 'Criar Consultas', category: 'Consultas' },
  { id: 'appointments_update', name: 'Editar Consultas', category: 'Consultas' },
  { id: 'appointments_delete', name: 'Excluir Consultas', category: 'Consultas' },
  { id: 'medical_records_read', name: 'Visualizar Prontuários', category: 'Prontuários' },
  { id: 'medical_records_create', name: 'Criar Prontuários', category: 'Prontuários' },
  { id: 'medical_records_update', name: 'Editar Prontuários', category: 'Prontuários' },
  { id: 'users_read', name: 'Visualizar Usuários', category: 'Usuários' },
  { id: 'users_create', name: 'Criar Usuários', category: 'Usuários' },
  { id: 'users_update', name: 'Editar Usuários', category: 'Usuários' },
  { id: 'users_delete', name: 'Excluir Usuários', category: 'Usuários' },
  { id: 'reports_read', name: 'Visualizar Relatórios', category: 'Relatórios' },
  { id: 'reports_create', name: 'Gerar Relatórios', category: 'Relatórios' },
  { id: 'settings_read', name: 'Visualizar Configurações', category: 'Configurações' },
  { id: 'settings_update', name: 'Editar Configurações', category: 'Configurações' },
];

export function RoleForm({ role, onSubmit, onCancel, isLoading = false, mode }: RoleFormProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || []);

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      level: role?.level || 1,
      permissions: role?.permissions || [],
      is_active: role?.is_active ?? true,
      is_system_role: role?.is_system_role ?? false,
    },
  });

  const handleSubmit = async (data: RoleFormData) => {
    try {
      await onSubmit({ ...data, permissions: selectedPermissions });
    } catch (error) {
      console.error('Erro ao salvar role:', error);
    }
  };

  const togglePermission = (permissionId: string) => {
    const newPermissions = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter(p => p !== permissionId)
      : [...selectedPermissions, permissionId];
    setSelectedPermissions(newPermissions);
    form.setValue('permissions', newPermissions);
  };

  const selectAllPermissionsInCategory = (category: string) => {
    const categoryPermissions = AVAILABLE_PERMISSIONS
      .filter(p => p.category === category)
      .map(p => p.id);
    
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
    
    let newPermissions;
    if (allSelected) {
      // Remove all permissions from this category
      newPermissions = selectedPermissions.filter(p => !categoryPermissions.includes(p));
    } else {
      // Add all permissions from this category
      newPermissions = [...new Set([...selectedPermissions, ...categoryPermissions])];
    }
    
    setSelectedPermissions(newPermissions);
    form.setValue('permissions', newPermissions);
  };

  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === 'create' ? 'Criar Novo Role' : 'Editar Role'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'create'
              ? 'Configure um novo role com permissões específicas'
              : 'Modifique as configurações do role'}
          </p>
        </div>
        <UserCog className="h-8 w-8 text-muted-foreground" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Defina o nome, descrição e nível do role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Role *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Médico, Enfermeiro, Administrador" {...field} />
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
                        placeholder="Descreva as responsabilidades e escopo deste role..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Acesso *</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      >
                        {ROLE_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>
                      {ROLE_LEVELS.find(l => l.value === form.watch('level'))?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissões</CardTitle>
              <CardDescription>
                Selecione as permissões que este role deve ter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                const categoryPermissions = permissions.map(p => p.id);
                const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
                const someSelected = categoryPermissions.some(p => selectedPermissions.includes(p));

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{category}</h4>
                        <Badge variant={allSelected ? 'default' : someSelected ? 'secondary' : 'outline'}>
                          {selectedPermissions.filter(p => categoryPermissions.includes(p)).length}/{categoryPermissions.length}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllPermissionsInCategory(category)}
                      >
                        {allSelected ? 'Desmarcar Todos' : 'Marcar Todos'}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedPermissions.includes(permission.id)
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => togglePermission(permission.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium">{permission.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Configurações adicionais do role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Role Ativo</FormLabel>
                      <FormDescription>
                        Roles inativos não podem ser atribuídos a usuários
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

              <FormField
                control={form.control}
                name="is_system_role"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Role do Sistema</FormLabel>
                      <FormDescription>
                        Roles do sistema não podem ser editados ou excluídos
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={role?.is_system_role}
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
              {mode === 'create' ? 'Criar Role' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}