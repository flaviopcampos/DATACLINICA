import { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Bell, 
  Lock, 
  Key,
  Settings,
  Camera
} from 'lucide-react'
import { TwoFactorStatus } from '@/components/profile/TwoFactorStatus'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Perfil | DataClínica',
  description: 'Gerencie suas informações pessoais e configurações de conta',
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

function ProfileContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meu Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Foto do perfil" />
                <AvatarFallback className="text-lg">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Dr. João Silva</h2>
              <p className="text-gray-600 dark:text-gray-400">Médico Cardiologista</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Administrador</Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Ativo
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input id="firstName" defaultValue="João" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input id="lastName" defaultValue="Silva" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="joao.silva@dataclinica.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" defaultValue="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input id="specialty" defaultValue="Cardiologia" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM</Label>
                  <Input id="crm" defaultValue="123456" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Gerencie suas configurações de segurança e autenticação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Senha
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Última alteração há 30 dias
                    </p>
                  </div>
                  <Button variant="outline">Alterar Senha</Button>
                </div>
                <Separator />
              </div>

              {/* Sessions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Sessões Ativas
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gerencie seus dispositivos conectados
                    </p>
                  </div>
                  <Button variant="outline">Ver Sessões</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Segurança - 2FA */}
          <TwoFactorStatus />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificação
              </CardTitle>
              <CardDescription>
                Escolha como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Notificações por Email</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receber notificações importantes por email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Lembretes de Consulta</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receber lembretes sobre consultas agendadas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Alertas de Segurança</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receber alertas sobre atividades suspeitas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
              <CardDescription>
                Personalize sua experiência no DataClínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Tema Escuro</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Usar tema escuro na interface
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Idioma</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Português (Brasil)
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Alterar</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Fuso Horário</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      (GMT-3) Brasília
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Alterar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  )
}