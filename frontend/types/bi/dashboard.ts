// Tipos para Dashboard do sistema de Business Intelligence

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  type: DashboardType;
  category: DashboardCategory;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: GlobalFilter[];
  settings: DashboardSettings;
  permissions: DashboardPermissions;
  metadata: DashboardMetadata;
  isPublic: boolean;
  isTemplate: boolean;
  tags: string[];
  ownerId: string;
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt?: Date;
  viewCount: number;
}

export interface DashboardLayout {
  type: LayoutType;
  columns: number;
  rows?: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
  compactType?: CompactType;
  preventCollision?: boolean;
  isDraggable: boolean;
  isResizable: boolean;
  autoSize?: boolean;
  breakpoints: LayoutBreakpoints;
}

export interface LayoutBreakpoints {
  lg: number;
  md: number;
  sm: number;
  xs: number;
  xxs: number;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  dataSource: DataSourceConfig;
  visualization: VisualizationConfig;
  interactions: WidgetInteraction[];
  permissions: WidgetPermissions;
  isVisible: boolean;
  isLoading?: boolean;
  error?: string;
  lastUpdated?: Date;
  refreshInterval?: number;
}

export interface WidgetPosition {
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

export interface WidgetSize {
  width: number;
  height: number;
  aspectRatio?: number;
  responsive?: boolean;
}

export interface WidgetConfig {
  theme: WidgetTheme;
  colors: ColorScheme;
  fonts: FontConfig;
  borders: BorderConfig;
  spacing: SpacingConfig;
  animation: AnimationConfig;
  customCSS?: string;
  showTitle?: boolean;
  showDescription?: boolean;
  showLastUpdated?: boolean;
  allowFullscreen?: boolean;
  allowExport?: boolean;
}

export interface DataSourceConfig {
  type: DataSourceType;
  endpoint?: string;
  query?: string;
  parameters?: Record<string, any>;
  filters?: DataFilter[];
  aggregations?: DataAggregation[];
  sorting?: DataSorting[];
  limit?: number;
  offset?: number;
  cacheSettings?: CacheSettings;
}

export interface VisualizationConfig {
  chartType: ChartType;
  chartOptions: ChartOptions;
  axes?: AxesConfig;
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  annotations?: AnnotationConfig[];
  interactions?: InteractionConfig;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins?: Record<string, any>;
  scales?: Record<string, any>;
  elements?: Record<string, any>;
  layout?: Record<string, any>;
}

export interface AxesConfig {
  x: AxisConfig;
  y: AxisConfig;
  y2?: AxisConfig;
}

export interface AxisConfig {
  type: AxisType;
  position: AxisPosition;
  title?: string;
  min?: number;
  max?: number;
  stepSize?: number;
  format?: string;
  grid?: GridConfig;
  ticks?: TickConfig;
}

export interface LegendConfig {
  display: boolean;
  position: LegendPosition;
  align?: LegendAlign;
  labels?: LegendLabelConfig;
}

export interface TooltipConfig {
  enabled: boolean;
  mode: TooltipMode;
  intersect: boolean;
  position: TooltipPosition;
  backgroundColor?: string;
  titleColor?: string;
  bodyColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface AnnotationConfig {
  type: AnnotationType;
  value: any;
  label?: string;
  color?: string;
  borderColor?: string;
  backgroundColor?: string;
}

export interface InteractionConfig {
  hover?: HoverConfig;
  click?: ClickConfig;
  zoom?: ZoomConfig;
  pan?: PanConfig;
}

export interface GlobalFilter {
  id: string;
  name: string;
  type: FilterType;
  field: string;
  operator: FilterOperator;
  value: any;
  options?: FilterOption[];
  isRequired: boolean;
  isVisible: boolean;
  defaultValue?: any;
  dependencies?: string[]; // IDs de outros filtros
}

export interface FilterOption {
  label: string;
  value: any;
  isDefault?: boolean;
}

export interface DashboardSettings {
  theme: DashboardTheme;
  autoRefresh: AutoRefreshSettings;
  export: ExportSettings;
  notifications: NotificationSettings;
  performance: PerformanceSettings;
  accessibility: AccessibilitySettings;
}

export interface AutoRefreshSettings {
  enabled: boolean;
  interval: number; // em segundos
  pauseOnInactive: boolean;
  showCountdown: boolean;
}

export interface ExportSettings {
  allowPDF: boolean;
  allowImage: boolean;
  allowData: boolean;
  includeFilters: boolean;
  includeTimestamp: boolean;
  watermark?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  channels: NotificationChannel[];
  triggers: NotificationTrigger[];
}

export interface PerformanceSettings {
  lazyLoading: boolean;
  virtualScrolling: boolean;
  dataLimit: number;
  cacheEnabled: boolean;
  cacheTTL: number; // em segundos
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  colorBlindFriendly: boolean;
}

export interface DashboardPermissions {
  canView: string[];
  canEdit: string[];
  canDelete: string[];
  canShare: string[];
  canExport: string[];
  canDuplicate: string[];
}

export interface WidgetPermissions {
  canView: string[];
  canEdit: string[];
  canDelete: string[];
  canMove: string[];
  canResize: string[];
}

export interface DashboardMetadata {
  version: string;
  author: string;
  lastModifiedBy: string;
  changeLog: ChangeLogEntry[];
  usage: UsageStatistics;
  performance: PerformanceMetrics;
}

export interface ChangeLogEntry {
  timestamp: Date;
  userId: string;
  action: ChangeAction;
  description: string;
  details?: Record<string, any>;
}

export interface UsageStatistics {
  totalViews: number;
  uniqueViewers: number;
  averageViewDuration: number;
  lastAccessed: Date;
  popularWidgets: string[];
  exportCount: number;
}

export interface PerformanceMetrics {
  averageLoadTime: number;
  averageRenderTime: number;
  errorRate: number;
  cacheHitRate: number;
  dataFreshness: number; // em segundos
}

// Tipos para templates de dashboard
export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: DashboardCategory;
  preview: string; // URL da imagem de preview
  config: Dashboard;
  requiredDataSources: string[];
  tags: string[];
  difficulty: TemplateDifficulty;
  estimatedSetupTime: number; // em minutos
  popularity: number;
  rating: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para colaboração
export interface DashboardComment {
  id: string;
  dashboardId: string;
  widgetId?: string;
  userId: string;
  content: string;
  position?: CommentPosition;
  isResolved: boolean;
  replies: DashboardComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentPosition {
  x: number;
  y: number;
  widgetId?: string;
}

export interface DashboardShare {
  id: string;
  dashboardId: string;
  sharedBy: string;
  sharedWith: string;
  permissions: SharePermissions;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface SharePermissions {
  canView: boolean;
  canEdit: boolean;
  canComment: boolean;
  canShare: boolean;
  canExport: boolean;
}

// Enums
export enum DashboardType {
  EXECUTIVE = 'executive',
  OPERATIONAL = 'operational',
  ANALYTICAL = 'analytical',
  TACTICAL = 'tactical',
  STRATEGIC = 'strategic',
  CUSTOM = 'custom'
}

export enum DashboardCategory {
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  CLINICAL = 'clinical',
  PATIENT_EXPERIENCE = 'patient_experience',
  STAFF_PERFORMANCE = 'staff_performance',
  QUALITY = 'quality',
  SAFETY = 'safety',
  COMPLIANCE = 'compliance',
  OVERVIEW = 'overview',
  CUSTOM = 'custom'
}

export enum LayoutType {
  GRID = 'grid',
  FLEX = 'flex',
  ABSOLUTE = 'absolute',
  RESPONSIVE = 'responsive'
}

export enum CompactType {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  NONE = 'none'
}

export enum WidgetType {
  METRIC_CARD = 'metric_card',
  KPI_INDICATOR = 'kpi_indicator',
  CHART = 'chart',
  TABLE = 'table',
  GAUGE = 'gauge',
  PROGRESS_BAR = 'progress_bar',
  HEATMAP = 'heatmap',
  MAP = 'map',
  CALENDAR = 'calendar',
  LIST = 'list',
  TEXT = 'text',
  IMAGE = 'image',
  IFRAME = 'iframe',
  CUSTOM = 'custom'
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  COLUMN = 'column',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
  SCATTER = 'scatter',
  BUBBLE = 'bubble',
  RADAR = 'radar',
  POLAR = 'polar',
  TREEMAP = 'treemap',
  SUNBURST = 'sunburst',
  SANKEY = 'sankey',
  FUNNEL = 'funnel',
  WATERFALL = 'waterfall'
}

export enum DataSourceType {
  API = 'api',
  DATABASE = 'database',
  FILE = 'file',
  REAL_TIME = 'real_time',
  STATIC = 'static',
  CALCULATED = 'calculated'
}

export enum FilterType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DATE_RANGE = 'date_range',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  BOOLEAN = 'boolean',
  RANGE = 'range'
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
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null'
}

export enum DashboardTheme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
  CUSTOM = 'custom'
}

export enum WidgetTheme {
  DEFAULT = 'default',
  MINIMAL = 'minimal',
  MODERN = 'modern',
  CLASSIC = 'classic',
  CUSTOM = 'custom'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  SLACK = 'slack',
  WEBHOOK = 'webhook'
}

export enum NotificationTrigger {
  DATA_CHANGE = 'data_change',
  THRESHOLD_BREACH = 'threshold_breach',
  ERROR = 'error',
  SCHEDULE = 'schedule',
  MANUAL = 'manual'
}

export enum ChangeAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  MOVE = 'move',
  RESIZE = 'resize',
  CONFIGURE = 'configure',
  SHARE = 'share',
  EXPORT = 'export'
}

export enum TemplateDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum AxisType {
  LINEAR = 'linear',
  LOGARITHMIC = 'logarithmic',
  CATEGORY = 'category',
  TIME = 'time'
}

export enum AxisPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right'
}

