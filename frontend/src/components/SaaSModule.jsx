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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Users,
  Calendar,
  Database,
  Activity,
  Crown,
  CheckCircle,
  XCircle,
  TrendingUp,
  Settings,
  Shield,
  Zap,
  Star,
  ArrowUp,
  AlertTriangle,
  Info
} from 'lucide-react';

const SaaSModule = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tenantConfig, setTenantConfig] = useState(null);
  const [usage, setUsage] = useState(null);
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly');

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar configuração do tenant
      const configResponse = await fetch('/api/saas/tenant/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!configResponse.ok) {
        throw new Error('Erro ao carregar configuração do tenant');
      }

      const configData = await configResponse.json();
      setTenantConfig(configData);

      // Carregar métricas de uso
      const usageResponse = await fetch('/api/saas/tenant/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!usageResponse.ok) {
        throw new Error('Erro ao carregar métricas de uso');
      }

      const usageData = await usageResponse.json();
      setUsage(usageData);

      // Carregar planos disponíveis
      const plansResponse = await fetch('/api/saas/plans');
      if (!plansResponse.ok) {
        throw new Error('Erro ao carregar planos');
      }

      const plansData = await plansResponse.json();
      setPlans(plansData);

    } catch (err) {
      console.error('Erro ao carregar dados SaaS:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/saas/tenant/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_plan: selectedPlan,
          billing_cycle: selectedBillingCycle
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upgrade do plano');
      }

      const result = await response.json();
      alert(`Plano atualizado com sucesso! Novo valor: R$ ${result.new_price.toFixed(2)}`);
      
      // Recarregar dados
      await loadData();
      setUpgradeDialogOpen(false);

    } catch (err) {
      console.error('Erro no upgrade:', err);
      alert('Erro ao fazer upgrade do plano: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-500', text: 'Ativo', icon: CheckCircle },
      trial: { color: 'bg-blue-500', text: 'Trial', icon: Star },
      suspended: { color: 'bg-red-500', text: 'Suspenso', icon: XCircle },
      expired: { color: 'bg-gray-500', text: 'Expirado', icon: XCircle },
      cancelled: { color: 'bg-gray-500', text: 'Cancelado', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getPlanIcon = (planType) => {
    const icons = {
      free: Star,
      basic: Users,
      professional: Crown,
      enterprise: Shield
    };
    return icons[planType] || Star;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando dados SaaS...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento SaaS</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seu plano, monitore uso e configure sua assinatura
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {tenantConfig && getStatusBadge(tenantConfig.subscription_status)}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Uso</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center space-x-2">
            <Crown className="w-4 h-4" />
            <span>Planos</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Cobrança</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {tenantConfig && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
                  {React.createElement(getPlanIcon(tenantConfig.plan_type), {
                    className: "h-4 w-4 text-muted-foreground"
                  })}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {tenantConfig.plan_type}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ciclo: {tenantConfig.billing_cycle}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getStatusBadge(tenantConfig.subscription_status)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Desde {new Date(tenantConfig.subscription_start).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próximo Pagamento</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tenantConfig.next_payment 
                      ? new Date(tenantConfig.next_payment).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Método: {tenantConfig.payment_method || 'Não configurado'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trial</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tenantConfig.trial_end 
                      ? new Date(tenantConfig.trial_end).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Data de expiração
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {usage && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Uso</CardTitle>
                <CardDescription>
                  Período: {new Date(usage.period_start).toLocaleDateString('pt-BR')} - {new Date(usage.period_end).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{usage.users_count}</div>
                    <div className="text-sm text-gray-600">Usuários</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{usage.patients_count}</div>
                    <div className="text-sm text-gray-600">Pacientes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{usage.appointments_count}</div>
                    <div className="text-sm text-gray-600">Consultas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{usage.storage_used_gb.toFixed(1)} GB</div>
                    <div className="text-sm text-gray-600">Armazenamento</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{usage.api_calls_count}</div>
                    <div className="text-sm text-gray-600">API Calls</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Uso Detalhado */}
        <TabsContent value="usage" className="space-y-6">
          {usage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(usage.usage_percentage).map(([resource, percentage]) => {
                const current = usage[`${resource}_count`] || usage[`${resource.replace('_', '_used_')}`] || 0;
                const max = usage.limits[`max_${resource}`] || usage.limits[`max_${resource}_per_month`] || usage.limits[`max_${resource}_per_day`] || 0;
                
                return (
                  <Card key={resource}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{resource.replace('_', ' ')}</span>
                        <span className={`text-sm font-normal ${getUsageColor(percentage)}`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Usado: {current}</span>
                          <span>Limite: {max}</span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className="h-2"
                          style={{
                            '--progress-background': getProgressColor(percentage)
                          }}
                        />
                        {percentage >= 90 && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              Limite quase atingido! Considere fazer upgrade do plano.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Planos */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(plans).map(([planType, plan]) => {
              const Icon = getPlanIcon(planType);
              const isCurrentPlan = tenantConfig?.plan_type === planType;
              
              return (
                <Card key={planType} className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
                  {isCurrentPlan && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">
                        Plano Atual
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <CardTitle className="capitalize">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {formatCurrency(plan.price_monthly)}
                      </div>
                      <div className="text-sm text-gray-600">por mês</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Usuários:</span>
                        <span>{plan.max_users}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pacientes:</span>
                        <span>{plan.max_patients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Consultas/mês:</span>
                        <span>{plan.max_appointments_per_month}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Armazenamento:</span>
                        <span>{plan.max_storage_gb} GB</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Funcionalidades:</div>
                      <div className="text-xs space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                            <span className="capitalize">{feature.replace('_', ' ')}</span>
                          </div>
                        ))}
                        {plan.features.length > 3 && (
                          <div className="text-gray-500">+{plan.features.length - 3} mais...</div>
                        )}
                      </div>
                    </div>
                    
                    {!isCurrentPlan && (
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setSelectedPlan(planType);
                          setUpgradeDialogOpen(true);
                        }}
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Fazer Upgrade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Cobrança */}
        <TabsContent value="billing" className="space-y-6">
          {tenantConfig && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Cobrança</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Email de cobrança:</span>
                      <div>{tenantConfig.billing_email || 'Não configurado'}</div>
                    </div>
                    <div>
                      <span className="font-medium">Método de pagamento:</span>
                      <div>{tenantConfig.payment_method || 'Não configurado'}</div>
                    </div>
                    <div>
                      <span className="font-medium">Último pagamento:</span>
                      <div>
                        {tenantConfig.last_payment 
                          ? new Date(tenantConfig.last_payment).toLocaleDateString('pt-BR')
                          : 'Nenhum'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Próximo pagamento:</span>
                      <div>
                        {tenantConfig.next_payment 
                          ? new Date(tenantConfig.next_payment).toLocaleDateString('pt-BR')
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Histórico de pagamentos será implementado em breve</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Upgrade */}
      <AlertDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fazer Upgrade do Plano</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a fazer upgrade para o plano {selectedPlan}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ciclo de Cobrança:</label>
              <Select value={selectedBillingCycle} onValueChange={setSelectedBillingCycle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral (10% desconto)</SelectItem>
                  <SelectItem value="yearly">Anual (20% desconto)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedPlan && plans[selectedPlan] && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Plano:</span>
                    <span className="font-medium capitalize">{plans[selectedPlan].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        selectedBillingCycle === 'monthly' ? plans[selectedPlan].price_monthly :
                        selectedBillingCycle === 'quarterly' ? plans[selectedPlan].price_quarterly :
                        plans[selectedPlan].price_yearly
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ciclo:</span>
                    <span className="font-medium">
                      {selectedBillingCycle === 'monthly' ? 'Mensal' :
                       selectedBillingCycle === 'quarterly' ? 'Trimestral' : 'Anual'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpgradePlan} disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar Upgrade'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SaaSModule;