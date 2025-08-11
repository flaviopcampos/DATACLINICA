"""Sistema de auditoria e backup automático

Este módulo implementa funcionalidades de auditoria de transações financeiras
e backup automático de dados críticos para compliance e segurança.
"""

import os
import json
import shutil
import zipfile
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, text
import models
import schemas
from database import SessionLocal, engine

class AuditLogger:
    """Sistema de auditoria para transações financeiras"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def log_transaction(self, 
                       user_id: int, 
                       action: str, 
                       table_name: str, 
                       record_id: int, 
                       old_values: Dict = None, 
                       new_values: Dict = None,
                       clinic_id: int = None):
        """Registra uma transação para auditoria"""
        
        audit_log = models.AuditLog(
            user_id=user_id,
            clinic_id=clinic_id,
            action=action,  # CREATE, UPDATE, DELETE
            table_name=table_name,
            record_id=record_id,
            old_values=json.dumps(old_values, default=str) if old_values else None,
            new_values=json.dumps(new_values, default=str) if new_values else None,
            timestamp=datetime.now(),
            ip_address=None,  # Pode ser implementado posteriormente
            user_agent=None   # Pode ser implementado posteriormente
        )
        
        self.db.add(audit_log)
        self.db.commit()
    
    def get_audit_trail(self, 
                       clinic_id: int, 
                       start_date: date = None, 
                       end_date: date = None,
                       table_name: str = None,
                       user_id: int = None) -> List[Dict[str, Any]]:
        """Recupera trilha de auditoria com filtros"""
        
        query = self.db.query(models.AuditLog).filter(
            models.AuditLog.clinic_id == clinic_id
        )
        
        if start_date:
            query = query.filter(models.AuditLog.timestamp >= start_date)
        
        if end_date:
            query = query.filter(models.AuditLog.timestamp <= end_date)
        
        if table_name:
            query = query.filter(models.AuditLog.table_name == table_name)
        
        if user_id:
            query = query.filter(models.AuditLog.user_id == user_id)
        
        audit_logs = query.order_by(models.AuditLog.timestamp.desc()).all()
        
        result = []
        for log in audit_logs:
            user = self.db.query(models.User).filter(models.User.id == log.user_id).first()
            
            result.append({
                'id': log.id,
                'timestamp': log.timestamp.isoformat(),
                'user_name': user.name if user else 'Usuário Desconhecido',
                'action': log.action,
                'table_name': log.table_name,
                'record_id': log.record_id,
                'old_values': json.loads(log.old_values) if log.old_values else None,
                'new_values': json.loads(log.new_values) if log.new_values else None
            })
        
        return result
    
    def detect_suspicious_activities(self, clinic_id: int, days_back: int = 7) -> List[Dict[str, Any]]:
        """Detecta atividades suspeitas nos últimos dias"""
        
        start_date = datetime.now() - timedelta(days=days_back)
        alerts = []
        
        # Detectar múltiplas exclusões pelo mesmo usuário
        delete_counts = self.db.query(
            models.AuditLog.user_id,
            func.count(models.AuditLog.id).label('delete_count')
        ).filter(
            models.AuditLog.clinic_id == clinic_id,
            models.AuditLog.action == 'DELETE',
            models.AuditLog.timestamp >= start_date
        ).group_by(models.AuditLog.user_id).having(
            func.count(models.AuditLog.id) > 10
        ).all()
        
        for user_id, count in delete_counts:
            user = self.db.query(models.User).filter(models.User.id == user_id).first()
            alerts.append({
                'type': 'suspicious_deletions',
                'message': f'Usuário {user.name if user else user_id} realizou {count} exclusões em {days_back} dias',
                'severity': 'high',
                'user_id': user_id,
                'count': count
            })
        
        # Detectar alterações em valores financeiros altos
        high_value_changes = self.db.query(models.AuditLog).filter(
            models.AuditLog.clinic_id == clinic_id,
            models.AuditLog.action == 'UPDATE',
            models.AuditLog.table_name.in_(['accounts_receivable', 'accounts_payable', 'billing_items']),
            models.AuditLog.timestamp >= start_date
        ).all()
        
        for log in high_value_changes:
            if log.old_values and log.new_values:
                old_data = json.loads(log.old_values)
                new_data = json.loads(log.new_values)
                
                # Verificar mudanças em valores
                if 'amount' in old_data and 'amount' in new_data:
                    old_amount = float(old_data['amount'])
                    new_amount = float(new_data['amount'])
                    
                    if abs(new_amount - old_amount) > 1000:  # Mudança maior que R$ 1.000
                        user = self.db.query(models.User).filter(models.User.id == log.user_id).first()
                        alerts.append({
                            'type': 'high_value_change',
                            'message': f'Alteração de valor alto por {user.name if user else log.user_id}: R$ {old_amount:.2f} → R$ {new_amount:.2f}',
                            'severity': 'medium',
                            'user_id': log.user_id,
                            'table_name': log.table_name,
                            'record_id': log.record_id,
                            'old_amount': old_amount,
                            'new_amount': new_amount
                        })
        
        return alerts

class BackupManager:
    """Gerenciador de backup automático"""
    
    def __init__(self, backup_dir: str = "backups"):
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(exist_ok=True)
    
    def create_database_backup(self, clinic_id: int = None) -> str:
        """Cria backup do banco de dados"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if clinic_id:
            backup_filename = f"clinic_{clinic_id}_backup_{timestamp}.sql"
        else:
            backup_filename = f"full_backup_{timestamp}.sql"
        
        backup_path = self.backup_dir / backup_filename
        
        # Comando para backup do PostgreSQL (ajustar conforme necessário)
        if clinic_id:
            # Backup específico da clínica (implementar filtros)
            backup_command = f"pg_dump --data-only --inserts dataclinica > {backup_path}"
        else:
            # Backup completo
            backup_command = f"pg_dump dataclinica > {backup_path}"
        
        try:
            os.system(backup_command)
            return str(backup_path)
        except Exception as e:
            raise Exception(f"Erro ao criar backup: {str(e)}")
    
    def create_financial_data_backup(self, clinic_id: int, start_date: date, end_date: date) -> str:
        """Cria backup específico de dados financeiros"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"financial_backup_clinic_{clinic_id}_{timestamp}.json"
        backup_path = self.backup_dir / backup_filename
        
        db = SessionLocal()
        try:
            # Coletar dados financeiros
            financial_data = {
                'clinic_id': clinic_id,
                'backup_date': datetime.now().isoformat(),
                'period_start': start_date.isoformat(),
                'period_end': end_date.isoformat(),
                'data': {}
            }
            
            # Contas a receber
            accounts_receivable = db.query(models.AccountsReceivable).filter(
                models.AccountsReceivable.clinic_id == clinic_id,
                models.AccountsReceivable.due_date >= start_date,
                models.AccountsReceivable.due_date <= end_date
            ).all()
            
            financial_data['data']['accounts_receivable'] = [
                {
                    'id': ar.id,
                    'patient_id': ar.patient_id,
                    'amount': float(ar.amount),
                    'due_date': ar.due_date.isoformat(),
                    'status': ar.status,
                    'description': ar.description
                } for ar in accounts_receivable
            ]
            
            # Contas a pagar
            accounts_payable = db.query(models.AccountsPayable).filter(
                models.AccountsPayable.clinic_id == clinic_id,
                models.AccountsPayable.due_date >= start_date,
                models.AccountsPayable.due_date <= end_date
            ).all()
            
            financial_data['data']['accounts_payable'] = [
                {
                    'id': ap.id,
                    'supplier_id': ap.supplier_id,
                    'amount': float(ap.amount),
                    'due_date': ap.due_date.isoformat(),
                    'status': ap.status,
                    'category': ap.category,
                    'description': ap.description
                } for ap in accounts_payable
            ]
            
            # Fluxo de caixa
            cash_flows = db.query(models.CashFlow).filter(
                models.CashFlow.clinic_id == clinic_id,
                models.CashFlow.transaction_date >= start_date,
                models.CashFlow.transaction_date <= end_date
            ).all()
            
            financial_data['data']['cash_flows'] = [
                {
                    'id': cf.id,
                    'transaction_date': cf.transaction_date.isoformat(),
                    'amount': float(cf.amount),
                    'transaction_type': cf.transaction_type,
                    'category': cf.category,
                    'description': cf.description
                } for cf in cash_flows
            ]
            
            # Salvar arquivo JSON
            with open(backup_path, 'w', encoding='utf-8') as f:
                json.dump(financial_data, f, indent=2, ensure_ascii=False)
            
            return str(backup_path)
            
        finally:
            db.close()
    
    def create_compressed_backup(self, clinic_id: int) -> str:
        """Cria backup comprimido com todos os dados da clínica"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        zip_filename = f"clinic_{clinic_id}_full_backup_{timestamp}.zip"
        zip_path = self.backup_dir / zip_filename
        
        # Criar backups individuais
        db_backup = self.create_database_backup(clinic_id)
        
        # Período dos últimos 12 meses para dados financeiros
        end_date = date.today()
        start_date = end_date - timedelta(days=365)
        financial_backup = self.create_financial_data_backup(clinic_id, start_date, end_date)
        
        # Criar arquivo ZIP
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.write(db_backup, os.path.basename(db_backup))
            zipf.write(financial_backup, os.path.basename(financial_backup))
        
        # Limpar arquivos temporários
        os.remove(db_backup)
        os.remove(financial_backup)
        
        return str(zip_path)
    
    def schedule_automatic_backup(self, clinic_id: int, frequency: str = 'daily'):
        """Agenda backup automático (implementação básica)"""
        
        # Esta é uma implementação básica
        # Em produção, usar Celery ou similar para agendamento
        
        backup_schedule = {
            'clinic_id': clinic_id,
            'frequency': frequency,
            'last_backup': None,
            'next_backup': None,
            'enabled': True
        }
        
        # Salvar configuração de agendamento
        schedule_file = self.backup_dir / f"schedule_clinic_{clinic_id}.json"
        with open(schedule_file, 'w') as f:
            json.dump(backup_schedule, f, indent=2, default=str)
        
        return backup_schedule
    
    def cleanup_old_backups(self, days_to_keep: int = 30):
        """Remove backups antigos"""
        
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        
        for backup_file in self.backup_dir.glob("*backup*"):
            if backup_file.stat().st_mtime < cutoff_date.timestamp():
                backup_file.unlink()
                print(f"Backup removido: {backup_file.name}")
    
    def list_backups(self, clinic_id: int = None) -> List[Dict[str, Any]]:
        """Lista backups disponíveis"""
        
        backups = []
        pattern = f"*clinic_{clinic_id}*" if clinic_id else "*backup*"
        
        for backup_file in self.backup_dir.glob(pattern):
            stat = backup_file.stat()
            backups.append({
                'filename': backup_file.name,
                'size_mb': round(stat.st_size / (1024 * 1024), 2),
                'created_date': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'path': str(backup_file)
            })
        
        return sorted(backups, key=lambda x: x['created_date'], reverse=True)

