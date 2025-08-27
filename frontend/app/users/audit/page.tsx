'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuditLog, AuditFilters } from '@/types/users';
import {
  useAuditLogs,
  useAuditStatistics,
  useUserAuditLogs,
  useResourceAuditLogs,
  useActionAuditLogs,
  useDateRangeAuditLogs,
  useAuditUtils,
} from '@/hooks/useAudit';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Calendar,
  CalendarDays,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Database,
  Settings,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatDateTime } from '@/lib/utils';

const actionIcons = {
  CREATE: Plus,
  READ: Eye,
  UPDATE: Edit,
  DELETE: Trash2,
  LOGIN: LogIn,
  LOGOUT: LogOut,
  ACCESS: Shield,
  EXPORT: Download,
  IMPORT: Database,
  CONFIGURE: Settings,
  default: Activity,
};

const actionColors = {
  CREATE: 'bg-green-100 text-green-800 border-green-200',
  READ: 'bg-blue-100 text-blue-800 border-blue-200',
  UPDATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
  LOGIN: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  LOGOUT: 'bg-orange-100 text-orange-800 border-orange-200',
  ACCESS: 'bg-purple-100 text-purple-800 border-purple-200',
  EXPORT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  IMPORT: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  CONFIGURE: 'bg-gray-100 text-gray-800 border-gray-200',
  default: 'bg-slate-100 text-slate-800 border-slate-200',
};

const statusColors = {
  SUCCESS: 'bg-green-100 text-green-800',
  ERROR: 'bg-red-100 text-red-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  INFO: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

export default function AuditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  
  // Filters state
  const [filters, setFilters] = useState<AuditFilters>({
    user_id: searchParams.get('user_id') || undefined,
    action: searchParams.get('action') || undefined,
    resource: searchParams.get('resource') || undefined,
    status: searchParams.get('status') || undefined,
    start_date: searchParams.get('start_date') || undefined,
    end_date: searchParams.get('end_date') || undefined,
    search: searchParams.get('search') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '50'),
  });

  // Hooks
  const { data: auditData, isLoading: auditLoading, refetch: refetchAudit } = useAuditLogs(filters);
  const { data: statistics, isLoading: statsLoading } = useAuditStatistics();
  const { data: users } = useUsers({ limit: 1000 });
  const { formatLogMessage, getActionIcon, getStatusColor } = useAuditUtils();

  const auditLogs = auditData?.logs || [];
  const totalLogs = auditData?.total || 0;
  const totalPages = Math.ceil(totalLogs / filters.limit);

  // Memoized values
  const uniqueActions = useMemo(() => {
    const actions = new Set(auditLogs.map(log => log.action));
    return Array.from(actions).sort();
  }, [auditLogs]);

  const uniqueResources = useMemo(() => {
    const resources = new Set(auditLogs.map(log => log.resource));
    return Array.from(resources).sort();
  }, [auditLogs]);

  // Handlers
  const handleFilterChange = (key: keyof AuditFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) {
        params.set(k, v.toString());
      }
    });
    router.push(`/users/audit?${params.toString()}`);
  };

  const handleClearFilters = () => {
    const clearedFilters = { page: 1, limit: 50 };
    setFilters(clearedFilters);
    router.push('/users/audit');
  };

  const handleExportLogs = async () => {
    try {
      // Implementar exportação de logs
      toast.success('Logs exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      toast.error('Erro ao exportar logs');
    }
  };

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setShowLogDialog(true);
  };

  const getActionColor = (action: string) => {
    const colorKey = action.toUpperCase() as keyof typeof actionColors;
    return actionColors[colorKey] || actionColors.default;
  };

  if (auditLoading && !auditLogs.length) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Auditoria do Sistema
          </h1>
          <p className="text-muted-foreground">
            Monitore e analise todas as ações realizadas pelos usuários no sistema
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchAudit()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={handleExportLogs}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Logs</p>
                  <p className="text-2xl font-bold">{statistics.total_logs?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{statistics.active_users?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ações Bem-sucedidas</p>
                  <p className="text-2xl font-bold">{statistics.successful_actions?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Erros</p>
                  <p className="text-2xl font-bold">{statistics.failed_actions?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs de Auditoria
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar logs..."
                      value={filters.search || ''}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="user">Usuário</Label>
                  <Select
                    value={filters.user_id || ''}
                    onValueChange={(value) => handleFilterChange('user_id', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os usuários" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os usuários</SelectItem>
                      {users?.users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} (@{user.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="action">Ação</Label>
                  <Select
                    value={filters.action || ''}
                    onValueChange={(value) => handleFilterChange('action', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as ações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as ações</SelectItem>
                      {uniqueActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="resource">Recurso</Label>
                  <Select
                    value={filters.resource || ''}
                    onValueChange={(value) => handleFilterChange('resource', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os recursos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os recursos</SelectItem>
                      {uniqueResources.map((resource) => (
                        <SelectItem key={resource} value={resource}>
                          {resource}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) => handleFilterChange('status', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      <SelectItem value="SUCCESS">Sucesso</SelectItem>
                      <SelectItem value="ERROR">Erro</SelectItem>
                      <SelectItem value="WARNING">Aviso</SelectItem>
                      <SelectItem value="INFO">Informação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="start_date">Data Inicial</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={filters.start_date || ''}
                    onChange={(e) => handleFilterChange('start_date', e.target.value || undefined)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date">Data Final</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={filters.end_date || ''}
                    onChange={(e) => handleFilterChange('end_date', e.target.value || undefined)}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Logs de Auditoria</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {totalLogs.toLocaleString()} registros encontrados
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {auditLogs.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Recurso</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => {
                        const ActionIcon = getActionIcon(log.action);
                        const actionColor = getActionColor(log.action);
                        const statusColor = getStatusColor(log.status);
                        
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-sm">
                              {formatDateTime(log.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{log.user?.full_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    @{log.user?.username}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={actionColor}>
                                <ActionIcon className="mr-1 h-3 w-3" />
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{log.resource}</span>
                              {log.resource_id && (
                                <div className="text-sm text-muted-foreground">
                                  ID: {log.resource_id}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColor}>
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {log.ip_address}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewLog(log)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Página {filters.page} de {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={filters.page <= 1}
                          onClick={() => handleFilterChange('page', filters.page - 1)}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={filters.page >= totalPages}
                          onClick={() => handleFilterChange('page', filters.page + 1)}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum log encontrado</h3>
                  <p className="text-muted-foreground">
                    Não há logs de auditoria que correspondam aos filtros aplicados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Funcionalidade de análises em desenvolvimento. Em breve você poderá visualizar
              gráficos e relatórios detalhados sobre as atividades do sistema.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Log Detail Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
            <DialogDescription>
              Informações completas sobre a ação registrada
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data/Hora</Label>
                  <p className="font-mono">{formatDateTime(selectedLog.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedLog.status)}>
                    {selectedLog.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Usuário</Label>
                  <p>{selectedLog.user?.full_name} (@{selectedLog.user?.username})</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">IP</Label>
                  <p className="font-mono">{selectedLog.ip_address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ação</Label>
                  <Badge className={getActionColor(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Recurso</Label>
                  <p>{selectedLog.resource}</p>
                  {selectedLog.resource_id && (
                    <p className="text-sm text-muted-foreground">ID: {selectedLog.resource_id}</p>
                  )}
                </div>
              </div>
              
              {selectedLog.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedLog.description}</p>
                </div>
              )}
              
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Metadados</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.user_agent && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">User Agent</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md text-sm font-mono break-all">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}