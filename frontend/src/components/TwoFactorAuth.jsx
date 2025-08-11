import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Smartphone,
  Key,
  QrCode,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  Clock,
  User,
  Lock,
  Unlock
} from 'lucide-react';

const TwoFactorAuth = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('setup');
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [userDevices, setUserDevices] = useState([]);
  const [authLogs, setAuthLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para modais
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);

  // Estados para formulários
  const [setupForm, setSetupForm] = useState({
    method: 'totp', // totp, sms, email
    phone: '',
    email: ''
  });

  const [verifyForm, setVerifyForm] = useState({
    code: '',
    backup_code: ''
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [setupStep, setSetupStep] = useState(1); // 1: método, 2: QR/config, 3: verificação

  // Carregar dados iniciais
  useEffect(() => {
    loadTwoFactorStatus();
    loadUserDevices();
    loadAuthLogs();
  }, []);

  const loadTwoFactorStatus = async () => {
    try {
      const response = await fetch('/api/2fa/status');
      if (response.ok) {
        const data = await response.json();
        setTwoFactorStatus(data);
      }
    } catch (error) {
      console.error('Erro ao carregar status 2FA:', error);
    }
  };

  const loadUserDevices = async () => {
    try {
      const response = await fetch('/api/2fa/devices');
      if (response.ok) {
        const data = await response.json();
        setUserDevices(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
    }
  };

  const loadAuthLogs = async () => {
    try {
      const response = await fetch('/api/audit/logs/?event_type=TWO_FACTOR_AUTH');
      if (response.ok) {
        const data = await response.json();
        setAuthLogs(data);
      }
    } catch (error) {
      console.error('Erro ao carregar logs de autenticação:', error);
    }
  };

  // Configurar 2FA
  const setupTwoFactor = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupForm)
      });

      if (response.ok) {
        const data = await response.json();
        if (setupForm.method === 'totp') {
          setQrCode(data.qr_code);
          setBackupCodes(data.backup_codes || []);
        }
        setSetupStep(2);
        setSuccess('Configuração iniciada com sucesso!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao configurar 2FA');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Verificar código 2FA
  const verifyTwoFactor = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verifyForm.code,
          backup_code: verifyForm.backup_code
        })
      });

      if (response.ok) {
        setSuccess('2FA configurado com sucesso!');
        setShowSetupModal(false);
        setShowVerifyModal(false);
        setSetupStep(1);
        setVerifyForm({ code: '', backup_code: '' });
        loadTwoFactorStatus();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Código inválido');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Desabilitar 2FA
  const disableTwoFactor = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyForm.code })
      });

      if (response.ok) {
        setSuccess('2FA desabilitado com sucesso!');
        setShowDisableModal(false);
        setVerifyForm({ code: '', backup_code: '' });
        loadTwoFactorStatus();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao desabilitar 2FA');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gerar novos códigos de backup
  const generateBackupCodes = async () => {
    try {
      const response = await fetch('/api/2fa/backup-codes', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.backup_codes);
        setShowBackupCodesModal(true);
        setSuccess('Novos códigos de backup gerados!');
      } else {
        throw new Error('Erro ao gerar códigos de backup');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Copiar para clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copiado para a área de transferência!');
    }).catch(() => {
      setError('Erro ao copiar para a área de transferência');
    });
  };

  // Baixar códigos de backup
  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Remover dispositivo
  const removeDevice = async (deviceId) => {
    try {
      const response = await fetch(`/api/2fa/devices/${deviceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Dispositivo removido com sucesso!');
        loadUserDevices();
      } else {
        throw new Error('Erro ao remover dispositivo');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Função para obter badge de status
  const getStatusBadge = (status) => {
    const statusConfig = {
      enabled: { color: 'bg-green-100 text-green-800', label: 'Ativo', icon: ShieldCheck },
      disabled: { color: 'bg-red-100 text-red-800', label: 'Inativo', icon: ShieldX },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente', icon: Clock },
      verified: { color: 'bg-blue-100 text-blue-800', label: 'Verificado', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', label: 'Falhou', icon: XCircle }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: Shield };
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Calcular nível de segurança
  const getSecurityLevel = () => {
    if (!twoFactorStatus?.enabled) return { level: 0, label: 'Baixo', color: 'bg-red-500' };
    if (twoFactorStatus.method === 'totp' && backupCodes.length > 0) {
      return { level: 100, label: 'Alto', color: 'bg-green-500' };
    }
    return { level: 70, label: 'Médio', color: 'bg-yellow-500' };
  };

  const securityLevel = getSecurityLevel();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Autenticação Multifator (2FA)</h1>
          <p className="text-gray-600 mt-1">Configure e gerencie a autenticação de dois fatores para maior segurança</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadTwoFactorStatus} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alertas de feedback */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Sucesso</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status 2FA</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {twoFactorStatus?.enabled ? 'Ativo' : 'Inativo'}
            </div>
            <p className="text-xs text-muted-foreground">
              {twoFactorStatus?.method || 'Não configurado'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível de Segurança</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityLevel.label}</div>
            <Progress value={securityLevel.level} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos Confiáveis</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userDevices.length}</div>
            <p className="text-xs text-muted-foreground">dispositivos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Códigos de Backup</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backupCodes.length}</div>
            <p className="text-xs text-muted-foreground">códigos disponíveis</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Configuração</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="backup">Códigos de Backup</TabsTrigger>
          <TabsTrigger value="logs">Logs de Acesso</TabsTrigger>
        </TabsList>

        {/* Tab de Configuração */}
        <TabsContent value="setup" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Status atual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Status Atual
                </CardTitle>
                <CardDescription>
                  Configuração atual da autenticação multifator
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  {getStatusBadge(twoFactorStatus?.enabled ? 'enabled' : 'disabled')}
                </div>
                {twoFactorStatus?.enabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Método:</span>
                      <Badge variant="outline">{twoFactorStatus.method?.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Configurado em:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(twoFactorStatus.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
                <div className="pt-4 space-y-2">
                  {!twoFactorStatus?.enabled ? (
                    <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Shield className="w-4 h-4 mr-2" />
                          Configurar 2FA
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Configurar Autenticação Multifator</DialogTitle>
                          <DialogDescription>
                            Escolha o método de autenticação de dois fatores
                          </DialogDescription>
                        </DialogHeader>
                        
                        {setupStep === 1 && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Método de Autenticação</Label>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="totp"
                                    name="method"
                                    value="totp"
                                    checked={setupForm.method === 'totp'}
                                    onChange={(e) => setSetupForm({...setupForm, method: e.target.value})}
                                  />
                                  <Label htmlFor="totp" className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    Aplicativo Autenticador (Recomendado)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="sms"
                                    name="method"
                                    value="sms"
                                    checked={setupForm.method === 'sms'}
                                    onChange={(e) => setSetupForm({...setupForm, method: e.target.value})}
                                  />
                                  <Label htmlFor="sms" className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    SMS
                                  </Label>
                                </div>
                              </div>
                            </div>
                            
                            {setupForm.method === 'sms' && (
                              <div className="space-y-2">
                                <Label htmlFor="phone">Número de Telefone</Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  value={setupForm.phone}
                                  onChange={(e) => setSetupForm({...setupForm, phone: e.target.value})}
                                  placeholder="+55 11 99999-9999"
                                />
                              </div>
                            )}
                            
                            <DialogFooter>
                              <Button onClick={setupTwoFactor} disabled={loading}>
                                {loading ? 'Configurando...' : 'Continuar'}
                              </Button>
                            </DialogFooter>
                          </div>
                        )}
                        
                        {setupStep === 2 && setupForm.method === 'totp' && (
                          <div className="space-y-4">
                            <div className="text-center space-y-4">
                              <h3 className="font-semibold">Escaneie o QR Code</h3>
                              <div className="flex justify-center">
                                {qrCode && (
                                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                Use um aplicativo como Google Authenticator ou Authy para escanear o código
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="verify_code">Código de Verificação</Label>
                              <Input
                                id="verify_code"
                                value={verifyForm.code}
                                onChange={(e) => setVerifyForm({...verifyForm, code: e.target.value})}
                                placeholder="000000"
                                maxLength={6}
                              />
                            </div>
                            
                            <DialogFooter>
                              <Button onClick={() => setSetupStep(1)} variant="outline">
                                Voltar
                              </Button>
                              <Button onClick={verifyTwoFactor} disabled={loading}>
                                {loading ? 'Verificando...' : 'Verificar'}
                              </Button>
                            </DialogFooter>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <>
                      <Button onClick={generateBackupCodes} variant="outline" className="w-full">
                        <Key className="w-4 h-4 mr-2" />
                        Gerar Códigos de Backup
                      </Button>
                      <Dialog open={showDisableModal} onOpenChange={setShowDisableModal}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            <ShieldX className="w-4 h-4 mr-2" />
                            Desabilitar 2FA
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Desabilitar Autenticação Multifator</DialogTitle>
                            <DialogDescription>
                              Digite o código de verificação para desabilitar o 2FA
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="disable_code">Código de Verificação</Label>
                              <Input
                                id="disable_code"
                                value={verifyForm.code}
                                onChange={(e) => setVerifyForm({...verifyForm, code: e.target.value})}
                                placeholder="000000"
                                maxLength={6}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={disableTwoFactor} variant="destructive" disabled={loading}>
                              {loading ? 'Desabilitando...' : 'Desabilitar 2FA'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações de segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Nível de Segurança
                </CardTitle>
                <CardDescription>
                  Avaliação da segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Nível Atual:</span>
                    <Badge className={securityLevel.color}>{securityLevel.label}</Badge>
                  </div>
                  <Progress value={securityLevel.level} className="h-2" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <h4 className="font-semibold">Recomendações:</h4>
                  <ul className="space-y-1 text-gray-600">
                    {!twoFactorStatus?.enabled && (
                      <li className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        Configure a autenticação multifator
                      </li>
                    )}
                    {twoFactorStatus?.enabled && backupCodes.length === 0 && (
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        Gere códigos de backup
                      </li>
                    )}
                    {twoFactorStatus?.enabled && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        2FA configurado corretamente
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Dispositivos */}
        <TabsContent value="devices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Dispositivos Confiáveis</h2>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          {device.device_name || 'Dispositivo Desconhecido'}
                        </div>
                      </TableCell>
                      <TableCell>{device.device_type}</TableCell>
                      <TableCell>{device.ip_address}</TableCell>
                      <TableCell>{device.location || 'Desconhecida'}</TableCell>
                      <TableCell>{new Date(device.last_used).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(device.status)}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => removeDevice(device.id)}
                          size="sm"
                          variant="outline"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Códigos de Backup */}
        <TabsContent value="backup" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Códigos de Backup</h2>
            <Button onClick={generateBackupCodes}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Gerar Novos Códigos
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Códigos de Recuperação</CardTitle>
              <CardDescription>
                Use estes códigos para acessar sua conta caso perca acesso ao seu dispositivo 2FA.
                Cada código pode ser usado apenas uma vez.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backupCodes.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-2 md:grid-cols-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <code className="font-mono text-sm">{code}</code>
                        <Button
                          onClick={() => copyToClipboard(code)}
                          size="sm"
                          variant="ghost"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={downloadBackupCodes} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Códigos
                    </Button>
                    <Button onClick={() => copyToClipboard(backupCodes.join('\n'))} variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Todos
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Nenhum código de backup disponível</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Configure o 2FA primeiro para gerar códigos de backup
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Logs */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Logs de Autenticação</h2>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.event_type}</TableCell>
                      <TableCell>{log.ip_address}</TableCell>
                      <TableCell>{log.device_info || 'Desconhecido'}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de códigos de backup */}
      <Dialog open={showBackupCodesModal} onOpenChange={setShowBackupCodesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Códigos de Backup Gerados</DialogTitle>
            <DialogDescription>
              Salve estes códigos em um local seguro. Eles podem ser usados para acessar sua conta se você perder acesso ao seu dispositivo 2FA.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code className="font-mono text-sm">{code}</code>
                  <Button
                    onClick={() => copyToClipboard(code)}
                    size="sm"
                    variant="ghost"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={downloadBackupCodes} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
            <Button onClick={() => setShowBackupCodesModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TwoFactorAuth;