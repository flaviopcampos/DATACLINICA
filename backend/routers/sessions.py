#!/usr/bin/env python3
"""
DataClínica - API de Controle de Sessões

Este módulo implementa os endpoints da API para gerenciamento avançado de sessões,
incluindo visualização, terminação e bloqueio de sessões.
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database import get_db
from auth import get_current_user
from models import User
from session_manager import session_manager, UserSession, SessionActivity

router = APIRouter(prefix="/sessions", tags=["sessions"])

# Schemas Pydantic

class SessionInfo(BaseModel):
    """Informações básicas da sessão"""
    id: int
    session_token: str = Field(..., description="Token da sessão (mascarado)")
    ip_address: str
    device_type: Optional[str]
    browser: Optional[str]
    os: Optional[str]
    country: Optional[str]
    city: Optional[str]
    is_current: bool = Field(..., description="Se é a sessão atual")
    is_suspicious: bool
    is_blocked: bool
    created_at: datetime
    last_activity: datetime
    expires_at: Optional[datetime]
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_session(cls, session: UserSession, current_token: str = None):
        """Cria SessionInfo a partir de UserSession"""
        return cls(
            id=session.id,
            session_token=f"{session.session_token[:8]}...{session.session_token[-4:]}",
            ip_address=session.ip_address,
            device_type=session.device_type,
            browser=session.browser,
            os=session.os,
            country=session.country,
            city=session.city,
            is_current=session.session_token == current_token,
            is_suspicious=session.is_suspicious,
            is_blocked=session.is_blocked,
            created_at=session.created_at,
            last_activity=session.last_activity,
            expires_at=session.expires_at
        )

class SessionActivity(BaseModel):
    """Atividade da sessão"""
    id: int
    activity_type: str
    endpoint: Optional[str]
    method: Optional[str]
    status_code: Optional[int]
    ip_address: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class SessionStats(BaseModel):
    """Estatísticas das sessões"""
    total_sessions: int
    active_sessions: int
    suspicious_sessions: int
    blocked_sessions: int
    unique_ips: int
    unique_devices: int
    countries: List[str]

class TerminateSessionRequest(BaseModel):
    """Requisição para terminar sessão"""
    session_id: int
    reason: Optional[str] = "manual"

class BlockSessionRequest(BaseModel):
    """Requisição para bloquear sessão"""
    session_id: int
    reason: Optional[str] = "security"

# Endpoints

@router.get("/", response_model=List[SessionInfo])
async def get_user_sessions(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna todas as sessões do usuário atual.
    
    Returns:
        Lista de sessões do usuário
    """
    try:
        # Obter token da sessão atual
        current_token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            current_token = auth_header[7:]
        
        # Buscar todas as sessões do usuário
        sessions = db.query(UserSession).filter(
            UserSession.user_id == current_user.id
        ).order_by(UserSession.last_activity.desc()).all()
        
        return [
            SessionInfo.from_session(session, current_token)
            for session in sessions
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar sessões: {str(e)}"
        )

