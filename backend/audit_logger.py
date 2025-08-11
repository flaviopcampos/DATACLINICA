#!/usr/bin/env python3
"""
DataClínica - Sistema de Auditoria e Logs de Segurança

Este módulo implementa um sistema abrangente de auditoria e logs de segurança
para rastrear todas as ações críticas do sistema, incluindo:
- Acessos e autenticação
- Modificações de dados sensíveis
- Operações administrativas
- Tentativas de acesso não autorizado
- Compliance com LGPD
"""

import os
import json
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any, Union
from enum import Enum
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Index
import logging
from functools import wraps
from contextlib import contextmanager

from database import Base, get_db

# Configurar logging
logger = logging.getLogger(__name__)

class AuditEventType(str, Enum):
    """Tipos de eventos de auditoria"""
    # Autenticação e Autorização
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    PASSWORD_RESET = "password_reset"
    TWO_FACTOR_ENABLED = "2fa_enabled"
    TWO_FACTOR_DISABLED = "2fa_disabled"
    TWO_FACTOR_FAILED = "2fa_failed"
    
    # Operações de Dados
    DATA_CREATE = "data_create"
    DATA_READ = "data_read"
    DATA_UPDATE = "data_update"
    DATA_DELETE = "data_delete"
    DATA_EXPORT = "data_export"
    DATA_IMPORT = "data_import"
    
    # Dados Sensíveis (LGPD)
    SENSITIVE_DATA_ACCESS = "sensitive_data_access"
    SENSITIVE_DATA_MODIFY = "sensitive_data_modify"
    PERSONAL_DATA_CONSENT = "personal_data_consent"
    DATA_PORTABILITY_REQUEST = "data_portability_request"
    DATA_DELETION_REQUEST = "data_deletion_request"
    
    # Operações Administrativas
    USER_CREATE = "user_create"
    USER_UPDATE = "user_update"
    USER_DELETE = "user_delete"
    USER_ROLE_CHANGE = "user_role_change"
    PERMISSION_GRANT = "permission_grant"
    PERMISSION_REVOKE = "permission_revoke"
    
    # Segurança
    SECURITY_VIOLATION = "security_violation"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    BRUTE_FORCE_ATTEMPT = "brute_force_attempt"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    SESSION_HIJACK_ATTEMPT = "session_hijack_attempt"
    
    # Sistema
    SYSTEM_CONFIG_CHANGE = "system_config_change"
    BACKUP_CREATE = "backup_create"
    BACKUP_RESTORE = "backup_restore"
    MAINTENANCE_START = "maintenance_start"
    MAINTENANCE_END = "maintenance_end"
    
    # Compliance
    GDPR_REQUEST = "gdpr_request"
    LGPD_REQUEST = "lgpd_request"
    AUDIT_LOG_ACCESS = "audit_log_access"
    COMPLIANCE_REPORT = "compliance_report"

