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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Shield,
  FileText,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Database,
  Settings,
  History,
  RefreshCw,
  Plus
} from 'lucide-react';

const LGPDConsentManager = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('consent');
  const [consents, setConsents] = useState([]);
  const [dataRequests, setDataRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [dataCategories, setDataCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para modais
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showDataRequestModal, setShowDataRequestModal] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Estados para formulários
  const [consentForm, setConsentForm] = useState({
    user_id: '',
    data_category: '',
    purpose: '',
    consent_given: true,
    expiry_date: '',
    notes: ''
  });

  const [dataRequestForm, setDataRequestForm] = useState({
    request_type: 'portability',
    data_categories: [],
    format: 'json',
    reason: '',
    notes: ''
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [userConsents, setUserConsents] = useState({});

  // Categorias de dados LGPD
  const defaultDataCategories = [
    {
      id: 'personal_data',
      name: 'Dados Pessoais',
      description: 'Nome, CPF, RG, endereço, telefone, email',
      required: true,
      sensitive: false
    },
    {
      id: 'health_data',
      name: 'Dados de Saúde',
      description: 'Histórico médico, exames, diagnósticos, tratamentos',
      required: false,
      sensitive: true
    },
    {
      id: 'financial_data',
      name: 'Dados Financeiros',
      description: 'Informações de pagamento, planos de saúde, faturamento',
      required: false,
      sensitive: true
    },
    {
      id: 'usage_data',
      name: 'Dados de Uso',
      description: 'Logs de acesso, preferências, histórico de navegação',
      required: false,
      sensitive: false
    },
    {
      id: 'communication_data',
      name: 'Dados de Comunicação',
      description: 'Mensagens, notificações, preferências de contato',
      required: false,
      sensitive: false
    }
  ];

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
    setDataCategories(defaultDataCategories);
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'consent':
          await loadConsents();
          break;
        case 'requests':
          await loadDataRequests();
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

  const loadConsents = async () => {
    try {
      const response = await fetch('/api/lgpd/consents/');
      if (response.ok) {
        const data = await response.json();
        setConsents(data);
      }
    } catch (error) {
      console.error('Erro ao carregar consentimentos:', error);
    }
  };

  const loadDataRequests = async () => {
    try {
      const response = await fetch('/api/lgpd/data-requests/');
      if (response.ok) {
        const data = await response.json();
        setDataRequests(data);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await fetch('/api/audit/logs/?event_type=LGPD_COMPLIANCE');
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  // Funções para gerenciar consentimentos
  const createConsent = async () => {
    try {
      const response = await fetch('/api/lgpd/consents/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentForm)
      });

      if (response.ok) {
        setSuccess('Consentimento registrado com sucesso!');
        setShowConsentModal(false);
        setConsentForm({ user_id: '', data_category: '', purpose: '', consent_given: true, expiry_date: '', notes: '' });
        loadConsents();
      } else {
        throw new Error('Erro ao registrar consentimento');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const updateConsent = async (consentId, updates) => {
    try {
      const response = await fetch(`/api/lgpd/consents/${consentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setSuccess('Consentimento atualizado com sucesso!');
        loadConsents();
      } else {
        throw new Error('Erro ao atualizar consentimento');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const revokeConsent = async (consentId) => {
    try {
      const response = await fetch(`/api/lgpd/consents/${consentId}/revoke`, {
        method: 'POST'
      });

      if (response.ok) {
        setSuccess('Consentimento revogado com sucesso!');
        loadConsents();
      } else {
        throw new Error('Erro ao revogar consentimento');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Funções para solicitações de dados
  const createDataRequest = async () => {
    try {
      const response = await fetch('/api/lgpd/data-requests/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataRequestForm)
      });

      if (response.ok) {
        setSuccess('Solicitação criada com sucesso!');
        setShowDataRequestModal(false);
        setDataRequestForm({ request_type: 'portability', data_categories: [], format: 'json', reason: '', notes: '' });
        loadDataRequests();
      } else {
        throw new Error('Erro ao criar solicitação');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const processDataRequest = async (requestId, action) => {
    try {
      const response = await fetch(`/api/lgpd/data-requests/${requestId}/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        setSuccess(`Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso!`);
        loadDataRequests();
      } else {
        throw new Error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} solicitação`);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Função para exportar dados
  const exportUserData = async (userId, format = 'json') => {
    try {
      const response = await fetch(`/api/lgpd/export-data/${userId}?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `user_data_${userId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess('Dados exportados com sucesso!');
      } else {
        throw new Error('Erro ao exportar dados');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Função para deletar dados do usuário
  const deleteUserData = async (userId) => {
    try {
      const response = await fetch(`/api/lgpd/delete-user-data/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Dados do usuário deletados com sucesso!');
        setShowDeleteConfirmModal(false);
        loadConsents();
      } else {
        throw new Error('Erro ao deletar dados do usuário');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Função para obter badge de status
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
      revoked: { color: 'bg-red-100 text-red-800', label: 'Revogado' },
      expired: { color: 'bg-gray-100 text-gray-800', label: 'Expirado' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejeitado' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Concluído' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // Função para calcular progresso de conformidade
  const calculateComplianceProgress = () => {
    if (consents.length === 0) return 0;
    const activeConsents = consents.filter(c => c.status === 'active').length;
    return Math.round((activeConsents / consents.length) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Consentimento LGPD</h1>
          <p className="text-gray-600 mt-1">Gerencie consentimentos, solicitações de dados e conformidade LGPD</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportUserData('all', 'csv')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button onClick={loadData} variant="outline">
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
            <CardTitle className="text-sm font-medium">Consentimentos Ativos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consents.filter(c => c.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">de {consents.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataRequests.filter(r => r.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">aguardando processamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade LGPD</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateComplianceProgress()}%</div>
            <Progress value={calculateComplianceProgress()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos de Auditoria</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="consent">Consentimentos</TabsTrigger>
          <TabsTrigger value="categories">Categorias de Dados</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        {/* Tab de Consentimentos */}
        <TabsContent value="consent" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Consentimentos LGPD</h2>
            <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Consentimento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Novo Consentimento</DialogTitle>
                  <DialogDescription>
                    Registre um novo consentimento LGPD para um usuário.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user_id" className="text-right">Usuário</Label>
                    <Input
                      id="user_id"
                      value={consentForm.user_id}
                      onChange={(e) => setConsentForm({...consentForm, user_id: e.target.value})}
                      className="col-span-3"
                      placeholder="ID do usuário"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="data_category" className="text-right">Categoria</Label>
                    <Select
                      value={consentForm.data_category}
                      onValueChange={(value) => setConsentForm({...consentForm, data_category: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="purpose" className="text-right">Finalidade</Label>
                    <Textarea
                      id="purpose"
                      value={consentForm.purpose}
                      onChange={(e) => setConsentForm({...consentForm, purpose: e.target.value})}
                      className="col-span-3"
                      placeholder="Finalidade do tratamento dos dados"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiry_date" className="text-right">Data de Expiração</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={consentForm.expiry_date}
                      onChange={(e) => setConsentForm({...consentForm, expiry_date: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="consent_given" className="text-right">Consentimento</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        id="consent_given"
                        checked={consentForm.consent_given}
                        onCheckedChange={(checked) => setConsentForm({...consentForm, consent_given: checked})}
                      />
                      <Label htmlFor="consent_given">
                        {consentForm.consent_given ? 'Concedido' : 'Negado'}
                      </Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createConsent}>Registrar Consentimento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Finalidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Expiração</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consents.map((consent) => (
                    <TableRow key={consent.id}>
                      <TableCell className="font-medium">{consent.user_name || consent.user_id}</TableCell>
                      <TableCell>{consent.data_category}</TableCell>
                      <TableCell className="max-w-xs truncate">{consent.purpose}</TableCell>
                      <TableCell>{getStatusBadge(consent.status)}</TableCell>
                      <TableCell>{new Date(consent.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {consent.expiry_date ? new Date(consent.expiry_date).toLocaleDateString() : 'Sem expiração'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {consent.status === 'active' && (
                            <Button
                              onClick={() => revokeConsent(consent.id)}
                              size="sm"
                              variant="outline"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => exportUserData(consent.user_id)}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="w-4 h-4" />
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

        {/* Tab de Categorias de Dados */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Categorias de Dados LGPD</h2>
          </div>

          <div className="grid gap-4">
            {dataCategories.map((category) => (
              <Card key={category.id} className={category.sensitive ? 'border-red-200' : 'border-gray-200'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.required && <Badge variant="secondary">Obrigatório</Badge>}
                      {category.sensitive && <Badge variant="destructive">Sensível</Badge>}
                    </div>
                    <div className="flex items-center space-x-2">
                      {category.sensitive ? (
                        <Lock className="w-5 h-5 text-red-500" />
                      ) : (
                        <Unlock className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Consentimentos ativos: {consents.filter(c => c.data_category === category.id && c.status === 'active').length}
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab de Solicitações */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Solicitações de Dados</h2>
            <Dialog open={showDataRequestModal} onOpenChange={setShowDataRequestModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Solicitação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Solicitação</DialogTitle>
                  <DialogDescription>
                    Crie uma solicitação de portabilidade ou exclusão de dados.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="request_type" className="text-right">Tipo</Label>
                    <Select
                      value={dataRequestForm.request_type}
                      onValueChange={(value) => setDataRequestForm({...dataRequestForm, request_type: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Tipo de solicitação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portability">Portabilidade de Dados</SelectItem>
                        <SelectItem value="deletion">Exclusão de Dados</SelectItem>
                        <SelectItem value="access">Acesso aos Dados</SelectItem>
                        <SelectItem value="rectification">Retificação de Dados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="format" className="text-right">Formato</Label>
                    <Select
                      value={dataRequestForm.format}
                      onValueChange={(value) => setDataRequestForm({...dataRequestForm, format: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Formato de exportação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">Motivo</Label>
                    <Textarea
                      id="reason"
                      value={dataRequestForm.reason}
                      onChange={(e) => setDataRequestForm({...dataRequestForm, reason: e.target.value})}
                      className="col-span-3"
                      placeholder="Motivo da solicitação"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createDataRequest}>Criar Solicitação</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Data da Solicitação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.request_type}</TableCell>
                      <TableCell>{request.user_name || request.user_id}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.format?.toUpperCase()}</TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => processDataRequest(request.id, 'approve')}
                                size="sm"
                                variant="outline"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => processDataRequest(request.id, 'reject')}
                                size="sm"
                                variant="outline"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {request.status === 'approved' && request.request_type === 'portability' && (
                            <Button
                              onClick={() => exportUserData(request.user_id, request.format)}
                              size="sm"
                              variant="outline"
                            >
                              <Download className="w-4 h-4" />
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

        {/* Tab de Auditoria */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Logs de Auditoria LGPD</h2>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Severidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.user_name || log.user_id}</TableCell>
                      <TableCell>{log.event_type}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                      <TableCell>{log.ip_address}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            log.severity === 'high' ? 'bg-red-100 text-red-800' :
                            log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {log.severity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LGPDConsentManager;