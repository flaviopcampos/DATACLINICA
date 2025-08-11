#!/usr/bin/env python3
"""
DataClínica - Sistema de Controle de Sessões Avançado

Este módulo implementa controle avançado de sessões com recursos como:
- Limite de sessões simultâneas por usuário
- Detecção de sessões suspeitas
- Expiração automática de sessões inativas
- Bloqueio de sessões por localização/dispositivo
- Auditoria de sessões
"""

import os
import json
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
import redis
import logging
from user_agents import parse
import geoip2.database
import geoip2.errors

from database import Base, get_db
from models import User

# Configurar logging
logger = logging.getLogger(__name__)

class UserSession(Base):
    """Modelo para armazenar sessões de usuário"""
    
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_token = Column(String(255), unique=True, index=True, nullable=False)
    refresh_token = Column(String(255), unique=True, index=True)
    
    # Informações da sessão
    ip_address = Column(String(45))  # IPv6 support
    user_agent = Column(Text)
    device_fingerprint = Column(String(255))
    
    # Informações geográficas
    country = Column(String(100))
    city = Column(String(100))
    region = Column(String(100))
    
    # Informações do dispositivo
    device_type = Column(String(50))  # desktop, mobile, tablet
    browser = Column(String(100))
    os = Column(String(100))
    
    # Status da sessão
    is_active = Column(Boolean, default=True)
    is_suspicious = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    terminated_at = Column(DateTime)
    
    # Metadados
    login_method = Column(String(50))  # password, 2fa, sso
    session_metadata = Column(JSON)
    
    # Relacionamentos
    user = relationship("User")
    activities = relationship("SessionActivity", back_populates="session")
    
    def __repr__(self):
        return f"<UserSession(user_id={self.user_id}, ip={self.ip_address}, active={self.is_active})>"
    
    @property
    def is_expired(self) -> bool:
        """Verifica se a sessão está expirada"""
        return self.expires_at and datetime.utcnow() > self.expires_at
    
    @property
    def time_since_last_activity(self) -> timedelta:
        """Retorna tempo desde a última atividade"""
        return datetime.utcnow() - self.last_activity

class SessionActivity(Base):
    """Modelo para registrar atividades da sessão"""
    
    __tablename__ = "session_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("user_sessions.id"), nullable=False)
    
    # Detalhes da atividade
    activity_type = Column(String(100), nullable=False)  # login, logout, api_call, page_view
    endpoint = Column(String(255))
    method = Column(String(10))  # GET, POST, PUT, DELETE
    status_code = Column(Integer)
    
    # Informações de contexto
    ip_address = Column(String(45))
    user_agent = Column(Text)
    referer = Column(String(500))
    
    # Metadados
    request_data = Column(JSON)  # Dados da requisição (sem informações sensíveis)
    response_time_ms = Column(Integer)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    session = relationship("UserSession", back_populates="activities")
    
    def __repr__(self):
        return f"<SessionActivity(session_id={self.session_id}, type={self.activity_type})>"

