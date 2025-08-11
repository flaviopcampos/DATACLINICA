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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  User,
  Users,
  Eye,
  EyeOff,
  Activity,
  Clock,
  Globe,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Calendar as CalendarIcon,
  Download,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  LogIn,
  LogOut,
  Settings,
  Database,
  FileText,
  Edit,
  Trash2,
  Plus,
  Minus,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Fingerprint,
  Key,
  CreditCard,
  Zap,
  Target,
  AlertCircle,
  Bell,
  BellOff
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UserAccessLogs = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('overview');
  const [accessLogs, setAccessLogs] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [ipFilter, setIpFilter] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');

  // Estados para modais
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Estados para configurações
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [retentionDays, setRetentionDays] = useState(90);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
    loadUsers();
    
    // Atualização em tempo real
    const interval = setInterval(() => {
      if (realTimeEnabled) {
        loadRecentLogs();
      }
    }, 10000); // Atualizar a cada 10 segundos

    return () => clearInterval(interval);
  }, [activeTab, dateRange, userFilter, actionFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'overview':
          await Promise.all([
            loadUserStats(),
            loadRecentLogs()
          ]);
          break;
        case 'logs':
          await loadAccessLogs();
          break;
        case 'users':
          await loadUserActivity();
          break;
        case 'analytics':
          await loadAnalytics();
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

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await fetch(`/api/audit/user-stats?date_range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadAccessLogs = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        user_id: userFilter !== 'all' ? userFilter : '',
        action: actionFilter !== 'all' ? actionFilter : '',
        status: statusFilter !== 'all' ? statusFilter : '',
        date_range: dateRange,
        ip_address: ipFilter,
        device_type: deviceFilter !== 'all' ? deviceFilter : '',
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : ''
      });
      
      const response = await fetch(`/api/audit/logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAccessLogs(data);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  const loadRecentLogs = async () => {
    try {
      const response = await fetch('/api/audit/logs/recent?limit=20');
      if (response.ok) {
        const data = await response.json();
        setAccessLogs(data);
      }
    } catch (error) {
      console.error('Erro ao carregar logs recentes:', error);
    }
  };

  const loadUserActivity = async () => {
    try {
      const response = await fetch(`/api/audit/user-activity?date_range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setAccessLogs(data);
      }
    } catch (error) {
      console.error('Erro ao carregar atividade dos usuários:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/audit/analytics?date_range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
  };

  // Funções de exportação
  const exportLogs = async (format = 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        user_id: userFilter !== 'all' ? userFilter : '',
        action: actionFilter !== 'all' ? actionFilter : '',
        date_range: dateRange,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : ''
      });
      
      const response = await fetch(`/api/audit/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `access_logs_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('Logs exportados com sucesso!');
      }
    } catch (error) {
      setError('Erro ao exportar logs: ' + error.message);
    }
  };

  // Funções utilitárias
  const getActionBadge = (action) => {
    const actionConfig = {
      login: { color: 'bg-green-100 text-green-800', label: 'Login', icon: LogIn },
      logout: { color: 'bg-blue-100 text-blue-800', label: 'Logout', icon: LogOut },
      create: { color: 'bg-purple-100 text-purple-800', label: 'Criar', icon: Plus },
      update: { color: 'bg-yellow-100 text-yellow-800', label: 'Atualizar', icon: Edit },
      delete: { color: 'bg-red-100 text-red-800', label: 'Excluir', icon: Trash2 },
      view: { color: 'bg-gray-100 text-gray-800', label: 'Visualizar', icon: Eye },
      download: { color: 'bg-indigo-100 text-indigo-800', label: 'Download', icon: Download },
      upload: { color: 'bg-orange-100 text-orange-800', label: 'Upload', icon: Plus },
      admin: { color: 'bg-red-100 text-red-800', label: 'Admin', icon: Shield },
      security: { color: 'bg-red-100 text-red-800', label: 'Segurança', icon: ShieldAlert }
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { color: 'bg-green-100 text-green-800', label: 'Sucesso', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', label: 'Falhou', icon: XCircle },
      blocked: { color: 'bg-gray-100 text-gray-800', label: 'Bloqueado', icon: Lock },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente', icon: Clock },
      warning: { color: 'bg-orange-100 text-orange-800', label: 'Aviso', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig.success;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDeviceIcon = (deviceType) => {
    const deviceIcons = {
      desktop: Monitor,
      mobile: Smartphone,
      tablet: Tablet,
      unknown: Globe
    };
    
    const Icon = deviceIcons[deviceType] || Globe;
    return <Icon className="w-4 h-4" />;
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      critical: { color: 'bg-red-100 text-red-800', label: 'Crítico', icon: AlertTriangle },
      high: { color: 'bg-orange-100 text-orange-800', label: 'Alto', icon: ShieldAlert },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Médio', icon: Shield },
      low: { color: 'bg-blue-100 text-blue-800', label: 'Baixo', icon: Info },
      info: { color: 'bg-gray-100 text-gray-800', label: 'Info', icon: Info }
    };

    const config = severityConfig[severity] || severityConfig.info;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Filtrar logs
  const filteredLogs = accessLogs.filter(log => {
    const matchesSearch = log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ip_address?.includes(searchTerm) ||
                         log.endpoint?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = userFilter === 'all' || log.user_id?.toString() === userFilter;
    const matchesAction = actionFilter === 'all' || log.event_type === actionFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesIP = !ipFilter || log.ip_address?.includes(ipFilter);
    const matchesDevice = deviceFilter === 'all' || log.device_type === deviceFilter;
    
    return matchesSearch && matchesUser && matchesAction && matchesStatus && matchesIP && matchesDevice;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs de Acesso por Usuário</h1>
          <p className="text-gray-600 mt-1">Auditoria detalhada e rastreamento de atividades</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={realTimeEnabled}
              onCheckedChange={setRealTimeEnabled}
            />
            <Label>Tempo Real</Label>
          </div>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowExportModal(true)} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
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
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.active_users || 0}</div>
            <p className="text-xs text-muted-foreground">últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Acessos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total_accesses || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className={userStats.access_trend > 0 ? 'text-green-500' : 'text-red-500'}>
                {userStats.access_trend > 0 ? '+' : ''}{userStats.access_trend || 0}%
              </span>
              {' '}vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentativas Falhadas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{userStats.failed_attempts || 0}</div>
            <p className="text-xs text-muted-foreground">requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Únicos</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.unique_ips || 0}</div>
            <p className="text-xs text-muted-foreground">endereços diferentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.active_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">conectadas agora</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="logs">Logs Detalhados</TabsTrigger>
          <TabsTrigger value="users">Por Usuário</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Tab Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Atividades Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accessLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(log.device_type)}
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {log.user_name || `Usuário ${log.user_id}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getActionBadge(log.event_type)} • {log.ip_address} • {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.status || 'success')}
                        <Button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowLogDetails(true);
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

            {/* Top Usuários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Usuários Mais Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.top_users?.slice(0, 10).map((user, index) => (
                    <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.user_name || `Usuário ${user.user_id}`}</p>
                          <p className="text-xs text-gray-500">
                            {user.total_actions} ações • Último acesso: {new Date(user.last_access).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(user.total_actions / userStats.max_actions) * 100} className="w-16" />
                        <Button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
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
                  Tipos de Ação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.action_types?.map((action, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{action.name}:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(action.count / userStats.total_actions) * 100} className="w-20" />
                        <span className="font-bold text-sm">{action.count}</span>
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
                  Dispositivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.device_distribution?.map((device, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.type)}
                        <span className="text-sm">{device.name}:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(device.count / userStats.total_devices) * 100} className="w-20" />
                        <span className="font-bold text-sm">{device.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horários de Pico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.peak_hours?.map((hour, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{hour.hour}h:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(hour.count / userStats.max_hourly) * 100} className="w-20" />
                        <span className="font-bold text-sm">{hour.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Logs Detalhados */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Logs de Acesso Detalhados</h2>
            <div className="flex gap-2">
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name || `Usuário ${user.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create">Criar</SelectItem>
                  <SelectItem value="update">Atualizar</SelectItem>
                  <SelectItem value="delete">Excluir</SelectItem>
                  <SelectItem value="view">Visualizar</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Dispositivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar logs..."
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
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>IP/Dispositivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{log.user_name || `Usuário ${log.user_id}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.event_type)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.resource_type && (
                          <Badge variant="outline" className="mr-1">
                            {log.resource_type}
                          </Badge>
                        )}
                        {log.endpoint || log.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(log.device_type)}
                          <div>
                            <p className="font-mono text-xs">{log.ip_address}</p>
                            <p className="text-xs text-gray-500">{log.user_agent?.substring(0, 30)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status || 'success')}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowLogDetails(true);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Por Usuário */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Atividade por Usuário</h2>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userStats.user_activity?.map((user) => (
              <Card key={user.user_id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {user.user_name || `Usuário ${user.user_id}`}
                  </CardTitle>
                  <CardDescription>
                    Último acesso: {new Date(user.last_access).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total de Ações:</span>
                      <span className="font-bold">{user.total_actions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Logins:</span>
                      <span className="font-bold text-green-600">{user.login_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Falhas:</span>
                      <span className="font-bold text-red-600">{user.failed_attempts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">IPs Únicos:</span>
                      <span className="font-bold">{user.unique_ips}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dispositivos:</span>
                      <span className="font-bold">{user.device_count}</span>
                    </div>
                    {user.risk_score && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Risco:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={user.risk_score} className="w-16" />
                          <span className={`font-bold text-sm ${
                            user.risk_score > 70 ? 'text-red-600' :
                            user.risk_score > 40 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {user.risk_score}/100
                          </span>
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetails(true);
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Analytics Avançado</h2>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="1y">1 ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Tendências de Acesso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendências de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Crescimento de Usuários:</span>
                    <div className="flex items-center gap-1">
                      {userStats.user_growth > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`font-bold text-sm ${
                        userStats.user_growth > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {userStats.user_growth > 0 ? '+' : ''}{userStats.user_growth || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Atividade Média:</span>
                    <span className="font-bold">{userStats.avg_daily_activity || 0} ações/dia</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo Médio de Sessão:</span>
                    <span className="font-bold">{userStats.avg_session_duration || 0} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de Retenção:</span>
                    <span className="font-bold text-green-600">{userStats.retention_rate || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Padrões de Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Padrões de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de Sucesso de Login:</span>
                    <span className="font-bold text-green-600">{userStats.login_success_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tentativas Suspeitas:</span>
                    <span className="font-bold text-orange-600">{userStats.suspicious_attempts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">IPs Bloqueados:</span>
                    <span className="font-bold text-red-600">{userStats.blocked_ips || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Usuários em Quarentena:</span>
                    <span className="font-bold text-red-600">{userStats.quarantined_users || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de distribuição */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição Geográfica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.geographic_distribution?.map((location, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{location.country}:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(location.count / userStats.total_locations) * 100} className="w-20" />
                        <span className="font-bold text-sm">{location.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Navegadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.browser_distribution?.map((browser, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{browser.name}:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(browser.count / userStats.total_browsers) * 100} className="w-20" />
                        <span className="font-bold text-sm">{browser.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sistemas Operacionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.os_distribution?.map((os, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{os.name}:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(os.count / userStats.total_os) * 100} className="w-20" />
                        <span className="font-bold text-sm">{os.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes do log */}
      <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Log de Acesso</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Usuário:</Label>
                  <p>{selectedLog.user_name || `Usuário ${selectedLog.user_id}`}</p>
                </div>
                <div>
                  <Label className="font-semibold">Ação:</Label>
                  <p>{getActionBadge(selectedLog.event_type)}</p>
                </div>
                <div>
                  <Label className="font-semibold">IP:</Label>
                  <p className="font-mono">{selectedLog.ip_address}</p>
                </div>
                <div>
                  <Label className="font-semibold">Data/Hora:</Label>
                  <p>{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status:</Label>
                  <p>{getStatusBadge(selectedLog.status || 'success')}</p>
                </div>
                <div>
                  <Label className="font-semibold">Dispositivo:</Label>
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(selectedLog.device_type)}
                    <span>{selectedLog.device_type || 'Desconhecido'}</span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Descrição:</Label>
                <p className="mt-1">{selectedLog.description}</p>
              </div>
              {selectedLog.endpoint && (
                <div>
                  <Label className="font-semibold">Endpoint:</Label>
                  <p className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded">{selectedLog.endpoint}</p>
                </div>
              )}
              {selectedLog.user_agent && (
                <div>
                  <Label className="font-semibold">User Agent:</Label>
                  <p className="mt-1 text-sm bg-gray-100 p-2 rounded break-all">{selectedLog.user_agent}</p>
                </div>
              )}
              {selectedLog.metadata && (
                <div>
                  <Label className="font-semibold">Metadados:</Label>
                  <pre className="mt-1 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowLogDetails(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes do usuário */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Atividade do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Nome:</Label>
                  <p>{selectedUser.user_name || `Usuário ${selectedUser.user_id}`}</p>
                </div>
                <div>
                  <Label className="font-semibold">ID:</Label>
                  <p>{selectedUser.user_id}</p>
                </div>
                <div>
                  <Label className="font-semibold">Total de Ações:</Label>
                  <p className="font-bold">{selectedUser.total_actions}</p>
                </div>
                <div>
                  <Label className="font-semibold">Último Acesso:</Label>
                  <p>{new Date(selectedUser.last_access).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Logins Bem-sucedidos:</Label>
                  <p className="font-bold text-green-600">{selectedUser.login_count}</p>
                </div>
                <div>
                  <Label className="font-semibold">Tentativas Falhadas:</Label>
                  <p className="font-bold text-red-600">{selectedUser.failed_attempts}</p>
                </div>
                <div>
                  <Label className="font-semibold">IPs Únicos:</Label>
                  <p className="font-bold">{selectedUser.unique_ips}</p>
                </div>
                <div>
                  <Label className="font-semibold">Dispositivos:</Label>
                  <p className="font-bold">{selectedUser.device_count}</p>
                </div>
              </div>

              {selectedUser.recent_ips && (
                <div>
                  <Label className="font-semibold">IPs Recentes:</Label>
                  <div className="mt-1 space-y-1">
                    {selectedUser.recent_ips.map((ip, index) => (
                      <Badge key={index} variant="outline" className="mr-1 font-mono">
                        {ip}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.risk_indicators && (
                <div>
                  <Label className="font-semibold">Indicadores de Risco:</Label>
                  <div className="mt-1 space-y-1">
                    {selectedUser.risk_indicators.map((indicator, index) => (
                      <Badge key={index} variant="destructive" className="mr-1">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowUserDetails(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de exportação */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Logs de Acesso</DialogTitle>
            <DialogDescription>
              Selecione o formato e período para exportação dos logs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="export_format">Formato:</Label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Inicial:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Data Final:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowExportModal(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={() => exportLogs('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAccessLogs;