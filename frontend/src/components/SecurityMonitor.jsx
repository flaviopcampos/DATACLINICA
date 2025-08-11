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
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Eye,
  EyeOff,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Users,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Settings,
  Bell,
  BellOff,
  Zap,
  Target,
  Crosshair,
  AlertCircle,
  Info,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  Database,
  Server,
  Monitor,
  Smartphone,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

const SecurityMonitor = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [securityEvents, setSecurityEvents] = useState([]);
  const [threats, setThreats] = useState([]);
  const [securityStats, setSecurityStats] = useState({});
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [behaviorAnalysis, setBehaviorAnalysis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para configurações
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [autoResponse, setAutoResponse] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [threatLevel, setThreatLevel] = useState('medium');

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('24h');
  const [statusFilter, setStatusFilter] = useState('all');

  // Estados para modais
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showThreatDetails, setShowThreatDetails] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedThreat, setSelectedThreat] = useState(null);

  // Estados para WebSocket (simulação de tempo real)
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
    // Simular conexão WebSocket para atualizações em tempo real
    const interval = setInterval(() => {
      if (monitoringEnabled) {
        loadRealTimeData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab, dateRange, monitoringEnabled]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'dashboard':
          await Promise.all([
            loadSecurityStats(),
            loadRecentEvents(),
            loadActiveThreats()
          ]);
          break;
        case 'events':
          await loadSecurityEvents();
          break;
        case 'threats':
          await loadThreats();
          break;
        case 'behavior':
          await loadBehaviorAnalysis();
          break;
        case 'alerts':
          await loadRealTimeAlerts();
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

  const loadSecurityStats = async () => {
    try {
      const response = await fetch(`/api/security/stats?date_range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setSecurityStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadSecurityEvents = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        severity: severityFilter !== 'all' ? severityFilter : '',
        type: typeFilter !== 'all' ? typeFilter : '',
        status: statusFilter !== 'all' ? statusFilter : '',
        date_range: dateRange
      });
      
      const response = await fetch(`/api/security/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSecurityEvents(data);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const loadRecentEvents = async () => {
    try {
      const response = await fetch('/api/security/events/recent');
      if (response.ok) {
        const data = await response.json();
        setSecurityEvents(data.slice(0, 10)); // Últimos 10 eventos
      }
    } catch (error) {
      console.error('Erro ao carregar eventos recentes:', error);
    }
  };

  const loadThreats = async () => {
    try {
      const response = await fetch(`/api/security/threats?date_range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setThreats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar ameaças:', error);
    }
  };

  const loadActiveThreats = async () => {
    try {
      const response = await fetch('/api/security/threats/active');
      if (response.ok) {
        const data = await response.json();
        setThreats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar ameaças ativas:', error);
    }
  };

  const loadBehaviorAnalysis = async () => {
    try {
      const response = await fetch(`/api/security/behavior-analysis?date_range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setBehaviorAnalysis(data);
      }
    } catch (error) {
      console.error('Erro ao carregar análise comportamental:', error);
    }
  };

  const loadRealTimeAlerts = async () => {
    try {
      const response = await fetch('/api/security/alerts/real-time');
      if (response.ok) {
        const data = await response.json();
        setRealTimeAlerts(data);
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  const loadRealTimeData = async () => {
    try {
      // Simular atualizações em tempo real
      await Promise.all([
        loadSecurityStats(),
        loadRealTimeAlerts()
      ]);
      setLastUpdate(new Date());
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      console.error('Erro ao atualizar dados em tempo real:', error);
    }
  };

  // Funções de resposta a incidentes
  const respondToThreat = async (threatId, action, notes = '') => {
    try {
      const response = await fetch(`/api/security/threats/${threatId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes })
      });

      if (response.ok) {
        setSuccess(`Resposta aplicada com sucesso: ${action}`);
        setShowResponseModal(false);
        loadData();
      } else {
        throw new Error('Erro ao aplicar resposta');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const blockIP = async (ipAddress, reason) => {
    try {
      const response = await fetch('/api/security/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip_address: ipAddress, reason })
      });

      if (response.ok) {
        setSuccess(`IP ${ipAddress} bloqueado com sucesso!`);
        loadData();
      } else {
        throw new Error('Erro ao bloquear IP');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const quarantineUser = async (userId, reason) => {
    try {
      const response = await fetch(`/api/security/quarantine-user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        setSuccess('Usuário colocado em quarentena!');
        loadData();
      } else {
        throw new Error('Erro ao colocar usuário em quarentena');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      const response = await fetch(`/api/security/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      });

      if (response.ok) {
        setSuccess('Alerta reconhecido!');
        loadRealTimeAlerts();
      } else {
        throw new Error('Erro ao reconhecer alerta');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Funções utilitárias
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

  const getThreatTypeBadge = (type) => {
    const typeConfig = {
      brute_force: { color: 'bg-red-100 text-red-800', label: 'Força Bruta', icon: Target },
      sql_injection: { color: 'bg-purple-100 text-purple-800', label: 'SQL Injection', icon: Database },
      xss: { color: 'bg-pink-100 text-pink-800', label: 'XSS', icon: Crosshair },
      path_traversal: { color: 'bg-indigo-100 text-indigo-800', label: 'Path Traversal', icon: Unlock },
      rate_limit: { color: 'bg-orange-100 text-orange-800', label: 'Rate Limit', icon: Zap },
      suspicious_behavior: { color: 'bg-yellow-100 text-yellow-800', label: 'Comportamento Suspeito', icon: Eye },
      unauthorized_access: { color: 'bg-red-100 text-red-800', label: 'Acesso Não Autorizado', icon: Lock }
    };

    const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-800', label: type, icon: Shield };
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
      active: { color: 'bg-red-100 text-red-800', label: 'Ativo', icon: AlertCircle },
      investigating: { color: 'bg-yellow-100 text-yellow-800', label: 'Investigando', icon: Eye },
      resolved: { color: 'bg-green-100 text-green-800', label: 'Resolvido', icon: CheckCircle },
      blocked: { color: 'bg-gray-100 text-gray-800', label: 'Bloqueado', icon: Ban },
      ignored: { color: 'bg-blue-100 text-blue-800', label: 'Ignorado', icon: EyeOff }
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

  const getRiskScore = (score) => {
    if (score >= 80) return { color: 'text-red-600', label: 'Alto Risco' };
    if (score >= 60) return { color: 'text-orange-600', label: 'Médio Risco' };
    if (score >= 40) return { color: 'text-yellow-600', label: 'Baixo Risco' };
    return { color: 'text-green-600', label: 'Sem Risco' };
  };

  // Filtrar dados
  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.source_ip?.includes(searchTerm) ||
                         event.user_id?.toString().includes(searchTerm);
    
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    const matchesType = typeFilter === 'all' || event.threat_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitor de Segurança</h1>
          <p className="text-gray-600 mt-1">Monitoramento em tempo real e detecção de ameaças</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={monitoringEnabled}
              onCheckedChange={setMonitoringEnabled}
            />
            <Label>Monitoramento Ativo</Label>
          </div>
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

      {/* Alertas em tempo real */}
      {realTimeAlerts.length > 0 && (
        <div className="space-y-2">
          {realTimeAlerts.slice(0, 3).map((alert) => (
            <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <Bell className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>{alert.title}</span>
                <Button
                  onClick={() => acknowledgeAlert(alert.id)}
                  size="sm"
                  variant="outline"
                >
                  Reconhecer
                </Button>
              </AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ameaças Ativas</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityStats.active_threats || 0}</div>
            <p className="text-xs text-muted-foreground">requer atenção imediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.events_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className={securityStats.events_trend > 0 ? 'text-red-500' : 'text-green-500'}>
                {securityStats.events_trend > 0 ? '+' : ''}{securityStats.events_trend || 0}%
              </span>
              {' '}vs ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Bloqueados</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.blocked_ips || 0}</div>
            <p className="text-xs text-muted-foreground">bloqueios automáticos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Detecção</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{securityStats.detection_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">precisão do sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.avg_response_time || 0}s</div>
            <p className="text-xs text-muted-foreground">tempo médio</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="threats">Ameaças</TabsTrigger>
          <TabsTrigger value="behavior">Análise Comportamental</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        {/* Tab Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Eventos Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Eventos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSeverityBadge(event.severity)}
                        <div>
                          <p className="font-medium text-sm">{event.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventDetails(true);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ameaças Ativas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  Ameaças Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {threats.filter(t => t.status === 'active').slice(0, 5).map((threat) => (
                    <div key={threat.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getThreatTypeBadge(threat.threat_type)}
                        <div>
                          <p className="font-medium text-sm">{threat.description}</p>
                          <p className="text-xs text-gray-500">
                            IP: {threat.source_ip} | Risco: {threat.risk_score}/100
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => blockIP(threat.source_ip, 'Ameaça detectada')}
                          size="sm"
                          variant="outline"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedThreat(threat);
                            setShowThreatDetails(true);
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
                  Tipos de Ameaças
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityStats.threat_types?.map((type, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{type.name}:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(type.count / securityStats.total_threats) * 100} className="w-20" />
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
                  <PieChart className="w-5 h-5" />
                  Severidade dos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityStats.severity_distribution?.map((severity, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{severity.name}:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(severity.count / securityStats.total_events) * 100} className="w-20" />
                        <span className="font-bold text-sm">{severity.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Tendências
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Eventos por Hora:</span>
                    <div className="flex items-center gap-1">
                      {securityStats.hourly_trend > 0 ? (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      )}
                      <span className={`font-bold text-sm ${
                        securityStats.hourly_trend > 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {securityStats.hourly_trend > 0 ? '+' : ''}{securityStats.hourly_trend || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ameaças Bloqueadas:</span>
                    <span className="font-bold text-sm text-green-600">
                      {securityStats.blocked_today || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Falsos Positivos:</span>
                    <span className="font-bold text-sm text-yellow-600">
                      {securityStats.false_positives || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Eventos */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Eventos de Segurança</h2>
            <div className="flex gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="brute_force">Força Bruta</SelectItem>
                  <SelectItem value="sql_injection">SQL Injection</SelectItem>
                  <SelectItem value="xss">XSS</SelectItem>
                  <SelectItem value="rate_limit">Rate Limit</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="investigating">Investigando</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar eventos..."
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
                    <TableHead>Severidade</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>IP Origem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                      <TableCell>{getThreatTypeBadge(event.threat_type)}</TableCell>
                      <TableCell className="max-w-xs truncate">{event.description}</TableCell>
                      <TableCell className="font-mono">{event.source_ip}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowEventDetails(true);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {event.source_ip && (
                            <Button
                              onClick={() => blockIP(event.source_ip, 'Evento de segurança')}
                              size="sm"
                              variant="outline"
                            >
                              <Ban className="w-4 h-4" />
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

        {/* Tab Ameaças */}
        <TabsContent value="threats" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ameaças Detectadas</h2>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hora</SelectItem>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Detectado em</TableHead>
                    <TableHead>Tipo de Ameaça</TableHead>
                    <TableHead>IP Origem</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Risco</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {threats.map((threat) => {
                    const riskConfig = getRiskScore(threat.risk_score);
                    return (
                      <TableRow key={threat.id}>
                        <TableCell>{new Date(threat.detected_at).toLocaleString()}</TableCell>
                        <TableCell>{getThreatTypeBadge(threat.threat_type)}</TableCell>
                        <TableCell className="font-mono">{threat.source_ip}</TableCell>
                        <TableCell>{threat.user_id || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={threat.risk_score} className="w-16" />
                            <span className={`font-bold text-sm ${riskConfig.color}`}>
                              {threat.risk_score}/100
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(threat.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => {
                                setSelectedThreat(threat);
                                setShowResponseModal(true);
                              }}
                              size="sm"
                              variant="outline"
                            >
                              <Zap className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => blockIP(threat.source_ip, 'Ameaça detectada')}
                              size="sm"
                              variant="outline"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedThreat(threat);
                                setShowThreatDetails(true);
                              }}
                              size="sm"
                              variant="outline"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Análise Comportamental */}
        <TabsContent value="behavior" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Análise Comportamental</h2>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Padrões Anômalos Detectados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {behaviorAnalysis.filter(b => b.anomaly_detected).map((behavior) => (
                    <div key={behavior.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{behavior.user_name || behavior.user_id}</span>
                        <Badge className="bg-orange-100 text-orange-800">
                          Anomalia
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{behavior.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Confiança: {behavior.confidence_score}%</span>
                        <span>{new Date(behavior.detected_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuários com Comportamento Suspeito</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {behaviorAnalysis.filter(b => b.risk_score > 60).map((behavior) => (
                    <div key={behavior.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{behavior.user_name || behavior.user_id}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={behavior.risk_score} className="w-16" />
                          <span className={`font-bold text-sm ${getRiskScore(behavior.risk_score).color}`}>
                            {behavior.risk_score}/100
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Logins fora do horário: {behavior.unusual_login_times || 0}</p>
                        <p>IPs diferentes: {behavior.multiple_ips || 0}</p>
                        <p>Tentativas de acesso negadas: {behavior.failed_attempts || 0}</p>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button
                          onClick={() => quarantineUser(behavior.user_id, 'Comportamento suspeito')}
                          size="sm"
                          variant="outline"
                        >
                          <Lock className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Alertas */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Alertas em Tempo Real</h2>
            <div className="flex items-center gap-2">
              <Switch
                checked={alertsEnabled}
                onCheckedChange={setAlertsEnabled}
              />
              <Label>Alertas Habilitados</Label>
            </div>
          </div>

          <Card>
            <CardContent>
              <div className="space-y-3">
                {realTimeAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 border rounded-lg ${
                    alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                    alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                    alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getSeverityBadge(alert.severity)}
                        <span className="font-medium">{alert.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        <Button
                          onClick={() => acknowledgeAlert(alert.id)}
                          size="sm"
                          variant="outline"
                        >
                          {alert.acknowledged ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    {alert.recommended_action && (
                      <div className="text-xs text-gray-500">
                        <strong>Ação Recomendada:</strong> {alert.recommended_action}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes do evento */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Evento de Segurança</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Severidade:</Label>
                  <p>{getSeverityBadge(selectedEvent.severity)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Tipo:</Label>
                  <p>{getThreatTypeBadge(selectedEvent.threat_type)}</p>
                </div>
                <div>
                  <Label className="font-semibold">IP Origem:</Label>
                  <p className="font-mono">{selectedEvent.source_ip}</p>
                </div>
                <div>
                  <Label className="font-semibold">Data/Hora:</Label>
                  <p>{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Descrição:</Label>
                <p className="mt-1">{selectedEvent.description}</p>
              </div>
              {selectedEvent.details && (
                <div>
                  <Label className="font-semibold">Detalhes Técnicos:</Label>
                  <pre className="mt-1 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowEventDetails(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes da ameaça */}
      <Dialog open={showThreatDetails} onOpenChange={setShowThreatDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Ameaça</DialogTitle>
          </DialogHeader>
          {selectedThreat && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Tipo:</Label>
                  <p>{getThreatTypeBadge(selectedThreat.threat_type)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Nível de Risco:</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedThreat.risk_score} className="w-20" />
                    <span className={`font-bold ${getRiskScore(selectedThreat.risk_score).color}`}>
                      {selectedThreat.risk_score}/100
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">IP Origem:</Label>
                  <p className="font-mono">{selectedThreat.source_ip}</p>
                </div>
                <div>
                  <Label className="font-semibold">Detectado em:</Label>
                  <p>{new Date(selectedThreat.detected_at).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Descrição:</Label>
                <p className="mt-1">{selectedThreat.description}</p>
              </div>
              {selectedThreat.indicators && (
                <div>
                  <Label className="font-semibold">Indicadores:</Label>
                  <div className="mt-1 space-y-1">
                    {selectedThreat.indicators.map((indicator, index) => (
                      <Badge key={index} variant="outline" className="mr-1">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowThreatDetails(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de resposta a ameaça */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder à Ameaça</DialogTitle>
            <DialogDescription>
              Selecione a ação a ser tomada para esta ameaça.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="response_action">Ação:</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block_ip">Bloquear IP</SelectItem>
                  <SelectItem value="quarantine_user">Quarentena do Usuário</SelectItem>
                  <SelectItem value="monitor">Monitorar</SelectItem>
                  <SelectItem value="ignore">Ignorar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="response_notes">Notas:</Label>
              <Textarea
                id="response_notes"
                placeholder="Adicione observações sobre esta resposta..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResponseModal(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={() => respondToThreat(selectedThreat?.id, 'block_ip', 'Resposta automática')}>
              Aplicar Resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityMonitor;