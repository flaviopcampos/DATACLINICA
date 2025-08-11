#!/usr/bin/env python3
"""
DataClínica - Configuração SaaS Multiempresa

Este módulo gerencia a configuração e funcionalidades do sistema SaaS multiempresa:
- Isolamento de dados por tenant (clínica)
- Configurações específicas por tenant
- Planos de assinatura
- Limites de uso
- Billing e cobrança
"""

import os
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from enum import Enum
from pydantic import BaseModel
import logging
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =============================================================================
# ENUMS E CONSTANTES
# =============================================================================

class PlanType(str, Enum):
    """Tipos de planos de assinatura"""
    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class BillingCycle(str, Enum):
    """Ciclos de cobrança"""
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class SubscriptionStatus(str, Enum):
    """Status da assinatura"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"
    TRIAL = "trial"
    EXPIRED = "expired"

# =============================================================================
# MODELOS PYDANTIC
# =============================================================================

class PlanLimits(BaseModel):
    """Limites de um plano"""
    max_users: int
    max_patients: int
    max_appointments_per_month: int
    max_storage_gb: int
    max_api_calls_per_day: int
    features: List[str]
    support_level: str

class PlanConfig(BaseModel):
    """Configuração de um plano"""
    name: str
    description: str
    price_monthly: float
    price_quarterly: float
    price_yearly: float
    limits: PlanLimits
    is_active: bool = True
    trial_days: int = 0

class TenantConfig(BaseModel):
    """Configuração específica de um tenant"""
    tenant_id: int
    plan_type: PlanType
    subscription_status: SubscriptionStatus
    billing_cycle: BillingCycle
    subscription_start: datetime
    subscription_end: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    custom_limits: Optional[Dict[str, Any]] = None
    custom_features: Optional[List[str]] = None
    billing_email: Optional[str] = None
    payment_method: Optional[str] = None
    last_payment: Optional[datetime] = None
    next_payment: Optional[datetime] = None

class UsageMetrics(BaseModel):
    """Métricas de uso de um tenant"""
    tenant_id: int
    period_start: datetime
    period_end: datetime
    users_count: int
    patients_count: int
    appointments_count: int
    storage_used_gb: float
    api_calls_count: int
    features_used: List[str]

# =============================================================================
# CONFIGURAÇÃO DOS PLANOS
# =============================================================================

PLANS_CONFIG: Dict[PlanType, PlanConfig] = {
    PlanType.FREE: PlanConfig(
        name="Gratuito",
        description="Plano básico para teste",
        price_monthly=0.0,
        price_quarterly=0.0,
        price_yearly=0.0,
        limits=PlanLimits(
            max_users=2,
            max_patients=50,
            max_appointments_per_month=100,
            max_storage_gb=1,
            max_api_calls_per_day=1000,
            features=["basic_scheduling", "patient_management"],
            support_level="community"
        ),
        trial_days=30
    ),
    PlanType.BASIC: PlanConfig(
        name="Básico",
        description="Ideal para clínicas pequenas",
        price_monthly=99.90,
        price_quarterly=269.70,  # 10% desconto
        price_yearly=959.04,     # 20% desconto
        limits=PlanLimits(
            max_users=5,
            max_patients=500,
            max_appointments_per_month=1000,
            max_storage_gb=10,
            max_api_calls_per_day=5000,
            features=[
                "basic_scheduling", "patient_management", "medical_records",
                "basic_reports", "appointment_reminders"
            ],
            support_level="email"
        ),
        trial_days=15
    ),
    PlanType.PROFESSIONAL: PlanConfig(
        name="Profissional",
        description="Para clínicas em crescimento",
        price_monthly=199.90,
        price_quarterly=539.73,  # 10% desconto
        price_yearly=1919.04,    # 20% desconto
        limits=PlanLimits(
            max_users=15,
            max_patients=2000,
            max_appointments_per_month=5000,
            max_storage_gb=50,
            max_api_calls_per_day=20000,
            features=[
                "basic_scheduling", "patient_management", "medical_records",
                "basic_reports", "appointment_reminders", "advanced_reports",
                "inventory_management", "financial_management", "tiss_integration",
                "external_apis", "backup_restore"
            ],
            support_level="priority"
        ),
        trial_days=15
    ),
    PlanType.ENTERPRISE: PlanConfig(
        name="Empresarial",
        description="Para grandes clínicas e redes",
        price_monthly=399.90,
        price_quarterly=1079.73,  # 10% desconto
        price_yearly=3839.04,     # 20% desconto
        limits=PlanLimits(
            max_users=50,
            max_patients=10000,
            max_appointments_per_month=25000,
            max_storage_gb=200,
            max_api_calls_per_day=100000,
            features=[
                "basic_scheduling", "patient_management", "medical_records",
                "basic_reports", "appointment_reminders", "advanced_reports",
                "inventory_management", "financial_management", "tiss_integration",
                "external_apis", "backup_restore", "multi_clinic", "custom_branding",
                "advanced_security", "audit_logs", "api_access", "custom_integrations"
            ],
            support_level="dedicated"
        ),
        trial_days=30
    )
}

# =============================================================================
# CLASSE PRINCIPAL PARA GERENCIAMENTO SAAS
# =============================================================================

class SaaSManager:
    """Gerenciador principal do sistema SaaS multiempresa"""
    
    def __init__(self):
        self.plans = PLANS_CONFIG
        self.cache = {}  # Cache para configurações de tenant
    
    def get_plan_config(self, plan_type: PlanType) -> PlanConfig:
        """Obtém a configuração de um plano"""
        return self.plans.get(plan_type)
    
    def get_all_plans(self) -> Dict[PlanType, PlanConfig]:
        """Obtém todos os planos disponíveis"""
        return {k: v for k, v in self.plans.items() if v.is_active}
    
    def get_tenant_config(self, db: Session, tenant_id: int) -> Optional[TenantConfig]:
        """Obtém a configuração de um tenant"""
        # Verificar cache primeiro
        cache_key = f"tenant_{tenant_id}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # Buscar no banco de dados
        from models import Clinic
        clinic = db.query(Clinic).filter(Clinic.id == tenant_id).first()
        
        if not clinic:
            return None
        
        # Criar configuração do tenant
        config = TenantConfig(
            tenant_id=tenant_id,
            plan_type=getattr(clinic, 'plan_type', PlanType.FREE),
            subscription_status=getattr(clinic, 'subscription_status', SubscriptionStatus.TRIAL),
            billing_cycle=getattr(clinic, 'billing_cycle', BillingCycle.MONTHLY),
            subscription_start=getattr(clinic, 'subscription_start', datetime.now()),
            subscription_end=getattr(clinic, 'subscription_end', None),
            trial_end=getattr(clinic, 'trial_end', None),
            custom_limits=getattr(clinic, 'custom_limits', None),
            custom_features=getattr(clinic, 'custom_features', None),
            billing_email=getattr(clinic, 'billing_email', clinic.email),
            payment_method=getattr(clinic, 'payment_method', None),
            last_payment=getattr(clinic, 'last_payment', None),
            next_payment=getattr(clinic, 'next_payment', None)
        )
        
        # Armazenar no cache
        self.cache[cache_key] = config
        
        return config
    
    def check_tenant_limits(self, db: Session, tenant_id: int, resource: str, current_count: int = None) -> Dict[str, Any]:
        """Verifica se um tenant está dentro dos limites do plano"""
        config = self.get_tenant_config(db, tenant_id)
        if not config:
            return {"allowed": False, "reason": "Tenant não encontrado"}
        
        plan = self.get_plan_config(config.plan_type)
        if not plan:
            return {"allowed": False, "reason": "Plano não encontrado"}
        
        # Verificar status da assinatura
        if config.subscription_status not in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL]:
            return {"allowed": False, "reason": "Assinatura inativa"}
        
        # Verificar se o trial expirou
        if config.subscription_status == SubscriptionStatus.TRIAL and config.trial_end:
            if datetime.now() > config.trial_end:
                return {"allowed": False, "reason": "Período de trial expirado"}
        
        # Verificar limites específicos
        limits = plan.limits
        if config.custom_limits:
            # Aplicar limites customizados se existirem
            for key, value in config.custom_limits.items():
                setattr(limits, key, value)
        
        # Verificar limite específico do recurso
        limit_map = {
            "users": limits.max_users,
            "patients": limits.max_patients,
            "appointments": limits.max_appointments_per_month,
            "storage": limits.max_storage_gb,
            "api_calls": limits.max_api_calls_per_day
        }
        
        if resource in limit_map:
            max_allowed = limit_map[resource]
            if current_count is None:
                # Buscar contagem atual no banco
                current_count = self.get_current_usage(db, tenant_id, resource)
            
            if current_count >= max_allowed:
                return {
                    "allowed": False,
                    "reason": f"Limite de {resource} excedido",
                    "current": current_count,
                    "max": max_allowed
                }
        
        return {"allowed": True, "current": current_count, "max": limit_map.get(resource, 0)}
    
    def check_feature_access(self, db: Session, tenant_id: int, feature: str) -> bool:
        """Verifica se um tenant tem acesso a uma funcionalidade"""
        config = self.get_tenant_config(db, tenant_id)
        if not config:
            return False
        
        plan = self.get_plan_config(config.plan_type)
        if not plan:
            return False
        
        # Verificar status da assinatura
        if config.subscription_status not in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL]:
            return False
        
        # Verificar se o trial expirou
        if config.subscription_status == SubscriptionStatus.TRIAL and config.trial_end:
            if datetime.now() > config.trial_end:
                return False
        
        # Verificar se a funcionalidade está incluída no plano
        available_features = plan.limits.features
        if config.custom_features:
            available_features.extend(config.custom_features)
        
        return feature in available_features
    
    def get_current_usage(self, db: Session, tenant_id: int, resource: str) -> int:
        """Obtém o uso atual de um recurso para um tenant"""
        from models import User, Patient, Appointment
        
        if resource == "users":
            return db.query(User).filter(User.clinic_id == tenant_id).count()
        elif resource == "patients":
            return db.query(Patient).filter(Patient.clinic_id == tenant_id).count()
        elif resource == "appointments":
            # Contar agendamentos do mês atual
            from datetime import date
            start_of_month = date.today().replace(day=1)
            return db.query(Appointment).filter(
                and_(
                    Appointment.clinic_id == tenant_id,
                    Appointment.date >= start_of_month
                )
            ).count()
        elif resource == "storage":
            # Implementar cálculo de storage usado
            # Por enquanto retorna 0
            return 0
        elif resource == "api_calls":
            # Implementar contagem de chamadas API do dia
            # Por enquanto retorna 0
            return 0
        
        return 0
    
    def get_usage_metrics(self, db: Session, tenant_id: int, start_date: datetime = None, end_date: datetime = None) -> UsageMetrics:
        """Obtém métricas de uso de um tenant"""
        if not start_date:
            start_date = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if not end_date:
            end_date = datetime.now()
        
        config = self.get_tenant_config(db, tenant_id)
        plan = self.get_plan_config(config.plan_type) if config else None
        
        return UsageMetrics(
            tenant_id=tenant_id,
            period_start=start_date,
            period_end=end_date,
            users_count=self.get_current_usage(db, tenant_id, "users"),
            patients_count=self.get_current_usage(db, tenant_id, "patients"),
            appointments_count=self.get_current_usage(db, tenant_id, "appointments"),
            storage_used_gb=self.get_current_usage(db, tenant_id, "storage"),
            api_calls_count=self.get_current_usage(db, tenant_id, "api_calls"),
            features_used=plan.limits.features if plan else []
        )
    
    def calculate_next_payment_date(self, config: TenantConfig) -> datetime:
        """Calcula a próxima data de pagamento"""
        if not config.subscription_start:
            return datetime.now()
        
        if config.billing_cycle == BillingCycle.MONTHLY:
            return config.subscription_start + timedelta(days=30)
        elif config.billing_cycle == BillingCycle.QUARTERLY:
            return config.subscription_start + timedelta(days=90)
        elif config.billing_cycle == BillingCycle.YEARLY:
            return config.subscription_start + timedelta(days=365)
        
        return config.subscription_start + timedelta(days=30)
    
    def calculate_subscription_price(self, plan_type: PlanType, billing_cycle: BillingCycle) -> float:
        """Calcula o preço da assinatura"""
        plan = self.get_plan_config(plan_type)
        if not plan:
            return 0.0
        
        if billing_cycle == BillingCycle.MONTHLY:
            return plan.price_monthly
        elif billing_cycle == BillingCycle.QUARTERLY:
            return plan.price_quarterly
        elif billing_cycle == BillingCycle.YEARLY:
            return plan.price_yearly
        
        return plan.price_monthly
    
    def upgrade_plan(self, db: Session, tenant_id: int, new_plan: PlanType, billing_cycle: BillingCycle = None) -> bool:
        """Faz upgrade do plano de um tenant"""
        try:
            from models import Clinic
            
            clinic = db.query(Clinic).filter(Clinic.id == tenant_id).first()
            if not clinic:
                return False
            
            # Atualizar plano
            clinic.plan_type = new_plan
            if billing_cycle:
                clinic.billing_cycle = billing_cycle
            
            clinic.subscription_status = SubscriptionStatus.ACTIVE
            clinic.subscription_start = datetime.now()
            
            # Calcular próximo pagamento
            config = TenantConfig(
                tenant_id=tenant_id,
                plan_type=new_plan,
                subscription_status=SubscriptionStatus.ACTIVE,
                billing_cycle=billing_cycle or BillingCycle.MONTHLY,
                subscription_start=datetime.now()
            )
            clinic.next_payment = self.calculate_next_payment_date(config)
            
            db.commit()
            
            # Limpar cache
            cache_key = f"tenant_{tenant_id}"
            if cache_key in self.cache:
                del self.cache[cache_key]
            
            logger.info(f"Plano do tenant {tenant_id} atualizado para {new_plan}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao fazer upgrade do plano: {e}")
            db.rollback()
            return False
    
    def suspend_tenant(self, db: Session, tenant_id: int, reason: str = None) -> bool:
        """Suspende um tenant"""
        try:
            from models import Clinic
            
            clinic = db.query(Clinic).filter(Clinic.id == tenant_id).first()
            if not clinic:
                return False
            
            clinic.subscription_status = SubscriptionStatus.SUSPENDED
            db.commit()
            
            # Limpar cache
            cache_key = f"tenant_{tenant_id}"
            if cache_key in self.cache:
                del self.cache[cache_key]
            
            logger.info(f"Tenant {tenant_id} suspenso. Motivo: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao suspender tenant: {e}")
            db.rollback()
            return False
    
    def reactivate_tenant(self, db: Session, tenant_id: int) -> bool:
        """Reativa um tenant suspenso"""
        try:
            from models import Clinic
            
            clinic = db.query(Clinic).filter(Clinic.id == tenant_id).first()
            if not clinic:
                return False
            
            clinic.subscription_status = SubscriptionStatus.ACTIVE
            db.commit()
            
            # Limpar cache
            cache_key = f"tenant_{tenant_id}"
            if cache_key in self.cache:
                del self.cache[cache_key]
            
            logger.info(f"Tenant {tenant_id} reativado")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao reativar tenant: {e}")
            db.rollback()
            return False

# Instância global
saas_manager = SaaSManager()

# =============================================================================
# DECORADORES E MIDDLEWARES
# =============================================================================

def require_feature(feature: str):
    """Decorador para verificar acesso a funcionalidades"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Implementar verificação de funcionalidade
            # Por enquanto apenas retorna a função
            return func(*args, **kwargs)
        return wrapper
    return decorator

def check_limits(resource: str):
    """Decorador para verificar limites de uso"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Implementar verificação de limites
            # Por enquanto apenas retorna a função
            return func(*args, **kwargs)
        return wrapper
    return decorator