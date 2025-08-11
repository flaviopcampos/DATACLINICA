from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

import crud, models, schemas
from database import get_db
from auth import get_current_user
from encryption import field_encryption

router = APIRouter()

# ============================================================================
# TELEMEDICINE ROOM ENDPOINTS
# ============================================================================

@router.post("/rooms/", response_model=schemas.TelemedicineRoom)
def create_telemedicine_room(
    room: schemas.TelemedicineRoomCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Criar uma nova sala de telemedicina"""
    return crud.create_telemedicine_room(
        db=db, 
        room=room, 
        clinic_id=current_user.clinic_id,
        created_by=current_user.id
    )

@router.get("/rooms/", response_model=List[schemas.TelemedicineRoom])
def get_telemedicine_rooms(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Listar salas de telemedicina da clínica"""
    return crud.get_telemedicine_rooms(
        db=db, 
        clinic_id=current_user.clinic_id, 
        skip=skip, 
        limit=limit
    )

@router.get("/rooms/{room_id}", response_model=schemas.TelemedicineRoom)
def get_telemedicine_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obter detalhes de uma sala específica"""
    room = crud.get_telemedicine_room(db=db, room_id=room_id)
    if not room or room.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sala não encontrada"
        )
    return room

@router.put("/rooms/{room_id}", response_model=schemas.TelemedicineRoom)
def update_telemedicine_room(
    room_id: int,
    room: schemas.TelemedicineRoomUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Atualizar configurações da sala"""
    db_room = crud.get_telemedicine_room(db=db, room_id=room_id)
    if not db_room or db_room.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sala não encontrada"
        )
    return crud.update_telemedicine_room(db=db, room_id=room_id, room=room)

@router.delete("/rooms/{room_id}", response_model=schemas.TelemedicineRoom)
def delete_telemedicine_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Desativar uma sala de telemedicina"""
    db_room = crud.get_telemedicine_room(db=db, room_id=room_id)
    if not db_room or db_room.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sala não encontrada"
        )
    return crud.delete_telemedicine_room(db=db, room_id=room_id)

# ============================================================================
# TELECONSULTATION ENDPOINTS
# ============================================================================

@router.post("/consultations/", response_model=schemas.Teleconsultation)
def create_teleconsultation(
    consultation: schemas.TeleconsultationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Agendar uma nova teleconsulta"""
    return crud.create_teleconsultation(
        db=db, 
        consultation=consultation, 
        clinic_id=current_user.clinic_id
    )

@router.get("/consultations/", response_model=List[schemas.Teleconsultation])
def get_teleconsultations(
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Listar teleconsultas da clínica"""
    return crud.get_teleconsultations(
        db=db,
        clinic_id=current_user.clinic_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        skip=skip,
        limit=limit
    )

@router.get("/consultations/{consultation_id}", response_model=schemas.Teleconsultation)
def get_teleconsultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obter detalhes de uma teleconsulta"""
    consultation = crud.get_teleconsultation(db=db, consultation_id=consultation_id)
    if not consultation or consultation.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teleconsulta não encontrada"
        )
    return consultation

@router.put("/consultations/{consultation_id}", response_model=schemas.Teleconsultation)
def update_teleconsultation(
    consultation_id: int,
    consultation: schemas.TeleconsultationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Atualizar dados da teleconsulta"""
    db_consultation = crud.get_teleconsultation(db=db, consultation_id=consultation_id)
    if not db_consultation or db_consultation.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teleconsulta não encontrada"
        )
    return crud.update_teleconsultation(db=db, consultation_id=consultation_id, consultation=consultation)

@router.post("/consultations/{consultation_id}/start", response_model=schemas.Teleconsultation)
def start_teleconsultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Iniciar uma teleconsulta"""
    db_consultation = crud.get_teleconsultation(db=db, consultation_id=consultation_id)
    if not db_consultation or db_consultation.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teleconsulta não encontrada"
        )
    return crud.start_teleconsultation(db=db, consultation_id=consultation_id)

