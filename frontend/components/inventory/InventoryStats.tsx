'use client';

import { Package, DollarSign, AlertTriangle, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '../../src/components/ui/progress';
import { InventoryStats as InventoryStatsType } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface InventoryStatsProps {
  stats: InventoryStatsType;
  isLoading?: boolean;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  progress?: {
    value: number;
    max: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  progress,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: 'border-gray-200',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
  };

  const iconStyles = {
    default: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>
          
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500">{trend.label}</span>
            </div>
          )}
          
          {progress && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{progress.label}</span>
                <span className="font-medium">
                  {progress.value}/{progress.max}
                </span>
              </div>
              <Progress 
                value={(progress.value / progress.max) * 100} 
                className="h-2"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function InventoryStats({ stats, isLoading = false, className }: InventoryStatsProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const lowStockPercentage = stats.total_products > 0 
    ? (stats.low_stock_products / stats.total_products) * 100 
    : 0;

  const expiringPercentage = stats.total_products > 0 
    ? (stats.expiring_products / stats.total_products) * 100 
    : 0;

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {/* Total Products */}
      <StatCard
        title="Total de Produtos"
        value={formatNumber(stats.total_products)}
        subtitle="Produtos cadastrados"
        icon={Package}
        trend={{
          value: 12,
          isPositive: true,
          label: 'vs mês anterior'
        }}
      />

      {/* Total Stock Value */}
      <StatCard
        title="Valor Total em Estoque"
        value={formatCurrency(stats.total_stock_value)}
        subtitle="Valor total do inventário"
        icon={DollarSign}
        variant="success"
        trend={{
          value: 8.5,
          isPositive: true,
          label: 'vs mês anterior'
        }}
      />

      {/* Low Stock Products */}
      <StatCard
        title="Produtos com Estoque Baixo"
        value={formatNumber(stats.low_stock_products)}
        subtitle={`${lowStockPercentage.toFixed(1)}% do total`}
        icon={AlertTriangle}
        variant={stats.low_stock_products > 0 ? 'warning' : 'default'}
        progress={{
          value: stats.low_stock_products,
          max: stats.total_products,
          label: 'Produtos afetados'
        }}
      />

      {/* Expiring Products */}
      <StatCard
        title="Produtos Vencendo"
        value={formatNumber(stats.expiring_products)}
        subtitle={`${expiringPercentage.toFixed(1)}% do total`}
        icon={Calendar}
        variant={stats.expiring_products > 0 ? 'danger' : 'default'}
        progress={{
          value: stats.expiring_products,
          max: stats.total_products,
          label: 'Produtos próximos ao vencimento'
        }}
      />

      {/* Additional Stats Row */}
      <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Active Categories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Categorias Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.active_categories)}</div>
            <p className="text-xs text-gray-500">Categorias com produtos</p>
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Movimentações (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.recent_movements)}</div>
            <p className="text-xs text-gray-500">Entradas e saídas</p>
          </CardContent>
        </Card>

        {/* Average Stock Value */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Valor Médio por Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_products > 0 
                ? formatCurrency(stats.total_stock_value / stats.total_products)
                : formatCurrency(0)
              }
            </div>
            <p className="text-xs text-gray-500">Valor médio em estoque</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {(stats.low_stock_products > 0 || stats.expiring_products > 0) && (
        <div className="col-span-full">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertas Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.low_stock_products > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-700">
                      {stats.low_stock_products} produto(s) com estoque baixo
                    </span>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      Ação necessária
                    </Badge>
                  </div>
                )}
                {stats.expiring_products > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-700">
                      {stats.expiring_products} produto(s) vencendo em breve
                    </span>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      Verificar validade
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}