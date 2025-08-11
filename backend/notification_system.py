#!/usr/bin/env python3
"""
DataClínica - Sistema de Notificações e Alertas

Este módulo implementa um sistema completo de notificações em tempo real,
alertas de segurança, notificações por email/SMS e comunicação com usuários.
"""

import json
import smtplib
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Callable
from dataclasses import dataclass, field
from enum import Enum
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import ssl
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Session, relationship
from sqlalchemy.ext.declarative import declarative_base

from .models import User, Patient, Base
from .audit_logger import AuditLogger, EventType, EventSeverity
from .security_config import SecurityConfig

class NotificationType(str, Enum):
    """Tipos de notificação"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"
    SECURITY_ALERT = "security_alert"
    SYSTEM_MAINTENANCE = "system_maintenance"
    APPOINTMENT_REMINDER = "appointment_reminder"
    PRESCRIPTION_REMINDER = "prescription_reminder"
    COMPLIANCE_ALERT = "compliance_alert"
    DATA_BREACH = "data_breach"
    LOGIN_ALERT = "login_alert"
    PASSWORD_EXPIRY = "password_expiry"
    BACKUP_STATUS = "backup_status"

class NotificationChannel(str, Enum):
    """Canais de notificação"""
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBHOOK = "webhook"
    SLACK = "slack"
    TEAMS = "teams"

class NotificationPriority(str, Enum):
    """Prioridade da notificação"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"

class NotificationStatus(str, Enum):
    """Status da notificação"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
    EXPIRED = "expired"

# Modelo de banco de dados para notificações
class Notification(Base):
    """Modelo de notificação"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    recipient_email = Column(String(255), nullable=True)
    recipient_phone = Column(String(20), nullable=True)
    
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    channel = Column(SQLEnum(NotificationChannel), nullable=False)
    priority = Column(SQLEnum(NotificationPriority), default=NotificationPriority.NORMAL)
    status = Column(SQLEnum(NotificationStatus), default=NotificationStatus.PENDING)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(Text, nullable=True)  # JSON data
    
    created_at = Column(DateTime, default=datetime.utcnow)
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Relacionamentos
    user = relationship("User", back_populates="notifications")

class NotificationTemplate(Base):
    """Modelo de template de notificação"""
    __tablename__ = "notification_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    channel = Column(SQLEnum(NotificationChannel), nullable=False)
    
    subject_template = Column(String(255), nullable=False)
    body_template = Column(Text, nullable=False)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NotificationPreference(Base):
    """Preferências de notificação do usuário"""
    __tablename__ = "notification_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    channel = Column(SQLEnum(NotificationChannel), nullable=False)
    
    enabled = Column(Boolean, default=True)
    quiet_hours_start = Column(String(5), nullable=True)  # HH:MM
    quiet_hours_end = Column(String(5), nullable=True)  # HH:MM
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User")

@dataclass
class NotificationMessage:
    """Mensagem de notificação"""
    recipient_id: Optional[int]
    recipient_email: Optional[str]
    recipient_phone: Optional[str]
    notification_type: NotificationType
    channel: NotificationChannel
    priority: NotificationPriority
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    template_name: Optional[str] = None
    template_vars: Optional[Dict[str, Any]] = None

@dataclass
class EmailConfig:
    """Configuração de email"""
    smtp_server: str
    smtp_port: int
    username: str
    password: str
    use_tls: bool = True
    from_email: str = ""
    from_name: str = "DataClínica"

@dataclass
class SMSConfig:
    """Configuração de SMS"""
    provider: str  # twilio, aws_sns, etc.
    api_key: str
    api_secret: str
    from_number: str

