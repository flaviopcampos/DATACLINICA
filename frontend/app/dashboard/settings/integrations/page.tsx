'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plug,
  Webhook,
  Database,
  Mail,
  MessageSquare,
  CreditCard,
  FileText,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  ExternalLink,
  Key,
  RefreshCw,
  TestTube,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';

interface Integration {
  id: string;
  name: string;
  description: string;
  type: 'api' | 'webhook' | 'database' | 'email' | 'sms' | 'payment' | 'calendar' | 'other';
  status: 'active' | 'inactive' | 'error' | 'testing';
  enabled: boolean;
  config: {
    apiKey?: string;
    apiSecret?: string;
    endpoint?: string;
    webhookUrl?: string;
    username?: string;
    password?: string;
    database?: string;
    host?: string;
    port?: number;
    [key: string]: any;
  };
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'WhatsApp Business API',
    description: 'Envio de mensagens e notificações via WhatsApp',
    type: 'sms',
    status: 'active',
    enabled: true,
    config: {
      apiKey: '****-****-****-1234',
      endpoint: 'https://api.whatsapp.com/v1',
      phoneNumber: '+5511999999999'
    },
    lastSync: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'SendGrid Email',
    description: 'Serviço de envio de emails transacionais',
    type: 'email',
    status: 'active',
    enabled: true,
    config: {
      apiKey: '****-****-****-5678',
      endpoint: 'https://api.sendgrid.com/v3',
      fromEmail: 'noreply@dataclinica.com'
    },
    lastSync: '2024-01-15T09:15:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    name: 'Stripe Payment',
    description: 'Processamento de pagamentos online',
    type: 'payment',
    status: 'inactive',
    enabled: false,
    config: {
      apiKey: '****-****-****-9012',
      webhookSecret: '****-****-****-3456',
      endpoint: 'https://api.stripe.com/v1'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z'
  },
  {
    id: '4',
    name: 'Google Calendar',
    description: 'Sincronização de agendamentos',
    type: 'calendar',
    status: 'error',
    enabled: true,
    config: {
      clientId: '****-****-****-7890',
      clientSecret: '****-****-****-1234',
      redirectUri: 'https://dataclinica.com/auth/google'
    },
    lastSync: '2024-01-14T16:45:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  },
  {
    id: '5',
    name: 'Webhook Notifications',
    description: 'Webhooks para sistemas externos',
    type: 'webhook',
    status: 'testing',
    enabled: true,
    config: {
      webhookUrl: 'https://external-system.com/webhook',
      secret: '****-****-****-5678',
      events: ['appointment.created', 'patient.updated']
    },
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z'
  }
];

const integrationTypes = {
  api: { icon: Plug, label: 'API', color: 'bg-blue-100 text-blue-800' },
  webhook: { icon: Webhook, label: 'Webhook', color: 'bg-purple-100 text-purple-800' },
  database: { icon: Database, label: 'Database', color: 'bg-green-100 text-green-800' },
  email: { icon: Mail, label: 'Email', color: 'bg-orange-100 text-orange-800' },
  sms: { icon: MessageSquare, label: 'SMS', color: 'bg-cyan-100 text-cyan-800' },
  payment: { icon: CreditCard, label: 'Payment', color: 'bg-yellow-100 text-yellow-800' },
  calendar: { icon: Calendar, label: 'Calendar', color: 'bg-red-100 text-red-800' },
  other: { icon: Settings, label: 'Other', color: 'bg-gray-100 text-gray-800' }
};

const statusConfig = {
  active: { icon: CheckCircle, label: 'Ativo', color: 'text-green-600' },
  inactive: { icon: XCircle, label: 'Inativo', color: 'text-gray-600' },
  error: { icon: AlertTriangle, label: 'Erro', color: 'text-red-600' },
  testing: { icon: RefreshCw, label: 'Testando', color: 'text-blue-600' }
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);

