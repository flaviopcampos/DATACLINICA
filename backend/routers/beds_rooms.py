from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Room, Bed, BedStatusHistory, Department
from schemas import (
    RoomCreate, RoomUpdate, Room as RoomSchema,
    BedCreate, BedUpdate, Bed as BedSchema,
    BedStatusHistoryCreate, BedStatusHistory as BedStatusHistorySchema,
    DepartmentCreate, DepartmentUpdate, Department as DepartmentSchema
)
from auth import get_current_user
from models import User
from encryption import field_encryption

router = APIRouter(prefix="/beds-rooms", tags=["Beds and Rooms"])

# Department endpoints
@router.post("/departments/", response_model=DepartmentSchema)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar um novo departamento"""
    # Verificar se já existe departamento com mesmo nome
    existing_dept = db.query(Department).filter(
        Department.name == department.name,
        Department.clinic_id == current_user.clinic_id
    ).first()
    
    if existing_dept:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um departamento com este nome"
        )
    
    # Apply encryption to sensitive fields
    dept_data = field_encryption.encrypt_model_data(department.dict(), "Department")
    
    db_dept = Department(
        **dept_data,
        clinic_id=current_user.clinic_id
    )
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.get("/departments/", response_model=List[DepartmentSchema])
def get_departments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar departamentos"""
    return db.query(Department).filter(
        Department.clinic_id == current_user.clinic_id,
        Department.is_active == True
    ).offset(skip).limit(limit).all()

@router.get("/departments/{department_id}", response_model=DepartmentSchema)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um departamento"""
    dept = db.query(Department).filter(
        Department.id == department_id,
        Department.clinic_id == current_user.clinic_id
    ).first()
    
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Departamento não encontrado"
        )
    
    return dept

@router.put("/departments/{department_id}", response_model=DepartmentSchema)
def update_department(
    department_id: int,
    department_update: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar dados de um departamento"""
    dept = db.query(Department).filter(
        Department.id == department_id,
        Department.clinic_id == current_user.clinic_id
    ).first()
    
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Departamento não encontrado"
        )
    
    update_data = department_update.dict(exclude_unset=True)
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "Department")
    for field, value in encrypted_data.items():
        setattr(dept, field, value)
    
    dept.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(dept)
    return dept

@router.delete("/departments/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Desativar um departamento"""
    dept = db.query(Department).filter(
        Department.id == department_id,
        Department.clinic_id == current_user.clinic_id
    ).first()
    
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Departamento não encontrado"
        )
    
    dept.is_active = False
    dept.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Departamento desativado com sucesso"}

# Room endpoints
@router.post("/rooms/", response_model=RoomSchema)
def create_room(
    room: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar um novo quarto"""
    # Verificar se o departamento existe
    dept = db.query(Department).filter(
        Department.id == room.department_id,
        Department.clinic_id == current_user.clinic_id
    ).first()
    
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Departamento não encontrado"
        )
    
    # Verificar se já existe quarto com mesmo número no departamento
    existing_room = db.query(Room).filter(
        Room.room_number == room.room_number,
        Room.department_id == room.department_id
    ).first()
    
    if existing_room:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um quarto com este número no departamento"
        )
    
    # Apply encryption to sensitive fields
    room_data = field_encryption.encrypt_model_data(room.dict(), "Room")
    
    db_room = Room(
        **room_data,
        status="available"
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@router.get("/rooms/", response_model=List[RoomSchema])
def get_rooms(
    skip: int = 0,
    limit: int = 100,
    department_id: Optional[int] = None,
    room_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar quartos"""
    # Subquery para obter apenas departamentos da clínica do usuário
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    query = db.query(Room).filter(
        Room.department_id.in_(dept_subquery),
        Room.is_active == True
    )
    
    if department_id:
        query = query.filter(Room.department_id == department_id)
    if room_type:
        query = query.filter(Room.room_type == room_type)
    if status:
        query = query.filter(Room.status == status)
    
    return query.offset(skip).limit(limit).all()

@router.get("/rooms/{room_id}", response_model=RoomSchema)
def get_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um quarto"""
    # Subquery para obter apenas departamentos da clínica do usuário
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    room = db.query(Room).filter(
        Room.id == room_id,
        Room.department_id.in_(dept_subquery)
    ).first()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quarto não encontrado"
        )
    
    return room

@router.put("/rooms/{room_id}", response_model=RoomSchema)
def update_room(
    room_id: int,
    room_update: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar dados de um quarto"""
    # Subquery para obter apenas departamentos da clínica do usuário
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    room = db.query(Room).filter(
        Room.id == room_id,
        Room.department_id.in_(dept_subquery)
    ).first()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quarto não encontrado"
        )
    
    update_data = room_update.dict(exclude_unset=True)
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "Room")
    for field, value in encrypted_data.items():
        setattr(room, field, value)
    
    room.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(room)
    return room

@router.delete("/rooms/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Desativar um quarto"""
    # Subquery para obter apenas departamentos da clínica do usuário
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    room = db.query(Room).filter(
        Room.id == room_id,
        Room.department_id.in_(dept_subquery)
    ).first()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quarto não encontrado"
        )
    
    room.is_active = False
    room.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Quarto desativado com sucesso"}

