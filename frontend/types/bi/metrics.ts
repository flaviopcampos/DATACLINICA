// Tipos para métricas do sistema de Business Intelligence

export interface Metric {
  id: string;
  name: string;
  description?: string;
  category: MetricCategory;
  type: MetricType;
  unit: MetricUnit;
  value: number;
  previousValue?: number;
  target?: number;
  trend: TrendDirection;
  changePercentage?: number;
  lastUpdated: Date;
  dataSource: string;
  formula?: string;
  isActive: boolean;
}

export interface MetricHistory {
  metricId: string;
  timestamp: Date;
  value: number;
  context?: Record<string, any>;
}

export interface MetricComparison {
  current: MetricValue;
  previous: MetricValue;
  change: {
    absolute: number;
    percentage: number;
    trend: TrendDirection;
  };
  period: ComparisonPeriod;
}

export interface MetricValue {
  value: number;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface MetricTarget {
  metricId: string;
  targetValue: number;
  targetType: TargetType;
  period: TargetPeriod;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricAlert {
  id: string;
  metricId: string;
  name: string;
  condition: AlertCondition;
  isActive: boolean;
  lastTriggered?: Date;
  recipients: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  operator: ComparisonOperator;
  threshold: number;
  duration?: number; // em minutos
  severity: AlertSeverity;
}

export interface MetricDashboard {
  id: string;
  name: string;
  description?: string;
  metrics: string[]; // IDs das métricas
  layout: DashboardLayout;
  filters: MetricFilter[];
  refreshInterval: number;
  isPublic: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export interface DashboardLayout {
  widgets: WidgetLayout[];
  columns: number;
  rowHeight: number;
}

export interface WidgetLayout {
  metricId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

// Tipos para análise de métricas
export interface MetricAnalysis {
  metricId: string;
  period: AnalysisPeriod;
  statistics: MetricStatistics;
  trends: TrendAnalysis;
  anomalies: Anomaly[];
  forecasts?: Forecast[];
}

export interface MetricStatistics {
  mean: number;
  median: number;
  mode?: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
}

export interface TrendAnalysis {
  direction: TrendDirection;
  strength: TrendStrength;
  correlation: number;
  seasonality?: SeasonalityPattern;
  changePoints: ChangePoint[];
}

export interface Anomaly {
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: AnomalySeverity;
  type: AnomalyType;
  confidence: number;
}

export interface Forecast {
  timestamp: Date;
  predictedValue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  confidence: number;
}

export interface ChangePoint {
  timestamp: Date;
  beforeValue: number;
  afterValue: number;
  changeType: ChangeType;
  significance: number;
}

export interface SeasonalityPattern {
  type: SeasonalityType;
  period: number;
  strength: number;
  peaks: Date[];
  troughs: Date[];
}

// Enums
export enum MetricCategory {
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  CLINICAL = 'clinical',
  PATIENT_SATISFACTION = 'patient_satisfaction',
  STAFF_PERFORMANCE = 'staff_performance',
  RESOURCE_UTILIZATION = 'resource_utilization',
  QUALITY = 'quality',
  SAFETY = 'safety',
  EFFICIENCY = 'efficiency',
  CUSTOM = 'custom'
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  RATE = 'rate',
  RATIO = 'ratio',
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency',
  DURATION = 'duration',
  COUNT = 'count'
}

export enum MetricUnit {
  // Números
  NUMBER = 'number',
  COUNT = 'count',
  
  // Percentuais
  PERCENTAGE = 'percentage',
  RATIO = 'ratio',
  
  // Moeda
  BRL = 'BRL',
  USD = 'USD',
  EUR = 'EUR',
  
  // Tempo
  SECONDS = 'seconds',
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
  
  // Taxa
  PER_SECOND = 'per_second',
  PER_MINUTE = 'per_minute',
  PER_HOUR = 'per_hour',
  PER_DAY = 'per_day',
  
  // Outros
  BYTES = 'bytes',
  KILOBYTES = 'kilobytes',
  MEGABYTES = 'megabytes',
  GIGABYTES = 'gigabytes'
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
  VOLATILE = 'volatile',
  UNKNOWN = 'unknown'
}

export enum TrendStrength {
  VERY_WEAK = 'very_weak',
  WEAK = 'weak',
  MODERATE = 'moderate',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong'
}

export enum ComparisonPeriod {
  HOUR_OVER_HOUR = 'hour_over_hour',
  DAY_OVER_DAY = 'day_over_day',
  WEEK_OVER_WEEK = 'week_over_week',
  MONTH_OVER_MONTH = 'month_over_month',
  QUARTER_OVER_QUARTER = 'quarter_over_quarter',
  YEAR_OVER_YEAR = 'year_over_year'
}

export enum TargetType {
  MINIMUM = 'minimum',
  MAXIMUM = 'maximum',
  EXACT = 'exact',
  RANGE = 'range'
}

export enum TargetPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ComparisonOperator {
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_EQUAL = '>=',
  LESS_EQUAL = '<=',
  EQUALS = '=',
  NOT_EQUALS = '!='
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  IN = 'in',
  BETWEEN = 'between'
}

export enum AnalysisPeriod {
  LAST_HOUR = 'last_hour',
  LAST_24_HOURS = 'last_24_hours',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AnomalyType {
  SPIKE = 'spike',
  DIP = 'dip',
  TREND_CHANGE = 'trend_change',
  SEASONAL_DEVIATION = 'seasonal_deviation',
  OUTLIER = 'outlier'
}

export enum ChangeType {
  LEVEL_SHIFT = 'level_shift',
  TREND_CHANGE = 'trend_change',
  VARIANCE_CHANGE = 'variance_change'
}

export enum SeasonalityType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

// Tipos específicos para métricas da clínica
export interface ClinicalMetrics {
  patientSatisfaction: number;
  averageWaitTime: number;
  appointmentNoShowRate: number;
  bedOccupancyRate: number;
  averageLengthOfStay: number;
  readmissionRate: number;
  mortalityRate: number;
  infectionRate: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  netProfit: number;
  operatingMargin: number;
  averageRevenuePerPatient: number;
  costPerPatient: number;
  collectionRate: number;
  daysInAccountsReceivable: number;
  badDebtRate: number;
}

export interface OperationalMetrics {
  staffUtilizationRate: number;
  equipmentUtilizationRate: number;
  energyConsumption: number;
  maintenanceCosts: number;
  supplyCosts: number;
  wasteGeneration: number;
  patientThroughput: number;
  processEfficiency: number;
}