@router.post("/consultations/{consultation_id}/end", response_model=schemas.Teleconsultation)
def end_teleconsultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Finalizar uma teleconsulta"""
    db_consultation = crud.get_teleconsultation(db=db, consultation_id=consultation_id)
    if not db_consultation or db_consultation.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teleconsulta não encontrada"
        )
    return crud.end_teleconsultation(db=db, consultation_id=consultation_id)

# ============================================================================
# TELECONSULTATION PARTICIPANTS ENDPOINTS
# ============================================================================

@router.get("/consultations/{consultation_id}/participants", response_model=List[schemas.TeleconsultationParticipant])
def get_teleconsultation_participants(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Listar participantes de uma teleconsulta"""
    consultation = crud.get_teleconsultation(db=db, consultation_id=consultation_id)
    if not consultation or consultation.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teleconsulta não encontrada"
        )
    return crud.get_teleconsultation_participants(db=db, consultation_id=consultation_id)

@router.post("/consultations/{consultation_id}/participants", response_model=schemas.TeleconsultationParticipant)
def add_teleconsultation_participant(
    consultation_id: int,
    participant: schemas.TeleconsultationParticipantCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Adicionar participante à teleconsulta"""
    consultation = crud.get_teleconsultation(db=db, consultation_id=consultation_id)
    if not consultation or consultation.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teleconsulta não encontrada"
        )
    
    participant_data = participant.dict()
    participant_data["teleconsultation_id"] = consultation_id
    participant_create = schemas.TeleconsultationParticipantCreate(**participant_data)
    
    return crud.add_teleconsultation_participant(db=db, participant=participant_create)

@router.put("/participants/{participant_id}", response_model=schemas.TeleconsultationParticipant)
def update_participant_status(
    participant_id: int,
    participant: schemas.TeleconsultationParticipantUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Atualizar status do participante"""
    return crud.update_participant_status(db=db, participant_id=participant_id, participant=participant)

# ============================================================================
# SHARED DOCUMENTS ENDPOINTS
# ============================================================================

@router.get("/consultations/{consultation_id}/documents", response_model=List[schemas.SharedDocument])
def get_shared_documents(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Listar documentos compartilhados na teleconsulta"""
    consultation = crud.get_teleconsultation(db=db, consultation_id=consultation_id)
    if not consultation or consultation.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teleconsulta não encontrada"
        )
    return crud.get_shared_documents(db=db, consultation_id=consultation_id)

@router.post("/consultations/{consultation_id}/documents", response_model=schemas.SharedDocument)
def upload_shared_document(
    consultation_id: int,
    file: UploadFile = File(...),
    description: Optional[str] = None,
    is_patient_accessible: bool = True,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fazer upload de documento para compartilhar na teleconsulta"""
    consultation = crud.get_teleconsultation(db=db, consultation_id=consultation_id)
    if not consultation or consultation.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teleconsulta não encontrada"
        )
    
    # Aqui você implementaria o upload do arquivo
    # Por simplicidade, vamos simular o caminho do arquivo
    import os
    import uuid
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_extension}"
    file_path = f"uploads/telemedicine/{consultation_id}/{unique_filename}"
    
    # Simular salvamento do arquivo
    # Em produção, você salvaria o arquivo no sistema de arquivos ou cloud storage
    
    document_data = {
        "teleconsultation_id": consultation_id,
        "uploaded_by": current_user.id,
        "document_name": file.filename,
        "document_type": file.content_type.split('/')[0] if file.content_type else "unknown",
        "file_path": file_path,
        "file_size": file.size or 0,
        "mime_type": file.content_type or "application/octet-stream",
        "description": description,
        "is_patient_accessible": is_patient_accessible
    }
    
    document_create = schemas.SharedDocumentCreate(**document_data)
    return crud.create_shared_document(db=db, document=document_create)

@router.put("/documents/{document_id}", response_model=schemas.SharedDocument)
def update_shared_document(
    document_id: int,
    document: schemas.SharedDocumentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Atualizar documento compartilhado"""
    return crud.update_shared_document(db=db, document_id=document_id, document=document)

@router.delete("/documents/{document_id}", response_model=schemas.SharedDocument)
def delete_shared_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Remover documento compartilhado"""
    return crud.delete_shared_document(db=db, document_id=document_id)

# ============================================================================
# REMOTE MONITORING ENDPOINTS
# ============================================================================

@router.post("/monitoring/", response_model=schemas.RemoteMonitoring)
def create_remote_monitoring(
    monitoring: schemas.RemoteMonitoringCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Criar plano de monitoramento remoto"""
    return crud.create_remote_monitoring(
        db=db, 
        monitoring=monitoring, 
        clinic_id=current_user.clinic_id
    )

@router.get("/monitoring/patient/{patient_id}", response_model=List[schemas.RemoteMonitoring])
def get_patient_monitoring(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obter monitoramentos de um paciente"""
    return crud.get_patient_monitoring(
        db=db, 
        patient_id=patient_id, 
        clinic_id=current_user.clinic_id
    )

@router.get("/monitoring/{monitoring_id}", response_model=schemas.RemoteMonitoring)
def get_remote_monitoring(
    monitoring_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obter detalhes do monitoramento"""
    monitoring = crud.get_remote_monitoring(db=db, monitoring_id=monitoring_id)
    if not monitoring or monitoring.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoramento não encontrado"
        )
    return monitoring

@router.put("/monitoring/{monitoring_id}", response_model=schemas.RemoteMonitoring)
def update_remote_monitoring(
    monitoring_id: int,
    monitoring: schemas.RemoteMonitoringUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Atualizar plano de monitoramento"""
    db_monitoring = crud.get_remote_monitoring(db=db, monitoring_id=monitoring_id)
    if not db_monitoring or db_monitoring.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoramento não encontrado"
        )
    return crud.update_remote_monitoring(db=db, monitoring_id=monitoring_id, monitoring=monitoring)

# ============================================================================
# VITAL SIGNS ENDPOINTS
# ============================================================================

@router.get("/monitoring/{monitoring_id}/vitals", response_model=List[schemas.VitalSignReading])
def get_vital_sign_readings(
    monitoring_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obter leituras de sinais vitais"""
    monitoring = crud.get_remote_monitoring(db=db, monitoring_id=monitoring_id)
    if not monitoring or monitoring.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoramento não encontrado"
        )
    return crud.get_vital_sign_readings(db=db, monitoring_id=monitoring_id, skip=skip, limit=limit)

@router.post("/monitoring/{monitoring_id}/vitals", response_model=schemas.VitalSignReading)
def create_vital_sign_reading(
    monitoring_id: int,
    reading: schemas.VitalSignReadingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Registrar leitura de sinal vital"""
    monitoring = crud.get_remote_monitoring(db=db, monitoring_id=monitoring_id)
    if not monitoring or monitoring.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoramento não encontrado"
        )
    
    reading_data = reading.dict()
    reading_data["monitoring_id"] = monitoring_id
    reading_create = schemas.VitalSignReadingCreate(**reading_data)
    
    return crud.create_vital_sign_reading(db=db, reading=reading_create)

@router.post("/vitals/{reading_id}/verify", response_model=schemas.VitalSignReading)
def verify_vital_sign_reading(
    reading_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Verificar leitura de sinal vital"""
    return crud.verify_vital_sign_reading(db=db, reading_id=reading_id)

# ============================================================================
# MEDICATION ADHERENCE ENDPOINTS
# ============================================================================

@router.get("/monitoring/{monitoring_id}/medications", response_model=List[schemas.MedicationAdherenceLog])
def get_medication_adherence_logs(
    monitoring_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obter logs de aderência medicamentosa"""
    monitoring = crud.get_remote_monitoring(db=db, monitoring_id=monitoring_id)
    if not monitoring or monitoring.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoramento não encontrado"
        )
    return crud.get_medication_adherence_logs(db=db, monitoring_id=monitoring_id, skip=skip, limit=limit)

@router.post("/monitoring/{monitoring_id}/medications", response_model=schemas.MedicationAdherenceLog)
def create_medication_adherence_log(
    monitoring_id: int,
    log: schemas.MedicationAdherenceLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Registrar log de medicação"""
    monitoring = crud.get_remote_monitoring(db=db, monitoring_id=monitoring_id)
    if not monitoring or monitoring.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitoramento não encontrado"
        )
    
    log_data = log.dict()
    log_data["monitoring_id"] = monitoring_id
    log_create = schemas.MedicationAdherenceLogCreate(**log_data)
    
    return crud.create_medication_adherence_log(db=db, log=log_create)

@router.put("/medications/{log_id}", response_model=schemas.MedicationAdherenceLog)
def update_medication_adherence(
    log_id: int,
    log: schemas.MedicationAdherenceLogUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Atualizar log de aderência medicamentosa"""
    return crud.update_medication_adherence(db=db, log_id=log_id, log=log)

# ============================================================================
# DIGITAL PRESCRIPTION ENDPOINTS
# ============================================================================

@router.post("/prescriptions/", response_model=schemas.DigitalPrescription)
def create_digital_prescription(
    prescription: schemas.DigitalPrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Criar prescrição digital"""
    return crud.create_digital_prescription(
        db=db, 
        prescription=prescription, 
        clinic_id=current_user.clinic_id
    )

@router.get("/prescriptions/patient/{patient_id}", response_model=List[schemas.DigitalPrescription])
def get_patient_prescriptions(
    patient_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obter prescrições de um paciente"""
    return crud.get_patient_prescriptions(
        db=db, 
        patient_id=patient_id, 
        clinic_id=current_user.clinic_id,
        skip=skip,
        limit=limit
    )

@router.get("/prescriptions/{prescription_id}", response_model=schemas.DigitalPrescription)
def get_digital_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obter detalhes da prescrição"""
    prescription = crud.get_digital_prescription(db=db, prescription_id=prescription_id)
    if not prescription or prescription.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescrição não encontrada"
        )
    return prescription

@router.put("/prescriptions/{prescription_id}", response_model=schemas.DigitalPrescription)
def update_digital_prescription(
    prescription_id: int,
    prescription: schemas.DigitalPrescriptionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Atualizar prescrição digital"""
    db_prescription = crud.get_digital_prescription(db=db, prescription_id=prescription_id)
    if not db_prescription or db_prescription.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescrição não encontrada"
        )
    return crud.update_digital_prescription(db=db, prescription_id=prescription_id, prescription=prescription)

@router.post("/prescriptions/{prescription_id}/dispense", response_model=schemas.DigitalPrescription)
def dispense_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Dispensar prescrição"""
    db_prescription = crud.get_digital_prescription(db=db, prescription_id=prescription_id)
    if not db_prescription or db_prescription.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescrição não encontrada"
        )
    return crud.dispense_prescription(db=db, prescription_id=prescription_id)

# ============================================================================
# PRESCRIPTION MEDICATIONS ENDPOINTS
# ============================================================================

@router.get("/prescriptions/{prescription_id}/medications", response_model=List[schemas.DigitalPrescriptionMedication])
def get_prescription_medications(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obter medicamentos da prescrição"""
    prescription = crud.get_digital_prescription(db=db, prescription_id=prescription_id)
    if not prescription or prescription.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescrição não encontrada"
        )
    return crud.get_prescription_medications(db=db, prescription_id=prescription_id)

@router.post("/prescriptions/{prescription_id}/medications", response_model=schemas.DigitalPrescriptionMedication)
def add_prescription_medication(
    prescription_id: int,
    medication: schemas.DigitalPrescriptionMedicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Adicionar medicamento à prescrição"""
    prescription = crud.get_digital_prescription(db=db, prescription_id=prescription_id)
    if not prescription or prescription.clinic_id != current_user.clinic_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescrição não encontrada"
        )
    
    medication_data = medication.dict()
    medication_data["prescription_id"] = prescription_id
    medication_create = schemas.DigitalPrescriptionMedicationCreate(**medication_data)
    
    return crud.add_prescription_medication(db=db, medication=medication_create)

@router.put("/medications/{medication_id}", response_model=schemas.DigitalPrescriptionMedication)
def update_prescription_medication(
    medication_id: int,
    medication: schemas.DigitalPrescriptionMedicationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Atualizar medicamento da prescrição"""
    return crud.update_prescription_medication(db=db, medication_id=medication_id, medication=medication)