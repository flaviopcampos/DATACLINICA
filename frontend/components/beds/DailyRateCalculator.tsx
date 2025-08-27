import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bed as BedIcon,
  CreditCard,
  Info,
  BarChart3
} from 'lucide-react';
import { PaymentType, BedType, DailyRateConfig, DailyRateTier } from '@/types/beds';

interface DailyRateCalculatorProps {
  dailyRates: DailyRateConfig[];
  className?: string;
}

interface CalculationResult {
  totalCost: number;
  dailyValue: number;
  appliedTier?: DailyRateTier;
  breakdown: {
    baseCost: number;
    tierAdjustment: number;
    tierPercentage: number;
  };
}

const paymentTypes: { value: PaymentType; label: string; color: string }[] = [
  { value: 'PRIVATE', label: 'Particular', color: 'bg-blue-500' },
  { value: 'INSURANCE', label: 'Convênio', color: 'bg-green-500' },
  { value: 'SUS', label: 'SUS', color: 'bg-orange-500' }
];

const bedTypes: { value: BedType; label: string; icon: React.ReactNode }[] = [
  { value: 'STANDARD', label: 'Padrão', icon: <BedIcon className="h-4 w-4" /> },
  { value: 'ICU', label: 'UTI', icon: <BedIcon className="h-4 w-4" /> },
  { value: 'SEMI_ICU', label: 'Semi-UTI', icon: <BedIcon className="h-4 w-4" /> },
  { value: 'ISOLATION', label: 'Isolamento', icon: <BedIcon className="h-4 w-4" /> }
];

