from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal

from database import get_db
from models import (
    PatientAdmission, BedTransfer, DailyRateConfig, DailyRateTier, 
    AdmissionBilling, BillingItem, Bed, Room, Department, Patient
)
from schemas import (
    PatientAdmissionCreate, PatientAdmissionUpdate, PatientAdmission as PatientAdmissionSchema,
    BedTransferCreate, BedTransfer as BedTransferSchema,
    DailyRateConfigCreate, DailyRateConfigUpdate, DailyRateConfig as DailyRateConfigSchema,
    DailyRateTierCreate, DailyRateTierUpdate, DailyRateTier as DailyRateTierSchema,
    AdmissionBillingCreate, AdmissionBillingUpdate, AdmissionBilling as AdmissionBillingSchema,
    BillingItemCreate, BillingItem as BillingItemSchema
)
from auth import get_current_user
from models import User
from encryption import field_encryption

router = APIRouter(prefix="/hospitalization", tags=["Hospitalization"])

# Patient Admission endpoints
@router.post("/admissions/", response_model=PatientAdmissionSchema)
def create_admission(
    admission: PatientAdmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar uma nova internação"""
    # Verificar se o paciente existe e pertence à clínica
    patient = db.query(Patient).filter(
        Patient.id == admission.patient_id,
        Patient.clinic_id == current_user.clinic_id
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado"
        )
    
    # Verificar se o leito existe e está disponível
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    room_subquery = db.query(Room.id).filter(
        Room.department_id.in_(dept_subquery)
    ).subquery()
    
    bed = db.query(Bed).filter(
        Bed.id == admission.bed_id,
        Bed.room_id.in_(room_subquery),
        Bed.status == "available"
    ).first()
    
    if not bed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Leito não encontrado ou não disponível"
        )
    
    # Verificar se o paciente já tem internação ativa
    active_admission = db.query(PatientAdmission).filter(
        PatientAdmission.patient_id == admission.patient_id,
        PatientAdmission.status == "active"
    ).first()
    
    if active_admission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paciente já possui internação ativa"
        )
    
    # Apply encryption to sensitive fields
    admission_data = field_encryption.encrypt_model_data(admission.dict(), "PatientAdmission")
    
    db_admission = PatientAdmission(
        **admission_data,
        status="active",
        admitted_by=current_user.id
    )
    db.add(db_admission)
    
    # Atualizar status do leito
    bed.status = "occupied"
    bed.current_patient_id = admission.patient_id
    bed.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_admission)
    return db_admission

@router.get("/admissions/", response_model=List[PatientAdmissionSchema])
def get_admissions(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    department_id: Optional[int] = None,
    admission_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar internações"""
    # Subquery para obter apenas pacientes da clínica do usuário
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    query = db.query(PatientAdmission).filter(
        PatientAdmission.patient_id.in_(patient_subquery)
    )
    
    if patient_id:
        query = query.filter(PatientAdmission.patient_id == patient_id)
    if status:
        query = query.filter(PatientAdmission.status == status)
    if admission_type:
        query = query.filter(PatientAdmission.admission_type == admission_type)
    if start_date:
        query = query.filter(PatientAdmission.admission_date >= start_date)
    if end_date:
        query = query.filter(PatientAdmission.admission_date <= end_date)
    
    if department_id:
        # Filtrar por departamento através dos leitos
        dept_rooms = db.query(Room.id).filter(
            Room.department_id == department_id
        ).subquery()
        dept_beds = db.query(Bed.id).filter(
            Bed.room_id.in_(dept_rooms)
        ).subquery()
        query = query.filter(PatientAdmission.bed_id.in_(dept_beds))
    
    return query.order_by(PatientAdmission.admission_date.desc()).offset(skip).limit(limit).all()

@router.get("/admissions/{admission_id}", response_model=PatientAdmissionSchema)
def get_admission(
    admission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de uma internação"""
    # Subquery para obter apenas pacientes da clínica do usuário
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    admission = db.query(PatientAdmission).filter(
        PatientAdmission.id == admission_id,
        PatientAdmission.patient_id.in_(patient_subquery)
    ).first()
    
    if not admission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Internação não encontrada"
        )
    
    return admission

@router.put("/admissions/{admission_id}", response_model=PatientAdmissionSchema)
def update_admission(
    admission_id: int,
    admission_update: PatientAdmissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar dados de uma internação"""
    # Subquery para obter apenas pacientes da clínica do usuário
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    admission = db.query(PatientAdmission).filter(
        PatientAdmission.id == admission_id,
        PatientAdmission.patient_id.in_(patient_subquery)
    ).first()
    
    if not admission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Internação não encontrada"
        )
    
    update_data = admission_update.dict(exclude_unset=True)
    
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "PatientAdmission")
    for field, value in encrypted_data.items():
        setattr(admission, field, value)
    
    admission.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(admission)
    return admission

@router.post("/admissions/{admission_id}/discharge")
def discharge_patient(
    admission_id: int,
    discharge_reason: str,
    discharge_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dar alta a um paciente"""
    # Subquery para obter apenas pacientes da clínica do usuário
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    admission = db.query(PatientAdmission).filter(
        PatientAdmission.id == admission_id,
        PatientAdmission.patient_id.in_(patient_subquery),
        PatientAdmission.status == "active"
    ).first()
    
    if not admission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Internação ativa não encontrada"
        )
    
    # Atualizar internação
    admission.status = "discharged"
    admission.discharge_date = datetime.utcnow()
    admission.discharge_reason = discharge_reason
    admission.discharge_notes = discharge_notes
    admission.discharged_by = current_user.id
    admission.updated_at = datetime.utcnow()
    
    # Liberar leito
    bed = db.query(Bed).filter(Bed.id == admission.bed_id).first()
    if bed:
        bed.status = "available"
        bed.current_patient_id = None
        bed.updated_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Paciente recebeu alta com sucesso"}

# Bed Transfer endpoints
@router.post("/transfers/", response_model=BedTransferSchema)
def create_bed_transfer(
    transfer: BedTransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar uma transferência de leito"""
    # Verificar se a internação existe e está ativa
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    admission = db.query(PatientAdmission).filter(
        PatientAdmission.id == transfer.admission_id,
        PatientAdmission.patient_id.in_(patient_subquery),
        PatientAdmission.status == "active"
    ).first()
    
    if not admission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Internação ativa não encontrada"
        )
    
    # Verificar se o novo leito existe e está disponível
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    room_subquery = db.query(Room.id).filter(
        Room.department_id.in_(dept_subquery)
    ).subquery()
    
    new_bed = db.query(Bed).filter(
        Bed.id == transfer.new_bed_id,
        Bed.room_id.in_(room_subquery),
        Bed.status == "available"
    ).first()
    
    if not new_bed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Novo leito não encontrado ou não disponível"
        )
    
    # Obter leito atual
    current_bed = db.query(Bed).filter(Bed.id == admission.bed_id).first()
    
    # Apply encryption to sensitive fields
    transfer_data = field_encryption.encrypt_model_data(transfer.dict(), "BedTransfer")
    
    db_transfer = BedTransfer(
        **transfer_data,
        previous_bed_id=admission.bed_id,
        transferred_by=current_user.id
    )
    db.add(db_transfer)
    
    # Atualizar internação com novo leito
    admission.bed_id = transfer.new_bed_id
    admission.updated_at = datetime.utcnow()
    
    # Liberar leito anterior
    if current_bed:
        current_bed.status = "available"
        current_bed.current_patient_id = None
        current_bed.updated_at = datetime.utcnow()
    
    # Ocupar novo leito
    new_bed.status = "occupied"
    new_bed.current_patient_id = admission.patient_id
    new_bed.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_transfer)
    return db_transfer

@router.get("/transfers/", response_model=List[BedTransferSchema])
def get_bed_transfers(
    skip: int = 0,
    limit: int = 100,
    admission_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar transferências de leito"""
    # Subquery para obter apenas pacientes da clínica do usuário
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas internações da clínica do usuário
    admission_subquery = db.query(PatientAdmission.id).filter(
        PatientAdmission.patient_id.in_(patient_subquery)
    ).subquery()
    
    query = db.query(BedTransfer).filter(
        BedTransfer.admission_id.in_(admission_subquery)
    )
    
    if admission_id:
        query = query.filter(BedTransfer.admission_id == admission_id)
    if start_date:
        query = query.filter(BedTransfer.transfer_date >= start_date)
    if end_date:
        query = query.filter(BedTransfer.transfer_date <= end_date)
    
    return query.order_by(BedTransfer.transfer_date.desc()).offset(skip).limit(limit).all()

# Daily Rate Configuration endpoints
@router.post("/daily-rates/", response_model=DailyRateConfigSchema)
def create_daily_rate_config(
    rate_config: DailyRateConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar configuração de diária"""
    # Apply encryption to sensitive fields
    config_data = field_encryption.encrypt_model_data(rate_config.dict(), "DailyRateConfig")
    
    db_config = DailyRateConfig(
        **config_data,
        clinic_id=current_user.clinic_id
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@router.get("/daily-rates/", response_model=List[DailyRateConfigSchema])
def get_daily_rate_configs(
    skip: int = 0,
    limit: int = 100,
    room_type: Optional[str] = None,
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar configurações de diária"""
    query = db.query(DailyRateConfig).filter(
        DailyRateConfig.clinic_id == current_user.clinic_id
    )
    
    if room_type:
        query = query.filter(DailyRateConfig.room_type == room_type)
    if is_active is not None:
        query = query.filter(DailyRateConfig.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()

@router.put("/daily-rates/{config_id}", response_model=DailyRateConfigSchema)
def update_daily_rate_config(
    config_id: int,
    config_update: DailyRateConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar configuração de diária"""
    config = db.query(DailyRateConfig).filter(
        DailyRateConfig.id == config_id,
        DailyRateConfig.clinic_id == current_user.clinic_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração de diária não encontrada"
        )
    
    update_data = config_update.dict(exclude_unset=True)
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "DailyRateConfig")
    for field, value in encrypted_data.items():
        setattr(config, field, value)
    
    config.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(config)
    return config

# Daily Rate Tier endpoints
@router.post("/daily-rate-tiers/", response_model=DailyRateTierSchema)
def create_daily_rate_tier(
    tier: DailyRateTierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar faixa de diária"""
    # Verificar se a configuração existe
    config = db.query(DailyRateConfig).filter(
        DailyRateConfig.id == tier.rate_config_id,
        DailyRateConfig.clinic_id == current_user.clinic_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração de diária não encontrada"
        )
    
    # Apply encryption to sensitive fields
    tier_data = field_encryption.encrypt_model_data(tier.dict(), "DailyRateTier")
    
    db_tier = DailyRateTier(**tier_data)
    db.add(db_tier)
    db.commit()
    db.refresh(db_tier)
    return db_tier

@router.get("/daily-rate-tiers/", response_model=List[DailyRateTierSchema])
def get_daily_rate_tiers(
    skip: int = 0,
    limit: int = 100,
    rate_config_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar faixas de diária"""
    # Subquery para obter apenas configurações da clínica do usuário
    config_subquery = db.query(DailyRateConfig.id).filter(
        DailyRateConfig.clinic_id == current_user.clinic_id
    ).subquery()
    
    query = db.query(DailyRateTier).filter(
        DailyRateTier.rate_config_id.in_(config_subquery)
    )
    
    if rate_config_id:
        query = query.filter(DailyRateTier.rate_config_id == rate_config_id)
    
    return query.order_by(DailyRateTier.min_days).offset(skip).limit(limit).all()

# Admission Billing endpoints
@router.post("/billing/", response_model=AdmissionBillingSchema)
def create_admission_billing(
    billing: AdmissionBillingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar faturamento de internação"""
    # Verificar se a internação existe
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    admission = db.query(PatientAdmission).filter(
        PatientAdmission.id == billing.admission_id,
        PatientAdmission.patient_id.in_(patient_subquery)
    ).first()
    
    if not admission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Internação não encontrada"
        )
    
    # Apply encryption to sensitive fields
    billing_data = field_encryption.encrypt_model_data(billing.dict(), "AdmissionBilling")
    
    db_billing = AdmissionBilling(
        **billing_data,
        created_by=current_user.id
    )
    db.add(db_billing)
    db.commit()
    db.refresh(db_billing)
    return db_billing

@router.get("/billing/", response_model=List[AdmissionBillingSchema])
def get_admission_billings(
    skip: int = 0,
    limit: int = 100,
    admission_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar faturamentos de internação"""
    # Subquery para obter apenas pacientes da clínica do usuário
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas internações da clínica do usuário
    admission_subquery = db.query(PatientAdmission.id).filter(
        PatientAdmission.patient_id.in_(patient_subquery)
    ).subquery()
    
    query = db.query(AdmissionBilling).filter(
        AdmissionBilling.admission_id.in_(admission_subquery)
    )
    
    if admission_id:
        query = query.filter(AdmissionBilling.admission_id == admission_id)
    if status:
        query = query.filter(AdmissionBilling.status == status)
    if start_date:
        query = query.filter(AdmissionBilling.billing_date >= start_date)
    if end_date:
        query = query.filter(AdmissionBilling.billing_date <= end_date)
    
    return query.order_by(AdmissionBilling.billing_date.desc()).offset(skip).limit(limit).all()

@router.get("/billing/{billing_id}", response_model=AdmissionBillingSchema)
def get_admission_billing(
    billing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um faturamento"""
    # Subquery para obter apenas pacientes da clínica do usuário
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas internações da clínica do usuário
    admission_subquery = db.query(PatientAdmission.id).filter(
        PatientAdmission.patient_id.in_(patient_subquery)
    ).subquery()
    
    billing = db.query(AdmissionBilling).filter(
        AdmissionBilling.id == billing_id,
        AdmissionBilling.admission_id.in_(admission_subquery)
    ).first()
    
    if not billing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faturamento não encontrado"
        )
    
    return billing

@router.put("/billing/{billing_id}", response_model=AdmissionBillingSchema)
def update_admission_billing(
    billing_id: int,
    billing_update: AdmissionBillingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar faturamento de internação"""
    # Subquery para obter apenas pacientes da clínica do usuário
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas internações da clínica do usuário
    admission_subquery = db.query(PatientAdmission.id).filter(
        PatientAdmission.patient_id.in_(patient_subquery)
    ).subquery()
    
    billing = db.query(AdmissionBilling).filter(
        AdmissionBilling.id == billing_id,
        AdmissionBilling.admission_id.in_(admission_subquery)
    ).first()
    
    if not billing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faturamento não encontrado"
        )
    
    update_data = billing_update.dict(exclude_unset=True)
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "AdmissionBilling")
    for field, value in encrypted_data.items():
        setattr(billing, field, value)
    
    billing.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(billing)
    return billing

# Billing Item endpoints
@router.post("/billing-items/", response_model=BillingItemSchema)
def create_billing_item(
    item: BillingItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar item de faturamento"""
    # Verificar se o faturamento existe
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    admission_subquery = db.query(PatientAdmission.id).filter(
        PatientAdmission.patient_id.in_(patient_subquery)
    ).subquery()
    
    billing = db.query(AdmissionBilling).filter(
        AdmissionBilling.id == item.billing_id,
        AdmissionBilling.admission_id.in_(admission_subquery)
    ).first()
    
    if not billing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faturamento não encontrado"
        )
    
    # Apply encryption to sensitive fields
    item_data = field_encryption.encrypt_model_data(item.dict(), "BillingItem")
    
    db_item = BillingItem(**item_data)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/billing-items/", response_model=List[BillingItemSchema])
def get_billing_items(
    skip: int = 0,
    limit: int = 100,
    billing_id: Optional[int] = None,
    item_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar itens de faturamento"""
    # Subquery para obter apenas pacientes da clínica do usuário
    patient_subquery = db.query(Patient.id).filter(
        Patient.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas internações da clínica do usuário
    admission_subquery = db.query(PatientAdmission.id).filter(
        PatientAdmission.patient_id.in_(patient_subquery)
    ).subquery()
    
    # Subquery para obter apenas faturamentos da clínica do usuário
    billing_subquery = db.query(AdmissionBilling.id).filter(
        AdmissionBilling.admission_id.in_(admission_subquery)
    ).subquery()
    
    query = db.query(BillingItem).filter(
        BillingItem.billing_id.in_(billing_subquery)
    )
    
    if billing_id:
        query = query.filter(BillingItem.billing_id == billing_id)
    if item_type:
        query = query.filter(BillingItem.item_type == item_type)
    
    return query.offset(skip).limit(limit).all()