export enum LegendPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  NONE = 'none'
}

export enum LegendAlign {
  START = 'start',
  CENTER = 'center',
  END = 'end'
}

export enum TooltipMode {
  POINT = 'point',
  NEAREST = 'nearest',
  INDEX = 'index',
  DATASET = 'dataset',
  X = 'x',
  Y = 'y'
}

export enum TooltipPosition {
  AVERAGE = 'average',
  NEAREST = 'nearest'
}

export enum AnnotationType {
  LINE = 'line',
  BOX = 'box',
  POINT = 'point',
  LABEL = 'label'
}

// Interfaces auxiliares
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: number;
  lineHeight: number;
}

export interface BorderConfig {
  width: number;
  style: string;
  color: string;
  radius: number;
}

export interface SpacingConfig {
  padding: number;
  margin: number;
  gap: number;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
  delay: number;
}

export interface DataFilter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface DataAggregation {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
  alias?: string;
}

export interface DataSorting {
  field: string;
  direction: 'asc' | 'desc';
}

export interface CacheSettings {
  enabled: boolean;
  ttl: number; // em segundos
  key?: string;
}

export interface GridConfig {
  display: boolean;
  color: string;
  lineWidth: number;
}

export interface TickConfig {
  display: boolean;
  color: string;
  font: FontConfig;
  maxTicksLimit?: number;
}

export interface LegendLabelConfig {
  usePointStyle: boolean;
  font: FontConfig;
  color: string;
}

export interface HoverConfig {
  mode: TooltipMode;
  intersect: boolean;
  animationDuration: number;
}

export interface ClickConfig {
  enabled: boolean;
  action: 'drill_down' | 'filter' | 'navigate' | 'custom';
  target?: string;
}

export interface ZoomConfig {
  enabled: boolean;
  mode: 'x' | 'y' | 'xy';
  limits?: {
    x?: { min: number; max: number };
    y?: { min: number; max: number };
  };
}

export interface PanConfig {
  enabled: boolean;
  mode: 'x' | 'y' | 'xy';
  rangeMin?: number;
  rangeMax?: number;
}

export interface WidgetInteraction {
  type: InteractionType;
  config: Record<string, any>;
}

export enum InteractionType {
  CLICK = 'click',
  HOVER = 'hover',
  DRILL_DOWN = 'drill_down',
  FILTER = 'filter',
  NAVIGATE = 'navigate',
  EXPORT = 'export',
  REFRESH = 'refresh'
}