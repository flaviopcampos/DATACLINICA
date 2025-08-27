'use client'

import { useState } from 'react'
import { Bell, AlertTriangle, Clock, Package, TrendingDown, Settings, Filter, Search, Eye, CheckCircle, XCircle, Calendar, MapPin, User, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  category: 'stock' | 'expiry' | 'maintenance' | 'quality'
  title: string
  description: string
  item: string
  itemCode: string
  department: string
  location: string
  currentStock?: number
  minimumStock?: number
  expiryDate?: string
  daysToExpiry?: number
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'acknowledged' | 'resolved'
  createdAt: string
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolvedAt?: string
  assignedTo?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  stockAlerts: boolean
  expiryAlerts: boolean
  maintenanceAlerts: boolean
  criticalAlertsOnly: boolean
  alertFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  recipients: string[]
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    category: 'stock',
    title: 'Estoque Crítico',
    description: 'Estoque abaixo do nível crítico',
    item: 'Dipirona 500mg',
    itemCode: 'MED-001',
    department: 'Farmácia',
    location: 'Prateleira A-15',
    currentStock: 5,
    minimumStock: 50,
    priority: 'high',
    status: 'active',
    createdAt: '2024-01-20T10:30:00',
    assignedTo: 'Ana Silva'
  },
  {
    id: '2',
    type: 'warning',
    category: 'expiry',
    title: 'Medicamento Vencendo',
    description: 'Medicamento próximo ao vencimento',
    item: 'Amoxicilina 250mg',
    itemCode: 'MED-045',
    department: 'Farmácia',
    location: 'Prateleira B-08',
    expiryDate: '2024-01-25',
    daysToExpiry: 5,
    priority: 'medium',
    status: 'acknowledged',
    createdAt: '2024-01-18T14:20:00',
    acknowledgedBy: 'João Santos',
    acknowledgedAt: '2024-01-19T09:15:00'
  },
  {
    id: '3',
    type: 'warning',
    category: 'maintenance',
    title: 'Manutenção Preventiva',
    description: 'Equipamento necessita manutenção preventiva',
    item: 'Monitor Cardíaco MC-200',
    itemCode: 'EQP-078',
    department: 'UTI',
    location: 'Leito 05',
    priority: 'medium',
    status: 'active',
    createdAt: '2024-01-17T16:45:00',
    assignedTo: 'Carlos Oliveira'
  },
  {
    id: '4',
    type: 'info',
    category: 'stock',
    title: 'Estoque Baixo',
    description: 'Estoque abaixo do nível recomendado',
    item: 'Luvas Descartáveis M',
    itemCode: 'SUP-012',
    department: 'Enfermagem',
    location: 'Almoxarifado Central',
    currentStock: 150,
    minimumStock: 200,
    priority: 'low',
    status: 'active',
    createdAt: '2024-01-16T11:20:00'
  },
  {
    id: '5',
    type: 'critical',
    category: 'quality',
    title: 'Problema de Qualidade',
    description: 'Lote com possível problema de qualidade reportado',
    item: 'Soro Fisiológico 500ml',
    itemCode: 'MED-089',
    department: 'Farmácia',
    location: 'Câmara Fria',
    priority: 'high',
    status: 'resolved',
    createdAt: '2024-01-15T08:30:00',
    resolvedAt: '2024-01-16T14:20:00'
  }
]

const mockNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  stockAlerts: true,
  expiryAlerts: true,
  maintenanceAlerts: true,
  criticalAlertsOnly: false,
  alertFrequency: 'immediate',
  recipients: ['admin@dataclinica.com', 'farmacia@dataclinica.com']
}

