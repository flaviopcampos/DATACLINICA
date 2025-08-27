import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Calendar,
  FileText,
  Download,
  Send,
  Eye
} from 'lucide-react';
import { FinancialSummary, PaymentStatus } from '@/types/beds';

interface FinancialSummaryCardProps {
  summary: FinancialSummary;
  onExportReport?: () => void;
  onSendReminder?: (admissionId: string) => void;
  onViewDetails?: (admissionId: string) => void;
  className?: string;
}

const paymentStatusConfig = {
  PENDING: {
    label: 'Pendente',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: <Clock className="h-4 w-4" />
  },
  PARTIAL: {
    label: 'Parcial',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: <CreditCard className="h-4 w-4" />
  },
  PAID: {
    label: 'Pago',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: <CheckCircle className="h-4 w-4" />
  },
  OVERDUE: {
    label: 'Vencido',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: <AlertCircle className="h-4 w-4" />
  }
};

export default function FinancialSummaryCard({
  summary,
  onExportReport,
  onSendReminder,
  onViewDetails,
  className = ''
}: FinancialSummaryCardProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getPaymentProgress = () => {
    if (summary.total_amount === 0) return 0;
    return (summary.paid_amount / summary.total_amount) * 100;
  };

  const getStatusConfig = (status: PaymentStatus) => {
    return paymentStatusConfig[status];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.total_amount)}
                </p>
                <p className="text-xs text-muted-foreground">Receita Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary.paid_amount)}
                </p>
                <p className="text-xs text-muted-foreground">Valor Recebido</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(summary.pending_amount)}
                </p>
                <p className="text-xs text-muted-foreground">Pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.overdue_amount)}
                </p>
                <p className="text-xs text-muted-foreground">Vencido</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Progresso de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Progresso de Recebimentos
          </CardTitle>
          <CardDescription>
            {getPaymentProgress().toFixed(1)}% do valor total foi recebido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getPaymentProgress()} className="h-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="font-semibold text-green-600">
                  {((summary.paid_amount / summary.total_amount) * 100).toFixed(1)}%
                </p>
                <p className="text-muted-foreground">Pago</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-yellow-600">
                  {((summary.pending_amount / summary.total_amount) * 100).toFixed(1)}%
                </p>
                <p className="text-muted-foreground">Pendente</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-red-600">
                  {((summary.overdue_amount / summary.total_amount) * 100).toFixed(1)}%
                </p>
                <p className="text-muted-foreground">Vencido</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{summary.total_admissions}</p>
                <p className="text-muted-foreground">Internações</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Receita por Tipo de Pagamento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Receita por Tipo de Pagamento
              </CardTitle>
              <CardDescription>
                Distribuição da receita por modalidade de pagamento
              </CardDescription>
            </div>
            {onExportReport && (
              <Button variant="outline" size="sm" onClick={onExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.revenue_by_payment_type.map((item) => {
              const percentage = summary.total_amount > 0 
                ? (item.amount / summary.total_amount) * 100 
                : 0;
              
              return (
                <div key={item.payment_type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        item.payment_type === 'PRIVATE' ? 'bg-blue-500' :
                        item.payment_type === 'INSURANCE' ? 'bg-green-500' :
                        'bg-orange-500'
                      }`} />
                      <span className="font-medium">
                        {item.payment_type === 'PRIVATE' ? 'Particular' :
                         item.payment_type === 'INSURANCE' ? 'Convênio' : 'SUS'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} internações • {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Internações Recentes com Pendências */}
      {summary.recent_admissions && summary.recent_admissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Internações com Pendências Financeiras
            </CardTitle>
            <CardDescription>
              Internações que requerem atenção financeira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.recent_admissions
                .filter(admission => admission.payment_status !== 'PAID')
                .slice(0, 5)
                .map((admission) => {
                  const statusConfig = getStatusConfig(admission.payment_status);
                  
                  return (
                    <div 
                      key={admission.id}
                      className={`p-4 rounded-lg border ${statusConfig.borderColor} ${statusConfig.bgColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-semibold mr-2">{admission.patient_name}</h4>
                            <Badge 
                              variant="outline" 
                              className={`${statusConfig.textColor} ${statusConfig.borderColor}`}
                            >
                              {statusConfig.icon}
                              <span className="ml-1">{statusConfig.label}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Leito</p>
                              <p className="font-medium">{admission.bed_number}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Internação</p>
                              <p className="font-medium">{formatDate(admission.admission_date)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Valor Total</p>
                              <p className="font-medium">{formatCurrency(admission.total_amount)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Pendente</p>
                              <p className="font-medium text-red-600">
                                {formatCurrency(admission.pending_amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {onViewDetails && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onViewDetails(admission.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {onSendReminder && admission.payment_status === 'OVERDUE' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onSendReminder(admission.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {admission.payment_status === 'PARTIAL' && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progresso do Pagamento</span>
                            <span>
                              {((admission.paid_amount / admission.total_amount) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={(admission.paid_amount / admission.total_amount) * 100} 
                            className="h-2" 
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              }
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Métricas Mensais */}
      {summary.monthly_revenue && summary.monthly_revenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Receita Mensal
            </CardTitle>
            <CardDescription>
              Evolução da receita nos últimos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.monthly_revenue.slice(-6).map((month, index) => {
                const isCurrentMonth = index === summary.monthly_revenue.length - 1;
                const previousMonth = index > 0 ? summary.monthly_revenue[index - 1] : null;
                const growth = previousMonth 
                  ? ((month.amount - previousMonth.amount) / previousMonth.amount) * 100 
                  : 0;
                
                return (
                  <div key={month.month} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{month.month}</p>
                      <p className="text-sm text-muted-foreground">
                        {month.admissions} internações
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(month.amount)}</p>
                      {previousMonth && (
                        <div className="flex items-center text-xs">
                          {growth > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          ) : growth < 0 ? (
                            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                          ) : null}
                          <span className={`${
                            growth > 0 ? 'text-green-600' :
                            growth < 0 ? 'text-red-600' :
                            'text-muted-foreground'
                          }`}>
                            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}