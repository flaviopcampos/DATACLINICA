import { useState } from 'react';
import { Settings, Download, Eye, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import type { Invoice, Payment } from '@/types/billing';

interface PDFSettingsProps {
  invoice: Invoice;
  payments?: Payment[];
  trigger?: React.ReactNode;
}

interface PDFConfig {
  includePayments: boolean;
  includeNotes: boolean;
  watermark: string;
  logoUrl: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyCnpj: string;
  companyWebsite: string;
}

const defaultConfig: PDFConfig = {
  includePayments: true,
  includeNotes: true,
  watermark: '',
  logoUrl: '',
  companyName: 'DataClínica',
  companyAddress: 'Rua das Clínicas, 123 - Centro - São Paulo/SP',
  companyPhone: '(11) 1234-5678',
  companyEmail: 'contato@dataclinica.com.br',
  companyCnpj: '12.345.678/0001-90',
  companyWebsite: 'www.dataclinica.com.br'
};

export function PDFSettings({ invoice, payments = [], trigger }: PDFSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<PDFConfig>(defaultConfig);
  const { downloadPDF, previewPDF, emailPDF, isGenerating } = usePDFGenerator();

  const handleConfigChange = (key: keyof PDFConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const getPDFOptions = () => ({
    includePayments: config.includePayments,
    includeNotes: config.includeNotes,
    watermark: config.watermark || undefined,
    logoUrl: config.logoUrl || undefined
  });

  const handleDownload = async () => {
    await downloadPDF(invoice, payments, getPDFOptions());
    setIsOpen(false);
  };

  const handlePreview = async () => {
    await previewPDF(invoice, payments, getPDFOptions());
  };

  const handleEmail = async () => {
    await emailPDF(invoice, payments, getPDFOptions());
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurar PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações do PDF</DialogTitle>
          <DialogDescription>
            Personalize as opções de geração do PDF da fatura {invoice.invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Opções de Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Conteúdo do PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-payments" className="text-sm font-medium">
                  Incluir histórico de pagamentos
                </Label>
                <Switch
                  id="include-payments"
                  checked={config.includePayments}
                  onCheckedChange={(checked) => handleConfigChange('includePayments', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="include-notes" className="text-sm font-medium">
                  Incluir observações
                </Label>
                <Switch
                  id="include-notes"
                  checked={config.includeNotes}
                  onCheckedChange={(checked) => handleConfigChange('includeNotes', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personalização */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Personalização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="watermark" className="text-sm font-medium">
                  Marca d'água (opcional)
                </Label>
                <Input
                  id="watermark"
                  placeholder="Ex: PAGO, CANCELADO, RASCUNHO"
                  value={config.watermark}
                  onChange={(e) => handleConfigChange('watermark', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo-url" className="text-sm font-medium">
                  URL do Logo (opcional)
                </Label>
                <Input
                  id="logo-url"
                  placeholder="https://exemplo.com/logo.png"
                  value={config.logoUrl}
                  onChange={(e) => handleConfigChange('logoUrl', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name" className="text-sm font-medium">
                    Nome da Empresa
                  </Label>
                  <Input
                    id="company-name"
                    value={config.companyName}
                    onChange={(e) => handleConfigChange('companyName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-cnpj" className="text-sm font-medium">
                    CNPJ
                  </Label>
                  <Input
                    id="company-cnpj"
                    value={config.companyCnpj}
                    onChange={(e) => handleConfigChange('companyCnpj', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-address" className="text-sm font-medium">
                  Endereço
                </Label>
                <Textarea
                  id="company-address"
                  rows={2}
                  value={config.companyAddress}
                  onChange={(e) => handleConfigChange('companyAddress', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-phone" className="text-sm font-medium">
                    Telefone
                  </Label>
                  <Input
                    id="company-phone"
                    value={config.companyPhone}
                    onChange={(e) => handleConfigChange('companyPhone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={config.companyEmail}
                    onChange={(e) => handleConfigChange('companyEmail', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-website" className="text-sm font-medium">
                  Website (opcional)
                </Label>
                <Input
                  id="company-website"
                  value={config.companyWebsite}
                  onChange={(e) => handleConfigChange('companyWebsite', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={isGenerating}
              className="flex-1 sm:flex-none"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Visualizar'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleEmail}
              disabled={isGenerating}
              className="flex-1 sm:flex-none"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Baixando...' : 'Download'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PDFSettings;