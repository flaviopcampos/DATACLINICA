import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ExportData {
  title: string;
  subtitle?: string;
  headers: string[];
  data: (string | number)[][];
  metadata?: {
    generatedAt: Date;
    generatedBy: string;
    filters?: Record<string, any>;
  };
}

export interface ExportOptions {
  filename?: string;
  format: 'pdf' | 'excel';
  orientation?: 'portrait' | 'landscape';
  includeMetadata?: boolean;
  includeCharts?: boolean;
}

class ExportService {
  /**
   * Exporta dados para PDF
   */
  async exportToPDF(data: ExportData, options: ExportOptions = { format: 'pdf' }): Promise<void> {
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cabeçalho
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    if (data.subtitle) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.subtitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }

    // Metadata
    if (options.includeMetadata && data.metadata) {
      yPosition += 5;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const generatedAt = format(data.metadata.generatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      pdf.text(`Gerado em: ${generatedAt}`, 20, yPosition);
      yPosition += 5;
      
      if (data.metadata.generatedBy) {
        pdf.text(`Gerado por: ${data.metadata.generatedBy}`, 20, yPosition);
        yPosition += 5;
      }
    }

    yPosition += 10;

    // Tabela
    const tableStartY = yPosition;
    const colWidth = (pageWidth - 40) / data.headers.length;

    // Cabeçalhos da tabela
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(240, 240, 240);
    
    data.headers.forEach((header, index) => {
      const x = 20 + (index * colWidth);
      pdf.rect(x, yPosition, colWidth, 8, 'F');
      pdf.text(header, x + 2, yPosition + 5);
    });
    
    yPosition += 8;

    // Dados da tabela
    pdf.setFont('helvetica', 'normal');
    data.data.forEach((row, rowIndex) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }

      row.forEach((cell, cellIndex) => {
        const x = 20 + (cellIndex * colWidth);
        pdf.text(String(cell), x + 2, yPosition + 5);
      });
      
      yPosition += 8;
    });

    // Salvar arquivo
    const filename = options.filename || `relatorio_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
    pdf.save(filename);
  }

  /**
   * Exporta dados para Excel
   */
  async exportToExcel(data: ExportData, options: ExportOptions = { format: 'excel' }): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Criar planilha principal
    const worksheetData = [
      [data.title],
      data.subtitle ? [data.subtitle] : [],
      [], // Linha em branco
      data.headers,
      ...data.data
    ].filter(row => row.length > 0);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Formatação
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Título em negrito
    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center' }
      };
    }

    // Subtítulo
    if (data.subtitle && worksheet['A2']) {
      worksheet['A2'].s = {
        font: { sz: 12 },
        alignment: { horizontal: 'center' }
      };
    }

    // Cabeçalhos em negrito
    const headerRowIndex = data.subtitle ? 4 : 3;
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex - 1, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'F0F0F0' } }
        };
      }
    }

    // Ajustar largura das colunas
    const colWidths = data.headers.map(header => ({ wch: Math.max(header.length, 15) }));
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

    // Adicionar planilha de metadados se solicitado
    if (options.includeMetadata && data.metadata) {
      const metadataData = [
        ['Metadados do Relatório'],
        [],
        ['Gerado em:', format(data.metadata.generatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })],
        ['Gerado por:', data.metadata.generatedBy || 'Sistema'],
        []
      ];

      if (data.metadata.filters) {
        metadataData.push(['Filtros Aplicados:']);
        Object.entries(data.metadata.filters).forEach(([key, value]) => {
          metadataData.push([key, String(value)]);
        });
      }

      const metadataWorksheet = XLSX.utils.aoa_to_sheet(metadataData);
      XLSX.utils.book_append_sheet(workbook, metadataWorksheet, 'Metadados');
    }

    // Salvar arquivo
    const filename = options.filename || `relatorio_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Exporta dados no formato especificado
   */
  async export(data: ExportData, options: ExportOptions): Promise<void> {
    if (options.format === 'pdf') {
      await this.exportToPDF(data, options);
    } else if (options.format === 'excel') {
      await this.exportToExcel(data, options);
    } else {
      throw new Error(`Formato de exportação não suportado: ${options.format}`);
    }
  }

  /**
   * Converte dados de métricas para formato de exportação
   */
  formatMetricsForExport(
    metrics: any[],
    title: string,
    subtitle?: string
  ): ExportData {
    const headers = ['Métrica', 'Valor', 'Unidade', 'Categoria', 'Última Atualização'];
    const data = metrics.map(metric => [
      metric.name || metric.label,
      metric.value,
      metric.unit || '',
      metric.category || '',
      metric.updatedAt ? format(new Date(metric.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''
    ]);

    return {
      title,
      subtitle,
      headers,
      data,
      metadata: {
        generatedAt: new Date(),
        generatedBy: 'Sistema BI'
      }
    };
  }

  /**
   * Converte dados de KPIs para formato de exportação
   */
  formatKPIsForExport(
    kpis: any[],
    title: string,
    subtitle?: string
  ): ExportData {
    const headers = ['KPI', 'Valor Atual', 'Meta', 'Variação', 'Status', 'Período'];
    const data = kpis.map(kpi => [
      kpi.name || kpi.label,
      kpi.currentValue,
      kpi.target || 'N/A',
      kpi.variation ? `${kpi.variation > 0 ? '+' : ''}${kpi.variation}%` : 'N/A',
      kpi.status || 'N/A',
      kpi.period || 'N/A'
    ]);

    return {
      title,
      subtitle,
      headers,
      data,
      metadata: {
        generatedAt: new Date(),
        generatedBy: 'Sistema BI'
      }
    };
  }

  /**
   * Converte dados de alertas para formato de exportação
   */
  formatAlertsForExport(
    alerts: any[],
    title: string,
    subtitle?: string
  ): ExportData {
    const headers = ['Alerta', 'Severidade', 'Tipo', 'Status', 'Disparado em', 'Resolvido em'];
    const data = alerts.map(alert => [
      alert.title || alert.name,
      alert.severity,
      alert.type,
      alert.isResolved ? 'Resolvido' : 'Ativo',
      format(new Date(alert.triggeredAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      alert.resolvedAt ? format(new Date(alert.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'
    ]);

    return {
      title,
      subtitle,
      headers,
      data,
      metadata: {
        generatedAt: new Date(),
        generatedBy: 'Sistema BI'
      }
    };
  }
}

export const exportService = new ExportService();
export default exportService;