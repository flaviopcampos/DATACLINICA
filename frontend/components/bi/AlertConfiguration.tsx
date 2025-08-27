'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  AlertTriangle,
  Settings,
  Bell,
  Target,
  Clock,
  Mail,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  AlertRule, 
  AlertSeverity, 
  AlertType, 
  AlertCondition,
  AlertAction,
  CreateAlertRuleRequest,
  UpdateAlertRuleRequest
} from '@/types/bi/alerts';
import { useAlerts } from '@/hooks/bi/useAlerts';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AlertConfigurationProps {
  className?: string;
}

const severityOptions = [
  { value: 'low', label: 'Baixa', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Crítica', color: 'bg-red-100 text-red-800' }
];

const typeOptions = [
  { value: 'bed_occupancy', label: 'Ocupação de Leitos' },
  { value: 'billing_overdue', label: 'Faturamento em Atraso' },
  { value: 'appointment_cancelled', label: 'Agendamentos Cancelados' },
  { value: 'patient_inactive', label: 'Pacientes Inativos' },
  { value: 'revenue_drop', label: 'Queda de Receita' },
  { value: 'system_performance', label: 'Performance do Sistema' },
  { value: 'custom', label: 'Personalizado' }
];

const operatorOptions = [
  { value: 'greater_than', label: 'Maior que (>)' },
  { value: 'less_than', label: 'Menor que (<)' },
  { value: 'equal', label: 'Igual a (=)' },
  { value: 'greater_equal', label: 'Maior ou igual (>=)' },
  { value: 'less_equal', label: 'Menor ou igual (<=)' },
  { value: 'not_equal', label: 'Diferente de (!=)' }
];

const actionTypeOptions = [
  { value: 'notification', label: 'Notificação', icon: Bell },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: Smartphone }
];

function RuleForm({ 
  rule, 
  onSave, 
  onCancel 
}: {
  rule?: AlertRule;
  onSave: (data: CreateAlertRuleRequest | UpdateAlertRuleRequest) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    type: rule?.type || 'custom' as AlertType,
    severity: rule?.severity || 'medium' as AlertSeverity,
    isActive: rule?.isActive ?? true,
    conditions: rule?.conditions || [{
      metric: '',
      operator: 'greater_than' as const,
      value: 0,
      timeWindow: 300
    }] as AlertCondition[],
    actions: rule?.actions || [{
      type: 'notification' as const,
      config: {}
    }] as AlertAction[]
  });

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, {
        metric: '',
        operator: 'greater_than' as const,
        value: 0,
        timeWindow: 300
      }]
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const updateCondition = (index: number, field: keyof AlertCondition, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, {
        type: 'notification' as const,
        config: {}
      }]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index: number, field: keyof AlertAction, value: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome da Regra</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Ocupação crítica de leitos"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as AlertType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva quando este alerta deve ser disparado..."
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="severity">Severidade</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as AlertSeverity }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={option.color}>
                        {option.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Regra ativa</Label>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Condições */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Condições
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addCondition}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Condição
          </Button>
        </div>
        
        {formData.conditions.map((condition, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Métrica</Label>
                <Input
                  value={condition.metric}
                  onChange={(e) => updateCondition(index, 'metric', e.target.value)}
                  placeholder="Ex: bed_occupancy_rate"
                />
              </div>
              
              <div>
                <Label>Operador</Label>
                <Select
                  value={condition.operator}
                  onValueChange={(value) => updateCondition(index, 'operator', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, 'value', parseFloat(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Janela (seg)</Label>
                  <Input
                    type="number"
                    value={condition.timeWindow}
                    onChange={(e) => updateCondition(index, 'timeWindow', parseInt(e.target.value))}
                    placeholder="300"
                  />
                </div>
                
                {formData.conditions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCondition(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <Separator />
      
      {/* Ações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Ações
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addAction}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Ação
          </Button>
        </div>
        
        {formData.actions.map((action, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Tipo de Ação</Label>
                <Select
                  value={action.type}
                  onValueChange={(value) => updateAction(index, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypeOptions.map(option => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.actions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAction(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {/* Botões */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {rule ? 'Atualizar' : 'Criar'} Regra
        </Button>
      </div>
    </form>
  );
}

function RuleCard({ 
  rule, 
  onEdit, 
  onDelete, 
  onToggle 
}: {
  rule: AlertRule;
  onEdit: (rule: AlertRule) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}) {
  const severityConfig = severityOptions.find(s => s.value === rule.severity);
  const typeConfig = typeOptions.find(t => t.value === rule.type);
  
  return (
    <Card className={`transition-all ${rule.isActive ? '' : 'opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{rule.name}</h3>
              <Badge className={severityConfig?.color}>
                {severityConfig?.label}
              </Badge>
              {!rule.isActive && (
                <Badge variant="secondary">Inativa</Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Tipo: {typeConfig?.label}</span>
              <span>Condições: {rule.conditions.length}</span>
              <span>Ações: {rule.actions.length}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={rule.isActive}
              onCheckedChange={(checked) => onToggle(rule.id, checked)}
            />
            
            <Button variant="ghost" size="sm" onClick={() => onEdit(rule)}>
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(rule.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Resumo das condições */}
        <div className="space-y-1">
          {rule.conditions.slice(0, 2).map((condition, index) => (
            <div key={index} className="text-xs bg-gray-50 p-2 rounded">
              <code>
                {condition.metric} {operatorOptions.find(o => o.value === condition.operator)?.label.split(' ')[0]} {condition.value}
              </code>
            </div>
          ))}
          {rule.conditions.length > 2 && (
            <div className="text-xs text-gray-500">
              +{rule.conditions.length - 2} condições adicionais
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AlertConfiguration({ className = '' }: AlertConfigurationProps) {
  const {
    rules,
    isLoading,
    error,
    createRule,
    updateRule,
    deleteRule,
    toggleRule
  } = useAlerts();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  
  const handleCreateRule = async (data: CreateAlertRuleRequest) => {
    try {
      await createRule(data);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Erro ao criar regra:', error);
    }
  };
  
  const handleUpdateRule = async (data: UpdateAlertRuleRequest) => {
    if (!editingRule) return;
    
    try {
      await updateRule(editingRule.id, data);
      setEditingRule(null);
    } catch (error) {
      console.error('Erro ao atualizar regra:', error);
    }
  };
  
  const handleDeleteRule = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta regra?')) {
      try {
        await deleteRule(id);
      } catch (error) {
        console.error('Erro ao excluir regra:', error);
      }
    }
  };
  
  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      await toggleRule(id, isActive);
    } catch (error) {
      console.error('Erro ao alternar regra:', error);
    }
  };
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Configuração de Alertas</CardTitle>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Criar Nova Regra de Alerta</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <RuleForm
                  onSave={handleCreateRule}
                  onCancel={() => setShowCreateDialog(false)}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 mb-4">Nenhuma regra de alerta configurada</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Regra
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={setEditingRule}
                onDelete={handleDeleteRule}
                onToggle={handleToggleRule}
              />
            ))}
          </div>
        )}
        
        {/* Dialog de Edição */}
        <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Editar Regra de Alerta</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              {editingRule && (
                <RuleForm
                  rule={editingRule}
                  onSave={handleUpdateRule}
                  onCancel={() => setEditingRule(null)}
                />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default AlertConfiguration;