from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Optional

# Importar módulos locais
try:
    import crud, models, schemas, auth
    from database import engine, get_db
    IMPORTS_OK = True
except Exception as e:
    print(f"Erro ao importar módulos: {e}")
    IMPORTS_OK = False

app = FastAPI(
    title="Sistema Clínico Profissional",
    description="ERP web para clínicas com prontuário eletrônico, faturamento TISS e gestão completa",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar todas as tabelas apenas se os imports funcionaram
if IMPORTS_OK:
    try:
        models.Base.metadata.create_all(bind=engine)
        print("Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"Erro ao criar tabelas: {e}")

@app.get("/")
async def read_root():
    return {"message": "Bem-vindo ao Sistema Clínico Profissional!"}

@app.get("/test-simple")
def test_simple():
    return {"message": "API funcionando!", "status": "ok", "imports_ok": IMPORTS_OK}

@app.get("/test-db/")
async def test_db_connection():
    if not IMPORTS_OK:
        raise HTTPException(status_code=500, detail="Módulos não carregados corretamente")
    
    try:
        from sqlalchemy import text
        db = next(get_db())
        result = db.execute(text('SELECT 1'))
        db.close()
        return {"message": "Conexão com o banco de dados bem-sucedida!", "result": result.scalar()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro de conexão com o banco de dados: {e}")

# Endpoints condicionais - só carregam se os imports funcionaram
if IMPORTS_OK:
    # Autenticação
    @app.post("/token", response_model=schemas.Token)
    async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
        user = auth.authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    @app.get("/users/me/", response_model=schemas.User)
    async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
        return current_user

    # Users endpoints
    @app.post("/users/", response_model=schemas.User)
    def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_permission(["admin"]))):
        db_user = crud.get_user_by_username(db, username=user.username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        return crud.create_user(db=db, user=user)

    @app.get("/users/", response_model=List[schemas.User])
    def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_permission(["admin"]))):
        users = crud.get_users(db, skip=skip, limit=limit)
        return users

    @app.get("/users/{user_id}", response_model=schemas.User)
    def read_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_permission(["admin"]))):
        db_user = crud.get_user(db, user_id=user_id)
        if db_user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return db_user
else:
    print("Módulos não carregados - endpoints avançados desabilitados")