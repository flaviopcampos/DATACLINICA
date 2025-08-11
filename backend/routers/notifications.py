#!/usr/bin/env python3
"""
DataClínica - API de Notificações

Este módulo define os endpoints da API para o sistema de notificações,
incluindo gerenciamento de notificações, preferências e templates.
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator

from ..database import get_db
from ..models import User
from ..auth import get_current_user, require_permission
from ..encryption import field_encryption
from ..notification_system import (
    NotificationSystem, NotificationMessage, NotificationType, 
    NotificationChannel, NotificationPriority, NotificationStatus,
    Notification, NotificationPreference, NotificationTemplate,
    EmailConfig, SMSConfig, create_notification_system
)
from ..audit_logger import AuditLogger, EventType, EventSeverity
from ..security_config import SecurityConfig

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Schemas Pydantic
class NotificationResponse(BaseModel):
    """Schema de resposta para notificação"""
    id: int
    notification_type: NotificationType
    channel: NotificationChannel
    priority: NotificationPriority
    status: NotificationStatus
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    created_at: datetime
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class NotificationCreate(BaseModel):
    """Schema para criar notificação"""
    recipient_id: Optional[int] = None
    recipient_email: Optional[str] = None
    recipient_phone: Optional[str] = None
    notification_type: NotificationType
    channel: NotificationChannel
    priority: NotificationPriority = NotificationPriority.NORMAL
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    data: Optional[Dict[str, Any]] = None
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    template_name: Optional[str] = None
    template_vars: Optional[Dict[str, Any]] = None
    
    @validator('recipient_email')
    def validate_email(cls, v):
        if v and '@' not in v:
            raise ValueError('Email inválido')
        return v
    
    @validator('recipient_phone')
    def validate_phone(cls, v):
        if v and not v.replace('+', '').replace('-', '').replace(' ', '').replace('(', '').replace(')', '').isdigit():
            raise ValueError('Telefone inválido')
        return v

class BulkNotificationCreate(BaseModel):
    """Schema para criar notificações em lote"""
    notifications: List[NotificationCreate]
    
    @validator('notifications')
    def validate_notifications(cls, v):
        if len(v) > 1000:
            raise ValueError('Máximo de 1000 notificações por lote')
        return v

class NotificationPreferenceResponse(BaseModel):
    """Schema de resposta para preferência de notificação"""
    id: int
    notification_type: NotificationType
    channel: NotificationChannel
    enabled: bool
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    
    class Config:
        from_attributes = True

class NotificationPreferenceUpdate(BaseModel):
    """Schema para atualizar preferência de notificação"""
    enabled: bool
    quiet_hours_start: Optional[str] = Field(None, regex=r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$')
    quiet_hours_end: Optional[str] = Field(None, regex=r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$')

class NotificationTemplateResponse(BaseModel):
    """Schema de resposta para template de notificação"""
    id: int
    name: str
    notification_type: NotificationType
    channel: NotificationChannel
    subject_template: str
    body_template: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class NotificationTemplateCreate(BaseModel):
    """Schema para criar template de notificação"""
    name: str = Field(..., min_length=1, max_length=100)
    notification_type: NotificationType
    channel: NotificationChannel
    subject_template: str = Field(..., min_length=1, max_length=255)
    body_template: str = Field(..., min_length=1)

class NotificationTemplateUpdate(BaseModel):
    """Schema para atualizar template de notificação"""
    subject_template: Optional[str] = Field(None, min_length=1, max_length=255)
    body_template: Optional[str] = Field(None, min_length=1)
    is_active: Optional[bool] = None

class SecurityAlertRequest(BaseModel):
    """Schema para enviar alerta de segurança"""
    user_id: int
    alert_type: str = Field(..., regex=r'^[a-z_]+$')
    details: Dict[str, Any]
    priority: NotificationPriority = NotificationPriority.HIGH

class ComplianceNotificationRequest(BaseModel):
    """Schema para notificação de compliance"""
    violation_id: str
    affected_users: List[int]
    notification_type: str = Field(default="data_breach", regex=r'^[a-z_]+$')

class AppointmentReminderRequest(BaseModel):
    """Schema para lembrete de consulta"""
    patient_id: int
    appointment_data: Dict[str, Any]

class SystemMaintenanceRequest(BaseModel):
    """Schema para alerta de manutenção"""
    maintenance_data: Dict[str, Any]

class NotificationStatsResponse(BaseModel):
    """Schema de resposta para estatísticas"""
    total: int
    by_type: Dict[str, int]
    by_channel: Dict[str, int]
    by_status: Dict[str, int]
    by_priority: Dict[str, int]
    read_rate: float
    delivery_rate: float

# Dependências
def get_notification_system(db: Session = Depends(get_db)) -> NotificationSystem:
    """Obtém instância do sistema de notificações"""
    audit_logger = AuditLogger(db)
    
    # Configurações de email e SMS (em produção, vir de variáveis de ambiente)
    email_config = EmailConfig(
        smtp_server="smtp.gmail.com",
        smtp_port=587,
        username="noreply@dataclinica.com",
        password="app_password",
        from_email="noreply@dataclinica.com",
        from_name="DataClínica"
    )
    
    sms_config = SMSConfig(
        provider="twilio",
        api_key="your_api_key",
        api_secret="your_api_secret",
        from_number="+1234567890"
    )
    
    return create_notification_system(db, audit_logger, email_config, sms_config)

# Endpoints

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    notification_type: Optional[NotificationType] = None,
    channel: Optional[NotificationChannel] = None,
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Obtém notificações do usuário atual"""
    try:
        notifications = await notification_system.get_user_notifications(
            user_id=current_user.id,
            limit=limit,
            offset=offset,
            unread_only=unread_only
        )
        
        # Filtrar por tipo e canal se especificado
        if notification_type:
            notifications = [n for n in notifications if n.notification_type == notification_type]
        
        if channel:
            notifications = [n for n in notifications if n.channel == channel]
        
        return notifications
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar notificações: {str(e)}")

