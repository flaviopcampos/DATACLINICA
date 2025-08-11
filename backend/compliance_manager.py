#!/usr/bin/env python3
"""
DataClínica - Gerenciador de Compliance e Conformidade

Este módulo implementa controles de compliance para LGPD, HIPAA, ISO 27001
e outras regulamentações de saúde e proteção de dados.
"""

import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass, field
from enum import Enum
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from .models import User, Patient, AuditLog, TwoFactorAuth
from .audit_logger import AuditLogger, EventType, EventSeverity
from .data_validation import DataValidator, DataSensitivityLevel
from .encryption import DataEncryption

class ComplianceFramework(str, Enum):
    """Frameworks de compliance suportados"""
    LGPD = "lgpd"  # Lei Geral de Proteção de Dados (Brasil)
    HIPAA = "hipaa"  # Health Insurance Portability and Accountability Act (EUA)
    GDPR = "gdpr"  # General Data Protection Regulation (EU)
    ISO27001 = "iso27001"  # ISO/IEC 27001
    SOC2 = "soc2"  # SOC 2 Type II
    PCI_DSS = "pci_dss"  # Payment Card Industry Data Security Standard

class ComplianceStatus(str, Enum):
    """Status de compliance"""
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PARTIALLY_COMPLIANT = "partially_compliant"
    UNDER_REVIEW = "under_review"
    REMEDIATION_REQUIRED = "remediation_required"

class DataProcessingPurpose(str, Enum):
    """Finalidades de processamento de dados (LGPD)"""
    MEDICAL_CARE = "medical_care"
    ADMINISTRATIVE = "administrative"
    BILLING = "billing"
    RESEARCH = "research"
    MARKETING = "marketing"
    LEGAL_COMPLIANCE = "legal_compliance"
    SECURITY = "security"

class LegalBasis(str, Enum):
    """Bases legais para processamento (LGPD)"""
    CONSENT = "consent"  # Consentimento
    CONTRACT = "contract"  # Execução de contrato
    LEGAL_OBLIGATION = "legal_obligation"  # Cumprimento de obrigação legal
    VITAL_INTERESTS = "vital_interests"  # Proteção da vida
    PUBLIC_TASK = "public_task"  # Exercício regular de direitos
    LEGITIMATE_INTERESTS = "legitimate_interests"  # Interesse legítimo

@dataclass
class DataProcessingRecord:
    """Registro de processamento de dados"""
    record_id: str
    timestamp: datetime
    user_id: Optional[int]
    data_subject_id: int  # ID do titular dos dados
    data_type: str
    processing_purpose: DataProcessingPurpose
    legal_basis: LegalBasis
    data_categories: List[str]
    retention_period: int  # em dias
    consent_given: bool = False
    consent_date: Optional[datetime] = None
    consent_withdrawn: bool = False
    consent_withdrawal_date: Optional[datetime] = None
    data_shared: bool = False
    third_parties: List[str] = field(default_factory=list)
    international_transfer: bool = False
    transfer_countries: List[str] = field(default_factory=list)
    security_measures: List[str] = field(default_factory=list)

@dataclass
class ComplianceViolation:
    """Violação de compliance"""
    violation_id: str
    timestamp: datetime
    framework: ComplianceFramework
    severity: str  # low, medium, high, critical
    description: str
    affected_data_subjects: List[int]
    data_categories: List[str]
    root_cause: str
    remediation_actions: List[str]
    status: str  # open, in_progress, resolved
    resolution_date: Optional[datetime] = None
    notification_required: bool = False
    authority_notified: bool = False
    data_subjects_notified: bool = False

@dataclass
class DataSubjectRequest:
    """Solicitação do titular dos dados"""
    request_id: str
    timestamp: datetime
    data_subject_id: int
    request_type: str  # access, rectification, erasure, portability, restriction, objection
    description: str
    status: str  # pending, in_progress, completed, rejected
    response_deadline: datetime
    response_date: Optional[datetime] = None
    response_data: Optional[Dict[str, Any]] = None
    rejection_reason: Optional[str] = None

class ComplianceManager:
    """Gerenciador de compliance e conformidade"""
    
    def __init__(self, db: Session, audit_logger: AuditLogger):
        self.db = db
        self.audit_logger = audit_logger
        self.data_validator = DataValidator()
        self.encryption = DataEncryption()
        
        # Armazenamento de registros de compliance
        self.processing_records: List[DataProcessingRecord] = []
        self.violations: List[ComplianceViolation] = []
        self.data_subject_requests: List[DataSubjectRequest] = []
        
        # Configurações de compliance
        self.compliance_config = {
            'lgpd': {
                'data_breach_notification_hours': 72,
                'data_subject_response_days': 15,
                'consent_renewal_days': 365,
                'data_retention_default_days': 2555,  # 7 anos
                'required_security_measures': [
                    'encryption_at_rest',
                    'encryption_in_transit',
                    'access_control',
                    'audit_logging',
                    'backup_recovery'
                ]
            },
            'hipaa': {
                'minimum_necessary_standard': True,
                'administrative_safeguards': [
                    'security_officer',
                    'workforce_training',
                    'access_management',
                    'incident_procedures'
                ],
                'physical_safeguards': [
                    'facility_access',
                    'workstation_use',
                    'device_controls'
                ],
                'technical_safeguards': [
                    'access_control',
                    'audit_controls',
                    'integrity',
                    'transmission_security'
                ]
            }
        }
    
    async def record_data_processing(self, user_id: Optional[int], data_subject_id: int,
                                   data_type: str, purpose: DataProcessingPurpose,
                                   legal_basis: LegalBasis, data_categories: List[str],
                                   consent_given: bool = False) -> DataProcessingRecord:
        """Registra processamento de dados"""
        record_id = hashlib.sha256(f"{data_subject_id}_{data_type}_{datetime.now().isoformat()}".encode()).hexdigest()[:16]
        
        record = DataProcessingRecord(
            record_id=record_id,
            timestamp=datetime.now(),
            user_id=user_id,
            data_subject_id=data_subject_id,
            data_type=data_type,
            processing_purpose=purpose,
            legal_basis=legal_basis,
            data_categories=data_categories,
            retention_period=self.compliance_config['lgpd']['data_retention_default_days'],
            consent_given=consent_given,
            consent_date=datetime.now() if consent_given else None
        )
        
        self.processing_records.append(record)
        
        # Registrar no audit log
        await self.audit_logger.log_event(
            EventType.COMPLIANCE,
            EventSeverity.INFO,
            user_id,
            f"Processamento de dados registrado: {data_type}",
            {
                'record_id': record_id,
                'data_subject_id': data_subject_id,
                'purpose': purpose.value,
                'legal_basis': legal_basis.value,
                'consent_given': consent_given
            }
        )
        
        return record
    
    async def validate_lgpd_compliance(self, data_subject_id: int) -> Dict[str, Any]:
        """Valida compliance com LGPD"""
        compliance_report = {
            'data_subject_id': data_subject_id,
            'framework': ComplianceFramework.LGPD.value,
            'timestamp': datetime.now().isoformat(),
            'overall_status': ComplianceStatus.COMPLIANT.value,
            'violations': [],
            'recommendations': [],
            'data_processing_summary': {},
            'consent_status': {},
            'retention_compliance': {},
            'security_measures': {}
        }
        
        # Buscar registros de processamento para este titular
        subject_records = [r for r in self.processing_records if r.data_subject_id == data_subject_id]
        
        # Validar consentimento
        consent_issues = await self._validate_consent_lgpd(subject_records)
        if consent_issues:
            compliance_report['violations'].extend(consent_issues)
            compliance_report['overall_status'] = ComplianceStatus.NON_COMPLIANT.value
        
        # Validar finalidade e base legal
        purpose_issues = await self._validate_processing_purpose(subject_records)
        if purpose_issues:
            compliance_report['violations'].extend(purpose_issues)
            compliance_report['overall_status'] = ComplianceStatus.NON_COMPLIANT.value
        
        # Validar retenção de dados
        retention_issues = await self._validate_data_retention(subject_records)
        if retention_issues:
            compliance_report['violations'].extend(retention_issues)
            if compliance_report['overall_status'] == ComplianceStatus.COMPLIANT.value:
                compliance_report['overall_status'] = ComplianceStatus.PARTIALLY_COMPLIANT.value
        
        # Validar medidas de segurança
        security_issues = await self._validate_security_measures_lgpd(data_subject_id)
        if security_issues:
            compliance_report['violations'].extend(security_issues)
            compliance_report['overall_status'] = ComplianceStatus.NON_COMPLIANT.value
        
        # Gerar resumo
        compliance_report['data_processing_summary'] = self._generate_processing_summary(subject_records)
        compliance_report['consent_status'] = self._generate_consent_summary(subject_records)
        compliance_report['retention_compliance'] = self._generate_retention_summary(subject_records)
        
        return compliance_report
    
    async def validate_hipaa_compliance(self, user_id: int) -> Dict[str, Any]:
        """Valida compliance com HIPAA"""
        compliance_report = {
            'user_id': user_id,
            'framework': ComplianceFramework.HIPAA.value,
            'timestamp': datetime.now().isoformat(),
            'overall_status': ComplianceStatus.COMPLIANT.value,
            'violations': [],
            'safeguards_compliance': {
                'administrative': {},
                'physical': {},
                'technical': {}
            }
        }
        
        # Validar salvaguardas administrativas
        admin_issues = await self._validate_administrative_safeguards(user_id)
        compliance_report['safeguards_compliance']['administrative'] = admin_issues
        
        # Validar salvaguardas técnicas
        tech_issues = await self._validate_technical_safeguards(user_id)
        compliance_report['safeguards_compliance']['technical'] = tech_issues
        
        # Validar princípio do mínimo necessário
        minimum_necessary_issues = await self._validate_minimum_necessary(user_id)
        if minimum_necessary_issues:
            compliance_report['violations'].extend(minimum_necessary_issues)
            compliance_report['overall_status'] = ComplianceStatus.NON_COMPLIANT.value
        
        return compliance_report
    
    async def handle_data_subject_request(self, data_subject_id: int, request_type: str,
                                        description: str) -> DataSubjectRequest:
        """Processa solicitação do titular dos dados"""
        request_id = hashlib.sha256(f"{data_subject_id}_{request_type}_{datetime.now().isoformat()}".encode()).hexdigest()[:16]
        
        # Calcular prazo de resposta (15 dias úteis para LGPD)
        response_deadline = datetime.now() + timedelta(days=15)
        
        request = DataSubjectRequest(
            request_id=request_id,
            timestamp=datetime.now(),
            data_subject_id=data_subject_id,
            request_type=request_type,
            description=description,
            status="pending",
            response_deadline=response_deadline
        )
        
        self.data_subject_requests.append(request)
        
        # Processar automaticamente alguns tipos de solicitação
        if request_type == "access":
            await self._process_data_access_request(request)
        elif request_type == "erasure":
            await self._process_data_erasure_request(request)
        elif request_type == "portability":
            await self._process_data_portability_request(request)
        
        # Registrar no audit log
        await self.audit_logger.log_event(
            EventType.COMPLIANCE,
            EventSeverity.INFO,
            None,
            f"Solicitação do titular dos dados: {request_type}",
            {
                'request_id': request_id,
                'data_subject_id': data_subject_id,
                'request_type': request_type,
                'deadline': response_deadline.isoformat()
            }
        )
        
        return request
    
    async def report_data_breach(self, description: str, affected_data_subjects: List[int],
                               data_categories: List[str], severity: str) -> ComplianceViolation:
        """Reporta violação de dados"""
        violation_id = hashlib.sha256(f"breach_{datetime.now().isoformat()}".encode()).hexdigest()[:16]
        
        violation = ComplianceViolation(
            violation_id=violation_id,
            timestamp=datetime.now(),
            framework=ComplianceFramework.LGPD,
            severity=severity,
            description=description,
            affected_data_subjects=affected_data_subjects,
            data_categories=data_categories,
            root_cause="Data breach",
            remediation_actions=[],
            status="open",
            notification_required=True
        )
        
        self.violations.append(violation)
        
        # Determinar se notificação à autoridade é necessária
        if severity in ['high', 'critical'] or len(affected_data_subjects) > 100:
            violation.authority_notified = False  # Deve ser notificado
            violation.data_subjects_notified = False  # Deve ser notificado
        
        # Registrar no audit log
        await self.audit_logger.log_event(
            EventType.SECURITY,
            EventSeverity.CRITICAL,
            None,
            f"Violação de dados reportada: {description}",
            {
                'violation_id': violation_id,
                'severity': severity,
                'affected_subjects': len(affected_data_subjects),
                'data_categories': data_categories
            }
        )
        
        return violation
    
    async def _validate_consent_lgpd(self, records: List[DataProcessingRecord]) -> List[str]:
        """Valida consentimento conforme LGPD"""
        issues = []
        
        for record in records:
            # Verificar se dados sensíveis têm consentimento
            if any(cat in ['health_data', 'biometric_data', 'genetic_data'] for cat in record.data_categories):
                if not record.consent_given:
                    issues.append(f"Dados sensíveis processados sem consentimento: {record.record_id}")
                
                # Verificar se consentimento não expirou
                if record.consent_date:
                    consent_age = (datetime.now() - record.consent_date).days
                    if consent_age > self.compliance_config['lgpd']['consent_renewal_days']:
                        issues.append(f"Consentimento expirado: {record.record_id}")
            
            # Verificar se consentimento foi retirado
            if record.consent_withdrawn and record.legal_basis == LegalBasis.CONSENT:
                issues.append(f"Processamento continua após retirada do consentimento: {record.record_id}")
        
        return issues
    
    async def _validate_processing_purpose(self, records: List[DataProcessingRecord]) -> List[str]:
        """Valida finalidade do processamento"""
        issues = []
        
        # Verificar se finalidade é específica e legítima
        purpose_counts = {}
        for record in records:
            purpose_counts[record.processing_purpose] = purpose_counts.get(record.processing_purpose, 0) + 1
        
        # Se há muitas finalidades diferentes, pode indicar uso inadequado
        if len(purpose_counts) > 5:
            issues.append("Muitas finalidades de processamento diferentes podem indicar uso inadequado")
        
        return issues
    
    async def _validate_data_retention(self, records: List[DataProcessingRecord]) -> List[str]:
        """Valida retenção de dados"""
        issues = []
        
        for record in records:
            # Verificar se período de retenção foi excedido
            data_age = (datetime.now() - record.timestamp).days
            if data_age > record.retention_period:
                issues.append(f"Período de retenção excedido: {record.record_id}")
        
        return issues
    
    async def _validate_security_measures_lgpd(self, data_subject_id: int) -> List[str]:
        """Valida medidas de segurança conforme LGPD"""
        issues = []
        
        required_measures = self.compliance_config['lgpd']['required_security_measures']
        
        # Verificar se usuário tem 2FA habilitado para dados sensíveis
        patient = self.db.query(Patient).filter(Patient.id == data_subject_id).first()
        if patient:
            # Verificar se profissionais que acessam dados têm 2FA
            # Esta verificação seria mais complexa na implementação real
            pass
        
        return issues
    
    async def _validate_administrative_safeguards(self, user_id: int) -> Dict[str, Any]:
        """Valida salvaguardas administrativas HIPAA"""
        safeguards = {
            'security_officer_assigned': True,  # Verificar se há oficial de segurança
            'workforce_training_completed': False,  # Verificar treinamento
            'access_management_implemented': True,  # Verificar controle de acesso
            'incident_procedures_defined': True  # Verificar procedimentos de incidente
        }
        
        # Verificar se usuário completou treinamento
        # Esta verificação seria implementada com base em registros de treinamento
        
        return safeguards
    
    async def _validate_technical_safeguards(self, user_id: int) -> Dict[str, Any]:
        """Valida salvaguardas técnicas HIPAA"""
        safeguards = {
            'access_control_implemented': True,
            'audit_controls_active': True,
            'integrity_measures_active': True,
            'transmission_security_enabled': True
        }
        
        # Verificar se usuário tem 2FA habilitado
        two_fa = self.db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user_id).first()
        if not two_fa or not two_fa.is_enabled:
            safeguards['access_control_implemented'] = False
        
        return safeguards
    
    async def _validate_minimum_necessary(self, user_id: int) -> List[str]:
        """Valida princípio do mínimo necessário HIPAA"""
        issues = []
        
        # Verificar se usuário acessa apenas dados necessários para sua função
        # Esta verificação seria baseada em logs de acesso e perfil do usuário
        
        return issues
    
    async def _process_data_access_request(self, request: DataSubjectRequest):
        """Processa solicitação de acesso aos dados"""
        try:
            # Buscar todos os dados do titular
            patient = self.db.query(Patient).filter(Patient.id == request.data_subject_id).first()
            
            if patient:
                # Compilar dados (mascarando informações sensíveis se necessário)
                data_export = {
                    'personal_data': {
                        'name': patient.name,
                        'birth_date': patient.birth_date.isoformat() if patient.birth_date else None,
                        'email': patient.email,
                        'phone': self.data_validator.mask_sensitive_data(patient.phone or '', 'phone'),
                        'address': patient.address
                    },
                    'processing_records': [
                        {
                            'purpose': r.processing_purpose.value,
                            'legal_basis': r.legal_basis.value,
                            'timestamp': r.timestamp.isoformat(),
                            'data_categories': r.data_categories
                        }
                        for r in self.processing_records if r.data_subject_id == request.data_subject_id
                    ]
                }
                
                request.response_data = data_export
                request.status = "completed"
                request.response_date = datetime.now()
        
        except Exception as e:
            request.status = "rejected"
            request.rejection_reason = f"Erro ao processar solicitação: {str(e)}"
    
    async def _process_data_erasure_request(self, request: DataSubjectRequest):
        """Processa solicitação de apagamento de dados"""
        try:
            # Verificar se há base legal para manter os dados
            subject_records = [r for r in self.processing_records if r.data_subject_id == request.data_subject_id]
            
            can_erase = True
            for record in subject_records:
                if record.legal_basis in [LegalBasis.LEGAL_OBLIGATION, LegalBasis.VITAL_INTERESTS]:
                    can_erase = False
                    break
            
            if can_erase:
                # Marcar dados para apagamento (não apagar imediatamente por segurança)
                request.status = "completed"
                request.response_date = datetime.now()
                request.response_data = {'action': 'data_marked_for_erasure'}
            else:
                request.status = "rejected"
                request.rejection_reason = "Dados não podem ser apagados devido a obrigações legais"
        
        except Exception as e:
            request.status = "rejected"
            request.rejection_reason = f"Erro ao processar solicitação: {str(e)}"
    
    async def _process_data_portability_request(self, request: DataSubjectRequest):
        """Processa solicitação de portabilidade de dados"""
        try:
            # Exportar dados em formato estruturado
            patient = self.db.query(Patient).filter(Patient.id == request.data_subject_id).first()
            
            if patient:
                portable_data = {
                    'format': 'JSON',
                    'data': {
                        'personal_information': {
                            'name': patient.name,
                            'birth_date': patient.birth_date.isoformat() if patient.birth_date else None,
                            'email': patient.email,
                            'phone': patient.phone,
                            'address': patient.address
                        },
                        'medical_records': [],  # Seria preenchido com dados médicos
                        'export_date': datetime.now().isoformat()
                    }
                }
                
                request.response_data = portable_data
                request.status = "completed"
                request.response_date = datetime.now()
        
        except Exception as e:
            request.status = "rejected"
            request.rejection_reason = f"Erro ao processar solicitação: {str(e)}"
    
    def _generate_processing_summary(self, records: List[DataProcessingRecord]) -> Dict[str, Any]:
        """Gera resumo do processamento de dados"""
        summary = {
            'total_records': len(records),
            'purposes': {},
            'legal_bases': {},
            'data_categories': set(),
            'consent_rate': 0.0
        }
        
        consent_count = 0
        for record in records:
            # Contar finalidades
            purpose = record.processing_purpose.value
            summary['purposes'][purpose] = summary['purposes'].get(purpose, 0) + 1
            
            # Contar bases legais
            basis = record.legal_basis.value
            summary['legal_bases'][basis] = summary['legal_bases'].get(basis, 0) + 1
            
            # Coletar categorias de dados
            summary['data_categories'].update(record.data_categories)
            
            # Contar consentimentos
            if record.consent_given:
                consent_count += 1
        
        summary['data_categories'] = list(summary['data_categories'])
        summary['consent_rate'] = (consent_count / len(records) * 100) if records else 0
        
        return summary
    
    def _generate_consent_summary(self, records: List[DataProcessingRecord]) -> Dict[str, Any]:
        """Gera resumo do consentimento"""
        summary = {
            'total_consents': 0,
            'active_consents': 0,
            'withdrawn_consents': 0,
            'expired_consents': 0
        }
        
        for record in records:
            if record.consent_given:
                summary['total_consents'] += 1
                
                if record.consent_withdrawn:
                    summary['withdrawn_consents'] += 1
                elif record.consent_date:
                    consent_age = (datetime.now() - record.consent_date).days
                    if consent_age > self.compliance_config['lgpd']['consent_renewal_days']:
                        summary['expired_consents'] += 1
                    else:
                        summary['active_consents'] += 1
        
        return summary
    
    def _generate_retention_summary(self, records: List[DataProcessingRecord]) -> Dict[str, Any]:
        """Gera resumo da retenção de dados"""
        summary = {
            'total_records': len(records),
            'within_retention': 0,
            'exceeding_retention': 0,
            'average_age_days': 0
        }
        
        total_age = 0
        for record in records:
            age_days = (datetime.now() - record.timestamp).days
            total_age += age_days
            
            if age_days <= record.retention_period:
                summary['within_retention'] += 1
            else:
                summary['exceeding_retention'] += 1
        
        summary['average_age_days'] = total_age / len(records) if records else 0
        
        return summary
    
    def get_compliance_dashboard(self) -> Dict[str, Any]:
        """Retorna dashboard de compliance"""
        return {
            'timestamp': datetime.now().isoformat(),
            'processing_records': {
                'total': len(self.processing_records),
                'last_30_days': len([
                    r for r in self.processing_records 
                    if (datetime.now() - r.timestamp).days <= 30
                ])
            },
            'violations': {
                'total': len(self.violations),
                'open': len([v for v in self.violations if v.status == 'open']),
                'critical': len([v for v in self.violations if v.severity == 'critical'])
            },
            'data_subject_requests': {
                'total': len(self.data_subject_requests),
                'pending': len([r for r in self.data_subject_requests if r.status == 'pending']),
                'overdue': len([
                    r for r in self.data_subject_requests 
                    if r.status == 'pending' and datetime.now() > r.response_deadline
                ])
            },
            'frameworks': {
                'lgpd': {'status': 'active', 'last_assessment': None},
                'hipaa': {'status': 'active', 'last_assessment': None}
            }
        }
    
    async def generate_compliance_report(self, framework: ComplianceFramework, 
                                       start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Gera relatório de compliance"""
        report = {
            'framework': framework.value,
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'generated_at': datetime.now().isoformat(),
            'summary': {},
            'violations': [],
            'recommendations': []
        }
        
        # Filtrar dados do período
        period_records = [
            r for r in self.processing_records 
            if start_date <= r.timestamp <= end_date
        ]
        
        period_violations = [
            v for v in self.violations 
            if start_date <= v.timestamp <= end_date and v.framework == framework
        ]
        
        # Gerar resumo
        report['summary'] = {
            'processing_records': len(period_records),
            'violations': len(period_violations),
            'compliance_score': self._calculate_compliance_score(framework, period_records, period_violations)
        }
        
        # Incluir violações
        report['violations'] = [
            {
                'id': v.violation_id,
                'timestamp': v.timestamp.isoformat(),
                'severity': v.severity,
                'description': v.description,
                'status': v.status
            }
            for v in period_violations
        ]
        
        # Gerar recomendações
        report['recommendations'] = self._generate_compliance_recommendations(framework, period_records, period_violations)
        
        return report
    
    def _calculate_compliance_score(self, framework: ComplianceFramework, 
                                  records: List[DataProcessingRecord], 
                                  violations: List[ComplianceViolation]) -> float:
        """Calcula score de compliance (0-100)"""
        if not records:
            return 100.0
        
        # Score base
        base_score = 100.0
        
        # Penalizar por violações
        for violation in violations:
            if violation.severity == 'critical':
                base_score -= 20
            elif violation.severity == 'high':
                base_score -= 10
            elif violation.severity == 'medium':
                base_score -= 5
            else:
                base_score -= 2
        
        # Penalizar por falta de consentimento (para dados sensíveis)
        sensitive_without_consent = 0
        for record in records:
            if any(cat in ['health_data', 'biometric_data'] for cat in record.data_categories):
                if not record.consent_given:
                    sensitive_without_consent += 1
        
        if sensitive_without_consent > 0:
            base_score -= (sensitive_without_consent / len(records)) * 30
        
        return max(0.0, min(100.0, base_score))
    
    def _generate_compliance_recommendations(self, framework: ComplianceFramework,
                                           records: List[DataProcessingRecord],
                                           violations: List[ComplianceViolation]) -> List[str]:
        """Gera recomendações de compliance"""
        recommendations = []
        
        if framework == ComplianceFramework.LGPD:
            # Verificar consentimento
            consent_issues = sum(1 for r in records if not r.consent_given and 
                               any(cat in ['health_data', 'biometric_data'] for cat in r.data_categories))
            
            if consent_issues > 0:
                recommendations.append(f"Obter consentimento para {consent_issues} registros de dados sensíveis")
            
            # Verificar retenção
            retention_issues = sum(1 for r in records if 
                                 (datetime.now() - r.timestamp).days > r.retention_period)
            
            if retention_issues > 0:
                recommendations.append(f"Revisar política de retenção para {retention_issues} registros")
        
        elif framework == ComplianceFramework.HIPAA:
            recommendations.append("Implementar treinamento regular de segurança para todos os usuários")
            recommendations.append("Revisar controles de acesso baseados no princípio do mínimo necessário")
        
        # Recomendações baseadas em violações
        if violations:
            recommendations.append("Implementar monitoramento proativo para detectar violações")
            recommendations.append("Desenvolver plano de resposta a incidentes")
        
        return recommendations

# Função utilitária para criar instância do gerenciador
def create_compliance_manager(db: Session, audit_logger: AuditLogger) -> ComplianceManager:
    """Cria instância do gerenciador de compliance"""
    return ComplianceManager(db, audit_logger)