class AuditSeverity(str, Enum):
    """Níveis de severidade dos eventos"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AuditLog(Base):
    """Modelo para logs de auditoria"""
    
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Identificação do evento
    event_type = Column(String(100), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    event_id = Column(String(36), unique=True, index=True)  # UUID
    
    # Contexto do usuário
    user_id = Column(Integer, index=True)
    username = Column(String(100), index=True)
    user_role = Column(String(50))
    
    # Contexto da sessão
    session_id = Column(String(255), index=True)
    ip_address = Column(String(45), index=True)
    user_agent = Column(Text)
    
    # Detalhes do evento
    resource_type = Column(String(100), index=True)  # user, patient, prescription, etc.
    resource_id = Column(String(100), index=True)
    action = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    
    # Dados do evento
    old_values = Column(JSON)  # Valores antes da modificação
    new_values = Column(JSON)  # Valores após a modificação
    metadata = Column(JSON)    # Metadados adicionais
    
    # Informações técnicas
    endpoint = Column(String(255))
    http_method = Column(String(10))
    status_code = Column(Integer)
    response_time_ms = Column(Integer)
    
    # Geolocalização
    country = Column(String(100))
    city = Column(String(100))
    
    # Compliance
    is_sensitive_data = Column(Boolean, default=False, index=True)
    retention_period_days = Column(Integer, default=2555)  # 7 anos para compliance
    
    # Integridade
    checksum = Column(String(64))  # Hash SHA-256 para verificar integridade
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Índices compostos para consultas otimizadas
    __table_args__ = (
        Index('idx_audit_user_date', 'user_id', 'created_at'),
        Index('idx_audit_event_date', 'event_type', 'created_at'),
        Index('idx_audit_resource', 'resource_type', 'resource_id'),
        Index('idx_audit_severity_date', 'severity', 'created_at'),
        Index('idx_audit_sensitive', 'is_sensitive_data', 'created_at'),
    )
    
    def __repr__(self):
        return f"<AuditLog(event_type={self.event_type}, user_id={self.user_id}, created_at={self.created_at})>"
    
    def calculate_checksum(self) -> str:
        """Calcula checksum para verificação de integridade"""
        data = {
            'event_type': self.event_type,
            'user_id': self.user_id,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'action': self.action,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
    
    def verify_integrity(self) -> bool:
        """Verifica integridade do log"""
        return self.checksum == self.calculate_checksum()

class AuditLogger:
    """Sistema de auditoria e logs de segurança"""
    
    def __init__(self):
        self.enabled = os.getenv("AUDIT_LOGGING_ENABLED", "true").lower() == "true"
        self.log_sensitive_data = os.getenv("LOG_SENSITIVE_DATA", "false").lower() == "true"
        self.max_description_length = int(os.getenv("AUDIT_MAX_DESCRIPTION_LENGTH", "1000"))
        
        # Configurar logger de arquivo para auditoria
        self.file_logger = self._setup_file_logger()
    
    def _setup_file_logger(self) -> logging.Logger:
        """Configura logger de arquivo para auditoria"""
        audit_logger = logging.getLogger('audit')
        audit_logger.setLevel(logging.INFO)
        
        # Handler para arquivo de auditoria
        log_dir = os.getenv("AUDIT_LOG_DIR", "logs")
        os.makedirs(log_dir, exist_ok=True)
        
        handler = logging.FileHandler(
            os.path.join(log_dir, f"audit_{datetime.now().strftime('%Y%m')}.log"),
            encoding='utf-8'
        )
        
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        audit_logger.addHandler(handler)
        
        return audit_logger
    
    def log_event(
        self,
        db: Session,
        event_type: AuditEventType,
        description: str,
        user_id: Optional[int] = None,
        username: Optional[str] = None,
        user_role: Optional[str] = None,
        session_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[Union[str, int]] = None,
        action: Optional[str] = None,
        old_values: Optional[Dict] = None,
        new_values: Optional[Dict] = None,
        metadata: Optional[Dict] = None,
        endpoint: Optional[str] = None,
        http_method: Optional[str] = None,
        status_code: Optional[int] = None,
        response_time_ms: Optional[int] = None,
        severity: AuditSeverity = AuditSeverity.MEDIUM,
        is_sensitive_data: bool = False
    ) -> Optional[AuditLog]:
        """
        Registra um evento de auditoria.
        
        Args:
            db: Sessão do banco de dados
            event_type: Tipo do evento
            description: Descrição do evento
            user_id: ID do usuário
            username: Nome do usuário
            user_role: Papel do usuário
            session_id: ID da sessão
            ip_address: Endereço IP
            user_agent: User-Agent
            resource_type: Tipo do recurso afetado
            resource_id: ID do recurso afetado
            action: Ação realizada
            old_values: Valores antes da modificação
            new_values: Valores após a modificação
            metadata: Metadados adicionais
            endpoint: Endpoint da API
            http_method: Método HTTP
            status_code: Código de status HTTP
            response_time_ms: Tempo de resposta em ms
            severity: Severidade do evento
            is_sensitive_data: Se envolve dados sensíveis
            
        Returns:
            Objeto AuditLog criado ou None se auditoria estiver desabilitada
        """
        if not self.enabled:
            return None
        
        try:
            # Limitar tamanho da descrição
            if len(description) > self.max_description_length:
                description = description[:self.max_description_length] + "..."
            
            # Filtrar dados sensíveis se necessário
            if not self.log_sensitive_data and is_sensitive_data:
                old_values = self._sanitize_sensitive_data(old_values)
                new_values = self._sanitize_sensitive_data(new_values)
            
            # Gerar ID único do evento
            import uuid
            event_id = str(uuid.uuid4())
            
            # Criar log de auditoria
            audit_log = AuditLog(
                event_type=event_type.value,
                severity=severity.value,
                event_id=event_id,
                user_id=user_id,
                username=username,
                user_role=user_role,
                session_id=session_id,
                ip_address=ip_address,
                user_agent=user_agent,
                resource_type=resource_type,
                resource_id=str(resource_id) if resource_id else None,
                action=action or event_type.value,
                description=description,
                old_values=old_values,
                new_values=new_values,
                metadata=metadata or {},
                endpoint=endpoint,
                http_method=http_method,
                status_code=status_code,
                response_time_ms=response_time_ms,
                is_sensitive_data=is_sensitive_data
            )
            
            # Calcular checksum para integridade
            audit_log.checksum = audit_log.calculate_checksum()
            
            # Salvar no banco
            db.add(audit_log)
            db.commit()
            db.refresh(audit_log)
            
            # Log em arquivo também
            self._log_to_file(audit_log)
            
            return audit_log
            
        except Exception as e:
            logger.error(f"Erro ao registrar evento de auditoria: {e}")
            db.rollback()
            return None
    
    def _sanitize_sensitive_data(self, data: Optional[Dict]) -> Optional[Dict]:
        """Remove ou mascara dados sensíveis"""
        if not data:
            return data
        
        sensitive_fields = {
            'password', 'senha', 'cpf', 'rg', 'social_security',
            'credit_card', 'bank_account', 'phone', 'email',
            'address', 'endereco', 'telefone'
        }
        
        sanitized = {}
        for key, value in data.items():
            if any(field in key.lower() for field in sensitive_fields):
                sanitized[key] = "[REDACTED]"
            else:
                sanitized[key] = value
        
        return sanitized
    
    def _log_to_file(self, audit_log: AuditLog):
        """Registra evento em arquivo de log"""
        try:
            log_data = {
                'event_id': audit_log.event_id,
                'event_type': audit_log.event_type,
                'severity': audit_log.severity,
                'user_id': audit_log.user_id,
                'username': audit_log.username,
                'ip_address': audit_log.ip_address,
                'resource_type': audit_log.resource_type,
                'resource_id': audit_log.resource_id,
                'action': audit_log.action,
                'description': audit_log.description,
                'created_at': audit_log.created_at.isoformat(),
                'checksum': audit_log.checksum
            }
            
            self.file_logger.info(json.dumps(log_data, ensure_ascii=False))
            
        except Exception as e:
            logger.error(f"Erro ao registrar em arquivo: {e}")
    
    def search_logs(
        self,
        db: Session,
        user_id: Optional[int] = None,
        event_type: Optional[AuditEventType] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        severity: Optional[AuditSeverity] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        ip_address: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[AuditLog]:
        """
        Busca logs de auditoria com filtros.
        
        Args:
            db: Sessão do banco de dados
            user_id: ID do usuário
            event_type: Tipo do evento
            resource_type: Tipo do recurso
            resource_id: ID do recurso
            severity: Severidade
            start_date: Data inicial
            end_date: Data final
            ip_address: Endereço IP
            limit: Limite de resultados
            offset: Offset para paginação
            
        Returns:
            Lista de logs de auditoria
        """
        try:
            query = db.query(AuditLog)
            
            # Aplicar filtros
            if user_id:
                query = query.filter(AuditLog.user_id == user_id)
            
            if event_type:
                query = query.filter(AuditLog.event_type == event_type.value)
            
            if resource_type:
                query = query.filter(AuditLog.resource_type == resource_type)
            
            if resource_id:
                query = query.filter(AuditLog.resource_id == str(resource_id))
            
            if severity:
                query = query.filter(AuditLog.severity == severity.value)
            
            if start_date:
                query = query.filter(AuditLog.created_at >= start_date)
            
            if end_date:
                query = query.filter(AuditLog.created_at <= end_date)
            
            if ip_address:
                query = query.filter(AuditLog.ip_address == ip_address)
            
            # Ordenar por data (mais recente primeiro)
            query = query.order_by(AuditLog.created_at.desc())
            
            # Aplicar paginação
            return query.offset(offset).limit(limit).all()
            
        except Exception as e:
            logger.error(f"Erro ao buscar logs de auditoria: {e}")
            return []
    
    def get_user_activity_summary(
        self,
        db: Session,
        user_id: int,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Retorna resumo da atividade de um usuário.
        
        Args:
            db: Sessão do banco de dados
            user_id: ID do usuário
            days: Número de dias para análise
            
        Returns:
            Resumo da atividade do usuário
        """
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            logs = db.query(AuditLog).filter(
                AuditLog.user_id == user_id,
                AuditLog.created_at >= start_date
            ).all()
            
            # Estatísticas
            total_events = len(logs)
            event_types = {}
            severity_counts = {}
            daily_activity = {}
            
            for log in logs:
                # Contar tipos de evento
                event_types[log.event_type] = event_types.get(log.event_type, 0) + 1
                
                # Contar severidades
                severity_counts[log.severity] = severity_counts.get(log.severity, 0) + 1
                
                # Atividade diária
                date_key = log.created_at.date().isoformat()
                daily_activity[date_key] = daily_activity.get(date_key, 0) + 1
            
            return {
                'user_id': user_id,
                'period_days': days,
                'total_events': total_events,
                'event_types': event_types,
                'severity_counts': severity_counts,
                'daily_activity': daily_activity,
                'most_active_day': max(daily_activity.items(), key=lambda x: x[1]) if daily_activity else None,
                'security_events': len([l for l in logs if 'security' in l.event_type or 'suspicious' in l.event_type])
            }
            
        except Exception as e:
            logger.error(f"Erro ao gerar resumo de atividade: {e}")
            return {}
    
    def cleanup_old_logs(self, db: Session, retention_days: int = 2555) -> int:
        """
        Remove logs antigos baseado no período de retenção.
        
        Args:
            db: Sessão do banco de dados
            retention_days: Dias de retenção (padrão: 7 anos)
            
        Returns:
            Número de logs removidos
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
            
            # Buscar logs antigos
            old_logs = db.query(AuditLog).filter(
                AuditLog.created_at < cutoff_date
            ).all()
            
            count = len(old_logs)
            
            # Remover logs
            for log in old_logs:
                db.delete(log)
            
            db.commit()
            
            logger.info(f"Limpeza de auditoria: {count} logs antigos removidos")
            return count
            
        except Exception as e:
            logger.error(f"Erro na limpeza de logs: {e}")
            db.rollback()
            return 0

# Decorador para auditoria automática
def audit_action(
    event_type: AuditEventType,
    description: str,
    resource_type: Optional[str] = None,
    severity: AuditSeverity = AuditSeverity.MEDIUM,
    is_sensitive_data: bool = False
):
    """
    Decorador para auditoria automática de funções.
    
    Args:
        event_type: Tipo do evento
        description: Descrição do evento
        resource_type: Tipo do recurso
        severity: Severidade
        is_sensitive_data: Se envolve dados sensíveis
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Executar função
            start_time = datetime.utcnow()
            try:
                result = func(*args, **kwargs)
                status = "success"
                return result
            except Exception as e:
                status = "error"
                raise
            finally:
                # Registrar auditoria
                end_time = datetime.utcnow()
                response_time = int((end_time - start_time).total_seconds() * 1000)
                
                # Tentar obter contexto da requisição
                try:
                    from fastapi import Request
                    # Implementar lógica para extrair contexto da requisição
                    # Isso seria mais complexo na prática
                except:
                    pass
                
                # Log básico por enquanto
                logger.info(f"Audit: {event_type.value} - {description} - Status: {status}")
        
        return wrapper
    return decorator

# Context manager para auditoria de transações
@contextmanager
def audit_transaction(
    db: Session,
    audit_logger: AuditLogger,
    event_type: AuditEventType,
    description: str,
    **kwargs
):
    """
    Context manager para auditoria de transações.
    
    Args:
        db: Sessão do banco de dados
        audit_logger: Instância do AuditLogger
        event_type: Tipo do evento
        description: Descrição do evento
        **kwargs: Argumentos adicionais para o log
    """
    start_time = datetime.utcnow()
    success = False
    
    try:
        yield
        success = True
    except Exception as e:
        kwargs['metadata'] = kwargs.get('metadata', {})
        kwargs['metadata']['error'] = str(e)
        kwargs['severity'] = AuditSeverity.HIGH
        raise
    finally:
        end_time = datetime.utcnow()
        response_time = int((end_time - start_time).total_seconds() * 1000)
        
        kwargs['response_time_ms'] = response_time
        kwargs['metadata'] = kwargs.get('metadata', {})
        kwargs['metadata']['success'] = success
        
        audit_logger.log_event(
            db=db,
            event_type=event_type,
            description=description,
            **kwargs
        )

# Instância global
audit_logger = AuditLogger()