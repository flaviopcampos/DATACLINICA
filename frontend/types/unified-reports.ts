// Tipos unificados para relatórios - resolve conflitos entre reports.ts e bi/reports.ts

import { ChartType, FilterOperator } from './bi/bi';
import { VisualizationConfig, ChartOptions } from './bi/dashboard';

// ============================================================================
// TIPOS BASE UNIFICADOS
// ============================================================================

// Tipo base para relatórios simples (compatível com SavedReport)
export interface BaseReport {
  id: number | string;
  name: string;
  description?: string;
  report_type: ReportTypeSimple;
  created_at: string | Date;
  updated_at: string | Date;
}

// Tipo para relatórios salvos simples (mantém compatibilidade com SavedReport)
export interface SavedReport extends BaseReport {
  id: number;
  clinic_id: number;
  user_id: number;
  report_type: ReportTypeSimple;
  report_config: Record<string, any>;
  query_config?: Record<string, any>;
  visualization_config?: Record<string, any>;
  is_public: boolean;
  is_scheduled: boolean;
  schedule_config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Tipo para relatórios BI complexos (compatível com Report de bi/reports.ts)
export interface BIReport extends BaseReport {
  id: string;
  type: ReportType;
  category: ReportCategory;
  template?: ReportTemplate;
  dataSource: ReportDataSource;
  parameters: ReportParameter[];
  filters: ReportFilter[];
  sections: ReportSection[];
  layout: ReportLayout;
  formatting: ReportFormatting;
  schedule?: ReportSchedule;
  distribution: ReportDistribution;
  permissions: ReportPermissions;
  metadata: ReportMetadata;
  status: ReportStatus;
  tags: string[];
  ownerId: string;
  created_at: Date;
  updated_at: Date;
  lastGeneratedAt?: Date;
  nextScheduledAt?: Date;
}

// Alias para manter compatibilidade com código existente
export type Report = BIReport;

// ============================================================================
// TIPOS DE RELATÓRIO
// ============================================================================

export type ReportTypeSimple = 'administrative' | 'financial' | 'clinical' | 'bi';

export enum ReportType {
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  CLINICAL = 'clinical',
  ADMINISTRATIVE = 'administrative',
  CUSTOM = 'custom',
  DASHBOARD = 'dashboard',
  KPI = 'kpi',
  ANALYTICS = 'analytics'
}

export enum ReportCategory {
  REVENUE = 'revenue',
  EXPENSES = 'expenses',
  PATIENTS = 'patients',
  APPOINTMENTS = 'appointments',
  INVENTORY = 'inventory',
  STAFF = 'staff',
  COMPLIANCE = 'compliance',
  PERFORMANCE = 'performance'
}

export enum ReportStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  ERROR = 'error'
}

// ============================================================================
// TIPOS PARA CRIAÇÃO E ATUALIZAÇÃO
// ============================================================================

export interface SavedReportCreate {
  name: string;
  description?: string;
  report_type: ReportTypeSimple;
  report_config: Record<string, any>;
  query_config?: Record<string, any>;
  visualization_config?: Record<string, any>;
  is_public?: boolean;
  is_scheduled?: boolean;
  schedule_config?: Record<string, any>;
}

export interface SavedReportUpdate {
  name?: string;
  description?: string;
  report_type?: ReportTypeSimple;
  report_config?: Record<string, any>;
  query_config?: Record<string, any>;
  visualization_config?: Record<string, any>;
  is_public?: boolean;
  is_scheduled?: boolean;
  schedule_config?: Record<string, any>;
}

// ============================================================================
// TIPOS PARA EXECUÇÃO DE RELATÓRIOS
// ============================================================================

export interface ReportExecution {
  id: number;
  saved_report_id: number;
  executed_by?: number;
  execution_date: string;
  status: ExecutionStatus;
  file_path?: string;
  file_size?: number;
  execution_time_ms?: number;
  error_message?: string;
  parameters?: Record<string, any>;
}

export interface ReportExecutionCreate {
  saved_report_id: number;
  parameters?: Record<string, any>;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// ============================================================================
// TIPOS PARA FILTROS E PARÂMETROS
// ============================================================================

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  clinic_id?: number;
  user_id?: number;
  report_type?: ReportTypeSimple;
  status?: string;
  is_public?: boolean;
  is_scheduled?: boolean;
  search?: string;
  tags?: string[];
  [key: string]: any;
}

export interface ReportFilter {
  id: string;
  name: string;
  field: string;
  operator: FilterOperator;
  value: any;
  isRequired: boolean;
  isVisible: boolean;
  dependsOn?: string[];
}

export interface ReportParameter {
  id: string;
  name: string;
  label: string;
  description?: string;
  type: ParameterType;
  dataType: DataType;
  isRequired: boolean;
  defaultValue?: any;
  allowedValues?: ParameterValue[];
  validation: ParameterValidation;
  dependencies: string[];
  isVisible: boolean;
  order: number;
}

export interface ParameterValue {
  label: string;
  value: any;
  description?: string;
  isDefault?: boolean;
}

export interface ParameterValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidator?: string;
  errorMessage?: string;
}

export enum ParameterType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME = 'datetime',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  RANGE = 'range'
}

export enum DataType {
  STRING = 'string',
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  JSON = 'json'
}

// ============================================================================
// TIPOS PARA TEMPLATES E ESTRUTURAS (BI)
// ============================================================================

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  preview: string;
  structure: ReportStructure;
  defaultParameters: ReportParameter[];
  requiredDataSources: string[];
  estimatedGenerationTime: number;
  complexity: ReportComplexity;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating: number;
}

