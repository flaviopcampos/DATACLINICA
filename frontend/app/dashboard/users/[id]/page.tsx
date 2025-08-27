'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  Settings,
  Activity,
  Key,
  AlertTriangle
} from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const { getUserById, deleteUser, toggleUserStatus, resetPassword } = useUsers()
  const { getUserPermissions } = usePermissions()

  const { data: user, isLoading, error } = getUserById(userId)
  const { data: userPermissions, isLoading: isLoadingPermissions } = getUserPermissions(userId)

  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteUser = async () => {
    if (!user) return
    
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o usuário "${user.name}"? Esta ação não pode ser desfeita.`
    )
    
    if (confirmed) {
      setIsDeleting(true)
      try {
        await deleteUser.mutateAsync(userId)
        toast.success('Usuário excluído com sucesso!')
        router.push('/dashboard/users')
      } catch (error) {
        toast.error('Erro ao excluir usuário')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleToggleStatus = async () => {
    if (!user) return
    
    try {
      await toggleUserStatus.mutateAsync({
        userId,
        status: user.status === 'active' ? 'inactive' : 'active'
      })
      toast.success('Status do usuário atualizado!')
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleResetPassword = async () => {
    if (!user) return
    
    const confirmed = window.confirm(
      `Tem certeza que deseja resetar a senha de "${user.name}"? Uma nova senha será enviada por email.`
    )
    
    if (confirmed) {
      try {
        await resetPassword.mutateAsync(userId)
        toast.success('Senha resetada! Nova senha enviada por email.')
      } catch (error) {
        toast.error('Erro ao resetar senha')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'doctor': return 'bg-blue-100 text-blue-800'
      case 'nurse': return 'bg-green-100 text-green-800'
      case 'receptionist': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <p className="font-medium">Erro ao carregar usuário</p>
              <p className="text-sm mt-1">{error.message}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/dashboard/users')}
              >
                Voltar para Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="font-medium text-gray-900">Usuário não encontrado</p>
              <p className="text-gray-600 mt-1">O usuário solicitado não existe ou foi removido.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/dashboard/users')}
              >
                Voltar para Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/dashboard/users')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/users/${userId}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={handleToggleStatus}
            className={user.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
          >
            {user.status === 'active' ? 'Desativar' : 'Ativar'}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteUser}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                      <p className="text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefone</label>
                      <p className="text-gray-900">{user.phone || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">CPF</label>
                      <p className="text-gray-900">{user.cpf || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">CRM</label>
                      <p className="text-gray-900">{user.crm || 'Não aplicável'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Especialidade</label>
                      <p className="text-gray-900">{user.specialty || 'Não aplicável'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Permissões do Usuário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingPermissions ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  ) : userPermissions && userPermissions.length > 0 ? (
                    <div className="space-y-4">
                      {userPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{permission.name}</p>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                          </div>
                          <Badge variant="outline">{permission.module}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Nenhuma permissão específica atribuída.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Histórico de atividades será implementado em breve.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Configurações de Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Autenticação 2FA</p>
                      <p className="text-sm text-gray-600">Proteção adicional da conta</p>
                    </div>
                    <Badge variant={user.twoFactorEnabled ? 'default' : 'secondary'}>
                      {user.twoFactorEnabled ? 'Ativado' : 'Desativado'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Último Login</p>
                      <p className="text-sm text-gray-600">
                        {user.lastLoginAt 
                          ? format(new Date(user.lastLoginAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : 'Nunca fez login'
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleResetPassword}
                    className="w-full gap-2"
                  >
                    <Key className="h-4 w-4" />
                    Resetar Senha
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Avatar & Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <div className="flex justify-center gap-2">
                  <Badge className={getStatusColor(user.status)}>
                    {user.status === 'active' ? 'Ativo' : 
                     user.status === 'inactive' ? 'Inativo' : 'Pendente'}
                  </Badge>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role === 'admin' ? 'Administrador' :
                     user.role === 'doctor' ? 'Médico' :
                     user.role === 'nurse' ? 'Enfermeiro' : 'Recepcionista'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Criado em</span>
                <span className="text-sm font-medium">
                  {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Último acesso</span>
                <span className="text-sm font-medium">
                  {user.lastLoginAt 
                    ? format(new Date(user.lastLoginAt), 'dd/MM/yyyy', { locale: ptBR })
                    : 'Nunca'
                  }
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sessões ativas</span>
                <span className="text-sm font-medium">{user.activeSessions || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}