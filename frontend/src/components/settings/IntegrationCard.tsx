'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Settings,
  TestTube,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  ExternalLink,
  RefreshCw,
  Info,
  Shield,
  Key,
  Globe,
  Database,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  CreditCard,
  Activity
} from 'lucide-react';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'api' | 'database' | 'email' | 'sms' | 'calendar' | 'payment' | 'analytics' | 'storage' | 'other';
  provider: string;
  version?: string;
  status: 'active' | 'inactive' | 'error' | 'testing' | 'pending';
  enabled: boolean;
  lastSync?: Date;
  nextSync?: Date;
  config: {
    apiKey?: string;
    secretKey?: string;
    endpoint?: string;
    username?: string;
    password?: string;
    database?: string;
    host?: string;
    port?: number;
    ssl?: boolean;
    timeout?: number;
    retries?: number;
    [key: string]: any;
  };
  stats?: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    lastError?: string;
    uptime: number;
  };
  webhooks?: {
    enabled: boolean;
    url?: string;
    events: string[];
    secret?: string;
  };
  rateLimit?: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
    remaining: number;
    resetAt: Date;
  };
}

interface IntegrationCardProps {
  integration: Integration;
  onToggle: (id: string, enabled: boolean) => void;
  onTest: (id: string) => Promise<void>;
  onUpdate: (id: string, config: Integration['config']) => void;
  onSync: (id: string) => Promise<void>;
  isLoading?: boolean;
  showDetails?: boolean;
}

const categoryIcons = {
  api: Globe,
  database: Database,
  email: Mail,
  sms: MessageSquare,
  calendar: Calendar,
  payment: CreditCard,
  analytics: Activity,
  storage: FileText,
  other: Settings
};

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  testing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pending: 'bg-blue-100 text-blue-800 border-blue-200'
};

const statusLabels = {
  active: 'Ativo',
  inactive: 'Inativo',
  error: 'Erro',
  testing: 'Testando',
  pending: 'Pendente'
};

const categoryLabels = {
  api: 'API',
  database: 'Banco de Dados',
  email: 'Email',
  sms: 'SMS',
  calendar: 'Calendário',
  payment: 'Pagamento',
  analytics: 'Analytics',
  storage: 'Armazenamento',
  other: 'Outros'
};

