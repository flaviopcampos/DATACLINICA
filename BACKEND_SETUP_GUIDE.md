# 📋 Guia Completo de Configuração do Backend - DataClínica

## 📑 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do Python](#instalação-do-python)
3. [Configuração do Ambiente Virtual](#configuração-do-ambiente-virtual)
4. [Instalação das Dependências](#instalação-das-dependências)
5. [Configuração do Supabase](#configuração-do-supabase)
6. [Configuração das Variáveis de Ambiente (.env)](#configuração-das-variáveis-de-ambiente-env)
7. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
8. [Configuração de Autenticação](#configuração-de-autenticação)
9. [Políticas RLS (Row Level Security)](#políticas-rls-row-level-security)
10. [Inicialização do Servidor](#inicialização-do-servidor)
11. [Testes da API](#testes-da-api)
12. [Troubleshooting](#troubleshooting)
13. [Comandos Úteis](#comandos-úteis)

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter:

- **Sistema Operacional**: Windows 10/11, macOS ou Linux
- **Conexão com Internet**: Para download de dependências
- **Editor de Código**: VS Code (recomendado) ou similar
- **Git**: Para controle de versão
- **Conta Supabase**: Gratuita em [supabase.com](https://supabase.com)

---

## 🐍 Instalação do Python

### Windows

1. **Download do Python**:
   - Acesse [python.org](https://www.python.org/downloads/)
   - Baixe a versão mais recente (3.11+ recomendado)
   - **IMPORTANTE**: Marque "Add Python to PATH" durante a instalação

2. **Verificação da Instalação**:
   ```cmd
   python --version
   pip --version
   ```

### macOS

```bash
# Usando Homebrew (recomendado)
brew install python

# Ou usando pyenv
brew install pyenv
pyenv install 3.11.0
pyenv global 3.11.0
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

---

## 🌐 Configuração do Ambiente Virtual

### 1. Navegue até o diretório do projeto

```bash
cd c:\Users\flavi\Documents\Softwares\DATACLINICA
```

### 2. Crie o ambiente virtual

```bash
# Windows
python -m venv venv

# macOS/Linux
python3 -m venv venv
```

### 3. Ative o ambiente virtual

```bash
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Windows (CMD)
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate
```

### 4. Verifique a ativação

Quando ativado, você verá `(venv)` no início do prompt do terminal.

---

## 📦 Instalação das Dependências

### 1. Navegue até o diretório backend

```bash
cd backend
```

### 2. Instale as dependências

```bash
pip install -r requirements.txt
```

### 3. Dependências Principais

O arquivo `requirements.txt` inclui:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
supabase==2.3.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
cors==1.0.1
fastapi-cors==0.0.6
requests==2.31.0
pydantic==2.5.0
```

### 4. Verificação da Instalação

```bash
pip list
```

---

## 🗄️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: DataClinica
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a mais próxima (South America)
5. Clique em "Create new project"

### 2. Obter Credenciais

Após a criação do projeto:

1. Vá para **Settings** → **API**
2. Copie:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (mantenha segura!)

### 3. Configurar Database

1. Vá para **SQL Editor**
2. Execute os scripts de criação das tabelas (ver seção [Estrutura do Banco](#estrutura-do-banco-de-dados))

---

## 🔐 Configuração das Variáveis de Ambiente (.env)

### 1. Criar arquivo .env

Na raiz do projeto, crie o arquivo `.env`:

```bash
# Na raiz do projeto (não no backend/)
touch .env  # Linux/macOS
# ou crie manualmente no Windows
```

### 2. Configurar variáveis

Edite o arquivo `.env` com as seguintes variáveis:

```env
# ===========================================
# CONFIGURAÇÕES DO SUPABASE
# ===========================================

# URL do projeto Supabase
SUPABASE_URL=https://kamsukegzsnvaujttfgek.supabase.co

# Chave pública (anon key) - usada no frontend
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTA4NjUsImV4cCI6MjA2OTg4Njg2NX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8

# Chave de serviço (service role) - APENAS para backend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMxMDg2NSwiZXhwIjoyMDY5ODg2ODY1fQ.NmHg_JNoM3DOnQRlCubczBaxdxs37JoVfUvogjW-Q5I

# ===========================================
# CONFIGURAÇÕES DE AUTENTICAÇÃO
# ===========================================

# Chave secreta para JWT (gere uma chave forte)
JWT_SECRET_KEY=sua_chave_secreta_super_forte_aqui_123456789

# Algoritmo de criptografia
JWT_ALGORITHM=HS256

# Tempo de expiração do token (em minutos)
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# ===========================================
# CONFIGURAÇÕES DO SERVIDOR
# ===========================================

# Ambiente de execução
ENVIRONMENT=development

# Host do servidor
HOST=0.0.0.0

# Porta do servidor
PORT=8000

# ===========================================
# CONFIGURAÇÕES DE CORS
# ===========================================

# URLs permitidas para CORS (separadas por vírgula)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://dataclinica.vercel.app

# ===========================================
# CONFIGURAÇÕES DE LOG
# ===========================================

# Nível de log (DEBUG, INFO, WARNING, ERROR)
LOG_LEVEL=INFO

# ===========================================
# CONFIGURAÇÕES DE UPLOAD
# ===========================================

# Tamanho máximo de arquivo (em MB)
MAX_FILE_SIZE=10

# Tipos de arquivo permitidos
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# ===========================================
# CONFIGURAÇÕES DE EMAIL (OPCIONAL)
# ===========================================

# Servidor SMTP
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_de_app

# ===========================================
# CONFIGURAÇÕES DE BACKUP (OPCIONAL)
# ===========================================

# Intervalo de backup automático (em horas)
BACKUP_INTERVAL=24

# Retenção de backups (em dias)
BACKUP_RETENTION=30
```

### 3. Variáveis Obrigatórias

**⚠️ ATENÇÃO**: As seguintes variáveis são OBRIGATÓRIAS:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET_KEY`

### 4. Gerar JWT_SECRET_KEY

Para gerar uma chave secreta forte:

```python
# Execute este código Python
import secrets
print(secrets.token_urlsafe(32))
```

Ou use um gerador online confiável.

### 5. Segurança do arquivo .env

**🔒 IMPORTANTE**:
- Nunca commite o arquivo `.env` no Git
- Mantenha backups seguros das chaves
- Use chaves diferentes para desenvolvimento e produção
- O arquivo `.env` já está no `.gitignore`

---

## 🗃️ Estrutura do Banco de Dados

### 1. Tabelas Principais

O sistema DataClínica possui as seguintes tabelas:

#### Tabela: `clinicas`
```sql
CREATE TABLE clinicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `usuarios`
```sql
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL CHECK (tipo_usuario IN ('admin', 'medico', 'recepcionista')),
    clinica_id UUID REFERENCES clinicas(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `pacientes`
```sql
CREATE TABLE pacientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    clinica_id UUID REFERENCES clinicas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `medicos`
```sql
CREATE TABLE medicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    crm VARCHAR(20) UNIQUE NOT NULL,
    especialidade VARCHAR(255),
    clinica_id UUID REFERENCES clinicas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `consultas`
```sql
CREATE TABLE consultas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID REFERENCES pacientes(id),
    medico_id UUID REFERENCES medicos(id),
    data_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
    observacoes TEXT,
    clinica_id UUID REFERENCES clinicas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `prontuarios`
```sql
CREATE TABLE prontuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consulta_id UUID REFERENCES consultas(id),
    anamnese TEXT,
    exame_fisico TEXT,
    diagnostico TEXT,
    prescricao TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Script de Criação Completo

Execute este script no SQL Editor do Supabase:

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabelas
-- (Cole aqui todas as tabelas acima)

-- Criar índices para performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX idx_medicos_crm ON medicos(crm);
CREATE INDEX idx_consultas_data ON consultas(data_consulta);
CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX idx_consultas_medico ON consultas(medico_id);

-- Criar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers em todas as tabelas
CREATE TRIGGER update_clinicas_updated_at BEFORE UPDATE ON clinicas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicos_updated_at BEFORE UPDATE ON medicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultas_updated_at BEFORE UPDATE ON consultas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prontuarios_updated_at BEFORE UPDATE ON prontuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔐 Configuração de Autenticação

### 1. Sistema de Autenticação

O DataClínica usa autenticação baseada em JWT (JSON Web Tokens):

- **Login**: Email + Senha
- **Token JWT**: Válido por 30 minutos (configurável)
- **Refresh Token**: Para renovação automática
- **Níveis de Acesso**: Admin, Médico, Recepcionista

### 2. Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as API
    participant S as Supabase
    
    C->>A: POST /auth/login (email, senha)
    A->>S: Verificar credenciais
    S-->>A: Usuário válido
    A->>A: Gerar JWT Token
    A-->>C: Token + Dados do usuário
    
    C->>A: Requisições com Authorization: Bearer <token>
    A->>A: Validar token
    A-->>C: Resposta autorizada
```

### 3. Configuração no Backend

O arquivo `backend/auth.py` contém:

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# Configurações
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Context para hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

---

## 🛡️ Políticas RLS (Row Level Security)

### 1. O que é RLS?

Row Level Security (RLS) é um recurso do PostgreSQL que permite controlar o acesso aos dados em nível de linha, garantindo que usuários só vejam dados que têm permissão.

### 2. Habilitar RLS

Execute no SQL Editor do Supabase:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE prontuarios ENABLE ROW LEVEL SECURITY;
```

### 3. Políticas de Segurança

#### Política para Clínicas
```sql
-- Usuários só podem ver dados da própria clínica
CREATE POLICY "Usuarios podem ver apenas sua clinica" ON clinicas
    FOR ALL USING (
        id = (SELECT clinica_id FROM usuarios WHERE id = auth.uid())
    );
```

#### Política para Pacientes
```sql
-- Usuários só podem ver pacientes da própria clínica
CREATE POLICY "Usuarios podem ver pacientes da propria clinica" ON pacientes
    FOR ALL USING (
        clinica_id = (SELECT clinica_id FROM usuarios WHERE id = auth.uid())
    );
```

#### Política para Consultas
```sql
-- Médicos só podem ver suas próprias consultas
CREATE POLICY "Medicos podem ver suas consultas" ON consultas
    FOR ALL USING (
        medico_id IN (
            SELECT id FROM medicos 
            WHERE usuario_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario IN ('admin', 'recepcionista')
            AND clinica_id = consultas.clinica_id
        )
    );
```

### 4. Permissões para Roles

```sql
-- Conceder permissões para role authenticated
GRANT ALL ON clinicas TO authenticated;
GRANT ALL ON usuarios TO authenticated;
GRANT ALL ON pacientes TO authenticated;
GRANT ALL ON medicos TO authenticated;
GRANT ALL ON consultas TO authenticated;
GRANT ALL ON prontuarios TO authenticated;

-- Conceder permissões para role anon (apenas leitura limitada)
GRANT SELECT ON clinicas TO anon;
```

---

## 🚀 Inicialização do Servidor

### 1. Ativar Ambiente Virtual

```bash
# Windows
venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate
```

### 2. Navegar para o Backend

```bash
cd backend
```

### 3. Iniciar o Servidor

```bash
# Desenvolvimento (com reload automático)
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Produção
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Verificar Inicialização

O servidor deve exibir:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 5. Acessar Documentação da API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🧪 Testes da API

### 1. Teste de Health Check

```bash
curl http://localhost:8000/health
```

Resposta esperada:
```json
{
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
}
```

### 2. Teste de Login

```bash
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@dataclinica.com",
       "password": "admin123"
     }'
```

### 3. Teste com Token

```bash
# Substitua <TOKEN> pelo token recebido no login
curl -X GET "http://localhost:8000/clinicas" \
     -H "Authorization: Bearer <TOKEN>"
```

### 4. Usando Postman

1. Importe a collection do Postman (se disponível)
2. Configure a variável `base_url` como `http://localhost:8000`
3. Execute os testes na ordem:
   - Health Check
   - Login
   - Listar Clínicas
   - Criar Paciente

---

## 🔧 Troubleshooting

### Problema: "ModuleNotFoundError"

**Causa**: Ambiente virtual não ativado ou dependências não instaladas.

**Solução**:
```bash
# Ativar ambiente virtual
venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate   # macOS/Linux

# Reinstalar dependências
pip install -r requirements.txt
```

### Problema: "Connection refused" ao Supabase

**Causa**: Credenciais incorretas ou projeto Supabase inativo.

**Solução**:
1. Verifique as variáveis no `.env`
2. Confirme que o projeto Supabase está ativo
3. Teste a conexão:

```python
from supabase import create_client
import os

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(url, key)

# Teste simples
result = supabase.table("clinicas").select("*").limit(1).execute()
print(result)
```

### Problema: "JWT decode error"

**Causa**: Chave JWT incorreta ou token expirado.

**Solução**:
1. Verifique `JWT_SECRET_KEY` no `.env`
2. Gere nova chave se necessário
3. Faça login novamente para obter novo token

### Problema: "Permission denied" no banco

**Causa**: Políticas RLS muito restritivas.

**Solução**:
1. Verifique as políticas RLS no Supabase
2. Confirme permissões das roles:

```sql
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;
```

### Problema: Servidor não inicia

**Causa**: Porta em uso ou erro de configuração.

**Solução**:
```bash
# Verificar porta em uso
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # macOS/Linux

# Usar porta diferente
python -m uvicorn main:app --reload --port 8001
```

### Problema: CORS Error

**Causa**: Frontend não está na lista de origens permitidas.

**Solução**:
1. Adicione a URL do frontend em `ALLOWED_ORIGINS` no `.env`
2. Reinicie o servidor

---

## 📋 Comandos Úteis

### Gerenciamento do Ambiente

```bash
# Ativar ambiente virtual
venv\Scripts\Activate.ps1  # Windows PowerShell
venv\Scripts\activate.bat  # Windows CMD
source venv/bin/activate   # macOS/Linux

# Desativar ambiente virtual
deactivate

# Listar pacotes instalados
pip list

# Atualizar requirements.txt
pip freeze > requirements.txt

# Instalar pacote específico
pip install nome_do_pacote

# Desinstalar pacote
pip uninstall nome_do_pacote
```

### Servidor de Desenvolvimento

```bash
# Iniciar com reload automático
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Iniciar em modo debug
python -m uvicorn main:app --reload --log-level debug

# Iniciar em porta específica
python -m uvicorn main:app --reload --port 8001

# Parar servidor
Ctrl + C
```

### Banco de Dados

```bash
# Backup do banco (se configurado)
pg_dump -h hostname -U username -d database_name > backup.sql

# Restaurar backup
psql -h hostname -U username -d database_name < backup.sql
```

### Logs e Monitoramento

```bash
# Ver logs em tempo real
tail -f logs/app.log  # Se configurado

# Verificar uso de memória
ps aux | grep uvicorn

# Verificar conexões de rede
netstat -an | grep :8000
```

---

## 📞 Suporte

Para suporte técnico:

- **Email**: suporte@dataclinica.com
- **Documentação**: [docs.dataclinica.com](https://docs.dataclinica.com)
- **GitHub Issues**: [github.com/dataclinica/issues](https://github.com/dataclinica/issues)

---

## 📝 Notas Importantes

1. **Segurança**: Nunca exponha as chaves de produção
2. **Backup**: Faça backups regulares do banco de dados
3. **Monitoramento**: Configure logs para produção
4. **Performance**: Use cache Redis em produção
5. **SSL**: Configure HTTPS em produção

---

*Última atualização: Janeiro 2024*
*Versão do guia: 1.0.0*