@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Obtém contagem de notificações não lidas"""
    try:
        notifications = await notification_system.get_user_notifications(
            user_id=current_user.id,
            limit=1000,
            unread_only=True
        )
        
        return {"unread_count": len(notifications)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao contar notificações: {str(e)}")

@router.post("/", response_model=Dict[str, str])
async def create_notification(
    notification_data: NotificationCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Cria nova notificação"""
    # Verificar permissões (apenas admins podem criar notificações para outros usuários)
    if notification_data.recipient_id and notification_data.recipient_id != current_user.id:
        require_permission(current_user, "admin")
    
    try:
        notification = NotificationMessage(
            recipient_id=notification_data.recipient_id,
            recipient_email=notification_data.recipient_email,
            recipient_phone=notification_data.recipient_phone,
            notification_type=notification_data.notification_type,
            channel=notification_data.channel,
            priority=notification_data.priority,
            title=notification_data.title,
            message=notification_data.message,
            data=notification_data.data,
            scheduled_at=notification_data.scheduled_at,
            expires_at=notification_data.expires_at,
            template_name=notification_data.template_name,
            template_vars=notification_data.template_vars
        )
        
        # Enviar em background
        background_tasks.add_task(notification_system.send_notification, notification)
        
        return {"message": "Notificação criada com sucesso"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar notificação: {str(e)}")

@router.post("/bulk", response_model=Dict[str, Any])
async def create_bulk_notifications(
    bulk_data: BulkNotificationCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Cria notificações em lote"""
    require_permission(current_user, "admin")
    
    try:
        notifications = []
        for notification_data in bulk_data.notifications:
            notification = NotificationMessage(
                recipient_id=notification_data.recipient_id,
                recipient_email=notification_data.recipient_email,
                recipient_phone=notification_data.recipient_phone,
                notification_type=notification_data.notification_type,
                channel=notification_data.channel,
                priority=notification_data.priority,
                title=notification_data.title,
                message=notification_data.message,
                data=notification_data.data,
                scheduled_at=notification_data.scheduled_at,
                expires_at=notification_data.expires_at,
                template_name=notification_data.template_name,
                template_vars=notification_data.template_vars
            )
            notifications.append(notification)
        
        # Enviar em background
        background_tasks.add_task(notification_system.send_bulk_notifications, notifications)
        
        return {
            "message": "Notificações em lote criadas com sucesso",
            "count": len(notifications)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar notificações em lote: {str(e)}")

@router.post("/security-alert")
async def send_security_alert(
    alert_data: SecurityAlertRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Envia alerta de segurança"""
    require_permission(current_user, "admin")
    
    try:
        background_tasks.add_task(
            notification_system.send_security_alert,
            alert_data.user_id,
            alert_data.alert_type,
            alert_data.details,
            alert_data.priority
        )
        
        return {"message": "Alerta de segurança enviado com sucesso"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar alerta de segurança: {str(e)}")

@router.post("/compliance-notification")
async def send_compliance_notification(
    compliance_data: ComplianceNotificationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Envia notificação de compliance"""
    require_permission(current_user, "admin")
    
    try:
        background_tasks.add_task(
            notification_system.send_compliance_notification,
            compliance_data.violation_id,
            compliance_data.affected_users,
            compliance_data.notification_type
        )
        
        return {"message": "Notificação de compliance enviada com sucesso"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar notificação de compliance: {str(e)}")

@router.post("/appointment-reminder")
async def send_appointment_reminder(
    reminder_data: AppointmentReminderRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Envia lembrete de consulta"""
    require_permission(current_user, "doctor")
    
    try:
        background_tasks.add_task(
            notification_system.send_appointment_reminder,
            reminder_data.patient_id,
            reminder_data.appointment_data
        )
        
        return {"message": "Lembrete de consulta enviado com sucesso"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar lembrete de consulta: {str(e)}")

@router.post("/system-maintenance")
async def send_system_maintenance_alert(
    maintenance_data: SystemMaintenanceRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Envia alerta de manutenção do sistema"""
    require_permission(current_user, "admin")
    
    try:
        background_tasks.add_task(
            notification_system.send_system_maintenance_alert,
            maintenance_data.maintenance_data
        )
        
        return {"message": "Alerta de manutenção enviado com sucesso"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar alerta de manutenção: {str(e)}")

@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Marca notificação como lida"""
    try:
        success = await notification_system.mark_notification_read(notification_id, current_user.id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Notificação não encontrada")
        
        return {"message": "Notificação marcada como lida"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao marcar notificação como lida: {str(e)}")

@router.patch("/mark-all-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Marca todas as notificações como lidas"""
    try:
        count = await notification_system.mark_all_read(current_user.id)
        
        return {
            "message": "Todas as notificações foram marcadas como lidas",
            "count": count
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao marcar notificações como lidas: {str(e)}")

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Deleta notificação"""
    try:
        success = await notification_system.delete_notification(notification_id, current_user.id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Notificação não encontrada")
        
        return {"message": "Notificação deletada com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deletar notificação: {str(e)}")

@router.get("/preferences", response_model=List[NotificationPreferenceResponse])
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém preferências de notificação do usuário"""
    try:
        preferences = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == current_user.id
        ).all()
        
        return preferences
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar preferências: {str(e)}")

@router.put("/preferences/{notification_type}/{channel}")
async def update_notification_preference(
    notification_type: NotificationType,
    channel: NotificationChannel,
    preference_data: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza preferência de notificação"""
    try:
        preference = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == current_user.id,
            NotificationPreference.notification_type == notification_type,
            NotificationPreference.channel == channel
        ).first()
        
        if not preference:
            # Criar nova preferência
            preference = NotificationPreference(
                user_id=current_user.id,
                notification_type=notification_type,
                channel=channel,
                enabled=preference_data.enabled,
                quiet_hours_start=preference_data.quiet_hours_start,
                quiet_hours_end=preference_data.quiet_hours_end
            )
            db.add(preference)
        else:
            # Atualizar preferência existente
            preference.enabled = preference_data.enabled
            if preference_data.quiet_hours_start is not None:
                preference.quiet_hours_start = preference_data.quiet_hours_start
            if preference_data.quiet_hours_end is not None:
                preference.quiet_hours_end = preference_data.quiet_hours_end
            preference.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "Preferência atualizada com sucesso"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar preferência: {str(e)}")

@router.get("/templates", response_model=List[NotificationTemplateResponse])
async def get_notification_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém templates de notificação"""
    require_permission(current_user, "admin")
    
    try:
        templates = db.query(NotificationTemplate).filter(
            NotificationTemplate.is_active == True
        ).all()
        
        return templates
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar templates: {str(e)}")

@router.post("/templates", response_model=NotificationTemplateResponse)
async def create_notification_template(
    template_data: NotificationTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria template de notificação"""
    require_permission(current_user, "admin")
    
    try:
        # Verificar se já existe template com o mesmo nome
        existing = db.query(NotificationTemplate).filter(
            NotificationTemplate.name == template_data.name
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Template com este nome já existe")
        
        # Apply encryption to sensitive fields
        template_dict = template_data.dict()
        encrypted_data = field_encryption.encrypt_model_data(template_dict, "NotificationTemplate")
        
        template = NotificationTemplate(
            name=encrypted_data["name"],
            notification_type=encrypted_data["notification_type"],
            channel=encrypted_data["channel"],
            subject_template=encrypted_data["subject_template"],
            body_template=encrypted_data["body_template"]
        )
        
        db.add(template)
        db.commit()
        db.refresh(template)
        
        return template
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar template: {str(e)}")

@router.put("/templates/{template_id}", response_model=NotificationTemplateResponse)
async def update_notification_template(
    template_id: int,
    template_data: NotificationTemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza template de notificação"""
    require_permission(current_user, "admin")
    
    try:
        template = db.query(NotificationTemplate).filter(
            NotificationTemplate.id == template_id
        ).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="Template não encontrado")
        
        # Apply encryption to sensitive fields
        update_dict = template_data.dict(exclude_unset=True)
        encrypted_data = field_encryption.encrypt_model_data(update_dict, "NotificationTemplate")
        
        # Atualizar campos
        if "subject_template" in encrypted_data:
            template.subject_template = encrypted_data["subject_template"]
        if "body_template" in encrypted_data:
            template.body_template = encrypted_data["body_template"]
        if template_data.is_active is not None:
            template.is_active = template_data.is_active
        
        template.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(template)
        
        return template
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar template: {str(e)}")

@router.delete("/templates/{template_id}")
async def delete_notification_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta template de notificação"""
    require_permission(current_user, "admin")
    
    try:
        template = db.query(NotificationTemplate).filter(
            NotificationTemplate.id == template_id
        ).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="Template não encontrado")
        
        db.delete(template)
        db.commit()
        
        return {"message": "Template deletado com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar template: {str(e)}")

@router.get("/statistics", response_model=NotificationStatsResponse)
async def get_notification_statistics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Obtém estatísticas de notificações"""
    try:
        stats = await notification_system.get_notification_statistics(
            user_id=current_user.id,
            days=days
        )
        
        return stats
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas: {str(e)}")

@router.get("/admin/statistics", response_model=NotificationStatsResponse)
async def get_admin_notification_statistics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Obtém estatísticas gerais de notificações (admin)"""
    require_permission(current_user, "admin")
    
    try:
        stats = await notification_system.get_notification_statistics(
            user_id=None,  # Todas as notificações
            days=days
        )
        
        return stats
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas: {str(e)}")

@router.post("/admin/cleanup")
async def cleanup_old_notifications(
    days: int = Query(90, ge=30, le=365),
    current_user: User = Depends(get_current_user),
    notification_system: NotificationSystem = Depends(get_notification_system)
):
    """Remove notificações antigas (admin)"""
    require_permission(current_user, "admin")
    
    try:
        count = await notification_system.cleanup_old_notifications(days)
        
        return {
            "message": "Limpeza de notificações concluída",
            "deleted_count": count
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao limpar notificações: {str(e)}")

@router.get("/types")
async def get_notification_types():
    """Obtém tipos de notificação disponíveis"""
    return {
        "notification_types": [ntype.value for ntype in NotificationType],
        "channels": [channel.value for channel in NotificationChannel],
        "priorities": [priority.value for priority in NotificationPriority],
        "statuses": [status.value for status in NotificationStatus]
    }