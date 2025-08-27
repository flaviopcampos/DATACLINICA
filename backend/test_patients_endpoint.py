import requests
import json

def test_patients_endpoint():
    # Primeiro, fazer login para obter o token
    login_data = {
        'username': 'admin@dataclinica.com.br',
        'password': 'admin123'
    }
    
    try:
        # Login
        print("Fazendo login...")
        login_response = requests.post('http://localhost:8000/token', data=login_data)
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            access_token = token_data['access_token']
            print(f"Login bem-sucedido! Token obtido.")
            
            # Testar endpoint de pacientes
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            print("\nTestando endpoint GET /patients...")
            patients_response = requests.get('http://localhost:8000/patients', headers=headers)
            
            print(f"Status Code: {patients_response.status_code}")
            
            if patients_response.status_code == 200:
                patients_data = patients_response.json()
                print(f"Número de pacientes encontrados: {len(patients_data)}")
                
                if patients_data:
                    print("\nPrimeiro paciente:")
                    print(json.dumps(patients_data[0], indent=2, ensure_ascii=False))
                else:
                    print("Nenhum paciente encontrado na base de dados.")
                    
                return True
            else:
                print(f"Erro ao buscar pacientes: {patients_response.text}")
                return False
                
        else:
            print(f"Erro no login: {login_response.status_code} - {login_response.text}")
            return False
            
    except Exception as e:
        print(f"Erro durante o teste: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_patients_endpoint()
    if success:
        print("\n✅ Teste do endpoint de pacientes concluído com sucesso!")
    else:
        print("\n❌ Teste do endpoint de pacientes falhou!")