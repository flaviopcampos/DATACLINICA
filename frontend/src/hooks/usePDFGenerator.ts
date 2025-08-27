import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Invoice, Payment } from '@/types/billing';
import { 
  generateInvoicePDF, 
  downloadInvoicePDF, 
  getInvoicePDFBlob 
} from '@/utils/pdfGenerator';

interface PDFOptions {
  includePayments?: boolean;
  includeNotes?: boolean;
  watermark?: string;
  logoUrl?: string;
}

interface UsePDFGeneratorReturn {
  isGenerating: boolean;
  generatePDF: (invoice: Invoice, payments?: Payment[], options?: PDFOptions) => Promise<void>;
  downloadPDF: (invoice: Invoice, payments?: Payment[], options?: PDFOptions) => Promise<void>;
  getPDFBlob: (invoice: Invoice, payments?: Payment[], options?: PDFOptions) => Promise<Blob | null>;
  previewPDF: (invoice: Invoice, payments?: Payment[], options?: PDFOptions) => Promise<void>;
  emailPDF: (invoice: Invoice, payments?: Payment[], options?: PDFOptions) => Promise<Blob | null>;
}

export const usePDFGenerator = (): UsePDFGeneratorReturn => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(async (
    invoice: Invoice, 
    payments: Payment[] = [], 
    options: PDFOptions = {}
  ): Promise<void> => {
    setIsGenerating(true);
    
    try {
      const pdf = generateInvoicePDF(invoice, payments, options);
      
      // Abrir PDF em nova aba para visualização
      const pdfDataUri = pdf.output('datauristring');
      const newWindow = window.open();
      
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Fatura ${invoice.invoiceNumber}</title>
              <style>
                body { margin: 0; padding: 0; }
                iframe { width: 100%; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${pdfDataUri}" type="application/pdf"></iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        toast.error('Não foi possível abrir o PDF. Verifique se o bloqueador de pop-ups está desabilitado.');
      }
      
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadPDF = useCallback(async (
    invoice: Invoice, 
    payments: Payment[] = [], 
    options: PDFOptions = {}
  ): Promise<void> => {
    setIsGenerating(true);
    
    try {
      downloadInvoicePDF(invoice, payments, options);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao baixar PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const getPDFBlob = useCallback(async (
    invoice: Invoice, 
    payments: Payment[] = [], 
    options: PDFOptions = {}
  ): Promise<Blob | null> => {
    setIsGenerating(true);
    
    try {
      const blob = getInvoicePDFBlob(invoice, payments, options);
      return blob;
    } catch (error) {
      console.error('Erro ao gerar blob do PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const previewPDF = useCallback(async (
    invoice: Invoice, 
    payments: Payment[] = [], 
    options: PDFOptions = {}
  ): Promise<void> => {
    setIsGenerating(true);
    
    try {
      const pdf = generateInvoicePDF(invoice, payments, options);
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      
      // Abrir em nova aba
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        toast.error('Não foi possível abrir o PDF. Verifique se o bloqueador de pop-ups está desabilitado.');
        return;
      }
      
      // Limpar URL após um tempo
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
      
      toast.success('PDF aberto para visualização!');
    } catch (error) {
      console.error('Erro ao visualizar PDF:', error);
      toast.error('Erro ao visualizar PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const emailPDF = useCallback(async (
    invoice: Invoice, 
    payments: Payment[] = [], 
    options: PDFOptions = {}
  ): Promise<Blob | null> => {
    setIsGenerating(true);
    
    try {
      const blob = getInvoicePDFBlob(invoice, payments, options);
      
      // Em um caso real, aqui seria feita a integração com o serviço de email
      // Por enquanto, apenas retornamos o blob para uso posterior
      toast.success('PDF preparado para envio por email!');
      
      return blob;
    } catch (error) {
      console.error('Erro ao preparar PDF para email:', error);
      toast.error('Erro ao preparar PDF para email. Tente novamente.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    generatePDF,
    downloadPDF,
    getPDFBlob,
    previewPDF,
    emailPDF
  };
};

// Hook específico para download rápido
export const useQuickPDFDownload = () => {
  const { downloadPDF, isGenerating } = usePDFGenerator();
  
  const quickDownload = useCallback(async (invoice: Invoice, includePayments = true) => {
    await downloadPDF(invoice, [], { 
      includePayments, 
      includeNotes: true 
    });
  }, [downloadPDF]);
  
  return { quickDownload, isGenerating };
};

// Hook para preview rápido
export const useQuickPDFPreview = () => {
  const { previewPDF, isGenerating } = usePDFGenerator();
  
  const quickPreview = useCallback(async (invoice: Invoice, includePayments = true) => {
    await previewPDF(invoice, [], { 
      includePayments, 
      includeNotes: true 
    });
  }, [previewPDF]);
  
  return { quickPreview, isGenerating };
};

export default usePDFGenerator;