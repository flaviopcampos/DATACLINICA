// Componente base para widgets do dashboard

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MoreVertical,
  Settings,
  Copy,
  Trash2,
  RefreshCw,
  Maximize2,
  Minimize2,
  Move,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import type {
  DashboardWidget as WidgetType,
  WidgetPosition,
  WidgetSize,
  WidgetConfig,
  WidgetTheme
} from '@/types/bi/dashboard';

export interface DashboardWidgetProps {
  widget: WidgetType;
  isSelected?: boolean;
  isEditMode?: boolean;
  isDragging?: boolean;
  isResizing?: boolean;
  showGrid?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  theme?: WidgetTheme;
  className?: string;
  
  // Event handlers
  onSelect?: (widget: WidgetType) => void;
  onUpdate?: (widgetId: string, updates: Partial<WidgetType>) => void;
  onDelete?: (widgetId: string) => void;
  onDuplicate?: (widgetId: string) => void;
  onConfigure?: (widgetId: string) => void;
  onRefresh?: (widgetId: string) => void;
  onMove?: (widgetId: string, position: WidgetPosition) => void;
  onResize?: (widgetId: string, size: WidgetSize) => void;
  onToggleVisibility?: (widgetId: string) => void;
  onMaximize?: (widgetId: string) => void;
  onMinimize?: (widgetId: string) => void;
  
  // Drag & Drop
  onDragStart?: (widget: WidgetType, event: React.DragEvent) => void;
  onDragEnd?: (widget: WidgetType, event: React.DragEvent) => void;
  onDrop?: (widget: WidgetType, position: WidgetPosition) => void;
  
  // Children
  children?: React.ReactNode;
}

export interface WidgetData {
  value?: any;
  data?: any[];
  loading?: boolean;
  error?: string | null;
  lastUpdated?: Date;
  metadata?: Record<string, any>;
}

export interface WidgetHeaderProps {
  widget: WidgetType;
  isSelected?: boolean;
  isEditMode?: boolean;
  showActions?: boolean;
  onConfigure?: () => void;
  onRefresh?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
}

export interface WidgetContentProps {
  widget: WidgetType;
  data: WidgetData;
  theme?: WidgetTheme;
  className?: string;
}

export interface WidgetFooterProps {
  widget: WidgetType;
  data: WidgetData;
  showLastUpdated?: boolean;
  showMetadata?: boolean;
}

