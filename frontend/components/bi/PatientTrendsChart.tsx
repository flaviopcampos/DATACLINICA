"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { usePatientBI } from '@/hooks/bi/usePatientBI';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Calendar, Users } from 'lucide-react';
import { TimeRange } from '@/types/bi';
import { cn } from '@/lib/utils';

interface PatientTrendsChartProps {
  timeRange?: TimeRange;
  className?: string;
}

function TrendMetricCard({ 
  title, 
  value, 
  trend, 
  icon 
}: { 
  title: string; 
  value: number; 
  trend: 'up' | 'down'; 
  icon: React.ReactNode; 
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={cn(
              "text-lg font-bold",
              trend === 'up' ? "text-green-600" : "text-red-600"
            )}>
              {value > 0 ? '+' : ''}{value.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function TrendsError({ error }: { error: Error }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center text-muted-foreground">
          <p>Erro ao carregar tendências de pacientes</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientTrendsChart({ timeRange = 'month', className }: PatientTrendsChartProps) {
  const { trends, isLoadingTrends, trendsError } = usePatientBI(timeRange);

  if (isLoadingTrends) {
    return <TrendsLoading />;
  }

  if (trendsError) {
    return <TrendsError error={trendsError} />;
  }

  if (!trends) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Nenhum dado de tendência disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = trends.registrationTrend.map(item => ({
    ...item,
    value: Number(item.value)
  }));

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Tendências de Crescimento</h2>
      </div>

      {/* Métricas de crescimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TrendMetricCard
          title="Crescimento Mensal"
          value={trends.monthlyGrowth}
          trend={trends.monthlyGrowth >= 0 ? 'up' : 'down'}
          icon={<Calendar className="h-4 w-4" />}
        />
        <TrendMetricCard
          title="Crescimento Anual"
          value={trends.yearlyGrowth}
          trend={trends.yearlyGrowth >= 0 ? 'up' : 'down'}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Gráfico de tendência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Cadastros de Pacientes - {timeRange === 'year' ? 'Últimos 12 meses' : 
                                     timeRange === 'quarter' ? 'Últimos 3 meses' : 
                                     timeRange === 'month' ? 'Último mês' : 'Última semana'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => [value, 'Novos Pacientes']}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0088FE"
                strokeWidth={2}
                fill="url(#colorRegistrations)"
                dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#0088FE', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de linha alternativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendência Linear
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => [value, 'Pacientes']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00C49F"
                strokeWidth={3}
                dot={{ fill: '#00C49F', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#00C49F', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resumo estatístico */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Estatístico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.max(...chartData.map(d => d.value))}
              </p>
              <p className="text-sm text-muted-foreground">Pico Máximo</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.round(chartData.reduce((acc, d) => acc + d.value, 0) / chartData.length)}
              </p>
              <p className="text-sm text-muted-foreground">Média</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {Math.min(...chartData.map(d => d.value))}
              </p>
              <p className="text-sm text-muted-foreground">Mínimo</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {chartData.reduce((acc, d) => acc + d.value, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PatientTrendsChart;