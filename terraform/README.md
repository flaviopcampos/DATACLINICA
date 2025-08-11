# DataClinica - Infraestrutura Terraform

Este diretório contém a configuração Terraform para provisionar a infraestrutura AWS do DataClinica.

## 📋 Pré-requisitos

- [Terraform](https://www.terraform.io/downloads.html) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) configurado
- Credenciais AWS com permissões adequadas
- Bucket S3 para armazenar o estado do Terraform (configurado em `main.tf`)

## 🏗️ Arquitetura

A infraestrutura provisiona:

### Rede
- VPC com subnets públicas e privadas
- Internet Gateway e NAT Gateways
- Security Groups configurados

### Computação
- Cluster ECS Fargate
- Application Load Balancer (ALB)
- Auto Scaling configurado

### Banco de Dados
- RDS PostgreSQL com backup automático
- ElastiCache Redis para cache

### Armazenamento
- Bucket S3 para arquivos da aplicação
- Versionamento e lifecycle policies

### Segurança
- IAM Roles e Policies
- Secrets Manager para senhas
- Parameter Store para configurações

### Monitoramento
- CloudWatch Logs e Metrics
- Alertas configurados

## 🚀 Como usar

### 1. Configuração inicial

```bash
# Clone o repositório
git clone <repository-url>
cd DATACLINICA/terraform

# Copie o arquivo de exemplo
cp terraform.tfvars.example terraform.tfvars

# Edite as configurações
nano terraform.tfvars
```

### 2. Configurar backend S3

Antes de executar o Terraform, crie um bucket S3 para armazenar o estado:

```bash
# Criar bucket (substitua pelo nome único)
aws s3 mb s3://dataclinica-terraform-state-unique-id

# Habilitar versionamento
aws s3api put-bucket-versioning \
  --bucket dataclinica-terraform-state-unique-id \
  --versioning-configuration Status=Enabled
```

Atualize o backend em `main.tf`:

```hcl
terraform {
  backend "s3" {
    bucket = "dataclinica-terraform-state-unique-id"
    key    = "dataclinica/terraform.tfstate"
    region = "us-east-1"
  }
}
```

### 3. Executar Terraform

```bash
# Inicializar
terraform init

# Planejar
terraform plan

# Aplicar
terraform apply
```

### 4. Obter outputs

```bash
# Ver todos os outputs
terraform output

# Output específico
terraform output alb_dns_name
```

## 📁 Estrutura de arquivos

```
terraform/
├── main.tf                    # Configuração principal
├── variables.tf               # Definição de variáveis
├── outputs.tf                 # Outputs da infraestrutura
├── terraform.tfvars.example   # Exemplo de configuração
└── README.md                  # Este arquivo
```

## ⚙️ Configuração por ambiente

### Desenvolvimento
```hcl
environment = "development"
db_instance_class = "db.t3.micro"
ecs_cpu = 256
ecs_memory = 512
ecs_desired_count = 1
enable_deletion_protection = false
```

### Staging
```hcl
environment = "staging"
db_instance_class = "db.t3.small"
ecs_cpu = 512
ecs_memory = 1024
ecs_desired_count = 2
enable_deletion_protection = true
```

### Produção
```hcl
environment = "production"
db_instance_class = "db.t3.medium"
ecs_cpu = 1024
ecs_memory = 2048
ecs_desired_count = 3
enable_deletion_protection = true
backup_config = {
  enabled = true
  retention_days = 90
  cross_region_copy = true
}
```

## 🔒 Segurança

### Secrets Management
- Senhas são geradas automaticamente e armazenadas no Secrets Manager
- Configurações sensíveis no Parameter Store
- IAM roles com princípio de menor privilégio

### Network Security
- Subnets privadas para banco de dados e cache
- Security Groups restritivos
- NAT Gateways para acesso à internet das subnets privadas

### SSL/TLS
```hcl
# Configure certificado SSL
ssl_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/..."
domain_name = "app.dataclinica.com"
```

## 💰 Otimização de custos

### Instâncias Spot (desenvolvimento)
```hcl
enable_spot_instances = true
```

### Scaling por horário
```hcl
schedule_scaling = {
  enabled = true
  scale_down = {
    schedule = "cron(0 22 * * ? *)"  # 22:00
    desired_capacity = 0
  }
  scale_up = {
    schedule = "cron(0 6 * * ? *)"   # 06:00
    desired_capacity = 2
  }
}
```

### Monitoramento de custos
- Tags de cost center aplicadas automaticamente
- Alertas de billing configuráveis
- Recursos dimensionados por ambiente

## 📊 Monitoramento

### CloudWatch
- Logs centralizados
- Métricas customizadas
- Dashboards automáticos

### Alertas
```hcl
monitoring_config = {
  alerting = {
    enabled = true
    cpu_threshold = 80
    memory_threshold = 85
    response_time_threshold = 2000
  }
}
```

### Health Checks
- ALB health checks configurados
- Endpoints de saúde da aplicação
- Monitoramento de dependências externas

## 🔄 Backup e Recuperação

### RDS
- Backup automático diário
- Retenção configurável
- Point-in-time recovery

### S3
- Versionamento habilitado
- Lifecycle policies
- Cross-region replication (produção)

### Disaster Recovery
```hcl
backup_config = {
  cross_region_copy = true
  destination_region = "us-west-2"
}
```

## 🚀 Deploy da aplicação

Após provisionar a infraestrutura:

1. **Build das imagens Docker**
```bash
# Backend
docker build -t dataclinica/backend:latest ./backend
docker tag dataclinica/backend:latest <ecr-repo>/backend:latest
docker push <ecr-repo>/backend:latest

# Frontend
docker build -t dataclinica/frontend:latest ./frontend
docker tag dataclinica/frontend:latest <ecr-repo>/frontend:latest
docker push <ecr-repo>/frontend:latest
```

2. **Atualizar ECS Services**
```bash
aws ecs update-service \
  --cluster dataclinica-development \
  --service dataclinica-development-backend \
  --force-new-deployment
```

3. **Configurar variáveis de ambiente**
```bash
# Obter informações de conexão
terraform output connection_info

# Configurar na aplicação
export DATABASE_URL="postgresql://user:pass@host:5432/db"
export REDIS_URL="redis://host:6379"
```

## 🔧 Troubleshooting

### Problemas comuns

1. **Estado do Terraform corrompido**
```bash
terraform state list
terraform state show <resource>
terraform import <resource> <id>
```

2. **Recursos órfãos**
```bash
terraform refresh
terraform plan
```

3. **Permissões AWS**
```bash
aws sts get-caller-identity
aws iam get-user
```

### Logs úteis
- CloudWatch Logs: `/aws/ecs/dataclinica`
- ALB Access Logs: S3 bucket configurado
- VPC Flow Logs: CloudWatch (se habilitado)

## 📚 Recursos adicionais

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Teste as mudanças em ambiente de desenvolvimento
4. Submeta um pull request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.