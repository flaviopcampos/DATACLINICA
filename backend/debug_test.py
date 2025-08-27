import requests
import json
import time

def debug_test():
    base_url = 'http://127.0.0.1:8000'
    
    print("=== TESTE DE DEBUG ===")
    
    # Teste 1: Verificar se o servidor está respondendo
    print("\n1. Testando conectividade com o servidor...")
    try:
        response = requests.get(f'{base_url}/docs', timeout=5)
        print(f"   ✅ Servidor respondendo: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erro de conectividade: {e}")
        return False
    
    # Teste 2: Testar endpoint de token
    print("\n2. Testando endpoint de token...")
    login_data = {
        'username': 'admin@dataclinica.com.br',
        'password': 'admin123'
    }
    
    try:
        print(f"   Enviando dados: {login_data}")
        token_response = requests.post(f'{base_url}/token', data=login_data, timeout=10)
        print(f"   Status: {token_response.status_code}")
        print(f"   Response: {token_response.text[:200]}...")
        
        if token_response.status_code == 200:
            token_data = token_response.json()
            access_token = token_data['access_token']
            print(f"   ✅ Token obtido com sucesso")
        else:
            print(f"   ❌ Erro no token: {token_response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erro no token: {e}")
        return False
    
    # Teste 3: Testar endpoint de pacientes
    print("\n3. Testando endpoint de pacientes...")
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        print(f"   Headers: {headers}")
        patients_response = requests.get(f'{base_url}/patients', headers=headers, timeout=10)
        print(f"   Status: {patients_response.status_code}")
        print(f"   Response: {patients_response.text[:200]}...")
        
        if patients_response.status_code == 200:
            patients_data = patients_response.json()
            print(f"   ✅ Pacientes obtidos: {len(patients_data)} registros")
            return True
        else:
            print(f"   ❌ Erro nos pacientes: {patients_response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erro nos pacientes: {e}")
        return False

if __name__ == "__main__":
    success = debug_test()
    print(f"\n=== RESULTADO: {'SUCESSO' if success else 'FALHA'} ===")