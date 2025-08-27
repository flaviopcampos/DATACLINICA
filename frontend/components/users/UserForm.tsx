'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  UserCreate,
  UserUpdate,
  SYSTEM_ROLES,
} from '@/types/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Eye, EyeOff, Save, X, User as UserIcon, Shield, Phone, Mail, FileText } from 'lucide-react';
import { toast } from 'sonner';

// Schema de validação
const userFormSchema = z.object({
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(50, 'Username deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username deve conter apenas letras, números e underscore'),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  full_name: z
    .string()
    .min(2, 'Nome completo deve ter pelo menos 2 caracteres')
    .max(255, 'Nome completo deve ter no máximo 255 caracteres'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'
    )
    .optional(),
  confirm_password: z.string().optional(),
  role: z.enum([SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.DOCTOR, SYSTEM_ROLES.NURSE, SYSTEM_ROLES.RECEPTIONIST]),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional()
    .or(z.literal('')),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato XXX.XXX.XXX-XX')
    .optional()
    .or(z.literal('')),
  professional_license: z
    .string()
    .max(50, 'Registro profissional deve ter no máximo 50 caracteres')
    .optional()
    .or(z.literal('')),
  specialty: z
    .string()
    .max(100, 'Especialidade deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean().default(true),
  clinic_id: z.string().optional(),
}).refine((data) => {
  if (data.password && data.confirm_password) {
    return data.password === data.confirm_password;
  }
  return true;
}, {
  message: 'Senhas não coincidem',
  path: ['confirm_password'],
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserCreate | UserUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function UserForm({ user, onSubmit, onCancel, isLoading = false, mode }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      full_name: user?.full_name || '',
      password: '',
      confirm_password: '',
      role: user?.role || SYSTEM_ROLES.RECEPTIONIST,
      phone: user?.phone || '',
      cpf: user?.cpf || '',
      professional_license: user?.professional_license || '',
      specialty: user?.specialty || '',
      is_active: user?.is_active ?? true,
      clinic_id: user?.clinic_id || '',
    },
  });

  const watchedRole = form.watch('role');
  const isDoctor = watchedRole === SYSTEM_ROLES.DOCTOR;
  const isNurse = watchedRole === SYSTEM_ROLES.NURSE;
  const requiresProfessionalInfo = isDoctor || isNurse;

  // Atualizar validação baseada no role
  useEffect(() => {
    if (requiresProfessionalInfo) {
      form.setValue('professional_license', form.getValues('professional_license') || '');
      if (isDoctor) {
        form.setValue('specialty', form.getValues('specialty') || '');
      }
    }
  }, [watchedRole, form, requiresProfessionalInfo, isDoctor]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      const submitData = {
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        phone: data.phone || undefined,
        cpf: data.cpf || undefined,
        professional_license: data.professional_license || undefined,
        specialty: data.specialty || undefined,
        is_active: data.is_active,
        clinic_id: data.clinic_id || undefined,
      };

      if (mode === 'create') {
        await onSubmit({
          ...submitData,
          password: data.password!,
        } as UserCreate);
      } else {
        const updateData: UserUpdate = { ...submitData };
        if (data.password) {
          updateData.password = data.password;
        }
        await onSubmit(updateData);
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === 'create' ? 'Criar Novo Usuário' : 'Editar Usuário'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'create'
              ? 'Preencha os dados para criar um novo usuário no sistema'
              : 'Atualize as informações do usuário'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="mr-2 h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Dados principais do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o username" {...field} />
                      </FormControl>
                      <FormDescription>
                        Usado para login no sistema
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          type="email"
                          placeholder="Digite o email"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="(XX) XXXXX-XXXX"
                            className="pl-10"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatPhone(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="XXX.XXX.XXX-XX"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Perfil e Permissões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Perfil e Permissões
              </CardTitle>
              <CardDescription>
                Defina o papel do usuário no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(SYSTEM_ROLES).map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center justify-between w-full">
                              <span>{getRoleLabel(role)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {watchedRole && (
                      <FormDescription>
                        {getRoleDescription(watchedRole)}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Usuário Ativo</FormLabel>
                      <FormDescription>
                        Usuários inativos não podem acessar o sistema
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

          {/* Informações Profissionais */}
          {requiresProfessionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Informações Profissionais
                </CardTitle>
                <CardDescription>
                  Dados específicos para profissionais de saúde
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="professional_license"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {isDoctor ? 'CRM' : 'COREN'} {requiresProfessionalInfo ? '*' : ''}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`Digite o ${isDoctor ? 'CRM' : 'COREN'}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isDoctor && (
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidade</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite a especialidade"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Senha */}
          <Card>
            <CardHeader>
              <CardTitle>Senha</CardTitle>
              <CardDescription>
                {mode === 'create'
                  ? 'Defina uma senha segura para o usuário'
                  : 'Deixe em branco para manter a senha atual'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {mode === 'create' ? 'Senha *' : 'Nova Senha'}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Digite a senha"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {mode === 'create' ? 'Confirmar Senha *' : 'Confirmar Nova Senha'}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirme a senha"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}