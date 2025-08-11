# Multi-stage build para otimizar o tamanho da imagem

# Stage 1: Build do Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copiar arquivos de dependências
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copiar código fonte e fazer build
COPY frontend/ ./
RUN npm run build

# Stage 2: Build do Backend
FROM python:3.11-slim AS backend-build
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências Python
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Stage 3: Imagem final de produção
FROM python:3.11-slim AS production
WORKDIR /app

# Instalar dependências de runtime
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root para segurança
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copiar dependências Python do stage de build
COPY --from=backend-build /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-build /usr/local/bin /usr/local/bin

# Copiar código do backend
COPY backend/ ./backend/

# Copiar build do frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist/

# Criar diretórios necessários
RUN mkdir -p /app/logs /app/uploads /app/backups /app/temp

# Configurar permissões
RUN chown -R appuser:appuser /app

# Configurar variáveis de ambiente
ENV PYTHONPATH=/app/backend
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production
ENV PORT=8000

# Expor porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Mudar para usuário não-root
USER appuser

# Comando de inicialização
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]