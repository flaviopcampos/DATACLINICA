import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '../../components/ui/progress';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Image,
  Settings,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ExportOptions } from '../../types/reports';

interface ExportButtonProps {
  onExport: (format: 'pdf' | 'excel' | 'csv' | 'png', options?: ExportOptions) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showProgress?: boolean;
  progress?: number;
  availableFormats?: Array<'pdf' | 'excel' | 'csv' | 'png'>;
  defaultFormat?: 'pdf' | 'excel' | 'csv' | 'png';
  showAdvancedOptions?: boolean;
  className?: string;
}

const FORMAT_CONFIG = {
  pdf: {
    icon: <FileText className="h-4 w-4" />,
    label: 'PDF',
    description: 'Documento portátil para visualização e impressão',
    color: 'text-red-600'
  },
  excel: {
    icon: <FileSpreadsheet className="h-4 w-4" />,
    label: 'Excel',
    description: 'Planilha para análise e edição de dados',
    color: 'text-green-600'
  },
  csv: {
    icon: <FileSpreadsheet className="h-4 w-4" />,
    label: 'CSV',
    description: 'Dados separados por vírgula para importação',
    color: 'text-blue-600'
  },
  png: {
    icon: <Image className="h-4 w-4" />,
    label: 'PNG',
    description: 'Imagem para apresentações e relatórios',
    color: 'text-purple-600'
  }
};

const DEFAULT_OPTIONS: ExportOptions = {
  includeCharts: true,
  includeData: true,
  includeFilters: true,
  orientation: 'portrait',
  pageSize: 'A4',
  quality: 'high',
  dateRange: true,
  summary: true
};

function ExportButton({
  onExport,
  loading = false,
  disabled = false,
  size = 'default',
  variant = 'default',
  showProgress = false,
  progress = 0,
  availableFormats = ['pdf', 'excel', 'csv', 'png'],
  defaultFormat = 'pdf',
  showAdvancedOptions = true,
  className = ''
}: ExportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv' | 'png'>(defaultFormat);
  const [exportOptions, setExportOptions] = useState<ExportOptions>(DEFAULT_OPTIONS);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleQuickExport = async (format: 'pdf' | 'excel' | 'csv' | 'png') => {
    if (disabled || loading) return;
    
    setIsExporting(true);
    setExportStatus('idle');
    
    try {
      await onExport(format, DEFAULT_OPTIONS);
      setExportStatus('success');
    } catch (error) {
      setExportStatus('error');
      console.error('Erro na exportação:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAdvancedExport = async () => {
    if (disabled || loading) return;
    
    setIsExporting(true);
    setExportStatus('idle');
    
    try {
      await onExport(selectedFormat, exportOptions);
      setExportStatus('success');
      setIsDialogOpen(false);
    } catch (error) {
      setExportStatus('error');
      console.error('Erro na exportação:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const updateOption = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const getStatusIcon = () => {
    if (isExporting || loading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (exportStatus === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (exportStatus === 'error') {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return <Download className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isExporting || loading) return 'Exportando...';
    if (exportStatus === 'success') return 'Exportado!';
    if (exportStatus === 'error') return 'Erro na exportação';
    return 'Exportar';
  };

  // Botão simples para exportação rápida
  if (!showAdvancedOptions && availableFormats.length === 1) {
    return (
      <Button
        size={size}
        variant={variant}
        onClick={() => handleQuickExport(availableFormats[0])}
        disabled={disabled || isExporting || loading}
        className={className}
      >
        {getStatusIcon()}
        <span className="ml-2">
          {getButtonText()} {FORMAT_CONFIG[availableFormats[0]].label}
        </span>
        {showProgress && (isExporting || loading) && (
          <div className="ml-2 w-16">
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size={size}
            variant={variant}
            disabled={disabled || isExporting || loading}
            className={className}
          >
            {getStatusIcon()}
            <span className="ml-2">{getButtonText()}</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Exportação Rápida</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {availableFormats.map((format) => {
            const config = FORMAT_CONFIG[format];
            return (
              <DropdownMenuItem
                key={format}
                onClick={() => handleQuickExport(format)}
                disabled={isExporting || loading}
                className="cursor-pointer"
              >
                <div className={config.color}>
                  {config.icon}
                </div>
                <div className="ml-2">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-gray-500">{config.description}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
          
          {showAdvancedOptions && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDialogOpen(true)}
                disabled={isExporting || loading}
                className="cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                <span className="ml-2">Opções Avançadas</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para opções avançadas */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Opções de Exportação</DialogTitle>
            <DialogDescription>
              Configure as opções detalhadas para exportação do relatório.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Formato */}
            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select
                value={selectedFormat}
                onValueChange={(value: 'pdf' | 'excel' | 'csv' | 'png') => setSelectedFormat(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFormats.map((format) => {
                    const config = FORMAT_CONFIG[format];
                    return (
                      <SelectItem key={format} value={format}>
                        <div className="flex items-center gap-2">
                          <div className={config.color}>
                            {config.icon}
                          </div>
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Conteúdo a incluir */}
            <div className="space-y-3">
              <Label>Conteúdo</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={exportOptions.includeCharts}
                    onCheckedChange={(checked) => updateOption('includeCharts', checked)}
                  />
                  <Label htmlFor="include-charts" className="text-sm font-normal">
                    Incluir gráficos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-data"
                    checked={exportOptions.includeData}
                    onCheckedChange={(checked) => updateOption('includeData', checked)}
                  />
                  <Label htmlFor="include-data" className="text-sm font-normal">
                    Incluir dados tabulares
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-filters"
                    checked={exportOptions.includeFilters}
                    onCheckedChange={(checked) => updateOption('includeFilters', checked)}
                  />
                  <Label htmlFor="include-filters" className="text-sm font-normal">
                    Incluir filtros aplicados
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-summary"
                    checked={exportOptions.summary}
                    onCheckedChange={(checked) => updateOption('summary', checked)}
                  />
                  <Label htmlFor="include-summary" className="text-sm font-normal">
                    Incluir resumo executivo
                  </Label>
                </div>
              </div>
            </div>

            {/* Opções específicas para PDF */}
            {selectedFormat === 'pdf' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orientation">Orientação</Label>
                  <Select
                    value={exportOptions.orientation}
                    onValueChange={(value: 'portrait' | 'landscape') => updateOption('orientation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Retrato</SelectItem>
                      <SelectItem value="landscape">Paisagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="page-size">Tamanho da página</Label>
                  <Select
                    value={exportOptions.pageSize}
                    onValueChange={(value: 'A4' | 'A3' | 'Letter') => updateOption('pageSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="Letter">Carta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Qualidade para imagens */}
            {selectedFormat === 'png' && (
              <div className="space-y-2">
                <Label htmlFor="quality">Qualidade</Label>
                <Select
                  value={exportOptions.quality}
                  onValueChange={(value: 'low' | 'medium' | 'high') => updateOption('quality', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa (rápido)</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta (melhor qualidade)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Progresso da exportação */}
            {showProgress && (isExporting || loading) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso da exportação</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Status da exportação */}
            {exportStatus !== 'idle' && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-gray-50">
                {exportStatus === 'success' && (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800">Exportação concluída com sucesso!</span>
                  </>
                )}
                {exportStatus === 'error' && (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-800">Erro durante a exportação. Tente novamente.</span>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAdvancedExport}
              disabled={isExporting || loading}
            >
              {isExporting || loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar {FORMAT_CONFIG[selectedFormat].label}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ExportButton;