'use client';

import { useState, useEffect } from 'react';
import { User, UserCreate, UserUpdate } from '@/types/users';
import { UserForm } from './UserForm';
import { RoleBadges } from './RoleSelector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Crown,
  Stethoscope,
  Heart,
  UserCheck,
  Activity,
  FileText,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { SYSTEM_ROLES, USER_STATUS } from '@/types/users';
import { useUserAuditLogs } from '@/hooks/useAudit';
import { toast } from 'sonner';

interface UserDialogProps {
  user?: User | null;
  mode: 'view' | 'edit' | 'create';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: UserCreate | UserUpdate) => Promise<void>;
  loading?: boolean;
}

export function UserDialog({
  user,
  mode,
  open,
  onOpenChange,
  onSave,
  loading = false,
}: UserDialogProps) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [activeTab, setActiveTab] = useState('details');

  // Reset mode when dialog opens/closes or user changes
  useEffect(() => {
    setCurrentMode(mode);
    setActiveTab('details');
  }, [mode, user, open]);

  const { data: auditLogs, isLoading: auditLoading } = useUserAuditLogs(
    user?.id || '',
    { enabled: !!user?.id && open && activeTab === 'audit' }
  );

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

  const handleSave = async (data: UserCreate | UserUpdate) => {
    try {
      await onSave?.(data);
      setCurrentMode('view');
      toast.success(
        mode === 'create' ? 'Usuário criado com sucesso!' : 'Usuário atualizado com sucesso!'
      );
    } catch (error) {
      toast.error(
        mode === 'create' ? 'Erro ao criar usuário' : 'Erro ao atualizar usuário'
      );
    }
  };

  const handleCancel = () => {
    if (mode === 'create') {
      onOpenChange(false);
    } else {
      setCurrentMode('view');
    }
  };

  const isUserLocked = user?.locked_until && new Date(user.locked_until) > new Date();
  const hasFailedAttempts = user?.failed_login_attempts && user.failed_login_attempts > 0;

  const getDialogTitle = () => {
    if (mode === 'create') return 'Novo Usuário';
    if (currentMode === 'edit') return 'Editar Usuário';
    return 'Detalhes do Usuário';
  };

  const getDialogDescription = () => {
    if (mode === 'create') return 'Preencha as informações para criar um novo usuário.';
    if (currentMode === 'edit') return 'Edite as informações do usuário.';
    return 'Visualize e gerencie as informações do usuário.';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{getDialogTitle()}</DialogTitle>
              <DialogDescription>{getDialogDescription()}</DialogDescription>
            </div>
            
            {user && currentMode === 'view' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMode('edit')}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {currentMode === 'edit' || mode === 'create' ? (
            <div className="space-y-6">
              <UserForm
                user={user}
                onSubmit={handleSave}
                onCancel={handleCancel}
                loading={loading}
                mode={mode}
              />
            </div>
          ) : user ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Detalhes
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Atividade
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Auditoria
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 overflow-y-auto max-h-[60vh]">
                <TabsContent value="details" className="space-y-6">
                  {/* Header do usuário */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={user.avatar_url} alt={user.full_name} />
                          <AvatarFallback className="bg-primary/10 text-xl">
                            {getUserInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-2xl font-bold">{user.full_name}</h3>
                            <p className="text-muted-foreground text-lg">@{user.username}</p>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const RoleIcon = getRoleIcon(user.role);
                                return <RoleIcon className="h-4 w-4" />;
                              })()}
                              <RoleBadges roles={[user.role]} size="md" />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const StatusIcon = getStatusIcon(
                                  user.is_active ? 'active' : 'inactive',
                                  !!isUserLocked
                                );
                                return (
                                  <Badge className={getStatusColor(
                                    user.is_active ? 'active' : 'inactive',
                                    !!isUserLocked
                                  )}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {getStatusLabel(
                                      user.is_active ? 'active' : 'inactive',
                                      !!isUserLocked
                                    )}
                                  </Badge>
                                );
                              })()}
                            </div>
                          </div>
                          
                          {/* Alertas de segurança */}
                          {(hasFailedAttempts || isUserLocked) && (
                            <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                              <span className="text-sm text-amber-800">
                                {isUserLocked
                                  ? `Conta bloqueada até ${formatDate(user.locked_until!)}`
                                  : `${user.failed_login_attempts} tentativas de login falharam`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informações de contato */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Informações de Contato
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                        </div>
                        
                        {user.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Telefone</p>
                              <p className="font-medium">{user.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        {user.cpf && (
                          <div className="flex items-center space-x-3">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">CPF</p>
                              <p className="font-medium">{user.cpf}</p>
                            </div>
                          </div>
                        )}
                        
                        {user.clinic_id && (
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Clínica</p>
                              <p className="font-medium">{user.clinic_id}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informações profissionais */}
                  {(user.professional_license || user.specialty) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Stethoscope className="h-5 w-5" />
                          Informações Profissionais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {user.professional_license && (
                            <div>
                              <p className="text-sm text-muted-foreground">Registro Profissional</p>
                              <p className="font-medium">{user.professional_license}</p>
                            </div>
                          )}
                          
                          {user.specialty && (
                            <div>
                              <p className="text-sm text-muted-foreground">Especialidade</p>
                              <p className="font-medium">{user.specialty}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Informações do sistema */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Informações do Sistema
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Criado em</p>
                            <p className="font-medium">{formatDate(user.created_at)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Atualizado em</p>
                            <p className="font-medium">{formatDate(user.updated_at)}</p>
                          </div>
                        </div>
                        
                        {user.last_login && (
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Último acesso</p>
                              <p className="font-medium">{formatDate(user.last_login)}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-3">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">ID do usuário</p>
                            <p className="font-medium font-mono text-xs">{user.id}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Atividade Recente</CardTitle>
                      <CardDescription>
                        Últimas atividades e estatísticas do usuário
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {user.failed_login_attempts || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Tentativas Falharam</div>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {user.last_login ? '1' : '0'}
                          </div>
                          <div className="text-sm text-muted-foreground">Sessões Ativas</div>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                          </div>
                          <div className="text-sm text-muted-foreground">Dias no Sistema</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="audit" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Log de Auditoria</CardTitle>
                      <CardDescription>
                        Histórico de ações realizadas pelo usuário
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {auditLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                              <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                          ))}
                        </div>
                      ) : auditLogs && auditLogs.length > 0 ? (
                        <div className="space-y-4">
                          {auditLogs.slice(0, 10).map((log) => (
                            <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                              <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">{log.action}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(log.created_at)}
                                  </span>
                                </div>
                                {log.resource_type && (
                                  <p className="text-sm text-muted-foreground">
                                    Recurso: {log.resource_type}
                                    {log.resource_id && ` (${log.resource_id})`}
                                  </p>
                                )}
                                {log.details && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Nenhum log de auditoria encontrado</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}