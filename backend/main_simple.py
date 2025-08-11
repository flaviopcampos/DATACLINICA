from fastapi import FastAPI

app = FastAPI(title="Teste Simples")

@app.get("/")
def read_root():
    return {"message": "Bem-vindo!"}

@app.get("/test-simple")
def test_simple():
    return {"message": "API funcionando!", "status": "ok"}