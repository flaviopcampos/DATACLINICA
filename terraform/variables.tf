# Variables for DataClinica Terraform Configuration

variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "dataclinica"
}

variable "environment" {
  description = "Ambiente (development, staging, production)"
  type        = string
  default     = "development"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment deve ser development, staging ou production."
  }
}

variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

# Network Configuration
variable "vpc_cidr" {
  description = "CIDR block para a VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks para subnets públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks para subnets privadas"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

# Database Configuration
variable "db_instance_class" {
  description = "Classe da instância RDS"
  type        = string
  default     = "db.t3.micro"
  
  validation {
    condition = can(regex("^db\\.(t3|t4g|r5|r6g)\\.(micro|small|medium|large|xlarge|2xlarge)$", var.db_instance_class))
    error_message = "Classe de instância RDS inválida."
  }
}

variable "db_allocated_storage" {
  description = "Armazenamento alocado para RDS (GB)"
  type        = number
  default     = 20
  
  validation {
    condition     = var.db_allocated_storage >= 20 && var.db_allocated_storage <= 1000
    error_message = "Armazenamento deve estar entre 20 e 1000 GB."
  }
}

variable "db_max_allocated_storage" {
  description = "Armazenamento máximo para auto-scaling RDS (GB)"
  type        = number
  default     = 100
  
  validation {
    condition     = var.db_max_allocated_storage >= var.db_allocated_storage
    error_message = "Armazenamento máximo deve ser maior ou igual ao armazenamento inicial."
  }
}

variable "db_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = "dataclinica"
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.db_name))
    error_message = "Nome do banco deve começar com letra e conter apenas letras, números e underscore."
  }
}

variable "db_username" {
  description = "Username do banco de dados"
  type        = string
  default     = "dataclinica_user"
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.db_username))
    error_message = "Username deve começar com letra e conter apenas letras, números e underscore."
  }
}

variable "db_backup_retention_period" {
  description = "Período de retenção de backup em dias"
  type        = number
  default     = 7
  
  validation {
    condition     = var.db_backup_retention_period >= 0 && var.db_backup_retention_period <= 35
    error_message = "Período de retenção deve estar entre 0 e 35 dias."
  }
}

# Redis Configuration
variable "redis_node_type" {
  description = "Tipo de nó para ElastiCache Redis"
  type        = string
  default     = "cache.t3.micro"
  
  validation {
    condition = can(regex("^cache\\.(t3|t4g|r5|r6g)\\.(micro|small|medium|large|xlarge|2xlarge)$", var.redis_node_type))
    error_message = "Tipo de nó Redis inválido."
  }
}

variable "redis_num_cache_nodes" {
  description = "Número de nós no cluster Redis"
  type        = number
  default     = 1
  
  validation {
    condition     = var.redis_num_cache_nodes >= 1 && var.redis_num_cache_nodes <= 6
    error_message = "Número de nós deve estar entre 1 e 6."
  }
}

# ECS Configuration
variable "ecs_cpu" {
  description = "CPU para tasks ECS (em unidades de CPU)"
  type        = number
  default     = 256
  
  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.ecs_cpu)
    error_message = "CPU deve ser 256, 512, 1024, 2048 ou 4096."
  }
}

variable "ecs_memory" {
  description = "Memória para tasks ECS (em MB)"
  type        = number
  default     = 512
  
  validation {
    condition     = var.ecs_memory >= 512 && var.ecs_memory <= 8192
    error_message = "Memória deve estar entre 512 e 8192 MB."
  }
}

variable "ecs_desired_count" {
  description = "Número desejado de tasks ECS"
  type        = number
  default     = 1
  
  validation {
    condition     = var.ecs_desired_count >= 1 && var.ecs_desired_count <= 10
    error_message = "Número de tasks deve estar entre 1 e 10."
  }
}

variable "ecs_max_capacity" {
  description = "Capacidade máxima para auto-scaling ECS"
  type        = number
  default     = 3
  
  validation {
    condition     = var.ecs_max_capacity >= var.ecs_desired_count
    error_message = "Capacidade máxima deve ser maior ou igual ao número desejado."
  }
}

variable "ecs_min_capacity" {
  description = "Capacidade mínima para auto-scaling ECS"
  type        = number
  default     = 1
  
  validation {
    condition     = var.ecs_min_capacity <= var.ecs_desired_count
    error_message = "Capacidade mínima deve ser menor ou igual ao número desejado."
  }
}

# Application Configuration
variable "backend_image" {
  description = "Imagem Docker do backend"
  type        = string
  default     = "dataclinica/backend:latest"
}

variable "frontend_image" {
  description = "Imagem Docker do frontend"
  type        = string
  default     = "dataclinica/frontend:latest"
}

variable "domain_name" {
  description = "Nome do domínio para a aplicação"
  type        = string
  default     = ""
}

