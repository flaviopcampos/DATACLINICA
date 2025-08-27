import { 
  AlertRule, 
  AlertNotification, 
  AlertMetric, 
  CreateAlertRuleRequest, 
  UpdateAlertRuleRequest,
  AlertsFilters,
  AlertsStats,
  AlertCondition,
  AlertSeverity,
  AlertType
} from '@/types/bi/alerts';
import { appointmentsBIService } from './appointmentsBIService';
import { billingBIService } from './billingBIService';
import { bedsBIService } from './bedsBIService';
import { patientsBIService } from './patientsBIService';

class AlertsService {
  private rules: AlertRule[] = [];
  private notifications: AlertNotification[] = [];
  private metrics: AlertMetric[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private listeners: ((notifications: AlertNotification[]) => void)[] = [];

  constructor() {
    this.initializeMetrics();
    this.loadDefaultRules();
    this.startMonitoring();
  }

  // Inicializar métricas disponíveis
  private initializeMetrics(): void {
    this.metrics = [
      {
        id: 'bed_occupancy_rate',
        name: 'Taxa de Ocupação de Leitos',
        description: 'Percentual de leitos ocupados',
        category: 'beds',
        dataType: 'percentage',
        unit: '%',
        getCurrentValue: async () => {
          const stats = await bedsBIService.getBedStats();
          return (stats.occupied / stats.total) * 100;
        }
      },
      {
        id: 'overdue_bills_count',
        name: 'Faturas em Atraso',
        description: 'Número de faturas vencidas',
        category: 'billing',
        dataType: 'number',
        unit: 'faturas',
        getCurrentValue: async () => {
          const overdue = await billingBIService.getOverdueBills();
          return overdue.length;
        }
      },
      {
        id: 'cancelled_appointments_today',
        name: 'Agendamentos Cancelados Hoje',
        description: 'Número de agendamentos cancelados no dia atual',
        category: 'appointments',
        dataType: 'number',
        unit: 'agendamentos',
        getCurrentValue: async () => {
          const today = new Date();
          const stats = await appointmentsBIService.getAppointmentStats(today, today);
          return stats.cancelled;
        }
      },
      {
        id: 'daily_revenue',
        name: 'Receita Diária',
        description: 'Receita total do dia',
        category: 'billing',
        dataType: 'number',
        unit: 'R$',
        getCurrentValue: async () => {
          const today = new Date();
          const revenue = await billingBIService.getDailyRevenue(today);
          return revenue;
        }
      },
      {
        id: 'available_beds',
        name: 'Leitos Disponíveis',
        description: 'Número de leitos disponíveis',
        category: 'beds',
        dataType: 'number',
        unit: 'leitos',
        getCurrentValue: async () => {
          const stats = await bedsBIService.getBedStats();
          return stats.available;
        }
      },
      {
        id: 'total_patients',
        name: 'Total de Pacientes',
        description: 'Número total de pacientes cadastrados',
        category: 'patients',
        dataType: 'number',
        unit: 'pacientes',
        getCurrentValue: async () => {
          const metrics = await patientsBIService.getPatientMetrics();
          const totalMetric = metrics.find(m => m.id === 'total-patients');
          return totalMetric?.value || 0;
        }
      },
      {
        id: 'new_patients_today',
        name: 'Novos Pacientes Hoje',
        description: 'Número de pacientes cadastrados hoje',
        category: 'patients',
        dataType: 'number',
        unit: 'pacientes',
        getCurrentValue: async () => {
          const metrics = await patientsBIService.getPatientMetrics('day');
          const newMetric = metrics.find(m => m.id === 'new-patients');
          return newMetric?.value || 0;
        }
      },
      {
        id: 'inactive_patients',
        name: 'Pacientes Inativos',
        description: 'Número de pacientes sem atividade recente',
        category: 'patients',
        dataType: 'number',
        unit: 'pacientes',
        getCurrentValue: async () => {
          const metrics = await patientsBIService.getPatientMetrics();
          const inactiveMetric = metrics.find(m => m.id === 'inactive-patients');
          return inactiveMetric?.value || 0;
        }
      },
      {
        id: 'patient_growth_rate',
        name: 'Taxa de Crescimento de Pacientes',
        description: 'Taxa de crescimento mensal de pacientes',
        category: 'patients',
        dataType: 'percentage',
        unit: '%',
        getCurrentValue: async () => {
          const trends = await patientsBIService.getPatientTrends();
          return trends.monthlyGrowth;
        }
      }
    ];
  }

  // Carregar regras padrão
  private loadDefaultRules(): void {
    const defaultRules: CreateAlertRuleRequest[] = [
      {
        name: 'Ocupação Crítica de Leitos',
        description: 'Alerta quando a ocupação de leitos excede 90%',
        type: 'bed_occupancy',
        severity: 'critical',
        conditions: [{
          metric: 'bed_occupancy_rate',
          operator: 'gt',
          value: 90
        }],
        actions: [{
          type: 'notification',
          target: 'system'
        }]
      },
      {
        name: 'Faturas em Atraso',
        description: 'Alerta quando há mais de 5 faturas em atraso',
        type: 'billing_overdue',
        severity: 'high',
        conditions: [{
          metric: 'overdue_bills_count',
          operator: 'gt',
          value: 5
        }],
        actions: [{
          type: 'notification',
          target: 'billing_team'
        }]
      },
      {
        name: 'Muitos Cancelamentos',
        description: 'Alerta quando há mais de 10 cancelamentos no dia',
        type: 'appointment_cancelled',
        severity: 'medium',
        conditions: [{
          metric: 'cancelled_appointments_today',
          operator: 'gt',
          value: 10
        }],
        actions: [{
          type: 'notification',
          target: 'reception'
        }]
      },
      {
        name: 'Poucos Leitos Disponíveis',
        description: 'Alerta quando há menos de 3 leitos disponíveis',
        type: 'bed_occupancy',
        severity: 'high',
        conditions: [{
          metric: 'available_beds',
          operator: 'lt',
          value: 3
        }],
        actions: [{
          type: 'notification',
          target: 'management'
        }]
      },
      {
        name: 'Muitos Pacientes Inativos',
        description: 'Alerta quando há mais de 100 pacientes inativos',
        type: 'patient_inactive',
        severity: 'medium',
        conditions: [{
          metric: 'inactive_patients',
          operator: 'gt',
          value: 100
        }],
        actions: [{
          type: 'notification',
          target: 'patient_care'
        }]
      },
      {
        name: 'Baixo Crescimento de Pacientes',
        description: 'Alerta quando o crescimento mensal é menor que 2%',
        type: 'patient_growth',
        severity: 'low',
        conditions: [{
          metric: 'patient_growth_rate',
          operator: 'lt',
          value: 2
        }],
        actions: [{
          type: 'notification',
          target: 'marketing'
        }]
      },
      {
        name: 'Poucos Novos Pacientes',
        description: 'Alerta quando há menos de 5 novos pacientes no dia',
        type: 'patient_registration',
        severity: 'low',
        conditions: [{
          metric: 'new_patients_today',
          operator: 'lt',
          value: 5
        }],
        actions: [{
          type: 'notification',
          target: 'reception'
        }]
      }
    ];

    defaultRules.forEach(rule => {
      this.createRule(rule);
    });
  }

  // Iniciar monitoramento
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Verificar alertas a cada 5 minutos
    this.monitoringInterval = setInterval(() => {
      this.checkAllRules();
    }, 5 * 60 * 1000);

    // Verificação inicial
    setTimeout(() => this.checkAllRules(), 1000);
  }

