#!/usr/bin/env python3
"""
DataClínica - Router SaaS Multiempresa

Endpoints para gerenciamento do sistema SaaS:
- Planos de assinatura
- Configurações de tenant
- Limites de uso
- Métricas e billing
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

from database import get_db
from auth import get_current_user
from models import User, Clinic
from saas_config import (
    saas_manager, PlanType, BillingCycle, SubscriptionStatus,
    PlanConfig, TenantConfig, UsageMetrics
)
from schemas import UserResponse

# Configurar logging
logger = logging.getLogger(__name__)

# Criar router
router = APIRouter(prefix="/saas", tags=["SaaS Management"])

# =============================================================================
# SCHEMAS ESPECÍFICOS PARA SAAS
# =============================================================================

from pydantic import BaseModel

class PlanResponse(BaseModel):
    """Response para informações de plano"""
    name: str
    description: str
    price_monthly: float
    price_quarterly: float
    price_yearly: float
    max_users: int
    max_patients: int
    max_appointments_per_month: int
    max_storage_gb: int
    max_api_calls_per_day: int
    features: List[str]
    support_level: str
    trial_days: int
    is_active: bool

class TenantConfigResponse(BaseModel):
    """Response para configuração de tenant"""
    tenant_id: int
    plan_type: str
    subscription_status: str
    billing_cycle: str
    subscription_start: datetime
    subscription_end: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    billing_email: Optional[str] = None
    payment_method: Optional[str] = None
    last_payment: Optional[datetime] = None
    next_payment: Optional[datetime] = None

class UsageResponse(BaseModel):
    """Response para métricas de uso"""
    tenant_id: int
    period_start: datetime
    period_end: datetime
    users_count: int
    patients_count: int
    appointments_count: int
    storage_used_gb: float
    api_calls_count: int
    features_used: List[str]
    limits: Dict[str, Any]
    usage_percentage: Dict[str, float]

class LimitCheckResponse(BaseModel):
    """Response para verificação de limites"""
    allowed: bool
    reason: Optional[str] = None
    current: Optional[int] = None
    max: Optional[int] = None
    usage_percentage: Optional[float] = None

class UpgradePlanRequest(BaseModel):
    """Request para upgrade de plano"""
    new_plan: PlanType
    billing_cycle: Optional[BillingCycle] = BillingCycle.MONTHLY

class FeatureAccessResponse(BaseModel):
    """Response para acesso a funcionalidades"""
    feature: str
    has_access: bool
    plan_type: str
    subscription_status: str

# =============================================================================
# ENDPOINTS PÚBLICOS (SEM AUTENTICAÇÃO)
# =============================================================================

@router.get("/plans", response_model=Dict[str, PlanResponse])
async def get_all_plans():
    """Obtém todos os planos disponíveis"""
    try:
        plans = saas_manager.get_all_plans()
        
        response = {}
        for plan_type, plan_config in plans.items():
            response[plan_type.value] = PlanResponse(
                name=plan_config.name,
                description=plan_config.description,
                price_monthly=plan_config.price_monthly,
                price_quarterly=plan_config.price_quarterly,
                price_yearly=plan_config.price_yearly,
                max_users=plan_config.limits.max_users,
                max_patients=plan_config.limits.max_patients,
                max_appointments_per_month=plan_config.limits.max_appointments_per_month,
                max_storage_gb=plan_config.limits.max_storage_gb,
                max_api_calls_per_day=plan_config.limits.max_api_calls_per_day,
                features=plan_config.limits.features,
                support_level=plan_config.limits.support_level,
                trial_days=plan_config.trial_days,
                is_active=plan_config.is_active
            )
        
        return response
        
    except Exception as e:
        logger.error(f"Erro ao buscar planos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/plans/{plan_type}", response_model=PlanResponse)
async def get_plan_details(plan_type: PlanType):
    """Obtém detalhes de um plano específico"""
    try:
        plan_config = saas_manager.get_plan_config(plan_type)
        
        if not plan_config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plano não encontrado"
            )
        
        return PlanResponse(
            name=plan_config.name,
            description=plan_config.description,
            price_monthly=plan_config.price_monthly,
            price_quarterly=plan_config.price_quarterly,
            price_yearly=plan_config.price_yearly,
            max_users=plan_config.limits.max_users,
            max_patients=plan_config.limits.max_patients,
            max_appointments_per_month=plan_config.limits.max_appointments_per_month,
            max_storage_gb=plan_config.limits.max_storage_gb,
            max_api_calls_per_day=plan_config.limits.max_api_calls_per_day,
            features=plan_config.limits.features,
            support_level=plan_config.limits.support_level,
            trial_days=plan_config.trial_days,
            is_active=plan_config.is_active
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar detalhes do plano: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/pricing/{plan_type}/{billing_cycle}")
async def get_plan_pricing(plan_type: PlanType, billing_cycle: BillingCycle):
    """Calcula o preço de um plano para um ciclo de cobrança"""
    try:
        price = saas_manager.calculate_subscription_price(plan_type, billing_cycle)
        
        return {
            "plan_type": plan_type.value,
            "billing_cycle": billing_cycle.value,
            "price": price,
            "currency": "BRL"
        }
        
    except Exception as e:
        logger.error(f"Erro ao calcular preço: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

# =============================================================================
# ENDPOINTS AUTENTICADOS
# =============================================================================

@router.get("/tenant/config", response_model=TenantConfigResponse)
async def get_tenant_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém a configuração do tenant atual"""
    try:
        if not current_user.clinic_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não está associado a uma clínica"
            )
        
        config = saas_manager.get_tenant_config(db, current_user.clinic_id)
        
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuração do tenant não encontrada"
            )
        
        return TenantConfigResponse(
            tenant_id=config.tenant_id,
            plan_type=config.plan_type.value,
            subscription_status=config.subscription_status.value,
            billing_cycle=config.billing_cycle.value,
            subscription_start=config.subscription_start,
            subscription_end=config.subscription_end,
            trial_end=config.trial_end,
            billing_email=config.billing_email,
            payment_method=config.payment_method,
            last_payment=config.last_payment,
            next_payment=config.next_payment
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar configuração do tenant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/tenant/usage", response_model=UsageResponse)
async def get_tenant_usage(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém métricas de uso do tenant atual"""
    try:
        if not current_user.clinic_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não está associado a uma clínica"
            )
        
        # Obter métricas de uso
        metrics = saas_manager.get_usage_metrics(
            db, current_user.clinic_id, start_date, end_date
        )
        
        # Obter configuração do tenant para limites
        config = saas_manager.get_tenant_config(db, current_user.clinic_id)
        plan = saas_manager.get_plan_config(config.plan_type) if config else None
        
        # Calcular limites e percentuais de uso
        limits = {}
        usage_percentage = {}
        
        if plan:
            limits = {
                "max_users": plan.limits.max_users,
                "max_patients": plan.limits.max_patients,
                "max_appointments_per_month": plan.limits.max_appointments_per_month,
                "max_storage_gb": plan.limits.max_storage_gb,
                "max_api_calls_per_day": plan.limits.max_api_calls_per_day
            }
            
            usage_percentage = {
                "users": (metrics.users_count / plan.limits.max_users * 100) if plan.limits.max_users > 0 else 0,
                "patients": (metrics.patients_count / plan.limits.max_patients * 100) if plan.limits.max_patients > 0 else 0,
                "appointments": (metrics.appointments_count / plan.limits.max_appointments_per_month * 100) if plan.limits.max_appointments_per_month > 0 else 0,
                "storage": (metrics.storage_used_gb / plan.limits.max_storage_gb * 100) if plan.limits.max_storage_gb > 0 else 0,
                "api_calls": (metrics.api_calls_count / plan.limits.max_api_calls_per_day * 100) if plan.limits.max_api_calls_per_day > 0 else 0
            }
        
        return UsageResponse(
            tenant_id=metrics.tenant_id,
            period_start=metrics.period_start,
            period_end=metrics.period_end,
            users_count=metrics.users_count,
            patients_count=metrics.patients_count,
            appointments_count=metrics.appointments_count,
            storage_used_gb=metrics.storage_used_gb,
            api_calls_count=metrics.api_calls_count,
            features_used=metrics.features_used,
            limits=limits,
            usage_percentage=usage_percentage
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar métricas de uso: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/tenant/limits/{resource}", response_model=LimitCheckResponse)
async def check_resource_limits(
    resource: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verifica os limites de um recurso específico"""
    try:
        if not current_user.clinic_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não está associado a uma clínica"
            )
        
        # Verificar se o recurso é válido
        valid_resources = ["users", "patients", "appointments", "storage", "api_calls"]
        if resource not in valid_resources:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Recurso inválido. Recursos válidos: {', '.join(valid_resources)}"
            )
        
        # Verificar limites
        result = saas_manager.check_tenant_limits(db, current_user.clinic_id, resource)
        
        usage_percentage = None
        if result.get("current") is not None and result.get("max") is not None:
            if result["max"] > 0:
                usage_percentage = (result["current"] / result["max"]) * 100
        
        return LimitCheckResponse(
            allowed=result["allowed"],
            reason=result.get("reason"),
            current=result.get("current"),
            max=result.get("max"),
            usage_percentage=usage_percentage
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao verificar limites: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/tenant/features/{feature}", response_model=FeatureAccessResponse)
async def check_feature_access(
    feature: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verifica se o tenant tem acesso a uma funcionalidade"""
    try:
        if not current_user.clinic_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não está associado a uma clínica"
            )
        
        # Verificar acesso à funcionalidade
        has_access = saas_manager.check_feature_access(db, current_user.clinic_id, feature)
        
        # Obter informações do tenant
        config = saas_manager.get_tenant_config(db, current_user.clinic_id)
        
        return FeatureAccessResponse(
            feature=feature,
            has_access=has_access,
            plan_type=config.plan_type.value if config else "unknown",
            subscription_status=config.subscription_status.value if config else "unknown"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao verificar acesso à funcionalidade: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/tenant/upgrade")
async def upgrade_tenant_plan(
    request: UpgradePlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Faz upgrade do plano do tenant"""
    try:
        if not current_user.clinic_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não está associado a uma clínica"
            )
        
        # Verificar se o usuário tem permissão (deve ser admin da clínica)
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas administradores podem fazer upgrade de plano"
            )
        
        # Fazer upgrade
        success = saas_manager.upgrade_plan(
            db, current_user.clinic_id, request.new_plan, request.billing_cycle
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao fazer upgrade do plano"
            )
        
        # Calcular novo preço
        new_price = saas_manager.calculate_subscription_price(
            request.new_plan, request.billing_cycle
        )
        
        return {
            "message": "Plano atualizado com sucesso",
            "new_plan": request.new_plan.value,
            "billing_cycle": request.billing_cycle.value,
            "new_price": new_price,
            "currency": "BRL"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao fazer upgrade do plano: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

# =============================================================================
# ENDPOINTS ADMINISTRATIVOS (SUPER ADMIN)
# =============================================================================

@router.get("/admin/tenants")
async def list_all_tenants(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista todos os tenants (apenas super admin)"""
    try:
        # Verificar se é super admin
        if current_user.role != "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Apenas super administradores."
            )
        
        # Buscar todas as clínicas
        clinics = db.query(Clinic).all()
        
        tenants = []
        for clinic in clinics:
            config = saas_manager.get_tenant_config(db, clinic.id)
            if config:
                tenants.append({
                    "tenant_id": clinic.id,
                    "clinic_name": clinic.name,
                    "plan_type": config.plan_type.value,
                    "subscription_status": config.subscription_status.value,
                    "subscription_start": config.subscription_start,
                    "next_payment": config.next_payment
                })
        
        return {"tenants": tenants, "total": len(tenants)}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao listar tenants: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/admin/tenants/{tenant_id}/suspend")
async def suspend_tenant(
    tenant_id: int,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Suspende um tenant (apenas super admin)"""
    try:
        # Verificar se é super admin
        if current_user.role != "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Apenas super administradores."
            )
        
        # Suspender tenant
        success = saas_manager.suspend_tenant(db, tenant_id, reason)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao suspender tenant"
            )
        
        return {
            "message": "Tenant suspenso com sucesso",
            "tenant_id": tenant_id,
            "reason": reason
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao suspender tenant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/admin/tenants/{tenant_id}/reactivate")
async def reactivate_tenant(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reativa um tenant suspenso (apenas super admin)"""
    try:
        # Verificar se é super admin
        if current_user.role != "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado. Apenas super administradores."
            )
        
        # Reativar tenant
        success = saas_manager.reactivate_tenant(db, tenant_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao reativar tenant"
            )
        
        return {
            "message": "Tenant reativado com sucesso",
            "tenant_id": tenant_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao reativar tenant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

# =============================================================================
# ENDPOINT DE HEALTH CHECK
# =============================================================================

@router.get("/health")
async def saas_health_check():
    """Verifica o status do sistema SaaS"""
    try:
        return {
            "status": "healthy",
            "service": "SaaS Management",
            "timestamp": datetime.now(),
            "plans_available": len(saas_manager.get_all_plans()),
            "features": [
                "multi_tenant",
                "subscription_management",
                "usage_tracking",
                "limit_enforcement",
                "billing_integration"
            ]
        }
        
    except Exception as e:
        logger.error(f"Erro no health check SaaS: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro no sistema SaaS"
        )