export default function DailyRateCalculator({ dailyRates, className = '' }: DailyRateCalculatorProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>('PRIVATE');
  const [bedType, setBedType] = useState<BedType>('STANDARD');
  const [days, setDays] = useState<number>(1);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [comparisonResults, setComparisonResults] = useState<Record<PaymentType, CalculationResult>>({} as Record<PaymentType, CalculationResult>);

  // Calcular custo quando parâmetros mudarem
  useEffect(() => {
    calculateCost();
    calculateComparison();
  }, [paymentType, bedType, days, dailyRates]);

  const calculateCost = () => {
    const rateConfig = dailyRates.find(r => 
      r.payment_type === paymentType && r.bed_type === bedType
    );
    
    if (!rateConfig) {
      setCalculation(null);
      return;
    }
    
    let dailyValue = rateConfig.base_value;
    let appliedTier: DailyRateTier | undefined;
    
    // Encontrar a faixa aplicável
    const tier = rateConfig.tiers.find(t => days >= t.min_days && days <= t.max_days);
    if (tier) {
      dailyValue = tier.value;
      appliedTier = tier;
    }
    
    const totalCost = dailyValue * days;
    const baseCost = rateConfig.base_value * days;
    const tierAdjustment = totalCost - baseCost;
    const tierPercentage = baseCost > 0 ? ((tierAdjustment / baseCost) * 100) : 0;
    
    setCalculation({
      totalCost,
      dailyValue,
      appliedTier,
      breakdown: {
        baseCost,
        tierAdjustment,
        tierPercentage
      }
    });
  };

  const calculateComparison = () => {
    const results: Record<PaymentType, CalculationResult> = {} as Record<PaymentType, CalculationResult>;
    
    paymentTypes.forEach(({ value: pType }) => {
      const rateConfig = dailyRates.find(r => 
        r.payment_type === pType && r.bed_type === bedType
      );
      
      if (rateConfig) {
        let dailyValue = rateConfig.base_value;
        let appliedTier: DailyRateTier | undefined;
        
        const tier = rateConfig.tiers.find(t => days >= t.min_days && days <= t.max_days);
        if (tier) {
          dailyValue = tier.value;
          appliedTier = tier;
        }
        
        const totalCost = dailyValue * days;
        const baseCost = rateConfig.base_value * days;
        const tierAdjustment = totalCost - baseCost;
        const tierPercentage = baseCost > 0 ? ((tierAdjustment / baseCost) * 100) : 0;
        
        results[pType] = {
          totalCost,
          dailyValue,
          appliedTier,
          breakdown: {
            baseCost,
            tierAdjustment,
            tierPercentage
          }
        };
      }
    });
    
    setComparisonResults(results);
  };

  const getCurrentRateConfig = () => {
    return dailyRates.find(r => 
      r.payment_type === paymentType && r.bed_type === bedType
    );
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const rateConfig = getCurrentRateConfig();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calculadora Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Simulador de Custos
          </CardTitle>
          <CardDescription>
            Calcule o custo estimado de internação baseado no tipo de pagamento, leito e duração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label>Tipo de Pagamento</Label>
              <Select value={paymentType} onValueChange={(value) => setPaymentType(value as PaymentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${type.color} mr-2`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Tipo de Leito</Label>
              <Select value={bedType} onValueChange={(value) => setBedType(value as BedType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bedTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {type.icon}
                        <span className="ml-2">{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Dias de Internação</Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                placeholder="Ex: 5"
              />
            </div>
          </div>
          
          {calculation && (
            <div className="space-y-4">
              {/* Resultado Principal */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="h-6 w-6 text-primary mr-2" />
                      <span className="text-3xl font-bold text-primary">
                        {formatCurrency(calculation.totalCost)}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      Custo total estimado para {days} {days === 1 ? 'dia' : 'dias'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Valor da diária: {formatCurrency(calculation.dailyValue)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Detalhamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalhamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Valor base ({days} {days === 1 ? 'dia' : 'dias'}):</span>
                        <span>{formatCurrency(calculation.breakdown.baseCost)}</span>
                      </div>
                      
                      {calculation.appliedTier && (
                        <>
                          <Separator />
                          <div className="flex justify-between items-center">
                            <span>Faixa aplicada:</span>
                            <Badge variant="outline">
                              {calculation.appliedTier.min_days}-{calculation.appliedTier.max_days} dias
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Ajuste da faixa:</span>
                            <div className="flex items-center">
                              {calculation.breakdown.tierAdjustment > 0 ? (
                                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                              ) : calculation.breakdown.tierAdjustment < 0 ? (
                                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                              ) : null}
                              <span className={`${
                                calculation.breakdown.tierAdjustment > 0 ? 'text-red-600' :
                                calculation.breakdown.tierAdjustment < 0 ? 'text-green-600' :
                                'text-muted-foreground'
                              }`}>
                                {calculation.breakdown.tierAdjustment >= 0 ? '+' : ''}
                                {formatCurrency(calculation.breakdown.tierAdjustment)}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">
                                ({calculation.breakdown.tierPercentage >= 0 ? '+' : ''}
                                {calculation.breakdown.tierPercentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(calculation.totalCost)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Faixas de Preço */}
                {rateConfig && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Faixas de Preço</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Valor base:</span>
                          <span>{formatCurrency(rateConfig.base_value)}/dia</span>
                        </div>
                        
                        {rateConfig.tiers.map((tier, index) => (
                          <div 
                            key={index}
                            className={`flex justify-between text-sm p-2 rounded ${
                              calculation.appliedTier?.min_days === tier.min_days &&
                              calculation.appliedTier?.max_days === tier.max_days
                                ? 'bg-primary/10 border border-primary/20'
                                : 'bg-muted/30'
                            }`}
                          >
                            <span>{tier.min_days}-{tier.max_days} dias:</span>
                            <span className="font-medium">{formatCurrency(tier.value)}/dia</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          {!calculation && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Configuração de preços não encontrada para os parâmetros selecionados.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Comparação entre Tipos de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Comparação de Custos
          </CardTitle>
          <CardDescription>
            Compare os custos entre diferentes tipos de pagamento para {bedTypes.find(b => b.value === bedType)?.label} por {days} {days === 1 ? 'dia' : 'dias'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentTypes.map(({ value: pType, label, color }) => {
              const result = comparisonResults[pType];
              const isSelected = pType === paymentType;
              
              return (
                <Card 
                  key={pType}
                  className={`transition-all ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:shadow-md cursor-pointer'
                  }`}
                  onClick={() => setPaymentType(pType)}
                >
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className={`w-3 h-3 rounded-full ${color} mr-2`} />
                        <span className="font-semibold">{label}</span>
                      </div>
                      
                      {result ? (
                        <>
                          <div className="text-2xl font-bold text-primary mb-1">
                            {formatCurrency(result.totalCost)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(result.dailyValue)}/dia
                          </div>
                          
                          {result.appliedTier && (
                            <Badge variant="outline" className="mt-2">
                              Faixa {result.appliedTier.min_days}-{result.appliedTier.max_days} dias
                            </Badge>
                          )}
                        </>
                      ) : (
                        <div className="text-muted-foreground">
                          <p>Não configurado</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}