class NotificationSystem:
    """Sistema de notificações"""
    
    def __init__(self, db: Session, audit_logger: AuditLogger, 
                 email_config: Optional[EmailConfig] = None,
                 sms_config: Optional[SMSConfig] = None):
        self.db = db
        self.audit_logger = audit_logger
        self.email_config = email_config
        self.sms_config = sms_config
        
        # Filas de notificação por canal
        self.notification_queues: Dict[NotificationChannel, List[NotificationMessage]] = {
            channel: [] for channel in NotificationChannel
        }
        
        # Handlers para diferentes canais
        self.channel_handlers: Dict[NotificationChannel, Callable] = {
            NotificationChannel.IN_APP: self._handle_in_app_notification,
            NotificationChannel.EMAIL: self._handle_email_notification,
            NotificationChannel.SMS: self._handle_sms_notification,
            NotificationChannel.PUSH: self._handle_push_notification,
            NotificationChannel.WEBHOOK: self._handle_webhook_notification
        }
        
        # Templates de notificação em memória
        self.templates: Dict[str, Dict[str, str]] = {}
        self._load_templates()
        
        # Subscribers para eventos em tempo real
        self.subscribers: Dict[str, List[Callable]] = {}
        
        # Configurações
        self.config = {
            'max_retries': 3,
            'retry_delay_minutes': [5, 15, 60],  # Delays progressivos
            'batch_size': 100,
            'rate_limit_per_minute': 60,
            'quiet_hours_default': ('22:00', '08:00'),
            'notification_retention_days': 90
        }
    
    async def send_notification(self, notification: NotificationMessage) -> bool:
        """Envia notificação"""
        try:
            # Verificar preferências do usuário
            if not await self._check_user_preferences(notification):
                return False
            
            # Verificar horário silencioso
            if await self._is_quiet_hours(notification):
                # Agendar para depois do horário silencioso
                notification.scheduled_at = await self._calculate_next_send_time(notification)
            
            # Aplicar template se especificado
            if notification.template_name:
                await self._apply_template(notification)
            
            # Criar registro no banco
            db_notification = await self._create_notification_record(notification)
            
            # Enviar imediatamente ou agendar
            if notification.scheduled_at and notification.scheduled_at > datetime.now():
                await self._schedule_notification(notification)
                return True
            else:
                return await self._send_immediate(notification, db_notification)
        
        except Exception as e:
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.ERROR,
                notification.recipient_id,
                f"Erro ao enviar notificação: {str(e)}",
                {
                    'notification_type': notification.notification_type.value,
                    'channel': notification.channel.value,
                    'error': str(e)
                }
            )
            return False
    
    async def send_bulk_notifications(self, notifications: List[NotificationMessage]) -> Dict[str, int]:
        """Envia notificações em lote"""
        results = {'sent': 0, 'failed': 0, 'scheduled': 0}
        
        # Agrupar por canal para otimização
        by_channel = {}
        for notification in notifications:
            channel = notification.channel
            if channel not in by_channel:
                by_channel[channel] = []
            by_channel[channel].append(notification)
        
        # Processar cada canal
        for channel, channel_notifications in by_channel.items():
            for notification in channel_notifications:
                success = await self.send_notification(notification)
                if success:
                    if notification.scheduled_at and notification.scheduled_at > datetime.now():
                        results['scheduled'] += 1
                    else:
                        results['sent'] += 1
                else:
                    results['failed'] += 1
        
        return results
    
    async def send_security_alert(self, user_id: int, alert_type: str, 
                                details: Dict[str, Any], priority: NotificationPriority = NotificationPriority.HIGH):
        """Envia alerta de segurança"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return
        
        # Determinar título e mensagem baseado no tipo de alerta
        alert_messages = {
            'suspicious_login': {
                'title': 'Tentativa de Login Suspeita',
                'message': 'Detectamos uma tentativa de login suspeita em sua conta. Se não foi você, altere sua senha imediatamente.'
            },
            'multiple_failed_logins': {
                'title': 'Múltiplas Tentativas de Login Falharam',
                'message': 'Detectamos múltiplas tentativas de login falharam em sua conta. Sua conta pode estar sob ataque.'
            },
            'password_breach': {
                'title': 'Senha Comprometida',
                'message': 'Sua senha pode ter sido comprometida. Recomendamos alterá-la imediatamente.'
            },
            'account_locked': {
                'title': 'Conta Bloqueada',
                'message': 'Sua conta foi temporariamente bloqueada devido a atividade suspeita.'
            },
            'data_access_anomaly': {
                'title': 'Acesso Anômalo aos Dados',
                'message': 'Detectamos um padrão de acesso anômalo aos dados em sua conta.'
            }
        }
        
        alert_info = alert_messages.get(alert_type, {
            'title': 'Alerta de Segurança',
            'message': 'Detectamos atividade suspeita em sua conta.'
        })
        
        # Enviar por múltiplos canais para alertas críticos
        channels = [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
        if priority == NotificationPriority.CRITICAL:
            channels.append(NotificationChannel.SMS)
        
        for channel in channels:
            notification = NotificationMessage(
                recipient_id=user_id,
                recipient_email=user.email,
                recipient_phone=getattr(user, 'phone', None),
                notification_type=NotificationType.SECURITY_ALERT,
                channel=channel,
                priority=priority,
                title=alert_info['title'],
                message=alert_info['message'],
                data=details
            )
            
            await self.send_notification(notification)
    
    async def send_compliance_notification(self, violation_id: str, affected_users: List[int],
                                         notification_type: str = 'data_breach'):
        """Envia notificação de compliance"""
        if notification_type == 'data_breach':
            title = "Notificação de Violação de Dados"
            message = "Informamos sobre um incidente de segurança que pode ter afetado seus dados pessoais. Estamos tomando todas as medidas necessárias para resolver a situação."
        else:
            title = "Notificação de Compliance"
            message = "Há uma atualização importante sobre o tratamento de seus dados pessoais."
        
        for user_id in affected_users:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                notification = NotificationMessage(
                    recipient_id=user_id,
                    recipient_email=user.email,
                    recipient_phone=getattr(user, 'phone', None),
                    notification_type=NotificationType.COMPLIANCE_ALERT,
                    channel=NotificationChannel.EMAIL,
                    priority=NotificationPriority.HIGH,
                    title=title,
                    message=message,
                    data={'violation_id': violation_id, 'type': notification_type}
                )
                
                await self.send_notification(notification)
    
    async def send_appointment_reminder(self, patient_id: int, appointment_data: Dict[str, Any]):
        """Envia lembrete de consulta"""
        patient = self.db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return
        
        appointment_date = appointment_data.get('date', '')
        appointment_time = appointment_data.get('time', '')
        doctor_name = appointment_data.get('doctor_name', '')
        
        notification = NotificationMessage(
            recipient_id=None,  # Paciente não é usuário do sistema
            recipient_email=patient.email,
            recipient_phone=patient.phone,
            notification_type=NotificationType.APPOINTMENT_REMINDER,
            channel=NotificationChannel.EMAIL,
            priority=NotificationPriority.NORMAL,
            title="Lembrete de Consulta",
            message=f"Você tem uma consulta agendada para {appointment_date} às {appointment_time} com Dr(a). {doctor_name}.",
            data=appointment_data,
            template_name="appointment_reminder",
            template_vars={
                'patient_name': patient.name,
                'appointment_date': appointment_date,
                'appointment_time': appointment_time,
                'doctor_name': doctor_name
            }
        )
        
        await self.send_notification(notification)
    
    async def send_system_maintenance_alert(self, maintenance_data: Dict[str, Any]):
        """Envia alerta de manutenção do sistema"""
        # Buscar todos os usuários ativos
        active_users = self.db.query(User).filter(User.is_active == True).all()
        
        start_time = maintenance_data.get('start_time', '')
        end_time = maintenance_data.get('end_time', '')
        description = maintenance_data.get('description', 'Manutenção programada do sistema')
        
        notifications = []
        for user in active_users:
            notification = NotificationMessage(
                recipient_id=user.id,
                recipient_email=user.email,
                recipient_phone=getattr(user, 'phone', None),
                notification_type=NotificationType.SYSTEM_MAINTENANCE,
                channel=NotificationChannel.IN_APP,
                priority=NotificationPriority.NORMAL,
                title="Manutenção Programada",
                message=f"O sistema estará em manutenção de {start_time} até {end_time}. {description}",
                data=maintenance_data
            )
            notifications.append(notification)
        
        await self.send_bulk_notifications(notifications)
    
    async def _send_immediate(self, notification: NotificationMessage, 
                            db_notification: Notification) -> bool:
        """Envia notificação imediatamente"""
        try:
            handler = self.channel_handlers.get(notification.channel)
            if not handler:
                raise ValueError(f"Handler não encontrado para canal: {notification.channel}")
            
            success = await handler(notification)
            
            # Atualizar status no banco
            if success:
                db_notification.status = NotificationStatus.SENT
                db_notification.sent_at = datetime.now()
            else:
                db_notification.status = NotificationStatus.FAILED
            
            self.db.commit()
            return success
        
        except Exception as e:
            db_notification.status = NotificationStatus.FAILED
            self.db.commit()
            raise e
    
    async def _handle_in_app_notification(self, notification: NotificationMessage) -> bool:
        """Processa notificação in-app"""
        try:
            # Notificação in-app é apenas salvar no banco
            # O frontend buscará as notificações via API
            
            # Notificar subscribers em tempo real (WebSocket)
            await self._notify_subscribers('notification', {
                'user_id': notification.recipient_id,
                'type': notification.notification_type.value,
                'title': notification.title,
                'message': notification.message,
                'priority': notification.priority.value,
                'timestamp': datetime.now().isoformat()
            })
            
            return True
        
        except Exception as e:
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.ERROR,
                notification.recipient_id,
                f"Erro ao processar notificação in-app: {str(e)}",
                {'error': str(e)}
            )
            return False
    
    async def _handle_email_notification(self, notification: NotificationMessage) -> bool:
        """Processa notificação por email"""
        if not self.email_config or not notification.recipient_email:
            return False
        
        try:
            # Criar mensagem de email
            msg = MIMEMultipart()
            msg['From'] = f"{self.email_config.from_name} <{self.email_config.from_email}>"
            msg['To'] = notification.recipient_email
            msg['Subject'] = notification.title
            
            # Corpo do email
            body = notification.message
            if notification.data:
                # Adicionar dados extras se necessário
                pass
            
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            # Enviar email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.email_config.smtp_server, self.email_config.smtp_port) as server:
                if self.email_config.use_tls:
                    server.starttls(context=context)
                server.login(self.email_config.username, self.email_config.password)
                server.send_message(msg)
            
            return True
        
        except Exception as e:
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.ERROR,
                notification.recipient_id,
                f"Erro ao enviar email: {str(e)}",
                {
                    'recipient': notification.recipient_email,
                    'error': str(e)
                }
            )
            return False
    
    async def _handle_sms_notification(self, notification: NotificationMessage) -> bool:
        """Processa notificação por SMS"""
        if not self.sms_config or not notification.recipient_phone:
            return False
        
        try:
            # Implementação dependeria do provedor (Twilio, AWS SNS, etc.)
            # Por enquanto, apenas simular o envio
            
            # Exemplo para Twilio:
            # from twilio.rest import Client
            # client = Client(self.sms_config.api_key, self.sms_config.api_secret)
            # message = client.messages.create(
            #     body=notification.message,
            #     from_=self.sms_config.from_number,
            #     to=notification.recipient_phone
            # )
            
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.INFO,
                notification.recipient_id,
                "SMS enviado",
                {
                    'recipient': notification.recipient_phone,
                    'type': notification.notification_type.value
                }
            )
            
            return True
        
        except Exception as e:
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.ERROR,
                notification.recipient_id,
                f"Erro ao enviar SMS: {str(e)}",
                {
                    'recipient': notification.recipient_phone,
                    'error': str(e)
                }
            )
            return False
    
    async def _handle_push_notification(self, notification: NotificationMessage) -> bool:
        """Processa notificação push"""
        try:
            # Implementação de push notification (Firebase, etc.)
            # Por enquanto, apenas simular
            
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.INFO,
                notification.recipient_id,
                "Push notification enviada",
                {'type': notification.notification_type.value}
            )
            
            return True
        
        except Exception as e:
            return False
    
    async def _handle_webhook_notification(self, notification: NotificationMessage) -> bool:
        """Processa notificação via webhook"""
        try:
            # Implementação de webhook
            # Por enquanto, apenas simular
            return True
        
        except Exception as e:
            return False
    
    async def _check_user_preferences(self, notification: NotificationMessage) -> bool:
        """Verifica preferências do usuário"""
        if not notification.recipient_id:
            return True  # Sem usuário, enviar sempre
        
        preference = self.db.query(NotificationPreference).filter(
            NotificationPreference.user_id == notification.recipient_id,
            NotificationPreference.notification_type == notification.notification_type,
            NotificationPreference.channel == notification.channel
        ).first()
        
        if preference:
            return preference.enabled
        
        # Se não há preferência definida, usar padrão (habilitado)
        return True
    
    async def _is_quiet_hours(self, notification: NotificationMessage) -> bool:
        """Verifica se está em horário silencioso"""
        if notification.priority in [NotificationPriority.URGENT, NotificationPriority.CRITICAL]:
            return False  # Notificações urgentes ignoram horário silencioso
        
        if not notification.recipient_id:
            return False
        
        # Buscar preferências do usuário
        preference = self.db.query(NotificationPreference).filter(
            NotificationPreference.user_id == notification.recipient_id,
            NotificationPreference.notification_type == notification.notification_type,
            NotificationPreference.channel == notification.channel
        ).first()
        
        if preference and preference.quiet_hours_start and preference.quiet_hours_end:
            quiet_start = preference.quiet_hours_start
            quiet_end = preference.quiet_hours_end
        else:
            quiet_start, quiet_end = self.config['quiet_hours_default']
        
        # Verificar se hora atual está no período silencioso
        current_time = datetime.now().strftime('%H:%M')
        
        if quiet_start <= quiet_end:
            # Mesmo dia (ex: 22:00 - 08:00 do dia seguinte)
            return quiet_start <= current_time <= quiet_end
        else:
            # Atravessa meia-noite (ex: 22:00 - 08:00)
            return current_time >= quiet_start or current_time <= quiet_end
    
    async def _calculate_next_send_time(self, notification: NotificationMessage) -> datetime:
        """Calcula próximo horário de envio após horário silencioso"""
        if not notification.recipient_id:
            return datetime.now()
        
        # Buscar preferências do usuário
        preference = self.db.query(NotificationPreference).filter(
            NotificationPreference.user_id == notification.recipient_id,
            NotificationPreference.notification_type == notification.notification_type,
            NotificationPreference.channel == notification.channel
        ).first()
        
        if preference and preference.quiet_hours_end:
            quiet_end = preference.quiet_hours_end
        else:
            quiet_end = self.config['quiet_hours_default'][1]
        
        # Calcular próximo horário após o fim do período silencioso
        now = datetime.now()
        end_hour, end_minute = map(int, quiet_end.split(':'))
        
        next_send = now.replace(hour=end_hour, minute=end_minute, second=0, microsecond=0)
        
        if next_send <= now:
            next_send += timedelta(days=1)
        
        return next_send
    
    async def _apply_template(self, notification: NotificationMessage):
        """Aplica template à notificação"""
        if not notification.template_name or not notification.template_vars:
            return
        
        template = self.templates.get(notification.template_name)
        if not template:
            return
        
        try:
            # Aplicar variáveis ao template
            notification.title = template['subject'].format(**notification.template_vars)
            notification.message = template['body'].format(**notification.template_vars)
        
        except KeyError as e:
            await self.audit_logger.log_event(
                EventType.SYSTEM,
                EventSeverity.WARNING,
                notification.recipient_id,
                f"Variável de template não encontrada: {str(e)}",
                {
                    'template': notification.template_name,
                    'missing_var': str(e)
                }
            )
    
    async def _create_notification_record(self, notification: NotificationMessage) -> Notification:
        """Cria registro de notificação no banco"""
        db_notification = Notification(
            user_id=notification.recipient_id,
            recipient_email=notification.recipient_email,
            recipient_phone=notification.recipient_phone,
            notification_type=notification.notification_type,
            channel=notification.channel,
            priority=notification.priority,
            title=notification.title,
            message=notification.message,
            data=json.dumps(notification.data) if notification.data else None,
            scheduled_at=notification.scheduled_at,
            expires_at=notification.expires_at
        )
        
        self.db.add(db_notification)
        self.db.commit()
        self.db.refresh(db_notification)
        
        return db_notification
    
    async def _schedule_notification(self, notification: NotificationMessage):
        """Agenda notificação para envio posterior"""
        # Adicionar à fila de agendamento
        # Em uma implementação real, usaria Celery, RQ ou similar
        pass
    
    async def _notify_subscribers(self, event_type: str, data: Dict[str, Any]):
        """Notifica subscribers de eventos em tempo real"""
        subscribers = self.subscribers.get(event_type, [])
        for callback in subscribers:
            try:
                await callback(data)
            except Exception as e:
                await self.audit_logger.log_event(
                    EventType.SYSTEM,
                    EventSeverity.ERROR,
                    None,
                    f"Erro ao notificar subscriber: {str(e)}",
                    {'event_type': event_type, 'error': str(e)}
                )
    
    def _load_templates(self):
        """Carrega templates de notificação"""
        # Templates padrão
        self.templates = {
            'appointment_reminder': {
                'subject': 'Lembrete de Consulta - {appointment_date}',
                'body': '''Olá {patient_name},

Este é um lembrete de sua consulta agendada:

Data: {appointment_date}
Horário: {appointment_time}
Médico: {doctor_name}

Por favor, chegue com 15 minutos de antecedência.

Atenciosamente,
Equipe DataClínica'''
            },
            'password_expiry': {
                'subject': 'Sua senha expira em breve',
                'body': '''Olá {user_name},

Sua senha expirará em {days_until_expiry} dias.

Por favor, altere sua senha antes do vencimento para evitar interrupções no acesso.

Atenciosamente,
Equipe DataClínica'''
            },
            'security_alert': {
                'subject': 'Alerta de Segurança - {alert_type}',
                'body': '''Olá {user_name},

Detectamos atividade suspeita em sua conta:

{alert_description}

Se você não reconhece esta atividade, altere sua senha imediatamente e entre em contato conosco.

Atenciosamente,
Equipe de Segurança DataClínica'''
            }
        }
    
    def subscribe(self, event_type: str, callback: Callable):
        """Inscreve callback para eventos"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)
    
    def unsubscribe(self, event_type: str, callback: Callable):
        """Remove inscrição de callback"""
        if event_type in self.subscribers:
            try:
                self.subscribers[event_type].remove(callback)
            except ValueError:
                pass
    
    async def get_user_notifications(self, user_id: int, limit: int = 50, 
                                   offset: int = 0, unread_only: bool = False) -> List[Notification]:
        """Obtém notificações do usuário"""
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.read_at.is_(None))
        
        query = query.order_by(Notification.created_at.desc())
        query = query.offset(offset).limit(limit)
        
        return query.all()
    
    async def mark_notification_read(self, notification_id: int, user_id: int) -> bool:
        """Marca notificação como lida"""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            notification.read_at = datetime.now()
            notification.status = NotificationStatus.READ
            self.db.commit()
            return True
        
        return False
    
    async def mark_all_read(self, user_id: int) -> int:
        """Marca todas as notificações como lidas"""
        count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read_at.is_(None)
        ).update({
            'read_at': datetime.now(),
            'status': NotificationStatus.READ
        })
        
        self.db.commit()
        return count
    
    async def delete_notification(self, notification_id: int, user_id: int) -> bool:
        """Deleta notificação"""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            self.db.delete(notification)
            self.db.commit()
            return True
        
        return False
    
    async def cleanup_old_notifications(self, days: int = None) -> int:
        """Remove notificações antigas"""
        if days is None:
            days = self.config['notification_retention_days']
        
        cutoff_date = datetime.now() - timedelta(days=days)
        
        count = self.db.query(Notification).filter(
            Notification.created_at < cutoff_date
        ).delete()
        
        self.db.commit()
        return count
    
    async def get_notification_statistics(self, user_id: Optional[int] = None, 
                                        days: int = 30) -> Dict[str, Any]:
        """Obtém estatísticas de notificações"""
        start_date = datetime.now() - timedelta(days=days)
        
        query = self.db.query(Notification).filter(Notification.created_at >= start_date)
        
        if user_id:
            query = query.filter(Notification.user_id == user_id)
        
        notifications = query.all()
        
        stats = {
            'total': len(notifications),
            'by_type': {},
            'by_channel': {},
            'by_status': {},
            'by_priority': {},
            'read_rate': 0.0,
            'delivery_rate': 0.0
        }
        
        read_count = 0
        delivered_count = 0
        
        for notification in notifications:
            # Por tipo
            ntype = notification.notification_type.value
            stats['by_type'][ntype] = stats['by_type'].get(ntype, 0) + 1
            
            # Por canal
            channel = notification.channel.value
            stats['by_channel'][channel] = stats['by_channel'].get(channel, 0) + 1
            
            # Por status
            status = notification.status.value
            stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
            
            # Por prioridade
            priority = notification.priority.value
            stats['by_priority'][priority] = stats['by_priority'].get(priority, 0) + 1
            
            # Contadores
            if notification.read_at:
                read_count += 1
            
            if notification.status in [NotificationStatus.SENT, NotificationStatus.DELIVERED, NotificationStatus.READ]:
                delivered_count += 1
        
        # Calcular taxas
        if len(notifications) > 0:
            stats['read_rate'] = (read_count / len(notifications)) * 100
            stats['delivery_rate'] = (delivered_count / len(notifications)) * 100
        
        return stats

# Função utilitária para criar instância do sistema
def create_notification_system(db: Session, audit_logger: AuditLogger,
                             email_config: Optional[EmailConfig] = None,
                             sms_config: Optional[SMSConfig] = None) -> NotificationSystem:
    """Cria instância do sistema de notificações"""
    return NotificationSystem(db, audit_logger, email_config, sms_config)