class ComplianceChecker:
    """Verificador de compliance fiscal e financeiro"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_financial_compliance(self, clinic_id: int) -> Dict[str, Any]:
        """Verifica compliance financeiro da clínica"""
        
        compliance_report = {
            'clinic_id': clinic_id,
            'check_date': datetime.now().isoformat(),
            'status': 'compliant',
            'issues': [],
            'recommendations': []
        }
        
        # Verificar contas sem categoria
        uncategorized_payables = self.db.query(models.AccountsPayable).filter(
            models.AccountsPayable.clinic_id == clinic_id,
            or_(models.AccountsPayable.category.is_(None), models.AccountsPayable.category == '')
        ).count()
        
        if uncategorized_payables > 0:
            compliance_report['issues'].append({
                'type': 'uncategorized_expenses',
                'severity': 'medium',
                'message': f'{uncategorized_payables} contas a pagar sem categoria definida',
                'recommendation': 'Categorizar todas as despesas para melhor controle fiscal'
            })
        
        # Verificar documentos fiscais pendentes
        pending_invoices = self.db.query(models.InvoiceNFS).filter(
            models.InvoiceNFS.clinic_id == clinic_id,
            models.InvoiceNFS.status == 'pending'
        ).count()
        
        if pending_invoices > 5:
            compliance_report['issues'].append({
                'type': 'pending_invoices',
                'severity': 'high',
                'message': f'{pending_invoices} notas fiscais pendentes de emissão',
                'recommendation': 'Emitir notas fiscais pendentes para evitar problemas fiscais'
            })
        
        # Verificar backup recente
        backup_manager = BackupManager()
        recent_backups = backup_manager.list_backups(clinic_id)
        
        if not recent_backups:
            compliance_report['issues'].append({
                'type': 'no_backup',
                'severity': 'high',
                'message': 'Nenhum backup encontrado',
                'recommendation': 'Configurar backup automático dos dados financeiros'
            })
        else:
            latest_backup = datetime.fromisoformat(recent_backups[0]['created_date'])
            days_since_backup = (datetime.now() - latest_backup).days
            
            if days_since_backup > 7:
                compliance_report['issues'].append({
                    'type': 'old_backup',
                    'severity': 'medium',
                    'message': f'Último backup há {days_since_backup} dias',
                    'recommendation': 'Realizar backup mais frequente dos dados'
                })
        
        # Definir status geral
        if any(issue['severity'] == 'high' for issue in compliance_report['issues']):
            compliance_report['status'] = 'non_compliant'
        elif compliance_report['issues']:
            compliance_report['status'] = 'partially_compliant'
        
        return compliance_report

# Funções auxiliares para integração
def setup_audit_logging():
    """Configura sistema de auditoria"""
    # Criar tabela de auditoria se não existir
    from sqlalchemy import Column, Integer, String, DateTime, Text
    
    # Esta função seria chamada na inicialização do sistema
    pass

def get_audit_logger(db: Session) -> AuditLogger:
    """Retorna instância do logger de auditoria"""
    return AuditLogger(db)

def get_backup_manager() -> BackupManager:
    """Retorna instância do gerenciador de backup"""
    return BackupManager()

def get_compliance_checker(db: Session) -> ComplianceChecker:
    """Retorna instância do verificador de compliance"""
    return ComplianceChecker(db)