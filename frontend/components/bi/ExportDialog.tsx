'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Table, AlertTriangle, BarChart3 } from 'lucide-react';
import { useExport } from '@/hooks/bi/useExport';
import { ExportOptions } from '@/services/bi/exportService';

export interface ExportDialogProps {
  trigger?: React.ReactNode;
  defaultType?: 'metrics' | 'kpis' | 'alerts' | 'dashboard';
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onExport?: (type: string, format: string, options: any) => Promise<void>;
  isExporting?: boolean;
}

export function ExportDialog({ 
  trigger, 
  defaultType = 'dashboard',
  title = 'Exportar Relatório',
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onExport: controlledOnExport,
  isExporting: controlledIsExporting
}: ExportDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [exportType, setExportType] = useState<'metrics' | 'kpis' | 'alerts' | 'dashboard'>(defaultType);
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [filename, setFilename] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    severity: [] as string[],
    status: '',
    isResolved: undefined as boolean | undefined,
    dateRange: {
      start: '',
      end: ''
    }
  });

  const { 
    isExporting: hookIsExporting, 
    exportMetrics, 
    exportKPIs, 
    exportAlerts, 
    exportDashboard 
  } = useExport();

  const isExporting = controlledIsExporting !== undefined ? controlledIsExporting : hookIsExporting;

  const handleExport = async () => {
    const options: ExportOptions = {
      format,
      filename: filename || undefined,
      orientation,
      includeMetadata,
      includeCharts
    };

    try {
      if (controlledOnExport) {
        await controlledOnExport(exportType, format, options);
      } else {
        switch (exportType) {
          case 'metrics':
            await exportMetrics(options, {
              category: filters.category || undefined,
              dateRange: filters.dateRange.start && filters.dateRange.end ? {
                start: new Date(filters.dateRange.start),
                end: new Date(filters.dateRange.end)
              } : undefined
            });
            break;
          
          case 'kpis':
            await exportKPIs(options, {
              status: filters.status || undefined,
              category: filters.category || undefined
            });
            break;
          
          case 'alerts':
            await exportAlerts(options, {
              severity: filters.severity.length > 0 ? filters.severity : undefined,
              isResolved: filters.isResolved,
              dateRange: filters.dateRange.start && filters.dateRange.end ? {
                start: new Date(filters.dateRange.start),
                end: new Date(filters.dateRange.end)
              } : undefined
            });
            break;
          
          case 'dashboard':
            await exportDashboard(options, includeCharts);
            break;
        }
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'metrics': return <BarChart3 className="h-4 w-4" />;
      case 'kpis': return <FileText className="h-4 w-4" />;
      case 'alerts': return <AlertTriangle className="h-4 w-4" />;
      case 'dashboard': return <Table className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'metrics': return 'Métricas';
      case 'kpis': return 'KPIs';
      case 'alerts': return 'Alertas';
      case 'dashboard': return 'Dashboard Completo';
      default: return 'Relatório';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Configure as opções de exportação para gerar seu relatório.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tipo de Exportação */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de Relatório</Label>
            <RadioGroup 
              value={exportType} 
              onValueChange={(value) => setExportType(value as any)}
              className="grid grid-cols-2 gap-4"
            >
              {(['metrics', 'kpis', 'alerts', 'dashboard'] as const).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} />
                  <Label 
                    htmlFor={type} 
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {getTypeIcon(type)}
                    {getTypeLabel(type)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Configurações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select value={format} onValueChange={(value) => setFormat(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orientation">Orientação</Label>
              <Select value={orientation} onValueChange={(value) => setOrientation(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Retrato</SelectItem>
                  <SelectItem value="landscape">Paisagem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filename">Nome do Arquivo (opcional)</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Ex: relatorio_mensal"
            />
          </div>

          {/* Opções Avançadas */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Opções Avançadas</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={includeMetadata}
                onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
              />
              <Label htmlFor="metadata" className="text-sm">
                Incluir metadados (data de geração, filtros aplicados)
              </Label>
            </div>

            {exportType === 'dashboard' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label htmlFor="charts" className="text-sm">
                  Incluir gráficos (apenas PDF)
                </Label>
              </div>
            )}
          </div>

          <Separator />

          {/* Filtros Específicos */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Filtros</Label>
            
            {(exportType === 'metrics' || exportType === 'kpis') && (
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs">Categoria</Label>
                <Select value={filters.category} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    <SelectItem value="appointments">Agendamentos</SelectItem>
                    <SelectItem value="billing">Faturamento</SelectItem>
                    <SelectItem value="beds">Leitos</SelectItem>
                    <SelectItem value="patients">Pacientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {exportType === 'alerts' && (
              <div className="space-y-2">
                <Label className="text-xs">Severidade</Label>
                <div className="flex flex-wrap gap-2">
                  {['low', 'medium', 'high', 'critical'].map((severity) => (
                    <div key={severity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`severity-${severity}`}
                        checked={filters.severity.includes(severity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({
                              ...prev,
                              severity: [...prev.severity, severity]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              severity: prev.severity.filter(s => s !== severity)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`severity-${severity}`} className="text-xs capitalize">
                        {severity === 'low' ? 'Baixa' : 
                         severity === 'medium' ? 'Média' :
                         severity === 'high' ? 'Alta' : 'Crítica'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(exportType === 'metrics' || exportType === 'alerts') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-xs">Data Inicial</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-xs">Data Final</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExportDialog;