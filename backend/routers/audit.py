#!/usr/bin/env python3
"""
DataClínica - API de Auditoria e Logs de Segurança

Este módulo implementa os endpoints da API para consulta e gerenciamento
dos logs de auditoria e segurança do sistema.
"""

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database import get_db
from auth import get_current_user
from models import User
from audit_logger import audit_logger, AuditLog, AuditEventType, AuditSeverity

router = APIRouter(prefix="/audit", tags=["audit"])

# Schemas Pydantic

class AuditLogResponse(BaseModel):
    """Resposta com informações do log de auditoria"""
    id: int
    event_type: str
    severity: str
    event_id: str
    user_id: Optional[int]
    username: Optional[str]
    user_role: Optional[str]
    session_id: Optional[str]
    ip_address: Optional[str]
    resource_type: Optional[str]
    resource_id: Optional[str]
    action: str
    description: str
    endpoint: Optional[str]
    http_method: Optional[str]
    status_code: Optional[int]
    response_time_ms: Optional[int]
    country: Optional[str]
    city: Optional[str]
    is_sensitive_data: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class AuditSearchRequest(BaseModel):
    """Parâmetros de busca para logs de auditoria"""
    user_id: Optional[int] = None
    event_type: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    severity: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    ip_address: Optional[str] = None
    limit: int = Field(default=100, le=1000)
    offset: int = Field(default=0, ge=0)

class UserActivitySummary(BaseModel):
    """Resumo da atividade do usuário"""
    user_id: int
    period_days: int
    total_events: int
    event_types: dict
    severity_counts: dict
    daily_activity: dict
    most_active_day: Optional[tuple]
    security_events: int

class AuditStats(BaseModel):
    """Estatísticas gerais de auditoria"""
    total_logs: int
    logs_last_24h: int
    logs_last_7d: int
    logs_last_30d: int
    top_event_types: dict
    top_users: dict
    security_events_count: int
    critical_events_count: int

# Endpoints

@router.get("/logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    user_id: Optional[int] = Query(None, description="ID do usuário"),
    event_type: Optional[str] = Query(None, description="Tipo do evento"),
    resource_type: Optional[str] = Query(None, description="Tipo do recurso"),
    resource_id: Optional[str] = Query(None, description="ID do recurso"),
    severity: Optional[str] = Query(None, description="Severidade"),
    start_date: Optional[datetime] = Query(None, description="Data inicial"),
    end_date: Optional[datetime] = Query(None, description="Data final"),
    ip_address: Optional[str] = Query(None, description="Endereço IP"),
    limit: int = Query(100, le=1000, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna logs de auditoria com filtros opcionais.
    Apenas administradores podem acessar logs de outros usuários.
    
    Returns:
        Lista de logs de auditoria
    """
    try:
        # Verificar permissões
        if user_id and user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: apenas administradores podem ver logs de outros usuários"
            )
        
        # Se não for admin, só pode ver seus próprios logs
        if not current_user.is_admin:
            user_id = current_user.id
        
        # Converter string para enum se necessário
        event_type_enum = None
        if event_type:
            try:
                event_type_enum = AuditEventType(event_type)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Tipo de evento inválido: {event_type}"
                )
        
        severity_enum = None
        if severity:
            try:
                severity_enum = AuditSeverity(severity)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Severidade inválida: {severity}"
                )
        
        # Buscar logs
        logs = audit_logger.search_logs(
            db=db,
            user_id=user_id,
            event_type=event_type_enum,
            resource_type=resource_type,
            resource_id=resource_id,
            severity=severity_enum,
            start_date=start_date,
            end_date=end_date,
            ip_address=ip_address,
            limit=limit,
            offset=offset
        )
        
        # Registrar acesso aos logs de auditoria
        audit_logger.log_event(
            db=db,
            event_type=AuditEventType.AUDIT_LOG_ACCESS,
            description=f"Usuário acessou logs de auditoria (filtros: user_id={user_id}, event_type={event_type})",
            user_id=current_user.id,
            username=current_user.username,
            user_role=current_user.role,
            severity=AuditSeverity.LOW
        )
        
        return logs
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar logs de auditoria: {str(e)}"
        )

@router.get("/user/{user_id}/activity", response_model=UserActivitySummary)
async def get_user_activity(
    user_id: int,
    days: int = Query(30, ge=1, le=365, description="Número de dias para análise"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna resumo da atividade de um usuário específico.
    
    Args:
        user_id: ID do usuário
        days: Número de dias para análise
        
    Returns:
        Resumo da atividade do usuário
    """
    try:
        # Verificar permissões
        if user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: apenas administradores podem ver atividade de outros usuários"
            )
        
        # Verificar se o usuário existe
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Obter resumo da atividade
        summary = audit_logger.get_user_activity_summary(db, user_id, days)
        
        # Registrar acesso
        audit_logger.log_event(
            db=db,
            event_type=AuditEventType.AUDIT_LOG_ACCESS,
            description=f"Usuário acessou resumo de atividade do usuário {user_id}",
            user_id=current_user.id,
            username=current_user.username,
            user_role=current_user.role,
            resource_type="user",
            resource_id=str(user_id),
            severity=AuditSeverity.LOW
        )
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter atividade do usuário: {str(e)}"
        )

