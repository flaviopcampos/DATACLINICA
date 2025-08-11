from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import json

from database import get_db
from models import MedicalDevice, DeviceReading, DeviceIntegration
from schemas import (
    MedicalDeviceCreate, MedicalDeviceUpdate, MedicalDevice as MedicalDeviceSchema,
    DeviceReadingCreate, DeviceReadingUpdate, DeviceReading as DeviceReadingSchema,
    DeviceIntegrationCreate, DeviceIntegrationUpdate, DeviceIntegration as DeviceIntegrationSchema
)
from auth import get_current_user
from models import User
from encryption import field_encryption

router = APIRouter(prefix="/medical-devices", tags=["Medical Devices"])

# Medical Device endpoints
@router.post("/devices/", response_model=MedicalDeviceSchema)
def create_medical_device(
    device: MedicalDeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cadastrar um novo dispositivo médico"""
    # Verificar se já existe dispositivo com mesmo serial number
    existing_device = db.query(MedicalDevice).filter(
        MedicalDevice.serial_number == device.serial_number,
        MedicalDevice.clinic_id == current_user.clinic_id
    ).first()
    
    if existing_device:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um dispositivo com este número de série"
        )
    
    # Apply encryption to sensitive fields
    device_data = field_encryption.encrypt_model_data(device.dict(), "MedicalDevice")
    
    db_device = MedicalDevice(
        **device_data,
        clinic_id=current_user.clinic_id,
        status="active"
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

@router.get("/devices/", response_model=List[MedicalDeviceSchema])
def get_medical_devices(
    skip: int = 0,
    limit: int = 100,
    device_type: Optional[str] = None,
    status: Optional[str] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar dispositivos médicos"""
    query = db.query(MedicalDevice).filter(
        MedicalDevice.clinic_id == current_user.clinic_id,
        MedicalDevice.is_active == True
    )
    
    if device_type:
        query = query.filter(MedicalDevice.device_type == device_type)
    if status:
        query = query.filter(MedicalDevice.status == status)
    if department_id:
        query = query.filter(MedicalDevice.department_id == department_id)
    
    return query.offset(skip).limit(limit).all()

@router.get("/devices/{device_id}", response_model=MedicalDeviceSchema)
def get_medical_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um dispositivo médico"""
    device = db.query(MedicalDevice).filter(
        MedicalDevice.id == device_id,
        MedicalDevice.clinic_id == current_user.clinic_id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispositivo médico não encontrado"
        )
    
    return device

@router.put("/devices/{device_id}", response_model=MedicalDeviceSchema)
def update_medical_device(
    device_id: int,
    device_update: MedicalDeviceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar dados de um dispositivo médico"""
    device = db.query(MedicalDevice).filter(
        MedicalDevice.id == device_id,
        MedicalDevice.clinic_id == current_user.clinic_id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispositivo médico não encontrado"
        )
    
    update_data = device_update.dict(exclude_unset=True)
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "MedicalDevice")
    for field, value in encrypted_data.items():
        setattr(device, field, value)
    
    device.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(device)
    return device

@router.delete("/devices/{device_id}")
def delete_medical_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Desativar um dispositivo médico"""
    device = db.query(MedicalDevice).filter(
        MedicalDevice.id == device_id,
        MedicalDevice.clinic_id == current_user.clinic_id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispositivo médico não encontrado"
        )
    
    device.is_active = False
    device.status = "offline"
    device.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Dispositivo médico desativado com sucesso"}

# Device Reading endpoints
@router.post("/readings/", response_model=DeviceReadingSchema)
def create_device_reading(
    reading: DeviceReadingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Registrar uma nova leitura de dispositivo"""
    # Verificar se o dispositivo existe
    device = db.query(MedicalDevice).filter(
        MedicalDevice.id == reading.device_id,
        MedicalDevice.clinic_id == current_user.clinic_id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispositivo médico não encontrado"
        )
    
    # Apply encryption to sensitive fields
    reading_data = field_encryption.encrypt_model_data(reading.dict(), "DeviceReading")
    
    db_reading = DeviceReading(
        **reading_data,
        is_validated=False
    )
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    return db_reading

