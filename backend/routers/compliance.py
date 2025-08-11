#!/usr/bin/env python3
"""
DataClínica - Endpoints de Compliance e Conformidade

Este módulo define os endpoints da API para gerenciamento de compliance
com LGPD, HIPAA e outras regulamentações.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from ..database import get_db
from ..auth import get_current_user, require_admin
from ..models import User
from ..encryption import field_encryption
from ..compliance_manager import (
    ComplianceManager, create_compliance_manager,
    ComplianceFramework, ComplianceStatus, DataProcessingPurpose,
    LegalBasis, DataProcessingRecord, ComplianceViolation, DataSubjectRequest
)
from ..audit_logger import AuditLogger, create_audit_logger

router = APIRouter(prefix="/compliance", tags=["compliance"])
security = HTTPBearer()

# Schemas Pydantic
class DataProcessingRecordCreate(BaseModel):
    """Schema para criar registro de processamento"""
    data_subject_id: int = Field(..., description="ID do titular dos dados")
    data_type: str = Field(..., description="Tipo de dados processados")
    purpose: DataProcessingPurpose = Field(..., description="Finalidade do processamento")
    legal_basis: LegalBasis = Field(..., description="Base legal")
    data_categories: List[str] = Field(..., description="Categorias de dados")
    consent_given: bool = Field(False, description="Consentimento fornecido")

class DataProcessingRecordResponse(BaseModel):
    """Schema de resposta para registro de processamento"""
    record_id: str
    timestamp: datetime
    user_id: Optional[int]
    data_subject_id: int
    data_type: str
    processing_purpose: str
    legal_basis: str
    data_categories: List[str]
    retention_period: int
    consent_given: bool
    consent_date: Optional[datetime]
    consent_withdrawn: bool

class ComplianceValidationRequest(BaseModel):
    """Schema para solicitação de validação de compliance"""
    framework: ComplianceFramework = Field(..., description="Framework de compliance")
    subject_id: Optional[int] = Field(None, description="ID do titular (para LGPD)")
    user_id: Optional[int] = Field(None, description="ID do usuário (para HIPAA)")

class ComplianceReportResponse(BaseModel):
    """Schema de resposta para relatório de compliance"""
    framework: str
    timestamp: str
    overall_status: str
    violations: List[Dict[str, Any]]
    recommendations: List[str]
    summary: Dict[str, Any]

class DataSubjectRequestCreate(BaseModel):
    """Schema para criar solicitação do titular"""
    data_subject_id: int = Field(..., description="ID do titular dos dados")
    request_type: str = Field(..., description="Tipo de solicitação", 
                             regex="^(access|rectification|erasure|portability|restriction|objection)$")
    description: str = Field(..., description="Descrição da solicitação")

class DataSubjectRequestResponse(BaseModel):
    """Schema de resposta para solicitação do titular"""
    request_id: str
    timestamp: datetime
    data_subject_id: int
    request_type: str
    description: str
    status: str
    response_deadline: datetime
    response_date: Optional[datetime]
    response_data: Optional[Dict[str, Any]]
    rejection_reason: Optional[str]

class DataBreachReport(BaseModel):
    """Schema para reportar violação de dados"""
    description: str = Field(..., description="Descrição da violação")
    affected_data_subjects: List[int] = Field(..., description="IDs dos titulares afetados")
    data_categories: List[str] = Field(..., description="Categorias de dados afetadas")
    severity: str = Field(..., description="Severidade", regex="^(low|medium|high|critical)$")
    root_cause: Optional[str] = Field(None, description="Causa raiz")
    remediation_actions: List[str] = Field(default_factory=list, description="Ações de remediação")

class ComplianceViolationResponse(BaseModel):
    """Schema de resposta para violação de compliance"""
    violation_id: str
    timestamp: datetime
    framework: str
    severity: str
    description: str
    affected_data_subjects: List[int]
    data_categories: List[str]
    root_cause: str
    remediation_actions: List[str]
    status: str
    notification_required: bool
    authority_notified: bool
    data_subjects_notified: bool

class ComplianceDashboardResponse(BaseModel):
    """Schema de resposta para dashboard de compliance"""
    timestamp: str
    processing_records: Dict[str, int]
    violations: Dict[str, int]
    data_subject_requests: Dict[str, int]
    frameworks: Dict[str, Dict[str, Any]]

class ComplianceReportRequest(BaseModel):
    """Schema para solicitação de relatório"""
    framework: ComplianceFramework = Field(..., description="Framework de compliance")
    start_date: datetime = Field(..., description="Data de início")
    end_date: datetime = Field(..., description="Data de fim")

# Dependências
async def get_compliance_manager(db: Session = Depends(get_db)) -> ComplianceManager:
    """Obtém instância do gerenciador de compliance"""
    audit_logger = create_audit_logger(db)
    return create_compliance_manager(db, audit_logger)

# Endpoints
@router.post("/processing-records", response_model=DataProcessingRecordResponse)
async def create_processing_record(
    record_data: DataProcessingRecordCreate,
    current_user: User = Depends(get_current_user),
    compliance_manager: ComplianceManager = Depends(get_compliance_manager)
):
    """Cria registro de processamento de dados"""
    try:
        record = await compliance_manager.record_data_processing(
            user_id=current_user.id,
            data_subject_id=record_data.data_subject_id,
            data_type=record_data.data_type,
            purpose=record_data.purpose,
            legal_basis=record_data.legal_basis,
            data_categories=record_data.data_categories,
            consent_given=record_data.consent_given
        )
        
        return DataProcessingRecordResponse(
            record_id=record.record_id,
            timestamp=record.timestamp,
            user_id=record.user_id,
            data_subject_id=record.data_subject_id,
            data_type=record.data_type,
            processing_purpose=record.processing_purpose.value,
            legal_basis=record.legal_basis.value,
            data_categories=record.data_categories,
            retention_period=record.retention_period,
            consent_given=record.consent_given,
            consent_date=record.consent_date,
            consent_withdrawn=record.consent_withdrawn
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar registro de processamento: {str(e)}"
        )

@router.post("/validate", response_model=ComplianceReportResponse)
async def validate_compliance(
    validation_request: ComplianceValidationRequest,
    current_user: User = Depends(get_current_user),
    compliance_manager: ComplianceManager = Depends(get_compliance_manager)
):
    """Valida compliance com framework específico"""
    try:
        if validation_request.framework == ComplianceFramework.LGPD:
            if not validation_request.subject_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="subject_id é obrigatório para validação LGPD"
                )
            
            report = await compliance_manager.validate_lgpd_compliance(
                validation_request.subject_id
            )
        
        elif validation_request.framework == ComplianceFramework.HIPAA:
            user_id = validation_request.user_id or current_user.id
            report = await compliance_manager.validate_hipaa_compliance(user_id)
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Framework {validation_request.framework.value} não suportado"
            )
        
        return ComplianceReportResponse(
            framework=report['framework'],
            timestamp=report['timestamp'],
            overall_status=report['overall_status'],
            violations=report['violations'],
            recommendations=report.get('recommendations', []),
            summary=report.get('data_processing_summary', {})
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao validar compliance: {str(e)}"
        )

@router.post("/data-subject-requests", response_model=DataSubjectRequestResponse)
async def create_data_subject_request(
    request_data: DataSubjectRequestCreate,
    current_user: User = Depends(get_current_user),
    compliance_manager: ComplianceManager = Depends(get_compliance_manager)
):
    """Cria solicitação do titular dos dados"""
    try:
        request = await compliance_manager.handle_data_subject_request(
            data_subject_id=request_data.data_subject_id,
            request_type=request_data.request_type,
            description=request_data.description
        )
        
        return DataSubjectRequestResponse(
            request_id=request.request_id,
            timestamp=request.timestamp,
            data_subject_id=request.data_subject_id,
            request_type=request.request_type,
            description=request.description,
            status=request.status,
            response_deadline=request.response_deadline,
            response_date=request.response_date,
            response_data=request.response_data,
            rejection_reason=request.rejection_reason
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar solicitação do titular: {str(e)}"
        )

@router.get("/data-subject-requests", response_model=List[DataSubjectRequestResponse])
async def list_data_subject_requests(
    data_subject_id: Optional[int] = Query(None, description="Filtrar por titular"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    request_type: Optional[str] = Query(None, description="Filtrar por tipo"),
    limit: int = Query(50, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: User = Depends(require_admin),
    compliance_manager: ComplianceManager = Depends(get_compliance_manager)
):
    """Lista solicitações do titular dos dados (apenas admin)"""
    try:
        # Filtrar solicitações
        requests = compliance_manager.data_subject_requests
        
        if data_subject_id:
            requests = [r for r in requests if r.data_subject_id == data_subject_id]
        
        if status:
            requests = [r for r in requests if r.status == status]
        
        if request_type:
            requests = [r for r in requests if r.request_type == request_type]
        
        # Aplicar paginação
        requests = requests[offset:offset + limit]
        
        return [
            DataSubjectRequestResponse(
                request_id=request.request_id,
                timestamp=request.timestamp,
                data_subject_id=request.data_subject_id,
                request_type=request.request_type,
                description=request.description,
                status=request.status,
                response_deadline=request.response_deadline,
                response_date=request.response_date,
                response_data=request.response_data,
                rejection_reason=request.rejection_reason
            )
            for request in requests
        ]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar solicitações: {str(e)}"
        )

@router.post("/data-breach", response_model=ComplianceViolationResponse)
async def report_data_breach(
    breach_data: DataBreachReport,
    current_user: User = Depends(require_admin),
    compliance_manager: ComplianceManager = Depends(get_compliance_manager)
):
    """Reporta violação de dados (apenas admin)"""
    try:
        violation = await compliance_manager.report_data_breach(
            description=breach_data.description,
            affected_data_subjects=breach_data.affected_data_subjects,
            data_categories=breach_data.data_categories,
            severity=breach_data.severity
        )
        
        return ComplianceViolationResponse(
            violation_id=violation.violation_id,
            timestamp=violation.timestamp,
            framework=violation.framework.value,
            severity=violation.severity,
            description=violation.description,
            affected_data_subjects=violation.affected_data_subjects,
            data_categories=violation.data_categories,
            root_cause=violation.root_cause,
            remediation_actions=violation.remediation_actions,
            status=violation.status,
            notification_required=violation.notification_required,
            authority_notified=violation.authority_notified,
            data_subjects_notified=violation.data_subjects_notified
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao reportar violação: {str(e)}"
        )

@router.get("/violations", response_model=List[ComplianceViolationResponse])
async def list_violations(
    framework: Optional[ComplianceFramework] = Query(None, description="Filtrar por framework"),
    severity: Optional[str] = Query(None, description="Filtrar por severidade"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    limit: int = Query(50, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: User = Depends(require_admin),
    compliance_manager: ComplianceManager = Depends(get_compliance_manager)
):
    """Lista violações de compliance (apenas admin)"""
    try:
        # Filtrar violações
        violations = compliance_manager.violations
        
        if framework:
            violations = [v for v in violations if v.framework == framework]
        
        if severity:
            violations = [v for v in violations if v.severity == severity]
        
        if status:
            violations = [v for v in violations if v.status == status]
        
        # Aplicar paginação
        violations = violations[offset:offset + limit]
        
        return [
            ComplianceViolationResponse(
                violation_id=violation.violation_id,
                timestamp=violation.timestamp,
                framework=violation.framework.value,
                severity=violation.severity,
                description=violation.description,
                affected_data_subjects=violation.affected_data_subjects,
                data_categories=violation.data_categories,
                root_cause=violation.root_cause,
                remediation_actions=violation.remediation_actions,
                status=violation.status,
                notification_required=violation.notification_required,
                authority_notified=violation.authority_notified,
                data_subjects_notified=violation.data_subjects_notified
            )
            for violation in violations
        ]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar violações: {str(e)}"
        )

@router.get("/dashboard", response_model=ComplianceDashboardResponse)
async def get_compliance_dashboard(
    current_user: User = Depends(require_admin),
    compliance_manager: ComplianceManager = Depends(get_compliance_manager)
):
    """Obtém dashboard de compliance (apenas admin)"""
    try:
        dashboard_data = compliance_manager.get_compliance_dashboard()
        
        return ComplianceDashboardResponse(
            timestamp=dashboard_data['timestamp'],
            processing_records=dashboard_data['processing_records'],
            violations=dashboard_data['violations'],
            data_subject_requests=dashboard_data['data_subject_requests'],
            frameworks=dashboard_data['frameworks']
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter dashboard: {str(e)}"
        )

@router.post("/reports", response_model=Dict[str, Any])
async def generate_compliance_report(
    report_request: ComplianceReportRequest,
    current_user: User = Depends(require_admin),
    compliance_manager: ComplianceManager = Depends(get_compliance_manager)
):
    """Gera relatório de compliance (apenas admin)"""
    try:
        # Validar período
        if report_request.end_date <= report_request.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data de fim deve ser posterior à data de início"
            )
        
        # Limitar período máximo (1 ano)
        max_period = timedelta(days=365)
        if report_request.end_date - report_request.start_date > max_period:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Período máximo do relatório é de 1 ano"
            )
        
        report = await compliance_manager.generate_compliance_report(
            framework=report_request.framework,
            start_date=report_request.start_date,
            end_date=report_request.end_date
        )
        
        return report
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar relatório: {str(e)}"
        )

@router.get("/frameworks", response_model=List[Dict[str, str]])
async def list_compliance_frameworks(
    current_user: User = Depends(get_current_user)
):
    """Lista frameworks de compliance disponíveis"""
    return [
        {
            'code': framework.value,
            'name': {
                'lgpd': 'Lei Geral de Proteção de Dados (LGPD)',
                'hipaa': 'Health Insurance Portability and Accountability Act (HIPAA)',
                'gdpr': 'General Data Protection Regulation (GDPR)',
                'iso27001': 'ISO/IEC 27001',
                'soc2': 'SOC 2 Type II',
                'pci_dss': 'Payment Card Industry Data Security Standard (PCI DSS)'
            }.get(framework.value, framework.value),
            'description': {
                'lgpd': 'Regulamentação brasileira de proteção de dados pessoais',
                'hipaa': 'Regulamentação americana para proteção de informações de saúde',
                'gdpr': 'Regulamentação europeia de proteção de dados',
                'iso27001': 'Padrão internacional de gestão de segurança da informação',
                'soc2': 'Framework de auditoria para controles de segurança',
                'pci_dss': 'Padrão de segurança para dados de cartão de pagamento'
            }.get(framework.value, '')
        }
        for framework in ComplianceFramework
    ]

@router.get("/processing-purposes", response_model=List[Dict[str, str]])
async def list_processing_purposes(
    current_user: User = Depends(get_current_user)
):
    """Lista finalidades de processamento disponíveis"""
    return [
        {
            'code': purpose.value,
            'name': {
                'medical_care': 'Cuidados Médicos',
                'administrative': 'Administrativo',
                'billing': 'Faturamento',
                'research': 'Pesquisa',
                'marketing': 'Marketing',
                'legal_compliance': 'Cumprimento Legal',
                'security': 'Segurança'
            }.get(purpose.value, purpose.value),
            'description': {
                'medical_care': 'Processamento para prestação de cuidados médicos',
                'administrative': 'Processamento para fins administrativos',
                'billing': 'Processamento para cobrança e faturamento',
                'research': 'Processamento para pesquisa médica ou científica',
                'marketing': 'Processamento para atividades de marketing',
                'legal_compliance': 'Processamento para cumprimento de obrigações legais',
                'security': 'Processamento para fins de segurança'
            }.get(purpose.value, '')
        }
        for purpose in DataProcessingPurpose
    ]

@router.get("/legal-bases", response_model=List[Dict[str, str]])
async def list_legal_bases(
    current_user: User = Depends(get_current_user)
):
    """Lista bases legais disponíveis"""
    return [
        {
            'code': basis.value,
            'name': {
                'consent': 'Consentimento',
                'contract': 'Execução de Contrato',
                'legal_obligation': 'Obrigação Legal',
                'vital_interests': 'Proteção da Vida',
                'public_task': 'Exercício Regular de Direitos',
                'legitimate_interests': 'Interesse Legítimo'
            }.get(basis.value, basis.value),
            'description': {
                'consent': 'Consentimento livre, informado e inequívoco do titular',
                'contract': 'Necessário para execução de contrato',
                'legal_obligation': 'Cumprimento de obrigação legal ou regulatória',
                'vital_interests': 'Proteção da vida ou incolumidade física',
                'public_task': 'Exercício regular de direitos em processo judicial, administrativo ou arbitral',
                'legitimate_interests': 'Interesse legítimo do controlador ou terceiro'
            }.get(basis.value, '')
        }
        for basis in LegalBasis
    ]

@router.put("/violations/{violation_id}/status")
async def update_violation_status(
    violation_id: str,
    new_status: str = Query(..., regex="^(open|in_progress|resolved)$"),
    remediation_actions: Optional[List[str]] = None,
    current_user: User = Depends(require_admin),
    compliance_manager: ComplianceManager = Depends(get_compliance_manager)
):
    """Atualiza status de violação (apenas admin)"""
    try:
        # Buscar violação
        violation = None
        for v in compliance_manager.violations:
            if v.violation_id == violation_id:
                violation = v
                break
        
        if not violation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Violação não encontrada"
            )
        
        # Atualizar status
        violation.status = new_status
        
        if new_status == "resolved":
            violation.resolution_date = datetime.now()
        
        if remediation_actions:
            violation.remediation_actions.extend(remediation_actions)
        
        return {"message": "Status da violação atualizado com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar violação: {str(e)}"
        )

@router.get("/statistics", response_model=Dict[str, Any])
async def get_compliance_statistics(
    framework: Optional[ComplianceFramework] = Query(None, description="Filtrar por framework"),
    days: int = Query(30, ge=1, le=365, description="Período em dias"),
    current_user: User = Depends(require_admin),
    compliance_manager: ComplianceManager = Depends(get_compliance_manager)
):
    """Obtém estatísticas de compliance (apenas admin)"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Filtrar dados do período
        period_records = [
            r for r in compliance_manager.processing_records
            if start_date <= r.timestamp <= end_date
        ]
        
        period_violations = [
            v for v in compliance_manager.violations
            if start_date <= v.timestamp <= end_date
        ]
        
        if framework:
            period_violations = [v for v in period_violations if v.framework == framework]
        
        period_requests = [
            r for r in compliance_manager.data_subject_requests
            if start_date <= r.timestamp <= end_date
        ]
        
        # Calcular estatísticas
        statistics = {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            },
            'processing_records': {
                'total': len(period_records),
                'with_consent': len([r for r in period_records if r.consent_given]),
                'by_purpose': {},
                'by_legal_basis': {}
            },
            'violations': {
                'total': len(period_violations),
                'by_severity': {},
                'by_status': {},
                'resolved': len([v for v in period_violations if v.status == 'resolved'])
            },
            'data_subject_requests': {
                'total': len(period_requests),
                'by_type': {},
                'by_status': {},
                'overdue': len([
                    r for r in period_requests
                    if r.status == 'pending' and datetime.now() > r.response_deadline
                ])
            }
        }
        
        # Agrupar por finalidade
        for record in period_records:
            purpose = record.processing_purpose.value
            statistics['processing_records']['by_purpose'][purpose] = \
                statistics['processing_records']['by_purpose'].get(purpose, 0) + 1
            
            basis = record.legal_basis.value
            statistics['processing_records']['by_legal_basis'][basis] = \
                statistics['processing_records']['by_legal_basis'].get(basis, 0) + 1
        
        # Agrupar violações por severidade e status
        for violation in period_violations:
            severity = violation.severity
            statistics['violations']['by_severity'][severity] = \
                statistics['violations']['by_severity'].get(severity, 0) + 1
            
            status_val = violation.status
            statistics['violations']['by_status'][status_val] = \
                statistics['violations']['by_status'].get(status_val, 0) + 1
        
        # Agrupar solicitações por tipo e status
        for request in period_requests:
            req_type = request.request_type
            statistics['data_subject_requests']['by_type'][req_type] = \
                statistics['data_subject_requests']['by_type'].get(req_type, 0) + 1
            
            req_status = request.status
            statistics['data_subject_requests']['by_status'][req_status] = \
                statistics['data_subject_requests']['by_status'].get(req_status, 0) + 1
        
        return statistics
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter estatísticas: {str(e)}"
        )