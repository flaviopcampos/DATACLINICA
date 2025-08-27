import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportFilters, SavedReport, ChartConfig } from '../../types/unified-reports';

// Extensão do tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportData {
  title: string;
  subtitle?: string;
  data: any[];
  charts?: {
    title: string;
    data: any[];
    config: ChartConfig;
  }[];
  filters?: ReportFilters;
  summary?: {
    label: string;
    value: string | number;
  }[];
  metadata?: {
    generatedAt: Date;
    generatedBy?: string;
    period?: string;
  };
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'png';
  filename?: string;
  includeCharts?: boolean;
  includeFilters?: boolean;
  includeSummary?: boolean;
  pageOrientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'a3' | 'letter';
  quality?: 'low' | 'medium' | 'high';
}

/**
 * Gera nome de arquivo baseado no tipo de relatório e data
 */
export function generateFilename(
  reportType: string,
  format: string,
  customName?: string
): string {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const baseName = customName || `relatorio_${reportType}`;
  return `${baseName}_${timestamp}.${format}`;
}

/**
 * Exporta dados para PDF
 */
export async function exportToPDF(
  data: ExportData,
  options: ExportOptions = { format: 'pdf' }
): Promise<void> {
  const doc = new jsPDF({
    orientation: options.pageOrientation || 'portrait',
    unit: 'mm',
    format: options.pageSize || 'a4'
  });

  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Cabeçalho
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.title, margin, yPosition);
  yPosition += 10;

  if (data.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(data.subtitle, margin, yPosition);
    yPosition += 10;
  }

  // Metadados
  if (data.metadata) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const generatedText = `Gerado em: ${format(data.metadata.generatedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`;
    doc.text(generatedText, margin, yPosition);
    yPosition += 5;

    if (data.metadata.period) {
      doc.text(`Período: ${data.metadata.period}`, margin, yPosition);
      yPosition += 5;
    }
  }

  yPosition += 10;

  // Filtros aplicados
  if (options.includeFilters && data.filters) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Filtros Aplicados:', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (data.filters.startDate && data.filters.endDate) {
      const periodText = `Período: ${format(data.filters.startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(data.filters.endDate, 'dd/MM/yyyy', { locale: ptBR })}`;
      doc.text(periodText, margin, yPosition);
      yPosition += 5;
    }

    if (data.filters.type) {
      doc.text(`Tipo: ${data.filters.type}`, margin, yPosition);
      yPosition += 5;
    }

    if (data.filters.category) {
      doc.text(`Categoria: ${data.filters.category}`, margin, yPosition);
      yPosition += 5;
    }

    yPosition += 10;
  }

  // Resumo/KPIs
  if (options.includeSummary && data.summary && data.summary.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Executivo:', margin, yPosition);
    yPosition += 8;

    const summaryData = data.summary.map(item => [item.label, item.value]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Indicador', 'Valor']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Dados principais
  if (data.data && data.data.length > 0) {
    // Verificar se precisa de nova página
    if (yPosition > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Dados Detalhados:', margin, yPosition);
    yPosition += 8;

    // Preparar dados para tabela
    const tableData = data.data;
    const columns = Object.keys(tableData[0] || {});
    const rows = tableData.map(row => columns.map(col => row[col] || ''));

    doc.autoTable({
      startY: yPosition,
      head: [columns],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      columnStyles: {
        // Ajustar largura das colunas automaticamente
      }
    });
  }

  // Rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin - 20,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      'DataClínica - Sistema de Gestão Hospitalar',
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Salvar arquivo
  const filename = options.filename || generateFilename('relatorio', 'pdf');
  doc.save(filename);
}

/**
 * Exporta dados para Excel
 */
export async function exportToExcel(
  data: ExportData,
  options: ExportOptions = { format: 'excel' }
): Promise<void> {
  const workbook = XLSX.utils.book_new();

  // Planilha principal com dados
  if (data.data && data.data.length > 0) {
    const worksheet = XLSX.utils.json_to_sheet(data.data);
    
    // Adicionar cabeçalho
    XLSX.utils.sheet_add_aoa(worksheet, [[data.title]], { origin: 'A1' });
    
    if (data.subtitle) {
      XLSX.utils.sheet_add_aoa(worksheet, [[data.subtitle]], { origin: 'A2' });
    }

    // Metadados
    let metadataRow = 4;
    if (data.metadata) {
      const generatedText = `Gerado em: ${format(data.metadata.generatedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`;
      XLSX.utils.sheet_add_aoa(worksheet, [[generatedText]], { origin: `A${metadataRow}` });
      metadataRow++;

      if (data.metadata.period) {
        XLSX.utils.sheet_add_aoa(worksheet, [[`Período: ${data.metadata.period}`]], { origin: `A${metadataRow}` });
        metadataRow++;
      }
    }

    // Ajustar dados para começar após metadados
    const dataStartRow = metadataRow + 2;
    const dataRange = XLSX.utils.encode_range({
      s: { c: 0, r: dataStartRow },
      e: { c: Object.keys(data.data[0]).length - 1, r: dataStartRow + data.data.length }
    });

    // Adicionar dados
    XLSX.utils.sheet_add_json(worksheet, data.data, {
      origin: `A${dataStartRow + 1}`,
      skipHeader: false
    });

    // Formatação
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Auto-ajustar largura das colunas
    const colWidths: any[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length;
          if (cellLength > maxWidth) {
            maxWidth = cellLength;
          }
        }
      }
      colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
    }
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
  }

  // Planilha de resumo
  if (options.includeSummary && data.summary && data.summary.length > 0) {
    const summaryData = data.summary.map(item => ({
      'Indicador': item.label,
      'Valor': item.value
    }));
    
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo');
  }

  // Planilha de gráficos (dados dos gráficos)
  if (options.includeCharts && data.charts && data.charts.length > 0) {
    data.charts.forEach((chart, index) => {
      if (chart.data && chart.data.length > 0) {
        const chartWorksheet = XLSX.utils.json_to_sheet(chart.data);
        const sheetName = `Gráfico ${index + 1}`;
        XLSX.utils.book_append_sheet(workbook, chartWorksheet, sheetName);
      }
    });
  }

  // Salvar arquivo
  const filename = options.filename || generateFilename('relatorio', 'xlsx');
  XLSX.writeFile(workbook, filename);
}

/**
 * Exporta dados para CSV
 */
export async function exportToCSV(
  data: ExportData,
  options: ExportOptions = { format: 'csv' }
): Promise<void> {
  if (!data.data || data.data.length === 0) {
    throw new Error('Nenhum dado disponível para exportação');
  }

  // Cabeçalho do CSV
  let csvContent = '';
  
  // Título e metadados como comentários
  csvContent += `# ${data.title}\n`;
  if (data.subtitle) {
    csvContent += `# ${data.subtitle}\n`;
  }
  
  if (data.metadata) {
    csvContent += `# Gerado em: ${format(data.metadata.generatedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}\n`;
    if (data.metadata.period) {
      csvContent += `# Período: ${data.metadata.period}\n`;
    }
  }
  
  csvContent += '#\n'; // Linha em branco

  // Cabeçalhos das colunas
  const headers = Object.keys(data.data[0]);
  csvContent += headers.join(',') + '\n';

  // Dados
  data.data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escapar aspas e vírgulas
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csvContent += values.join(',') + '\n';
  });

  // Criar e baixar arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', options.filename || generateFilename('relatorio', 'csv'));
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Exporta gráfico como imagem PNG
 */
export async function exportChartToPNG(
  chartElement: HTMLElement,
  options: ExportOptions = { format: 'png' }
): Promise<void> {
  try {
    // Usar html2canvas para capturar o elemento
    const html2canvas = await import('html2canvas');
    
    const canvas = await html2canvas.default(chartElement, {
      backgroundColor: '#ffffff',
      scale: options.quality === 'high' ? 2 : options.quality === 'low' ? 0.5 : 1,
      useCORS: true,
      allowTaint: true
    });

    // Converter para blob e baixar
    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', options.filename || generateFilename('grafico', 'png'));
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Erro ao exportar gráfico:', error);
    throw new Error('Erro ao exportar gráfico como imagem');
  }
}

/**
 * Função principal de exportação
 */
export async function exportReport(
  data: ExportData,
  options: ExportOptions
): Promise<void> {
  try {
    switch (options.format) {
      case 'pdf':
        await exportToPDF(data, options);
        break;
      case 'excel':
        await exportToExcel(data, options);
        break;
      case 'csv':
        await exportToCSV(data, options);
        break;
      case 'png':
        throw new Error('Para exportar PNG, use exportChartToPNG diretamente');
      default:
        throw new Error(`Formato de exportação não suportado: ${options.format}`);
    }
  } catch (error) {
    console.error('Erro na exportação:', error);
    throw error;
  }
}

/**
 * Utilitários para formatação de dados
 */
export const formatUtils = {
  /**
   * Formata valor monetário
   */
  currency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  /**
   * Formata número
   */
  number: (value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  /**
   * Formata porcentagem
   */
  percentage: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  },

  /**
   * Formata data
   */
  date: (date: Date, formatStr: string = 'dd/MM/yyyy'): string => {
    return format(date, formatStr, { locale: ptBR });
  },

  /**
   * Formata data e hora
   */
  datetime: (date: Date): string => {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  }
};

/**
 * Validação de dados para exportação
 */
export function validateExportData(data: ExportData): boolean {
  if (!data.title) {
    throw new Error('Título é obrigatório para exportação');
  }

  if (!data.data || !Array.isArray(data.data)) {
    throw new Error('Dados devem ser um array válido');
  }

  if (data.data.length === 0) {
    throw new Error('Nenhum dado disponível para exportação');
  }

  return true;
}

/**
 * Preparar dados para exportação baseado no tipo de relatório
 */
export function prepareReportData(
  reportType: 'financial' | 'operational' | 'patient',
  rawData: any,
  filters?: ReportFilters
): ExportData {
  const baseData: ExportData = {
    title: '',
    data: [],
    metadata: {
      generatedAt: new Date(),
      period: filters?.startDate && filters?.endDate 
        ? `${format(filters.startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(filters.endDate, 'dd/MM/yyyy', { locale: ptBR })}`
        : undefined
    },
    filters
  };

  switch (reportType) {
    case 'financial':
      return {
        ...baseData,
        title: 'Relatório Financeiro',
        subtitle: 'Análise de receitas, despesas e faturamento',
        data: rawData.transactions || [],
        summary: [
          { label: 'Receita Total', value: formatUtils.currency(rawData.totalRevenue || 0) },
          { label: 'Despesas Totais', value: formatUtils.currency(rawData.totalExpenses || 0) },
          { label: 'Lucro Líquido', value: formatUtils.currency((rawData.totalRevenue || 0) - (rawData.totalExpenses || 0)) },
          { label: 'Margem de Lucro', value: formatUtils.percentage(rawData.profitMargin || 0) }
        ]
      };

    case 'operational':
      return {
        ...baseData,
        title: 'Relatório Operacional',
        subtitle: 'Análise de ocupação, prescrições e estoque',
        data: rawData.operations || [],
        summary: [
          { label: 'Taxa de Ocupação', value: formatUtils.percentage(rawData.occupancyRate || 0) },
          { label: 'Total de Prescrições', value: formatUtils.number(rawData.totalPrescriptions || 0) },
          { label: 'Itens em Estoque', value: formatUtils.number(rawData.stockItems || 0) },
          { label: 'Alertas Ativos', value: formatUtils.number(rawData.activeAlerts || 0) }
        ]
      };

    case 'patient':
      return {
        ...baseData,
        title: 'Relatório de Pacientes',
        subtitle: 'Análise demográfica e histórico de pacientes',
        data: rawData.patients || [],
        summary: [
          { label: 'Total de Pacientes', value: formatUtils.number(rawData.totalPatients || 0) },
          { label: 'Novos Pacientes', value: formatUtils.number(rawData.newPatients || 0) },
          { label: 'Taxa de Retorno', value: formatUtils.percentage(rawData.returnRate || 0) },
          { label: 'Consultas Realizadas', value: formatUtils.number(rawData.totalConsultations || 0) }
        ]
      };

    default:
      return baseData;
  }
}