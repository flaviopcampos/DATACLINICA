'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Bell,
  Plug,
  Palette,
  Shield,
  Database,
  Monitor,
  Users,
  Globe,
  Key,
  ChevronRight,
  Activity,
  Mail,
  Smartphone,
  Cloud,
  HardDrive,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  DollarSign,
  Calculator,
  Receipt
} from 'lucide-react';

interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  badge?: string;
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Configure alertas, emails e notificações push',
    icon: Bell,
    href: '/dashboard/settings/notifications',
    status: 'active',
    items: [
      {
        id: 'email-notifications',
        title: 'Notificações por Email',
        description: 'Configure quando receber emails do sistema',
        icon: Mail,
        href: '/dashboard/settings/notifications#email',
        status: 'active'
      },
      {
        id: 'push-notifications',
        title: 'Notificações Push',
        description: 'Alertas em tempo real no navegador',
        icon: Smartphone,
        href: '/dashboard/settings/notifications#push',
        status: 'active'
      },
      {
        id: 'system-alerts',
        title: 'Alertas do Sistema',
        description: 'Notificações críticas e de segurança',
        icon: AlertTriangle,
        href: '/dashboard/settings/notifications#alerts',
        status: 'warning',
        badge: '3 pendentes'
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrações',
    description: 'Conecte com sistemas externos e APIs',
    icon: Plug,
    href: '/dashboard/settings/integrations',
    status: 'active',
    items: [
      {
        id: 'api-keys',
        title: 'Chaves de API',
        description: 'Gerencie chaves de acesso para integrações',
        icon: Key,
        href: '/dashboard/settings/integrations#api-keys',
        status: 'active'
      },
      {
        id: 'webhooks',
        title: 'Webhooks',
        description: 'Configure endpoints para eventos do sistema',
        icon: Globe,
        href: '/dashboard/settings/integrations#webhooks',
        status: 'inactive'
      },
      {
        id: 'third-party',
        title: 'Serviços Externos',
        description: 'Integrações com laboratórios e convênios',
        icon: Cloud,
        href: '/dashboard/settings/integrations#third-party',
        status: 'active',
        badge: '5 conectados'
      }
    ]
  },
  {
    id: 'preferences',
    title: 'Preferências',
    description: 'Personalize a interface e comportamento do sistema',
    icon: Palette,
    href: '/dashboard/settings/preferences',
    status: 'active',
    items: [
      {
        id: 'theme',
        title: 'Tema e Aparência',
        description: 'Cores, modo escuro e personalização visual',
        icon: Palette,
        href: '/dashboard/settings/preferences#theme',
        status: 'active'
      },
      {
        id: 'language',
        title: 'Idioma e Localização',
        description: 'Idioma, fuso horário e formato de data',
        icon: Globe,
        href: '/dashboard/settings/preferences#language',
        status: 'active'
      },
      {
        id: 'dashboard',
        title: 'Layout do Dashboard',
        description: 'Organize widgets e painéis principais',
        icon: Monitor,
        href: '/dashboard/settings/preferences#dashboard',
        status: 'active'
      }
    ]
  },
  {
    id: 'security',
    title: 'Segurança',
    description: 'Configurações de segurança e controle de acesso',
    icon: Shield,
    href: '/dashboard/settings/security',
    status: 'active',
    items: [
      {
        id: 'password-policy',
        title: 'Política de Senhas',
        description: 'Regras de complexidade e expiração',
        icon: Lock,
        href: '/dashboard/settings/security#password-policy',
        status: 'active'
      },
      {
        id: 'session-management',
        title: 'Gestão de Sessões',
        description: 'Timeout e controle de sessões ativas',
        icon: Clock,
        href: '/dashboard/settings/security#sessions',
        status: 'active'
      },
      {
        id: 'audit-logs',
        title: 'Logs de Auditoria',
        description: 'Configurações de logging e retenção',
        icon: Eye,
        href: '/dashboard/settings/security#audit',
        status: 'active'
      }
    ]
  },
  {
    id: 'backup',
    title: 'Backup e Recuperação',
    description: 'Configure backups automáticos e restauração',
    icon: Database,
    href: '/dashboard/settings/backup',
    status: 'active',
    items: [
      {
        id: 'auto-backup',
        title: 'Backup Automático',
        description: 'Agendamento e frequência dos backups',
        icon: Clock,
        href: '/dashboard/settings/backup#auto-backup',
        status: 'active',
        badge: 'Ativo'
      },
      {
        id: 'storage',
        title: 'Armazenamento',
        description: 'Local e nuvem para armazenar backups',
        icon: HardDrive,
        href: '/dashboard/settings/backup#storage',
        status: 'active'
      },
      {
        id: 'retention',
        title: 'Política de Retenção',
        description: 'Por quanto tempo manter os backups',
        icon: Database,
        href: '/dashboard/settings/backup#retention',
        status: 'active'
      }
    ]
  },
  {
    id: 'billing',
    title: 'Faturamento',
    description: 'Configure diárias, preços e políticas de cobrança',
    icon: DollarSign,
    href: '/dashboard/settings/billing',
    status: 'active',
    items: [
      {
        id: 'daily-rates',
        title: 'Diárias Variáveis',
        description: 'Configure preços por tipo de leito e faixas de dias',
        icon: Calculator,
        href: '/dashboard/settings/billing/daily-rates',
        status: 'active'
      },
      {
        id: 'billing-policies',
        title: 'Políticas de Cobrança',
        description: 'Regras de faturamento e descontos',
        icon: Receipt,
        href: '/dashboard/settings/billing/policies',
        status: 'active'
      },
      {
        id: 'payment-methods',
        title: 'Métodos de Pagamento',
        description: 'Configure formas de pagamento aceitas',
        icon: DollarSign,
        href: '/dashboard/settings/billing/payment-methods',
        status: 'active'
      }
    ]
  },
  {
    id: 'system',
    title: 'Sistema',
    description: 'Configurações gerais e monitoramento',
    icon: Settings,
    href: '/dashboard/settings/system',
    status: 'active',
    items: [
      {
        id: 'performance',
        title: 'Performance',
        description: 'Otimizações e cache do sistema',
        icon: Zap,
        href: '/dashboard/settings/system#performance',
        status: 'active'
      },
      {
        id: 'monitoring',
        title: 'Monitoramento',
        description: 'Métricas e alertas de sistema',
        icon: Activity,
        href: '/dashboard/settings/system#monitoring',
        status: 'active'
      },
      {
        id: 'maintenance',
        title: 'Manutenção',
        description: 'Limpeza automática e otimização',
        icon: Settings,
        href: '/dashboard/settings/system#maintenance',
        status: 'active'
      }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'inactive':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4" />;
    case 'inactive':
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function SettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Configurações do Sistema
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie todas as configurações e preferências do DataClínica
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Configurações Ativas</p>
                <p className="text-2xl font-bold text-green-600">24</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Integrações</p>
                <p className="text-2xl font-bold text-blue-600">5</p>
              </div>
              <Plug className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Último Backup</p>
                <p className="text-sm font-bold text-gray-900">Hoje, 03:00</p>
              </div>
              <Database className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(category.status)}`}>
                    {getStatusIcon(category.status)}
                    <span className="capitalize">{category.status === 'active' ? 'Ativo' : category.status}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {category.items.map((item, index) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={item.id}>
                      <Link href={item.href}>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <ItemIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                              {getStatusIcon(item.status)}
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Link>
                      {index < category.items.length - 1 && <Separator className="my-1" />}
                    </div>
                  );
                })}
                
                <Separator className="my-3" />
                
                <Link href={category.href}>
                  <Button variant="outline" className="w-full">
                    Ver Todas as Configurações de {category.title}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às configurações mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/settings/backup">
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Executar Backup Agora
              </Button>
            </Link>
            
            <Link href="/dashboard/settings/security">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Revisar Segurança
              </Button>
            </Link>
            
            <Link href="/dashboard/settings/notifications">
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Configurar Alertas
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}