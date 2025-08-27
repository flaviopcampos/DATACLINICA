"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePatientBI } from '@/hooks/bi/usePatientBI';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Users, UserPlus, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const SPECIALTY_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

interface SpecialtyCardProps {
  specialty: string;
  patientCount: number;
  activePatients: number;
  newPatients: number;
  color: string;
  rank: number;
}

function SpecialtyCard({ specialty, patientCount, activePatients, newPatients, color, rank }: SpecialtyCardProps) {
  const activePercentage = Math.round((activePatients / patientCount) * 100);
  const newPercentage = Math.round((newPatients / patientCount) * 100);

  return (
    <Card className="relative overflow-hidden">
      <div 
        className="absolute top-0 left-0 w-1 h-full" 
        style={{ backgroundColor: color }}
      />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="h-4 w-4" style={{ color }} />
            {specialty}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            #{rank}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color }}>
              {patientCount}
            </p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {activePatients}
            </p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {newPatients}
            </p>
            <p className="text-xs text-muted-foreground">Novos</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-green-500" />
              Taxa de Atividade
            </span>
            <span className="font-medium">{activePercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${activePercentage}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <UserPlus className="h-3 w-3 text-blue-500" />
              Novos Pacientes
            </span>
            <span className="font-medium">{newPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${newPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SpecialtiesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="text-center">
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                    <Skeleton className="h-3 w-8 mx-auto" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SpecialtiesError({ error }: { error: Error }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center text-muted-foreground">
          <p>Erro ao carregar dados por especialidade</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientsBySpecialtyChart({ className }: { className?: string }) {
  const { specialties, isLoadingSpecialties, specialtiesError } = usePatientBI();

  if (isLoadingSpecialties) {
    return <SpecialtiesLoading />;
  }

  if (specialtiesError) {
    return <SpecialtiesError error={specialtiesError} />;
  }

  if (!specialties || specialties.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Nenhum dado de especialidade disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para gráficos
  const chartData = specialties.map(item => ({
    name: item.specialty,
    total: item.patientCount,
    ativos: item.activePatients,
    novos: item.newPatients
  }));

  const pieData = specialties.map(item => ({
    name: item.specialty,
    value: item.patientCount
  }));

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2 mb-6">
        <Stethoscope className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Pacientes por Especialidade</h2>
      </div>

      {/* Cards de especialidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialties.map((specialty, index) => (
          <SpecialtyCard
            key={specialty.specialty}
            specialty={specialty.specialty}
            patientCount={specialty.patientCount}
            activePatients={specialty.activePatients}
            newPatients={specialty.newPatients}
            color={SPECIALTY_COLORS[index % SPECIALTY_COLORS.length]}
            rank={index + 1}
          />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Comparativo por Especialidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="total" fill="#0088FE" name="Total" />
                <Bar dataKey="ativos" fill="#00C49F" name="Ativos" />
                <Bar dataKey="novos" fill="#FFBB28" name="Novos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de pizza */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Distribuição Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={SPECIALTY_COLORS[index % SPECIALTY_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Pacientes']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo estatístico */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {specialties.reduce((acc, s) => acc + s.patientCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total de Pacientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {specialties.reduce((acc, s) => acc + s.activePatients, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {specialties.reduce((acc, s) => acc + s.newPatients, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Novos Pacientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {specialties.length}
              </p>
              <p className="text-sm text-muted-foreground">Especialidades</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PatientsBySpecialtyChart;