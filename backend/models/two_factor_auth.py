#!/usr/bin/env python3
"""
DataClínica - Modelo de Autenticação Multifator (2FA)

Este módulo define o modelo de banco de dados para armazenar
informações de autenticação de dois fatores.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base

class TwoFactorAuth(Base):
    """Modelo para autenticação de dois fatores"""
    
    __tablename__ = "two_factor_auth"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Chave secreta para TOTP
    secret_key = Column(String(32), nullable=False)
    
    # Códigos de backup
    backup_codes = Column(JSON, default=list)
    
    # Status
    is_enabled = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    disabled_at = Column(DateTime, nullable=True)
    
    # Relacionamento com usuário
    user = relationship("User", back_populates="two_factor_auth")
    
    def __repr__(self):
        return f"<TwoFactorAuth(user_id={self.user_id}, enabled={self.is_enabled})>"
    
    @property
    def backup_codes_remaining(self) -> int:
        """Retorna quantidade de códigos de backup restantes"""
        return len(self.backup_codes) if self.backup_codes else 0
    
    @property
    def is_configured(self) -> bool:
        """Verifica se 2FA está configurado (mesmo que não habilitado)"""
        return bool(self.secret_key)