  // Verificar todas as regras
  private async checkAllRules(): Promise<void> {
    const activeRules = this.rules.filter(rule => rule.isActive);
    
    for (const rule of activeRules) {
      try {
        await this.checkRule(rule);
      } catch (error) {
        console.error(`Erro ao verificar regra ${rule.name}:`, error);
      }
    }
  }

  // Verificar uma regra específica
  private async checkRule(rule: AlertRule): Promise<void> {
    let shouldTrigger = true;

    for (const condition of rule.conditions) {
      const metric = this.metrics.find(m => m.id === condition.metric);
      if (!metric) continue;

      const currentValue = await metric.getCurrentValue();
      const conditionMet = this.evaluateCondition(currentValue, condition);
      
      if (!conditionMet) {
        shouldTrigger = false;
        break;
      }
    }

    if (shouldTrigger) {
      // Verificar se já existe uma notificação não resolvida para esta regra
      const existingNotification = this.notifications.find(
        n => n.ruleId === rule.id && !n.isResolved
      );

      if (!existingNotification) {
        await this.triggerAlert(rule);
      }
    }
  }

  // Avaliar condição
  private evaluateCondition(value: number | string | boolean, condition: AlertCondition): boolean {
    const { operator, value: conditionValue } = condition;
    
    if (typeof value === 'number' && typeof conditionValue === 'number') {
      switch (operator) {
        case 'gt': return value > conditionValue;
        case 'lt': return value < conditionValue;
        case 'gte': return value >= conditionValue;
        case 'lte': return value <= conditionValue;
        case 'eq': return value === conditionValue;
        case 'ne': return value !== conditionValue;
        default: return false;
      }
    }
    
    if (operator === 'eq') return value === conditionValue;
    if (operator === 'ne') return value !== conditionValue;
    
    return false;
  }

