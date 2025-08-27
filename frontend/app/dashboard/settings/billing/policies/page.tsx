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
  Receipt,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  FileText,
  Settings
} from 'lucide-react';

interface BillingPolicy {
  id?: string;
  name: string;
  description: string;
  policy_type: 'late_payment' | 'early_payment' | 'cancellation' | 'refund' | 'discount';
  is_active: boolean;
  conditions: {
    days_threshold?: number;
    percentage?: number;
    fixed_amount?: number;
    applies_to?: string[];
  };
  actions: {
    charge_fee?: boolean;
    apply_discount?: boolean;
    send_notification?: boolean;
    block_services?: boolean;
  };
}

const initialPolicy: BillingPolicy = {
  name: '',
  description: '',
  policy_type: 'late_payment',
  is_active: true,
  conditions: {
    days_threshold: 0,
    percentage: 0,
    fixed_amount: 0,
    applies_to: []
  },
  actions: {
    charge_fee: false,
    apply_discount: false,
    send_notification: true,
    block_services: false
  }
};

// Mock data para demonstração
const mockPolicies: BillingPolicy[] = [
  {
    id: '1',
    name: 'Multa por Atraso',
    description: 'Cobrança de multa após 30 dias de atraso no pagamento',
    policy_type: 'late_payment',
    is_active: true,
    conditions: {
      days_threshold: 30,
      percentage: 2,
      applies_to: ['Particular', 'Convênio']
    },
    actions: {
      charge_fee: true,
      send_notification: true,
      block_services: false
    }
  },
  {
    id: '2',
    name: 'Desconto Pagamento Antecipado',
    description: 'Desconto para pagamentos realizados com antecedência',
    policy_type: 'early_payment',
    is_active: true,
    conditions: {
      days_threshold: 10,
      percentage: 5,
      applies_to: ['Particular']
    },
    actions: {
      apply_discount: true,
      send_notification: true
    }
  },
  {
    id: '3',
    name: 'Taxa de Cancelamento',
    description: 'Taxa cobrada em caso de cancelamento de internação',
    policy_type: 'cancellation',
    is_active: true,
    conditions: {
      days_threshold: 24,
      fixed_amount: 150,
      applies_to: ['Particular', 'Convênio']
    },
    actions: {
      charge_fee: true,
      send_notification: true
    }
  }
];

export default function BillingPoliciesPage() {
  const [policies, setPolicies] = useState<BillingPolicy[]>(mockPolicies);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BillingPolicy>(initialPolicy);
  const [activeTab, setActiveTab] = useState('policies');

  const handleSubmit = async () => {
    try {
      if (editingId) {
        setPolicies(policies.map(p => p.id === editingId ? { ...form, id: editingId } : p));
      } else {
        const newPolicy = { ...form, id: Date.now().toString() };
        setPolicies([...policies, newPolicy]);
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(initialPolicy);
    } catch (error) {
      console.error('Erro ao salvar política:', error);
    }
  };

  const handleEdit = (policy: BillingPolicy) => {
    setForm(policy);
    setEditingId(policy.id!);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta política?')) {
      setPolicies(policies.filter(p => p.id !== id));
    }
  };

  const togglePolicyStatus = (id: string) => {
    setPolicies(policies.map(p => 
      p.id === id ? { ...p, is_active: !p.is_active } : p
    ));
  };

  const getPolicyTypeLabel = (type: string) => {
    const labels = {
      'late_payment': 'Pagamento em Atraso',
      'early_payment': 'Pagamento Antecipado',
      'cancellation': 'Cancelamento',
      'refund': 'Reembolso',
      'discount': 'Desconto'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPolicyTypeColor = (type: string) => {
    const colors = {
      'late_payment': 'bg-red-100 text-red-800',
      'early_payment': 'bg-green-100 text-green-800',
      'cancellation': 'bg-orange-100 text-orange-800',
      'refund': 'bg-blue-100 text-blue-800',
      'discount': 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const activePolicies = policies.filter(p => p.is_active);
  const inactivePolicies = policies.filter(p => !p.is_active);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Receipt className="h-8 w-8 text-primary" />
            Políticas de Cobrança
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure regras automáticas para cobrança, descontos e penalidades
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(initialPolicy); setEditingId(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Política
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar' : 'Nova'} Política de Cobrança
              </DialogTitle>
              <DialogDescription>
                Configure regras automáticas para diferentes cenários de cobrança
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Política</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex: Multa por Atraso"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Política</Label>
                    <Select value={form.policy_type} onValueChange={(value: any) => setForm({ ...form, policy_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="late_payment">Pagamento em Atraso</SelectItem>
                        <SelectItem value="early_payment">Pagamento Antecipado</SelectItem>
                        <SelectItem value="cancellation">Cancelamento</SelectItem>
                        <SelectItem value="refund">Reembolso</SelectItem>
                        <SelectItem value="discount">Desconto</SelectItem>
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
                    placeholder="Descreva quando e como esta política será aplicada"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Política Ativa</Label>
                </div>
              </div>

              {/* Condições */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Condições</Label>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="days_threshold">Prazo (dias)</Label>
                    <Input
                      id="days_threshold"
                      type="number"
                      value={form.conditions.days_threshold || ''}
                      onChange={(e) => setForm({
                        ...form,
                        conditions: {
                          ...form.conditions,
                          days_threshold: parseInt(e.target.value) || 0
                        }
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Percentual (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      step="0.1"
                      value={form.conditions.percentage || ''}
                      onChange={(e) => setForm({
                        ...form,
                        conditions: {
                          ...form.conditions,
                          percentage: parseFloat(e.target.value) || 0
                        }
                      })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fixed_amount">Valor Fixo (R$)</Label>
                    <Input
                      id="fixed_amount"
                      type="number"
                      step="0.01"
                      value={form.conditions.fixed_amount || ''}
                      onChange={(e) => setForm({
                        ...form,
                        conditions: {
                          ...form.conditions,
                          fixed_amount: parseFloat(e.target.value) || 0
                        }
                      })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Ações Automáticas</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="charge_fee"
                      checked={form.actions.charge_fee || false}
                      onCheckedChange={(checked) => setForm({
                        ...form,
                        actions: { ...form.actions, charge_fee: checked }
                      })}
                    />
                    <Label htmlFor="charge_fee">Cobrar Taxa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="apply_discount"
                      checked={form.actions.apply_discount || false}
                      onCheckedChange={(checked) => setForm({
                        ...form,
                        actions: { ...form.actions, apply_discount: checked }
                      })}
                    />
                    <Label htmlFor="apply_discount">Aplicar Desconto</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="send_notification"
                      checked={form.actions.send_notification || false}
                      onCheckedChange={(checked) => setForm({
                        ...form,
                        actions: { ...form.actions, send_notification: checked }
                      })}
                    />
                    <Label htmlFor="send_notification">Enviar Notificação</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="block_services"
                      checked={form.actions.block_services || false}
                      onCheckedChange={(checked) => setForm({
                        ...form,
                        actions: { ...form.actions, block_services: checked }
                      })}
                    />
                    <Label htmlFor="block_services">Bloquear Serviços</Label>
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
                {editingId ? 'Atualizar' : 'Criar'} Política
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
                <p className="text-sm font-medium text-muted-foreground">Total Políticas</p>
                <p className="text-2xl font-bold">{policies.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Políticas Ativas</p>
                <p className="text-2xl font-bold">{activePolicies.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Políticas Inativas</p>
                <p className="text-2xl font-bold">{inactivePolicies.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipos Configurados</p>
                <p className="text-2xl font-bold">{new Set(policies.map(p => p.policy_type)).size}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Políticas Configuradas</CardTitle>
          <CardDescription>
            Gerencie todas as políticas de cobrança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Condições</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{policy.name}</p>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPolicyTypeColor(policy.policy_type)}>
                      {getPolicyTypeLabel(policy.policy_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {policy.conditions.days_threshold && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {policy.conditions.days_threshold} dias
                        </div>
                      )}
                      {policy.conditions.percentage && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {policy.conditions.percentage}%
                        </div>
                      )}
                      {policy.conditions.fixed_amount && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          R$ {policy.conditions.fixed_amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={policy.is_active}
                        onCheckedChange={() => togglePolicyStatus(policy.id!)}
                        size="sm"
                      />
                      <Badge variant={policy.is_active ? 'default' : 'secondary'}>
                        {policy.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(policy)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(policy.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {policies.length === 0 && (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma política encontrada</p>
              <p className="text-sm text-muted-foreground">Clique em "Nova Política" para começar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}