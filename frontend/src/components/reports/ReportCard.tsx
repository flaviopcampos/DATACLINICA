import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Edit,
  Download,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Share2,
  Play,
  Pause
} from 'lucide-react';
import { SavedReport } from '../../types/reports';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportCardProps {
  report: SavedReport;
  onView?: (report: SavedReport) => void;
  onEdit?: (report: SavedReport) => void;
  onDelete?: (report: SavedReport) => void;
  onExport?: (report: SavedReport, format: 'pdf' | 'xlsx') => void;
  onExecute?: (report: SavedReport) => void;
  onToggleSchedule?: (report: SavedReport) => void;
  onShare?: (report: SavedReport) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

function ReportCard({
  report,
  onView,
  onEdit,
  onDelete,
  onExport,
  onExecute,
  onToggleSchedule,
  onShare,
  showActions = true,
  compact = false,
  className = ''
}: ReportCardProps) {
  const getReportStatusIcon = () => {
    if (report.last_executed) {
      const lastExecution = new Date(report.last_executed);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastExecution.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          tooltip: 'Executado recentemente'
        };
      } else if (hoursDiff < 168) { // 7 days
        return {
          icon: <Clock className="h-4 w-4 text-yellow-500" />,
          tooltip: 'Executado há alguns dias'
        };
      }
    }
    return {
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      tooltip: 'Não executado recentemente'
    };
  };

  const getReportTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'financial': 'bg-green-100 text-green-800',
      'operational': 'bg-blue-100 text-blue-800',
      'patient': 'bg-purple-100 text-purple-800',
      'custom': 'bg-gray-100 text-gray-800',
      'analytics': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatLastExecution = () => {
    if (!report.last_executed) return 'Nunca executado';
    
    const date = new Date(report.last_executed);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Há poucos minutos';
    } else if (diffInHours < 24) {
      return `Há ${Math.floor(diffInHours)} horas`;
    } else {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    }
  };

  const statusInfo = getReportStatusIcon();

  if (compact) {
    return (
      <div className={`border rounded-lg p-3 hover:bg-gray-50 transition-colors ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{report.name}</h4>
              <div title={statusInfo.tooltip}>
                {statusInfo.icon}
              </div>
            </div>
            <p className="text-xs text-gray-600 truncate mt-1">
              {report.description || 'Sem descrição'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${getReportTypeColor(report.report_type)}`}
              >
                {report.report_type}
              </Badge>
              {report.is_scheduled && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Agendado
                </Badge>
              )}
            </div>
          </div>
          {showActions && (
            <div className="flex gap-1 ml-2">
              {onView && (
                <Button size="sm" variant="ghost" onClick={() => onView(report)}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onExecute && (
                <Button size="sm" variant="ghost" onClick={() => onExecute(report)}>
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{report.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {report.description || 'Sem descrição disponível'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <div title={statusInfo.tooltip}>
              {statusInfo.icon}
            </div>
            {report.is_public && (
              <div title="Relatório público">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <Badge 
            variant="secondary" 
            className={getReportTypeColor(report.report_type)}
          >
            {report.report_type}
          </Badge>
          
          {report.is_scheduled && (
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              Agendado
            </Badge>
          )}
          
          {report.is_public && (
            <Badge variant="outline">
              <Share2 className="h-3 w-3 mr-1" />
              Público
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Informações de execução */}
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Última execução:</span>
              <span className="font-medium">{formatLastExecution()}</span>
            </div>
            {report.execution_count !== undefined && (
              <div className="flex items-center justify-between mt-1">
                <span>Total de execuções:</span>
                <span className="font-medium">{report.execution_count}</span>
              </div>
            )}
          </div>

          {/* Metadados adicionais */}
          {(report.created_at || report.updated_at) && (
            <div className="text-xs text-gray-500 border-t pt-3">
              {report.created_at && (
                <div>Criado em: {format(new Date(report.created_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
              )}
              {report.updated_at && report.updated_at !== report.created_at && (
                <div>Atualizado em: {format(new Date(report.updated_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
              )}
            </div>
          )}

          {/* Ações */}
          {showActions && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-2">
                {onView && (
                  <Button size="sm" variant="outline" onClick={() => onView(report)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                )}
                
                {onExecute && (
                  <Button size="sm" variant="outline" onClick={() => onExecute(report)}>
                    <Play className="h-4 w-4 mr-1" />
                    Executar
                  </Button>
                )}
                
                {onEdit && (
                  <Button size="sm" variant="outline" onClick={() => onEdit(report)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
              
              <div className="flex gap-1">
                {onShare && report.is_public && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onShare(report)}
                    title="Compartilhar relatório"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
                
                {onToggleSchedule && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onToggleSchedule(report)}
                    title={report.is_scheduled ? 'Desativar agendamento' : 'Ativar agendamento'}
                  >
                    {report.is_scheduled ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                {onExport && (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onExport(report, 'pdf')}
                      title="Exportar como PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {onDelete && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onDelete(report)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Excluir relatório"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ReportCard;