  // Disparar alerta
  private async triggerAlert(rule: AlertRule): Promise<void> {
    const notification: AlertNotification = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      message: rule.description,
      data: {},
      isRead: false,
      isResolved: false,
      triggeredAt: new Date()
    };

    this.notifications.unshift(notification);
    
    // Executar ações
    for (const action of rule.actions) {
      await this.executeAction(action, notification);
    }

    // Notificar listeners
    this.notifyListeners();
  }

  // Executar ação
  private async executeAction(action: any, notification: AlertNotification): Promise<void> {
    switch (action.type) {
      case 'notification':
        // Notificação já foi criada
        break;
      case 'email':
        // Implementar envio de email
        console.log(`Enviando email para ${action.target}:`, notification.title);
        break;
      case 'sms':
        // Implementar envio de SMS
        console.log(`Enviando SMS para ${action.target}:`, notification.title);
        break;
      case 'webhook':
        // Implementar webhook
        console.log(`Chamando webhook ${action.target}:`, notification);
        break;
    }
  }

  // Notificar listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener([...this.notifications]);
    });
  }

  // Métodos públicos
  async getRules(): Promise<AlertRule[]> {
    return [...this.rules];
  }

  async getNotifications(filters?: AlertsFilters): Promise<AlertNotification[]> {
    let filtered = [...this.notifications];

    if (filters) {
      if (filters.severity) {
        filtered = filtered.filter(n => filters.severity!.includes(n.severity));
      }
      if (filters.type) {
        filtered = filtered.filter(n => filters.type!.includes(n.type));
      }
      if (filters.isRead !== undefined) {
        filtered = filtered.filter(n => n.isRead === filters.isRead);
      }
      if (filters.isResolved !== undefined) {
        filtered = filtered.filter(n => n.isResolved === filters.isResolved);
      }
      if (filters.dateRange) {
        filtered = filtered.filter(n => 
          n.triggeredAt >= filters.dateRange!.start && 
          n.triggeredAt <= filters.dateRange!.end
        );
      }
    }

    return filtered;
  }

  async getMetrics(): Promise<AlertMetric[]> {
    return [...this.metrics];
  }

  async createRule(request: CreateAlertRuleRequest): Promise<AlertRule> {
    const rule: AlertRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...request,
      isActive: true,
      conditions: request.conditions.map(c => ({
        ...c,
        id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })),
      actions: request.actions.map(a => ({
        ...a,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.rules.push(rule);
    return rule;
  }

  async updateRule(request: UpdateAlertRuleRequest): Promise<AlertRule> {
    const index = this.rules.findIndex(r => r.id === request.id);
    if (index === -1) {
      throw new Error('Regra não encontrada');
    }

    const rule = this.rules[index];
    this.rules[index] = {
      ...rule,
      ...request,
      updatedAt: new Date()
    };

    return this.rules[index];
  }

  async deleteRule(id: string): Promise<void> {
    const index = this.rules.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Regra não encontrada');
    }

    this.rules.splice(index, 1);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifyListeners();
    }
  }

  async markAsResolved(notificationId: string, resolvedBy?: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isResolved = true;
      notification.resolvedAt = new Date();
      notification.resolvedBy = resolvedBy;
      this.notifyListeners();
    }
  }

  async getStats(): Promise<AlertsStats> {
    const notifications = this.notifications;
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const unresolved = notifications.filter(n => !n.isResolved).length;

    const bySeverity = notifications.reduce((acc, n) => {
      acc[n.severity] = (acc[n.severity] || 0) + 1;
      return acc;
    }, {} as Record<AlertSeverity, number>);

    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<AlertType, number>);

    return {
      total,
      unread,
      unresolved,
      bySeverity,
      byType,
      recentTrends: [] // Implementar análise de tendências
    };
  }

  // Adicionar listener para notificações
  addListener(listener: (notifications: AlertNotification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Retornar função para remover listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Parar monitoramento
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

export const alertsService = new AlertsService();
export default alertsService;