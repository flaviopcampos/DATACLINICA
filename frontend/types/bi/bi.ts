// Tipos principais para o sistema de Business Intelligence

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  data?: any;
  isLoading?: boolean;
  error?: string;
  lastUpdated?: Date;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetSize {
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetConfig {
  refreshInterval?: number; // em segundos
  filters?: FilterConfig[];
  chartType?: ChartType;
  dataSource?: string;
  aggregation?: AggregationType;
  timeRange?: TimeRange;
  customSettings?: Record<string, any>;
}

export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
  preset?: TimeRangePreset;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault?: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BIAlert {
  id: string;
  name: string;
  description?: string;
  condition: AlertCondition;
  threshold: AlertThreshold;
  isActive: boolean;
  recipients: string[];
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  metric: string;
  operator: ComparisonOperator;
  value: number;
  timeWindow?: number; // em minutos
}

export interface AlertThreshold {
  warning?: number;
  critical?: number;
}

export interface BIExport {
  id: string;
  type: ExportType;
  format: ExportFormat;
  data: any;
  filters?: FilterConfig[];
  createdAt: Date;
  userId: string;
  fileName: string;
  fileSize?: number;
}

// Enums
export enum WidgetType {
  METRIC_CARD = 'metric_card',
  CHART = 'chart',
  TABLE = 'table',
  KPI_INDICATOR = 'kpi_indicator',
  PROGRESS_BAR = 'progress_bar',
  GAUGE = 'gauge',
  MAP = 'map',
  CALENDAR = 'calendar',
  LIST = 'list',
  CUSTOM = 'custom'
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
  SCATTER = 'scatter',
  RADAR = 'radar',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap',
  FUNNEL = 'funnel'
}

export enum AggregationType {
  SUM = 'sum',
  AVG = 'avg',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  DISTINCT_COUNT = 'distinct_count',
  PERCENTAGE = 'percentage'
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null'
}

export enum TimeRangePreset {
  LAST_HOUR = 'last_hour',
  LAST_24_HOURS = 'last_24_hours',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_YEAR = 'last_year',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  THIS_QUARTER = 'this_quarter',
  THIS_YEAR = 'this_year',
  CUSTOM = 'custom'
}

export enum ComparisonOperator {
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_EQUAL = '>=',
  LESS_EQUAL = '<=',
  EQUALS = '=',
  NOT_EQUALS = '!='
}

export enum ExportType {
  DASHBOARD = 'dashboard',
  WIDGET = 'widget',
  REPORT = 'report',
  DATA = 'data'
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  PNG = 'png',
  SVG = 'svg'
}

// Tipos de resposta da API
export interface BIApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedBIResponse<T = any> extends BIApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para configuração do sistema BI
export interface BISystemConfig {
  refreshIntervals: number[];
  maxWidgetsPerDashboard: number;
  supportedChartTypes: ChartType[];
  supportedExportFormats: ExportFormat[];
  defaultTimeRange: TimeRangePreset;
  cacheSettings: {
    enabled: boolean;
    ttl: number; // em segundos
  };
  alertSettings: {
    maxAlertsPerUser: number;
    defaultRecipients: string[];
  };
}