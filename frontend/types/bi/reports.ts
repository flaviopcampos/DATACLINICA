// Tipos para Relatórios do sistema de Business Intelligence

// Imports necessários
import { ChartType, FilterOperator } from './bi';
import { VisualizationConfig, ChartOptions } from './dashboard';

export interface Report {
  id: string;
  name: string;
  description?: string;
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
  createdAt: Date;
  updatedAt: Date;
  lastGeneratedAt?: Date;
  nextScheduledAt?: Date;
}

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
  dependencies: string[]; // IDs de outros parâmetros
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

export interface SectionData {
  queryId: string;
  transformations: DataTransformation[];
  grouping?: DataGrouping;
  calculations?: DataCalculation[];
  formatting?: DataFormatting;
}

// Tipos para visualizações
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

export interface TableConfig {
  id: string;
  title?: string;
  columns: TableColumn[];
  rows?: TableRow[];
  pagination?: PaginationConfig;
  sorting?: TableSorting;
  filtering?: TableFiltering;
  styling?: TableStyling;
  export?: ExportConfig;
}

export interface TableColumn {
  id: string;
  name: string;
  label: string;
  type: ColumnType;
  width?: number;
  alignment: TextAlignment;
  formatting?: ColumnFormatting;
  aggregation?: AggregationType;
  isVisible: boolean;
  isSortable: boolean;
  isFilterable: boolean;
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  title?: string;
  data: ChartData;
  options: ChartOptions;
  styling?: ChartStyling;
  interactions?: ChartInteraction[];
}

export interface ReportLayout {
  orientation: PageOrientation;
  size: PageSize;
  margins: PageMargins;
  columns: number;
  columnGap: number;
  header: HeaderConfig;
  footer: FooterConfig;
  watermark?: WatermarkConfig;
}

export interface ReportFormatting {
  theme: ReportTheme;
  fonts: FontConfiguration;
  colors: ColorConfiguration;
  spacing: SpacingConfiguration;
  borders: BorderConfiguration;
  customCSS?: string;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: ScheduleFrequency;
  interval: number;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  time: string; // HH:mm format
  timezone: string;
  startDate?: Date;
  endDate?: Date;
  lastRun?: Date;
  nextRun?: Date;
  isActive: boolean;
}

export interface ReportDistribution {
  enabled: boolean;
  channels: DistributionChannel[];
  recipients: ReportRecipient[];
  formats: ExportFormat[];
  delivery: DeliveryConfig;
  notifications: DistributionNotification[];
}

export interface DistributionChannel {
  type: ChannelType;
  config: ChannelConfig;
  isActive: boolean;
}

export interface ReportRecipient {
  id: string;
  type: RecipientType;
  address: string;
  name?: string;
  preferences: RecipientPreferences;
  isActive: boolean;
}

export interface ReportPermissions {
  canView: string[];
  canEdit: string[];
  canDelete: string[];
  canSchedule: string[];
  canDistribute: string[];
  canExport: string[];
  canDuplicate: string[];
}

export interface ReportMetadata {
  version: string;
  author: string;
  lastModifiedBy: string;
  changeLog: ReportChangeLog[];
  usage: ReportUsage;
  performance: ReportPerformance;
  dependencies: ReportDependency[];
}

export interface ReportChangeLog {
  timestamp: Date;
  userId: string;
  action: ChangeAction;
  description: string;
  version: string;
  details?: Record<string, any>;
}

export interface ReportUsage {
  totalGenerations: number;
  uniqueUsers: number;
  averageGenerationTime: number;
  lastGenerated: Date;
  popularFormats: ExportFormat[];
  errorRate: number;
}

export interface ReportPerformance {
  averageExecutionTime: number;
  averageDataFetchTime: number;
  averageRenderTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ReportDependency {
  type: DependencyType;
  name: string;
  version?: string;
  isRequired: boolean;
  status: DependencyStatus;
}

// Tipos para execução de relatórios
export interface ReportExecution {
  id: string;
  reportId: string;
  userId: string;
  parameters: Record<string, any>;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  result?: ReportResult;
  error?: ExecutionError;
  logs: ExecutionLog[];
  metrics: ExecutionMetrics;
}

export interface ReportResult {
  format: ExportFormat;
  size: number;
  pages: number;
  records: number;
  url?: string;
  data?: any;
  metadata: ResultMetadata;
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: string;
  stack?: string;
  timestamp: Date;
}

export interface ExecutionLog {
  timestamp: Date;
  level: LogLevel;
  message: string;
  details?: Record<string, any>;
}

export interface ExecutionMetrics {
  dataFetchTime: number;
  processingTime: number;
  renderTime: number;
  memoryPeak: number;
  recordsProcessed: number;
  queriesExecuted: number;
}

// Enums
export enum ReportType {
  TABULAR = 'tabular',
  ANALYTICAL = 'analytical',
  DASHBOARD = 'dashboard',
  FORM = 'form',
  INVOICE = 'invoice',
  CERTIFICATE = 'certificate',
  LABEL = 'label',
  CUSTOM = 'custom'
}

export enum ReportCategory {
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  CLINICAL = 'clinical',
  ADMINISTRATIVE = 'administrative',
  REGULATORY = 'regulatory',
  QUALITY = 'quality',
  PATIENT = 'patient',
  STAFF = 'staff',
  INVENTORY = 'inventory',
  CUSTOM = 'custom'
}

export enum ReportComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  ADVANCED = 'advanced'
}