class SessionManager:
    """Gerenciador de sessões avançado"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client or self._get_redis_client()
        self.max_sessions_per_user = int(os.getenv("MAX_SESSIONS_PER_USER", "5"))
        self.session_timeout_minutes = int(os.getenv("SESSION_TIMEOUT_MINUTES", "480"))  # 8 horas
        self.inactive_timeout_minutes = int(os.getenv("INACTIVE_TIMEOUT_MINUTES", "60"))  # 1 hora
        self.geoip_db_path = os.getenv("GEOIP_DB_PATH", "GeoLite2-City.mmdb")
        
        # Carregar banco de dados GeoIP se disponível
        self.geoip_reader = None
        try:
            if os.path.exists(self.geoip_db_path):
                self.geoip_reader = geoip2.database.Reader(self.geoip_db_path)
        except Exception as e:
            logger.warning(f"Não foi possível carregar banco GeoIP: {e}")
    
    def _get_redis_client(self):
        """Obtém cliente Redis"""
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
            return redis.from_url(redis_url, decode_responses=True)
        except Exception as e:
            logger.warning(f"Redis não disponível: {e}")
            return None
    
    def create_session(
        self, 
        db: Session, 
        user_id: int, 
        ip_address: str, 
        user_agent: str,
        login_method: str = "password"
    ) -> Dict[str, Any]:
        """
        Cria uma nova sessão para o usuário.
        
        Args:
            db: Sessão do banco de dados
            user_id: ID do usuário
            ip_address: Endereço IP do cliente
            user_agent: User-Agent do navegador
            login_method: Método de login usado
            
        Returns:
            Dicionário com informações da sessão criada
        """
        try:
            # Verificar limite de sessões
            active_sessions = self.get_active_sessions(db, user_id)
            if len(active_sessions) >= self.max_sessions_per_user:
                # Terminar sessão mais antiga
                oldest_session = min(active_sessions, key=lambda s: s.last_activity)
                self.terminate_session(db, oldest_session.session_token, "max_sessions_exceeded")
            
            # Gerar tokens
            session_token = self._generate_session_token()
            refresh_token = self._generate_refresh_token()
            
            # Analisar User-Agent
            ua = parse(user_agent)
            device_fingerprint = self._generate_device_fingerprint(ip_address, user_agent)
            
            # Obter informações geográficas
            geo_info = self._get_geo_info(ip_address)
            
            # Detectar sessão suspeita
            is_suspicious = self._detect_suspicious_session(db, user_id, ip_address, device_fingerprint)
            
            # Criar sessão
            session = UserSession(
                user_id=user_id,
                session_token=session_token,
                refresh_token=refresh_token,
                ip_address=ip_address,
                user_agent=user_agent,
                device_fingerprint=device_fingerprint,
                country=geo_info.get("country"),
                city=geo_info.get("city"),
                region=geo_info.get("region"),
                device_type=ua.device.family.lower() if ua.device.family else "unknown",
                browser=f"{ua.browser.family} {ua.browser.version_string}",
                os=f"{ua.os.family} {ua.os.version_string}",
                is_suspicious=is_suspicious,
                login_method=login_method,
                expires_at=datetime.utcnow() + timedelta(minutes=self.session_timeout_minutes),
                session_metadata={
                    "created_from": "web",
                    "security_level": "high" if login_method == "2fa" else "medium"
                }
            )
            
            db.add(session)
            db.commit()
            db.refresh(session)
            
            # Registrar atividade
            self._log_session_activity(
                db, session.id, "login", 
                ip_address=ip_address, user_agent=user_agent
            )
            
            # Armazenar no Redis para acesso rápido
            if self.redis_client:
                self._cache_session(session)
            
            logger.info(f"Sessão criada para usuário {user_id}: {session_token[:8]}...")
            
            return {
                "session_token": session_token,
                "refresh_token": refresh_token,
                "expires_at": session.expires_at.isoformat(),
                "is_suspicious": is_suspicious,
                "device_info": {
                    "device_type": session.device_type,
                    "browser": session.browser,
                    "os": session.os,
                    "location": f"{session.city}, {session.country}" if session.city else session.country
                }
            }
            
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao criar sessão: {e}")
            raise
    
    def validate_session(self, db: Session, session_token: str) -> Optional[UserSession]:
        """
        Valida uma sessão e retorna informações do usuário.
        
        Args:
            db: Sessão do banco de dados
            session_token: Token da sessão
            
        Returns:
            Objeto UserSession se válida, None caso contrário
        """
        try:
            # Tentar buscar no cache primeiro
            if self.redis_client:
                cached_session = self._get_cached_session(session_token)
                if cached_session:
                    return cached_session
            
            # Buscar no banco de dados
            session = db.query(UserSession).filter(
                UserSession.session_token == session_token,
                UserSession.is_active == True,
                UserSession.is_blocked == False
            ).first()
            
            if not session:
                return None
            
            # Verificar expiração
            if session.is_expired:
                self.terminate_session(db, session_token, "expired")
                return None
            
            # Verificar inatividade
            if session.time_since_last_activity.total_seconds() > (self.inactive_timeout_minutes * 60):
                self.terminate_session(db, session_token, "inactive")
                return None
            
            # Atualizar última atividade
            session.last_activity = datetime.utcnow()
            db.commit()
            
            # Atualizar cache
            if self.redis_client:
                self._cache_session(session)
            
            return session
            
        except Exception as e:
            logger.error(f"Erro ao validar sessão: {e}")
            return None
    
    def terminate_session(self, db: Session, session_token: str, reason: str = "manual") -> bool:
        """
        Termina uma sessão.
        
        Args:
            db: Sessão do banco de dados
            session_token: Token da sessão
            reason: Motivo da terminação
            
        Returns:
            True se a sessão foi terminada com sucesso
        """
        try:
            session = db.query(UserSession).filter(
                UserSession.session_token == session_token
            ).first()
            
            if not session:
                return False
            
            # Marcar como inativa
            session.is_active = False
            session.terminated_at = datetime.utcnow()
            
            # Registrar atividade
            self._log_session_activity(
                db, session.id, "logout",
                request_data={"reason": reason}
            )
            
            db.commit()
            
            # Remover do cache
            if self.redis_client:
                self._remove_cached_session(session_token)
            
            logger.info(f"Sessão terminada: {session_token[:8]}... (motivo: {reason})")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao terminar sessão: {e}")
            return False
    
    def get_active_sessions(self, db: Session, user_id: int) -> List[UserSession]:
        """
        Retorna todas as sessões ativas de um usuário.
        
        Args:
            db: Sessão do banco de dados
            user_id: ID do usuário
            
        Returns:
            Lista de sessões ativas
        """
        return db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_active == True,
            UserSession.is_blocked == False
        ).order_by(UserSession.last_activity.desc()).all()
    
    def block_session(self, db: Session, session_token: str, reason: str = "security") -> bool:
        """
        Bloqueia uma sessão por motivos de segurança.
        
        Args:
            db: Sessão do banco de dados
            session_token: Token da sessão
            reason: Motivo do bloqueio
            
        Returns:
            True se a sessão foi bloqueada com sucesso
        """
        try:
            session = db.query(UserSession).filter(
                UserSession.session_token == session_token
            ).first()
            
            if not session:
                return False
            
            session.is_blocked = True
            session.is_active = False
            
            # Registrar atividade
            self._log_session_activity(
                db, session.id, "blocked",
                request_data={"reason": reason}
            )
            
            db.commit()
            
            # Remover do cache
            if self.redis_client:
                self._remove_cached_session(session_token)
            
            logger.warning(f"Sessão bloqueada: {session_token[:8]}... (motivo: {reason})")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao bloquear sessão: {e}")
            return False
    
    def cleanup_expired_sessions(self, db: Session) -> int:
        """
        Remove sessões expiradas do banco de dados.
        
        Args:
            db: Sessão do banco de dados
            
        Returns:
            Número de sessões removidas
        """
        try:
            expired_sessions = db.query(UserSession).filter(
                UserSession.expires_at < datetime.utcnow()
            ).all()
            
            count = 0
            for session in expired_sessions:
                if session.is_active:
                    self.terminate_session(db, session.session_token, "expired")
                    count += 1
            
            logger.info(f"Limpeza de sessões: {count} sessões expiradas removidas")
            return count
            
        except Exception as e:
            logger.error(f"Erro na limpeza de sessões: {e}")
            return 0
    
    def _generate_session_token(self) -> str:
        """Gera um token de sessão seguro"""
        return secrets.token_urlsafe(32)
    
    def _generate_refresh_token(self) -> str:
        """Gera um token de refresh seguro"""
        return secrets.token_urlsafe(32)
    
    def _generate_device_fingerprint(self, ip_address: str, user_agent: str) -> str:
        """Gera uma impressão digital do dispositivo"""
        fingerprint_data = f"{ip_address}:{user_agent}"
        return hashlib.sha256(fingerprint_data.encode()).hexdigest()[:32]
    
    def _get_geo_info(self, ip_address: str) -> Dict[str, str]:
        """Obtém informações geográficas do IP"""
        if not self.geoip_reader:
            return {}
        
        try:
            response = self.geoip_reader.city(ip_address)
            return {
                "country": response.country.name,
                "city": response.city.name,
                "region": response.subdivisions.most_specific.name
            }
        except geoip2.errors.AddressNotFoundError:
            return {}
        except Exception as e:
            logger.warning(f"Erro ao obter informações geográficas: {e}")
            return {}
    
    def _detect_suspicious_session(
        self, 
        db: Session, 
        user_id: int, 
        ip_address: str, 
        device_fingerprint: str
    ) -> bool:
        """
        Detecta se uma sessão é suspeita baseada em padrões históricos.
        
        Args:
            db: Sessão do banco de dados
            user_id: ID do usuário
            ip_address: Endereço IP
            device_fingerprint: Impressão digital do dispositivo
            
        Returns:
            True se a sessão for considerada suspeita
        """
        try:
            # Buscar sessões recentes do usuário
            recent_sessions = db.query(UserSession).filter(
                UserSession.user_id == user_id,
                UserSession.created_at > datetime.utcnow() - timedelta(days=30)
            ).all()
            
            if not recent_sessions:
                return False  # Primeiro login não é suspeito
            
            # Verificar IP conhecido
            known_ips = {session.ip_address for session in recent_sessions}
            if ip_address not in known_ips:
                # IP desconhecido - verificar localização
                geo_info = self._get_geo_info(ip_address)
                if geo_info:
                    known_countries = {session.country for session in recent_sessions if session.country}
                    if geo_info.get("country") not in known_countries:
                        return True  # País diferente
            
            # Verificar dispositivo conhecido
            known_devices = {session.device_fingerprint for session in recent_sessions}
            if device_fingerprint not in known_devices:
                return True  # Dispositivo desconhecido
            
            return False
            
        except Exception as e:
            logger.error(f"Erro na detecção de sessão suspeita: {e}")
            return False
    
    def _log_session_activity(
        self, 
        db: Session, 
        session_id: int, 
        activity_type: str,
        endpoint: str = None,
        method: str = None,
        status_code: int = None,
        ip_address: str = None,
        user_agent: str = None,
        request_data: Dict = None
    ):
        """Registra atividade da sessão"""
        try:
            activity = SessionActivity(
                session_id=session_id,
                activity_type=activity_type,
                endpoint=endpoint,
                method=method,
                status_code=status_code,
                ip_address=ip_address,
                user_agent=user_agent,
                request_data=request_data or {}
            )
            
            db.add(activity)
            db.commit()
            
        except Exception as e:
            logger.error(f"Erro ao registrar atividade da sessão: {e}")
    
    def _cache_session(self, session: UserSession):
        """Armazena sessão no cache Redis"""
        if not self.redis_client:
            return
        
        try:
            session_data = {
                "id": session.id,
                "user_id": session.user_id,
                "ip_address": session.ip_address,
                "is_active": session.is_active,
                "is_blocked": session.is_blocked,
                "expires_at": session.expires_at.isoformat() if session.expires_at else None,
                "last_activity": session.last_activity.isoformat()
            }
            
            self.redis_client.setex(
                f"session:{session.session_token}",
                self.session_timeout_minutes * 60,
                json.dumps(session_data)
            )
            
        except Exception as e:
            logger.error(f"Erro ao armazenar sessão no cache: {e}")
    
    def _get_cached_session(self, session_token: str) -> Optional[Dict]:
        """Recupera sessão do cache Redis"""
        if not self.redis_client:
            return None
        
        try:
            cached_data = self.redis_client.get(f"session:{session_token}")
            if cached_data:
                return json.loads(cached_data)
            return None
            
        except Exception as e:
            logger.error(f"Erro ao recuperar sessão do cache: {e}")
            return None
    
    def _remove_cached_session(self, session_token: str):
        """Remove sessão do cache Redis"""
        if not self.redis_client:
            return
        
        try:
            self.redis_client.delete(f"session:{session_token}")
        except Exception as e:
            logger.error(f"Erro ao remover sessão do cache: {e}")

# Instância global
session_manager = SessionManager()