from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from database import get_db
from models import Companion, Visitor, VisitorEntry, VisitingHours
from schemas import (
    CompanionCreate, CompanionUpdate, Companion as CompanionSchema,
    VisitorCreate, VisitorUpdate, Visitor as VisitorSchema,
    VisitorEntryCreate, VisitorEntryUpdate, VisitorEntry as VisitorEntrySchema,
    VisitingHoursCreate, VisitingHoursUpdate, VisitingHours as VisitingHoursSchema
)
from auth import get_current_user
from models import User
from encryption import field_encryption

router = APIRouter(prefix="/companions-visitors", tags=["Companions and Visitors"])

# Companion endpoints
@router.post("/companions/", response_model=CompanionSchema)
def create_companion(
    companion: CompanionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar um novo acompanhante"""
    companion_data = companion.dict()
    companion_data['clinic_id'] = current_user.clinic_id
    # Aplicar criptografia automática nos campos sensíveis
    companion_data = field_encryption.encrypt_model_data(companion_data, 'Companion')
    db_companion = Companion(**companion_data)
    db.add(db_companion)
    db.commit()
    db.refresh(db_companion)
    return db_companion

@router.get("/companions/", response_model=List[CompanionSchema])
def get_companions(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar acompanhantes"""
    query = db.query(Companion).filter(
        Companion.clinic_id == current_user.clinic_id,
        Companion.is_active == True
    )
    
    if patient_id:
        query = query.filter(Companion.patient_id == patient_id)
    
    return query.offset(skip).limit(limit).all()

@router.get("/companions/{companion_id}", response_model=CompanionSchema)
def get_companion(
    companion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um acompanhante"""
    companion = db.query(Companion).filter(
        Companion.id == companion_id,
        Companion.clinic_id == current_user.clinic_id
    ).first()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Acompanhante não encontrado"
        )
    
    return companion

@router.put("/companions/{companion_id}", response_model=CompanionSchema)
def update_companion(
    companion_id: int,
    companion_update: CompanionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar dados de um acompanhante"""
    companion = db.query(Companion).filter(
        Companion.id == companion_id,
        Companion.clinic_id == current_user.clinic_id
    ).first()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Acompanhante não encontrado"
        )
    
    update_data = companion_update.dict(exclude_unset=True)
    # Aplicar criptografia automática nos campos sensíveis
    update_data = field_encryption.encrypt_model_data(update_data, 'Companion')
    for field, value in update_data.items():
        setattr(companion, field, value)
    
    companion.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(companion)
    return companion

@router.delete("/companions/{companion_id}")
def delete_companion(
    companion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Desativar um acompanhante"""
    companion = db.query(Companion).filter(
        Companion.id == companion_id,
        Companion.clinic_id == current_user.clinic_id
    ).first()
    
    if not companion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Acompanhante não encontrado"
        )
    
    companion.is_active = False
    companion.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Acompanhante desativado com sucesso"}

# Visitor endpoints
@router.post("/visitors/", response_model=VisitorSchema)
def create_visitor(
    visitor: VisitorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cadastrar um novo visitante"""
    visitor_data = visitor.dict()
    visitor_data['clinic_id'] = current_user.clinic_id
    # Aplicar criptografia automática nos campos sensíveis
    visitor_data = field_encryption.encrypt_model_data(visitor_data, 'Visitor')
    db_visitor = Visitor(**visitor_data)
    db.add(db_visitor)
    db.commit()
    db.refresh(db_visitor)
    return db_visitor

@router.get("/visitors/", response_model=List[VisitorSchema])
def get_visitors(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar visitantes"""
    query = db.query(Visitor).filter(
        Visitor.clinic_id == current_user.clinic_id,
        Visitor.is_active == True
    )
    
    if search:
        query = query.filter(
            Visitor.name.ilike(f"%{search}%") |
            Visitor.identification_number.ilike(f"%{search}%")
        )
    
    return query.offset(skip).limit(limit).all()

@router.get("/visitors/{visitor_id}", response_model=VisitorSchema)
def get_visitor(
    visitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um visitante"""
    visitor = db.query(Visitor).filter(
        Visitor.id == visitor_id,
        Visitor.clinic_id == current_user.clinic_id
    ).first()
    
    if not visitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visitante não encontrado"
        )
    
    return visitor

@router.put("/visitors/{visitor_id}", response_model=VisitorSchema)
def update_visitor(
    visitor_id: int,
    visitor_update: VisitorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar dados de um visitante"""
    visitor = db.query(Visitor).filter(
        Visitor.id == visitor_id,
        Visitor.clinic_id == current_user.clinic_id
    ).first()
    
    if not visitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visitante não encontrado"
        )
    
    update_data = visitor_update.dict(exclude_unset=True)
    # Aplicar criptografia automática nos campos sensíveis
    update_data = field_encryption.encrypt_model_data(update_data, 'Visitor')
    for field, value in update_data.items():
        setattr(visitor, field, value)
    
    visitor.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(visitor)
    return visitor

# Visitor Entry endpoints
@router.post("/visitor-entries/", response_model=VisitorEntrySchema)
def create_visitor_entry(
    entry: VisitorEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Registrar entrada de visitante"""
    # Verificar se o visitante existe
    visitor = db.query(Visitor).filter(
        Visitor.id == entry.visitor_id,
        Visitor.clinic_id == current_user.clinic_id
    ).first()
    
    if not visitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visitante não encontrado"
        )
    
    # Verificar horário de visitação
    current_time = datetime.now().time()
    current_day = datetime.now().weekday()
    
    visiting_hours = db.query(VisitingHours).filter(
        VisitingHours.clinic_id == current_user.clinic_id,
        VisitingHours.day_of_week == current_day,
        VisitingHours.is_active == True
    ).first()
    
    if visiting_hours and not (visiting_hours.start_time <= current_time <= visiting_hours.end_time):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fora do horário de visitação permitido"
        )
    
    entry_data = entry.dict()
    entry_data.update({
        'clinic_id': current_user.clinic_id,
        'entry_time': datetime.utcnow(),
        'status': "entered"
    })
    # Aplicar criptografia automática nos campos sensíveis
    entry_data = field_encryption.encrypt_model_data(entry_data, 'VisitorEntry')
    db_entry = VisitorEntry(**entry_data)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/visitor-entries/", response_model=List[VisitorEntrySchema])
def get_visitor_entries(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    visitor_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar entradas de visitantes"""
    query = db.query(VisitorEntry).filter(
        VisitorEntry.clinic_id == current_user.clinic_id
    )
    
    if patient_id:
        query = query.filter(VisitorEntry.patient_id == patient_id)
    if visitor_id:
        query = query.filter(VisitorEntry.visitor_id == visitor_id)
    if status:
        query = query.filter(VisitorEntry.status == status)
    
    return query.order_by(VisitorEntry.entry_time.desc()).offset(skip).limit(limit).all()

@router.put("/visitor-entries/{entry_id}/exit", response_model=VisitorEntrySchema)
def register_visitor_exit(
    entry_id: int,
    entry_update: VisitorEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Registrar saída de visitante"""
    entry = db.query(VisitorEntry).filter(
        VisitorEntry.id == entry_id,
        VisitorEntry.clinic_id == current_user.clinic_id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrada de visitante não encontrada"
        )
    
    if entry.status != "entered":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Visitante já registrou saída"
        )
    
    entry.exit_time = datetime.utcnow()
    entry.status = "exited"
    if entry_update.exit_notes:
        entry.exit_notes = entry_update.exit_notes
    
    entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    return entry

# Visiting Hours endpoints
@router.post("/visiting-hours/", response_model=VisitingHoursSchema)
def create_visiting_hours(
    hours: VisitingHoursCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Configurar horários de visitação"""
    db_hours = VisitingHours(
        **hours.dict(),
        clinic_id=current_user.clinic_id
    )
    db.add(db_hours)
    db.commit()
    db.refresh(db_hours)
    return db_hours

@router.get("/visiting-hours/", response_model=List[VisitingHoursSchema])
def get_visiting_hours(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter horários de visitação"""
    return db.query(VisitingHours).filter(
        VisitingHours.clinic_id == current_user.clinic_id,
        VisitingHours.is_active == True
    ).order_by(VisitingHours.day_of_week).all()

@router.put("/visiting-hours/{hours_id}", response_model=VisitingHoursSchema)
def update_visiting_hours(
    hours_id: int,
    hours_update: VisitingHoursUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar horários de visitação"""
    hours = db.query(VisitingHours).filter(
        VisitingHours.id == hours_id,
        VisitingHours.clinic_id == current_user.clinic_id
    ).first()
    
    if not hours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horário de visitação não encontrado"
        )
    
    update_data = hours_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hours, field, value)
    
    hours.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(hours)
    return hours

@router.get("/visitor-entries/current", response_model=List[VisitorEntrySchema])
def get_current_visitors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter visitantes atualmente na clínica"""
    return db.query(VisitorEntry).filter(
        VisitorEntry.clinic_id == current_user.clinic_id,
        VisitorEntry.status == "entered"
    ).order_by(VisitorEntry.entry_time.desc()).all()

@router.get("/statistics/visitors")
def get_visitor_statistics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter estatísticas de visitantes"""
    query = db.query(VisitorEntry).filter(
        VisitorEntry.clinic_id == current_user.clinic_id
    )
    
    if start_date:
        query = query.filter(VisitorEntry.entry_time >= start_date)
    if end_date:
        query = query.filter(VisitorEntry.entry_time <= end_date)
    
    total_visits = query.count()
    current_visitors = query.filter(VisitorEntry.status == "entered").count()
    
    return {
        "total_visits": total_visits,
        "current_visitors": current_visitors,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }