'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Calculator,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Bed,
  Calendar
} from 'lucide-react';
import { useDailyRates } from '@/hooks/useDailyRates';
import DailyRateCalculator from '@/components/beds/DailyRateCalculator';

interface DailyRateForm {
  name: string;
  description: string;
  payment_type: 'Particular' | 'Convênio' | 'SUS';
  bed_type: 'Padrão' | 'UTI' | 'Semi-UTI' | 'Isolamento';
  base_rate: number;
  tiers: {
    min_days: number;
    max_days: number | null;
    rate: number;
    discount_percentage: number;
  }[];
}

const initialForm: DailyRateForm = {
  name: '',
  description: '',
  payment_type: 'Particular',
  bed_type: 'Padrão',
  base_rate: 0,
  tiers: [
    { min_days: 1, max_days: 7, rate: 0, discount_percentage: 0 },
    { min_days: 8, max_days: 30, rate: 0, discount_percentage: 5 },
    { min_days: 31, max_days: null, rate: 0, discount_percentage: 10 }
  ]
};

export default function DailyRatesConfigPage() {
  const { dailyRates, createDailyRate, updateDailyRate, deleteDailyRate } = useDailyRates();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DailyRateForm>(initialForm);
  const [activeTab, setActiveTab] = useState('configurations');

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateDailyRate(editingId, form);
      } else {
        await createDailyRate(form);
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(initialForm);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const handleEdit = (config: any) => {
    setForm({
      name: config.name,
      description: config.description,
      payment_type: config.payment_type,
      bed_type: config.bed_type,
      base_rate: config.base_rate,
      tiers: config.tiers || []
    });
    setEditingId(config.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta configuração?')) {
      await deleteDailyRate(id);
    }
  };

  const addTier = () => {
    const lastTier = form.tiers[form.tiers.length - 1];
    const newMinDays = lastTier ? (lastTier.max_days || 0) + 1 : 1;
    
    setForm({
      ...form,
      tiers: [
        ...form.tiers,
        {
          min_days: newMinDays,
          max_days: null,
          rate: form.base_rate,
          discount_percentage: 0
        }
      ]
    });
  };

  const removeTier = (index: number) => {
    setForm({
      ...form,
      tiers: form.tiers.filter((_, i) => i !== index)
    });
  };

  const updateTier = (index: number, field: string, value: any) => {
    const newTiers = [...form.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setForm({ ...form, tiers: newTiers });
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'Particular': return 'bg-green-100 text-green-800';
      case 'Convênio': return 'bg-blue-100 text-blue-800';
      case 'SUS': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBedTypeColor = (type: string) => {
    switch (type) {
      case 'UTI': return 'bg-red-100 text-red-800';
      case 'Semi-UTI': return 'bg-yellow-100 text-yellow-800';
      case 'Isolamento': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            Configuração de Diárias Variáveis
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure preços por tipo de leito, faixas de dias e descontos progressivos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(initialForm); setEditingId(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Configuração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar' : 'Nova'} Configuração de Diária
              </DialogTitle>
              <DialogDescription>
                Configure os preços e faixas de desconto para diferentes tipos de leito e pagamento
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Configuração</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: UTI Particular"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descrição da configuração"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Pagamento</Label>
                  <Select value={form.payment_type} onValueChange={(value: any) => setForm({ ...form, payment_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Particular">Particular</SelectItem>
                      <SelectItem value="Convênio">Convênio</SelectItem>
                      <SelectItem value="SUS">SUS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Leito</Label>
                  <Select value={form.bed_type} onValueChange={(value: any) => setForm({ ...form, bed_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Padrão">Padrão</SelectItem>
                      <SelectItem value="UTI">UTI</SelectItem>
                      <SelectItem value="Semi-UTI">Semi-UTI</SelectItem>
                      <SelectItem value="Isolamento">Isolamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_rate">Valor Base (R$)</Label>
                  <Input
                    id="base_rate"
                    type="number"
                    step="0.01"
                    value={form.base_rate}
                    onChange={(e) => setForm({ ...form, base_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Faixas de Preço */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Faixas de Preço</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTier}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Faixa
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {form.tiers.map((tier, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                          <Label>Dias Mínimos</Label>
                          <Input
                            type="number"
                            value={tier.min_days}
                            onChange={(e) => updateTier(index, 'min_days', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Dias Máximos</Label>
                          <Input
                            type="number"
                            value={tier.max_days || ''}
                            onChange={(e) => updateTier(index, 'max_days', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Ilimitado"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={tier.rate}
                            onChange={(e) => updateTier(index, 'rate', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Desconto (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={tier.discount_percentage}
                            onChange={(e) => updateTier(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTier(index)}
                          disabled={form.tiers.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
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
                {editingId ? 'Atualizar' : 'Criar'} Configuração
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configurations">Configurações</TabsTrigger>
          <TabsTrigger value="calculator">Simulador</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configurations" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Configurações</p>
                    <p className="text-2xl font-bold">{dailyRates.length}</p>
                  </div>
                  <Calculator className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipos de Leito</p>
                    <p className="text-2xl font-bold">{new Set(dailyRates.map(r => r.bed_type)).size}</p>
                  </div>
                  <Bed className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipos de Pagamento</p>
                    <p className="text-2xl font-bold">{new Set(dailyRates.map(r => r.payment_type)).size}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Faixas Configuradas</p>
                    <p className="text-2xl font-bold">{dailyRates.reduce((acc, r) => acc + (r.tiers?.length || 0), 0)}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configurations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Ativas</CardTitle>
              <CardDescription>
                Gerencie todas as configurações de diárias do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo Pagamento</TableHead>
                    <TableHead>Tipo Leito</TableHead>
                    <TableHead>Valor Base</TableHead>
                    <TableHead>Faixas</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyRates.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{config.name}</p>
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentTypeColor(config.payment_type)}>
                          {config.payment_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getBedTypeColor(config.bed_type)}>
                          {config.bed_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">R$ {config.base_rate.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{config.tiers?.length || 0} faixas</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(config)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(config.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {dailyRates.length === 0 && (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma configuração encontrada</p>
                  <p className="text-sm text-muted-foreground">Clique em "Nova Configuração" para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Diárias</CardTitle>
              <CardDescription>
                Teste as configurações e veja como os preços são calculados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DailyRateCalculator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}