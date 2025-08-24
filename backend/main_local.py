from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional

# Middleware de Segurança
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Headers de segurança
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        
        return response

# Importações locais - usando versão local
from database_local import SessionLocal, engine
from models_simple import Base, User, Clinic
from schemas import Token, UserResponse

# Rate Limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Configuração do rate limiter
limiter = Limiter(key_func=get_remote_address)

# Configurações
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuração de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DataClínica API Local", version="1.0.0")

# Configura rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Adiciona middleware de rate limiting
app.add_middleware(SlowAPIMiddleware)

# Adiciona middleware de segurança
app.add_middleware(SecurityHeadersMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependência do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Funções de autenticação
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
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
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, email=email)
    if user is None:
        raise credentials_exception
    return user

# Função para inicializar dados
def init_data():
    db = SessionLocal()
    try:
        # Criar clínica se não existir
        clinic = db.query(Clinic).first()
        if not clinic:
            clinic = Clinic(
                name="DataClínica - Principal",
                cnpj="00.000.000/0001-00",
                email="contato@dataclinica.com.br"
            )
            db.add(clinic)
            db.flush()
        
        # Criar usuário admin se não existir
        admin_user = db.query(User).filter(User.email == 'admin@dataclinica.com.br').first()
        if not admin_user:
            hashed_password = get_password_hash("Admin123!")
            admin_user = User(
                username="admin",
                email="admin@dataclinica.com.br",
                hashed_password=hashed_password,
                full_name="Administrador DataClínica",
                role="admin",
                clinic_id=clinic.id,
                is_active=True
            )
            db.add(admin_user)
        
        db.commit()
        print("✅ Dados iniciais criados com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao inicializar dados: {e}")
        db.rollback()
    finally:
        db.close()

# Inicializar dados na inicialização
init_data()

# Endpoints
@limiter.limit("5/minute")
@app.post("/token", response_model=Token)
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@limiter.limit("30/minute")
@app.get("/users/me", response_model=UserResponse)
async def read_users_me(request: Request, current_user: User = Depends(get_current_user)):
    return current_user

@limiter.limit("10/minute")
@app.get("/")
async def root(request: Request):
    return {"message": "DataClínica API Local - Funcionando!"}

@limiter.limit("100/minute")
@app.get("/health")
async def health_check(request: Request):
    return {"status": "ok", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)