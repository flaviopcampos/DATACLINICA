'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WidgetConfigurator, WidgetConfig } from './WidgetConfigurator';
import { DynamicFilters, ActiveFilter, FilterDefinition } from './DynamicFilters';
import { Plus, Settings, Grid3X3, List, Filter, GripVertical, MoreVertical, Edit, Trash2 } from 'lucide-react';

// Interfaces
interface DragDropLayoutProps {
  widgets: WidgetItem[];
  onWidgetsChange: (widgets: WidgetItem[]) => void;
  onAddWidget?: () => void;
  onConfigureWidget?: (widgetId: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  isEditMode?: boolean;
  onEditModeChange?: (isEdit: boolean) => void;
  filters?: FilterDefinition[];
  activeFilters?: ActiveFilter[];
  onFiltersChange?: (filters: ActiveFilter[]) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  className?: string;
}

interface WidgetItem {
  id: string;
  title: string;
  type: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  position: { x: number; y: number };
  isVisible: boolean;
  content?: React.ReactNode;
  config?: WidgetConfig;
}

interface DroppableAreaProps {
  children: React.ReactNode;
  droppableId: string;
  className?: string;
}

interface DraggableWidgetProps {
  widget: WidgetItem;
  index: number;
  onConfigure?: (widgetId: string) => void;
  viewMode?: 'grid' | 'list';
  isEditing?: boolean;
}

// Componente de área droppable
function DroppableArea({ children, droppableId, className }: DroppableAreaProps) {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            'min-h-[200px] transition-colors duration-200',
            snapshot.isDraggingOver && 'bg-blue-50 border-2 border-blue-200 border-dashed',
            className
          )}
        >
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

// Componente de widget arrastável
function DraggableWidget({ widget, index, onConfigure, viewMode = 'grid', isEditing }: DraggableWidgetProps) {
  const handleConfigure = useCallback(() => {
    onConfigure?.(widget.id);
  }, [widget.id, onConfigure]);

  return (
    <Draggable draggableId={widget.id} index={index} isDragDisabled={!isEditing}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'transition-all duration-200',
            viewMode === 'grid' ? 'mb-4' : 'mb-2',
            snapshot.isDragging && 'rotate-2 shadow-2xl z-50',
            !widget.isVisible && 'opacity-50'
          )}
        >
          <Card className={cn(
            'relative group',
            snapshot.isDragging && 'shadow-lg',
            isEditing && 'border-blue-200 hover:border-blue-400'
          )}>
            {/* Drag Handle */}
            {isEditing && (
              <div
                {...provided.dragHandleProps}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
              >
                <div className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center">
                  <Grid3X3 className="w-3 h-3 text-gray-600" />
                </div>
              </div>
            )}

            {/* Widget Actions */}
            {isEditing && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleConfigure}
                  className="h-6 w-6 p-0 bg-white hover:bg-gray-100 shadow-sm"
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            )}

            {/* Widget Content */}
            <div className={cn(
              'p-4',
              isEditing && 'pt-8'
            )}>
              {widget.component}
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

