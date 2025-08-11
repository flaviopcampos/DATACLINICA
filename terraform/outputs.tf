# Outputs for DataClinica Terraform Configuration

# Network Outputs
output "vpc_id" {
  description = "ID da VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block da VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs das subnets públicas"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs das subnets privadas"
  value       = aws_subnet.private[*].id
}

output "internet_gateway_id" {
  description = "ID do Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "nat_gateway_ids" {
  description = "IDs dos NAT Gateways"
  value       = aws_nat_gateway.main[*].id
}

# Load Balancer Outputs
output "alb_dns_name" {
  description = "DNS name do Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID do Application Load Balancer"
  value       = aws_lb.main.zone_id
}

output "alb_arn" {
  description = "ARN do Application Load Balancer"
  value       = aws_lb.main.arn
}

output "backend_target_group_arn" {
  description = "ARN do Target Group do backend"
  value       = aws_lb_target_group.backend.arn
}

output "frontend_target_group_arn" {
  description = "ARN do Target Group do frontend"
  value       = aws_lb_target_group.frontend.arn
}

# Database Outputs
output "rds_endpoint" {
  description = "Endpoint da instância RDS"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "Porta da instância RDS"
  value       = aws_db_instance.main.port
}

output "rds_database_name" {
  description = "Nome do banco de dados"
  value       = aws_db_instance.main.db_name
}

output "rds_username" {
  description = "Username do banco de dados"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "rds_arn" {
  description = "ARN da instância RDS"
  value       = aws_db_instance.main.arn
}

# Redis Outputs
output "redis_endpoint" {
  description = "Endpoint do cluster Redis"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
  sensitive   = true
}

output "redis_port" {
  description = "Porta do cluster Redis"
  value       = aws_elasticache_cluster.main.cache_nodes[0].port
}

output "redis_cluster_id" {
  description = "ID do cluster Redis"
  value       = aws_elasticache_cluster.main.cluster_id
}

# ECS Outputs
output "ecs_cluster_id" {
  description = "ID do cluster ECS"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_arn" {
  description = "ARN do cluster ECS"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_cluster_name" {
  description = "Nome do cluster ECS"
  value       = aws_ecs_cluster.main.name
}

# S3 Outputs
output "s3_bucket_name" {
  description = "Nome do bucket S3 para arquivos"
  value       = aws_s3_bucket.files.bucket
}

output "s3_bucket_arn" {
  description = "ARN do bucket S3 para arquivos"
  value       = aws_s3_bucket.files.arn
}

output "s3_bucket_domain_name" {
  description = "Domain name do bucket S3"
  value       = aws_s3_bucket.files.bucket_domain_name
}

# IAM Outputs
output "ecs_task_execution_role_arn" {
  description = "ARN da role de execução de tasks ECS"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_role_arn" {
  description = "ARN da role de tasks ECS"
  value       = aws_iam_role.ecs_task.arn
}

# Security Groups Outputs
output "alb_security_group_id" {
  description = "ID do Security Group do ALB"
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "ID do Security Group do ECS"
  value       = aws_security_group.ecs.id
}

output "rds_security_group_id" {
  description = "ID do Security Group do RDS"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "ID do Security Group do Redis"
  value       = aws_security_group.redis.id
}

# CloudWatch Outputs
output "cloudwatch_log_group_name" {
  description = "Nome do CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.main.name
}

output "cloudwatch_log_group_arn" {
  description = "ARN do CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.main.arn
}

# Secrets Manager Outputs
output "db_password_secret_arn" {
  description = "ARN do secret da senha do banco"
  value       = aws_secretsmanager_secret.db_password.arn
  sensitive   = true
}

output "jwt_secret_arn" {
  description = "ARN do secret da chave JWT"
  value       = aws_secretsmanager_secret.jwt_secret.arn
  sensitive   = true
}

# Parameter Store Outputs
output "database_url_parameter" {
  description = "Nome do parâmetro da URL do banco"
  value       = aws_ssm_parameter.database_url.name
  sensitive   = true
}

output "redis_url_parameter" {
  description = "Nome do parâmetro da URL do Redis"
  value       = aws_ssm_parameter.redis_url.name
  sensitive   = true
}

# Application URLs
output "application_url" {
  description = "URL da aplicação"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "http://${aws_lb.main.dns_name}"
}

output "api_url" {
  description = "URL da API"
  value       = var.domain_name != "" ? "https://${var.domain_name}/api" : "http://${aws_lb.main.dns_name}/api"
}

# Environment Information
output "environment" {
  description = "Ambiente atual"
  value       = var.environment
}

output "project_name" {
  description = "Nome do projeto"
  value       = var.project_name
}

output "aws_region" {
  description = "Região AWS"
  value       = var.aws_region
}

# Resource Tags
output "common_tags" {
  description = "Tags comuns aplicadas aos recursos"
  value = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
    CostCenter  = var.cost_center
    Contact     = var.contact_email
  }
}