@router.get("/stats", response_model=AuditStats)
async def get_audit_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna estatísticas gerais de auditoria.
    Apenas administradores podem acessar.
    
    Returns:
        Estatísticas de auditoria
    """
    try:
        # Verificar permissões
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: apenas administradores podem ver estatísticas de auditoria"
            )
        
        # Calcular estatísticas
        now = datetime.utcnow()
        
        # Total de logs
        total_logs = db.query(AuditLog).count()
        
        # Logs nas últimas 24 horas
        logs_24h = db.query(AuditLog).filter(
            AuditLog.created_at >= now - timedelta(hours=24)
        ).count()
        
        # Logs nos últimos 7 dias
        logs_7d = db.query(AuditLog).filter(
            AuditLog.created_at >= now - timedelta(days=7)
        ).count()
        
        # Logs nos últimos 30 dias
        logs_30d = db.query(AuditLog).filter(
            AuditLog.created_at >= now - timedelta(days=30)
        ).count()
        
        # Top tipos de evento (últimos 30 dias)
        recent_logs = db.query(AuditLog).filter(
            AuditLog.created_at >= now - timedelta(days=30)
        ).all()
        
        event_types = {}
        users = {}
        security_events = 0
        critical_events = 0
        
        for log in recent_logs:
            # Contar tipos de evento
            event_types[log.event_type] = event_types.get(log.event_type, 0) + 1
            
            # Contar usuários
            if log.username:
                users[log.username] = users.get(log.username, 0) + 1
            
            # Contar eventos de segurança
            if 'security' in log.event_type or 'suspicious' in log.event_type:
                security_events += 1
            
            # Contar eventos críticos
            if log.severity == AuditSeverity.CRITICAL.value:
                critical_events += 1
        
        # Top 10 tipos de evento
        top_event_types = dict(sorted(event_types.items(), key=lambda x: x[1], reverse=True)[:10])
        
        # Top 10 usuários
        top_users = dict(sorted(users.items(), key=lambda x: x[1], reverse=True)[:10])
        
        stats = AuditStats(
            total_logs=total_logs,
            logs_last_24h=logs_24h,
            logs_last_7d=logs_7d,
            logs_last_30d=logs_30d,
            top_event_types=top_event_types,
            top_users=top_users,
            security_events_count=security_events,
            critical_events_count=critical_events
        )
        
        # Registrar acesso
        audit_logger.log_event(
            db=db,
            event_type=AuditEventType.AUDIT_LOG_ACCESS,
            description="Usuário acessou estatísticas de auditoria",
            user_id=current_user.id,
            username=current_user.username,
            user_role=current_user.role,
            severity=AuditSeverity.LOW
        )
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter estatísticas de auditoria: {str(e)}"
        )

@router.get("/events/types")
async def get_event_types(
    current_user: User = Depends(get_current_user)
):
    """
    Retorna lista de tipos de eventos disponíveis.
    
    Returns:
        Lista de tipos de eventos
    """
    return {
        "event_types": [event_type.value for event_type in AuditEventType],
        "severities": [severity.value for severity in AuditSeverity]
    }

@router.post("/cleanup")
async def cleanup_old_logs(
    retention_days: int = Query(2555, ge=30, le=3650, description="Dias de retenção"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove logs antigos baseado no período de retenção.
    Apenas administradores podem executar.
    
    Args:
        retention_days: Dias de retenção (padrão: 7 anos)
        
    Returns:
        Número de logs removidos
    """
    try:
        # Verificar permissões
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: apenas administradores podem executar limpeza"
            )
        
        # Executar limpeza
        cleaned_count = audit_logger.cleanup_old_logs(db, retention_days)
        
        # Registrar operação
        audit_logger.log_event(
            db=db,
            event_type=AuditEventType.SYSTEM_CONFIG_CHANGE,
            description=f"Limpeza de logs de auditoria executada: {cleaned_count} logs removidos (retenção: {retention_days} dias)",
            user_id=current_user.id,
            username=current_user.username,
            user_role=current_user.role,
            severity=AuditSeverity.MEDIUM,
            metadata={"retention_days": retention_days, "cleaned_count": cleaned_count}
        )
        
        return {
            "message": f"Limpeza concluída: {cleaned_count} logs antigos removidos",
            "cleaned_count": cleaned_count,
            "retention_days": retention_days
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro na limpeza de logs: {str(e)}"
        )

