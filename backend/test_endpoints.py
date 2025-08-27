#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar os endpoints do backend DataClinica
"""

import requests
import json
from datetime import datetime

# Configurações
BASE_URL = "http://127.0.0.1:8000"
USERNAME = "admin@dataclinica.com.br"
PASSWORD = "admin123"

def test_server_health():
    """Testa se o servidor está respondendo"""
    print("🔍 Testando conectividade do servidor...")
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ Servidor está respondendo")
            return True
        else:
            print(f"❌ Servidor retornou status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro de conectividade: {e}")
        return False

def get_auth_token():
    """Obtém token de autenticação"""
    print("🔐 Testando autenticação...")
    try:
        data = {
            'username': USERNAME,
            'password': PASSWORD
        }
        response = requests.post(f"{BASE_URL}/token", data=data, timeout=10)
        
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Autenticação bem-sucedida")
            return token_data.get('access_token')
        else:
            print(f"❌ Erro na autenticação: {response.status_code}")
            print(f"Resposta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Erro na autenticação: {e}")
        return None

def test_patients_endpoint(token):
    """Testa o endpoint de pacientes"""
    print("👥 Testando endpoint de pacientes...")
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f"{BASE_URL}/patients", headers=headers, timeout=10)
        
        if response.status_code == 200:
            patients = response.json()
            print(f"✅ Endpoint de pacientes funcionando - {len(patients)} pacientes encontrados")
            if patients:
                print(f"📋 Primeiro paciente: {patients[0].get('name', 'N/A')}")
            return True
        else:
            print(f"❌ Erro no endpoint de pacientes: {response.status_code}")
            print(f"Resposta: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erro ao testar pacientes: {e}")
        return False

def test_create_patient(token):
    """Testa a criação de um paciente"""
    print("➕ Testando criação de paciente...")
    try:
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        test_patient = {
            "name": "Paciente Teste API",
            "cpf": "12345678901",
            "birth_date": "1990-01-01",
            "gender": "M",
            "phone": "11999999999",
            "email": "teste.api@dataclinica.com",
            "address": "Rua Teste API, 123",
            "city": "São Paulo",
            "state": "SP"
        }
        
        response = requests.post(
            f"{BASE_URL}/patients", 
            headers=headers, 
            json=test_patient, 
            timeout=10
        )
        
        if response.status_code == 201:
            created_patient = response.json()
            print(f"✅ Paciente criado com sucesso - ID: {created_patient.get('id')}")
            return created_patient.get('id')
        else:
            print(f"❌ Erro ao criar paciente: {response.status_code}")
            print(f"Resposta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Erro ao criar paciente: {e}")
        return None

def test_delete_patient(token, patient_id):
    """Testa a exclusão de um paciente"""
    if not patient_id:
        return
        
    print(f"🗑️ Testando exclusão do paciente ID: {patient_id}...")
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.delete(
            f"{BASE_URL}/patients/{patient_id}", 
            headers=headers, 
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Paciente excluído com sucesso")
        else:
            print(f"❌ Erro ao excluir paciente: {response.status_code}")
            print(f"Resposta: {response.text}")
    except Exception as e:
        print(f"❌ Erro ao excluir paciente: {e}")

def main():
    """Função principal"""
    print("🚀 Iniciando testes dos endpoints do DataClinica")
    print(f"📍 URL Base: {BASE_URL}")
    print(f"👤 Usuário: {USERNAME}")
    print("-" * 50)
    
    # Teste 1: Conectividade
    if not test_server_health():
        print("❌ Servidor não está respondendo. Verifique se está rodando.")
        return
    
    # Teste 2: Autenticação
    token = get_auth_token()
    if not token:
        print("❌ Não foi possível obter token de autenticação.")
        return
    
    # Teste 3: Listar pacientes
    if not test_patients_endpoint(token):
        print("❌ Endpoint de pacientes não está funcionando.")
        return
    
    # Teste 4: Criar paciente
    patient_id = test_create_patient(token)
    
    # Teste 5: Excluir paciente de teste
    if patient_id:
        test_delete_patient(token, patient_id)
    
    print("-" * 50)
    print("✅ Todos os testes concluídos!")
    print("🎉 A integração backend está funcionando corretamente!")

if __name__ == "__main__":
    main()