# Cost Information
output "estimated_monthly_cost" {
  description = "Estimativa de custo mensal (aproximado)"
  value = {
    rds = {
      instance_class = var.db_instance_class
      storage_gb = var.db_allocated_storage
      estimated_cost_usd = "Varia conforme uso e região"
    }
    ecs = {
      cpu_units = var.ecs_cpu
      memory_mb = var.ecs_memory
      desired_count = var.ecs_desired_count
      estimated_cost_usd = "Varia conforme uso"
    }
    redis = {
      node_type = var.redis_node_type
      num_nodes = var.redis_num_cache_nodes
      estimated_cost_usd = "Varia conforme uso e região"
    }
    alb = {
      estimated_cost_usd = "~$16-25/mês + dados processados"
    }
    nat_gateway = {
      estimated_cost_usd = "~$45/mês por NAT Gateway + dados processados"
    }
  }
}

# Health Check URLs
output "health_check_urls" {
  description = "URLs para health checks"
  value = {
    backend_health = var.domain_name != "" ? "https://${var.domain_name}/api/health" : "http://${aws_lb.main.dns_name}/api/health"
    frontend_health = var.domain_name != "" ? "https://${var.domain_name}/" : "http://${aws_lb.main.dns_name}/"
    database_health = "Interno - via aplicação"
    redis_health = "Interno - via aplicação"
  }
}

# Monitoring Information
output "monitoring_info" {
  description = "Informações de monitoramento"
  value = {
    cloudwatch_dashboard = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:"
    log_group = aws_cloudwatch_log_group.main.name
    metrics_namespace = "DataClinica/${var.environment}"
  }
}

# Backup Information
output "backup_info" {
  description = "Informações de backup"
  value = {
    rds_backup_retention = var.db_backup_retention_period
    rds_backup_window = aws_db_instance.main.backup_window
    rds_maintenance_window = aws_db_instance.main.maintenance_window
    s3_versioning = "Habilitado"
  }
}

# Security Information
output "security_info" {
  description = "Informações de segurança"
  value = {
    vpc_flow_logs = "Configurar manualmente se necessário"
    ssl_certificate = var.ssl_certificate_arn != "" ? "Configurado" : "Não configurado"
    secrets_manager = "Habilitado para senhas"
    parameter_store = "Habilitado para configurações"
    security_groups = "Configurados com least privilege"
  }
}

# Connection Strings (for application configuration)
output "connection_info" {
  description = "Informações de conexão para configuração da aplicação"
  value = {
    database_host = aws_db_instance.main.address
    database_port = aws_db_instance.main.port
    database_name = aws_db_instance.main.db_name
    redis_host = aws_elasticache_cluster.main.cache_nodes[0].address
    redis_port = aws_elasticache_cluster.main.cache_nodes[0].port
    s3_bucket = aws_s3_bucket.files.bucket
    aws_region = var.aws_region
  }
  sensitive = true
}

# Deployment Information
output "deployment_info" {
  description = "Informações para deploy"
  value = {
    ecs_cluster_name = aws_ecs_cluster.main.name
    backend_service_name = "${var.project_name}-${var.environment}-backend"
    frontend_service_name = "${var.project_name}-${var.environment}-frontend"
    task_execution_role_arn = aws_iam_role.ecs_task_execution.arn
    task_role_arn = aws_iam_role.ecs_task.arn
    log_group_name = aws_cloudwatch_log_group.main.name
    subnets = aws_subnet.private[*].id
    security_groups = [aws_security_group.ecs.id]
  }
}