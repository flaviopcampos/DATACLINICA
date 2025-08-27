"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePatientBI, usePatientMetrics, usePatientKPIs } from '@/hooks/bi/usePatientBI';
import { PatientDemographicsChart } from '@/components/bi/PatientDemographicsChart';
import { PatientTrendsChart } from '@/components/bi/PatientTrendsChart';
import { PatientsBySpecialtyChart } from '@/components/bi/PatientsBySpecialtyChart';
import { MetricCard } from '@/components/bi/MetricCard';
import { KPIIndicator } from '@/components/bi/KPIIndicator';
import { TimeRange } from '@/types/bi';
import { Users, TrendingUp, Activity, FileText, Download, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function PageHeader({ 
  timeRange, 
  onTimeRangeChange, 
  onRefresh, 
  isLoading 
}: {
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
  onRefresh: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600" />
          Business Intelligence - Pacientes
        </h1>
        <p className="text-muted-foreground mt-1">
          Análise completa dos dados de pacientes e tendências
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última Semana</SelectItem>
            <SelectItem value="month">Último Mês</SelectItem>
            <SelectItem value="quarter">Último Trimestre</SelectItem>
            <SelectItem value="year">Último Ano</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
        
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
}

function MetricsOverview({ timeRange }: { timeRange: TimeRange }) {
  const { data: metrics = [], isLoading, error } = usePatientMetrics(timeRange);
  const { data: kpis = [], isLoading: isLoadingKPIs } = usePatientKPIs(timeRange);

  if (isLoading || isLoadingKPIs) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Erro ao carregar métricas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Métricas Principais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Indicadores de Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <KPIIndicator key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickStats({ timeRange }: { timeRange: TimeRange }) {
  const { medicalStats, isLoadingMedicalStats } = usePatientBI(timeRange);

  if (isLoadingMedicalStats) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!medicalStats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Estatísticas Médicas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {medicalStats.averageVisitsPerPatient.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">Consultas/Paciente</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {medicalStats.averageAge.toFixed(0)}
            </p>
            <p className="text-sm text-muted-foreground">Idade Média</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {medicalStats.patientRetentionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Taxa de Retenção</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {medicalStats.mostCommonConditions.length}
            </p>
            <p className="text-sm text-muted-foreground">Condições Comuns</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium mb-3">Condições Mais Comuns</h4>
          <div className="flex flex-wrap gap-2">
            {medicalStats.mostCommonConditions.slice(0, 5).map((condition, index) => (
              <Badge key={condition.condition} variant="secondary" className="text-xs">
                {condition.condition} ({condition.count})
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PatientsBIPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const { refetchAll, isLoading } = usePatientBI(timeRange);

  const handleRefresh = () => {
    refetchAll();
    toast.success('Dados atualizados com sucesso!');
  };

  const handleTimeRangeChange = (value: TimeRange) => {
    setTimeRange(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <PageHeader 
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="demographics">Demografia</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="specialties">Especialidades</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MetricsOverview timeRange={timeRange} />
          <QuickStats timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <PatientDemographicsChart />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <PatientTrendsChart timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <PatientsBySpecialtyChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}