export interface ReportStructure {
  header: ReportHeaderConfig;
  body: ReportBodyConfig;
  footer: ReportFooterConfig;
  pageSettings: PageSettings;
  styles: ReportStyles;
}

export enum ReportComplexity {
  SIMPLE = 'simple',
  MEDIUM = 'medium',
  COMPLEX = 'complex'
}

// ============================================================================
// TIPOS PARA DADOS E FONTES (BI)
// ============================================================================

export interface ReportDataSource {
  type: DataSourceType;
  connections: DataConnection[];
  queries: DataQuery[];
  relationships: DataRelationship[];
  caching: CacheConfiguration;
}

export interface DataConnection {
  id: string;
  name: string;
  type: ConnectionType;
  config: ConnectionConfig;
  isActive: boolean;
  lastTested?: Date;
  testResult?: ConnectionTestResult;
}

export interface DataQuery {
  id: string;
  name: string;
  description?: string;
  sql?: string;
  endpoint?: string;
  method?: HttpMethod;
  parameters: QueryParameter[];
  filters: QueryFilter[];
  sorting: QuerySorting[];
  aggregations: QueryAggregation[];
  joins: QueryJoin[];
  limit?: number;
  timeout?: number;
  cacheKey?: string;
}

export enum DataSourceType {
  DATABASE = 'database',
  API = 'api',
  FILE = 'file',
  CACHE = 'cache'
}

export enum ConnectionType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  SQLITE = 'sqlite',
  REST_API = 'rest_api',
  GRAPHQL = 'graphql'
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

// ============================================================================
// TIPOS PARA SEÇÕES E LAYOUT (BI)
// ============================================================================

export interface ReportSection {
  id: string;
  name: string;
  type: SectionType;
  order: number;
  isVisible: boolean;
  content: SectionContent;
  layout: SectionLayout;
  styling: SectionStyling;
  pageBreak?: PageBreakConfig;
}

export interface SectionContent {
  title?: string;
  description?: string;
  data?: SectionData;
  visualizations?: Visualization[];
  tables?: TableConfig[];
  charts?: ChartConfig[];
  text?: TextContent[];
  images?: ImageContent[];
  customComponents?: CustomComponent[];
}

export interface Visualization {
  id: string;
  type: VisualizationType;
  title: string;
  description?: string;
  config: VisualizationConfig;
  data: any[];
  filters?: ReportFilter[];
  interactions?: ChartInteraction[];
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export enum SectionType {
  HEADER = 'header',
  BODY = 'body',
  FOOTER = 'footer',
  CHART = 'chart',
  TABLE = 'table',
  TEXT = 'text',
  IMAGE = 'image'
}

export enum VisualizationType {
  BAR_CHART = 'bar_chart',
  LINE_CHART = 'line_chart',
  PIE_CHART = 'pie_chart',
  TABLE = 'table',
  KPI = 'kpi',
  GAUGE = 'gauge'
}

// ============================================================================
// TIPOS AUXILIARES (placeholders para tipos complexos do BI)
// ============================================================================

// Estes tipos são placeholders para manter compatibilidade
// Devem ser expandidos conforme necessário
export interface ReportLayout {
  [key: string]: any;
}

export interface ReportFormatting {
  [key: string]: any;
}

export interface ReportSchedule {
  [key: string]: any;
}

export interface ReportDistribution {
  [key: string]: any;
}

export interface ReportPermissions {
  [key: string]: any;
}

export interface ReportMetadata {
  [key: string]: any;
}

export interface ReportHeaderConfig {
  [key: string]: any;
}

export interface ReportBodyConfig {
  [key: string]: any;
}

export interface ReportFooterConfig {
  [key: string]: any;
}

export interface PageSettings {
  [key: string]: any;
}

export interface ReportStyles {
  [key: string]: any;
}

export interface DataRelationship {
  [key: string]: any;
}

export interface CacheConfiguration {
  [key: string]: any;
}

export interface ConnectionConfig {
  [key: string]: any;
}

export interface ConnectionTestResult {
  [key: string]: any;
}

export interface QueryParameter {
  [key: string]: any;
}

export interface QueryFilter {
  [key: string]: any;
}

export interface QuerySorting {
  [key: string]: any;
}

export interface QueryAggregation {
  [key: string]: any;
}

export interface QueryJoin {
  [key: string]: any;
}

export interface SectionData {
  [key: string]: any;
}

export interface SectionLayout {
  [key: string]: any;
}

export interface SectionStyling {
  [key: string]: any;
}

export interface PageBreakConfig {
  [key: string]: any;
}

export interface TableConfig {
  [key: string]: any;
}

export interface ChartConfig {
  [key: string]: any;
}

export interface TextContent {
  [key: string]: any;
}

export interface ImageContent {
  [key: string]: any;
}

export interface CustomComponent {
  [key: string]: any;
}

export interface ChartInteraction {
  [key: string]: any;
}

// ============================================================================
// RE-EXPORTS PARA COMPATIBILIDADE
// ============================================================================

// Re-exporta tipos de reports.ts para manter compatibilidade
export type {
  CustomDashboard,
  CustomDashboardCreate,
  CustomDashboardUpdate,
  DashboardWidget,
  DashboardWidgetCreate,
  DashboardWidgetUpdate,
  PerformanceMetric,
  PerformanceMetricCreate,
  BIAlert,
  BIAlertCreate,
  AlertConfiguration,
  AlertConfigurationCreate,
  ReportRequest,
  DashboardData,
  KPIValue,
  ExportOptions,
  FinancialReport,
  OperationalReport,
  PatientReport
} from './reports';