export enum DataSourceType {
  DATABASE = 'database',
  API = 'api',
  FILE = 'file',
  SPREADSHEET = 'spreadsheet',
  WEB_SERVICE = 'web_service',
  REAL_TIME = 'real_time'
}

export enum ConnectionType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  MONGODB = 'mongodb',
  REST_API = 'rest_api',
  GRAPHQL = 'graphql',
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json'
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export enum ParameterType {
  INPUT = 'input',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  DATE = 'date',
  DATE_RANGE = 'date_range',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SLIDER = 'slider',
  FILE = 'file'
}

export enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
  ARRAY = 'array',
  OBJECT = 'object'
}

export enum SectionType {
  HEADER = 'header',
  FOOTER = 'footer',
  TITLE = 'title',
  SUMMARY = 'summary',
  DATA = 'data',
  CHART = 'chart',
  TABLE = 'table',
  TEXT = 'text',
  IMAGE = 'image',
  PAGE_BREAK = 'page_break',
  CUSTOM = 'custom'
}

export enum VisualizationType {
  CHART = 'chart',
  TABLE = 'table',
  GAUGE = 'gauge',
  SPARKLINE = 'sparkline',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap',
  MAP = 'map',
  CUSTOM = 'custom'
}

export enum ColumnType {
  TEXT = 'text',
  NUMBER = 'number',
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
  DATE = 'date',
  DATETIME = 'datetime',
  BOOLEAN = 'boolean',
  IMAGE = 'image',
  LINK = 'link',
  CUSTOM = 'custom'
}

export enum TextAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify'
}

export enum AggregationType {
  SUM = 'sum',
  AVG = 'avg',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  MODE = 'mode',
  STDDEV = 'stddev',
  VARIANCE = 'variance'
}

export enum PageOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

export enum PageSize {
  A4 = 'A4',
  A3 = 'A3',
  A5 = 'A5',
  LETTER = 'letter',
  LEGAL = 'legal',
  TABLOID = 'tabloid',
  CUSTOM = 'custom'
}

export enum ReportTheme {
  DEFAULT = 'default',
  MINIMAL = 'minimal',
  CORPORATE = 'corporate',
  MODERN = 'modern',
  CLASSIC = 'classic',
  MEDICAL = 'medical',
  CUSTOM = 'custom'
}

export enum ScheduleFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export enum ChannelType {
  EMAIL = 'email',
  FTP = 'ftp',
  SFTP = 'sftp',
  HTTP = 'http',
  WEBHOOK = 'webhook',
  CLOUD_STORAGE = 'cloud_storage',
  PRINTER = 'printer'
}

export enum RecipientType {
  USER = 'user',
  GROUP = 'group',
  ROLE = 'role',
  EMAIL = 'email',
  EXTERNAL = 'external'
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  XML = 'xml',
  HTML = 'html',
  WORD = 'word',
  POWERPOINT = 'powerpoint'
}

export enum ReportStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  ERROR = 'error'
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export enum DependencyType {
  DATA_SOURCE = 'data_source',
  TEMPLATE = 'template',
  COMPONENT = 'component',
  LIBRARY = 'library',
  SERVICE = 'service'
}

export enum DependencyStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  DEPRECATED = 'deprecated',
  ERROR = 'error'
}

export enum ChangeAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  DUPLICATE = 'duplicate',
  SCHEDULE = 'schedule',
  EXECUTE = 'execute',
  EXPORT = 'export',
  SHARE = 'share'
}

// Interfaces auxiliares
export interface ConnectionConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  url?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
  ssl?: boolean;
  [key: string]: any;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
  timestamp: Date;
}

export interface QueryParameter {
  name: string;
  type: DataType;
  value?: any;
  isRequired: boolean;
}

export interface QueryFilter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface QuerySorting {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryAggregation {
  field: string;
  function: AggregationType;
  alias?: string;
}

export interface QueryJoin {
  type: 'inner' | 'left' | 'right' | 'full';
  table: string;
  on: string;
}

export interface SectionLayout {
  width: string;
  height?: string;
  padding: string;
  margin: string;
  alignment: TextAlignment;
  columns?: number;
  columnGap?: string;
}

export interface SectionStyling {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;
  boxShadow?: string;
}

export interface PageBreakConfig {
  before: boolean;
  after: boolean;
  inside: 'avoid' | 'auto';
}

export interface DataTransformation {
  type: 'filter' | 'sort' | 'group' | 'aggregate' | 'calculate' | 'format';
  config: Record<string, any>;
}

export interface DataGrouping {
  fields: string[];
  aggregations: QueryAggregation[];
}

export interface DataCalculation {
  name: string;
  expression: string;
  type: DataType;
}

export interface DataFormatting {
  numberFormat?: string;
  dateFormat?: string;
  currencySymbol?: string;
  decimalPlaces?: number;
  thousandsSeparator?: string;
}

export interface VisualizationData {
  queryId: string;
  fields: string[];
  filters?: QueryFilter[];
  sorting?: QuerySorting[];
  limit?: number;
}

export interface VisualizationInteraction {
  type: 'click' | 'hover' | 'drill_down';
  action: string;
  target?: string;
}

export interface TableRow {
  id: string;
  data: Record<string, any>;
  styling?: RowStyling;
}

export interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
  showPageNumbers: boolean;
  showPageSizeSelector: boolean;
}

