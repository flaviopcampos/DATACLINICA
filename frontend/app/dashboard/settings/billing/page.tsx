'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  Calculator,
  Receipt,
  CreditCard,
  TrendingUp,
  Settings,
  ChevronRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

interface BillingSettingsItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  status: 'active' | 'inactive' | 'warning';
  badge?: string;
}

const billingSettings: BillingSettingsItem[] = [
  {
    id: 'daily-rates',
    title: 'Diárias Variáveis',
    description: 'Configure preços por tipo de leito, faixas de dias e descontos progressivos',
    icon: Calculator,
    href: '/dashboard/settings/billing/daily-rates',
    status: 'active',
    badge: '4 configurações'
  },
  {
    id: 'billing-policies',
    title: 'Políticas de Cobrança',
    description: 'Defina regras de faturamento, descontos e políticas de cancelamento',
    icon: Receipt,
    href: '/dashboard/settings/billing/policies',
    status: 'active'
  },
  {
    id: 'payment-methods',
    title: 'Métodos de Pagamento',
    description: 'Configure formas de pagamento aceitas e integrações financeiras',
    icon: CreditCard,
    href: '/dashboard/settings/billing/payment-methods',
    status: 'active',
    badge: '3 métodos'
  },
  {
    id: 'pricing-tiers',
    title: 'Níveis de Preço',
    description: 'Gerencie diferentes níveis de preço para convênios e particulares',
    icon: TrendingUp,
    href: '/dashboard/settings/billing/pricing-tiers',
    status: 'active'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'inactive':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'inactive':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
};

export default function BillingSettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            Configurações de Faturamento
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie preços, diárias e políticas de cobrança do sistema
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Configurações Ativas</p>
                <p className="text-2xl font-bold text-green-600">7</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipos de Diária</p>
                <p className="text-2xl font-bold text-blue-600">4</p>
              </div>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Métodos Pagamento</p>
                <p className="text-2xl font-bold text-purple-600">3</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                <p className="text-sm font-bold text-gray-900">Hoje, 14:30</p>
              </div>
              <Settings className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {billingSettings.map((setting) => {
          const Icon = setting.icon;
          return (
            <Card key={setting.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{setting.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {setting.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(setting.status)}`}>
                    {getStatusIcon(setting.status)}
                    <span className="capitalize">{setting.status === 'active' ? 'Ativo' : setting.status}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  {setting.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {setting.badge}
                    </Badge>
                  )}
                </div>
                
                <Separator className="my-3" />
                
                <Link href={setting.href}>
                  <Button variant="outline" className="w-full">
                    Configurar {setting.title}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às configurações mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/settings/billing/daily-rates">
              <Button variant="outline" className="w-full justify-start">
                <Calculator className="h-4 w-4 mr-2" />
                Configurar Diárias
              </Button>
            </Link>
            
            <Link href="/dashboard/billing">
              <Button variant="outline" className="w-full justify-start">
                <Receipt className="h-4 w-4 mr-2" />
                Ver Faturamento
              </Button>
            </Link>
            
            <Link href="/dashboard/settings/billing/policies">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Políticas de Cobrança
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}