  const handleToggleIntegration = async (id: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      // Simular toggle
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { ...integration, enabled, status: enabled ? 'active' : 'inactive' }
          : integration
      ));
    } catch (error) {
      console.error('Erro ao alterar integração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestIntegration = async (id: string) => {
    setTestingIntegration(id);
    try {
      // Simular teste
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { ...integration, status: 'active', lastSync: new Date().toISOString() }
          : integration
      ));
    } catch (error) {
      console.error('Erro ao testar integração:', error);
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { ...integration, status: 'error' }
          : integration
      ));
    } finally {
      setTestingIntegration(null);
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta integração?')) {
      setIntegrations(prev => prev.filter(integration => integration.id !== id));
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusStats = () => {
    const stats = integrations.reduce((acc, integration) => {
      acc[integration.status] = (acc[integration.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return {
      total: integrations.length,
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      error: stats.error || 0,
      testing: stats.testing || 0
    };
  };

  const stats = getStatusStats();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Plug className="h-8 w-8 text-primary" />
              Integrações
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie conexões com sistemas externos e APIs
            </p>
          </div>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Plug className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inativas</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <XCircle className="h-6 w-6 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com Erro</p>
                <p className="text-2xl font-bold text-red-600">{stats.error}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Testando</p>
                <p className="text-2xl font-bold text-blue-600">{stats.testing}</p>
              </div>
              <RefreshCw className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const TypeIcon = integrationTypes[integration.type].icon;
          const StatusIcon = statusConfig[integration.status].icon;
          
          return (
            <Card key={integration.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${integrationTypes[integration.type].color}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={integration.enabled}
                    onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                    disabled={isLoading}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${statusConfig[integration.status].color}`} />
                    <span className={`text-sm font-medium ${statusConfig[integration.status].color}`}>
                      {statusConfig[integration.status].label}
                    </span>
                  </div>
                  <Badge variant="outline" className={integrationTypes[integration.type].color}>
                    {integrationTypes[integration.type].label}
                  </Badge>
                </div>

                {/* Last Sync */}
                {integration.lastSync && (
                  <div className="text-xs text-muted-foreground">
                    Última sincronização: {new Date(integration.lastSync).toLocaleString('pt-BR')}
                  </div>
                )}

                {/* Configuration Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Configuração</h4>
                  <div className="space-y-1">
                    {Object.entries(integration.config).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="font-mono">
                          {key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('password')
                            ? '••••••••'
                            : String(value)
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestIntegration(integration.id)}
                      disabled={testingIntegration === integration.id || !integration.enabled}
                    >
                      {testingIntegration === integration.id ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <TestTube className="h-3 w-3 mr-1" />
                      )}
                      {testingIntegration === integration.id ? 'Testando...' : 'Testar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIntegration(integration)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteIntegration(integration.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Integration Details Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurar {selectedIntegration.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIntegration(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="integration-name">Nome da Integração</Label>
                  <Input
                    id="integration-name"
                    value={selectedIntegration.name}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="integration-description">Descrição</Label>
                  <Textarea
                    id="integration-description"
                    value={selectedIntegration.description}
                    readOnly
                  />
                </div>
              </div>

              <Separator />

              {/* Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">Configurações</h4>
                {Object.entries(selectedIntegration.config).map(([key, value]) => {
                  const isSecret = key.toLowerCase().includes('key') || 
                                 key.toLowerCase().includes('secret') || 
                                 key.toLowerCase().includes('password');
                  const showValue = showSecrets[`${selectedIntegration.id}-${key}`];
                  
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`config-${key}`} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`config-${key}`}
                          type={isSecret && !showValue ? 'password' : 'text'}
                          value={String(value)}
                          readOnly
                        />
                        {isSecret && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility(`${selectedIntegration.id}-${key}`)}
                          >
                            {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(String(value))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleTestIntegration(selectedIntegration.id)}
                    disabled={testingIntegration === selectedIntegration.id}
                  >
                    {testingIntegration === selectedIntegration.id ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    {testingIntegration === selectedIntegration.id ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentação
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                    Cancelar
                  </Button>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Sincronizar Todas</p>
                <p className="text-xs text-muted-foreground">Atualizar todas as integrações ativas</p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Logs de Integração</p>
                <p className="text-xs text-muted-foreground">Ver histórico de sincronizações</p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Shield className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Configurar Webhooks</p>
                <p className="text-xs text-muted-foreground">Gerenciar endpoints de webhook</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}