@router.get("/export")
async def export_audit_logs(
    format: str = Query("json", regex="^(json|csv)$", description="Formato de exportação"),
    start_date: Optional[datetime] = Query(None, description="Data inicial"),
    end_date: Optional[datetime] = Query(None, description="Data final"),
    event_type: Optional[str] = Query(None, description="Tipo do evento"),
    user_id: Optional[int] = Query(None, description="ID do usuário"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exporta logs de auditoria em formato JSON ou CSV.
    Apenas administradores podem exportar.
    
    Args:
        format: Formato de exportação (json ou csv)
        start_date: Data inicial
        end_date: Data final
        event_type: Tipo do evento
        user_id: ID do usuário
        
    Returns:
        Arquivo com logs exportados
    """
    try:
        # Verificar permissões
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: apenas administradores podem exportar logs"
            )
        
        # Converter string para enum se necessário
        event_type_enum = None
        if event_type:
            try:
                event_type_enum = AuditEventType(event_type)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Tipo de evento inválido: {event_type}"
                )
        
        # Buscar logs
        logs = audit_logger.search_logs(
            db=db,
            user_id=user_id,
            event_type=event_type_enum,
            start_date=start_date,
            end_date=end_date,
            limit=10000  # Limite alto para exportação
        )
        
        # Registrar exportação
        audit_logger.log_event(
            db=db,
            event_type=AuditEventType.DATA_EXPORT,
            description=f"Exportação de logs de auditoria (formato: {format}, {len(logs)} logs)",
            user_id=current_user.id,
            username=current_user.username,
            user_role=current_user.role,
            severity=AuditSeverity.MEDIUM,
            is_sensitive_data=True,
            metadata={
                "format": format,
                "logs_count": len(logs),
                "filters": {
                    "start_date": start_date.isoformat() if start_date else None,
                    "end_date": end_date.isoformat() if end_date else None,
                    "event_type": event_type,
                    "user_id": user_id
                }
            }
        )
        
        if format == "json":
            from fastapi.responses import JSONResponse
            
            # Converter logs para dicionários
            logs_data = []
            for log in logs:
                log_dict = {
                    "id": log.id,
                    "event_type": log.event_type,
                    "severity": log.severity,
                    "event_id": log.event_id,
                    "user_id": log.user_id,
                    "username": log.username,
                    "user_role": log.user_role,
                    "session_id": log.session_id,
                    "ip_address": log.ip_address,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "action": log.action,
                    "description": log.description,
                    "endpoint": log.endpoint,
                    "http_method": log.http_method,
                    "status_code": log.status_code,
                    "response_time_ms": log.response_time_ms,
                    "country": log.country,
                    "city": log.city,
                    "is_sensitive_data": log.is_sensitive_data,
                    "created_at": log.created_at.isoformat(),
                    "old_values": log.old_values,
                    "new_values": log.new_values,
                    "metadata": log.metadata
                }
                logs_data.append(log_dict)
            
            return JSONResponse(
                content={
                    "export_info": {
                        "format": "json",
                        "exported_at": datetime.utcnow().isoformat(),
                        "exported_by": current_user.username,
                        "total_logs": len(logs_data)
                    },
                    "logs": logs_data
                },
                headers={
                    "Content-Disposition": f"attachment; filename=audit_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                }
            )
        
        elif format == "csv":
            import csv
            import io
            from fastapi.responses import StreamingResponse
            
            # Criar CSV em memória
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Cabeçalho
            writer.writerow([
                "ID", "Tipo de Evento", "Severidade", "ID do Evento", "ID do Usuário",
                "Nome do Usuário", "Papel do Usuário", "ID da Sessão", "Endereço IP",
                "Tipo do Recurso", "ID do Recurso", "Ação", "Descrição", "Endpoint",
                "Método HTTP", "Código de Status", "Tempo de Resposta (ms)",
                "País", "Cidade", "Dados Sensíveis", "Data de Criação"
            ])
            
            # Dados
            for log in logs:
                writer.writerow([
                    log.id, log.event_type, log.severity, log.event_id, log.user_id,
                    log.username, log.user_role, log.session_id, log.ip_address,
                    log.resource_type, log.resource_id, log.action, log.description,
                    log.endpoint, log.http_method, log.status_code, log.response_time_ms,
                    log.country, log.city, log.is_sensitive_data, log.created_at.isoformat()
                ])
            
            output.seek(0)
            
            return StreamingResponse(
                io.BytesIO(output.getvalue().encode('utf-8')),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=audit_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                }
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro na exportação de logs: {str(e)}"
        )

@router.get("/integrity/verify")
async def verify_logs_integrity(
    limit: int = Query(1000, ge=1, le=10000, description="Limite de logs para verificar"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verifica a integridade dos logs de auditoria.
    Apenas administradores podem executar.
    
    Args:
        limit: Limite de logs para verificar
        
    Returns:
        Resultado da verificação de integridade
    """
    try:
        # Verificar permissões
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: apenas administradores podem verificar integridade"
            )
        
        # Buscar logs recentes
        logs = db.query(AuditLog).order_by(
            AuditLog.created_at.desc()
        ).limit(limit).all()
        
        # Verificar integridade
        total_logs = len(logs)
        corrupted_logs = []
        
        for log in logs:
            if not log.verify_integrity():
                corrupted_logs.append({
                    "id": log.id,
                    "event_id": log.event_id,
                    "created_at": log.created_at.isoformat(),
                    "expected_checksum": log.calculate_checksum(),
                    "stored_checksum": log.checksum
                })
        
        integrity_ok = len(corrupted_logs) == 0
        
        # Registrar verificação
        audit_logger.log_event(
            db=db,
            event_type=AuditEventType.SYSTEM_CONFIG_CHANGE,
            description=f"Verificação de integridade executada: {total_logs} logs verificados, {len(corrupted_logs)} corrompidos",
            user_id=current_user.id,
            username=current_user.username,
            user_role=current_user.role,
            severity=AuditSeverity.HIGH if not integrity_ok else AuditSeverity.LOW,
            metadata={
                "total_logs": total_logs,
                "corrupted_count": len(corrupted_logs),
                "integrity_ok": integrity_ok
            }
        )
        
        return {
            "integrity_ok": integrity_ok,
            "total_logs_checked": total_logs,
            "corrupted_logs_count": len(corrupted_logs),
            "corrupted_logs": corrupted_logs[:10] if corrupted_logs else [],  # Limitar a 10 para não sobrecarregar
            "verification_date": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro na verificação de integridade: {str(e)}"
        )