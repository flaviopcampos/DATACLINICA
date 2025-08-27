import api from '../api';
import type {
  Appointment,
  AppointmentStats,
  AppointmentFilters
} from '@/types/appointments';
import type {
  MetricData,
  KPIData,
  ChartData,
  TimeSeriesData
} from '@/types/bi/metrics';

export interface AppointmentMetrics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  averageDuration: number;
  occupancyRate: number;
  patientSatisfaction: number;
  revenuePerAppointment: number;
}

export interface AppointmentTrends {
  daily: TimeSeriesData[];
  weekly: TimeSeriesData[];
  monthly: TimeSeriesData[];
  hourly: { hour: number; count: number; }[];
}

export interface DoctorPerformance {
  doctorId: number;
  doctorName: string;
  totalAppointments: number;
  completedRate: number;
  cancelledRate: number;
  noShowRate: number;
  averageRating: number;
  revenue: number;
}

export interface AppointmentAnalytics {
  metrics: AppointmentMetrics;
  trends: AppointmentTrends;
  doctorPerformance: DoctorPerformance[];
  busyHours: { hour: number; count: number; }[];
  busyDays: { day: string; count: number; }[];
  statusDistribution: { status: string; count: number; percentage: number; }[];
  typeDistribution: { type: string; count: number; percentage: number; }[];
}

class AppointmentsBIService {
  private baseUrl = '/api/bi/appointments';

