"""Utilitários para cálculos financeiros e relatórios

Este módulo contém funções auxiliares para cálculos financeiros,
geração de relatórios e análise de KPIs específicos para clínicas médicas.
"""

from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional, Tuple
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
import models
import schemas

class FinancialCalculator:
    """Calculadora para métricas financeiras de clínicas"""
    
    def __init__(self, db: Session, clinic_id: int):
        self.db = db
        self.clinic_id = clinic_id
    
    def calculate_revenue_per_patient(self, start_date: date, end_date: date) -> Decimal:
        """Calcula receita média por paciente no período"""
        # Buscar faturamento do período
        billing_items = self.db.query(models.BillingItem).join(models.BillingBatch).filter(
            models.BillingBatch.clinic_id == self.clinic_id,
            models.BillingItem.service_date >= start_date,
            models.BillingItem.service_date <= end_date
        ).all()
        
        if not billing_items:
            return Decimal('0.00')
        
        total_revenue = sum([item.amount for item in billing_items])
        unique_patients = len(set([item.patient_id for item in billing_items]))
        
        if unique_patients == 0:
            return Decimal('0.00')
        
        return Decimal(str(total_revenue / unique_patients)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def calculate_average_ticket(self, start_date: date, end_date: date) -> Decimal:
        """Calcula ticket médio por procedimento"""
        billing_items = self.db.query(models.BillingItem).join(models.BillingBatch).filter(
            models.BillingBatch.clinic_id == self.clinic_id,
            models.BillingItem.service_date >= start_date,
            models.BillingItem.service_date <= end_date
        ).all()
        
        if not billing_items:
            return Decimal('0.00')
        
        total_revenue = sum([item.amount for item in billing_items])
        total_procedures = len(billing_items)
        
        return Decimal(str(total_revenue / total_procedures)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def calculate_default_rate(self, start_date: date, end_date: date) -> Decimal:
        """Calcula taxa de inadimplência no período"""
        accounts_receivable = self.db.query(models.AccountsReceivable).filter(
            models.AccountsReceivable.clinic_id == self.clinic_id,
            models.AccountsReceivable.due_date >= start_date,
            models.AccountsReceivable.due_date <= end_date
        ).all()
        
        if not accounts_receivable:
            return Decimal('0.00')
        
        overdue_accounts = [ar for ar in accounts_receivable 
                           if ar.due_date < date.today() and ar.status == 'pending']
        
        default_rate = (len(overdue_accounts) / len(accounts_receivable)) * 100
        return Decimal(str(default_rate)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def calculate_average_collection_time(self, start_date: date, end_date: date) -> int:
        """Calcula tempo médio de recebimento em dias"""
        paid_receivables = self.db.query(models.AccountsReceivable).filter(
            models.AccountsReceivable.clinic_id == self.clinic_id,
            models.AccountsReceivable.due_date >= start_date,
            models.AccountsReceivable.due_date <= end_date,
            models.AccountsReceivable.status == 'paid',
            models.AccountsReceivable.payment_date.isnot(None)
        ).all()
        
        if not paid_receivables:
            return 0
        
        total_days = sum([(ar.payment_date - ar.due_date).days for ar in paid_receivables])
        avg_days = total_days / len(paid_receivables)
        
        return max(0, int(avg_days))  # Não pode ser negativo
    
    def calculate_profit_margin_by_insurance(self, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """Calcula margem de lucro por convênio"""
        # Buscar faturamento por convênio
        billing_by_insurance = self.db.query(
            models.InsuranceCompany.name,
            func.sum(models.BillingItem.amount).label('total_revenue'),
            func.count(models.BillingItem.id).label('total_procedures')
        ).join(models.BillingBatch).join(models.BillingItem).filter(
            models.BillingBatch.clinic_id == self.clinic_id,
            models.BillingItem.service_date >= start_date,
            models.BillingItem.service_date <= end_date
        ).group_by(models.InsuranceCompany.name).all()
        
        results = []
        for insurance_name, total_revenue, total_procedures in billing_by_insurance:
            # Estimar custos (30% da receita como estimativa)
            estimated_costs = total_revenue * Decimal('0.30')
            profit = total_revenue - estimated_costs
            margin = (profit / total_revenue * 100) if total_revenue > 0 else 0
            
            results.append({
                'insurance_name': insurance_name,
                'total_revenue': float(total_revenue),
                'estimated_costs': float(estimated_costs),
                'profit': float(profit),
                'margin_percentage': float(margin),
                'total_procedures': total_procedures
            })
        
        return results
    
    def calculate_cost_per_appointment(self, start_date: date, end_date: date) -> Decimal:
        """Calcula custo médio por atendimento"""
        # Buscar total de consultas
        total_appointments = self.db.query(models.Appointment).filter(
            models.Appointment.clinic_id == self.clinic_id,
            models.Appointment.appointment_date >= start_date,
            models.Appointment.appointment_date <= end_date,
            models.Appointment.status == 'completed'
        ).count()
        
        if total_appointments == 0:
            return Decimal('0.00')
        
        # Buscar total de despesas operacionais
        total_expenses = self.db.query(func.sum(models.AccountsPayable.amount)).filter(
            models.AccountsPayable.clinic_id == self.clinic_id,
            models.AccountsPayable.due_date >= start_date,
            models.AccountsPayable.due_date <= end_date,
            models.AccountsPayable.status == 'paid',
            models.AccountsPayable.category.in_(['salarios', 'aluguel', 'utilities', 'materiais_medicos'])
        ).scalar() or 0
        
        cost_per_appointment = total_expenses / total_appointments
        return Decimal(str(cost_per_appointment)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def calculate_roi_per_doctor(self, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """Calcula ROI por médico"""
        # Buscar receita por médico
        revenue_by_doctor = self.db.query(
            models.Doctor.name,
            func.sum(models.BillingItem.amount).label('total_revenue'),
            func.count(models.BillingItem.id).label('total_procedures')
        ).join(models.Appointment).join(models.BillingBatch).join(models.BillingItem).filter(
            models.Appointment.clinic_id == self.clinic_id,
            models.BillingItem.service_date >= start_date,
            models.BillingItem.service_date <= end_date
        ).group_by(models.Doctor.id, models.Doctor.name).all()
        
        results = []
        for doctor_name, total_revenue, total_procedures in revenue_by_doctor:
            # Buscar repasses do médico
            doctor_payments = self.db.query(func.sum(models.DoctorPayment.net_amount)).join(models.Doctor).filter(
                models.DoctorPayment.clinic_id == self.clinic_id,
                models.Doctor.name == doctor_name,
                models.DoctorPayment.reference_period >= start_date.strftime('%Y-%m'),
                models.DoctorPayment.reference_period <= end_date.strftime('%Y-%m')
            ).scalar() or 0
            
            # Calcular ROI
            investment = float(doctor_payments)
            revenue = float(total_revenue)
            roi = ((revenue - investment) / investment * 100) if investment > 0 else 0
            
            results.append({
                'doctor_name': doctor_name,
                'total_revenue': revenue,
                'total_investment': investment,
                'roi_percentage': roi,
                'total_procedures': total_procedures
            })
        
        return results
    
    def calculate_occupancy_rate(self, start_date: date, end_date: date) -> Decimal:
        """Calcula taxa de ocupação de consultas"""
        # Buscar total de horários disponíveis (estimativa: 8 horas/dia * 60min / 30min = 16 slots/dia)
        total_days = (end_date - start_date).days + 1
        total_doctors = self.db.query(models.Doctor).filter(
            models.Doctor.clinic_id == self.clinic_id,
            models.Doctor.is_active == True
        ).count()
        
        estimated_slots = total_days * total_doctors * 16  # 16 slots por médico por dia
        
        # Buscar consultas realizadas
        completed_appointments = self.db.query(models.Appointment).filter(
            models.Appointment.clinic_id == self.clinic_id,
            models.Appointment.appointment_date >= start_date,
            models.Appointment.appointment_date <= end_date,
            models.Appointment.status.in_(['completed', 'confirmed'])
        ).count()
        
        if estimated_slots == 0:
            return Decimal('0.00')
        
        occupancy_rate = (completed_appointments / estimated_slots) * 100
        return Decimal(str(occupancy_rate)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

class ReportGenerator:
    """Gerador de relatórios financeiros"""
    
    def __init__(self, db: Session, clinic_id: int):
        self.db = db
        self.clinic_id = clinic_id
        self.calculator = FinancialCalculator(db, clinic_id)
    
    def generate_dre_report(self, start_date: date, end_date: date) -> schemas.DREReport:
        """Gera relatório de DRE detalhado"""
        # Receitas
        receitas = self.db.query(func.sum(models.AccountsReceivable.amount)).filter(
            models.AccountsReceivable.clinic_id == self.clinic_id,
            models.AccountsReceivable.due_date >= start_date,
            models.AccountsReceivable.due_date <= end_date,
            models.AccountsReceivable.status == 'paid'
        ).scalar() or 0
        
        # Custos diretos (medicamentos, materiais médicos)
        custos_diretos = self.db.query(func.sum(models.AccountsPayable.amount)).filter(
            models.AccountsPayable.clinic_id == self.clinic_id,
            models.AccountsPayable.due_date >= start_date,
            models.AccountsPayable.due_date <= end_date,
            models.AccountsPayable.status == 'paid',
            models.AccountsPayable.category.in_(['medicamentos', 'materiais_medicos'])
        ).scalar() or 0
        
        # Despesas operacionais
        despesas_operacionais = self.db.query(func.sum(models.AccountsPayable.amount)).filter(
            models.AccountsPayable.clinic_id == self.clinic_id,
            models.AccountsPayable.due_date >= start_date,
            models.AccountsPayable.due_date <= end_date,
            models.AccountsPayable.status == 'paid',
            models.AccountsPayable.category.not_in(['medicamentos', 'materiais_medicos'])
        ).scalar() or 0
        
        # Cálculos
        receita_bruta = Decimal(str(receitas))
        impostos_estimados = receita_bruta * Decimal('0.15')  # 15% estimativa
        receita_liquida = receita_bruta - impostos_estimados
        custos_diretos_dec = Decimal(str(custos_diretos))
        despesas_operacionais_dec = Decimal(str(despesas_operacionais))
        
        lucro_bruto = receita_liquida - custos_diretos_dec
        lucro_operacional = lucro_bruto - despesas_operacionais_dec
        
        margem_bruta = (lucro_bruto / receita_liquida * 100) if receita_liquida > 0 else 0
        margem_operacional = (lucro_operacional / receita_liquida * 100) if receita_liquida > 0 else 0
        
        return schemas.DREReport(
            period_start=start_date,
            period_end=end_date,
            receita_bruta=float(receita_bruta),
            receita_liquida=float(receita_liquida),
            custos_diretos=float(custos_diretos_dec),
            lucro_bruto=float(lucro_bruto),
            despesas_operacionais=float(despesas_operacionais_dec),
            lucro_operacional=float(lucro_operacional),
            margem_bruta=float(margem_bruta),
            margem_operacional=float(margem_operacional)
        )
    
    def generate_cash_flow_projection(self, days_ahead: int = 90) -> List[Dict[str, Any]]:
        """Gera projeção de fluxo de caixa"""
        today = date.today()
        end_date = today + timedelta(days=days_ahead)
        
        # Contas a receber futuras
        future_receivables = self.db.query(models.AccountsReceivable).filter(
            models.AccountsReceivable.clinic_id == self.clinic_id,
            models.AccountsReceivable.due_date >= today,
            models.AccountsReceivable.due_date <= end_date,
            models.AccountsReceivable.status == 'pending'
        ).all()
        
        # Contas a pagar futuras
        future_payables = self.db.query(models.AccountsPayable).filter(
            models.AccountsPayable.clinic_id == self.clinic_id,
            models.AccountsPayable.due_date >= today,
            models.AccountsPayable.due_date <= end_date,
            models.AccountsPayable.status == 'pending'
        ).all()
        
        # Agrupar por data
        cash_flow_by_date = {}
        
        # Adicionar recebimentos
        for receivable in future_receivables:
            date_str = receivable.due_date.strftime('%Y-%m-%d')
            if date_str not in cash_flow_by_date:
                cash_flow_by_date[date_str] = {'inflow': 0, 'outflow': 0, 'net': 0}
            cash_flow_by_date[date_str]['inflow'] += float(receivable.amount)
        
        # Adicionar pagamentos
        for payable in future_payables:
            date_str = payable.due_date.strftime('%Y-%m-%d')
            if date_str not in cash_flow_by_date:
                cash_flow_by_date[date_str] = {'inflow': 0, 'outflow': 0, 'net': 0}
            cash_flow_by_date[date_str]['outflow'] += float(payable.amount)
        
        # Calcular fluxo líquido
        for date_str in cash_flow_by_date:
            cash_flow_by_date[date_str]['net'] = (
                cash_flow_by_date[date_str]['inflow'] - cash_flow_by_date[date_str]['outflow']
            )
        
        # Converter para lista ordenada
        result = []
        for date_str in sorted(cash_flow_by_date.keys()):
            result.append({
                'date': date_str,
                'inflow': cash_flow_by_date[date_str]['inflow'],
                'outflow': cash_flow_by_date[date_str]['outflow'],
                'net_flow': cash_flow_by_date[date_str]['net']
            })
        
        return result
    
    def generate_financial_alerts(self) -> List[Dict[str, Any]]:
        """Gera alertas financeiros automáticos"""
        alerts = []
        today = date.today()
        
        # Alerta de contas vencidas
        overdue_count = self.db.query(models.AccountsReceivable).filter(
            models.AccountsReceivable.clinic_id == self.clinic_id,
            models.AccountsReceivable.due_date < today,
            models.AccountsReceivable.status == 'pending'
        ).count()
        
        if overdue_count > 0:
            alerts.append({
                'type': 'warning',
                'title': 'Contas em Atraso',
                'message': f'Existem {overdue_count} contas a receber em atraso',
                'priority': 'high'
            })
        
        # Alerta de fluxo de caixa negativo
        next_30_days = today + timedelta(days=30)
        future_inflow = self.db.query(func.sum(models.AccountsReceivable.amount)).filter(
            models.AccountsReceivable.clinic_id == self.clinic_id,
            models.AccountsReceivable.due_date >= today,
            models.AccountsReceivable.due_date <= next_30_days,
            models.AccountsReceivable.status == 'pending'
        ).scalar() or 0
        
        future_outflow = self.db.query(func.sum(models.AccountsPayable.amount)).filter(
            models.AccountsPayable.clinic_id == self.clinic_id,
            models.AccountsPayable.due_date >= today,
            models.AccountsPayable.due_date <= next_30_days,
            models.AccountsPayable.status == 'pending'
        ).scalar() or 0
        
        if future_outflow > future_inflow:
            alerts.append({
                'type': 'danger',
                'title': 'Fluxo de Caixa Negativo',
                'message': f'Previsão de fluxo negativo nos próximos 30 dias: R$ {future_inflow - future_outflow:,.2f}',
                'priority': 'critical'
            })
        
        # Alerta de baixa margem de lucro
        last_month_start = today.replace(day=1) - timedelta(days=1)
        last_month_start = last_month_start.replace(day=1)
        last_month_end = today.replace(day=1) - timedelta(days=1)
        
        dre = self.generate_dre_report(last_month_start, last_month_end)
        if dre.margem_operacional < 10:  # Margem menor que 10%
            alerts.append({
                'type': 'warning',
                'title': 'Margem de Lucro Baixa',
                'message': f'Margem operacional do último mês: {dre.margem_operacional:.1f}%',
                'priority': 'medium'
            })
        
        return alerts

def calculate_tax_amounts(gross_amount: Decimal, tax_config: models.TaxConfiguration) -> Dict[str, Decimal]:
    """Calcula valores de impostos"""
    tax_rate = tax_config.rate / 100
    tax_amount = gross_amount * tax_rate
    net_amount = gross_amount - tax_amount
    
    return {
        'gross_amount': gross_amount,
        'tax_rate': tax_config.rate,
        'tax_amount': tax_amount,
        'net_amount': net_amount
    }

def format_currency(amount: Decimal) -> str:
    """Formata valor monetário para exibição"""
    return f"R$ {amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

def parse_currency(currency_str: str) -> Decimal:
    """Converte string monetária para Decimal"""
    # Remove símbolos e converte para formato padrão
    clean_str = currency_str.replace('R$', '').replace(' ', '').replace('.', '').replace(',', '.')
    return Decimal(clean_str)