@router.get("/active", response_model=List[SessionInfo])
async def get_active_sessions(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna apenas as sessões ativas do usuário atual.
    
    Returns:
        Lista de sessões ativas do usuário
    """
    try:
        # Obter token da sessão atual
        current_token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            current_token = auth_header[7:]
        
        # Buscar sessões ativas
        active_sessions = session_manager.get_active_sessions(db, current_user.id)
        
        return [
            SessionInfo.from_session(session, current_token)
            for session in active_sessions
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar sessões ativas: {str(e)}"
        )

@router.get("/stats", response_model=SessionStats)
async def get_session_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna estatísticas das sessões do usuário.
    
    Returns:
        Estatísticas das sessões
    """
    try:
        # Buscar todas as sessões do usuário
        sessions = db.query(UserSession).filter(
            UserSession.user_id == current_user.id
        ).all()
        
        # Calcular estatísticas
        active_sessions = [s for s in sessions if s.is_active and not s.is_blocked]
        suspicious_sessions = [s for s in sessions if s.is_suspicious]
        blocked_sessions = [s for s in sessions if s.is_blocked]
        
        unique_ips = len(set(s.ip_address for s in sessions if s.ip_address))
        unique_devices = len(set(s.device_fingerprint for s in sessions if s.device_fingerprint))
        countries = list(set(s.country for s in sessions if s.country))
        
        return SessionStats(
            total_sessions=len(sessions),
            active_sessions=len(active_sessions),
            suspicious_sessions=len(suspicious_sessions),
            blocked_sessions=len(blocked_sessions),
            unique_ips=unique_ips,
            unique_devices=unique_devices,
            countries=countries
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao calcular estatísticas: {str(e)}"
        )

@router.get("/{session_id}/activities", response_model=List[SessionActivity])
async def get_session_activities(
    session_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna as atividades de uma sessão específica.
    
    Args:
        session_id: ID da sessão
        limit: Limite de atividades a retornar
        
    Returns:
        Lista de atividades da sessão
    """
    try:
        # Verificar se a sessão pertence ao usuário
        session = db.query(UserSession).filter(
            UserSession.id == session_id,
            UserSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sessão não encontrada"
            )
        
        # Buscar atividades da sessão
        activities = db.query(SessionActivity).filter(
            SessionActivity.session_id == session_id
        ).order_by(SessionActivity.created_at.desc()).limit(limit).all()
        
        return activities
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar atividades: {str(e)}"
        )

@router.post("/terminate")
async def terminate_session(
    request: TerminateSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Termina uma sessão específica.
    
    Args:
        request: Dados da requisição com ID da sessão e motivo
        
    Returns:
        Confirmação da terminação
    """
    try:
        # Verificar se a sessão pertence ao usuário
        session = db.query(UserSession).filter(
            UserSession.id == request.session_id,
            UserSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sessão não encontrada"
            )
        
        if not session.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sessão já está inativa"
            )
        
        # Terminar sessão
        success = session_manager.terminate_session(
            db, session.session_token, request.reason
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao terminar sessão"
            )
        
        return {"message": "Sessão terminada com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao terminar sessão: {str(e)}"
        )

@router.post("/terminate-all")
async def terminate_all_sessions(
    request: Request,
    reason: str = "user_request",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Termina todas as sessões do usuário, exceto a atual.
    
    Args:
        reason: Motivo da terminação
        
    Returns:
        Número de sessões terminadas
    """
    try:
        # Obter token da sessão atual
        current_token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            current_token = auth_header[7:]
        
        # Buscar sessões ativas do usuário
        active_sessions = session_manager.get_active_sessions(db, current_user.id)
        
        terminated_count = 0
        for session in active_sessions:
            # Não terminar a sessão atual
            if session.session_token != current_token:
                success = session_manager.terminate_session(
                    db, session.session_token, reason
                )
                if success:
                    terminated_count += 1
        
        return {
            "message": f"{terminated_count} sessões terminadas com sucesso",
            "terminated_count": terminated_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao terminar sessões: {str(e)}"
        )

@router.post("/block")
async def block_session(
    request: BlockSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Bloqueia uma sessão específica por motivos de segurança.
    
    Args:
        request: Dados da requisição com ID da sessão e motivo
        
    Returns:
        Confirmação do bloqueio
    """
    try:
        # Verificar se a sessão pertence ao usuário
        session = db.query(UserSession).filter(
            UserSession.id == request.session_id,
            UserSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sessão não encontrada"
            )
        
        if session.is_blocked:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sessão já está bloqueada"
            )
        
        # Bloquear sessão
        success = session_manager.block_session(
            db, session.session_token, request.reason
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao bloquear sessão"
            )
        
        return {"message": "Sessão bloqueada com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao bloquear sessão: {str(e)}"
        )

@router.get("/current", response_model=SessionInfo)
async def get_current_session(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna informações da sessão atual.
    
    Returns:
        Informações da sessão atual
    """
    try:
        # Obter token da sessão atual
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de autorização não encontrado"
            )
        
        current_token = auth_header[7:]
        
        # Buscar sessão atual
        session = db.query(UserSession).filter(
            UserSession.session_token == current_token,
            UserSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sessão atual não encontrada"
            )
        
        return SessionInfo.from_session(session, current_token)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar sessão atual: {str(e)}"
        )

@router.post("/cleanup")
async def cleanup_expired_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove sessões expiradas (apenas para administradores).
    
    Returns:
        Número de sessões removidas
    """
    try:
        # Verificar se o usuário é administrador
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: apenas administradores podem executar limpeza"
            )
        
        # Executar limpeza
        cleaned_count = session_manager.cleanup_expired_sessions(db)
        
        return {
            "message": f"Limpeza concluída: {cleaned_count} sessões expiradas removidas",
            "cleaned_count": cleaned_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro na limpeza de sessões: {str(e)}"
        )