@router.get("/readings/", response_model=List[DeviceReadingSchema])
def get_device_readings(
    skip: int = 0,
    limit: int = 100,
    device_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    reading_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar leituras de dispositivos"""
    # Subquery para obter apenas dispositivos da clínica do usuário
    device_subquery = db.query(MedicalDevice.id).filter(
        MedicalDevice.clinic_id == current_user.clinic_id
    ).subquery()
    
    query = db.query(DeviceReading).filter(
        DeviceReading.device_id.in_(device_subquery)
    )
    
    if device_id:
        query = query.filter(DeviceReading.device_id == device_id)
    if patient_id:
        query = query.filter(DeviceReading.patient_id == patient_id)
    if reading_type:
        query = query.filter(DeviceReading.reading_type == reading_type)
    if start_date:
        query = query.filter(DeviceReading.reading_timestamp >= start_date)
    if end_date:
        query = query.filter(DeviceReading.reading_timestamp <= end_date)
    
    return query.order_by(DeviceReading.reading_timestamp.desc()).offset(skip).limit(limit).all()

@router.get("/readings/{reading_id}", response_model=DeviceReadingSchema)
def get_device_reading(
    reading_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de uma leitura de dispositivo"""
    # Subquery para verificar se o dispositivo pertence à clínica
    device_subquery = db.query(MedicalDevice.id).filter(
        MedicalDevice.clinic_id == current_user.clinic_id
    ).subquery()
    
    reading = db.query(DeviceReading).filter(
        DeviceReading.id == reading_id,
        DeviceReading.device_id.in_(device_subquery)
    ).first()
    
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leitura de dispositivo não encontrada"
        )
    
    return reading

@router.put("/readings/{reading_id}/validate", response_model=DeviceReadingSchema)
def validate_device_reading(
    reading_id: int,
    reading_update: DeviceReadingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validar uma leitura de dispositivo"""
    # Subquery para verificar se o dispositivo pertence à clínica
    device_subquery = db.query(MedicalDevice.id).filter(
        MedicalDevice.clinic_id == current_user.clinic_id
    ).subquery()
    
    reading = db.query(DeviceReading).filter(
        DeviceReading.id == reading_id,
        DeviceReading.device_id.in_(device_subquery)
    ).first()
    
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leitura de dispositivo não encontrada"
        )
    
    update_data = reading_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reading, field, value)
    
    reading.is_validated = True
    db.commit()
    db.refresh(reading)
    return reading

# Device Integration endpoints
@router.post("/integrations/", response_model=DeviceIntegrationSchema)
def create_device_integration(
    integration: DeviceIntegrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Configurar integração com dispositivo"""
    # Verificar se o dispositivo existe
    device = db.query(MedicalDevice).filter(
        MedicalDevice.id == integration.device_id,
        MedicalDevice.clinic_id == current_user.clinic_id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispositivo médico não encontrado"
        )
    
    # Apply encryption to sensitive fields
    integration_data = field_encryption.encrypt_model_data(integration.dict(), "DeviceIntegration")
    
    db_integration = DeviceIntegration(
        **integration_data,
        status="inactive",
        sync_count=0,
        error_count=0
    )
    db.add(db_integration)
    db.commit()
    db.refresh(db_integration)
    return db_integration

@router.get("/integrations/", response_model=List[DeviceIntegrationSchema])
def get_device_integrations(
    skip: int = 0,
    limit: int = 100,
    device_id: Optional[int] = None,
    integration_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar integrações de dispositivos"""
    # Subquery para obter apenas dispositivos da clínica do usuário
    device_subquery = db.query(MedicalDevice.id).filter(
        MedicalDevice.clinic_id == current_user.clinic_id
    ).subquery()
    
    query = db.query(DeviceIntegration).filter(
        DeviceIntegration.device_id.in_(device_subquery),
        DeviceIntegration.is_active == True
    )
    
    if device_id:
        query = query.filter(DeviceIntegration.device_id == device_id)
    if integration_type:
        query = query.filter(DeviceIntegration.integration_type == integration_type)
    if status:
        query = query.filter(DeviceIntegration.status == status)
    
    return query.offset(skip).limit(limit).all()

@router.get("/integrations/{integration_id}", response_model=DeviceIntegrationSchema)
def get_device_integration(
    integration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de uma integração de dispositivo"""
    # Subquery para verificar se o dispositivo pertence à clínica
    device_subquery = db.query(MedicalDevice.id).filter(
        MedicalDevice.clinic_id == current_user.clinic_id
    ).subquery()
    
    integration = db.query(DeviceIntegration).filter(
        DeviceIntegration.id == integration_id,
        DeviceIntegration.device_id.in_(device_subquery)
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integração de dispositivo não encontrada"
        )
    
    return integration

@router.put("/integrations/{integration_id}", response_model=DeviceIntegrationSchema)
def update_device_integration(
    integration_id: int,
    integration_update: DeviceIntegrationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar configuração de integração"""
    # Subquery para verificar se o dispositivo pertence à clínica
    device_subquery = db.query(MedicalDevice.id).filter(
        MedicalDevice.clinic_id == current_user.clinic_id
    ).subquery()
    
    integration = db.query(DeviceIntegration).filter(
        DeviceIntegration.id == integration_id,
        DeviceIntegration.device_id.in_(device_subquery)
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integração de dispositivo não encontrada"
        )
    
    update_data = integration_update.dict(exclude_unset=True)
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "DeviceIntegration")
    for field, value in encrypted_data.items():
        setattr(integration, field, value)
    
    integration.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(integration)
    return integration

@router.post("/integrations/{integration_id}/test")
def test_device_integration(
    integration_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Testar integração com dispositivo"""
    # Subquery para verificar se o dispositivo pertence à clínica
    device_subquery = db.query(MedicalDevice.id).filter(
        MedicalDevice.clinic_id == current_user.clinic_id
    ).subquery()
    
    integration = db.query(DeviceIntegration).filter(
        DeviceIntegration.id == integration_id,
        DeviceIntegration.device_id.in_(device_subquery)
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integração de dispositivo não encontrada"
        )
    
    # Atualizar status para testing
    integration.status = "testing"
    integration.updated_at = datetime.utcnow()
    db.commit()
    
    # Adicionar tarefa em background para testar a integração
    background_tasks.add_task(test_integration_connection, integration_id, db)
    
    return {"message": "Teste de integração iniciado"}

@router.post("/integrations/{integration_id}/sync")
def sync_device_data(
    integration_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Sincronizar dados do dispositivo"""
    # Subquery para verificar se o dispositivo pertence à clínica
    device_subquery = db.query(MedicalDevice.id).filter(
        MedicalDevice.clinic_id == current_user.clinic_id
    ).subquery()
    
    integration = db.query(DeviceIntegration).filter(
        DeviceIntegration.id == integration_id,
        DeviceIntegration.device_id.in_(device_subquery),
        DeviceIntegration.status == "active"
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integração ativa não encontrada"
        )
    
    # Adicionar tarefa em background para sincronizar dados
    background_tasks.add_task(sync_device_readings, integration_id, db)
    
    return {"message": "Sincronização de dados iniciada"}

@router.get("/statistics/devices")
def get_device_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter estatísticas de dispositivos"""
    total_devices = db.query(MedicalDevice).filter(
        MedicalDevice.clinic_id == current_user.clinic_id,
        MedicalDevice.is_active == True
    ).count()
    
    active_devices = db.query(MedicalDevice).filter(
        MedicalDevice.clinic_id == current_user.clinic_id,
        MedicalDevice.status == "active"
    ).count()
    
    maintenance_devices = db.query(MedicalDevice).filter(
        MedicalDevice.clinic_id == current_user.clinic_id,
        MedicalDevice.status == "maintenance"
    ).count()
    
    offline_devices = db.query(MedicalDevice).filter(
        MedicalDevice.clinic_id == current_user.clinic_id,
        MedicalDevice.status == "offline"
    ).count()
    
    # Estatísticas de leituras (últimas 24 horas)
    from datetime import timedelta
    yesterday = datetime.utcnow() - timedelta(days=1)
    
    device_subquery = db.query(MedicalDevice.id).filter(
        MedicalDevice.clinic_id == current_user.clinic_id
    ).subquery()
    
    recent_readings = db.query(DeviceReading).filter(
        DeviceReading.device_id.in_(device_subquery),
        DeviceReading.reading_timestamp >= yesterday
    ).count()
    
    return {
        "total_devices": total_devices,
        "active_devices": active_devices,
        "maintenance_devices": maintenance_devices,
        "offline_devices": offline_devices,
        "recent_readings_24h": recent_readings
    }

# Funções auxiliares para tarefas em background
def test_integration_connection(integration_id: int, db: Session):
    """Função para testar conexão com dispositivo em background"""
    integration = db.query(DeviceIntegration).filter(
        DeviceIntegration.id == integration_id
    ).first()
    
    if not integration:
        return
    
    try:
        # Aqui seria implementada a lógica específica para cada tipo de integração
        # Por exemplo: HL7, DICOM, TCP/IP, etc.
        
        # Simulação de teste de conexão
        import time
        time.sleep(2)  # Simular tempo de teste
        
        # Atualizar status baseado no resultado do teste
        integration.status = "active"
        integration.last_sync = datetime.utcnow()
        integration.updated_at = datetime.utcnow()
        
    except Exception as e:
        integration.status = "error"
        integration.last_error = str(e)
        integration.error_count += 1
        integration.updated_at = datetime.utcnow()
    
    db.commit()

def sync_device_readings(integration_id: int, db: Session):
    """Função para sincronizar dados do dispositivo em background"""
    integration = db.query(DeviceIntegration).filter(
        DeviceIntegration.id == integration_id
    ).first()
    
    if not integration:
        return
    
    try:
        # Aqui seria implementada a lógica específica para cada tipo de integração
        # Por exemplo: consultar API do dispositivo, ler dados via HL7, etc.
        
        # Simulação de sincronização
        import time
        time.sleep(3)  # Simular tempo de sincronização
        
        # Atualizar contadores
        integration.sync_count += 1
        integration.last_sync = datetime.utcnow()
        integration.updated_at = datetime.utcnow()
        
    except Exception as e:
        integration.last_error = str(e)
        integration.error_count += 1
        integration.updated_at = datetime.utcnow()
    
    db.commit()