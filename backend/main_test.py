from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Sistema Clínico Profissional - Teste",
    description="Versão de teste para diagnóstico",
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

@app.get("/")
async def read_root():
    return {"message": "Bem-vindo ao Sistema Clínico Profissional!"}

@app.get("/test-simple")
def test_simple():
    return {"message": "API funcionando!", "status": "ok", "timestamp": "2024-01-01"}

@app.get("/test-db/")
async def test_db_connection():
    import psycopg2
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    
    try:
        # Testa a conexão diretamente com psycopg2
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        cursor.execute("SELECT version()")
        version = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return {"message": "Conexão com o banco de dados PostgreSQL bem-sucedida!", "version": version}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro de conexão com o banco de dados: {e}")