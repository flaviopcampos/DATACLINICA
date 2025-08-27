#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar autenticação HTTP
"""

import requests
import json

def test_authentication():
    """Testa autenticação via HTTP"""
    try:
        url = "http://localhost:8000/token"
        
        # Dados do formulário
        data = {
            "username": "admin@dataclinica.com",
            "password": "admin123"
        }
        
        # Headers
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        print(f"Testando autenticação em: {url}")
        print(f"Dados: {data}")
        
        # Faz a requisição
        response = requests.post(url, data=data, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Autenticação bem-sucedida!")
            print(f"Token: {result.get('access_token', 'N/A')[:50]}...")
            print(f"User ID: {result.get('user_id', 'N/A')}")
            print(f"User Name: {result.get('user_name', 'N/A')}")
            print(f"Clinic: {result.get('clinic_name', 'N/A')}")
            return result.get('access_token')
        else:
            print("❌ Falha na autenticação")
            print(f"Erro: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão - servidor não está rodando?")
        return None
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return None

def test_protected_endpoint(token):
    """Testa endpoint protegido"""
    if not token:
        print("Sem token para testar endpoint protegido")
        return
        
    try:
        url = "http://localhost:8000/users/me"
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        print(f"\nTestando endpoint protegido: {url}")
        response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Acesso ao endpoint protegido bem-sucedido!")
            print(f"User: {result}")
        else:
            print("❌ Falha no acesso ao endpoint protegido")
            print(f"Erro: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro no teste do endpoint protegido: {e}")

if __name__ == "__main__":
    print("=== Teste de Autenticação ===\n")
    token = test_authentication()
    test_protected_endpoint(token)