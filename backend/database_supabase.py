"""Configuração de conexão com Supabase"""

import os
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

# Carregar variáveis de ambiente
load_dotenv('.env.supabase')

logger = logging.getLogger(__name__)

class SupabaseClient:
    """Cliente Supabase para operações de banco de dados"""
    
    def __init__(self):
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidos")
        
        self.client: Client = create_client(self.url, self.key)
        logger.info("Cliente Supabase inicializado com sucesso")
    
    def get_client(self) -> Client:
        """Retorna o cliente Supabase"""
        return self.client
    
    async def test_connection(self) -> bool:
        """Testa a conexão com o Supabase"""
        try:
            # Tenta fazer uma consulta simples
            result = self.client.table('clinics').select('id').limit(1).execute()
            logger.info("Conexão com Supabase testada com sucesso")
            return True
        except Exception as e:
            logger.error(f"Erro ao testar conexão com Supabase: {e}")
            return False
    
    # Métodos auxiliares para operações comuns
    def insert(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Insere dados em uma tabela"""
        try:
            result = self.client.table(table).insert(data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Erro ao inserir em {table}: {e}")
            raise
    
    def select(self, table: str, columns: str = '*', filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Seleciona dados de uma tabela"""
        try:
            query = self.client.table(table).select(columns)
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            result = query.execute()
            return result.data
        except Exception as e:
            logger.error(f"Erro ao selecionar de {table}: {e}")
            raise
    
    def update(self, table: str, data: Dict[str, Any], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Atualiza dados em uma tabela"""
        try:
            query = self.client.table(table).update(data)
            
            for key, value in filters.items():
                query = query.eq(key, value)
            
            result = query.execute()
            return result.data
        except Exception as e:
            logger.error(f"Erro ao atualizar {table}: {e}")
            raise
    
    def delete(self, table: str, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Deleta dados de uma tabela"""
        try:
            query = self.client.table(table)
            
            for key, value in filters.items():
                query = query.eq(key, value)
            
            result = query.delete().execute()
            return result.data
        except Exception as e:
            logger.error(f"Erro ao deletar de {table}: {e}")
            raise

# Instância global do cliente Supabase
supabase_client = None

def get_supabase_client() -> SupabaseClient:
    """Retorna a instância do cliente Supabase"""
    global supabase_client
    if supabase_client is None:
        supabase_client = SupabaseClient()
    return supabase_client

def get_supabase() -> Client:
    """Retorna o cliente Supabase direto"""
    return get_supabase_client().get_client()