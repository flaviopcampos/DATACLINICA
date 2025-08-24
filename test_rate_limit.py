import requests
import time
import threading
from concurrent.futures import ThreadPoolExecutor

def make_request(i):
    """Faz uma requisição individual"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        return f"Request {i+1}: Status {response.status_code}", response.status_code
    except Exception as e:
        return f"Request {i+1}: Erro - {e}", "ERROR"

def test_rate_limiting():
    print("Testando Rate Limiting com 20 requisições simultâneas...")
    print("Limite configurado: 10/minute no endpoint /")
    
    # Teste com requisições simultâneas
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request, i) for i in range(20)]
        results = [future.result() for future in futures]
    
    # Processar resultados
    responses = []
    for message, status in results:
        print(message)
        responses.append(status)
    
    # Contar status codes
    status_200 = responses.count(200)
    status_429 = responses.count(429)
    errors = responses.count("ERROR")
    
    print(f"\nResultados:")
    print(f"Status 200 (OK): {status_200}")
    print(f"Status 429 (Rate Limited): {status_429}")
    print(f"Erros: {errors}")
    
    if status_429 > 0:
        print("✅ Rate Limiting está funcionando!")
    else:
        print("❌ Rate Limiting não está funcionando adequadamente")
        print("Possíveis causas:")
        print("- Middleware não está sendo aplicado")
        print("- Configuração do slowapi incorreta")
        print("- Rate limit muito alto para o teste")

if __name__ == "__main__":
    test_rate_limiting()