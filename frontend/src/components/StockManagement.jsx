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
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  Calendar,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

const StockManagement = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventories, setInventories] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [departmentLevels, setDepartmentLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para modais
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  // Estados para formulários
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    description: '',
    scheduled_date: '',
    department: '',
    status: 'planned'
  });

  const [transferForm, setTransferForm] = useState({
    from_department: '',
    to_department: '',
    product_id: '',
    quantity: '',
    reason: '',
    notes: ''
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    product_id: '',
    adjustment_type: 'increase',
    quantity: '',
    reason: '',
    notes: ''
  });

  const [alertForm, setAlertForm] = useState({
    product_id: '',
    alert_type: 'low_stock',
    threshold_value: '',
    message: ''
  });

  // Filtros e busca
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'inventory':
          await loadInventories();
          break;
        case 'alerts':
          await loadStockAlerts();
          break;
        case 'transfers':
          await loadTransfers();
          break;
        case 'adjustments':
          await loadAdjustments();
          break;
        case 'departments':
          await loadDepartmentLevels();
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

  const loadInventories = async () => {
    const response = await fetch('/api/stock-management/inventories/');
    if (response.ok) {
      const data = await response.json();
      setInventories(data);
    }
  };

  const loadStockAlerts = async () => {
    const response = await fetch('/api/stock-management/alerts/');
    if (response.ok) {
      const data = await response.json();
      setStockAlerts(data);
    }
  };

  const loadTransfers = async () => {
    const response = await fetch('/api/stock-management/transfers/');
    if (response.ok) {
      const data = await response.json();
      setTransfers(data);
    }
  };

  const loadAdjustments = async () => {
    const response = await fetch('/api/stock-management/adjustments/');
    if (response.ok) {
      const data = await response.json();
      setAdjustments(data);
    }
  };

  const loadDepartmentLevels = async () => {
    const response = await fetch('/api/stock-management/department-levels/');
    if (response.ok) {
      const data = await response.json();
      setDepartmentLevels(data);
    }
  };

  // Funções para criar registros
  const createInventory = async () => {
    try {
      const response = await fetch('/api/stock-management/inventories/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventoryForm)
      });

      if (response.ok) {
        setSuccess('Inventário criado com sucesso!');
        setShowInventoryModal(false);
        setInventoryForm({ name: '', description: '', scheduled_date: '', department: '', status: 'planned' });
        loadInventories();
      } else {
        throw new Error('Erro ao criar inventário');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const createTransfer = async () => {
    try {
      const response = await fetch('/api/stock-management/transfers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferForm)
      });

      if (response.ok) {
        setSuccess('Transferência criada com sucesso!');
        setShowTransferModal(false);
        setTransferForm({ from_department: '', to_department: '', product_id: '', quantity: '', reason: '', notes: '' });
        loadTransfers();
      } else {
        throw new Error('Erro ao criar transferência');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const createAdjustment = async () => {
    try {
      const response = await fetch('/api/stock-management/adjustments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustmentForm)
      });

      if (response.ok) {
        setSuccess('Ajuste criado com sucesso!');
        setShowAdjustmentModal(false);
        setAdjustmentForm({ product_id: '', adjustment_type: 'increase', quantity: '', reason: '', notes: '' });
        loadAdjustments();
      } else {
        throw new Error('Erro ao criar ajuste');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const createAlert = async () => {
    try {
      const response = await fetch('/api/stock-management/alerts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertForm)
      });

      if (response.ok) {
        setSuccess('Alerta criado com sucesso!');
        setShowAlertModal(false);
        setAlertForm({ product_id: '', alert_type: 'low_stock', threshold_value: '', message: '' });
        loadStockAlerts();
      } else {
        throw new Error('Erro ao criar alerta');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Função para resolver alertas
  const resolveAlert = async (alertId) => {
    try {
      const response = await fetch(`/api/stock-management/alerts/${alertId}/resolve`, {
        method: 'PUT'
      });

      if (response.ok) {
        setSuccess('Alerta resolvido com sucesso!');
        loadStockAlerts();
      } else {
        throw new Error('Erro ao resolver alerta');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Função para aprovar transferências
  const approveTransfer = async (transferId) => {
    try {
      const response = await fetch(`/api/stock-management/transfers/${transferId}/approve`, {
        method: 'PUT'
      });

      if (response.ok) {
        setSuccess('Transferência aprovada com sucesso!');
        loadTransfers();
      } else {
        throw new Error('Erro ao aprovar transferência');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Função para gerar relatórios
  const generateReport = async (reportType) => {
    try {
      const response = await fetch(`/api/stock-management/reports/${reportType}`);
      if (response.ok) {
        const data = await response.json();
        // Aqui você pode implementar a lógica para exibir ou baixar o relatório
        console.log('Relatório gerado:', data);
        setSuccess(`Relatório ${reportType} gerado com sucesso!`);
      } else {
        throw new Error('Erro ao gerar relatório');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Função para obter badge de status
  const getStatusBadge = (status) => {
    const statusConfig = {
      planned: { color: 'bg-blue-100 text-blue-800', label: 'Planejado' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'Em Andamento' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Concluído' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
      pending: { color: 'bg-orange-100 text-orange-800', label: 'Pendente' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejeitado' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque Ampliado</h1>
          <p className="text-gray-600 mt-1">Gerencie inventários, transferências, alertas e ajustes de estoque</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => generateReport('low-stock')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Relatório Estoque Baixo
          </Button>
          <Button onClick={() => generateReport('expiring-products')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Produtos Vencendo
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

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inventory">Inventários</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="transfers">Transferências</TabsTrigger>
          <TabsTrigger value="adjustments">Ajustes</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
        </TabsList>

        {/* Tab de Inventários */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inventários de Estoque</h2>
            <Dialog open={showInventoryModal} onOpenChange={setShowInventoryModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Inventário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Inventário</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para criar um novo inventário de estoque.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Nome</Label>
                    <Input
                      id="name"
                      value={inventoryForm.name}
                      onChange={(e) => setInventoryForm({...inventoryForm, name: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Descrição</Label>
                    <Textarea
                      id="description"
                      value={inventoryForm.description}
                      onChange={(e) => setInventoryForm({...inventoryForm, description: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="scheduled_date" className="text-right">Data Agendada</Label>
                    <Input
                      id="scheduled_date"
                      type="datetime-local"
                      value={inventoryForm.scheduled_date}
                      onChange={(e) => setInventoryForm({...inventoryForm, scheduled_date: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="department" className="text-right">Departamento</Label>
                    <Select
                      value={inventoryForm.department}
                      onValueChange={(value) => setInventoryForm({...inventoryForm, department: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmacia">Farmácia</SelectItem>
                        <SelectItem value="enfermagem">Enfermagem</SelectItem>
                        <SelectItem value="cirurgia">Cirurgia</SelectItem>
                        <SelectItem value="laboratorio">Laboratório</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createInventory}>Criar Inventário</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Data Agendada</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado por</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventories.map((inventory) => (
                    <TableRow key={inventory.id}>
                      <TableCell className="font-medium">{inventory.name}</TableCell>
                      <TableCell>{inventory.department}</TableCell>
                      <TableCell>{new Date(inventory.scheduled_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(inventory.status)}</TableCell>
                      <TableCell>{inventory.created_by}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Alertas */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Alertas de Estoque</h2>
            <Dialog open={showAlertModal} onOpenChange={setShowAlertModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Alerta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Alerta</DialogTitle>
                  <DialogDescription>
                    Configure um novo alerta de estoque.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="alert_type" className="text-right">Tipo</Label>
                    <Select
                      value={alertForm.alert_type}
                      onValueChange={(value) => setAlertForm({...alertForm, alert_type: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Tipo de alerta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                        <SelectItem value="expiring">Produto Vencendo</SelectItem>
                        <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="threshold_value" className="text-right">Limite</Label>
                    <Input
                      id="threshold_value"
                      type="number"
                      value={alertForm.threshold_value}
                      onChange={(e) => setAlertForm({...alertForm, threshold_value: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="message" className="text-right">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={alertForm.message}
                      onChange={(e) => setAlertForm({...alertForm, message: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createAlert}>Criar Alerta</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {stockAlerts.map((alert) => (
              <Card key={alert.id} className={alert.is_active ? 'border-red-200' : 'border-gray-200'}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`w-5 h-5 ${alert.is_active ? 'text-red-500' : 'text-gray-400'}`} />
                    <CardTitle className="text-base">{alert.alert_type}</CardTitle>
                    {alert.is_active && <Badge variant="destructive">Ativo</Badge>}
                  </div>
                  {alert.is_active && (
                    <Button
                      onClick={() => resolveAlert(alert.id)}
                      size="sm"
                      variant="outline"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Resolver
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>Criado em: {new Date(alert.created_at).toLocaleString()}</span>
                    {alert.resolved_at && (
                      <span>Resolvido em: {new Date(alert.resolved_at).toLocaleString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab de Transferências */}
        <TabsContent value="transfers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Transferências de Estoque</h2>
            <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Transferência
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Transferência</DialogTitle>
                  <DialogDescription>
                    Transfira produtos entre departamentos.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="from_department" className="text-right">De</Label>
                    <Select
                      value={transferForm.from_department}
                      onValueChange={(value) => setTransferForm({...transferForm, from_department: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Departamento origem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmacia">Farmácia</SelectItem>
                        <SelectItem value="enfermagem">Enfermagem</SelectItem>
                        <SelectItem value="cirurgia">Cirurgia</SelectItem>
                        <SelectItem value="laboratorio">Laboratório</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="to_department" className="text-right">Para</Label>
                    <Select
                      value={transferForm.to_department}
                      onValueChange={(value) => setTransferForm({...transferForm, to_department: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Departamento destino" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmacia">Farmácia</SelectItem>
                        <SelectItem value="enfermagem">Enfermagem</SelectItem>
                        <SelectItem value="cirurgia">Cirurgia</SelectItem>
                        <SelectItem value="laboratorio">Laboratório</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={transferForm.quantity}
                      onChange={(e) => setTransferForm({...transferForm, quantity: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">Motivo</Label>
                    <Textarea
                      id="reason"
                      value={transferForm.reason}
                      onChange={(e) => setTransferForm({...transferForm, reason: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createTransfer}>Criar Transferência</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>De</TableHead>
                    <TableHead>Para</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{transfer.from_department}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <ArrowRight className="w-4 h-4 mx-2" />
                          {transfer.to_department}
                        </div>
                      </TableCell>
                      <TableCell>{transfer.product_name}</TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                      <TableCell>{new Date(transfer.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {transfer.status === 'pending' && (
                          <Button
                            onClick={() => approveTransfer(transfer.id)}
                            size="sm"
                            variant="outline"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Ajustes */}
        <TabsContent value="adjustments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ajustes de Estoque</h2>
            <Dialog open={showAdjustmentModal} onOpenChange={setShowAdjustmentModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Ajuste
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Ajuste</DialogTitle>
                  <DialogDescription>
                    Ajuste manualmente o estoque de um produto.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="adjustment_type" className="text-right">Tipo</Label>
                    <Select
                      value={adjustmentForm.adjustment_type}
                      onValueChange={(value) => setAdjustmentForm({...adjustmentForm, adjustment_type: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Tipo de ajuste" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="increase">Aumentar</SelectItem>
                        <SelectItem value="decrease">Diminuir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={adjustmentForm.quantity}
                      onChange={(e) => setAdjustmentForm({...adjustmentForm, quantity: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">Motivo</Label>
                    <Textarea
                      id="reason"
                      value={adjustmentForm.reason}
                      onChange={(e) => setAdjustmentForm({...adjustmentForm, reason: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createAdjustment}>Criar Ajuste</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Criado por</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell>{adjustment.product_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {adjustment.adjustment_type === 'increase' ? (
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          )}
                          {adjustment.adjustment_type === 'increase' ? 'Aumento' : 'Diminuição'}
                        </div>
                      </TableCell>
                      <TableCell>{adjustment.quantity}</TableCell>
                      <TableCell>{adjustment.reason}</TableCell>
                      <TableCell>{adjustment.created_by}</TableCell>
                      <TableCell>{new Date(adjustment.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Departamentos */}
        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Níveis por Departamento</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Configurar Níveis
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departmentLevels.map((level) => (
              <Card key={level.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{level.department}</CardTitle>
                  <CardDescription>{level.product_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Estoque Atual:</span>
                      <span className="font-medium">{level.current_stock}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Mínimo:</span>
                      <span className="font-medium">{level.minimum_level}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Máximo:</span>
                      <span className="font-medium">{level.maximum_level}</span>
                    </div>
                    <Progress 
                      value={(level.current_stock / level.maximum_level) * 100} 
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockManagement;