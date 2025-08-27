import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Invoice, Payment } from '@/types/billing';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PDFOptions {
  includePayments?: boolean;
  includeNotes?: boolean;
  watermark?: string;
  logoUrl?: string;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  cnpj?: string;
  website?: string;
}

class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private formatCurrency(amount: number): string {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  private addHeader(companyInfo: CompanyInfo, logoUrl?: string): void {
    // Logo (se fornecido)
    if (logoUrl) {
      try {
        this.doc.addImage(logoUrl, 'PNG', this.margin, this.currentY, 30, 30);
      } catch (error) {
        console.warn('Erro ao adicionar logo:', error);
      }
    }

    // Informações da empresa
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(companyInfo.name, logoUrl ? this.margin + 40 : this.margin, this.currentY + 10);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(companyInfo.address, logoUrl ? this.margin + 40 : this.margin, this.currentY + 18);
    this.doc.text(`Tel: ${companyInfo.phone} | Email: ${companyInfo.email}`, logoUrl ? this.margin + 40 : this.margin, this.currentY + 25);
    
    if (companyInfo.cnpj) {
      this.doc.text(`CNPJ: ${companyInfo.cnpj}`, logoUrl ? this.margin + 40 : this.margin, this.currentY + 32);
    }

    this.currentY += 50;
  }

  private addInvoiceHeader(invoice: Invoice): void {
    // Título da fatura
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FATURA', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 15;

    // Informações da fatura
    const leftColumn = this.margin;
    const rightColumn = this.pageWidth - this.margin - 80;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Número:', leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(invoice.invoiceNumber, leftColumn + 25, this.currentY);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Data de Emissão:', rightColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatDate(invoice.issueDate), rightColumn + 40, this.currentY);

    this.currentY += 8;

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Tipo:', leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.getTypeLabel(invoice.type), leftColumn + 25, this.currentY);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Vencimento:', rightColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatDate(invoice.dueDate), rightColumn + 40, this.currentY);

    this.currentY += 8;

    // Status da fatura
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Status:', leftColumn, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    
    // Cor do status
    const statusColor = this.getStatusColor(invoice.status);
    this.doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
    this.doc.text(this.getStatusLabel(invoice.status), leftColumn + 25, this.currentY);
    this.doc.setTextColor(0, 0, 0); // Reset to black

    this.currentY += 15;
  }

  private addPatientInfo(invoice: Invoice): void {
    // Título
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DADOS DO PACIENTE', this.margin, this.currentY);
    
    this.currentY += 10;

    // Informações do paciente (simuladas - em um caso real, viriam da API)
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Nome: ${invoice.patientName || 'Nome do Paciente'}`, this.margin, this.currentY);
    this.currentY += 6;
    this.doc.text(`CPF: ${invoice.patientDocument || '000.000.000-00'}`, this.margin, this.currentY);
    this.currentY += 6;
    this.doc.text(`Telefone: ${invoice.patientPhone || '(00) 00000-0000'}`, this.margin, this.currentY);
    this.currentY += 6;
    this.doc.text(`Email: ${invoice.patientEmail || 'email@exemplo.com'}`, this.margin, this.currentY);
    
    this.currentY += 15;
  }

  private addItemsTable(invoice: Invoice): void {
    // Preparar dados da tabela
    const tableData = invoice.items.map((item, index) => [
      (index + 1).toString(),
      item.description,
      item.quantity.toString(),
      this.formatCurrency(item.unitPrice),
      `${item.discount || 0}%`,
      this.formatCurrency(item.total)
    ]);

    // Configurar tabela
    this.doc.autoTable({
      startY: this.currentY,
      head: [['#', 'Descrição', 'Qtd', 'Preço Unit.', 'Desc.', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  private addTotals(invoice: Invoice): void {
    const rightAlign = this.pageWidth - this.margin;
    const labelX = rightAlign - 60;
    const valueX = rightAlign;

    this.doc.setFontSize(10);
    
    // Subtotal
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Subtotal:', labelX, this.currentY, { align: 'left' });
    this.doc.text(this.formatCurrency(invoice.subtotal), valueX, this.currentY, { align: 'right' });
    this.currentY += 6;

    // Desconto
    if (invoice.discountAmount && invoice.discountAmount > 0) {
      this.doc.text('Desconto:', labelX, this.currentY, { align: 'left' });
      this.doc.text(`-${this.formatCurrency(invoice.discountAmount)}`, valueX, this.currentY, { align: 'right' });
      this.currentY += 6;
    }

    // Impostos
    if (invoice.taxAmount && invoice.taxAmount > 0) {
      this.doc.text('Impostos/Taxas:', labelX, this.currentY, { align: 'left' });
      this.doc.text(this.formatCurrency(invoice.taxAmount), valueX, this.currentY, { align: 'right' });
      this.currentY += 6;
    }

    // Linha separadora
    this.doc.line(labelX, this.currentY, valueX, this.currentY);
    this.currentY += 4;

    // Total
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TOTAL:', labelX, this.currentY, { align: 'left' });
    this.doc.text(this.formatCurrency(invoice.totalAmount), valueX, this.currentY, { align: 'right' });
    
    this.currentY += 15;
  }

  private addPaymentHistory(payments: Payment[]): void {
    if (!payments || payments.length === 0) return;

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('HISTÓRICO DE PAGAMENTOS', this.margin, this.currentY);
    
    this.currentY += 10;

    // Preparar dados da tabela de pagamentos
    const paymentData = payments.map(payment => [
      this.formatDate(payment.paymentDate),
      this.getMethodLabel(payment.method),
      this.formatCurrency(payment.amount),
      this.getStatusLabel(payment.status),
      payment.reference || '-'
    ]);

    // Tabela de pagamentos
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Data', 'Método', 'Valor', 'Status', 'Referência']],
      body: paymentData,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 40 }
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  private addNotes(invoice: Invoice): void {
    if (!invoice.notes) return;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('OBSERVAÇÕES', this.margin, this.currentY);
    
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Quebrar texto em linhas
    const lines = this.doc.splitTextToSize(invoice.notes, this.pageWidth - 2 * this.margin);
    this.doc.text(lines, this.margin, this.currentY);
    
    this.currentY += lines.length * 5 + 10;
  }

  private addPaymentTerms(invoice: Invoice): void {
    if (!invoice.paymentTerms) return;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Condições de Pagamento:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(invoice.paymentTerms, this.margin + 50, this.currentY);
    
    this.currentY += 10;
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 20;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(128, 128, 128);
    
    // Data de geração
    const generatedAt = new Date().toLocaleString('pt-BR');
    this.doc.text(`Documento gerado em: ${generatedAt}`, this.margin, footerY);
    
    // Número da página
    const pageNumber = this.doc.internal.getCurrentPageInfo().pageNumber;
    this.doc.text(`Página ${pageNumber}`, this.pageWidth - this.margin, footerY, { align: 'right' });
    
    this.doc.setTextColor(0, 0, 0); // Reset to black
  }

  private addWatermark(text: string): void {
    this.doc.setFontSize(50);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(200, 200, 200);
    
    // Rotacionar e adicionar marca d'água
    this.doc.text(text, this.pageWidth / 2, this.pageHeight / 2, {
      align: 'center',
      angle: 45
    });
    
    this.doc.setTextColor(0, 0, 0); // Reset to black
  }

  private getTypeLabel(type: string): string {
    const types: Record<string, string> = {
      consultation: 'Consulta',
      procedure: 'Procedimento',
      exam: 'Exame',
      treatment: 'Tratamento',
      other: 'Outros'
    };
    return types[type] || type;
  }

  private getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      draft: 'Rascunho',
      sent: 'Enviada',
      paid: 'Paga',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
      pending: 'Pendente',
      confirmed: 'Confirmado',
      refunded: 'Estornado'
    };
    return statuses[status] || status;
  }

  private getStatusColor(status: string): { r: number; g: number; b: number } {
    const colors: Record<string, { r: number; g: number; b: number }> = {
      draft: { r: 156, g: 163, b: 175 },
      sent: { r: 59, g: 130, b: 246 },
      paid: { r: 34, g: 197, b: 94 },
      overdue: { r: 239, g: 68, b: 68 },
      cancelled: { r: 107, g: 114, b: 128 },
      pending: { r: 245, g: 158, b: 11 },
      confirmed: { r: 34, g: 197, b: 94 },
      refunded: { r: 59, g: 130, b: 246 }
    };
    return colors[status] || { r: 0, g: 0, b: 0 };
  }

  private getMethodLabel(method: string): string {
    const methods: Record<string, string> = {
      cash: 'Dinheiro',
      card: 'Cartão',
      pix: 'PIX',
      transfer: 'Transferência',
      check: 'Cheque',
      insurance: 'Convênio'
    };
    return methods[method] || method;
  }

  public generateInvoicePDF(
    invoice: Invoice, 
    payments: Payment[] = [], 
    companyInfo: CompanyInfo,
    options: PDFOptions = {}
  ): jsPDF {
    // Reset position
    this.currentY = 20;

    // Adicionar cabeçalho
    this.addHeader(companyInfo, options.logoUrl);

    // Adicionar marca d'água se especificada
    if (options.watermark) {
      this.addWatermark(options.watermark);
    }

    // Adicionar informações da fatura
    this.addInvoiceHeader(invoice);

    // Adicionar informações do paciente
    this.addPatientInfo(invoice);

    // Adicionar tabela de itens
    this.addItemsTable(invoice);

    // Adicionar totais
    this.addTotals(invoice);

    // Adicionar histórico de pagamentos se solicitado
    if (options.includePayments && payments.length > 0) {
      this.addPaymentHistory(payments);
    }

    // Adicionar observações se solicitado
    if (options.includeNotes) {
      this.addNotes(invoice);
    }

    // Adicionar condições de pagamento
    this.addPaymentTerms(invoice);

    // Adicionar rodapé
    this.addFooter();

    return this.doc;
  }

  public downloadPDF(filename: string): void {
    this.doc.save(filename);
  }

  public getPDFBlob(): Blob {
    return this.doc.output('blob');
  }

  public getPDFDataUri(): string {
    return this.doc.output('datauristring');
  }
}

// Função utilitária para gerar PDF de fatura
export const generateInvoicePDF = (
  invoice: Invoice,
  payments: Payment[] = [],
  options: PDFOptions = {}
): jsPDF => {
  // Informações da empresa (em um caso real, viriam de configuração)
  const companyInfo: CompanyInfo = {
    name: 'DataClínica',
    address: 'Rua das Clínicas, 123 - Centro - São Paulo/SP',
    phone: '(11) 1234-5678',
    email: 'contato@dataclinica.com.br',
    cnpj: '12.345.678/0001-90',
    website: 'www.dataclinica.com.br'
  };

  const generator = new PDFGenerator();
  return generator.generateInvoicePDF(invoice, payments, companyInfo, options);
};

// Função para download direto
export const downloadInvoicePDF = (
  invoice: Invoice,
  payments: Payment[] = [],
  options: PDFOptions = {}
): void => {
  const pdf = generateInvoicePDF(invoice, payments, options);
  const filename = `fatura-${invoice.invoiceNumber}.pdf`;
  pdf.save(filename);
};

// Função para obter blob do PDF
export const getInvoicePDFBlob = (
  invoice: Invoice,
  payments: Payment[] = [],
  options: PDFOptions = {}
): Blob => {
  const pdf = generateInvoicePDF(invoice, payments, options);
  return pdf.output('blob');
};

export default PDFGenerator;