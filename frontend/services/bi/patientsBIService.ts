import { Patient, PatientStats } from '@/types/patients';
import { BiMetric, KPI, ChartData, TimeRange } from '@/types/bi';
import { formatDate, parseISO, subDays, subMonths, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface PatientDemographics {
  ageGroups: { range: string; count: number; percentage: number }[];
  genderDistribution: { gender: string; count: number; percentage: number }[];
  locationDistribution: { city: string; count: number; percentage: number }[];
}

export interface PatientTrends {
  registrationTrend: ChartData[];
  monthlyGrowth: number;
  yearlyGrowth: number;
}

export interface PatientsBySpecialty {
  specialty: string;
  patientCount: number;
  activePatients: number;
  newPatients: number;
}

export interface PatientMedicalStats {
  averageVisitsPerPatient: number;
  mostCommonConditions: { condition: string; count: number }[];
  averageAge: number;
  patientRetentionRate: number;
}

class PatientsBIService {
  // Métricas básicas de pacientes
  async getPatientMetrics(timeRange: TimeRange = 'month'): Promise<BiMetric[]> {
    try {
      // Simular dados baseados no timeRange
      const endDate = new Date();
      const startDate = this.getStartDate(endDate, timeRange);
      
      // Aqui você integraria com os hooks usePatients, usePatientStats
      const totalPatients = 1250;
      const newPatients = 45;
      const activePatients = 980;
      const inactivePatients = 270;
      
      return [
        {
          id: 'total-patients',
          title: 'Total de Pacientes',
          value: totalPatients,
          change: 8.5,
          trend: 'up',
          period: timeRange,
          icon: 'users'
        },
        {
          id: 'new-patients',
          title: 'Novos Pacientes',
          value: newPatients,
          change: 12.3,
          trend: 'up',
          period: timeRange,
          icon: 'user-plus'
        },
        {
          id: 'active-patients',
          title: 'Pacientes Ativos',
          value: activePatients,
          change: 5.2,
          trend: 'up',
          period: timeRange,
          icon: 'user-check'
        },
        {
          id: 'inactive-patients',
          title: 'Pacientes Inativos',
          value: inactivePatients,
          change: -2.1,
          trend: 'down',
          period: timeRange,
          icon: 'user-x'
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar métricas de pacientes:', error);
      throw error;
    }
  }

  // Análise demográfica
  async getPatientDemographics(): Promise<PatientDemographics> {
    try {
      // Integrar com usePatients para dados reais
      const ageGroups = [
        { range: '0-18', count: 125, percentage: 10 },
        { range: '19-30', count: 250, percentage: 20 },
        { range: '31-45', count: 375, percentage: 30 },
        { range: '46-60', count: 312, percentage: 25 },
        { range: '60+', count: 188, percentage: 15 }
      ];

      const genderDistribution = [
        { gender: 'Feminino', count: 675, percentage: 54 },
        { gender: 'Masculino', count: 575, percentage: 46 }
      ];

      const locationDistribution = [
        { city: 'São Paulo', count: 450, percentage: 36 },
        { city: 'Rio de Janeiro', count: 200, percentage: 16 },
        { city: 'Belo Horizonte', count: 150, percentage: 12 },
        { city: 'Brasília', count: 125, percentage: 10 },
        { city: 'Outros', count: 325, percentage: 26 }
      ];

      return {
        ageGroups,
        genderDistribution,
        locationDistribution
      };
    } catch (error) {
      console.error('Erro ao buscar dados demográficos:', error);
      throw error;
    }
  }

  // Tendências de cadastro
  async getPatientTrends(timeRange: TimeRange = 'year'): Promise<PatientTrends> {
    try {
      const registrationTrend = this.generateTrendData(timeRange);
      
      return {
        registrationTrend,
        monthlyGrowth: 8.5,
        yearlyGrowth: 15.2
      };
    } catch (error) {
      console.error('Erro ao buscar tendências de pacientes:', error);
      throw error;
    }
  }

  // Pacientes por especialidade
  async getPatientsBySpecialty(): Promise<PatientsBySpecialty[]> {
    try {
      return [
        {
          specialty: 'Cardiologia',
          patientCount: 245,
          activePatients: 198,
          newPatients: 12
        },
        {
          specialty: 'Ortopedia',
          patientCount: 189,
          activePatients: 156,
          newPatients: 8
        },
        {
          specialty: 'Neurologia',
          patientCount: 167,
          activePatients: 134,
          newPatients: 15
        },
        {
          specialty: 'Pediatria',
          patientCount: 156,
          activePatients: 142,
          newPatients: 18
        },
        {
          specialty: 'Ginecologia',
          patientCount: 134,
          activePatients: 118,
          newPatients: 9
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar pacientes por especialidade:', error);
      throw error;
    }
  }

  // Estatísticas médicas
  async getPatientMedicalStats(): Promise<PatientMedicalStats> {
    try {
      return {
        averageVisitsPerPatient: 4.2,
        mostCommonConditions: [
          { condition: 'Hipertensão', count: 234 },
          { condition: 'Diabetes', count: 189 },
          { condition: 'Ansiedade', count: 156 },
          { condition: 'Artrite', count: 134 },
          { condition: 'Asma', count: 98 }
        ],
        averageAge: 42.5,
        patientRetentionRate: 85.3
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas médicas:', error);
      throw error;
    }
  }

  // KPIs específicos de pacientes
  async getPatientKPIs(timeRange: TimeRange = 'month'): Promise<KPI[]> {
    try {
      return [
        {
          id: 'patient-satisfaction',
          title: 'Satisfação do Paciente',
          value: 4.6,
          target: 4.5,
          unit: '/5',
          trend: 'up',
          change: 2.2,
          status: 'good'
        },
        {
          id: 'patient-retention',
          title: 'Taxa de Retenção',
          value: 85.3,
          target: 80,
          unit: '%',
          trend: 'up',
          change: 3.1,
          status: 'good'
        },
        {
          id: 'new-patient-conversion',
          title: 'Conversão Novos Pacientes',
          value: 72.8,
          target: 75,
          unit: '%',
          trend: 'down',
          change: -1.5,
          status: 'warning'
        },
        {
          id: 'patient-lifetime-value',
          title: 'Valor Médio por Paciente',
          value: 2450,
          target: 2200,
          unit: 'R$',
          trend: 'up',
          change: 8.7,
          status: 'good'
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar KPIs de pacientes:', error);
      throw error;
    }
  }

  // Dados para gráficos de pacientes por idade
  async getPatientAgeChart(): Promise<ChartData[]> {
    try {
      return [
        { name: '0-18', value: 125, percentage: 10 },
        { name: '19-30', value: 250, percentage: 20 },
        { name: '31-45', value: 375, percentage: 30 },
        { name: '46-60', value: 312, percentage: 25 },
        { name: '60+', value: 188, percentage: 15 }
      ];
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico de idade:', error);
      throw error;
    }
  }

  // Dados para gráfico de crescimento mensal
  async getMonthlyGrowthChart(months: number = 12): Promise<ChartData[]> {
    try {
      const data: ChartData[] = [];
      const currentDate = new Date();
      
      for (let i = months - 1; i >= 0; i--) {
        const date = subMonths(currentDate, i);
        const monthName = formatDate(date, 'MMM', { locale: ptBR });
        const value = Math.floor(Math.random() * 50) + 20; // Simular dados
        
        data.push({
          name: monthName,
          value,
          date: formatDate(date, 'yyyy-MM-dd')
        });
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados de crescimento mensal:', error);
      throw error;
    }
  }

  // Relatório completo de pacientes
  async getPatientReport(timeRange: TimeRange = 'month') {
    try {
      const [metrics, demographics, trends, specialties, medicalStats, kpis] = await Promise.all([
        this.getPatientMetrics(timeRange),
        this.getPatientDemographics(),
        this.getPatientTrends(timeRange),
        this.getPatientsBySpecialty(),
        this.getPatientMedicalStats(),
        this.getPatientKPIs(timeRange)
      ]);

      return {
        metrics,
        demographics,
        trends,
        specialties,
        medicalStats,
        kpis,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de pacientes:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  private getStartDate(endDate: Date, timeRange: TimeRange): Date {
    switch (timeRange) {
      case 'week':
        return subDays(endDate, 7);
      case 'month':
        return subMonths(endDate, 1);
      case 'quarter':
        return subMonths(endDate, 3);
      case 'year':
        return subYears(endDate, 1);
      default:
        return subMonths(endDate, 1);
    }
  }

  private generateTrendData(timeRange: TimeRange): ChartData[] {
    const data: ChartData[] = [];
    const periods = timeRange === 'year' ? 12 : timeRange === 'quarter' ? 3 : 4;
    
    for (let i = periods - 1; i >= 0; i--) {
      const date = timeRange === 'year' 
        ? subMonths(new Date(), i)
        : subDays(new Date(), i * 7);
      
      const name = timeRange === 'year'
        ? formatDate(date, 'MMM', { locale: ptBR })
        : formatDate(date, 'dd/MM');
      
      data.push({
        name,
        value: Math.floor(Math.random() * 40) + 10,
        date: formatDate(date, 'yyyy-MM-dd')
      });
    }
    
    return data;
  }
}

export const patientsBIService = new PatientsBIService();
export default patientsBIService;