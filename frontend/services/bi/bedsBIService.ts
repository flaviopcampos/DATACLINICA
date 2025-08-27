import { QueryClient } from '@tanstack/react-query';

// Interfaces para métricas de leitos
export interface BedMetrics {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  blockedBeds: number;
  cleaningBeds: number;
  occupancyRate: number;
  averageStayDuration: number;
  turnoverRate: number;
  revenuePerBed: number;
}

// Interfaces para tendências de ocupação
export interface BedOccupancyTrends {
  date: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  admissions: number;
  discharges: number;
  transfers: number;
}

// Interfaces para análise por departamento
export interface DepartmentBedAnalytics {
  departmentId: string;
  departmentName: string;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  averageStayDuration: number;
  revenue: number;
  patientSatisfaction: number;
}

// Interfaces para análise de tipos de leito
export interface BedTypeAnalytics {
  bedType: 'STANDARD' | 'ICU' | 'SEMI_ICU' | 'ISOLATION';
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  averageStayDuration: number;
  revenue: number;
  demandRate: number;
}

// Interface principal para análise completa de leitos
export interface BedAnalytics {
  metrics: BedMetrics;
  trends: BedOccupancyTrends[];
  departmentAnalytics: DepartmentBedAnalytics[];
  bedTypeAnalytics: BedTypeAnalytics[];
  alerts: {
    highOccupancy: boolean;
    maintenanceNeeded: boolean;
    lowTurnover: boolean;
    revenueDecline: boolean;
  };
}

class BedsBIService {
  private baseUrl = '/api/bi/beds';

  // Buscar métricas principais de leitos
  async getBedMetrics(filters?: any): Promise<BedMetrics> {
    // Mock data para desenvolvimento
    return {
      totalBeds: 120,
      occupiedBeds: 95,
      availableBeds: 18,
      maintenanceBeds: 4,
      blockedBeds: 2,
      cleaningBeds: 1,
      occupancyRate: 79.2,
      averageStayDuration: 4.5,
      turnoverRate: 2.1,
      revenuePerBed: 850.0
    };
  }

  // Buscar tendências de ocupação
  async getBedOccupancyTrends(filters?: any): Promise<BedOccupancyTrends[]> {
    // Mock data para desenvolvimento
    const trends: BedOccupancyTrends[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        totalBeds: 120,
        occupiedBeds: Math.floor(Math.random() * 30) + 70,
        availableBeds: Math.floor(Math.random() * 20) + 15,
        occupancyRate: Math.random() * 20 + 70,
        admissions: Math.floor(Math.random() * 15) + 5,
        discharges: Math.floor(Math.random() * 12) + 3,
        transfers: Math.floor(Math.random() * 5) + 1
      });
    }
    
    return trends;
  }

  // Buscar análise por departamento
  async getDepartmentBedAnalytics(filters?: any): Promise<DepartmentBedAnalytics[]> {
    // Mock data para desenvolvimento
    return [
      {
        departmentId: '1',
        departmentName: 'UTI',
        totalBeds: 20,
        occupiedBeds: 18,
        occupancyRate: 90.0,
        averageStayDuration: 7.2,
        revenue: 45000,
        patientSatisfaction: 4.5
      },
      {
        departmentId: '2',
        departmentName: 'Clínica Médica',
        totalBeds: 40,
        occupiedBeds: 32,
        occupancyRate: 80.0,
        averageStayDuration: 3.8,
        revenue: 28000,
        patientSatisfaction: 4.2
      },
      {
        departmentId: '3',
        departmentName: 'Cirurgia',
        totalBeds: 30,
        occupiedBeds: 25,
        occupancyRate: 83.3,
        averageStayDuration: 2.5,
        revenue: 35000,
        patientSatisfaction: 4.7
      },
      {
        departmentId: '4',
        departmentName: 'Pediatria',
        totalBeds: 25,
        occupiedBeds: 18,
        occupancyRate: 72.0,
        averageStayDuration: 4.1,
        revenue: 18000,
        patientSatisfaction: 4.8
      },
      {
        departmentId: '5',
        departmentName: 'Maternidade',
        totalBeds: 15,
        occupiedBeds: 12,
        occupancyRate: 80.0,
        averageStayDuration: 2.8,
        revenue: 15000,
        patientSatisfaction: 4.6
      }
    ];
  }

  // Buscar análise por tipo de leito
  async getBedTypeAnalytics(filters?: any): Promise<BedTypeAnalytics[]> {
    // Mock data para desenvolvimento
    return [
      {
        bedType: 'STANDARD',
        totalBeds: 70,
        occupiedBeds: 55,
        occupancyRate: 78.6,
        averageStayDuration: 3.2,
        revenue: 85000,
        demandRate: 85.0
      },
      {
        bedType: 'ICU',
        totalBeds: 25,
        occupiedBeds: 22,
        occupancyRate: 88.0,
        averageStayDuration: 8.5,
        revenue: 120000,
        demandRate: 95.0
      },
      {
        bedType: 'SEMI_ICU',
        totalBeds: 15,
        occupiedBeds: 12,
        occupancyRate: 80.0,
        averageStayDuration: 5.8,
        revenue: 45000,
        demandRate: 78.0
      },
      {
        bedType: 'ISOLATION',
        totalBeds: 10,
        occupiedBeds: 6,
        occupancyRate: 60.0,
        averageStayDuration: 6.2,
        revenue: 25000,
        demandRate: 65.0
      }
    ];
  }

  // Buscar análise completa de leitos
  async getBedAnalytics(filters?: any): Promise<BedAnalytics> {
    const [metrics, trends, departmentAnalytics, bedTypeAnalytics] = await Promise.all([
      this.getBedMetrics(filters),
      this.getBedOccupancyTrends(filters),
      this.getDepartmentBedAnalytics(filters),
      this.getBedTypeAnalytics(filters)
    ]);

    return {
      metrics,
      trends,
      departmentAnalytics,
      bedTypeAnalytics,
      alerts: {
        highOccupancy: metrics.occupancyRate > 85,
        maintenanceNeeded: metrics.maintenanceBeds > 5,
        lowTurnover: metrics.turnoverRate < 1.5,
        revenueDecline: metrics.revenuePerBed < 800
      }
    };
  }

  // Buscar KPIs de leitos
  async getBedKPIs(filters?: any) {
    const metrics = await this.getBedMetrics(filters);
    
    return {
      occupancyRate: {
        value: metrics.occupancyRate,
        target: 80,
        trend: 'up',
        format: 'percentage'
      },
      averageStay: {
        value: metrics.averageStayDuration,
        target: 4.0,
        trend: 'stable',
        format: 'decimal'
      },
      turnoverRate: {
        value: metrics.turnoverRate,
        target: 2.0,
        trend: 'up',
        format: 'decimal'
      },
      revenuePerBed: {
        value: metrics.revenuePerBed,
        target: 900,
        trend: 'down',
        format: 'currency'
      }
    };
  }

  // Buscar dados para gráficos
  async getBedChartData(chartType: string, filters?: any) {
    switch (chartType) {
      case 'occupancy-trends':
        return this.getBedOccupancyTrends(filters);
      case 'department-comparison':
        return this.getDepartmentBedAnalytics(filters);
      case 'bed-type-analysis':
        return this.getBedTypeAnalytics(filters);
      default:
        return [];
    }
  }
}

export const bedsBIService = new BedsBIService();
export default bedsBIService;