  // Buscar métricas gerais de agendamentos
  async getAppointmentMetrics(filters?: AppointmentFilters): Promise<AppointmentMetrics> {
    try {
      const response = await api.get(`${this.baseUrl}/metrics`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar métricas de agendamentos:', error);
      // Retorna dados mock em caso de erro
      return this.getMockMetrics();
    }
  }

  // Buscar tendências de agendamentos
  async getAppointmentTrends(period: 'daily' | 'weekly' | 'monthly' = 'daily', filters?: AppointmentFilters): Promise<AppointmentTrends> {
    try {
      const response = await api.get(`${this.baseUrl}/trends`, { 
        params: { period, ...filters } 
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tendências de agendamentos:', error);
      return this.getMockTrends();
    }
  }

  // Buscar performance dos médicos
  async getDoctorPerformance(filters?: AppointmentFilters): Promise<DoctorPerformance[]> {
    try {
      const response = await api.get(`${this.baseUrl}/doctor-performance`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar performance dos médicos:', error);
      return this.getMockDoctorPerformance();
    }
  }

  // Buscar análise completa de agendamentos
  async getAppointmentAnalytics(filters?: AppointmentFilters): Promise<AppointmentAnalytics> {
    try {
      const response = await api.get(`${this.baseUrl}/analytics`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar analytics de agendamentos:', error);
      return this.getMockAnalytics();
    }
  }

  // Buscar KPIs de agendamentos para dashboard
  async getAppointmentKPIs(filters?: AppointmentFilters): Promise<KPIData[]> {
    try {
      const metrics = await this.getAppointmentMetrics(filters);
      return [
        {
          id: 'total-appointments',
          title: 'Total de Agendamentos',
          value: metrics.totalAppointments,
          target: 1000,
          unit: 'agendamentos',
          trend: 'up',
          change: 12.5,
          period: 'mensal',
          status: 'good'
        },
        {
          id: 'occupancy-rate',
          title: 'Taxa de Ocupação',
          value: metrics.occupancyRate,
          target: 85,
          unit: '%',
          trend: 'up',
          change: 5.2,
          period: 'mensal',
          status: metrics.occupancyRate >= 80 ? 'good' : metrics.occupancyRate >= 60 ? 'warning' : 'critical'
        },
        {
          id: 'completion-rate',
          title: 'Taxa de Conclusão',
          value: (metrics.completedAppointments / metrics.totalAppointments) * 100,
          target: 90,
          unit: '%',
          trend: 'stable',
          change: 0.8,
          period: 'mensal',
          status: 'good'
        },
        {
          id: 'no-show-rate',
          title: 'Taxa de Faltas',
          value: (metrics.noShowAppointments / metrics.totalAppointments) * 100,
          target: 5,
          unit: '%',
          trend: 'down',
          change: -2.1,
          period: 'mensal',
          status: 'good'
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar KPIs de agendamentos:', error);
      return this.getMockKPIs();
    }
  }

  // Buscar dados para gráficos
  async getAppointmentChartData(chartType: 'status' | 'trends' | 'doctors' | 'hours', filters?: AppointmentFilters): Promise<ChartData> {
    try {
      const response = await api.get(`${this.baseUrl}/charts/${chartType}`, { params: filters });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar dados do gráfico ${chartType}:`, error);
      return this.getMockChartData(chartType);
    }
  }

  // Dados mock para desenvolvimento
  private getMockMetrics(): AppointmentMetrics {
    return {
      totalAppointments: 1247,
      completedAppointments: 1089,
      cancelledAppointments: 98,
      noShowAppointments: 60,
      averageDuration: 45,
      occupancyRate: 78.5,
      patientSatisfaction: 4.6,
      revenuePerAppointment: 150.75
    };
  }

  private getMockTrends(): AppointmentTrends {
    const generateDailyData = () => {
      const data = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 50) + 20,
          label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        });
      }
      return data;
    };

    return {
      daily: generateDailyData(),
      weekly: [
        { date: '2024-01-01', value: 245, label: 'Sem 1' },
        { date: '2024-01-08', value: 289, label: 'Sem 2' },
        { date: '2024-01-15', value: 312, label: 'Sem 3' },
        { date: '2024-01-22', value: 298, label: 'Sem 4' }
      ],
      monthly: [
        { date: '2024-01', value: 1247, label: 'Jan' },
        { date: '2024-02', value: 1189, label: 'Fev' },
        { date: '2024-03', value: 1356, label: 'Mar' }
      ],
      hourly: [
        { hour: 8, count: 45 },
        { hour: 9, count: 67 },
        { hour: 10, count: 89 },
        { hour: 11, count: 78 },
        { hour: 14, count: 92 },
        { hour: 15, count: 85 },
        { hour: 16, count: 73 },
        { hour: 17, count: 56 }
      ]
    };
  }

  private getMockDoctorPerformance(): DoctorPerformance[] {
    return [
      {
        doctorId: 1,
        doctorName: 'Dr. João Silva',
        totalAppointments: 234,
        completedRate: 92.3,
        cancelledRate: 5.1,
        noShowRate: 2.6,
        averageRating: 4.8,
        revenue: 35250.00
      },
      {
        doctorId: 2,
        doctorName: 'Dra. Maria Santos',
        totalAppointments: 198,
        completedRate: 89.4,
        cancelledRate: 7.1,
        noShowRate: 3.5,
        averageRating: 4.6,
        revenue: 29700.00
      },
      {
        doctorId: 3,
        doctorName: 'Dr. Carlos Oliveira',
        totalAppointments: 156,
        completedRate: 94.2,
        cancelledRate: 3.8,
        noShowRate: 2.0,
        averageRating: 4.9,
        revenue: 23400.00
      }
    ];
  }

  private getMockAnalytics(): AppointmentAnalytics {
    return {
      metrics: this.getMockMetrics(),
      trends: this.getMockTrends(),
      doctorPerformance: this.getMockDoctorPerformance(),
      busyHours: [
        { hour: 9, count: 67 },
        { hour: 10, count: 89 },
        { hour: 14, count: 92 },
        { hour: 15, count: 85 }
      ],
      busyDays: [
        { day: 'Segunda', count: 245 },
        { day: 'Terça', count: 289 },
        { day: 'Quarta', count: 267 },
        { day: 'Quinta', count: 298 },
        { day: 'Sexta', count: 234 }
      ],
      statusDistribution: [
        { status: 'Concluído', count: 1089, percentage: 87.3 },
        { status: 'Cancelado', count: 98, percentage: 7.9 },
        { status: 'Faltou', count: 60, percentage: 4.8 }
      ],
      typeDistribution: [
        { type: 'Consulta', count: 789, percentage: 63.3 },
        { type: 'Retorno', count: 298, percentage: 23.9 },
        { type: 'Exame', count: 160, percentage: 12.8 }
      ]
    };
  }

  private getMockKPIs(): KPIData[] {
    return [
      {
        id: 'total-appointments',
        title: 'Total de Agendamentos',
        value: 1247,
        target: 1000,
        unit: 'agendamentos',
        trend: 'up',
        change: 12.5,
        period: 'mensal',
        status: 'good'
      },
      {
        id: 'occupancy-rate',
        title: 'Taxa de Ocupação',
        value: 78.5,
        target: 85,
        unit: '%',
        trend: 'up',
        change: 5.2,
        period: 'mensal',
        status: 'warning'
      }
    ];
  }

  private getMockChartData(chartType: string): ChartData {
    switch (chartType) {
      case 'status':
        return {
          type: 'pie',
          data: [
            { name: 'Concluído', value: 1089, color: '#10b981' },
            { name: 'Cancelado', value: 98, color: '#f59e0b' },
            { name: 'Faltou', value: 60, color: '#ef4444' }
          ],
          title: 'Distribuição por Status'
        };
      case 'trends':
        return {
          type: 'line',
          data: this.getMockTrends().daily.map(item => ({
            name: item.label,
            value: item.value
          })),
          title: 'Tendência de Agendamentos'
        };
      case 'doctors':
        return {
          type: 'bar',
          data: this.getMockDoctorPerformance().map(doctor => ({
            name: doctor.doctorName,
            value: doctor.totalAppointments
          })),
          title: 'Agendamentos por Médico'
        };
      case 'hours':
        return {
          type: 'bar',
          data: this.getMockTrends().hourly.map(item => ({
            name: `${item.hour}h`,
            value: item.count
          })),
          title: 'Agendamentos por Horário'
        };
      default:
        return {
          type: 'line',
          data: [],
          title: 'Dados não encontrados'
        };
    }
  }
}

export const appointmentsBIService = new AppointmentsBIService();
export default appointmentsBIService;