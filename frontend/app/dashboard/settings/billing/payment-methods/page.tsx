'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Banknote,
  Smartphone,
  Building2,
  CheckCircle,
  XCircle,
  DollarSign,
  Percent,
  Clock,
  AlertCircle
} from 'lucide-react';

interface PaymentMethod {
  id?: string;
  name: string;
  description: string;
  method_type: 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'cash' | 'check' | 'insurance';
  is_active: boolean;
  is_default: boolean;
  processing_fee: number;
  processing_days: number;
  min_amount?: number;
  max_amount?: number;
  requires_approval: boolean;
  auto_reconciliation: boolean;
  provider?: string;
  configuration: {
    api_key?: string;
    merchant_id?: string;
    webhook_url?: string;
    [key: string]: any;
  };
}

const initialMethod: PaymentMethod = {
  name: '',
  description: '',
  method_type: 'credit_card',
  is_active: true,
  is_default: false,
  processing_fee: 0,
  processing_days: 0,
  requires_approval: false,
  auto_reconciliation: false,
  configuration: {}
};

// Mock data para demonstração
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    name: 'Cartão de Crédito',
    description: 'Pagamentos via cartão de crédito Visa/Mastercard',
    method_type: 'credit_card',
    is_active: true,
    is_default: true,
    processing_fee: 3.5,
    processing_days: 30,
    min_amount: 10,
    max_amount: 50000,
    requires_approval: false,
    auto_reconciliation: true,
    provider: 'Stripe',
    configuration: {
      api_key: 'sk_test_***',
      merchant_id: 'acct_***'
    }
  },
  {
    id: '2',
    name: 'PIX',
    description: 'Pagamento instantâneo via PIX',
    method_type: 'pix',
    is_active: true,
    is_default: false,
    processing_fee: 0.5,
    processing_days: 0,
    min_amount: 1,
    max_amount: 100000,
    requires_approval: false,
    auto_reconciliation: true,
    provider: 'Banco Central',
    configuration: {
      pix_key: 'hospital@dataclinica.com.br'
    }
  },
  {
    id: '3',
    name: 'Dinheiro',
    description: 'Pagamento em espécie no balcão',
    method_type: 'cash',
    is_active: true,
    is_default: false,
    processing_fee: 0,
    processing_days: 0,
    requires_approval: true,
    auto_reconciliation: false,
    configuration: {}
  },
  {
    id: '4',
    name: 'Convênio Médico',
    description: 'Pagamento via convênio/plano de saúde',
    method_type: 'insurance',
    is_active: true,
    is_default: false,
    processing_fee: 0,
    processing_days: 45,
    requires_approval: true,
    auto_reconciliation: false,
    configuration: {
      requires_authorization: true,
      authorization_timeout: 72
    }
  }
];

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PaymentMethod>(initialMethod);
  const [activeTab, setActiveTab] = useState('methods');

  const handleSubmit = async () => {
    try {
      if (editingId) {
        setPaymentMethods(methods => methods.map(m => m.id === editingId ? { ...form, id: editingId } : m));
      } else {
        const newMethod = { ...form, id: Date.now().toString() };
        setPaymentMethods(methods => [...methods, newMethod]);
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(initialMethod);
    } catch (error) {
      console.error('Erro ao salvar método de pagamento:', error);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setForm(method);
    setEditingId(method.id!);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este método de pagamento?')) {
      setPaymentMethods(methods => methods.filter(m => m.id !== id));
    }
  };

  const toggleMethodStatus = (id: string) => {
    setPaymentMethods(methods => methods.map(m => 
      m.id === id ? { ...m, is_active: !m.is_active } : m
    ));
  };

  const setAsDefault = (id: string) => {
    setPaymentMethods(methods => methods.map(m => ({
      ...m,
      is_default: m.id === id
    })));
  };

  const getMethodTypeLabel = (type: string) => {
    const labels = {
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'pix': 'PIX',
      'bank_transfer': 'Transferência Bancária',
      'cash': 'Dinheiro',
      'check': 'Cheque',
      'insurance': 'Convênio'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getMethodTypeIcon = (type: string) => {
    const icons = {
      'credit_card': CreditCard,
      'debit_card': CreditCard,
      'pix': Smartphone,
      'bank_transfer': Building2,
      'cash': Banknote,
      'check': Banknote,
      'insurance': Building2
    };
    const Icon = icons[type as keyof typeof icons] || CreditCard;
    return <Icon className="h-4 w-4" />;
  };

  const getMethodTypeColor = (type: string) => {
    const colors = {
      'credit_card': 'bg-blue-100 text-blue-800',
      'debit_card': 'bg-green-100 text-green-800',
      'pix': 'bg-purple-100 text-purple-800',
      'bank_transfer': 'bg-orange-100 text-orange-800',
      'cash': 'bg-gray-100 text-gray-800',
      'check': 'bg-yellow-100 text-yellow-800',
      'insurance': 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const activeMethods = paymentMethods.filter(m => m.is_active);
  const inactiveMethods = paymentMethods.filter(m => !m.is_active);
  const defaultMethod = paymentMethods.find(m => m.is_default);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            Métodos de Pagamento
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure e gerencie os métodos de pagamento aceitos pelo sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(initialMethod); setEditingId(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Método
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar' : 'Novo'} Método de Pagamento
              </DialogTitle>
              <DialogDescription>
                Configure um novo método de pagamento para o sistema
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Método</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex: Cartão de Crédito"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Método</Label>
                    <Select value={form.method_type} onValueChange={(value: any) => setForm({ ...form, method_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                        <SelectItem value="insurance">Convênio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descreva este método de pagamento"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="provider">Provedor/Gateway</Label>
                  <Input
                    id="provider"
                    value={form.provider || ''}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                    placeholder="Ex: Stripe, PagSeguro, Mercado Pago"
                  />
                </div>
              </div>

              {/* Configurações Financeiras */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Configurações Financeiras</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="processing_fee">Taxa de Processamento (%)</Label>
                    <Input
                      id="processing_fee"
                      type="number"
                      step="0.01"
                      value={form.processing_fee}
                      onChange={(e) => setForm({ ...form, processing_fee: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="processing_days">Dias para Compensação</Label>
                    <Input
                      id="processing_days"
                      type="number"
                      value={form.processing_days}
                      onChange={(e) => setForm({ ...form, processing_days: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_amount">Valor Mínimo (R$)</Label>
                    <Input
                      id="min_amount"
                      type="number"
                      step="0.01"
                      value={form.min_amount || ''}
                      onChange={(e) => setForm({ ...form, min_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Sem limite"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_amount">Valor Máximo (R$)</Label>
                    <Input
                      id="max_amount"
                      type="number"
                      step="0.01"
                      value={form.max_amount || ''}
                      onChange={(e) => setForm({ ...form, max_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Sem limite"
                    />
                  </div>
                </div>
              </div>

              {/* Configurações de Comportamento */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Configurações de Comportamento</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Método Ativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_default"
                      checked={form.is_default}
                      onCheckedChange={(checked) => setForm({ ...form, is_default: checked })}
                    />
                    <Label htmlFor="is_default">Método Padrão</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requires_approval"
                      checked={form.requires_approval}
                      onCheckedChange={(checked) => setForm({ ...form, requires_approval: checked })}
                    />
                    <Label htmlFor="requires_approval">Requer Aprovação</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_reconciliation"
                      checked={form.auto_reconciliation}
                      onCheckedChange={(checked) => setForm({ ...form, auto_reconciliation: checked })}
                    />
                    <Label htmlFor="auto_reconciliation">Conciliação Automática</Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Atualizar' : 'Criar'} Método
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Métodos</p>
                <p className="text-2xl font-bold">{paymentMethods.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Métodos Ativos</p>
                <p className="text-2xl font-bold">{activeMethods.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Método Padrão</p>
                <p className="text-lg font-bold">{defaultMethod?.name || 'Nenhum'}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Média</p>
                <p className="text-2xl font-bold">
                  {activeMethods.length > 0 
                    ? (activeMethods.reduce((acc, m) => acc + m.processing_fee, 0) / activeMethods.length).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
              <Percent className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos Configurados</CardTitle>
          <CardDescription>
            Gerencie todos os métodos de pagamento do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Método</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead>Compensação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getMethodTypeIcon(method.method_type)}
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {method.name}
                          {method.is_default && (
                            <Badge variant="outline" className="text-xs">
                              Padrão
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                        {method.provider && (
                          <p className="text-xs text-muted-foreground">via {method.provider}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getMethodTypeColor(method.method_type)}>
                      {getMethodTypeLabel(method.method_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {method.processing_fee}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {method.processing_days} dias
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={method.is_active}
                        onCheckedChange={() => toggleMethodStatus(method.id!)}
                        size="sm"
                      />
                      <div className="flex flex-col gap-1">
                        <Badge variant={method.is_active ? 'default' : 'secondary'}>
                          {method.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {method.requires_approval && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Aprovação
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAsDefault(method.id!)}
                        >
                          Definir Padrão
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(method)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(method.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {paymentMethods.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum método encontrado</p>
              <p className="text-sm text-muted-foreground">Clique em "Novo Método" para começar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}