export function IntegrationCard({
  integration,
  onToggle,
  onTest,
  onUpdate,
  onSync,
  isLoading = false,
  showDetails = false
}: IntegrationCardProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [config, setConfig] = useState(integration.config);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const CategoryIcon = categoryIcons[integration.category];

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await onTest(integration.id);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync(integration.id);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfigSave = () => {
    onUpdate(integration.id, config);
    setIsConfigOpen(false);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'text-green-600';
    if (uptime >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const maskSecret = (value: string) => {
    if (!value) return '';
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      integration.enabled ? 'border-l-4 border-l-blue-500' : 'opacity-75'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              integration.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[integration.category]}
                </Badge>
                {integration.version && (
                  <Badge variant="secondary" className="text-xs">
                    v{integration.version}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                {integration.description}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-xs ${statusColors[integration.status]}`}>
                  {statusLabels[integration.status]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {integration.provider}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={integration.enabled}
              onCheckedChange={(checked) => onToggle(integration.id, checked)}
              disabled={isLoading}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats */}
        {integration.stats && showDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {integration.stats.successfulRequests}
              </div>
              <div className="text-xs text-muted-foreground">Sucessos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {integration.stats.failedRequests}
              </div>
              <div className="text-xs text-muted-foreground">Falhas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {integration.stats.avgResponseTime}ms
              </div>
              <div className="text-xs text-muted-foreground">Resp. Média</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${getUptimeColor(integration.stats.uptime)}`}>
                {integration.stats.uptime.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        )}

        {/* Sync Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Última sincronização: {formatLastSync(integration.lastSync)}</span>
          </div>
          {integration.nextSync && (
            <div className="flex items-center gap-2">
              <span>Próxima: {formatLastSync(integration.nextSync)}</span>
            </div>
          )}
        </div>

        {/* Rate Limit */}
        {integration.rateLimit && showDetails && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Rate Limit</span>
              <span>{integration.rateLimit.remaining}/{integration.rateLimit.requests} por {integration.rateLimit.period}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(integration.rateLimit.remaining / integration.rateLimit.requests) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {integration.status === 'error' && integration.stats?.lastError && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Último erro:</strong> {integration.stats.lastError}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={!integration.enabled || isTesting || isLoading}
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTesting ? 'Testando...' : 'Testar'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={!integration.enabled || isSyncing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>

          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configurar {integration.name}</DialogTitle>
                <DialogDescription>
                  Configure as credenciais e parâmetros para esta integração.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* API Key */}
                {config.apiKey !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="apiKey"
                        type={showSecrets ? 'text' : 'password'}
                        value={config.apiKey}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                        placeholder="Insira sua API Key"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSecrets(!showSecrets)}
                            >
                              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {showSecrets ? 'Ocultar' : 'Mostrar'} credenciais
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(config.apiKey || '', 'apiKey')}
                            >
                              {copiedField === 'apiKey' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedField === 'apiKey' ? 'Copiado!' : 'Copiar'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}

                {/* Secret Key */}
                {config.secretKey !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secretKey"
                        type={showSecrets ? 'text' : 'password'}
                        value={config.secretKey}
                        onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                        placeholder="Insira sua Secret Key"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(config.secretKey || '', 'secretKey')}
                      >
                        {copiedField === 'secretKey' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Endpoint */}
                {config.endpoint !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Endpoint</Label>
                    <Input
                      id="endpoint"
                      value={config.endpoint}
                      onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                      placeholder="https://api.exemplo.com/v1"
                    />
                  </div>
                )}

                {/* Host */}
                {config.host !== undefined && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">Host</Label>
                      <Input
                        id="host"
                        value={config.host}
                        onChange={(e) => setConfig({ ...config, host: e.target.value })}
                        placeholder="localhost"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Porta</Label>
                      <Input
                        id="port"
                        type="number"
                        value={config.port}
                        onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                        placeholder="5432"
                      />
                    </div>
                  </div>
                )}

                {/* Username/Password */}
                {config.username !== undefined && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuário</Label>
                      <Input
                        id="username"
                        value={config.username}
                        onChange={(e) => setConfig({ ...config, username: e.target.value })}
                        placeholder="usuário"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type={showSecrets ? 'text' : 'password'}
                        value={config.password}
                        onChange={(e) => setConfig({ ...config, password: e.target.value })}
                        placeholder="senha"
                      />
                    </div>
                  </div>
                )}

                {/* Database */}
                {config.database !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="database">Banco de Dados</Label>
                    <Input
                      id="database"
                      value={config.database}
                      onChange={(e) => setConfig({ ...config, database: e.target.value })}
                      placeholder="nome_do_banco"
                    />
                  </div>
                )}

                {/* SSL */}
                {config.ssl !== undefined && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ssl"
                      checked={config.ssl}
                      onCheckedChange={(checked) => setConfig({ ...config, ssl: checked })}
                    />
                    <Label htmlFor="ssl">Usar SSL</Label>
                  </div>
                )}

                {/* Timeout */}
                {config.timeout !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (ms)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={config.timeout}
                      onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
                      placeholder="30000"
                    />
                  </div>
                )}

                {/* Retries */}
                {config.retries !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="retries">Tentativas</Label>
                    <Input
                      id="retries"
                      type="number"
                      value={config.retries}
                      onChange={(e) => setConfig({ ...config, retries: parseInt(e.target.value) })}
                      placeholder="3"
                    />
                  </div>
                )}

                {/* Webhooks */}
                {integration.webhooks && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <Label>Webhooks</Label>
                      <Switch
                        checked={integration.webhooks.enabled}
                        onCheckedChange={(checked) => {
                          // Handle webhook toggle
                        }}
                      />
                    </div>
                    {integration.webhooks.enabled && (
                      <div className="space-y-2">
                        <Label htmlFor="webhookUrl">URL do Webhook</Label>
                        <Input
                          id="webhookUrl"
                          value={integration.webhooks.url}
                          placeholder="https://seu-site.com/webhook"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfigSave}>
                  Salvar Configurações
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {integration.config.endpoint && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(integration.config.endpoint, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Abrir documentação
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}