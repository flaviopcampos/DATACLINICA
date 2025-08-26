from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import crud, models, schemas
from database import get_db
from database_supabase import get_supabase_client
import logging

logger = logging.getLogger(__name__)

# Configurações de segurança
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str):
    # Tentar primeiro por username
    user = crud.get_user_by_username(db, username)
    # Se não encontrar, tentar por email
    if not user:
        user = crud.get_user_by_email(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def check_permission(required_roles: list):
    def role_checker(current_user: models.User = Depends(get_current_active_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# ===== FUNÇÕES SUPABASE AUTH =====

def authenticate_user_supabase(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Autentica usuário usando Supabase"""
    try:
        supabase_client = get_supabase_client()
        
        # Tentar primeiro por username
        users = supabase_client.select(
            'users', 
            '*', 
            {'username': username}
        )
        
        # Se não encontrar, tentar por email
        if not users:
            users = supabase_client.select(
                'users', 
                '*', 
                {'email': username}
            )
        
        if not users:
            logger.warning(f"Usuário não encontrado: {username}")
            return None
        
        user = users[0]
        
        # Verificar senha
        if not verify_password(password, user['hashed_password']):
            logger.warning(f"Senha incorreta para usuário: {username}")
            return None
        
        # Verificar se usuário está ativo
        if not user.get('is_active', True):
            logger.warning(f"Usuário inativo: {username}")
            return None
        
        logger.info(f"Usuário autenticado com sucesso: {username}")
        return user
        
    except Exception as e:
        logger.error(f"Erro na autenticação Supabase: {e}")
        return None

async def get_current_user_supabase(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Obtém o usuário atual usando Supabase"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    try:
        supabase_client = get_supabase_client()
        
        # Buscar usuário por username
        users = supabase_client.select(
            'users', 
            '*', 
            {'username': username}
        )
        
        if not users:
            raise credentials_exception
        
        user = users[0]
        logger.info(f"Usuário atual obtido: {username}")
        return user
        
    except Exception as e:
        logger.error(f"Erro ao obter usuário atual: {e}")
        raise credentials_exception

async def get_current_active_user_supabase(current_user: Dict[str, Any] = Depends(get_current_user_supabase)) -> Dict[str, Any]:
    """Obtém o usuário ativo atual usando Supabase"""
    if not current_user.get('is_active', True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def check_permission_supabase(required_roles: list):
    """Verifica permissões usando Supabase"""
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_active_user_supabase)):
        user_role = current_user.get('role')
        if user_role not in required_roles:
            logger.warning(f"Acesso negado. Usuário {current_user.get('username')} com role {user_role} tentou acessar recurso que requer roles: {required_roles}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

def get_user_clinic_id_supabase(user: Dict[str, Any]) -> Optional[int]:
    """Obtém o clinic_id do usuário para isolamento por clínica"""
    return user.get('clinic_id')

def ensure_clinic_access_supabase(user: Dict[str, Any], resource_clinic_id: int) -> bool:
    """Garante que o usuário tem acesso ao recurso da clínica"""
    user_clinic_id = get_user_clinic_id_supabase(user)
    
    # Super admin pode acessar qualquer clínica
    if user.get('role') == 'super_admin':
        return True
    
    # Usuários normais só podem acessar recursos da própria clínica
    if user_clinic_id != resource_clinic_id:
        logger.warning(f"Acesso negado. Usuário da clínica {user_clinic_id} tentou acessar recurso da clínica {resource_clinic_id}")
        return False
    
    return True