export interface TableSorting {
  enabled: boolean;
  defaultField?: string;
  defaultDirection?: 'asc' | 'desc';
  multiColumn: boolean;
}

export interface TableFiltering {
  enabled: boolean;
  showFilterRow: boolean;
  globalSearch: boolean;
}

export interface TableStyling {
  headerStyle?: CellStyling;
  rowStyle?: CellStyling;
  alternateRowStyle?: CellStyling;
  borderStyle?: BorderStyling;
}

export interface ColumnFormatting {
  format?: string;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
  showThousandsSeparator?: boolean;
}

export interface ChartData {
  queryId: string;
  xField: string;
  yFields: string[];
  groupField?: string;
  filters?: QueryFilter[];
}

export interface ChartStyling {
  colors: string[];
  backgroundColor?: string;
  borderColor?: string;
  gridColor?: string;
  textColor?: string;
}

export interface ChartInteraction {
  type: 'click' | 'hover' | 'zoom' | 'pan';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface HeaderConfig {
  enabled: boolean;
  height: number;
  content: string;
  alignment: TextAlignment;
  showPageNumber: boolean;
  showDate: boolean;
}

export interface FooterConfig {
  enabled: boolean;
  height: number;
  content: string;
  alignment: TextAlignment;
  showPageNumber: boolean;
  showDate: boolean;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  opacity: number;
  rotation: number;
  fontSize: number;
  color: string;
}

export interface FontConfiguration {
  primary: FontConfig;
  secondary: FontConfig;
  heading: FontConfig;
  body: FontConfig;
  caption: FontConfig;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: number;
  style: 'normal' | 'italic';
  lineHeight: number;
}

export interface ColorConfiguration {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface SpacingConfiguration {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

export interface BorderConfiguration {
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  radius: number;
}

export interface DeliveryConfig {
  subject?: string;
  message?: string;
  attachmentName?: string;
  compression?: boolean;
  encryption?: boolean;
  priority: 'low' | 'normal' | 'high';
}

export interface DistributionNotification {
  type: 'success' | 'failure' | 'warning';
  recipients: string[];
  template: string;
}

export interface ChannelConfig {
  [key: string]: any;
}

export interface RecipientPreferences {
  formats: ExportFormat[];
  frequency: ScheduleFrequency;
  timezone: string;
  language: string;
}

export interface ResultMetadata {
  generatedAt: Date;
  parameters: Record<string, any>;
  dataVersion: string;
  reportVersion: string;
  executionTime: number;
}

export interface CacheConfiguration {
  enabled: boolean;
  ttl: number;
  key?: string;
  invalidateOn?: string[];
}

export interface DataRelationship {
  from: string;
  to: string;
  type: 'one_to_one' | 'one_to_many' | 'many_to_many';
  foreignKey: string;
  primaryKey: string;
}

export interface ReportHeaderConfig {
  enabled: boolean;
  template: string;
  height: number;
  data?: Record<string, any>;
}

export interface ReportBodyConfig {
  template: string;
  sections: string[];
  data?: Record<string, any>;
}

export interface ReportFooterConfig {
  enabled: boolean;
  template: string;
  height: number;
  data?: Record<string, any>;
}

export interface PageSettings {
  size: PageSize;
  orientation: PageOrientation;
  margins: PageMargins;
  header: HeaderConfig;
  footer: FooterConfig;
}

export interface ReportStyles {
  fonts: FontConfiguration;
  colors: ColorConfiguration;
  spacing: SpacingConfiguration;
  borders: BorderConfiguration;
}

export interface TextContent {
  id: string;
  content: string;
  formatting: TextFormatting;
}

export interface ImageContent {
  id: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  alignment: TextAlignment;
}

export interface CustomComponent {
  id: string;
  type: string;
  config: Record<string, any>;
  data?: any;
}

export interface TextFormatting {
  font: FontConfig;
  color: string;
  alignment: TextAlignment;
  lineHeight: number;
  letterSpacing: number;
}

export interface CellStyling {
  backgroundColor?: string;
  color?: string;
  font?: FontConfig;
  padding?: string;
  textAlign?: TextAlignment;
}

export interface RowStyling {
  backgroundColor?: string;
  color?: string;
  height?: number;
}

export interface BorderStyling {
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
}

export interface ExportConfig {
  enabled: boolean;
  formats: ExportFormat[];
  filename?: string;
  includeHeaders: boolean;
}