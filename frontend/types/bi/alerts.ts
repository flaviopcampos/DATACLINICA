export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AlertType = 
  | 'bed_occupancy'
  | 'billing_overdue'
  | 'appointment_cancelled'
  | 'patient_inactive'
  | 'patient_growth'
  | 'patient_registration'
  | 'revenue_drop'
  | 'system_performance'
  | 'custom';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  severity: AlertSeverity;
  isActive: boolean;
  conditions: AlertCondition[];
  actions: AlertAction[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AlertCondition {
  id: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne';
  value: number | string;
  timeWindow?: number; // em minutos
}

export interface AlertAction {
  id: string;
  type: 'notification' | 'email' | 'sms' | 'webhook';
  target: string;
  template?: string;
}

export interface AlertNotification {
  id: string;
  ruleId: string;
  ruleName: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  isResolved: boolean;
  triggeredAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface AlertMetric {
  id: string;
  name: string;
  description: string;
  category: 'appointments' | 'billing' | 'beds' | 'patients' | 'system';
  dataType: 'number' | 'percentage' | 'boolean' | 'string';
  unit?: string;
  getCurrentValue: () => Promise<number | string | boolean>;
}

export interface AlertsState {
  rules: AlertRule[];
  notifications: AlertNotification[];
  metrics: AlertMetric[];
  isLoading: boolean;
  error: string | null;
}

export interface CreateAlertRuleRequest {
  name: string;
  description: string;
  type: AlertType;
  severity: AlertSeverity;
  conditions: Omit<AlertCondition, 'id'>[];
  actions: Omit<AlertAction, 'id'>[];
}

export interface UpdateAlertRuleRequest extends Partial<CreateAlertRuleRequest> {
  id: string;
  isActive?: boolean;
}

export interface AlertsFilters {
  severity?: AlertSeverity[];
  type?: AlertType[];
  isRead?: boolean;
  isResolved?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface AlertsStats {
  total: number;
  unread: number;
  unresolved: number;
  bySeverity: Record<AlertSeverity, number>;
  byType: Record<AlertType, number>;
  recentTrends: {
    period: string;
    count: number;
  }[];
}