# Bed endpoints
@router.post("/beds/", response_model=BedSchema)
def create_bed(
    bed: BedCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar um novo leito"""
    # Verificar se o quarto existe e pertence à clínica do usuário
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    room = db.query(Room).filter(
        Room.id == bed.room_id,
        Room.department_id.in_(dept_subquery)
    ).first()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quarto não encontrado"
        )
    
    # Verificar se já existe leito com mesmo número no quarto
    existing_bed = db.query(Bed).filter(
        Bed.bed_number == bed.bed_number,
        Bed.room_id == bed.room_id
    ).first()
    
    if existing_bed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um leito com este número no quarto"
        )
    
    # Apply encryption to sensitive fields
    bed_data = field_encryption.encrypt_model_data(bed.dict(), "Bed")
    
    db_bed = Bed(
        **bed_data,
        status="available"
    )
    db.add(db_bed)
    db.commit()
    db.refresh(db_bed)
    
    # Criar histórico inicial
    history = BedStatusHistory(
        bed_id=db_bed.id,
        previous_status=None,
        new_status="available",
        changed_by=current_user.id,
        reason="Leito criado"
    )
    db.add(history)
    db.commit()
    
    return db_bed

@router.get("/beds/", response_model=List[BedSchema])
def get_beds(
    skip: int = 0,
    limit: int = 100,
    room_id: Optional[int] = None,
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    bed_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar leitos"""
    # Subquery para obter apenas departamentos da clínica do usuário
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas quartos da clínica do usuário
    room_subquery = db.query(Room.id).filter(
        Room.department_id.in_(dept_subquery)
    ).subquery()
    
    query = db.query(Bed).filter(
        Bed.room_id.in_(room_subquery),
        Bed.is_active == True
    )
    
    if room_id:
        query = query.filter(Bed.room_id == room_id)
    if department_id:
        # Filtrar por departamento através dos quartos
        dept_rooms = db.query(Room.id).filter(
            Room.department_id == department_id
        ).subquery()
        query = query.filter(Bed.room_id.in_(dept_rooms))
    if status:
        query = query.filter(Bed.status == status)
    if bed_type:
        query = query.filter(Bed.bed_type == bed_type)
    
    return query.offset(skip).limit(limit).all()

@router.get("/beds/{bed_id}", response_model=BedSchema)
def get_bed(
    bed_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um leito"""
    # Subquery para obter apenas departamentos da clínica do usuário
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas quartos da clínica do usuário
    room_subquery = db.query(Room.id).filter(
        Room.department_id.in_(dept_subquery)
    ).subquery()
    
    bed = db.query(Bed).filter(
        Bed.id == bed_id,
        Bed.room_id.in_(room_subquery)
    ).first()
    
    if not bed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leito não encontrado"
        )
    
    return bed

@router.put("/beds/{bed_id}", response_model=BedSchema)
def update_bed(
    bed_id: int,
    bed_update: BedUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar dados de um leito"""
    # Subquery para obter apenas departamentos da clínica do usuário
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas quartos da clínica do usuário
    room_subquery = db.query(Room.id).filter(
        Room.department_id.in_(dept_subquery)
    ).subquery()
    
    bed = db.query(Bed).filter(
        Bed.id == bed_id,
        Bed.room_id.in_(room_subquery)
    ).first()
    
    if not bed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leito não encontrado"
        )
    
    update_data = bed_update.dict(exclude_unset=True)
    
    # Se o status está sendo alterado, criar histórico
    if 'status' in update_data and update_data['status'] != bed.status:
        history = BedStatusHistory(
            bed_id=bed.id,
            previous_status=bed.status,
            new_status=update_data['status'],
            changed_by=current_user.id,
            reason=update_data.get('status_reason', 'Atualização manual')
        )
        db.add(history)
    
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "Bed")
    for field, value in encrypted_data.items():
        setattr(bed, field, value)
    
    bed.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(bed)
    return bed

@router.delete("/beds/{bed_id}")
def delete_bed(
    bed_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Desativar um leito"""
    # Subquery para obter apenas departamentos da clínica do usuário
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    # Subquery para obter apenas quartos da clínica do usuário
    room_subquery = db.query(Room.id).filter(
        Room.department_id.in_(dept_subquery)
    ).subquery()
    
    bed = db.query(Bed).filter(
        Bed.id == bed_id,
        Bed.room_id.in_(room_subquery)
    ).first()
    
    if not bed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leito não encontrado"
        )
    
    # Criar histórico de desativação
    history = BedStatusHistory(
        bed_id=bed.id,
        previous_status=bed.status,
        new_status="inactive",
        changed_by=current_user.id,
        reason="Leito desativado"
    )
    db.add(history)
    
    bed.is_active = False
    bed.status = "inactive"
    bed.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Leito desativado com sucesso"}

# Bed Status History endpoints
@router.get("/beds/{bed_id}/history", response_model=List[BedStatusHistorySchema])
def get_bed_status_history(
    bed_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter histórico de status de um leito"""
    # Verificar se o leito existe e pertence à clínica do usuário
    dept_subquery = db.query(Department.id).filter(
        Department.clinic_id == current_user.clinic_id
    ).subquery()
    
    room_subquery = db.query(Room.id).filter(
        Room.department_id.in_(dept_subquery)
    ).subquery()
    
    bed = db.query(Bed).filter(
        Bed.id == bed_id,
        Bed.room_id.in_(room_subquery)
    ).first()
    
    if not bed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leito não encontrado"
        )
    
    return db.query(BedStatusHistory).filter(
        BedStatusHistory.bed_id == bed_id
    ).order_by(BedStatusHistory.changed_at.desc()).offset(skip).limit(limit).all()