// Componente principal
export default function DragDropLayout({
  widgets,
  onWidgetsChange,
  onAddWidget,
  onConfigureWidget,
  viewMode = 'grid',
  onViewModeChange,
  isEditMode = false,
  onEditModeChange,
  filters = [],
  activeFilters = [],
  onFiltersChange,
  showFilters = false,
  onToggleFilters,
  className
}: DragDropLayoutProps) {
  const [localWidgets, setLocalWidgets] = useState<WidgetItem[]>(widgets);
  const [isDragging, setIsDragging] = useState(false);
  const [configuringWidget, setConfiguringWidget] = useState<WidgetItem | null>(null);
  const [showConfigurator, setShowConfigurator] = useState(false);

  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  const handleDragEnd = useCallback((result: DropResult) => {
    setIsDragging(false);
    
    if (!result.destination) {
      return;
    }

    const items = Array.from(localWidgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalWidgets(items);
    onWidgetsChange(items);
  }, [localWidgets, onWidgetsChange]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    const updatedWidgets = localWidgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, isVisible: !widget.isVisible }
        : widget
    );
    setLocalWidgets(updatedWidgets);
    onWidgetsChange(updatedWidgets);
  }, [localWidgets, onWidgetsChange]);

  const removeWidget = useCallback((widgetId: string) => {
    const updatedWidgets = localWidgets.filter(widget => widget.id !== widgetId);
    setLocalWidgets(updatedWidgets);
    onWidgetsChange(updatedWidgets);
  }, [localWidgets, onWidgetsChange]);

  const handleConfigureWidget = useCallback((widget: WidgetItem) => {
    setConfiguringWidget(widget);
    setShowConfigurator(true);
  }, []);

  const handleSaveWidgetConfig = useCallback((config: WidgetConfig) => {
    if (!configuringWidget) return;

    const updatedWidgets = localWidgets.map(widget =>
      widget.id === configuringWidget.id
        ? { 
            ...widget, 
            title: config.title,
            type: config.type,
            size: config.size,
            isVisible: config.isVisible,
            config 
          }
        : widget
    );
    
    setLocalWidgets(updatedWidgets);
    onWidgetsChange(updatedWidgets);
    setConfiguringWidget(null);
  }, [configuringWidget, localWidgets, onWidgetsChange]);

  const handleAddNewWidget = useCallback(() => {
    const newWidget: WidgetItem = {
      id: `widget-${Date.now()}`,
      title: 'Novo Widget',
      type: 'metric',
      size: 'medium',
      position: { x: 0, y: 0 },
      isVisible: true,
      config: {
        id: `widget-${Date.now()}`,
        title: 'Novo Widget',
        type: 'metric',
        size: 'medium',
        appearance: {
          theme: 'light',
          colorScheme: 'blue',
          showTitle: true,
          showBorder: true,
          borderRadius: 'md'
        },
        behavior: {
          autoRefresh: false,
          refreshInterval: 30,
          showTooltips: true,
          enableInteraction: true,
          showLegend: true,
          animationEnabled: true
        },
        isVisible: true
      }
    };
    
    setConfiguringWidget(newWidget);
    setShowConfigurator(true);
  }, []);

  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    onViewModeChange?.(newMode);
  }, [viewMode, onViewModeChange]);

  const toggleEditMode = useCallback(() => {
    onEditModeChange?.(!isEditMode);
  }, [isEditMode, onEditModeChange]);

  return (
    <div className={cn('w-full', className)}>
      {/* Header com controles */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          {isEditMode && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
              Modo de Edição
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de alternar visualização */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleViewMode}
            className="h-8"
          >
            {viewMode === 'grid' ? (
              <>
                <List className="w-4 h-4 mr-2" />
                Lista
              </>
            ) : (
              <>
                <Grid3X3 className="w-4 h-4 mr-2" />
                Grade
              </>
            )}
          </Button>

          {/* Botão de modo de edição */}
          <Button
            variant={isEditMode ? 'default' : 'outline'}
            size="sm"
            onClick={toggleEditMode}
            className="h-8"
          >
            <Settings className="w-4 h-4 mr-2" />
            {isEditMode ? 'Sair da Edição' : 'Editar'}
          </Button>

          {/* Botão de filtros */}
          {onToggleFilters && (
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleFilters}
              className="h-8"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          )}

          {/* Botão de adicionar widget */}
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddNewWidget}
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Widget
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && onFiltersChange && (
        <DynamicFilters
          filters={filters}
          activeFilters={activeFilters}
          onFiltersChange={onFiltersChange}
        />
      )}

      {/* Layout de drag & drop */}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <DroppableArea
          droppableId="dashboard"
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-2'
          )}
        >
          {widgets.map((widget, index) => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              index={index}
              onConfigure={onConfigureWidget}
              viewMode={viewMode}
              isEditing={isEditing}
            />
          ))}

          {/* Placeholder quando não há widgets */}
          {widgets.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
              <Grid3X3 className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum widget adicionado</p>
              <p className="text-sm text-center mb-4">
                Clique em "Adicionar Widget" para começar a personalizar seu dashboard
              </p>
              {onAddWidget && (
                <Button variant="outline" onClick={onAddWidget}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Widget
                </Button>
              )}
            </div>
          )}
        </DroppableArea>
      </DragDropContext>

      {/* Indicador de drag ativo */}
      {isDragging && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg z-50">
          Movendo widget...
        </div>
      )}

      {/* Configurador de Widget */}
      {showConfigurator && configuringWidget && (
        <WidgetConfigurator
          widget={configuringWidget}
          onSave={handleSaveWidgetConfig}
          onCancel={() => {
            setShowConfigurator(false);
            setConfiguringWidget(null);
          }}
        />
      )}
    </div>
  );
}

// Exportar tipos para uso externo
export type { DragDropLayoutProps, WidgetItem };