variable "ssl_certificate_arn" {
  description = "ARN do certificado SSL no ACM"
  type        = string
  default     = ""
}

# Security Configuration
variable "allowed_cidr_blocks" {
  description = "CIDR blocks permitidos para acesso"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_deletion_protection" {
  description = "Habilitar proteção contra exclusão para recursos críticos"
  type        = bool
  default     = false
}

variable "enable_backup" {
  description = "Habilitar backup automático"
  type        = bool
  default     = true
}

variable "enable_monitoring" {
  description = "Habilitar monitoramento avançado"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "Habilitar logging centralizado"
  type        = bool
  default     = true
}

# Cost Optimization
variable "enable_spot_instances" {
  description = "Usar instâncias Spot para reduzir custos"
  type        = bool
  default     = false
}

variable "schedule_scaling" {
  description = "Configuração de scaling baseado em horário"
  type = object({
    enabled = bool
    scale_down = object({
      schedule = string
      min_capacity = number
      max_capacity = number
      desired_capacity = number
    })
    scale_up = object({
      schedule = string
      min_capacity = number
      max_capacity = number
      desired_capacity = number
    })
  })
  default = {
    enabled = false
    scale_down = {
      schedule = "cron(0 22 * * ? *)"
      min_capacity = 0
      max_capacity = 1
      desired_capacity = 0
    }
    scale_up = {
      schedule = "cron(0 6 * * ? *)"
      min_capacity = 1
      max_capacity = 3
      desired_capacity = 1
    }
  }
}

# External Services
variable "external_apis" {
  description = "Configuração de APIs externas"
  type = object({
    memed = object({
      api_url = string
      enabled = bool
    })
    clicksign = object({
      api_url = string
      enabled = bool
    })
    viacep = object({
      api_url = string
      enabled = bool
    })
  })
  default = {
    memed = {
      api_url = "https://api.memed.com.br"
      enabled = true
    }
    clicksign = {
      api_url = "https://api.clicksign.com"
      enabled = true
    }
    viacep = {
      api_url = "https://viacep.com.br/ws"
      enabled = true
    }
  }
}

# Notification Configuration
variable "notification_config" {
  description = "Configuração de notificações"
  type = object({
    email = object({
      enabled = bool
      smtp_server = string
      smtp_port = number
      from_email = string
    })
    slack = object({
      enabled = bool
      webhook_url = string
    })
    sns = object({
      enabled = bool
      topic_arn = string
    })
  })
  default = {
    email = {
      enabled = false
      smtp_server = ""
      smtp_port = 587
      from_email = ""
    }
    slack = {
      enabled = false
      webhook_url = ""
    }
    sns = {
      enabled = false
      topic_arn = ""
    }
  }
}

# Backup Configuration
variable "backup_config" {
  description = "Configuração de backup"
  type = object({
    enabled = bool
    retention_days = number
    schedule = string
    cross_region_copy = bool
    destination_region = string
  })
  default = {
    enabled = true
    retention_days = 30
    schedule = "cron(0 2 * * ? *)"
    cross_region_copy = false
    destination_region = "us-west-2"
  }
}

# Monitoring and Alerting
variable "monitoring_config" {
  description = "Configuração de monitoramento"
  type = object({
    enabled = bool
    retention_days = number
    detailed_monitoring = bool
    custom_metrics = bool
    alerting = object({
      enabled = bool
      cpu_threshold = number
      memory_threshold = number
      disk_threshold = number
      response_time_threshold = number
    })
  })
  default = {
    enabled = true
    retention_days = 30
    detailed_monitoring = true
    custom_metrics = true
    alerting = {
      enabled = true
      cpu_threshold = 80
      memory_threshold = 85
      disk_threshold = 90
      response_time_threshold = 2000
    }
  }
}

# Tags
variable "additional_tags" {
  description = "Tags adicionais para recursos"
  type        = map(string)
  default     = {}
}

variable "cost_center" {
  description = "Centro de custo para billing"
  type        = string
  default     = "dataclinica"
}

variable "owner" {
  description = "Proprietário dos recursos"
  type        = string
  default     = "DataClinica Team"
}

variable "contact_email" {
  description = "Email de contato para os recursos"
  type        = string
  default     = "admin@dataclinica.com"
  
  validation {
    condition     = can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.contact_email))
    error_message = "Email deve ter formato válido."
  }
}

# Feature Flags
variable "feature_flags" {
  description = "Feature flags para funcionalidades opcionais"
  type = object({
    enable_waf = bool
    enable_cloudfront = bool
    enable_elasticsearch = bool
    enable_kinesis = bool
    enable_lambda_functions = bool
    enable_api_gateway = bool
    enable_cognito = bool
  })
  default = {
    enable_waf = false
    enable_cloudfront = false
    enable_elasticsearch = false
    enable_kinesis = false
    enable_lambda_functions = false
    enable_api_gateway = false
    enable_cognito = false
  }
}