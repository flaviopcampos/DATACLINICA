# 🚀 Guia de Instalação - DataClínica

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Docker** (versão 20.10 ou superior)
- **Docker Compose** (versão 2.0 ou superior)
- **Git** (para clonar o repositório)
- **4GB de RAM** disponível (mínimo)
- **10GB de espaço em disco** (recomendado)

### Verificação dos Pré-requisitos

```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar Git
git --version
```

---

## 🔧 Instalação Rápida

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/dataclinica.git
cd dataclinica
```

### 2. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite as configurações (opcional para desenvolvimento)
nano .env  # ou use seu editor preferido
```

**⚠️ IMPORTANTE:** Para produção, altere as chaves secretas:

```bash
# Gere chaves seguras
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"
```

### 3. Inicie os Serviços

```bash
# Para desenvolvimento
docker-compose up -d

# Para produção
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Inicialize o Sistema

```bash
# Execute o script de inicialização
docker-compose exec backend python scripts/init_system.py
```

### 5. Acesse o Sistema

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **Documentação**: http://localhost:8000/docs
- **Admin DB**: http://localhost:8080 (Adminer)

**Credenciais padrão (desenvolvimento):**
- Email: `admin@dataclinica.com`
- Senha: `admin123`

---

## 🐳 Comandos Docker Úteis

### Gerenciamento de Containers

```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar serviços
docker-compose stop

# Reiniciar serviços
docker-compose restart

# Parar e remover containers
docker-compose down

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d --build
```

### Acesso aos Containers

```bash
# Acessar container do backend
docker-compose exec backend bash

# Acessar container do frontend
docker-compose exec frontend bash

# Acessar PostgreSQL
docker-compose exec postgres psql -U dataclinica -d dataclinica

# Acessar Redis
docker-compose exec redis redis-cli
```

---

## 🗄️ Gerenciamento do Banco de Dados

### Migrações

```bash
# Executar migrações
docker-compose exec backend alembic upgrade head

# Criar nova migração
docker-compose exec backend alembic revision --autogenerate -m "Descrição da mudança"

# Ver histórico de migrações
docker-compose exec backend alembic history

# Reverter migração
docker-compose exec backend alembic downgrade -1
```

### Backup e Restore

```bash
# Criar backup
docker-compose exec postgres pg_dump -U dataclinica dataclinica > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T postgres psql -U dataclinica dataclinica < backup_20231201_120000.sql

# Backup automático (usando script)
docker-compose exec backend python scripts/backup.py
```

---

## 👥 Gerenciamento de Usuários

### Criar Usuário Administrador

```bash
# Script interativo
docker-compose exec backend python scripts/create_admin.py
```

### Criar Usuários via API

```bash
# Exemplo usando curl
curl -X POST "http://localhost:8000/api/v1/users/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "email": "medico@hospital.com",
    "nome_completo": "Dr. João Silva",
    "tipo_usuario": "medico",
    "especialidade": "Cardiologia",
    "crm": "12345"
  }'
```

---

## 🔧 Configurações Avançadas

### SSL/HTTPS (Produção)

1. Obtenha certificados SSL (Let's Encrypt recomendado)
2. Configure no `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ... resto da configuração
}
```

### Monitoramento

```bash
# Ativar Prometheus + Grafana
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Acessar Grafana
# http://localhost:3001 (admin/admin)
```

### Backup Automático

```bash
# Configurar cron para backup diário
crontab -e

# Adicionar linha:
0 2 * * * cd /path/to/dataclinica && docker-compose exec backend python scripts/backup.py
```

---

## 🚨 Solução de Problemas

### Problemas Comuns

#### 1. Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

#### 2. Erro de Permissão

```bash
# Corrigir permissões de arquivos
sudo chown -R $USER:$USER .
chmod +x scripts/*.py
```

#### 3. Porta já em Uso

```bash
# Verificar portas em uso
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Alterar portas no docker-compose.yml se necessário
```

#### 4. Falta de Memória

```bash
# Verificar uso de memória
docker stats

# Limpar containers não utilizados
docker system prune -a
```

### Logs de Debug

```bash
# Ativar modo debug
echo "DEBUG=true" >> .env
docker-compose restart

# Ver logs detalhados
docker-compose logs -f --tail=100
```

---

## 📊 Verificação da Instalação

### Health Checks

```bash
# Verificar saúde dos serviços
curl http://localhost:8000/health
curl http://localhost:3000

# Verificar API
curl http://localhost:8000/api/v1/health

# Verificar banco de dados
docker-compose exec backend python -c "from app.core.database import engine; print('DB OK')"
```

### Testes de Funcionalidade

```bash
# Executar testes (se disponíveis)
docker-compose exec backend pytest

# Teste de carga básico
ab -n 100 -c 10 http://localhost:8000/api/v1/health
```

---

## 🔄 Atualizações

### Atualizar Sistema

```bash
# Fazer backup antes da atualização
docker-compose exec backend python scripts/backup.py

# Baixar atualizações
git pull origin main

# Rebuild e restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Executar migrações
docker-compose exec backend alembic upgrade head
```

---

## 📞 Suporte

### Recursos de Ajuda

- **Documentação**: http://localhost:8000/docs
- **Logs**: `docker-compose logs -f`
- **Issues**: GitHub Issues do projeto
- **Email**: suporte@dataclinica.com

### Informações do Sistema

```bash
# Versão do sistema
docker-compose exec backend python -c "from app.core.config import settings; print(f'Versão: {settings.APP_VERSION}')"

# Informações do ambiente
docker-compose exec backend python scripts/system_info.py
```

---

## 🎯 Próximos Passos

Após a instalação bem-sucedida:

1. **Configure o Hospital**: Acesse Configurações → Dados do Hospital
2. **Crie Usuários**: Adicione médicos, enfermeiros e funcionários
3. **Configure Especialidades**: Defina as especialidades médicas
4. **Configure Convênios**: Adicione planos de saúde aceitos
5. **Configure Backup**: Ative backup automático
6. **Configure Monitoramento**: Ative alertas e métricas
7. **Treinamento**: Treine a equipe no uso do sistema

---

**🏥 DataClínica - Sistema de Gestão Hospitalar**  
*Versão 1.0 - Instalação Completa*