// Widget Header Component
function WidgetHeader({
  widget,
  isSelected,
  isEditMode,
  showActions = true,
  onConfigure,
  onRefresh,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  onMaximize,
  onMinimize
}: WidgetHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex items-center space-x-2">
        <CardTitle className="text-sm font-medium">
          {widget.title}
        </CardTitle>
        {widget.subtitle && (
          <span className="text-xs text-muted-foreground">
            {widget.subtitle}
          </span>
        )}
        {widget.category && (
          <Badge variant="secondary" className="text-xs">
            {widget.category}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        {isSelected && (
          <Badge variant="outline" className="text-xs">
            Selecionado
          </Badge>
        )}
        
        {!widget.isVisible && (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
        
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRefresh && (
                <DropdownMenuItem onClick={onRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </DropdownMenuItem>
              )}
              {onConfigure && (
                <DropdownMenuItem onClick={onConfigure}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onToggleVisibility && (
                <DropdownMenuItem onClick={onToggleVisibility}>
                  {widget.isVisible ? (
                    <><EyeOff className="mr-2 h-4 w-4" /> Ocultar</>
                  ) : (
                    <><Eye className="mr-2 h-4 w-4" /> Mostrar</>
                  )}
                </DropdownMenuItem>
              )}
              {onMaximize && (
                <DropdownMenuItem onClick={onMaximize}>
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Maximizar
                </DropdownMenuItem>
              )}
              {onMinimize && (
                <DropdownMenuItem onClick={onMinimize}>
                  <Minimize2 className="mr-2 h-4 w-4" />
                  Minimizar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDuplicate && (
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </DropdownMenuItem>
              )}
              {isEditMode && onDelete && (
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </CardHeader>
  );
}

// Widget Content Component
function WidgetContent({ widget, data, theme, className }: WidgetContentProps) {
  if (data.loading) {
    return (
      <CardContent className={cn("space-y-2", className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </CardContent>
    );
  }

  if (data.error) {
    return (
      <CardContent className={cn("flex items-center justify-center p-6", className)}>
        <div className="text-center space-y-2">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-sm text-muted-foreground">
            Erro ao carregar dados
          </p>
          <p className="text-xs text-muted-foreground">
            {data.error}
          </p>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className={cn("p-6", className)}>
      {/* Content will be rendered by specific widget implementations */}
      <div className="widget-content" data-widget-type={widget.type}>
        {/* Placeholder for widget-specific content */}
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Widget: {widget.type}</p>
          {data.value !== undefined && (
            <p className="text-2xl font-bold mt-2">{data.value}</p>
          )}
          {data.data && Array.isArray(data.data) && (
            <p className="text-xs mt-1">{data.data.length} registros</p>
          )}
        </div>
      </div>
    </CardContent>
  );
}

// Widget Footer Component
function WidgetFooter({ 
  widget, 
  data, 
  showLastUpdated = true, 
  showMetadata = false 
}: WidgetFooterProps) {
  if (!showLastUpdated && !showMetadata) return null;

  return (
    <div className="px-6 pb-4 pt-0">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {showLastUpdated && data.lastUpdated && (
          <span>
            Atualizado: {data.lastUpdated.toLocaleTimeString()}
          </span>
        )}
        {showMetadata && data.metadata && (
          <span>
            {Object.keys(data.metadata).length} metadados
          </span>
        )}
      </div>
    </div>
  );
}

// Main Dashboard Widget Component
export function DashboardWidget({
  widget,
  isSelected = false,
  isEditMode = false,
  isDragging = false,
  isResizing = false,
  showGrid = false,
  snapToGrid = true,
  gridSize = 8,
  theme = 'light',
  className,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onConfigure,
  onRefresh,
  onMove,
  onResize,
  onToggleVisibility,
  onMaximize,
  onMinimize,
  onDragStart,
  onDragEnd,
  onDrop,
  children
}: DashboardWidgetProps) {
  const [data, setData] = useState<WidgetData>({
    loading: true,
    error: null,
    lastUpdated: new Date()
  });
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Mock data loading effect
  useEffect(() => {
    const loadData = async () => {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on widget type
        let mockData: any;
        switch (widget.type) {
          case 'metric':
            mockData = {
              value: Math.floor(Math.random() * 1000),
              data: [],
              metadata: { unit: 'unidades', trend: 'up' }
            };
            break;
          case 'chart':
            mockData = {
              data: Array.from({ length: 7 }, (_, i) => ({
                date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                value: Math.floor(Math.random() * 100)
              })),
              metadata: { chartType: 'line' }
            };
            break;
          case 'table':
            mockData = {
              data: Array.from({ length: 5 }, (_, i) => ({
                id: i + 1,
                name: `Item ${i + 1}`,
                value: Math.floor(Math.random() * 100)
              })),
              metadata: { totalRows: 5 }
            };
            break;
          default:
            mockData = {
              value: 'N/A',
              data: [],
              metadata: {}
            };
        }
        
        setData({
          ...mockData,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }));
      }
    };

    loadData();
  }, [widget.type, widget.id]);

  // Handle widget selection
  const handleSelect = useCallback(() => {
    if (onSelect && isEditMode) {
      onSelect(widget);
    }
  }, [onSelect, isEditMode, widget]);

  // Handle drag start
  const handleDragStart = useCallback((event: React.DragEvent) => {
    if (!widget.isDraggable || !isEditMode) {
      event.preventDefault();
      return;
    }

    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }

    event.dataTransfer.setData('text/plain', widget.id);
    event.dataTransfer.effectAllowed = 'move';
    
    if (onDragStart) {
      onDragStart(widget, event);
    }
  }, [widget, isEditMode, onDragStart]);

  // Handle drag end
  const handleDragEnd = useCallback((event: React.DragEvent) => {
    if (onDragEnd) {
      onDragEnd(widget, event);
    }
  }, [widget, onDragEnd]);

  // Handle drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    if (!onDrop) return;

    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.floor((event.clientX - rect.left - dragOffset.x) / gridSize);
    const y = Math.floor((event.clientY - rect.top - dragOffset.y) / gridSize);
    
    const position: WidgetPosition = {
      x: snapToGrid ? x * gridSize : event.clientX - rect.left - dragOffset.x,
      y: snapToGrid ? y * gridSize : event.clientY - rect.top - dragOffset.y,
      z: widget.position.z
    };

    onDrop(widget, position);
  }, [widget, onDrop, dragOffset, gridSize, snapToGrid]);

  // Handle widget actions
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh(widget.id);
    }
  }, [onRefresh, widget.id]);

  const handleConfigure = useCallback(() => {
    if (onConfigure) {
      onConfigure(widget.id);
    }
  }, [onConfigure, widget.id]);

  const handleDuplicate = useCallback(() => {
    if (onDuplicate) {
      onDuplicate(widget.id);
    }
  }, [onDuplicate, widget.id]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(widget.id);
    }
  }, [onDelete, widget.id]);

  const handleToggleVisibility = useCallback(() => {
    if (onToggleVisibility) {
      onToggleVisibility(widget.id);
    }
  }, [onToggleVisibility, widget.id]);

  const handleMaximize = useCallback(() => {
    if (onMaximize) {
      onMaximize(widget.id);
    }
  }, [onMaximize, widget.id]);

  const handleMinimize = useCallback(() => {
    if (onMinimize) {
      onMinimize(widget.id);
    }
  }, [onMinimize, widget.id]);

  // Calculate widget styles
  const widgetStyles = {
    gridColumn: `span ${widget.size.width}`,
    gridRow: `span ${widget.size.height}`,
    minHeight: `${widget.size.height * 100}px`,
    opacity: widget.isVisible ? 1 : 0.5,
    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
    transition: isDragging ? 'none' : 'all 0.2s ease-in-out',
    zIndex: isSelected ? 10 : widget.position.z || 1
  };

  if (!widget.isVisible && !isEditMode) {
    return null;
  }

  return (
    <div
      ref={widgetRef}
      className={cn(
        "widget-container relative",
        {
          "ring-2 ring-primary ring-offset-2": isSelected,
          "cursor-move": widget.isDraggable && isEditMode,
          "cursor-pointer": isEditMode,
          "opacity-50": !widget.isVisible,
          "shadow-lg": isHovered || isSelected,
          "transform scale-105": isDragging,
        },
        className
      )}
      style={widgetStyles}
      draggable={widget.isDraggable && isEditMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={handleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        "h-full transition-all duration-200",
        {
          "border-primary": isSelected,
          "shadow-md": isHovered,
          "bg-muted/50": !widget.isVisible,
        }
      )}>
        <WidgetHeader
          widget={widget}
          isSelected={isSelected}
          isEditMode={isEditMode}
          showActions={isEditMode || isHovered}
          onConfigure={handleConfigure}
          onRefresh={handleRefresh}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          onMaximize={handleMaximize}
          onMinimize={handleMinimize}
        />
        
        {children ? (
          <CardContent className="p-6">
            {children}
          </CardContent>
        ) : (
          <WidgetContent
            widget={widget}
            data={data}
            theme={theme}
          />
        )}
        
        <WidgetFooter
          widget={widget}
          data={data}
          showLastUpdated={true}
          showMetadata={isEditMode}
        />
      </Card>
      
      {/* Resize handles */}
      {isEditMode && widget.isResizable && isSelected && (
        <>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize" />
          <div className="absolute bottom-0 left-1/2 w-3 h-1 bg-primary cursor-s-resize transform -translate-x-1/2" />
          <div className="absolute right-0 top-1/2 w-1 h-3 bg-primary cursor-e-resize transform -translate-y-1/2" />
        </>
      )}
      
      {/* Grid overlay */}
      {showGrid && isEditMode && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`
            }}
          />
        </div>
      )}
      
      {/* Drag handle */}
      {isEditMode && widget.isDraggable && (
        <div 
          ref={dragRef}
          className="absolute top-2 left-2 p-1 bg-background/80 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Move className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}

export default DashboardWidget;