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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Key,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Database,
  FileText,
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Calendar,
  User,
  Users,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Zap,
  Target,
  Bell,
  BellOff,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  AlertCircle,
  HardDrive,
  Server,
  Cloud,
  Wifi,
  WifiOff
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DataEncryption = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('overview');
  const [encryptionKeys, setEncryptionKeys] = useState([]);
  const [encryptedData, setEncryptedData] = useState([]);
  const [encryptionStats, setEncryptionStats] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para modais
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [showEncryptData, setShowEncryptData] = useState(false);
  const [showDecryptData, setShowDecryptData] = useState(false);
  const [showKeyDetails, setShowKeyDetails] = useState(false);
  const [showDataDetails, setShowDataDetails] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  // Estados para formulários
  const [newKey, setNewKey] = useState({
    name: '',
    algorithm: 'AES-256',
    purpose: 'data_encryption',
    rotation_days: 90,
    description: ''
  });
  const [encryptionForm, setEncryptionForm] = useState({
    data: '',
    key_id: '',
    data_type: 'text',
    metadata: ''
  });
  const [decryptionForm, setDecryptionForm] = useState({
    encrypted_data: '',
    key_id: '',
    verify_integrity: true
  });

  // Estados para filtros
  const [keyFilter, setKeyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [algorithmFilter, setAlgorithmFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para configurações
  const [autoRotation, setAutoRotation] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [auditEnabled, setAuditEnabled] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'overview':
          await Promise.all([
            loadEncryptionStats(),
            loadRecentActivity()
          ]);
          break;
        case 'keys':
          await loadEncryptionKeys();
          break;
        case 'data':
          await loadEncryptedData();
          break;
        case 'audit':
          await loadAuditLogs();
          break;
        default:
          break;
      }
    } catch (error) {
      setError('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEncryptionStats = async () => {
    try {
      const response = await fetch('/api/encryption/stats');
      if (response.ok) {
        const data = await response.json();
        setEncryptionStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadEncryptionKeys = async () => {
    try {
      const response = await fetch('/api/encryption/keys');
      if (response.ok) {
        const data = await response.json();
        setEncryptionKeys(data);
      }
    } catch (error) {
      console.error('Erro ao carregar chaves:', error);
    }
  };

  const loadEncryptedData = async () => {
    try {
      const response = await fetch('/api/encryption/data');
      if (response.ok) {
        const data = await response.json();
        setEncryptedData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados criptografados:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await fetch('/api/encryption/audit');
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await fetch('/api/encryption/activity/recent');
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Erro ao carregar atividade recente:', error);
    }
  };

  // Funções de gerenciamento de chaves
  const createEncryptionKey = async () => {
    try {
      const response = await fetch('/api/encryption/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newKey),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess('Chave de criptografia criada com sucesso!');
        setShowCreateKey(false);
        setNewKey({
          name: '',
          algorithm: 'AES-256',
          purpose: 'data_encryption',
          rotation_days: 90,
          description: ''
        });
        loadEncryptionKeys();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erro ao criar chave');
      }
    } catch (error) {
      setError('Erro ao criar chave: ' + error.message);
    }
  };

  const rotateKey = async (keyId) => {
    try {
      const response = await fetch(`/api/encryption/keys/${keyId}/rotate`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setSuccess('Chave rotacionada com sucesso!');
        loadEncryptionKeys();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erro ao rotacionar chave');
      }
    } catch (error) {
      setError('Erro ao rotacionar chave: ' + error.message);
    }
  };

  const revokeKey = async (keyId) => {
    try {
      const response = await fetch(`/api/encryption/keys/${keyId}/revoke`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setSuccess('Chave revogada com sucesso!');
        loadEncryptionKeys();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erro ao revogar chave');
      }
    } catch (error) {
      setError('Erro ao revogar chave: ' + error.message);
    }
  };

  // Funções de criptografia/descriptografia
  const encryptData = async () => {
    try {
      const response = await fetch('/api/encryption/encrypt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(encryptionForm),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess('Dados criptografados com sucesso!');
        setShowEncryptData(false);
        setEncryptionForm({
          data: '',
          key_id: '',
          data_type: 'text',
          metadata: ''
        });
        loadEncryptedData();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erro ao criptografar dados');
      }
    } catch (error) {
      setError('Erro ao criptografar dados: ' + error.message);
    }
  };

  const decryptData = async () => {
    try {
      const response = await fetch('/api/encryption/decrypt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(decryptionForm),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess('Dados descriptografados com sucesso!');
        setShowDecryptData(false);
        setDecryptionForm({
          encrypted_data: '',
          key_id: '',
          verify_integrity: true
        });
        // Mostrar dados descriptografados em modal ou área específica
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erro ao descriptografar dados');
      }
    } catch (error) {
      setError('Erro ao descriptografar dados: ' + error.message);
    }
  };

  // Funções utilitárias
  const getKeyStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Ativa', icon: CheckCircle },
      expired: { color: 'bg-red-100 text-red-800', label: 'Expirada', icon: XCircle },
      revoked: { color: 'bg-gray-100 text-gray-800', label: 'Revogada', icon: Lock },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente', icon: Clock },
      rotating: { color: 'bg-blue-100 text-blue-800', label: 'Rotacionando', icon: RefreshCw }
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getAlgorithmBadge = (algorithm) => {
    const algorithmConfig = {
      'AES-256': { color: 'bg-green-100 text-green-800', label: 'AES-256' },
      'AES-128': { color: 'bg-blue-100 text-blue-800', label: 'AES-128' },
      'RSA-2048': { color: 'bg-purple-100 text-purple-800', label: 'RSA-2048' },
      'RSA-4096': { color: 'bg-indigo-100 text-indigo-800', label: 'RSA-4096' },
      'ChaCha20': { color: 'bg-orange-100 text-orange-800', label: 'ChaCha20' }
    };

    const config = algorithmConfig[algorithm] || { color: 'bg-gray-100 text-gray-800', label: algorithm };
    
    return (
      <Badge className={config.color}>
        <Shield className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPurposeBadge = (purpose) => {
    const purposeConfig = {
      data_encryption: { color: 'bg-blue-100 text-blue-800', label: 'Dados', icon: Database },
      file_encryption: { color: 'bg-green-100 text-green-800', label: 'Arquivos', icon: FileText },
      communication: { color: 'bg-purple-100 text-purple-800', label: 'Comunicação', icon: Wifi },
      backup: { color: 'bg-orange-100 text-orange-800', label: 'Backup', icon: HardDrive },
      authentication: { color: 'bg-red-100 text-red-800', label: 'Autenticação', icon: Fingerprint }
    };

    const config = purposeConfig[purpose] || { color: 'bg-gray-100 text-gray-800', label: purpose, icon: Key };
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDataTypeBadge = (dataType) => {
    const typeConfig = {
      text: { color: 'bg-gray-100 text-gray-800', label: 'Texto', icon: FileText },
      file: { color: 'bg-blue-100 text-blue-800', label: 'Arquivo', icon: FileText },
      database: { color: 'bg-green-100 text-green-800', label: 'Banco', icon: Database },
      json: { color: 'bg-purple-100 text-purple-800', label: 'JSON', icon: FileText },
      binary: { color: 'bg-orange-100 text-orange-800', label: 'Binário', icon: HardDrive }
    };

    const config = typeConfig[dataType] || { color: 'bg-gray-100 text-gray-800', label: dataType, icon: FileText };
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getActionBadge = (action) => {
    const actionConfig = {
      encrypt: { color: 'bg-green-100 text-green-800', label: 'Criptografar', icon: Lock },
      decrypt: { color: 'bg-blue-100 text-blue-800', label: 'Descriptografar', icon: Unlock },
      key_create: { color: 'bg-purple-100 text-purple-800', label: 'Criar Chave', icon: Plus },
      key_rotate: { color: 'bg-yellow-100 text-yellow-800', label: 'Rotacionar', icon: RefreshCw },
      key_revoke: { color: 'bg-red-100 text-red-800', label: 'Revogar', icon: X },
      backup: { color: 'bg-orange-100 text-orange-800', label: 'Backup', icon: Download },
      restore: { color: 'bg-indigo-100 text-indigo-800', label: 'Restaurar', icon: Upload }
    };

    const config = actionConfig[action] || { color: 'bg-gray-100 text-gray-800', label: action, icon: Activity };
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copiado para a área de transferência!');
    }).catch(() => {
      setError('Erro ao copiar para a área de transferência');
    });
  };

  // Filtrar dados
  const filteredKeys = encryptionKeys.filter(key => {
    const matchesSearch = key.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || key.status === statusFilter;
    const matchesAlgorithm = algorithmFilter === 'all' || key.algorithm === algorithmFilter;
    
    return matchesSearch && matchesStatus && matchesAlgorithm;
  });

  const filteredData = encryptedData.filter(data => {
    const matchesSearch = data.metadata?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.data_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKey = keyFilter === 'all' || data.key_id?.toString() === keyFilter;
    
    return matchesSearch && matchesKey;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Criptografia de Dados</h1>
          <p className="text-gray-600 mt-1">Gerenciamento de chaves e criptografia de dados sensíveis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={encryptionEnabled}
              onCheckedChange={setEncryptionEnabled}
            />
            <Label>Criptografia Ativa</Label>
          </div>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowCreateKey(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Chave
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chaves Ativas</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{encryptionStats.active_keys || 0}</div>
            <p className="text-xs text-muted-foreground">em uso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados Criptografados</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{encryptionStats.encrypted_records || 0}</div>
            <p className="text-xs text-muted-foreground">registros protegidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chaves Expiradas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{encryptionStats.expired_keys || 0}</div>
            <p className="text-xs text-muted-foreground">requerem rotação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operações Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{encryptionStats.daily_operations || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className={encryptionStats.operations_trend > 0 ? 'text-green-500' : 'text-red-500'}>
                {encryptionStats.operations_trend > 0 ? '+' : ''}{encryptionStats.operations_trend || 0}%
              </span>
              {' '}vs ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível de Segurança</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{encryptionStats.security_score || 0}%</div>
            <p className="text-xs text-muted-foreground">conformidade</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="keys">Chaves</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        {/* Tab Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {log.action === 'encrypt' ? <Lock className="w-4 h-4 text-green-600" /> : 
                           log.action === 'decrypt' ? <Unlock className="w-4 h-4 text-blue-600" /> :
                           <Key className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {log.user_name || `Usuário ${log.user_id}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getActionBadge(log.action)} • {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.status === 'success' ? 
                          <CheckCircle className="w-4 h-4 text-green-600" /> :
                          <XCircle className="w-4 h-4 text-red-600" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status das Chaves */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Status das Chaves
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {encryptionKeys.slice(0, 10).map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Key className="w-4 h-4" />
                        <div>
                          <p className="font-medium text-sm">{key.name}</p>
                          <p className="text-xs text-gray-500">
                            {getAlgorithmBadge(key.algorithm)} • Criada: {new Date(key.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getKeyStatusBadge(key.status)}
                        <Button
                          onClick={() => {
                            setSelectedKey(key);
                            setShowKeyDetails(true);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de estatísticas */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Algoritmos Utilizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {encryptionStats.algorithm_distribution?.map((algo, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{algo.name}:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(algo.count / encryptionStats.total_keys) * 100} className="w-20" />
                        <span className="font-bold text-sm">{algo.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Tipos de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {encryptionStats.data_type_distribution?.map((type, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{type.name}:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(type.count / encryptionStats.total_data) * 100} className="w-20" />
                        <span className="font-bold text-sm">{type.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Operações por Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {encryptionStats.daily_operations_trend?.map((day, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{day.date}:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(day.count / encryptionStats.max_daily) * 100} className="w-20" />
                        <span className="font-bold text-sm">{day.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Chaves */}
        <TabsContent value="keys" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gerenciamento de Chaves</h2>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="expired">Expirada</SelectItem>
                  <SelectItem value="revoked">Revogada</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={algorithmFilter} onValueChange={setAlgorithmFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Algoritmo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="AES-256">AES-256</SelectItem>
                  <SelectItem value="AES-128">AES-128</SelectItem>
                  <SelectItem value="RSA-2048">RSA-2048</SelectItem>
                  <SelectItem value="RSA-4096">RSA-4096</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar chaves..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Algoritmo</TableHead>
                    <TableHead>Propósito</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criada</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{key.name}</p>
                            <p className="text-xs text-gray-500">{key.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getAlgorithmBadge(key.algorithm)}</TableCell>
                      <TableCell>{getPurposeBadge(key.purpose)}</TableCell>
                      <TableCell>{getKeyStatusBadge(key.status)}</TableCell>
                      <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {key.expires_at ? (
                          <span className={new Date(key.expires_at) < new Date() ? 'text-red-600 font-bold' : ''}>
                            {new Date(key.expires_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-500">Nunca</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => {
                              setSelectedKey(key);
                              setShowKeyDetails(true);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {key.status === 'active' && (
                            <Button
                              onClick={() => rotateKey(key.id)}
                              size="sm"
                              variant="outline"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                          {key.status === 'active' && (
                            <Button
                              onClick={() => revokeKey(key.id)}
                              size="sm"
                              variant="destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Dados */}
        <TabsContent value="data" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Dados Criptografados</h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowEncryptData(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Criptografar
              </Button>
              <Button onClick={() => setShowDecryptData(true)} variant="outline">
                <Unlock className="w-4 h-4 mr-2" />
                Descriptografar
              </Button>
            </div>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Criado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell className="font-mono text-sm">{data.id}</TableCell>
                      <TableCell>{getDataTypeBadge(data.data_type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          <span className="font-mono text-sm">{data.key_name || data.key_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>{data.size ? `${(data.size / 1024).toFixed(2)} KB` : 'N/A'}</TableCell>
                      <TableCell>{new Date(data.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => {
                              setSelectedData(data);
                              setShowDataDetails(true);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => copyToClipboard(data.encrypted_data)}
                            size="sm"
                            variant="outline"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Auditoria */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Logs de Auditoria</h2>
            <Button onClick={loadAuditLogs} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{log.user_name || `Usuário ${log.user_id}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.resource_type && (
                          <Badge variant="outline" className="mr-1">
                            {log.resource_type}
                          </Badge>
                        )}
                        {log.resource_id || log.description}
                      </TableCell>
                      <TableCell>
                        {log.status === 'success' ? 
                          <CheckCircle className="w-4 h-4 text-green-600" /> :
                          <XCircle className="w-4 h-4 text-red-600" />
                        }
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de criação de chave */}
      <Dialog open={showCreateKey} onOpenChange={setShowCreateKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Chave de Criptografia</DialogTitle>
            <DialogDescription>
              Configure uma nova chave para criptografia de dados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="key_name">Nome da Chave</Label>
              <Input
                id="key_name"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                placeholder="Ex: chave-dados-pacientes"
              />
            </div>
            <div>
              <Label htmlFor="algorithm">Algoritmo</Label>
              <Select value={newKey.algorithm} onValueChange={(value) => setNewKey({ ...newKey, algorithm: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o algoritmo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AES-256">AES-256 (Recomendado)</SelectItem>
                  <SelectItem value="AES-128">AES-128</SelectItem>
                  <SelectItem value="RSA-2048">RSA-2048</SelectItem>
                  <SelectItem value="RSA-4096">RSA-4096</SelectItem>
                  <SelectItem value="ChaCha20">ChaCha20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="purpose">Propósito</Label>
              <Select value={newKey.purpose} onValueChange={(value) => setNewKey({ ...newKey, purpose: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o propósito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data_encryption">Criptografia de Dados</SelectItem>
                  <SelectItem value="file_encryption">Criptografia de Arquivos</SelectItem>
                  <SelectItem value="communication">Comunicação</SelectItem>
                  <SelectItem value="backup">Backup</SelectItem>
                  <SelectItem value="authentication">Autenticação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rotation_days">Rotação (dias)</Label>
              <Input
                id="rotation_days"
                type="number"
                value={newKey.rotation_days}
                onChange={(e) => setNewKey({ ...newKey, rotation_days: parseInt(e.target.value) })}
                placeholder="90"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newKey.description}
                onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                placeholder="Descrição da chave e seu uso..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCreateKey(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={createEncryptionKey}>
              <Key className="w-4 h-4 mr-2" />
              Criar Chave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de criptografia */}
      <Dialog open={showEncryptData} onOpenChange={setShowEncryptData}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criptografar Dados</DialogTitle>
            <DialogDescription>
              Selecione uma chave e insira os dados para criptografia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="encrypt_key">Chave de Criptografia</Label>
              <Select value={encryptionForm.key_id} onValueChange={(value) => setEncryptionForm({ ...encryptionForm, key_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma chave" />
                </SelectTrigger>
                <SelectContent>
                  {encryptionKeys.filter(key => key.status === 'active').map((key) => (
                    <SelectItem key={key.id} value={key.id.toString()}>
                      {key.name} ({key.algorithm})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="data_type">Tipo de Dados</Label>
              <Select value={encryptionForm.data_type} onValueChange={(value) => setEncryptionForm({ ...encryptionForm, data_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="file">Arquivo</SelectItem>
                  <SelectItem value="database">Banco de Dados</SelectItem>
                  <SelectItem value="binary">Binário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="encrypt_data">Dados para Criptografar</Label>
              <Textarea
                id="encrypt_data"
                value={encryptionForm.data}
                onChange={(e) => setEncryptionForm({ ...encryptionForm, data: e.target.value })}
                placeholder="Insira os dados que deseja criptografar..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="metadata">Metadados (opcional)</Label>
              <Input
                id="metadata"
                value={encryptionForm.metadata}
                onChange={(e) => setEncryptionForm({ ...encryptionForm, metadata: e.target.value })}
                placeholder="Informações adicionais sobre os dados"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEncryptData(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={encryptData}>
              <Lock className="w-4 h-4 mr-2" />
              Criptografar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de descriptografia */}
      <Dialog open={showDecryptData} onOpenChange={setShowDecryptData}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descriptografar Dados</DialogTitle>
            <DialogDescription>
              Insira os dados criptografados e selecione a chave para descriptografia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="decrypt_key">Chave de Descriptografia</Label>
              <Select value={decryptionForm.key_id} onValueChange={(value) => setDecryptionForm({ ...decryptionForm, key_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma chave" />
                </SelectTrigger>
                <SelectContent>
                  {encryptionKeys.filter(key => key.status === 'active').map((key) => (
                    <SelectItem key={key.id} value={key.id.toString()}>
                      {key.name} ({key.algorithm})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="encrypted_data">Dados Criptografados</Label>
              <Textarea
                id="encrypted_data"
                value={decryptionForm.encrypted_data}
                onChange={(e) => setDecryptionForm({ ...decryptionForm, encrypted_data: e.target.value })}
                placeholder="Insira os dados criptografados..."
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={decryptionForm.verify_integrity}
                onCheckedChange={(checked) => setDecryptionForm({ ...decryptionForm, verify_integrity: checked })}
              />
              <Label>Verificar Integridade</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDecryptData(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={decryptData}>
              <Unlock className="w-4 h-4 mr-2" />
              Descriptografar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes da chave */}
      <Dialog open={showKeyDetails} onOpenChange={setShowKeyDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Chave de Criptografia</DialogTitle>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Nome:</Label>
                  <p>{selectedKey.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Algoritmo:</Label>
                  <p>{getAlgorithmBadge(selectedKey.algorithm)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Propósito:</Label>
                  <p>{getPurposeBadge(selectedKey.purpose)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status:</Label>
                  <p>{getKeyStatusBadge(selectedKey.status)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Criada:</Label>
                  <p>{new Date(selectedKey.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="font-semibold">Expira:</Label>
                  <p>{selectedKey.expires_at ? new Date(selectedKey.expires_at).toLocaleString() : 'Nunca'}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Descrição:</Label>
                <p className="mt-1">{selectedKey.description || 'Nenhuma descrição fornecida'}</p>
              </div>
              <div>
                <Label className="font-semibold">ID da Chave:</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-gray-100 p-2 rounded text-sm flex-1">{selectedKey.id}</code>
                  <Button
                    onClick={() => copyToClipboard(selectedKey.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {selectedKey.fingerprint && (
                <div>
                  <Label className="font-semibold">Fingerprint:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-100 p-2 rounded text-sm flex-1 font-mono">{selectedKey.fingerprint}</code>
                    <Button
                      onClick={() => copyToClipboard(selectedKey.fingerprint)}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              {selectedKey.usage_stats && (
                <div>
                  <Label className="font-semibold">Estatísticas de Uso:</Label>
                  <div className="mt-1 grid grid-cols-2 gap-4 text-sm">
                    <div>Operações de Criptografia: <span className="font-bold">{selectedKey.usage_stats.encrypt_count || 0}</span></div>
                    <div>Operações de Descriptografia: <span className="font-bold">{selectedKey.usage_stats.decrypt_count || 0}</span></div>
                    <div>Último Uso: <span className="font-bold">{selectedKey.usage_stats.last_used ? new Date(selectedKey.usage_stats.last_used).toLocaleString() : 'Nunca'}</span></div>
                    <div>Dados Criptografados: <span className="font-bold">{selectedKey.usage_stats.data_count || 0}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowKeyDetails(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes dos dados */}
      <Dialog open={showDataDetails} onOpenChange={setShowDataDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes dos Dados Criptografados</DialogTitle>
          </DialogHeader>
          {selectedData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">ID:</Label>
                  <p className="font-mono">{selectedData.id}</p>
                </div>
                <div>
                  <Label className="font-semibold">Tipo:</Label>
                  <p>{getDataTypeBadge(selectedData.data_type)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Chave:</Label>
                  <p>{selectedData.key_name || selectedData.key_id}</p>
                </div>
                <div>
                  <Label className="font-semibold">Tamanho:</Label>
                  <p>{selectedData.size ? `${(selectedData.size / 1024).toFixed(2)} KB` : 'N/A'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Criado:</Label>
                  <p>{new Date(selectedData.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="font-semibold">Modificado:</Label>
                  <p>{selectedData.updated_at ? new Date(selectedData.updated_at).toLocaleString() : 'Nunca'}</p>
                </div>
              </div>
              {selectedData.checksum && (
                <div>
                  <Label className="font-semibold">Checksum:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-100 p-2 rounded text-sm flex-1 font-mono">{selectedData.checksum}</code>
                    <Button
                      onClick={() => copyToClipboard(selectedData.checksum)}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDataDetails(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

              {selectedData.metadata && (
                <div>
                  <Label className="font-semibold">Metadados:</Label>
                  <p className="mt-1">{selectedData.metadata}</p>
                </div>
              )}
              <div>
                <Label className="font-semibold">Dados Criptografados:</Label>
                <div className="mt-1">
                  <Textarea
                    value={selectedData.encrypted_data}
                    readOnly
                    rows={6}
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={() => copyToClipboard(selectedData.encrypted_data)}
                    className="mt-2"
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Dados
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDataDetails(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataEncryption;