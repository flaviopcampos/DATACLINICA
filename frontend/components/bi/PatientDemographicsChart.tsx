"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { usePatientDemographics } from '@/hooks/bi/usePatientBI';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MapPin, Calendar } from 'lucide-react';

const COLORS = {
  primary: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'],
  gender: ['#FF6B9D', '#4ECDC4'],
  age: ['#FF9F43', '#10AC84', '#5F27CD', '#00D2D3', '#FF3838']
};

interface DemographicCardProps {
  title: string;
  icon: React.ReactNode;
  data: { name?: string; range?: string; gender?: string; city?: string; count: number; percentage: number }[];
  type: 'pie' | 'bar';
  colors: string[];
}

function DemographicCard({ title, icon, data, type, colors }: DemographicCardProps) {
  const chartData = data.map(item => ({
    name: item.name || item.range || item.gender || item.city || 'N/A',
    value: item.count,
    percentage: item.percentage
  }));

  const renderChart = () => {
    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [value, 'Pacientes']} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => [value, 'Pacientes']} />
          <Bar dataKey="value" fill={colors[0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span>{item.name}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium">{item.value}</span>
                <span className="text-muted-foreground">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DemographicsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DemographicsError({ error }: { error: Error }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center text-muted-foreground">
          <p>Erro ao carregar dados demográficos</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientDemographicsChart() {
  const { data: demographics, isLoading, error } = usePatientDemographics();

  if (isLoading) {
    return <DemographicsLoading />;
  }

  if (error) {
    return <DemographicsError error={error} />;
  }

  if (!demographics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Nenhum dado demográfico disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Demografia dos Pacientes</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DemographicCard
          title="Distribuição por Idade"
          icon={<Calendar className="h-4 w-4" />}
          data={demographics.ageGroups}
          type="pie"
          colors={COLORS.age}
        />
        
        <DemographicCard
          title="Distribuição por Gênero"
          icon={<Users className="h-4 w-4" />}
          data={demographics.genderDistribution}
          type="pie"
          colors={COLORS.gender}
        />
        
        <DemographicCard
          title="Distribuição por Localização"
          icon={<MapPin className="h-4 w-4" />}
          data={demographics.locationDistribution}
          type="bar"
          colors={COLORS.primary}
        />
      </div>
    </div>
  );
}

export default PatientDemographicsChart;