function getAlertTypeColor(type: Alert['type']) {
  switch (type) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getAlertTypeIcon(type: Alert['type']) {
  switch (type) {
    case 'critical': return <XCircle className="h-4 w-4" />
    case 'warning': return <AlertTriangle className="h-4 w-4" />
    case 'info': return <Bell className="h-4 w-4" />
    default: return <Bell className="h-4 w-4" />
  }
}

function getStatusColor(status: Alert['status']) {
  switch (status) {
    case 'active': return 'bg-red-100 text-red-800'
    case 'acknowledged': return 'bg-yellow-100 text-yellow-800'
    case 'resolved': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getPriorityColor(priority: Alert['priority']) {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('pt-BR')
}

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [notificationSettings, setNotificationSettings] = useState(mockNotificationSettings)

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || alert.type === selectedType
    const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus
  })

  const alertStats = {
    total: mockAlerts.length,
    critical: mockAlerts.filter(a => a.type === 'critical').length,
    warning: mockAlerts.filter(a => a.type === 'warning').length,
    active: mockAlerts.filter(a => a.status === 'active').length,
    acknowledged: mockAlerts.filter(a => a.status === 'acknowledged').length
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    // Implementar lógica para reconhecer alerta
    console.log('Acknowledging alert:', alertId)
  }

  const handleResolveAlert = (alertId: string) => {
    // Implementar lógica para resolver alerta
    console.log('Resolving alert:', alertId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertas de Estoque</h1>
          <p className="text-muted-foreground">Monitoramento e gestão de alertas do inventário médico</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configurações de Notificações</DialogTitle>
                <DialogDescription>
                  Configure como e quando receber alertas do sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Tipos de Notificação</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Notificações por Email</Label>
                      <Switch
                        id="email-notifications"
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                      <Switch
                        id="sms-notifications"
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">Notificações Push</Label>
                      <Switch
                        id="push-notifications"
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Tipos de Alerta</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stock-alerts">Alertas de Estoque</Label>
                      <Switch
                        id="stock-alerts"
                        checked={notificationSettings.stockAlerts}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, stockAlerts: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="expiry-alerts">Alertas de Validade</Label>
                      <Switch
                        id="expiry-alerts"
                        checked={notificationSettings.expiryAlerts}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, expiryAlerts: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="maintenance-alerts">Alertas de Manutenção</Label>
                      <Switch
                        id="maintenance-alerts"
                        checked={notificationSettings.maintenanceAlerts}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, maintenanceAlerts: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label htmlFor="alert-frequency">Frequência de Alertas</Label>
                  <Select
                    value={notificationSettings.alertFrequency}
                    onValueChange={(value: any) => 
                      setNotificationSettings(prev => ({ ...prev, alertFrequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Imediato</SelectItem>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Salvar Configurações</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Novo Alerta
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.total}</div>
            <p className="text-xs text-muted-foreground">Todos os alertas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertStats.critical}</div>
            <p className="text-xs text-muted-foreground">Requer ação imediata</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avisos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{alertStats.warning}</div>
            <p className="text-xs text-muted-foreground">Atenção necessária</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{alertStats.active}</div>
            <p className="text-xs text-muted-foreground">Aguardando ação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reconhecidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{alertStats.acknowledged}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por item, código ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="info">Informação</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                <SelectItem value="stock">Estoque</SelectItem>
                <SelectItem value="expiry">Validade</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="quality">Qualidade</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="acknowledged">Reconhecido</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Alertas</CardTitle>
          <CardDescription>
            {filteredAlerts.length} alerta(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Badge className={getAlertTypeColor(alert.type)}>
                        {getAlertTypeIcon(alert.type)}
                        <span className="ml-1 capitalize">{alert.type}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alert.item}</div>
                        <div className="text-sm text-muted-foreground">{alert.itemCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-muted-foreground">{alert.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alert.department}</div>
                        <div className="text-sm text-muted-foreground">{alert.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status === 'active' ? 'Ativo' : 
                         alert.status === 'acknowledged' ? 'Reconhecido' : 'Resolvido'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(alert.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAlert(alert)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Alerta</DialogTitle>
                            </DialogHeader>
                            {selectedAlert && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                                    <div className="mt-1">
                                      <Badge className={getAlertTypeColor(selectedAlert.type)}>
                                        {getAlertTypeIcon(selectedAlert.type)}
                                        <span className="ml-1 capitalize">{selectedAlert.type}</span>
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                      <Badge className={getStatusColor(selectedAlert.status)}>
                                        {selectedAlert.status === 'active' ? 'Ativo' : 
                                         selectedAlert.status === 'acknowledged' ? 'Reconhecido' : 'Resolvido'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Item</Label>
                                  <div className="mt-1">
                                    <div className="font-medium">{selectedAlert.item}</div>
                                    <div className="text-sm text-muted-foreground">Código: {selectedAlert.itemCode}</div>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                                  <div className="mt-1">
                                    <div className="font-medium">{selectedAlert.title}</div>
                                    <div className="text-sm text-muted-foreground">{selectedAlert.description}</div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Departamento</Label>
                                    <div className="mt-1 font-medium">{selectedAlert.department}</div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Localização</Label>
                                    <div className="mt-1 font-medium">{selectedAlert.location}</div>
                                  </div>
                                </div>

                                {selectedAlert.currentStock && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Estoque Atual</Label>
                                      <div className="mt-1 font-medium">{selectedAlert.currentStock}</div>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Estoque Mínimo</Label>
                                      <div className="mt-1 font-medium">{selectedAlert.minimumStock}</div>
                                    </div>
                                  </div>
                                )}

                                {selectedAlert.expiryDate && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Data de Validade</Label>
                                      <div className="mt-1 font-medium">{new Date(selectedAlert.expiryDate).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Dias para Vencer</Label>
                                      <div className="mt-1 font-medium">{selectedAlert.daysToExpiry} dias</div>
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Criado em</Label>
                                    <div className="mt-1 font-medium">{formatDate(selectedAlert.createdAt)}</div>
                                  </div>
                                  {selectedAlert.assignedTo && (
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Responsável</Label>
                                      <div className="mt-1 font-medium">{selectedAlert.assignedTo}</div>
                                    </div>
                                  )}
                                </div>

                                {selectedAlert.status === 'active' && (
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleAcknowledgeAlert(selectedAlert.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Reconhecer
                                    </Button>
                                    <Button 
                                      onClick={() => handleResolveAlert(selectedAlert.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Resolver
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {alert.status === 'active' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleResolveAlert(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}