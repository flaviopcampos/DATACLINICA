from fastapi import FastAPI

app = FastAPI(title="Debug Server")

@app.get("/")
def root():
    return {"message": "Debug server funcionando"}

@app.get("/test-simple")
def test_simple():
    return {"message": "Endpoint test-simple funcionando!"}

@app.get("/debug")
def debug():
    return {"message": "Debug endpoint funcionando!"}