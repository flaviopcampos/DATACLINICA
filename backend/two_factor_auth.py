#!/usr/bin/env python3
"""
DataClínica - Sistema de Autenticação Multifator (2FA)

Este módulo implementa autenticação de dois fatores usando TOTP (Time-based One-Time Password)
compatível com aplicativos como Google Authenticator, Authy, etc.
"""

import pyotp
import qrcode
import io
import base64
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import logging

from models import User, TwoFactorAuth
from database import get_db

# Configurar logging
logger = logging.getLogger(__name__)

class TwoFactorAuthManager:
    """Gerenciador de autenticação de dois fatores"""
    
    def __init__(self):
        self.issuer_name = "DataClínica"
        self.backup_codes_count = 10
    
    def generate_secret(self) -> str:
        """Gera uma chave secreta para TOTP"""
        return pyotp.random_base32()
    
    def generate_qr_code(self, user_email: str, secret: str) -> str:
        """Gera QR code para configuração do 2FA"""
        try:
            # Criar URI TOTP
            totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
                name=user_email,
                issuer_name=self.issuer_name
            )
            
            # Gerar QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(totp_uri)
            qr.make(fit=True)
            
            # Converter para imagem
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Converter para base64
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
            return f"data:image/png;base64,{qr_code_base64}"
            
        except Exception as e:
            logger.error(f"Erro ao gerar QR code: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao gerar QR code"
            )
    
    def verify_token(self, secret: str, token: str) -> bool:
        """Verifica se o token TOTP é válido"""
        try:
            totp = pyotp.TOTP(secret)
            return totp.verify(token, valid_window=1)  # Permite 30s de tolerância
        except Exception as e:
            logger.error(f"Erro ao verificar token: {e}")
            return False
    
    def generate_backup_codes(self) -> list[str]:
        """Gera códigos de backup para recuperação"""
        import secrets
        import string
        
        codes = []
        for _ in range(self.backup_codes_count):
            # Gerar código de 8 caracteres
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) 
                          for _ in range(8))
            # Formatar como XXXX-XXXX
            formatted_code = f"{code[:4]}-{code[4:]}"
            codes.append(formatted_code)
        
        return codes
    
    def setup_2fa(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Configura 2FA para um usuário"""
        try:
            # Verificar se usuário existe
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuário não encontrado"
                )
            
            # Verificar se já tem 2FA configurado
            existing_2fa = db.query(TwoFactorAuth).filter(
                TwoFactorAuth.user_id == user_id
            ).first()
            
            if existing_2fa and existing_2fa.is_enabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="2FA já está habilitado para este usuário"
                )
            
            # Gerar nova chave secreta
            secret = self.generate_secret()
            
            # Gerar códigos de backup
            backup_codes = self.generate_backup_codes()
            
            # Gerar QR code
            qr_code = self.generate_qr_code(user.email, secret)
            
            # Salvar ou atualizar configuração 2FA
            if existing_2fa:
                existing_2fa.secret_key = secret
                existing_2fa.backup_codes = backup_codes
                existing_2fa.is_enabled = False  # Será habilitado após verificação
                existing_2fa.created_at = datetime.utcnow()
                two_factor_auth = existing_2fa
            else:
                two_factor_auth = TwoFactorAuth(
                    user_id=user_id,
                    secret_key=secret,
                    backup_codes=backup_codes,
                    is_enabled=False,
                    created_at=datetime.utcnow()
                )
                db.add(two_factor_auth)
            
            db.commit()
            
            return {
                "qr_code": qr_code,
                "backup_codes": backup_codes,
                "secret": secret  # Para testes, remover em produção
            }
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao configurar 2FA: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno ao configurar 2FA"
            )
    
    def verify_and_enable_2fa(self, db: Session, user_id: int, token: str) -> bool:
        """Verifica token e habilita 2FA"""
        try:
            # Buscar configuração 2FA
            two_factor_auth = db.query(TwoFactorAuth).filter(
                TwoFactorAuth.user_id == user_id
            ).first()
            
            if not two_factor_auth:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Configuração 2FA não encontrada"
                )
            
            # Verificar token
            if not self.verify_token(two_factor_auth.secret_key, token):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Token inválido"
                )
            
            # Habilitar 2FA
            two_factor_auth.is_enabled = True
            two_factor_auth.verified_at = datetime.utcnow()
            
            db.commit()
            
            logger.info(f"2FA habilitado para usuário {user_id}")
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao verificar e habilitar 2FA: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno ao habilitar 2FA"
            )
    
    def verify_2fa_login(self, db: Session, user_id: int, token: str) -> bool:
        """Verifica token 2FA durante login"""
        try:
            # Buscar configuração 2FA
            two_factor_auth = db.query(TwoFactorAuth).filter(
                TwoFactorAuth.user_id == user_id,
                TwoFactorAuth.is_enabled == True
            ).first()
            
            if not two_factor_auth:
                return False
            
            # Verificar se é um código de backup
            if token in two_factor_auth.backup_codes:
                # Remover código de backup usado
                backup_codes = two_factor_auth.backup_codes.copy()
                backup_codes.remove(token)
                two_factor_auth.backup_codes = backup_codes
                two_factor_auth.last_used_at = datetime.utcnow()
                
                db.commit()
                
                logger.info(f"Código de backup usado para usuário {user_id}")
                return True
            
            # Verificar token TOTP
            if self.verify_token(two_factor_auth.secret_key, token):
                two_factor_auth.last_used_at = datetime.utcnow()
                db.commit()
                
                logger.info(f"Token 2FA verificado para usuário {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Erro ao verificar 2FA no login: {e}")
            return False
    
    def disable_2fa(self, db: Session, user_id: int, password: str) -> bool:
        """Desabilita 2FA para um usuário"""
        try:
            from auth import verify_password
            
            # Verificar usuário e senha
            user = db.query(User).filter(User.id == user_id).first()
            if not user or not verify_password(password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciais inválidas"
                )
            
            # Buscar e desabilitar 2FA
            two_factor_auth = db.query(TwoFactorAuth).filter(
                TwoFactorAuth.user_id == user_id
            ).first()
            
            if not two_factor_auth:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="2FA não configurado"
                )
            
            # Desabilitar 2FA
            two_factor_auth.is_enabled = False
            two_factor_auth.disabled_at = datetime.utcnow()
            
            db.commit()
            
            logger.info(f"2FA desabilitado para usuário {user_id}")
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao desabilitar 2FA: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno ao desabilitar 2FA"
            )
    
    def get_2fa_status(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Retorna status do 2FA para um usuário"""
        try:
            two_factor_auth = db.query(TwoFactorAuth).filter(
                TwoFactorAuth.user_id == user_id
            ).first()
            
            if not two_factor_auth:
                return {
                    "enabled": False,
                    "configured": False,
                    "backup_codes_remaining": 0
                }
            
            return {
                "enabled": two_factor_auth.is_enabled,
                "configured": True,
                "backup_codes_remaining": len(two_factor_auth.backup_codes),
                "last_used": two_factor_auth.last_used_at,
                "created_at": two_factor_auth.created_at
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter status 2FA: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno ao obter status 2FA"
            )

# Instância global
two_factor_manager = TwoFactorAuthManager()