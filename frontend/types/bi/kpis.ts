// Tipos para KPIs (Key Performance Indicators) do sistema de Business Intelligence

export interface KPI {
  id: string;
  name: string;
  description?: string;
  category: KPICategory;
  type: KPIType;
  currentValue: number;
  targetValue: number;
  unit: KPIUnit;
  trend: TrendDirection;
  status: KPIStatus;
  changeFromPrevious: {
    value: number;
    percentage: number;
    period: ComparisonPeriod;
  };
  thresholds: KPIThresholds;
  lastUpdated: Date;
  dataSource: string;
  formula?: string;
  isActive: boolean;
  priority: KPIPriority;
}

export interface KPIThresholds {
  excellent: {
    min?: number;
    max?: number;
    color: string;
  };
  good: {
    min?: number;
    max?: number;
    color: string;
  };
  warning: {
    min?: number;
    max?: number;
    color: string;
  };
  critical: {
    min?: number;
    max?: number;
    color: string;
  };
}

export interface KPIHistory {
  kpiId: string;
  timestamp: Date;
  value: number;
  targetValue?: number;
  context?: Record<string, any>;
}

export interface KPITarget {
  id: string;
  kpiId: string;
  targetValue: number;
  targetType: TargetType;
  period: TargetPeriod;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KPIAlert {
  id: string;
  kpiId: string;
  name: string;
  description?: string;
  condition: KPIAlertCondition;
  isActive: boolean;
  recipients: string[];
  channels: AlertChannel[];
  lastTriggered?: Date;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KPIAlertCondition {
  operator: ComparisonOperator;
  threshold: number;
  duration?: number; // em minutos
  severity: AlertSeverity;
  consecutiveViolations?: number;
}

export interface KPIDashboard {
  id: string;
  name: string;
  description?: string;
  kpis: string[]; // IDs dos KPIs
  layout: KPIDashboardLayout;
  filters: KPIFilter[];
  refreshInterval: number;
  isPublic: boolean;
  ownerId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KPIDashboardLayout {
  widgets: KPIWidgetLayout[];
  columns: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
}

export interface KPIWidgetLayout {
  kpiId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export interface KPIFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
  isRequired?: boolean;
}

// Tipos para análise de KPIs
export interface KPIAnalysis {
  kpiId: string;
  period: AnalysisPeriod;
  performance: KPIPerformance;
  trends: KPITrendAnalysis;
  benchmarks: KPIBenchmark[];
  recommendations: KPIRecommendation[];
  riskAssessment: KPIRiskAssessment;
}

export interface KPIPerformance {
  achievementRate: number; // % do target atingido
  consistencyScore: number; // 0-100
  improvementRate: number; // % de melhoria no período
  volatilityIndex: number; // 0-100
  reliabilityScore: number; // 0-100
}

export interface KPITrendAnalysis {
  direction: TrendDirection;
  strength: TrendStrength;
  acceleration: TrendAcceleration;
  seasonality?: SeasonalityPattern;
  cyclicality?: CyclicalPattern;
  changePoints: ChangePoint[];
}

export interface KPIBenchmark {
  type: BenchmarkType;
  value: number;
  source: string;
  industry?: string;
  region?: string;
  organizationSize?: string;
  lastUpdated: Date;
}

export interface KPIRecommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  expectedImpact: {
    value: number;
    confidence: number;
  };
  actionItems: ActionItem[];
  estimatedEffort: EffortLevel;
  timeframe: string;
  createdAt: Date;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  dueDate?: Date;
  status: ActionItemStatus;
  priority: ActionItemPriority;
}

export interface KPIRiskAssessment {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  probabilityOfFailure: number; // 0-1
  potentialImpact: ImpactLevel;
}

export interface RiskFactor {
  type: RiskType;
  description: string;
  probability: number; // 0-1
  impact: ImpactLevel;
  mitigation?: string;
}

export interface MitigationStrategy {
  id: string;
  title: string;
  description: string;
  effectiveness: number; // 0-1
  cost: CostLevel;
  timeToImplement: string;
  responsible?: string;
}

// Tipos específicos para KPIs da clínica
export interface ClinicalKPIs {
  patientSatisfactionScore: KPI;
  averageWaitTime: KPI;
  appointmentNoShowRate: KPI;
  bedOccupancyRate: KPI;
  averageLengthOfStay: KPI;
  readmissionRate: KPI;
  mortalityRate: KPI;
  infectionControlRate: KPI;
  medicationErrorRate: KPI;
  patientFallRate: KPI;
}

export interface FinancialKPIs {
  totalRevenue: KPI;
  netProfitMargin: KPI;
  operatingMargin: KPI;
  revenuePerPatient: KPI;
  costPerPatient: KPI;
  collectionRate: KPI;
  daysInAR: KPI;
  badDebtRate: KPI;
  cashFlowRatio: KPI;
  returnOnAssets: KPI;
}

export interface OperationalKPIs {
  staffUtilizationRate: KPI;
  equipmentUtilizationRate: KPI;
  energyEfficiency: KPI;
  supplyCostPerPatient: KPI;
  maintenanceCostRatio: KPI;
  patientThroughput: KPI;
  processEfficiencyScore: KPI;
  qualityScore: KPI;
  safetyScore: KPI;
  complianceScore: KPI;
}

export interface StaffKPIs {
  employeeSatisfaction: KPI;
  turnoverRate: KPI;
  absenteeismRate: KPI;
  trainingCompletionRate: KPI;
  productivityScore: KPI;
  performanceRating: KPI;
  overtimeRatio: KPI;
  recruitmentTime: KPI;
  retentionRate: KPI;
  skillsGapIndex: KPI;
}

// Enums
export enum KPICategory {
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  CLINICAL = 'clinical',
  PATIENT_EXPERIENCE = 'patient_experience',
  STAFF_PERFORMANCE = 'staff_performance',
  QUALITY = 'quality',
  SAFETY = 'safety',
  COMPLIANCE = 'compliance',
  STRATEGIC = 'strategic',
  CUSTOM = 'custom'
}

export enum KPIType {
  LEADING = 'leading',
  LAGGING = 'lagging',
  CONCURRENT = 'concurrent'
}

export enum KPIUnit {
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency',
  COUNT = 'count',
  RATIO = 'ratio',
  TIME = 'time',
  RATE = 'rate',
  SCORE = 'score',
  INDEX = 'index'
}

export enum TrendDirection {
  IMPROVING = 'improving',
  DECLINING = 'declining',
  STABLE = 'stable',
  VOLATILE = 'volatile',
  UNKNOWN = 'unknown'
}

export enum KPIStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  WARNING = 'warning',
  CRITICAL = 'critical',
  NO_DATA = 'no_data'
}

export enum KPIPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
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

export enum AlertChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  SLACK = 'slack',
  WEBHOOK = 'webhook'
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

export enum TrendStrength {
  VERY_WEAK = 'very_weak',
  WEAK = 'weak',
  MODERATE = 'moderate',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong'
}

export enum TrendAcceleration {
  ACCELERATING = 'accelerating',
  DECELERATING = 'decelerating',
  CONSTANT = 'constant'
}

export enum BenchmarkType {
  INDUSTRY_AVERAGE = 'industry_average',
  BEST_IN_CLASS = 'best_in_class',
  HISTORICAL_BEST = 'historical_best',
  PEER_GROUP = 'peer_group',
  REGULATORY = 'regulatory'
}

export enum RecommendationType {
  PROCESS_IMPROVEMENT = 'process_improvement',
  RESOURCE_OPTIMIZATION = 'resource_optimization',
  TRAINING = 'training',
  TECHNOLOGY_UPGRADE = 'technology_upgrade',
  POLICY_CHANGE = 'policy_change',
  STRATEGIC_INITIATIVE = 'strategic_initiative'
}

export enum RecommendationPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ActionItemStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum ActionItemPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum EffortLevel {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTENSIVE = 'extensive'
}

export enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum RiskType {
  OPERATIONAL = 'operational',
  FINANCIAL = 'financial',
  STRATEGIC = 'strategic',
  COMPLIANCE = 'compliance',
  REPUTATION = 'reputation',
  TECHNOLOGY = 'technology'
}

export enum ImpactLevel {
  NEGLIGIBLE = 'negligible',
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  SEVERE = 'severe'
}

export enum CostLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

// Interfaces auxiliares
export interface SeasonalityPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  strength: number;
  peaks: Date[];
  troughs: Date[];
}

export interface CyclicalPattern {
  period: number; // em dias
  amplitude: number;
  phase: number;
  confidence: number;
}

export interface ChangePoint {
  timestamp: Date;
  beforeValue: number;
  afterValue: number;
  changeType: 'level_shift' | 'trend_change' | 'variance_change';
  significance: number;
}