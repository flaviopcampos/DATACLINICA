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
import {
  Monitor,
  Smartphone,
  Globe,
  Shield,
  ShieldAlert,
  Clock,
  MapPin,
  Activity,
  Users,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  Calendar,
  BarChart3
} from 'lucide-react';

const SessionManager = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('active');
  const [sessions, setSessions] = useState([]);
  const [sessionStats, setSessionStats] = useState({});
  const [sessionActivities, setSessionActivities] = useState([]);
  const [suspiciousSessions, setSuspiciousSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  // Estados para modais
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Estados para configurações
  const [sessionSettings, setSessionSettings] = useState({
    max_concurrent_sessions: 5,
    session_timeout: 30,
    suspicious_activity_detection: true,
    geo_blocking_enabled: false,
    device_tracking_enabled: true,
    auto_logout_inactive: true
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [activeTab, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'active':
          await loadActiveSessions();
          break;
        case 'all':
          await loadAllSessions();
          break;
        case 'suspicious':
          await loadSuspiciousSessions();
          break;
        case 'stats':
          await loadSessionStats();
          break;
        case 'activities':
          await loadSessionActivities();
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

  const loadActiveSessions = async () => {
    try {
      const response = await fetch('/api/sessions/active');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões ativas:', error);
    }
  };

  const loadAllSessions = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        device: deviceFilter !== 'all' ? deviceFilter : '',
        location: locationFilter !== 'all' ? locationFilter : '',
        date_range: dateRange
      });
      
      const response = await fetch(`/api/sessions/?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar todas as sessões:', error);
    }
  };

  const loadSuspiciousSessions = async () => {
    try {
      const response = await fetch('/api/sessions/suspicious');
      if (response.ok) {
        const data = await response.json();
        setSuspiciousSessions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões suspeitas:', error);
    }
  };

  const loadSessionStats = async () => {
    try {
      const response = await fetch(`/api/sessions/stats?date_range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setSessionStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadSessionActivities = async () => {
    try {
      const response = await fetch(`/api/sessions/activities?date_range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setSessionActivities(data);
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  };

  // Funções para gerenciar sessões
  const terminateSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/terminate`, {
        method: 'POST'
      });

      if (response.ok) {
        setSuccess('Sessão terminada com sucesso!');
        setShowTerminateModal(false);
        loadData();
      } else {
        throw new Error('Erro ao terminar sessão');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const blockSession = async (sessionId, reason) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        setSuccess('Sessão bloqueada com sucesso!');
        setShowBlockModal(false);
        loadData();
      } else {
        throw new Error('Erro ao bloquear sessão');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const unblockSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/unblock`, {
        method: 'POST'
      });

      if (response.ok) {
        setSuccess('Sessão desbloqueada com sucesso!');
        loadData();
      } else {
        throw new Error('Erro ao desbloquear sessão');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const markAsSafe = async (sessionId) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/mark-safe`, {
        method: 'POST'
      });

      if (response.ok) {
        setSuccess('Sessão marcada como segura!');
        loadData();
      } else {
        throw new Error('Erro ao marcar sessão como segura');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const terminateAllSessions = async (excludeCurrent = true) => {
    try {
      const response = await fetch('/api/sessions/terminate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exclude_current: excludeCurrent })
      });

      if (response.ok) {
        setSuccess('Todas as sessões foram terminadas!');
        loadData();
      } else {
        throw new Error('Erro ao terminar todas as sessões');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Função para obter ícone do dispositivo
  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
      case 'smartphone':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
      case 'computer':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  // Função para obter badge de status
  const getStatusBadge = (status, isSuspicious = false) => {
    if (isSuspicious) {
      return <Badge className="bg-red-100 text-red-800"><ShieldAlert className="w-3 h-3 mr-1" />Suspeita</Badge>;
    }

    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Ativa', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inativa', icon: Clock },
      blocked: { color: 'bg-red-100 text-red-800', label: 'Bloqueada', icon: Ban },
      expired: { color: 'bg-yellow-100 text-yellow-800', label: 'Expirada', icon: XCircle },
      terminated: { color: 'bg-gray-100 text-gray-800', label: 'Terminada', icon: XCircle }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: Activity };
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Função para calcular tempo de sessão
  const getSessionDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Filtrar sessões
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.ip_address?.includes(searchTerm) ||
                         session.device_info?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesDevice = deviceFilter === 'all' || session.device_type === deviceFilter;
    const matchesLocation = locationFilter === 'all' || session.location?.includes(locationFilter);
    
    return matchesSearch && matchesStatus && matchesDevice && matchesLocation;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Sessões</h1>
          <p className="text-gray-600 mt-1">Monitore e gerencie sessões de usuário em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => terminateAllSessions(true)} variant="outline">
            <Ban className="w-4 h-4 mr-2" />
            Terminar Outras Sessões
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.active_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">usuários online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Suspeitas</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{sessionStats.suspicious_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Únicos</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.unique_ips || 0}</div>
            <p className="text-xs text-muted-foreground">localizações diferentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.unique_devices || 0}</div>
            <p className="text-xs text-muted-foreground">dispositivos únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Bloqueadas</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.blocked_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">bloqueadas por segurança</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="active">Sessões Ativas</TabsTrigger>
          <TabsTrigger value="all">Todas as Sessões</TabsTrigger>
          <TabsTrigger value="suspicious">Suspeitas</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Tab de Sessões Ativas */}
        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sessões Ativas</h2>
            <div className="flex gap-2">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar sessões..."
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
                    <TableHead>Usuário</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>IP / Localização</TableHead>
                    <TableHead>Início da Sessão</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {session.user_name || session.user_id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.device_type)}
                          <div>
                            <div className="font-medium">{session.device_type}</div>
                            <div className="text-sm text-gray-500">{session.browser}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{session.ip_address}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.location || 'Desconhecida'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(session.created_at).toLocaleString()}</TableCell>
                      <TableCell>{getSessionDuration(session.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(session.status, session.is_suspicious)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowSessionDetails(true);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {session.status === 'active' && (
                            <Button
                              onClick={() => {
                                setSelectedSession(session);
                                setShowTerminateModal(true);
                              }}
                              size="sm"
                              variant="outline"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                          {session.is_suspicious && (
                            <Button
                              onClick={() => markAsSafe(session.id)}
                              size="sm"
                              variant="outline"
                            >
                              <Shield className="w-4 h-4" />
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

        {/* Tab de Todas as Sessões */}
        <TabsContent value="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Todas as Sessões</h2>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                  <SelectItem value="blocked">Bloqueadas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
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
              
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Hoje</SelectItem>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
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
                    <TableHead>Usuário</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>IP / Localização</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {session.user_name || session.user_id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.device_type)}
                          <div>
                            <div className="font-medium">{session.device_type}</div>
                            <div className="text-sm text-gray-500">{session.browser}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{session.ip_address}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.location || 'Desconhecida'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(session.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {session.ended_at ? new Date(session.ended_at).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(session.status, session.is_suspicious)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowSessionDetails(true);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {session.status === 'blocked' && (
                            <Button
                              onClick={() => unblockSession(session.id)}
                              size="sm"
                              variant="outline"
                            >
                              <CheckCircle className="w-4 h-4" />
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

        {/* Tab de Sessões Suspeitas */}
        <TabsContent value="suspicious" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sessões Suspeitas</h2>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Motivo da Suspeita</TableHead>
                    <TableHead>IP / Localização</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Detectado em</TableHead>
                    <TableHead>Nível de Risco</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspiciousSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {session.user_name || session.user_id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {session.suspicious_reasons?.map((reason, index) => (
                            <Badge key={index} variant="outline" className="mr-1">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{session.ip_address}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.location || 'Desconhecida'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.device_type)}
                          {session.device_type}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(session.detected_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            session.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                            session.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {session.risk_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => markAsSafe(session.id)}
                            size="sm"
                            variant="outline"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowBlockModal(true);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowSessionDetails(true);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
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

        {/* Tab de Atividades */}
        <TabsContent value="activities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Atividades de Sessão</h2>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Hoje</SelectItem>
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
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{activity.user_name || activity.user_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{activity.activity_type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{activity.endpoint}</TableCell>
                      <TableCell>{activity.ip_address}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            activity.status_code >= 200 && activity.status_code < 300 ? 'bg-green-100 text-green-800' :
                            activity.status_code >= 400 ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {activity.status_code}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Estatísticas */}
        <TabsContent value="stats" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Estatísticas de Sessão</h2>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Resumo Geral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total de Sessões:</span>
                  <span className="font-bold">{sessionStats.total_sessions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sessões Ativas:</span>
                  <span className="font-bold text-green-600">{sessionStats.active_sessions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sessões Suspeitas:</span>
                  <span className="font-bold text-red-600">{sessionStats.suspicious_sessions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sessões Bloqueadas:</span>
                  <span className="font-bold text-orange-600">{sessionStats.blocked_sessions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Duração Média:</span>
                  <span className="font-bold">{sessionStats.average_duration || '0h 0m'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Distribuição Geográfica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionStats.countries?.map((country, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{country.name}:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(country.count / sessionStats.total_sessions) * 100} className="w-20" />
                      <span className="font-bold">{country.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes da sessão */}
      <Dialog open={showSessionDetails} onOpenChange={setShowSessionDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Sessão</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a sessão selecionada
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Usuário:</Label>
                  <p>{selectedSession.user_name || selectedSession.user_id}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status:</Label>
                  <p>{getStatusBadge(selectedSession.status, selectedSession.is_suspicious)}</p>
                </div>
                <div>
                  <Label className="font-semibold">IP:</Label>
                  <p>{selectedSession.ip_address}</p>
                </div>
                <div>
                  <Label className="font-semibold">Localização:</Label>
                  <p>{selectedSession.location || 'Desconhecida'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Dispositivo:</Label>
                  <p>{selectedSession.device_type}</p>
                </div>
                <div>
                  <Label className="font-semibold">Navegador:</Label>
                  <p>{selectedSession.browser}</p>
                </div>
                <div>
                  <Label className="font-semibold">Início:</Label>
                  <p>{new Date(selectedSession.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="font-semibold">Última Atividade:</Label>
                  <p>{new Date(selectedSession.last_activity).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedSession.is_suspicious && (
                <div>
                  <Label className="font-semibold">Motivos de Suspeita:</Label>
                  <div className="mt-2 space-y-1">
                    {selectedSession.suspicious_reasons?.map((reason, index) => (
                      <Badge key={index} variant="outline" className="mr-1">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowSessionDetails(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de terminar sessão */}
      <Dialog open={showTerminateModal} onOpenChange={setShowTerminateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminar Sessão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja terminar esta sessão? O usuário será desconectado imediatamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowTerminateModal(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={() => terminateSession(selectedSession?.id)} variant="destructive">
              Terminar Sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de bloquear sessão */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear Sessão</DialogTitle>
            <DialogDescription>
              Bloqueie esta sessão por atividade suspeita. O usuário não poderá mais usar esta sessão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="block_reason">Motivo do Bloqueio:</Label>
              <Input
                id="block_reason"
                placeholder="Ex: Atividade suspeita detectada"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowBlockModal(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={() => blockSession(selectedSession?.id, 'Atividade suspeita')} variant="destructive">
              Bloquear Sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionManager;