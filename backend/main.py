from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta, date, datetime
from typing import List, Optional

import schemas, auth, models
from crud_supabase import crud_supabase
from database_supabase import get_supabase_client
from audit_backup import AuditLogger, BackupManager, ComplianceChecker
from financial_utils import FinancialCalculator, ReportGenerator
from routers import external_apis, saas, two_factor_auth, telemedicine, companions_visitors, medical_devices, analytics_ai, stock_management, beds_rooms, hospitalization, permissions

app = FastAPI(
    title="Sistema Clínico Profissional",
    description="ERP web para clínicas com prontuário eletrônico, faturamento TISS e gestão completa",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(external_apis.router)
app.include_router(saas.router)
app.include_router(two_factor_auth.router)
app.include_router(telemedicine.router, prefix="/telemedicine", tags=["telemedicine"])
app.include_router(companions_visitors.router)
app.include_router(medical_devices.router)
app.include_router(analytics_ai.router)
app.include_router(stock_management.router, prefix="/api", tags=["Controle de Estoque Ampliado"])
app.include_router(beds_rooms.router, prefix="/api", tags=["Leitos e Quartos"])
app.include_router(hospitalization.router, prefix="/api", tags=["Internação"])
app.include_router(permissions.router, prefix="/api", tags=["Permissões"])

@app.get("/")
async def read_root():
    return {"message": "Bem-vindo ao Sistema Clínico Profissional!"}

@app.get("/test-simple")
def test_simple():
    return {"message": "API funcionando! - Reloaded", "status": "ok", "timestamp": "2024-01-01"}

@app.get("/test-departments")
def test_departments():
    """Endpoint público para testar departamentos sem autenticação"""
    try:
        # Retorna dados mock para teste
        mock_departments = [
            {"id": 1, "name": "UTI", "description": "Unidade de Terapia Intensiva", "active": True},
            {"id": 2, "name": "Enfermaria", "description": "Enfermaria Geral", "active": True},
            {"id": 3, "name": "Emergência", "description": "Pronto Socorro", "active": True}
        ]
        return {"status": "success", "data": mock_departments, "count": len(mock_departments)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/test-rooms")
def test_rooms():
    """Endpoint público para testar quartos sem autenticação"""
    try:
        mock_rooms = [
            {"id": 1, "number": "101", "department_id": 1, "department_name": "UTI", "active": True},
            {"id": 2, "number": "102", "department_id": 1, "department_name": "UTI", "active": True},
            {"id": 3, "number": "201", "department_id": 2, "department_name": "Enfermaria", "active": True}
        ]
        return {"status": "success", "data": mock_rooms, "count": len(mock_rooms)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/test-beds")
def test_beds():
    """Endpoint público para testar leitos sem autenticação"""
    try:
        mock_beds = [
            {"id": 1, "number": "A1", "room_id": 1, "room_number": "101", "status": "available", "bed_type": "standard"},
            {"id": 2, "number": "A2", "room_id": 1, "room_number": "101", "status": "occupied", "bed_type": "standard"},
            {"id": 3, "number": "B1", "room_id": 2, "room_number": "102", "status": "maintenance", "bed_type": "icu"}
        ]
        return {"status": "success", "data": mock_beds, "count": len(mock_beds)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/test-admissions")
def test_admissions():
    """Endpoint público para testar internações sem autenticação"""
    try:
        mock_admissions = [
            {"id": 1, "patient_name": "João Silva", "bed_id": 2, "bed_number": "A2", "admission_date": "2024-01-15", "status": "active"},
            {"id": 2, "patient_name": "Maria Santos", "bed_id": 1, "bed_number": "A1", "admission_date": "2024-01-10", "status": "discharged"},
            {"id": 3, "patient_name": "Pedro Costa", "bed_id": 3, "bed_number": "B1", "admission_date": "2024-01-20", "status": "active"}
        ]
        return {"status": "success", "data": mock_admissions, "count": len(mock_admissions)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/test-db/")
async def test_db_connection():
    try:
        # Testa a conexão com Supabase
        supabase = get_supabase_client()
        response = supabase.table('clinics').select('count').execute()
        return {"message": "Conexão com o Supabase bem-sucedida!", "status": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro de conexão com o Supabase: {e}")

# Autenticação
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth.authenticate_user_supabase(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: dict = Depends(auth.get_current_active_user_supabase)):
    return current_user

# Users endpoints
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, "admin")
    db_user = crud_supabase.get_user_by_username(username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user = crud_supabase.get_user_by_email(email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_supabase.create_user(user=user)

# Endpoint temporário para criar primeiro usuário admin
@app.post("/setup/admin", response_model=schemas.User)
def create_admin_user(user: schemas.UserCreate):
    # Verifica se já existe algum usuário admin
    existing_admin = crud_supabase.get_users_by_role(role="admin")
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin user already exists")
    
    # Força o role como admin
    user.role = "admin"
    db_user = crud_supabase.get_user_by_username(username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user = crud_supabase.get_user_by_email(email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_supabase.create_user(user=user)

# Clinics endpoints
@app.post("/clinics/", response_model=schemas.Clinic)
def create_clinic(clinic: schemas.ClinicCreate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, "admin")
    db_clinic = crud_supabase.get_clinic_by_cnpj(cnpj=clinic.cnpj)
    if db_clinic:
        raise HTTPException(status_code=400, detail="CNPJ already registered")
    return crud_supabase.create_clinic(clinic=clinic)

@app.get("/clinics/", response_model=List[schemas.Clinic])
def read_clinics(skip: int = 0, limit: int = 100, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    clinics = crud_supabase.get_clinics(skip=skip, limit=limit)
    return clinics

@app.get("/clinics/{clinic_id}", response_model=schemas.Clinic)
def read_clinic(clinic_id: int, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    db_clinic = crud_supabase.get_clinic(clinic_id=clinic_id)
    if db_clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return db_clinic

@app.put("/clinics/{clinic_id}", response_model=schemas.Clinic)
def update_clinic(clinic_id: int, clinic: schemas.ClinicUpdate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, "admin")
    db_clinic = crud_supabase.update_clinic(clinic_id=clinic_id, clinic=clinic)
    if db_clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return db_clinic

@app.delete("/clinics/{clinic_id}")
def delete_clinic(clinic_id: int, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, "admin")
    success = crud_supabase.delete_clinic(clinic_id=clinic_id)
    if not success:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return {"message": "Clinic deleted successfully"}

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, "admin")
    users = crud_supabase.get_users(skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    db_user = crud_supabase.get_user(user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, "admin")
    db_user = crud_supabase.update_user(user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, "admin")
    success = crud_supabase.delete_user(user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# Patients endpoints
@app.post("/patients/", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    db_patient = crud_supabase.get_patient_by_cpf(cpf=patient.cpf, clinic_id=current_user["clinic_id"])
    if db_patient:
        raise HTTPException(status_code=400, detail="CPF already registered")
    return crud_supabase.create_patient(patient=patient, clinic_id=current_user["clinic_id"])

@app.get("/patients/", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, search: Optional[str] = None, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    patients = crud_supabase.get_patients(clinic_id=current_user["clinic_id"], skip=skip, limit=limit, search=search)
    return patients

@app.get("/patients/{patient_id}", response_model=schemas.Patient)
def read_patient(patient_id: int, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    db_patient = crud_supabase.get_patient(patient_id=patient_id, clinic_id=current_user["clinic_id"])
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient

@app.put("/patients/{patient_id}", response_model=schemas.Patient)
def update_patient(patient_id: int, patient: schemas.PatientUpdate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    db_patient = crud_supabase.update_patient(patient_id=patient_id, patient=patient, clinic_id=current_user["clinic_id"])
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient

# Doctors endpoints
@app.post("/doctors/", response_model=schemas.Doctor)
def create_doctor(doctor: schemas.DoctorCreate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, "admin")
    db_doctor = crud_supabase.get_doctor_by_crm(crm=doctor.crm, clinic_id=current_user["clinic_id"])
    if db_doctor:
        raise HTTPException(status_code=400, detail="CRM already registered")
    return crud_supabase.create_doctor(doctor=doctor, clinic_id=current_user["clinic_id"])

@app.get("/doctors/", response_model=List[schemas.Doctor])
def read_doctors(skip: int = 0, limit: int = 100, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    doctors = crud_supabase.get_doctors(clinic_id=current_user["clinic_id"], skip=skip, limit=limit)
    return doctors

@app.get("/doctors/{doctor_id}", response_model=schemas.Doctor)
def read_doctor(doctor_id: int, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    db_doctor = crud_supabase.get_doctor(doctor_id=doctor_id, clinic_id=current_user["clinic_id"])
    if db_doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return db_doctor

# Appointments endpoints
@app.post("/appointments/", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    return crud_supabase.create_appointment(appointment=appointment, clinic_id=current_user["clinic_id"])

@app.get("/appointments/", response_model=List[schemas.Appointment])
def read_appointments(skip: int = 0, limit: int = 100, patient_id: Optional[int] = None, doctor_id: Optional[int] = None, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    appointments = crud_supabase.get_appointments(clinic_id=current_user["clinic_id"], skip=skip, limit=limit, patient_id=patient_id, doctor_id=doctor_id)
    return appointments

@app.get("/appointments/{appointment_id}", response_model=schemas.Appointment)
def read_appointment(appointment_id: int, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    db_appointment = crud_supabase.get_appointment(appointment_id=appointment_id, clinic_id=current_user["clinic_id"])
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment

@app.put("/appointments/{appointment_id}", response_model=schemas.Appointment)
def update_appointment(appointment_id: int, appointment: schemas.AppointmentUpdate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    db_appointment = crud_supabase.update_appointment(appointment_id=appointment_id, appointment=appointment, clinic_id=current_user["clinic_id"])
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment

# Medical Records endpoints
@app.post("/medical-records/", response_model=schemas.MedicalRecord)
def create_medical_record(record: schemas.MedicalRecordCreate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, ["medico", "admin"])
    return crud_supabase.create_medical_record(record=record, clinic_id=current_user["clinic_id"])

@app.get("/medical-records/", response_model=List[schemas.MedicalRecord])
def read_medical_records(skip: int = 0, limit: int = 100, patient_id: Optional[int] = None, doctor_id: Optional[int] = None, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    records = crud_supabase.get_medical_records(clinic_id=current_user["clinic_id"], skip=skip, limit=limit, patient_id=patient_id, doctor_id=doctor_id)
    return records

@app.get("/medical-records/{record_id}", response_model=schemas.MedicalRecord)
def read_medical_record(record_id: int, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    db_record = crud_supabase.get_medical_record(record_id=record_id, clinic_id=current_user["clinic_id"])
    if db_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return db_record

@app.put("/medical-records/{record_id}", response_model=schemas.MedicalRecord)
def update_medical_record(record_id: int, record: schemas.MedicalRecordUpdate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, ["medico", "admin"])
    db_record = crud_supabase.update_medical_record(record_id=record_id, record=record, clinic_id=current_user["clinic_id"])
    if db_record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return db_record

# Prescription endpoints
@app.post("/prescriptions/", response_model=schemas.Prescription)
def create_prescription(
    prescription: schemas.PrescriptionCreate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, ["medico", "admin"])
    return crud_supabase.create_prescription(prescription=prescription, clinic_id=current_user["clinic_id"])

@app.get("/prescriptions/", response_model=List[schemas.Prescription])
def read_prescriptions(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_prescriptions(clinic_id=current_user["clinic_id"], skip=skip, limit=limit)

@app.get("/prescriptions/{prescription_id}", response_model=schemas.Prescription)
def read_prescription(
    prescription_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_prescription = crud_supabase.get_prescription(prescription_id=prescription_id, clinic_id=current_user["clinic_id"])
    if db_prescription is None:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return db_prescription

@app.get("/prescriptions/patient/{patient_id}", response_model=List[schemas.Prescription])
def read_prescriptions_by_patient(
    patient_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_prescriptions_by_patient(patient_id=patient_id, clinic_id=current_user["clinic_id"], skip=skip, limit=limit)

@app.get("/prescriptions/medical-record/{medical_record_id}", response_model=List[schemas.Prescription])
def read_prescriptions_by_medical_record(
    medical_record_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_prescriptions_by_medical_record(medical_record_id=medical_record_id, clinic_id=current_user["clinic_id"])

@app.put("/prescriptions/{prescription_id}", response_model=schemas.Prescription)
def update_prescription(
    prescription_id: int,
    prescription: schemas.PrescriptionUpdate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, ["medico", "admin"])
    db_prescription = crud_supabase.update_prescription(prescription_id=prescription_id, prescription=prescription, clinic_id=current_user["clinic_id"])
    if db_prescription is None:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return db_prescription

@app.delete("/prescriptions/{prescription_id}")
def delete_prescription(
    prescription_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, ["medico", "admin"])
    db_prescription = crud_supabase.delete_prescription(prescription_id=prescription_id, clinic_id=current_user["clinic_id"])
    if db_prescription is None:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return {"message": "Prescription deleted successfully"}

# Medications endpoints
@app.post("/medications/", response_model=schemas.Medication)
def create_medication(medication: schemas.MedicationCreate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, ["admin", "enfermeiro"])
    return crud_supabase.create_medication(medication=medication, clinic_id=current_user["clinic_id"])

@app.get("/medications/", response_model=List[schemas.Medication])
def read_medications(skip: int = 0, limit: int = 100, search: Optional[str] = None, low_stock: bool = False, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    medications = crud_supabase.get_medications(clinic_id=current_user["clinic_id"], skip=skip, limit=limit, search=search, low_stock=low_stock)
    return medications

@app.get("/medications/{medication_id}", response_model=schemas.Medication)
def read_medication(medication_id: int, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    db_medication = crud_supabase.get_medication(medication_id=medication_id, clinic_id=current_user["clinic_id"])
    if db_medication is None:
        raise HTTPException(status_code=404, detail="Medication not found")
    return db_medication

@app.put("/medications/{medication_id}", response_model=schemas.Medication)
def update_medication(medication_id: int, medication: schemas.MedicationUpdate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, ["admin", "enfermeiro"])
    db_medication = crud_supabase.update_medication(medication_id=medication_id, medication=medication, clinic_id=current_user["clinic_id"])
    if db_medication is None:
        raise HTTPException(status_code=404, detail="Medication not found")
    return db_medication

# Stock Movements endpoints
@app.post("/stock-movements/", response_model=schemas.StockMovement)
def create_stock_movement(movement: schemas.StockMovementCreate, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    auth.check_permission_supabase(current_user, ["admin", "enfermeiro"])
    return crud_supabase.create_stock_movement(movement=movement, clinic_id=current_user["clinic_id"])

@app.get("/stock-movements/", response_model=List[schemas.StockMovement])
def read_stock_movements(skip: int = 0, limit: int = 100, medication_id: Optional[int] = None, current_user: dict = Depends(auth.get_current_active_user_supabase)):
    movements = crud_supabase.get_stock_movements(clinic_id=current_user["clinic_id"], skip=skip, limit=limit, medication_id=medication_id)
    return movements

# Financial Transactions endpoints
@app.post("/financial-transactions/", response_model=schemas.FinancialTransaction)
def create_financial_transaction(
    transaction: schemas.FinancialTransactionCreate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, ["admin", "financeiro"])
    return crud_supabase.create_financial_transaction(transaction=transaction, clinic_id=current_user["clinic_id"])

@app.get("/financial-transactions/", response_model=List[schemas.FinancialTransaction])
def read_financial_transactions(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_financial_transactions(clinic_id=current_user["clinic_id"], skip=skip, limit=limit)

@app.get("/financial-transactions/{transaction_id}", response_model=schemas.FinancialTransaction)
def read_financial_transaction(
    transaction_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_transaction = crud_supabase.get_financial_transaction(transaction_id=transaction_id, clinic_id=current_user["clinic_id"])
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Financial transaction not found")
    return db_transaction

@app.put("/financial-transactions/{transaction_id}", response_model=schemas.FinancialTransaction)
def update_financial_transaction(
    transaction_id: int,
    transaction: schemas.FinancialTransactionUpdate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, ["admin", "financeiro"])
    db_transaction = crud_supabase.update_financial_transaction(transaction_id=transaction_id, transaction=transaction, clinic_id=current_user["clinic_id"])
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Financial transaction not found")
    return db_transaction

@app.delete("/financial-transactions/{transaction_id}")
def delete_financial_transaction(
    transaction_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, ["admin", "financeiro"])
    db_transaction = crud_supabase.delete_financial_transaction(transaction_id=transaction_id, clinic_id=current_user["clinic_id"])
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Financial transaction not found")
    return {"message": "Financial transaction deleted successfully"}

# Anamnesis endpoints
@app.post("/anamnesis/", response_model=schemas.Anamnesis)
def create_anamnesis(
    anamnesis: schemas.AnamnesisCreate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.create_anamnesis(anamnesis=anamnesis, clinic_id=current_user["clinic_id"])

@app.get("/anamnesis/", response_model=List[schemas.Anamnesis])
def read_anamneses(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_anamneses(clinic_id=current_user["clinic_id"], skip=skip, limit=limit)

@app.get("/anamnesis/{anamnesis_id}", response_model=schemas.Anamnesis)
def read_anamnesis(
    anamnesis_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_anamnesis = crud_supabase.get_anamnesis(anamnesis_id=anamnesis_id, clinic_id=current_user["clinic_id"])
    if db_anamnesis is None:
        raise HTTPException(status_code=404, detail="Anamnesis not found")
    return db_anamnesis

@app.get("/anamnesis/medical-record/{medical_record_id}", response_model=schemas.Anamnesis)
def read_anamnesis_by_medical_record(
    medical_record_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_anamnesis = crud_supabase.get_anamnesis_by_medical_record(medical_record_id=medical_record_id, clinic_id=current_user["clinic_id"])
    if db_anamnesis is None:
        raise HTTPException(status_code=404, detail="Anamnesis not found for this medical record")
    return db_anamnesis

@app.put("/anamnesis/{anamnesis_id}", response_model=schemas.Anamnesis)
def update_anamnesis(
    anamnesis_id: int,
    anamnesis: schemas.AnamnesisUpdate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_anamnesis = crud_supabase.update_anamnesis(anamnesis_id=anamnesis_id, anamnesis=anamnesis, clinic_id=current_user["clinic_id"])
    if db_anamnesis is None:
        raise HTTPException(status_code=404, detail="Anamnesis not found")
    return db_anamnesis

@app.delete("/anamnesis/{anamnesis_id}")
def delete_anamnesis(
    anamnesis_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_anamnesis = crud_supabase.delete_anamnesis(anamnesis_id=anamnesis_id, clinic_id=current_user["clinic_id"])
    if db_anamnesis is None:
        raise HTTPException(status_code=404, detail="Anamnesis not found")
    return {"message": "Anamnesis deleted successfully"}

# Physical Exam endpoints
@app.post("/physical-exams/", response_model=schemas.PhysicalExam)
def create_physical_exam(
    exam: schemas.PhysicalExamCreate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.create_physical_exam(exam=exam, clinic_id=current_user["clinic_id"])

@app.get("/physical-exams/", response_model=List[schemas.PhysicalExam])
def read_physical_exams(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_physical_exams(clinic_id=current_user["clinic_id"], skip=skip, limit=limit)

@app.get("/physical-exams/{exam_id}", response_model=schemas.PhysicalExam)
def read_physical_exam(
    exam_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_exam = crud_supabase.get_physical_exam(exam_id=exam_id, clinic_id=current_user["clinic_id"])
    if db_exam is None:
        raise HTTPException(status_code=404, detail="Physical exam not found")
    return db_exam

@app.get("/physical-exams/medical-record/{medical_record_id}", response_model=schemas.PhysicalExam)
def read_physical_exam_by_medical_record(
    medical_record_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_exam = crud_supabase.get_physical_exam_by_medical_record(medical_record_id=medical_record_id, clinic_id=current_user["clinic_id"])
    if db_exam is None:
        raise HTTPException(status_code=404, detail="Physical exam not found for this medical record")
    return db_exam

@app.put("/physical-exams/{exam_id}", response_model=schemas.PhysicalExam)
def update_physical_exam(
    exam_id: int,
    exam: schemas.PhysicalExamUpdate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_exam = crud_supabase.update_physical_exam(exam_id=exam_id, exam=exam, clinic_id=current_user["clinic_id"])
    if db_exam is None:
        raise HTTPException(status_code=404, detail="Physical exam not found")
    return db_exam

@app.delete("/physical-exams/{exam_id}")
def delete_physical_exam(
    exam_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_exam = crud_supabase.delete_physical_exam(exam_id=exam_id, clinic_id=current_user["clinic_id"])
    if db_exam is None:
        raise HTTPException(status_code=404, detail="Physical exam not found")
    return {"message": "Physical exam deleted successfully"}

# Medical Document endpoints
@app.post("/medical-documents/", response_model=schemas.MedicalDocument)
def create_medical_document(
    document: schemas.MedicalDocumentCreate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.create_medical_document(document=document, clinic_id=current_user["clinic_id"])

@app.get("/medical-documents/", response_model=List[schemas.MedicalDocument])
def read_medical_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_medical_documents(clinic_id=current_user["clinic_id"], skip=skip, limit=limit)

@app.get("/medical-documents/{document_id}", response_model=schemas.MedicalDocument)
def read_medical_document(
    document_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_document = crud_supabase.get_medical_document(document_id=document_id, clinic_id=current_user["clinic_id"])
    if db_document is None:
        raise HTTPException(status_code=404, detail="Medical document not found")
    return db_document

@app.get("/medical-documents/patient/{patient_id}", response_model=List[schemas.MedicalDocument])
def read_medical_documents_by_patient(
    patient_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_medical_documents_by_patient(patient_id=patient_id, clinic_id=current_user["clinic_id"], skip=skip, limit=limit)

@app.get("/medical-documents/medical-record/{medical_record_id}", response_model=List[schemas.MedicalDocument])
def read_medical_documents_by_medical_record(
    medical_record_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_medical_documents_by_medical_record(medical_record_id=medical_record_id, clinic_id=current_user["clinic_id"], skip=skip, limit=limit)

@app.put("/medical-documents/{document_id}", response_model=schemas.MedicalDocument)
def update_medical_document(
    document_id: int,
    document: schemas.MedicalDocumentUpdate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_document = crud_supabase.update_medical_document(document_id=document_id, document=document, clinic_id=current_user["clinic_id"])
    if db_document is None:
        raise HTTPException(status_code=404, detail="Medical document not found")
    return db_document

@app.delete("/medical-documents/{document_id}")
def delete_medical_document(
    document_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_document = crud_supabase.delete_medical_document(document_id=document_id, clinic_id=current_user["clinic_id"])
    if db_document is None:
        raise HTTPException(status_code=404, detail="Medical document not found")
    return {"message": "Medical document deleted successfully"}

# Prescription Medication endpoints
@app.post("/prescription-medications/", response_model=schemas.PrescriptionMedication)
def create_prescription_medication(
    medication: schemas.PrescriptionMedicationCreate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.create_prescription_medication(medication=medication, clinic_id=current_user["clinic_id"])

@app.get("/prescription-medications/", response_model=List[schemas.PrescriptionMedication])
def read_prescription_medications(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_prescription_medications(clinic_id=current_user["clinic_id"], skip=skip, limit=limit)

@app.get("/prescription-medications/{medication_id}", response_model=schemas.PrescriptionMedication)
def read_prescription_medication(
    medication_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_medication = crud_supabase.get_prescription_medication(medication_id=medication_id, clinic_id=current_user["clinic_id"])
    if db_medication is None:
        raise HTTPException(status_code=404, detail="Prescription medication not found")
    return db_medication

@app.get("/prescription-medications/prescription/{prescription_id}", response_model=List[schemas.PrescriptionMedication])
def read_prescription_medications_by_prescription(
    prescription_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_prescription_medications_by_prescription(prescription_id=prescription_id, clinic_id=current_user["clinic_id"])

@app.put("/prescription-medications/{medication_id}", response_model=schemas.PrescriptionMedication)
def update_prescription_medication(
    medication_id: int,
    medication: schemas.PrescriptionMedicationUpdate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_medication = crud_supabase.update_prescription_medication(medication_id=medication_id, medication=medication, clinic_id=current_user["clinic_id"])
    if db_medication is None:
        raise HTTPException(status_code=404, detail="Prescription medication not found")
    return db_medication

@app.delete("/prescription-medications/{medication_id}")
def delete_prescription_medication(
    medication_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_medication = crud_supabase.delete_prescription_medication(medication_id=medication_id, clinic_id=current_user["clinic_id"])
    if db_medication is None:
        raise HTTPException(status_code=404, detail="Prescription medication not found")
    return {"message": "Prescription medication deleted successfully"}

# CID Diagnosis endpoints
@app.get("/cid-diagnoses/", response_model=List[schemas.CidDiagnosis])
def read_cid_diagnoses(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_cid_diagnoses(clinic_id=current_user["clinic_id"], skip=skip, limit=limit)

@app.get("/cid-diagnoses/{cid_id}", response_model=schemas.CidDiagnosis)
def read_cid_diagnosis(
    cid_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_cid = crud_supabase.get_cid_diagnosis(cid_id=cid_id, clinic_id=current_user["clinic_id"])
    if db_cid is None:
        raise HTTPException(status_code=404, detail="CID diagnosis not found")
    return db_cid

# ETAPA 4 - Faturamento e Financeiro Endpoints

# Insurance Company endpoints
@app.post("/insurance-companies/", response_model=schemas.InsuranceCompany)
def create_insurance_company(
    company: schemas.InsuranceCompanyCreate,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.create_insurance_company(company=company, clinic_id=current_user["clinic_id"])

@app.get("/insurance-companies/", response_model=List[schemas.InsuranceCompany])
def read_insurance_companies(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_insurance_companies(clinic_id=current_user["clinic_id"], skip=skip, limit=limit)

@app.get("/insurance-companies/{company_id}", response_model=schemas.InsuranceCompany)
def read_insurance_company(
    company_id: int,
    current_user: dict = Depends(auth.get_current_active_user_supabase)
):
    db_company = crud_supabase.get_insurance_company(company_id=company_id, clinic_id=current_user["clinic_id"])
    if db_company is None:
        raise HTTPException(status_code=404, detail="Insurance company not found")
    return db_company

@app.put("/insurance-companies/{company_id}", response_model=schemas.InsuranceCompany)
def update_insurance_company(
    company_id: int,
    company: schemas.InsuranceCompanyUpdate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    db_company = crud_supabase.update_insurance_company(
        clinic_id=current_user.clinic_id,
        company_id=company_id, 
        company=company
    )
    if db_company is None:
        raise HTTPException(status_code=404, detail="Insurance company not found")
    return db_company

# TUSS Procedure endpoints
@app.post("/tuss-procedures/", response_model=schemas.TussProcedure)
def create_tuss_procedure(
    procedure: schemas.TussProcedureCreate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "medico"]))
):
    return crud_supabase.create_tuss_procedure(
        clinic_id=current_user.clinic_id,
        procedure=procedure
    )

@app.get("/tuss-procedures/", response_model=List[schemas.TussProcedure])
def read_tuss_procedures(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    return crud_supabase.get_tuss_procedures(
        clinic_id=current_user.clinic_id,
        skip=skip, 
        limit=limit, 
        search=search
    )

@app.get("/tuss-procedures/{procedure_id}", response_model=schemas.TussProcedure)
def read_tuss_procedure(
    procedure_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    db_procedure = crud_supabase.get_tuss_procedure(
        clinic_id=current_user.clinic_id,
        procedure_id=procedure_id
    )
    if db_procedure is None:
        raise HTTPException(status_code=404, detail="TUSS procedure not found")
    return db_procedure

# Billing Batch endpoints
@app.post("/billing-batches/", response_model=schemas.BillingBatch)
def create_billing_batch(
    batch: schemas.BillingBatchCreate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    return crud_supabase.create_billing_batch(
        clinic_id=current_user.clinic_id,
        batch=batch
    )

@app.get("/billing-batches/", response_model=List[schemas.BillingBatch])
def read_billing_batches(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    return crud_supabase.get_billing_batches(
        clinic_id=current_user.clinic_id,
        skip=skip, 
        limit=limit, 
        status=status
    )

@app.get("/billing-batches/{batch_id}", response_model=schemas.BillingBatch)
def read_billing_batch(
    batch_id: int,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    db_batch = crud_supabase.get_billing_batch(
        clinic_id=current_user.clinic_id,
        batch_id=batch_id
    )
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Billing batch not found")
    return db_batch

@app.put("/billing-batches/{batch_id}", response_model=schemas.BillingBatch)
def update_billing_batch(
    batch_id: int,
    batch: schemas.BillingBatchUpdate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    db_batch = crud_supabase.update_billing_batch(
        clinic_id=current_user.clinic_id,
        batch_id=batch_id, 
        batch=batch
    )
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Billing batch not found")
    return db_batch

# Billing Item endpoints
@app.post("/billing-items/", response_model=schemas.BillingItem)
def create_billing_item(
    item: schemas.BillingItemCreate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    return crud_supabase.create_billing_item(
        clinic_id=current_user.clinic_id,
        item=item
    )

@app.get("/billing-items/", response_model=List[schemas.BillingItem])
def read_billing_items(
    skip: int = 0,
    limit: int = 100,
    batch_id: Optional[int] = None,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    return crud_supabase.get_billing_items(
        clinic_id=current_user.clinic_id,
        skip=skip, 
        limit=limit, 
        batch_id=batch_id
    )

# Accounts Receivable endpoints
@app.post("/accounts-receivable/", response_model=schemas.AccountsReceivable)
def create_accounts_receivable(
    receivable: schemas.AccountsReceivableCreate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    return crud_supabase.create_accounts_receivable(
        clinic_id=current_user.clinic_id,
        receivable=receivable
    )

@app.get("/accounts-receivable/", response_model=List[schemas.AccountsReceivable])
def read_accounts_receivable(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    return crud_supabase.get_accounts_receivable(
        clinic_id=current_user.clinic_id,
        skip=skip, 
        limit=limit, 
        status=status
    )

@app.get("/accounts-receivable/{receivable_id}", response_model=schemas.AccountsReceivable)
def read_accounts_receivable_item(
    receivable_id: int,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    db_receivable = crud_supabase.get_accounts_receivable_item(
        clinic_id=current_user.clinic_id,
        receivable_id=receivable_id
    )
    if db_receivable is None:
        raise HTTPException(status_code=404, detail="Accounts receivable not found")
    return db_receivable

@app.put("/accounts-receivable/{receivable_id}", response_model=schemas.AccountsReceivable)
def update_accounts_receivable(
    receivable_id: int,
    receivable: schemas.AccountsReceivableUpdate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    db_receivable = crud_supabase.update_accounts_receivable(
        clinic_id=current_user.clinic_id,
        receivable_id=receivable_id, 
        receivable=receivable
    )
    if db_receivable is None:
        raise HTTPException(status_code=404, detail="Accounts receivable not found")
    return db_receivable

# Accounts Payable endpoints
@app.post("/accounts-payable/", response_model=schemas.AccountsPayable)
def create_accounts_payable(
    payable: schemas.AccountsPayableCreate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    return crud_supabase.create_accounts_payable(
        clinic_id=current_user.clinic_id,
        payable=payable
    )

@app.get("/accounts-payable/", response_model=List[schemas.AccountsPayable])
def read_accounts_payable(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    return crud_supabase.get_accounts_payable(
        clinic_id=current_user.clinic_id,
        skip=skip, 
        limit=limit, 
        status=status
    )

@app.get("/accounts-payable/{payable_id}", response_model=schemas.AccountsPayable)
def read_accounts_payable_item(
    payable_id: int,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    db_payable = crud_supabase.get_accounts_payable_item(
        clinic_id=current_user.clinic_id,
        payable_id=payable_id
    )
    if db_payable is None:
        raise HTTPException(status_code=404, detail="Accounts payable not found")
    return db_payable

@app.put("/accounts-payable/{payable_id}", response_model=schemas.AccountsPayable)
def update_accounts_payable(
    payable_id: int,
    payable: schemas.AccountsPayableUpdate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    db_payable = crud_supabase.update_accounts_payable(
        clinic_id=current_user.clinic_id,
        payable_id=payable_id, 
        payable=payable
    )
    if db_payable is None:
        raise HTTPException(status_code=404, detail="Accounts payable not found")
    return db_payable

# Cash Flow endpoints
@app.post("/cash-flow/", response_model=schemas.CashFlow)
def create_cash_flow(
    cash_flow: schemas.CashFlowCreate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    return crud_supabase.create_cash_flow(
        clinic_id=current_user.clinic_id,
        cash_flow=cash_flow
    )

@app.get("/cash-flow/", response_model=List[schemas.CashFlow])
def read_cash_flow(
    skip: int = 0,
    limit: int = 100,
    transaction_type: Optional[str] = None,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    return crud_supabase.get_cash_flow(
        clinic_id=current_user.clinic_id,
        skip=skip, 
        limit=limit, 
        transaction_type=transaction_type
    )

@app.get("/cash-flow/{cash_flow_id}", response_model=schemas.CashFlow)
def read_cash_flow_item(
    cash_flow_id: int,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "financeiro"]))
):
    db_cash_flow = crud_supabase.get_cash_flow_item(
        clinic_id=current_user.clinic_id,
        cash_flow_id=cash_flow_id
    )
    if db_cash_flow is None:
        raise HTTPException(status_code=404, detail="Cash flow not found")
    return db_cash_flow

@app.get("/cid-diagnoses/code/{code}", response_model=schemas.CidDiagnosis)
def read_cid_diagnosis_by_code(
    code: str,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "medical_read")
    db_cid = crud_supabase.get_cid_diagnosis_by_code(
        clinic_id=current_user.clinic_id,
        code=code
    )
    if db_cid is None:
        raise HTTPException(status_code=404, detail="CID diagnosis not found")
    return db_cid

@app.get("/cid-diagnoses/search/{search_term}", response_model=List[schemas.CidDiagnosis])
def search_cid_diagnoses(
    search_term: str,
    skip: int = 0,
    limit: int = 20,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "medical_read")
    return crud_supabase.search_cid_diagnosis(
        clinic_id=current_user.clinic_id,
        search_term=search_term, 
        skip=skip, 
        limit=limit
    )

# Medical Record Diagnosis endpoints
@app.post("/medical-record-diagnoses/", response_model=schemas.MedicalRecordDiagnosis)
def create_medical_record_diagnosis(
    diagnosis: schemas.MedicalRecordDiagnosisCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "medical_write")
    return crud_supabase.create_medical_record_diagnosis(
        clinic_id=current_user.clinic_id,
        diagnosis=diagnosis
    )

@app.get("/medical-record-diagnoses/{diagnosis_id}", response_model=schemas.MedicalRecordDiagnosis)
def read_medical_record_diagnosis(
    diagnosis_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "medical_read")
    db_diagnosis = crud_supabase.get_medical_record_diagnosis(
        clinic_id=current_user.clinic_id,
        diagnosis_id=diagnosis_id
    )
    if db_diagnosis is None:
        raise HTTPException(status_code=404, detail="Medical record diagnosis not found")
    return db_diagnosis

@app.get("/medical-record-diagnoses/medical-record/{medical_record_id}", response_model=List[schemas.MedicalRecordDiagnosis])
def read_medical_record_diagnoses_by_record(
    medical_record_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "medical_read")
    return crud_supabase.get_medical_record_diagnoses_by_record(
        clinic_id=current_user.clinic_id,
        medical_record_id=medical_record_id
    )

@app.delete("/medical-record-diagnoses/{diagnosis_id}")
def delete_medical_record_diagnosis(
    diagnosis_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "medical_write")
    db_diagnosis = crud_supabase.delete_medical_record_diagnosis(
        clinic_id=current_user.clinic_id,
        diagnosis_id=diagnosis_id
    )
    if db_diagnosis is None:
        raise HTTPException(status_code=404, detail="Medical record diagnosis not found")
    return {"message": "Medical record diagnosis deleted successfully"}

# Medical Record Template endpoints
@app.post("/medical-record-templates/", response_model=schemas.MedicalRecordTemplate)
def create_medical_record_template(
    template: schemas.MedicalRecordTemplateCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "admin")
    return crud_supabase.create_medical_record_template(
        clinic_id=current_user.clinic_id,
        template=template
    )

@app.get("/medical-record-templates/", response_model=List[schemas.MedicalRecordTemplate])
def read_medical_record_templates(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "medical_read")
    return crud_supabase.get_medical_record_templates(
        clinic_id=current_user.clinic_id,
        skip=skip, 
        limit=limit
    )

@app.get("/medical-record-templates/{template_id}", response_model=schemas.MedicalRecordTemplate)
def read_medical_record_template(
    template_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "medical_read")
    db_template = crud_supabase.get_medical_record_template(
        clinic_id=current_user.clinic_id,
        template_id=template_id
    )
    if db_template is None:
        raise HTTPException(status_code=404, detail="Medical record template not found")
    return db_template

@app.get("/medical-record-templates/clinic/{clinic_id}", response_model=List[schemas.MedicalRecordTemplate])
def read_medical_record_templates_by_clinic(
    clinic_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "medical_read")
    return crud_supabase.get_medical_record_templates_by_clinic(
        clinic_id=current_user.clinic_id,
        target_clinic_id=clinic_id, 
        skip=skip, 
        limit=limit
    )

@app.put("/medical-record-templates/{template_id}", response_model=schemas.MedicalRecordTemplate)
def update_medical_record_template(
    template_id: int,
    template: schemas.MedicalRecordTemplateUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "admin")
    db_template = crud_supabase.update_medical_record_template(
        clinic_id=current_user.clinic_id,
        template_id=template_id, 
        template=template
    )
    if db_template is None:
        raise HTTPException(status_code=404, detail="Medical record template not found")
    return db_template

@app.delete("/medical-record-templates/{template_id}")
def delete_medical_record_template(
    template_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "admin")
    db_template = crud_supabase.delete_medical_record_template(
        clinic_id=current_user.clinic_id,
        template_id=template_id
    )
    if db_template is None:
        raise HTTPException(status_code=404, detail="Medical record template not found")
    return {"message": "Medical record template deleted successfully"}

# ===== GESTÃO FINANCEIRA AVANÇADA =====

# Invoice NFS endpoints
@app.post("/invoices-nfs/", response_model=schemas.InvoiceNFS)
def create_invoice_nfs(
    invoice: schemas.InvoiceNFSCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    try:
        return crud_supabase.create_invoice_nfs(
            clinic_id=current_user.clinic_id,
            invoice=invoice, 
            user_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/invoices-nfs/", response_model=List[schemas.InvoiceNFS])
def read_invoices_nfs(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    return crud_supabase.get_invoices_nfs(
        clinic_id=current_user.clinic_id, 
        skip=skip, 
        limit=limit, 
        status=status
    )

@app.get("/invoices-nfs/{invoice_id}", response_model=schemas.InvoiceNFS)
def read_invoice_nfs(
    invoice_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    db_invoice = crud_supabase.get_invoice_nfs(
        clinic_id=current_user.clinic_id,
        invoice_id=invoice_id
    )
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

@app.put("/invoices-nfs/{invoice_id}", response_model=schemas.InvoiceNFS)
def update_invoice_nfs(
    invoice_id: int,
    invoice: schemas.InvoiceNFSUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    db_invoice = crud_supabase.update_invoice_nfs(
        clinic_id=current_user.clinic_id,
        invoice_id=invoice_id, 
        invoice=invoice
    )
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

# Cost Center endpoints
@app.post("/cost-centers/", response_model=schemas.CostCenter)
def create_cost_center(
    cost_center: schemas.CostCenterCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    return crud_supabase.create_cost_center(
        clinic_id=current_user.clinic_id,
        cost_center=cost_center
    )

@app.get("/cost-centers/", response_model=List[schemas.CostCenter])
def read_cost_centers(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    return crud_supabase.get_cost_centers(
        clinic_id=current_user.clinic_id, 
        skip=skip, 
        limit=limit
    )

@app.get("/cost-centers/{cost_center_id}", response_model=schemas.CostCenter)
def read_cost_center(
    cost_center_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    db_cost_center = crud_supabase.get_cost_center(
        clinic_id=current_user.clinic_id,
        cost_center_id=cost_center_id
    )
    if db_cost_center is None:
        raise HTTPException(status_code=404, detail="Cost center not found")
    return db_cost_center

@app.put("/cost-centers/{cost_center_id}", response_model=schemas.CostCenter)
def update_cost_center(
    cost_center_id: int,
    cost_center: schemas.CostCenterUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    db_cost_center = crud_supabase.update_cost_center(
        clinic_id=current_user.clinic_id,
        cost_center_id=cost_center_id, 
        cost_center=cost_center
    )
    if db_cost_center is None:
        raise HTTPException(status_code=404, detail="Cost center not found")
    return db_cost_center

# Tax Configuration endpoints
@app.post("/tax-configurations/", response_model=schemas.TaxConfiguration)
def create_tax_configuration(
    config: schemas.TaxConfigurationCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "admin")
    return crud_supabase.create_tax_configuration(
        clinic_id=current_user.clinic_id,
        config=config
    )

@app.get("/tax-configurations/", response_model=List[schemas.TaxConfiguration])
def read_tax_configurations(
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    return crud_supabase.get_tax_configurations(
        clinic_id=current_user.clinic_id
    )

@app.get("/tax-configurations/active", response_model=schemas.TaxConfiguration)
def read_active_tax_configuration(
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    db_config = crud_supabase.get_active_tax_configuration(
        clinic_id=current_user.clinic_id
    )
    if db_config is None:
        raise HTTPException(status_code=404, detail="Active tax configuration not found")
    return db_config

@app.put("/tax-configurations/{config_id}", response_model=schemas.TaxConfiguration)
def update_tax_configuration(
    config_id: int,
    config: schemas.TaxConfigurationUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "admin")
    db_config = crud_supabase.update_tax_configuration(
        clinic_id=current_user.clinic_id,
        config_id=config_id,
        config=config
    )
    if db_config is None or db_config.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=404, detail="Tax configuration not found")
    return db_config

# Bank Account endpoints
@app.post("/bank-accounts/", response_model=schemas.BankAccount)
def create_bank_account(
    account: schemas.BankAccountCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    return crud_supabase.create_bank_account(
        clinic_id=current_user.clinic_id,
        account=account
    )

@app.get("/bank-accounts/", response_model=List[schemas.BankAccount])
def read_bank_accounts(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    return crud_supabase.get_bank_accounts(
        clinic_id=current_user.clinic_id,
        skip=skip,
        limit=limit
    )

@app.get("/bank-accounts/{account_id}", response_model=schemas.BankAccount)
def read_bank_account(
    account_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    db_account = crud_supabase.get_bank_account(
        clinic_id=current_user.clinic_id,
        account_id=account_id
    )
    if db_account is None or db_account.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=404, detail="Bank account not found")
    return db_account

@app.put("/bank-accounts/{account_id}", response_model=schemas.BankAccount)
def update_bank_account(
    account_id: int,
    account: schemas.BankAccountUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    db_account = crud_supabase.update_bank_account(
        clinic_id=current_user.clinic_id,
        account_id=account_id,
        account=account
    )
    if db_account is None or db_account.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=404, detail="Bank account not found")
    return db_account

# Bank Reconciliation endpoints
@app.post("/bank-reconciliations/", response_model=schemas.BankReconciliation)
def create_bank_reconciliation(
    reconciliation: schemas.BankReconciliationCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    return crud_supabase.create_bank_reconciliation(
        clinic_id=current_user.clinic_id,
        reconciliation=reconciliation,
        user_id=current_user.id
    )

@app.get("/bank-reconciliations/account/{bank_account_id}", response_model=List[schemas.BankReconciliation])
def read_bank_reconciliations(
    bank_account_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    return crud_supabase.get_bank_reconciliations(
        clinic_id=current_user.clinic_id,
        bank_account_id=bank_account_id,
        skip=skip,
        limit=limit
    )

@app.put("/bank-reconciliations/{reconciliation_id}", response_model=schemas.BankReconciliation)
def update_bank_reconciliation(
    reconciliation_id: int,
    reconciliation: schemas.BankReconciliationUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    db_reconciliation = crud_supabase.update_bank_reconciliation(
        clinic_id=current_user.clinic_id,
        reconciliation_id=reconciliation_id,
        reconciliation=reconciliation,
        user_id=current_user.id
    )
    if db_reconciliation is None:
        raise HTTPException(status_code=404, detail="Bank reconciliation not found")
    return db_reconciliation

# Doctor Payment endpoints
@app.post("/doctor-payments/", response_model=schemas.DoctorPayment)
def create_doctor_payment(
    payment: schemas.DoctorPaymentCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    return crud_supabase.create_doctor_payment(
        clinic_id=current_user.clinic_id,
        payment=payment,
        user_id=current_user.id
    )

@app.get("/doctor-payments/", response_model=List[schemas.DoctorPayment])
def read_doctor_payments(
    doctor_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    return crud_supabase.get_doctor_payments(
        clinic_id=current_user.clinic_id,
        doctor_id=doctor_id,
        skip=skip,
        limit=limit
    )

@app.get("/doctor-payments/{payment_id}", response_model=schemas.DoctorPayment)
def read_doctor_payment(
    payment_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    db_payment = crud_supabase.get_doctor_payment(
        clinic_id=current_user.clinic_id,
        payment_id=payment_id
    )
    if db_payment is None or db_payment.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=404, detail="Doctor payment not found")
    return db_payment

@app.put("/doctor-payments/{payment_id}", response_model=schemas.DoctorPayment)
def update_doctor_payment(
    payment_id: int,
    payment: schemas.DoctorPaymentUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    db_payment = crud_supabase.update_doctor_payment(
        clinic_id=current_user.clinic_id,
        payment_id=payment_id,
        payment=payment
    )
    if db_payment is None or db_payment.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=404, detail="Doctor payment not found")
    return db_payment

# Financial KPI endpoints
@app.post("/financial-kpis/", response_model=schemas.FinancialKPI)
def create_financial_kpi(
    kpi: schemas.FinancialKPICreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    return crud_supabase.create_financial_kpi(
        clinic_id=current_user.clinic_id,
        kpi=kpi
    )

@app.get("/financial-kpis/", response_model=List[schemas.FinancialKPI])
def read_financial_kpis(
    kpi_type: Optional[str] = None,
    period_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    return crud_supabase.get_financial_kpis(
        clinic_id=current_user.clinic_id,
        kpi_type=kpi_type,
        period_type=period_type,
        skip=skip,
        limit=limit
    )

# Supplier endpoints
@app.post("/suppliers/", response_model=schemas.Supplier)
def create_supplier(
    supplier: schemas.SupplierCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    return crud_supabase.create_supplier(
        clinic_id=current_user.clinic_id,
        supplier=supplier
    )

@app.get("/suppliers/", response_model=List[schemas.Supplier])
def read_suppliers(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    return crud_supabase.get_suppliers(
        clinic_id=current_user.clinic_id,
        category=category,
        skip=skip,
        limit=limit
    )

@app.get("/suppliers/{supplier_id}", response_model=schemas.Supplier)
def read_supplier(
    supplier_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_read")
    db_supplier = crud_supabase.get_supplier(
        clinic_id=current_user.clinic_id,
        supplier_id=supplier_id
    )
    if db_supplier is None or db_supplier.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier

@app.put("/suppliers/{supplier_id}", response_model=schemas.Supplier)
def update_supplier(
    supplier_id: int,
    supplier: schemas.SupplierUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    auth.check_permission_supabase(current_user, "financial_write")
    db_supplier = crud_supabase.update_supplier(
        clinic_id=current_user.clinic_id,
        supplier_id=supplier_id,
        supplier=supplier
    )
    if db_supplier is None or db_supplier.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier

# ===== RELATÓRIOS FINANCEIROS E DASHBOARD =====

@app.post("/financial-reports/dre", response_model=schemas.DREReport)
def generate_dre_report(
    request: schemas.FinancialReportRequest,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Gera Demonstração do Resultado do Exercício (DRE)"""
    # Implementar lógica de cálculo da DRE
    from datetime import datetime
    
    auth.check_permission_supabase(current_user, "financial_read")
    
    # Buscar receitas do período
    receitas = crud_supabase.get_accounts_receivable_by_period(
        clinic_id=current_user.clinic_id,
        start_date=request.start_date,
        end_date=request.end_date,
        status="paid"
    )
    
    # Buscar despesas do período
    despesas = crud_supabase.get_accounts_payable_by_period(
        clinic_id=current_user.clinic_id,
        start_date=request.start_date,
        end_date=request.end_date,
        status="paid"
    )
    
    receita_bruta = sum([r.amount for r in receitas])
    custos_diretos = sum([d.amount for d in despesas if d.category in ["medicamentos", "materiais_medicos"]])
    despesas_operacionais = sum([d.amount for d in despesas if d.category not in ["medicamentos", "materiais_medicos"]])
    
    receita_liquida = receita_bruta - (receita_bruta * 0.15)  # Estimativa de impostos
    lucro_bruto = receita_liquida - custos_diretos
    lucro_operacional = lucro_bruto - despesas_operacionais
    
    return schemas.DREReport(
        period_start=request.start_date,
        period_end=request.end_date,
        receita_bruta=receita_bruta,
        receita_liquida=receita_liquida,
        custos_diretos=custos_diretos,
        lucro_bruto=lucro_bruto,
        despesas_operacionais=despesas_operacionais,
        lucro_operacional=lucro_operacional,
        margem_bruta=(lucro_bruto / receita_liquida * 100) if receita_liquida > 0 else 0,
        margem_operacional=(lucro_operacional / receita_liquida * 100) if receita_liquida > 0 else 0
    )

@app.post("/financial-reports/balance-sheet", response_model=schemas.BalanceSheetReport)
def generate_balance_sheet(
    request: schemas.FinancialReportRequest,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Gera Balanço Patrimonial"""
    auth.check_permission_supabase(current_user, "financial_read")
    
    # Buscar contas bancárias
    bank_accounts = crud_supabase.get_bank_accounts(
        clinic_id=current_user.clinic_id,
        is_active=True
    )
    
    # Buscar contas a receber
    accounts_receivable = crud_supabase.get_accounts_receivable(
        clinic_id=current_user.clinic_id,
        status="pending"
    )
    
    # Buscar contas a pagar
    accounts_payable = crud_supabase.get_accounts_payable(
        clinic_id=current_user.clinic_id,
        status="pending"
    )
    
    caixa_bancos = sum([acc.current_balance for acc in bank_accounts])
    contas_receber = sum([ar.amount for ar in accounts_receivable])
    contas_pagar = sum([ap.amount for ap in accounts_payable])
    
    ativo_circulante = caixa_bancos + contas_receber
    passivo_circulante = contas_pagar
    patrimonio_liquido = ativo_circulante - passivo_circulante
    
    return schemas.BalanceSheetReport(
        reference_date=request.end_date,
        caixa_bancos=caixa_bancos,
        contas_receber=contas_receber,
        ativo_circulante=ativo_circulante,
        ativo_total=ativo_circulante,
        contas_pagar=contas_pagar,
        passivo_circulante=passivo_circulante,
        passivo_total=passivo_circulante,
        patrimonio_liquido=patrimonio_liquido
    )

@app.post("/financial-reports/cash-flow", response_model=schemas.CashFlowReport)
def generate_cash_flow_report(
    request: schemas.FinancialReportRequest,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Gera Relatório de Fluxo de Caixa"""
    auth.check_permission_supabase(current_user, "financial_read")
    
    # Buscar movimentações de caixa do período
    cash_flows = crud_supabase.get_cash_flows_by_period(
        clinic_id=current_user.clinic_id,
        start_date=request.start_date,
        end_date=request.end_date
    )
    
    entradas_operacionais = sum([cf.amount for cf in cash_flows if cf.flow_type == "inflow" and cf.category == "operational"])
    saidas_operacionais = sum([cf.amount for cf in cash_flows if cf.flow_type == "outflow" and cf.category == "operational"])
    entradas_investimento = sum([cf.amount for cf in cash_flows if cf.flow_type == "inflow" and cf.category == "investment"])
    saidas_investimento = sum([cf.amount for cf in cash_flows if cf.flow_type == "outflow" and cf.category == "investment"])
    entradas_financiamento = sum([cf.amount for cf in cash_flows if cf.flow_type == "inflow" and cf.category == "financing"])
    saidas_financiamento = sum([cf.amount for cf in cash_flows if cf.flow_type == "outflow" and cf.category == "financing"])
    
    fluxo_operacional = entradas_operacionais - saidas_operacionais
    fluxo_investimento = entradas_investimento - saidas_investimento
    fluxo_financiamento = entradas_financiamento - saidas_financiamento
    fluxo_liquido = fluxo_operacional + fluxo_investimento + fluxo_financiamento
    
    return schemas.CashFlowReport(
        period_start=request.start_date,
        period_end=request.end_date,
        entradas_operacionais=entradas_operacionais,
        saidas_operacionais=saidas_operacionais,
        fluxo_operacional=fluxo_operacional,
        entradas_investimento=entradas_investimento,
        saidas_investimento=saidas_investimento,
        fluxo_investimento=fluxo_investimento,
        entradas_financiamento=entradas_financiamento,
        saidas_financiamento=saidas_financiamento,
        fluxo_financiamento=fluxo_financiamento,
        fluxo_liquido=fluxo_liquido
    )

@app.get("/financial-dashboard", response_model=schemas.FinancialDashboard)
def get_financial_dashboard(
    period_days: int = 30,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Dashboard financeiro com KPIs específicos para clínicas"""
    auth.check_permission_supabase(current_user, "financial_read")
    
    from datetime import datetime, timedelta
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=period_days)
    
    # Buscar dados do período
    appointments = crud_supabase.get_appointments_by_period(
        clinic_id=current_user.clinic_id,
        start_date=start_date,
        end_date=end_date,
        status="completed"
    )
    
    billing_items = crud_supabase.get_billing_items_by_period(
        clinic_id=current_user.clinic_id,
        start_date=start_date,
        end_date=end_date
    )
    
    accounts_receivable = crud_supabase.get_accounts_receivable_by_period(
        clinic_id=current_user.clinic_id,
        start_date=start_date,
        end_date=end_date
    )
    
    # Calcular KPIs
    total_appointments = len(appointments)
    total_patients = len(set([apt.patient_id for apt in appointments]))
    total_revenue = sum([bi.amount for bi in billing_items])
    
    # Receita por paciente
    receita_por_paciente = total_revenue / total_patients if total_patients > 0 else 0
    
    # Ticket médio por procedimento
    ticket_medio = total_revenue / len(billing_items) if billing_items else 0
    
    # Taxa de inadimplência
    overdue_receivables = [ar for ar in accounts_receivable if ar.due_date < end_date and ar.status == "pending"]
    taxa_inadimplencia = (len(overdue_receivables) / len(accounts_receivable) * 100) if accounts_receivable else 0
    
    # Tempo médio de recebimento
    paid_receivables = [ar for ar in accounts_receivable if ar.status == "paid" and ar.payment_date]
    if paid_receivables:
        avg_days = sum([(ar.payment_date - ar.due_date).days for ar in paid_receivables]) / len(paid_receivables)
        tempo_medio_recebimento = max(0, avg_days)  # Não pode ser negativo
    else:
        tempo_medio_recebimento = 0
    
    return schemas.FinancialDashboard(
        period_start=start_date,
        period_end=end_date,
        total_revenue=total_revenue,
        total_appointments=total_appointments,
        total_patients=total_patients,
        receita_por_paciente=receita_por_paciente,
        ticket_medio_procedimento=ticket_medio,
        taxa_inadimplencia=taxa_inadimplencia,
        tempo_medio_recebimento=tempo_medio_recebimento,
        margem_lucro=0.0,  # Será calculado com base na DRE
        custo_por_atendimento=0.0,  # Será calculado com base nos custos
        roi_por_medico=0.0  # Será calculado com base nos repasses
    )

# ===== ENDPOINTS PARA EMISSÃO DE NFS-E =====

@app.post("/nfs-e/emit")
def emit_nfs_e(
    invoice_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Emite NFS-e para uma nota fiscal"""
    auth.check_permission_supabase(current_user, "financial_write")
    
    # Buscar a nota fiscal
    invoice = crud_supabase.get_invoice_nfs(
        clinic_id=current_user.clinic_id,
        invoice_id=invoice_id
    )
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.status != "pending":
        raise HTTPException(status_code=400, detail="Invoice already processed")
    
    try:
        # Aqui seria implementada a integração com a API da prefeitura
        # Por enquanto, simularemos o processo
        
        # Validar dados obrigatórios
        if not invoice.service_description or not invoice.service_value:
            raise ValueError("Dados obrigatórios não preenchidos")
        
        # Simular envio para prefeitura
        import uuid
        nfs_number = f"NFS{uuid.uuid4().hex[:8].upper()}"
        verification_code = uuid.uuid4().hex[:12].upper()
        
        # Atualizar status da nota
        crud_supabase.update_invoice_nfs(
            clinic_id=current_user.clinic_id,
            invoice_id=invoice_id,
            invoice_data={
                "status": "issued",
                "nfs_number": nfs_number,
                "verification_code": verification_code,
                "issue_date": datetime.now()
            }
        )
        
        return {
            "message": "NFS-e emitida com sucesso",
            "nfs_number": nfs_number,
            "verification_code": verification_code,
            "status": "issued"
        }
        
    except Exception as e:
        crud_supabase.update_invoice_nfs(
            clinic_id=current_user.clinic_id,
            invoice_id=invoice_id,
            invoice_data={
                "status": "error",
                "error_message": str(e)
            }
        )
        raise HTTPException(status_code=500, detail=f"Erro ao emitir NFS-e: {str(e)}")

@app.get("/nfs-e/{invoice_id}/status")
def check_nfs_e_status(
    invoice_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Consulta status da NFS-e"""
    auth.check_permission_supabase(current_user, "financial_read")
    
    invoice = crud_supabase.get_invoice_nfs(
        clinic_id=current_user.clinic_id,
        invoice_id=invoice_id
    )
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return {
        "invoice_id": invoice.id,
        "status": invoice.status,
        "nfs_number": invoice.nfs_number,
        "verification_code": invoice.verification_code,
        "issue_date": invoice.issue_date,
        "error_message": invoice.error_message
    }

@app.get("/nfs-e/{invoice_id}/pdf")
def download_nfs_e_pdf(
    invoice_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Download do PDF da NFS-e"""
    auth.check_permission_supabase(current_user, "financial_read")
    
    invoice = crud_supabase.get_invoice_nfs(
        clinic_id=current_user.clinic_id,
        invoice_id=invoice_id
    )
    
    if not invoice or invoice.status != "issued":
        raise HTTPException(status_code=404, detail="NFS-e not found or not issued")
    
    # Aqui seria implementado o download do PDF da prefeitura
    # Por enquanto, retornamos informações básicas
    return {
        "message": "PDF disponível para download",
        "download_url": f"/api/nfs-e/{invoice_id}/pdf/download",
        "nfs_number": invoice.nfs_number,
        "verification_code": invoice.verification_code
    }

# ===== ENDPOINTS PARA AUDITORIA E COMPLIANCE =====

@app.get("/audit/trail")
def get_audit_trail(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    table_name: Optional[str] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Recupera trilha de auditoria com filtros"""
    auth.check_permission_supabase(current_user, "admin")
    
    from datetime import datetime
    
    # Converter strings de data
    start_date_obj = datetime.fromisoformat(start_date).date() if start_date else None
    end_date_obj = datetime.fromisoformat(end_date).date() if end_date else None
    
    audit_trail = crud_supabase.get_audit_trail(
        clinic_id=current_user.clinic_id,
        start_date=start_date_obj,
        end_date=end_date_obj,
        table_name=table_name,
        user_id=user_id
    )
    
    # Aplicar paginação
    total = len(audit_trail)
    paginated_trail = audit_trail[skip:skip + limit]
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "audit_trail": paginated_trail
    }

@app.get("/audit/suspicious-activities")
def get_suspicious_activities(
    days_back: int = 7,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Detecta atividades suspeitas nos últimos dias"""
    auth.check_permission_supabase(current_user, "admin")
    
    suspicious_activities = crud_supabase.detect_suspicious_activities(
        clinic_id=current_user.clinic_id,
        days_back=days_back
    )
    
    return {
        "days_analyzed": days_back,
        "suspicious_activities": suspicious_activities,
        "total_alerts": len(suspicious_activities)
    }

@app.get("/compliance/check")
def check_compliance(
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Verifica compliance fiscal e financeiro da clínica"""
    auth.check_permission_supabase(current_user, "admin")
    
    compliance_report = crud_supabase.check_financial_compliance(
        clinic_id=current_user.clinic_id
    )
    
    return compliance_report

# ===== ENDPOINTS PARA BACKUP =====

@app.post("/backup/create")
def create_backup(
    backup_type: str = "financial",  # financial, full, database
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Cria backup dos dados da clínica"""
    auth.check_permission_supabase(current_user, "admin")
    
    from datetime import datetime, timedelta
    
    try:
        if backup_type == "financial":
            # Backup dos últimos 12 meses de dados financeiros
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=365)
            backup_path = backup_manager.create_financial_data_backup(
                clinic_id=current_user.clinic_id,
                start_date=start_date,
                end_date=end_date
            )
        elif backup_type == "full":
            backup_path = backup_manager.create_compressed_backup(
                clinic_id=current_user.clinic_id
            )
        elif backup_type == "database":
            backup_path = backup_manager.create_database_backup(
                clinic_id=current_user.clinic_id
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid backup type")
        
        return {
            "message": "Backup criado com sucesso",
            "backup_type": backup_type,
            "backup_path": backup_path,
            "created_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar backup: {str(e)}")

@app.get("/backup/list")
def list_backups(
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Lista backups disponíveis da clínica"""
    auth.check_permission_supabase(current_user, "admin")
    
    backups = crud_supabase.list_backups(clinic_id=current_user.clinic_id)
    
    return {
        "clinic_id": current_user.clinic_id,
        "total_backups": len(backups),
        "backups": backups
    }

@app.post("/backup/schedule")
def schedule_backup(
    frequency: str = "daily",  # daily, weekly, monthly
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Agenda backup automático"""
    auth.check_permission_supabase(current_user, "admin")
    
    if frequency not in ["daily", "weekly", "monthly"]:
        raise HTTPException(status_code=400, detail="Invalid frequency")
    
    schedule = crud_supabase.schedule_automatic_backup(
        clinic_id=current_user.clinic_id,
        frequency=frequency
    )
    
    return {
        "message": "Backup automático agendado com sucesso",
        "schedule": schedule
    }

@app.delete("/backup/cleanup")
def cleanup_old_backups(
    days_to_keep: int = 30,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Remove backups antigos"""
    auth.check_permission_supabase(current_user, "admin")
    
    try:
        crud_supabase.cleanup_old_backups(days_to_keep=days_to_keep)
        
        return {
            "message": f"Backups com mais de {days_to_keep} dias foram removidos",
            "days_kept": days_to_keep
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao limpar backups: {str(e)}")

# ===== ENDPOINTS PARA RELATÓRIOS FINANCEIROS AVANÇADOS =====

@app.get("/financial/alerts")
def get_financial_alerts(
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Gera alertas financeiros automáticos"""
    auth.check_permission_supabase(current_user, "financial_read")
    
    alerts = crud_supabase.generate_financial_alerts(
        clinic_id=current_user.clinic_id
    )
    
    return {
        "clinic_id": current_user.clinic_id,
        "total_alerts": len(alerts),
        "alerts": alerts
    }

@app.get("/financial/kpis")
def get_financial_kpis(
    period_days: int = 30,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Calcula KPIs financeiros específicos para clínicas"""
    auth.check_permission_supabase(current_user, "financial_read")
    
    from datetime import datetime, timedelta
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=period_days)
    
    kpis = crud_supabase.calculate_financial_kpis(
        clinic_id=current_user.clinic_id,
        start_date=start_date,
        end_date=end_date
    )
    
    return kpis

@app.get("/financial/cash-flow-projection")
def get_cash_flow_projection(
    days_ahead: int = 90,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Gera projeção de fluxo de caixa"""
    auth.check_permission_supabase(current_user, "financial_read")
    
    projection = crud_supabase.generate_cash_flow_projection(
        clinic_id=current_user.clinic_id,
        days_ahead=days_ahead
    )
    
    return {
        "days_ahead": days_ahead,
        "projection": projection,
        "total_periods": len(projection)
    }

# ===== ETAPA 5 - FARMÁCIA E ESTOQUE ENDPOINTS =====

# Product Category endpoints
@app.post("/pharmacy/categories/", response_model=schemas.ProductCategory)
def create_product_category(
    category: schemas.ProductCategoryCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar nova categoria de produto"""
    return crud_supabase.create_product_category(category=category, clinic_id=current_user.clinic_id)

@app.get("/pharmacy/categories/", response_model=List[schemas.ProductCategory])
def read_product_categories(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar categorias de produtos"""
    return crud_supabase.get_product_categories(clinic_id=current_user.clinic_id, skip=skip, limit=limit)

@app.get("/pharmacy/categories/{category_id}", response_model=schemas.ProductCategory)
def read_product_category(
    category_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter categoria específica"""
    db_category = crud_supabase.get_product_category(clinic_id=current_user.clinic_id, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@app.put("/pharmacy/categories/{category_id}", response_model=schemas.ProductCategory)
def update_product_category(
    category_id: int,
    category: schemas.ProductCategoryUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar categoria de produto"""
    db_category = crud_supabase.update_product_category(clinic_id=current_user.clinic_id, category_id=category_id, category=category)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@app.delete("/pharmacy/categories/{category_id}")
def delete_product_category(
    category_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Desativar categoria de produto"""
    db_category = crud_supabase.delete_product_category(clinic_id=current_user.clinic_id, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deactivated successfully"}

# Product endpoints
@app.post("/pharmacy/products/", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar novo produto"""
    return crud_supabase.create_product(product=product, clinic_id=current_user.clinic_id)

@app.get("/pharmacy/products/", response_model=List[schemas.Product])
def read_products(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    low_stock: bool = False,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar produtos com filtros"""
    return crud_supabase.get_products(
        clinic_id=current_user.clinic_id, 
        category_id=category_id,
        search=search,
        low_stock=low_stock,
        skip=skip, 
        limit=limit
    )

@app.get("/pharmacy/products/{product_id}", response_model=schemas.Product)
def read_product(
    product_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter produto específico"""
    db_product = crud_supabase.get_product(clinic_id=current_user.clinic_id, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.put("/pharmacy/products/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product: schemas.ProductUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar produto"""
    db_product = crud_supabase.update_product(clinic_id=current_user.clinic_id, product_id=product_id, product=product)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.delete("/pharmacy/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Desativar produto"""
    db_product = crud_supabase.delete_product(clinic_id=current_user.clinic_id, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deactivated successfully"}

# Product Batch endpoints
@app.post("/pharmacy/batches/", response_model=schemas.ProductBatch)
def create_product_batch(
    batch: schemas.ProductBatchCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar novo lote de produto"""
    return crud_supabase.create_product_batch(batch=batch, clinic_id=current_user.clinic_id)

@app.get("/pharmacy/batches/", response_model=List[schemas.ProductBatch])
def read_product_batches(
    skip: int = 0,
    limit: int = 100,
    product_id: Optional[int] = None,
    expiring_soon: bool = False,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar lotes de produtos"""
    return crud_supabase.get_product_batches(
        clinic_id=current_user.clinic_id,
        product_id=product_id,
        expiring_soon=expiring_soon,
        skip=skip, 
        limit=limit
    )

@app.get("/pharmacy/batches/{batch_id}", response_model=schemas.ProductBatch)
def read_product_batch(
    batch_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter lote específico"""
    db_batch = crud_supabase.get_product_batch(clinic_id=current_user.clinic_id, batch_id=batch_id)
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch

@app.put("/pharmacy/batches/{batch_id}", response_model=schemas.ProductBatch)
def update_product_batch(
    batch_id: int,
    batch: schemas.ProductBatchUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar lote de produto"""
    db_batch = crud_supabase.update_product_batch(clinic_id=current_user.clinic_id, batch_id=batch_id, batch=batch)
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch

# Stock Movement endpoints
@app.post("/pharmacy/stock-movements/", response_model=schemas.ProductStockMovement)
def create_stock_movement(
    movement: schemas.ProductStockMovementCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Registrar movimentação de estoque"""
    return crud_supabase.create_product_stock_movement(
        movement=movement, 
        clinic_id=current_user.clinic_id,
        user_id=current_user.id
    )

@app.get("/pharmacy/stock-movements/", response_model=List[schemas.ProductStockMovement])
def read_stock_movements(
    skip: int = 0,
    limit: int = 100,
    product_id: Optional[int] = None,
    department: Optional[str] = None,
    movement_type: Optional[str] = None,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar movimentações de estoque"""
    return crud_supabase.get_product_stock_movements(
        clinic_id=current_user.clinic_id,
        product_id=product_id,
        department=department,
        movement_type=movement_type,
        skip=skip,
        limit=limit
    )

@app.get("/pharmacy/stock-movements/{movement_id}", response_model=schemas.ProductStockMovement)
def read_stock_movement(
    movement_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter movimentação específica"""
    db_movement = crud_supabase.get_product_stock_movement(clinic_id=current_user.clinic_id, movement_id=movement_id)
    if db_movement is None:
        raise HTTPException(status_code=404, detail="Movement not found")
    return db_movement

# Stock Requisition endpoints
@app.post("/pharmacy/requisitions/", response_model=schemas.StockRequisition)
def create_stock_requisition(
    requisition: schemas.StockRequisitionCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar nova requisição de estoque"""
    return crud_supabase.create_stock_requisition(
        requisition=requisition, 
        clinic_id=current_user.clinic_id,
        user_id=current_user.id
    )

@app.get("/pharmacy/requisitions/", response_model=List[schemas.StockRequisition])
def read_stock_requisitions(
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = None,
    status: Optional[str] = None,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar requisições de estoque"""
    return crud_supabase.get_stock_requisitions(
        clinic_id=current_user.clinic_id,
        department=department,
        status=status,
        skip=skip,
        limit=limit
    )

@app.get("/pharmacy/requisitions/{requisition_id}", response_model=schemas.StockRequisition)
def read_stock_requisition(
    requisition_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter requisição específica"""
    db_requisition = crud_supabase.get_stock_requisition(clinic_id=current_user.clinic_id, requisition_id=requisition_id)
    if db_requisition is None:
        raise HTTPException(status_code=404, detail="Requisition not found")
    return db_requisition

@app.put("/pharmacy/requisitions/{requisition_id}", response_model=schemas.StockRequisition)
def update_stock_requisition(
    requisition_id: int,
    requisition: schemas.StockRequisitionUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar requisição de estoque"""
    db_requisition = crud_supabase.update_stock_requisition(
        clinic_id=current_user.clinic_id,
        requisition_id=requisition_id, 
        requisition=requisition,
        user_id=current_user.id
    )
    if db_requisition is None:
        raise HTTPException(status_code=404, detail="Requisition not found")
    return db_requisition

# Purchase Order endpoints
@app.post("/pharmacy/purchase-orders/", response_model=schemas.PurchaseOrder)
def create_purchase_order(
    order: schemas.PurchaseOrderCreate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar nova ordem de compra"""
    return crud_supabase.create_purchase_order(
        order=order, 
        clinic_id=current_user.clinic_id,
        user_id=current_user.id
    )

@app.get("/pharmacy/purchase-orders/", response_model=List[schemas.PurchaseOrder])
def read_purchase_orders(
    skip: int = 0,
    limit: int = 100,
    supplier_id: Optional[int] = None,
    status: Optional[str] = None,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar ordens de compra"""
    return crud_supabase.get_purchase_orders(
        clinic_id=current_user.clinic_id,
        supplier_id=supplier_id,
        status=status,
        skip=skip,
        limit=limit
    )

@app.get("/pharmacy/purchase-orders/{order_id}", response_model=schemas.PurchaseOrder)
def read_purchase_order(
    order_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter ordem de compra específica"""
    db_order = crud_supabase.get_purchase_order(clinic_id=current_user.clinic_id, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return db_order

@app.put("/pharmacy/purchase-orders/{order_id}", response_model=schemas.PurchaseOrder)
def update_purchase_order(
    order_id: int,
    order: schemas.PurchaseOrderUpdate,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar ordem de compra"""
    db_order = crud_supabase.update_purchase_order(
        clinic_id=current_user.clinic_id,
        order_id=order_id, 
        order=order,
        user_id=current_user.id
    )
    if db_order is None:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return db_order

# Stock Reports endpoints
@app.get("/pharmacy/reports/stock-summary")
def get_stock_summary(
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Relatório resumo do estoque"""
    # Produtos com estoque baixo
    low_stock_products = crud_supabase.get_products(
        clinic_id=current_user.clinic_id, 
        low_stock=True, 
        limit=1000
    )
    
    # Lotes próximos ao vencimento
    expiring_batches = crud_supabase.get_product_batches(
        clinic_id=current_user.clinic_id,
        expiring_soon=True,
        limit=1000
    )
    
    # Total de produtos ativos
    total_products = len(crud_supabase.get_products(
        clinic_id=current_user.clinic_id, 
        limit=10000
    ))
    
    return {
        "total_products": total_products,
        "low_stock_count": len(low_stock_products),
        "low_stock_products": [{
            "id": p.id,
            "name": p.name,
            "current_stock": p.current_stock,
            "minimum_stock": p.minimum_stock
        } for p in low_stock_products],
        "expiring_batches_count": len(expiring_batches),
        "expiring_batches": [{
            "id": b.id,
            "product_name": b.product.name if b.product else "N/A",
            "batch_number": b.batch_number,
            "expiry_date": b.expiry_date.isoformat() if b.expiry_date else None,
            "quantity": b.quantity
        } for b in expiring_batches]
    }

@app.get("/pharmacy/reports/movement-history")
def get_movement_history(
    days: int = 30,
    product_id: Optional[int] = None,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Histórico de movimentações de estoque"""
    movements = crud_supabase.get_product_stock_movements(
        clinic_id=current_user.clinic_id,
        product_id=product_id,
        limit=1000
    )
    
    # Filtrar por período
    from datetime import datetime, timedelta
    cutoff_date = datetime.now() - timedelta(days=days)
    recent_movements = [m for m in movements if m.created_at >= cutoff_date]
    
    return {
        "period_days": days,
        "total_movements": len(recent_movements),
        "movements": [{
            "id": m.id,
            "product_name": m.product.name if m.product else "N/A",
            "movement_type": m.movement_type,
            "quantity": m.quantity,
            "department": m.department,
            "reason": m.reason,
            "created_at": m.created_at.isoformat(),
            "user_name": m.user.full_name if m.user else "N/A"
        } for m in recent_movements]
    }

# ============================================================================
# LGPD ENDPOINTS
# ============================================================================

@app.get("/lgpd/user-data/{user_id}")
def get_user_data_for_portability(
    user_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Exportar dados do usuário para portabilidade (LGPD Art. 18)"""
    # Verificar se o usuário pode acessar estes dados
    if current_user.id != user_id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = crud_supabase.get_user(clinic_id=current_user.clinic_id, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Coletar todos os dados do usuário
    user_data = {
        "personal_info": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "cpf": user.cpf,
            "phone": user.phone,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "lgpd_consent": user.lgpd_consent,
            "lgpd_consent_date": user.lgpd_consent_date.isoformat() if user.lgpd_consent_date else None,
            "data_sharing_consent": user.data_sharing_consent,
            "marketing_consent": user.marketing_consent
        },
        "audit_logs": [],
        "medical_records": [],
        "appointments": []
    }
    
    # Buscar logs de auditoria
    audit_logs = crud_supabase.get_audit_logs(clinic_id=current_user.clinic_id, user_id=user_id, limit=1000)
    user_data["audit_logs"] = [{
        "id": log.id,
        "action": log.action,
        "table_name": log.table_name,
        "record_id": log.record_id,
        "timestamp": log.timestamp.isoformat(),
        "ip_address": log.ip_address
    } for log in audit_logs]
    
    # Se for um paciente, buscar dados médicos
    if user.role == "patient":
        patient = crud_supabase.get_patient_by_user_id(clinic_id=current_user.clinic_id, user_id=user_id)
        if patient:
            # Prontuários
            medical_records = crud_supabase.get_medical_records(clinic_id=current_user.clinic_id, patient_id=patient.id, limit=1000)
            user_data["medical_records"] = [{
                "id": record.id,
                "date": record.date.isoformat(),
                "diagnosis": record.diagnosis,
                "treatment": record.treatment,
                "observations": record.observations,
                "created_at": record.created_at.isoformat()
            } for record in medical_records]
            
            # Agendamentos
            appointments = crud_supabase.get_appointments_by_patient(clinic_id=current_user.clinic_id, patient_id=patient.id, limit=1000)
            user_data["appointments"] = [{
                "id": appt.id,
                "date": appt.date.isoformat(),
                "time": appt.time.isoformat() if appt.time else None,
                "status": appt.status,
                "notes": appt.notes,
                "created_at": appt.created_at.isoformat()
            } for appt in appointments]
    
    return user_data

@app.post("/lgpd/consent/{user_id}")
def update_lgpd_consent(
    user_id: int,
    consent_data: dict,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar consentimentos LGPD do usuário"""
    # Verificar se o usuário pode atualizar estes dados
    if current_user.id != user_id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = crud_supabase.get_user(clinic_id=current_user.clinic_id, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Atualizar consentimentos
    from datetime import datetime
    update_data = {}
    
    if "lgpd_consent" in consent_data:
        update_data["lgpd_consent"] = consent_data["lgpd_consent"]
        update_data["lgpd_consent_date"] = datetime.now()
    
    if "data_sharing_consent" in consent_data:
        update_data["data_sharing_consent"] = consent_data["data_sharing_consent"]
    
    if "marketing_consent" in consent_data:
        update_data["marketing_consent"] = consent_data["marketing_consent"]
    
    # Atualizar no banco
    user = crud_supabase.update_user_lgpd_consent(
        clinic_id=current_user.clinic_id,
        user_id=user_id,
        consent_data=update_data
    )
    
    # Log da ação
    crud_supabase.log_audit_transaction(
        clinic_id=current_user.clinic_id,
        user_id=current_user.id,
        action="UPDATE_LGPD_CONSENT",
        table_name="users",
        record_id=user_id,
        details=f"Updated LGPD consent: {consent_data}"
    )
    
    return {"message": "Consent updated successfully", "updated_fields": list(update_data.keys())}

@app.delete("/lgpd/user-data/{user_id}")
def delete_user_data(
    user_id: int,
    current_user: schemas.User = Depends(auth.get_current_active_user_supabase)
):
    """Direito ao esquecimento - Deletar dados do usuário (LGPD Art. 18)"""
    # Apenas admins podem executar esta ação
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = crud_supabase.get_user(clinic_id=current_user.clinic_id, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verificar se o usuário solicitou a exclusão
    if not user.lgpd_consent:
        raise HTTPException(status_code=400, detail="User has not revoked consent")
    
    try:
        # Deletar dados do usuário usando Supabase
        crud_supabase.delete_user_data_lgpd(
            clinic_id=current_user.clinic_id,
            user_id=user_id
        )
        
        # Log da ação (com usuário atual)
        crud_supabase.log_audit_transaction(
            clinic_id=current_user.clinic_id,
            user_id=current_user.id,
            action="DELETE_USER_DATA_LGPD",
            table_name="users",
            record_id=user_id,
            details=f"User data deleted due to LGPD right to be forgotten"
        )
        
        return {"message": "User data deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting user data: {str(e)}")

@app.get("/lgpd/data-processing-report")
def get_data_processing_report(
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Relatório de processamento de dados pessoais (LGPD Art. 41)"""
    # Apenas admins podem acessar
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Estatísticas de consentimento
    total_users = crud_supabase.count_users_by_clinic(clinic_id=current_user.clinic_id)
    users_with_consent = crud_supabase.count_users_with_lgpd_consent(
        clinic_id=current_user.clinic_id
    )
    users_without_consent = total_users - users_with_consent
    
    # Estatísticas de consentimento para compartilhamento
    data_sharing_consent = crud_supabase.count_users_with_data_sharing_consent(
        clinic_id=current_user.clinic_id
    )
    
    # Estatísticas de consentimento para marketing
    marketing_consent = crud_supabase.count_users_with_marketing_consent(
        clinic_id=current_user.clinic_id
    )
    
    # Atividades recentes de LGPD
    from datetime import datetime, timedelta
    last_30_days = datetime.now() - timedelta(days=30)
    
    recent_lgpd_activities = crud_supabase.count_recent_lgpd_activities(
        clinic_id=current_user.clinic_id,
        since_date=last_30_days
    )
    
    return {
        "clinic_id": current_user.clinic_id,
        "report_date": datetime.now().isoformat(),
        "user_statistics": {
            "total_users": total_users,
            "users_with_lgpd_consent": users_with_consent,
            "users_without_lgpd_consent": users_without_consent,
            "data_sharing_consent": data_sharing_consent,
            "marketing_consent": marketing_consent
        },
        "recent_activities": {
            "last_30_days_lgpd_activities": recent_lgpd_activities
        },
        "compliance_status": {
            "consent_rate": round((users_with_consent / total_users * 100), 2) if total_users > 0 else 0,
            "data_sharing_rate": round((data_sharing_consent / total_users * 100), 2) if total_users > 0 else 0,
            "marketing_consent_rate": round((marketing_consent / total_users * 100), 2) if total_users > 0 else 0
        }
    }

@app.post("/lgpd/data-breach-notification")
def notify_data_breach(
    breach_data: dict,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Notificação de vazamento de dados (LGPD Art. 48)"""
    # Apenas admins podem reportar vazamentos
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    from datetime import datetime
    
    # Validar dados obrigatórios
    required_fields = ["description", "affected_data_types", "estimated_affected_users", "severity"]
    for field in required_fields:
        if field not in breach_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Criar registro do vazamento
    breach_record = {
        "id": f"BREACH_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "clinic_id": current_user.clinic_id,
        "reported_by": current_user.id,
        "report_date": datetime.now().isoformat(),
        "description": breach_data["description"],
        "affected_data_types": breach_data["affected_data_types"],
        "estimated_affected_users": breach_data["estimated_affected_users"],
        "severity": breach_data["severity"],  # low, medium, high, critical
        "containment_measures": breach_data.get("containment_measures", ""),
        "notification_authorities": breach_data.get("notification_authorities", False),
        "notification_users": breach_data.get("notification_users", False)
    }
    
    # Log do vazamento
    crud_supabase.log_audit_transaction(
        clinic_id=current_user.clinic_id,
        user_id=current_user.id,
        action="DATA_BREACH_NOTIFICATION",
        table_name="data_breach",
        record_id=breach_record["id"],
        details=f"Data breach reported: {breach_data['description'][:100]}..."
    )
    
    # TODO: Implementar notificação automática para ANPD se necessário
    # TODO: Implementar notificação para usuários afetados
    
    return {
        "message": "Data breach notification recorded",
        "breach_id": breach_record["id"],
        "next_steps": [
            "Notify ANPD within 72 hours if high risk",
            "Notify affected users without undue delay",
            "Document all containment measures",
            "Conduct impact assessment"
        ]
    }

# ============================================================================
# ETAPA 6 - RELATÓRIOS E BI - ENDPOINTS
# ============================================================================

# ===== SAVED REPORTS ENDPOINTS =====

@app.get("/saved-reports", response_model=List[schemas.SavedReport])
def get_saved_reports(
    skip: int = 0,
    limit: int = 100,
    report_type: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar relatórios salvos"""
    reports = crud_supabase.get_saved_reports(
        clinic_id=current_user.clinic_id,
        user_id=current_user.id if current_user.role not in ["admin", "manager"] else None,
        report_type=report_type,
        skip=skip, 
        limit=limit
    )
    return reports

@app.get("/saved-reports/{report_id}", response_model=schemas.SavedReport)
def get_saved_report(
    report_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter relatório específico"""
    report = crud_supabase.get_saved_report(clinic_id=current_user.clinic_id, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Verificar permissões
    if report.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not report.is_public and report.user_id != current_user.id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return report

@app.post("/saved-reports", response_model=schemas.SavedReport)
def create_saved_report(
    report: schemas.SavedReportCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar novo relatório salvo"""
    return crud_supabase.create_saved_report(
        report=report, 
        clinic_id=current_user.clinic_id,
        user_id=current_user.id
    )

@app.put("/saved-reports/{report_id}", response_model=schemas.SavedReport)
def update_saved_report(
    report_id: int,
    report: schemas.SavedReportUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar relatório salvo"""
    db_report = crud_supabase.get_saved_report(clinic_id=current_user.clinic_id, report_id=report_id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Verificar permissões
    if db_report.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if db_report.user_id != current_user.id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return crud_supabase.update_saved_report(clinic_id=current_user.clinic_id, report_id=report_id, report=report)

@app.delete("/saved-reports/{report_id}")
def delete_saved_report(
    report_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Deletar relatório salvo"""
    db_report = crud_supabase.get_saved_report(clinic_id=current_user.clinic_id, report_id=report_id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Verificar permissões
    if db_report.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if db_report.user_id != current_user.id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    crud_supabase.delete_saved_report(clinic_id=current_user.clinic_id, report_id=report_id)
    return {"message": "Report deleted successfully"}

# ===== CUSTOM DASHBOARDS ENDPOINTS =====

@app.get("/dashboards", response_model=List[schemas.CustomDashboard])
def get_custom_dashboards(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar dashboards personalizados"""
    dashboards = crud_supabase.get_custom_dashboards(
        clinic_id=current_user.clinic_id,
        user_id=current_user.id if current_user.role not in ["admin", "manager"] else None,
        skip=skip, 
        limit=limit
    )
    return dashboards

@app.get("/dashboards/{dashboard_id}", response_model=schemas.CustomDashboard)
def get_custom_dashboard(
    dashboard_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter dashboard específico"""
    dashboard = crud_supabase.get_custom_dashboard(clinic_id=current_user.clinic_id, dashboard_id=dashboard_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    # Verificar permissões
    if dashboard.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not dashboard.is_public and dashboard.user_id != current_user.id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return dashboard

@app.post("/dashboards", response_model=schemas.CustomDashboard)
def create_custom_dashboard(
    dashboard: schemas.CustomDashboardCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar novo dashboard personalizado"""
    return crud_supabase.create_custom_dashboard(
        dashboard=dashboard, 
        clinic_id=current_user.clinic_id,
        user_id=current_user.id
    )

@app.put("/dashboards/{dashboard_id}", response_model=schemas.CustomDashboard)
def update_custom_dashboard(
    dashboard_id: int,
    dashboard: schemas.CustomDashboardUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar dashboard personalizado"""
    db_dashboard = crud_supabase.get_custom_dashboard(clinic_id=current_user.clinic_id, dashboard_id=dashboard_id)
    if not db_dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    # Verificar permissões
    if db_dashboard.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if db_dashboard.user_id != current_user.id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return crud_supabase.update_custom_dashboard(clinic_id=current_user.clinic_id, dashboard_id=dashboard_id, dashboard=dashboard)

@app.delete("/dashboards/{dashboard_id}")
def delete_custom_dashboard(
    dashboard_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Deletar dashboard personalizado"""
    db_dashboard = crud_supabase.get_custom_dashboard(clinic_id=current_user.clinic_id, dashboard_id=dashboard_id)
    if not db_dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    # Verificar permissões
    if db_dashboard.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if db_dashboard.user_id != current_user.id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    crud_supabase.delete_custom_dashboard(clinic_id=current_user.clinic_id, dashboard_id=dashboard_id)
    return {"message": "Dashboard deleted successfully"}

# ===== DASHBOARD WIDGETS ENDPOINTS =====

@app.get("/dashboard-widgets", response_model=List[schemas.DashboardWidget])
def get_dashboard_widgets(
    dashboard_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar widgets de dashboard"""
    widgets = crud_supabase.get_dashboard_widgets(
        clinic_id=current_user.clinic_id,
        dashboard_id=dashboard_id,
        skip=skip, 
        limit=limit
    )
    return widgets

@app.get("/dashboard-widgets/{widget_id}", response_model=schemas.DashboardWidget)
def get_dashboard_widget(
    widget_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter widget específico"""
    widget = crud_supabase.get_dashboard_widget(clinic_id=current_user.clinic_id, widget_id=widget_id)
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    return widget

@app.post("/dashboard-widgets", response_model=schemas.DashboardWidget)
def create_dashboard_widget(
    widget: schemas.DashboardWidgetCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar novo widget de dashboard"""
    return crud_supabase.create_dashboard_widget(clinic_id=current_user.clinic_id, widget=widget)

@app.put("/dashboard-widgets/{widget_id}", response_model=schemas.DashboardWidget)
def update_dashboard_widget(
    widget_id: int,
    widget: schemas.DashboardWidgetUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar widget de dashboard"""
    db_widget = crud_supabase.get_dashboard_widget(clinic_id=current_user.clinic_id, widget_id=widget_id)
    if not db_widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    return crud_supabase.update_dashboard_widget(clinic_id=current_user.clinic_id, widget_id=widget_id, widget=widget)

@app.delete("/dashboard-widgets/{widget_id}")
def delete_dashboard_widget(
    widget_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Deletar widget de dashboard"""
    db_widget = crud_supabase.get_dashboard_widget(clinic_id=current_user.clinic_id, widget_id=widget_id)
    if not db_widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    crud_supabase.delete_dashboard_widget(clinic_id=current_user.clinic_id, widget_id=widget_id)
    return {"message": "Widget deleted successfully"}

# ===== PERFORMANCE METRICS ENDPOINTS =====

@app.get("/performance-metrics", response_model=List[schemas.PerformanceMetric])
def get_performance_metrics(
    metric_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar métricas de performance"""
    metrics = crud_supabase.get_performance_metrics(
        clinic_id=current_user.clinic_id,
        metric_type=metric_type,
        start_date=start_date,
        end_date=end_date,
        skip=skip, 
        limit=limit
    )
    return metrics

@app.get("/performance-metrics/{metric_id}", response_model=schemas.PerformanceMetric)
def get_performance_metric(
    metric_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter métrica específica"""
    metric = crud_supabase.get_performance_metric(clinic_id=current_user.clinic_id, metric_id=metric_id)
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    # Verificar permissões
    if metric.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return metric

@app.post("/performance-metrics", response_model=schemas.PerformanceMetric)
def create_performance_metric(
    metric: schemas.PerformanceMetricCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar nova métrica de performance"""
    return crud_supabase.create_performance_metric(
        metric=metric, 
        clinic_id=current_user.clinic_id
    )

@app.put("/performance-metrics/{metric_id}", response_model=schemas.PerformanceMetric)
def update_performance_metric(
    metric_id: int,
    metric: schemas.PerformanceMetricUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar métrica de performance"""
    db_metric = crud_supabase.get_performance_metric(clinic_id=current_user.clinic_id, metric_id=metric_id)
    if not db_metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    # Verificar permissões
    if db_metric.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return crud_supabase.update_performance_metric(clinic_id=current_user.clinic_id, metric_id=metric_id, metric=metric)

@app.delete("/performance-metrics/{metric_id}")
def delete_performance_metric(
    metric_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Deletar métrica de performance"""
    db_metric = crud_supabase.get_performance_metric(clinic_id=current_user.clinic_id, metric_id=metric_id)
    if not db_metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    # Verificar permissões
    if db_metric.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    crud_supabase.delete_performance_metric(clinic_id=current_user.clinic_id, metric_id=metric_id)
    return {"message": "Metric deleted successfully"}

# ===== BI ALERTS ENDPOINTS =====

@app.get("/bi-alerts", response_model=List[schemas.BIAlert])
def get_bi_alerts(
    alert_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar alertas de BI"""
    alerts = crud_supabase.get_bi_alerts(
        clinic_id=current_user.clinic_id,
        alert_type=alert_type,
        is_active=is_active,
        skip=skip, 
        limit=limit
    )
    return alerts

@app.get("/bi-alerts/{alert_id}", response_model=schemas.BIAlert)
def get_bi_alert(
    alert_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter alerta específico"""
    alert = crud_supabase.get_bi_alert(clinic_id=current_user.clinic_id, alert_id=alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Verificar permissões
    if alert.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return alert

@app.post("/bi-alerts", response_model=schemas.BIAlert)
def create_bi_alert(
    alert: schemas.BIAlertCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar novo alerta de BI"""
    return crud_supabase.create_bi_alert(clinic_id=current_user.clinic_id, alert=alert)

@app.put("/bi-alerts/{alert_id}", response_model=schemas.BIAlert)
def update_bi_alert(
    alert_id: int,
    alert: schemas.BIAlertUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar alerta de BI"""
    db_alert = crud_supabase.get_bi_alert(clinic_id=current_user.clinic_id, alert_id=alert_id)
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Verificar permissões
    if db_alert.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return crud_supabase.update_bi_alert(clinic_id=current_user.clinic_id, alert_id=alert_id, alert=alert)

@app.delete("/bi-alerts/{alert_id}")
def delete_bi_alert(
    alert_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Deletar alerta de BI"""
    db_alert = crud_supabase.get_bi_alert(clinic_id=current_user.clinic_id, alert_id=alert_id)
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Verificar permissões
    if db_alert.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    crud_supabase.delete_bi_alert(clinic_id=current_user.clinic_id, alert_id=alert_id)
    return {"message": "Alert deleted successfully"}

# ===== ALERT CONFIGURATIONS ENDPOINTS =====

@app.get("/alert-configurations", response_model=List[schemas.AlertConfiguration])
def get_alert_configurations(
    metric_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar configurações de alertas"""
    configs = crud_supabase.get_alert_configurations(
        clinic_id=current_user.clinic_id,
        user_id=current_user.id if current_user.role not in ["admin", "manager"] else None,
        metric_type=metric_type,
        skip=skip, 
        limit=limit
    )
    return configs

@app.get("/alert-configurations/{config_id}", response_model=schemas.AlertConfiguration)
def get_alert_configuration(
    config_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter configuração específica"""
    config = crud_supabase.get_alert_configuration(clinic_id=current_user.clinic_id, config_id=config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    # Verificar permissões
    if config.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return config

@app.post("/alert-configurations", response_model=schemas.AlertConfiguration)
def create_alert_configuration(
    config: schemas.AlertConfigurationCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar nova configuração de alerta"""
    return crud_supabase.create_alert_configuration(
        clinic_id=current_user.clinic_id,
        config=config, 
        user_id=current_user.id
    )

@app.put("/alert-configurations/{config_id}", response_model=schemas.AlertConfiguration)
def update_alert_configuration(
    config_id: int,
    config: schemas.AlertConfigurationUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar configuração de alerta"""
    db_config = crud_supabase.get_alert_configuration(clinic_id=current_user.clinic_id, config_id=config_id)
    if not db_config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    # Verificar permissões
    if db_config.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return crud_supabase.update_alert_configuration(clinic_id=current_user.clinic_id, config_id=config_id, config=config)

@app.delete("/alert-configurations/{config_id}")
def delete_alert_configuration(
    config_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Deletar configuração de alerta"""
    db_config = crud_supabase.get_alert_configuration(clinic_id=current_user.clinic_id, config_id=config_id)
    if not db_config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    # Verificar permissões
    if db_config.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    crud_supabase.delete_alert_configuration(clinic_id=current_user.clinic_id, config_id=config_id)
    return {"message": "Configuration deleted successfully"}

# ===== REPORT EXECUTIONS ENDPOINTS =====

@app.get("/report-executions", response_model=List[schemas.ReportExecution])
def get_report_executions(
    report_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar execuções de relatórios"""
    executions = crud_supabase.get_report_executions(
        clinic_id=current_user.clinic_id,
        report_id=report_id,
        status=status,
        skip=skip, 
        limit=limit
    )
    return executions

@app.get("/report-executions/{execution_id}", response_model=schemas.ReportExecution)
def get_report_execution(
    execution_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter execução específica"""
    execution = crud_supabase.get_report_execution(execution_id=execution_id, clinic_id=current_user.clinic_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return execution

@app.post("/report-executions", response_model=schemas.ReportExecution)
def create_report_execution(
    execution: schemas.ReportExecutionCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar nova execução de relatório"""
    return crud_supabase.create_report_execution(
        execution=execution, 
        clinic_id=current_user.clinic_id,
        user_id=current_user.id
    )

@app.put("/report-executions/{execution_id}", response_model=schemas.ReportExecution)
def update_report_execution(
    execution_id: int,
    execution: schemas.ReportExecutionUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar execução de relatório"""
    db_execution = crud_supabase.get_report_execution(execution_id=execution_id, clinic_id=current_user.clinic_id)
    if not db_execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return crud_supabase.update_report_execution(execution_id=execution_id, execution=execution, clinic_id=current_user.clinic_id)

@app.delete("/report-executions/{execution_id}")
def delete_report_execution(
    execution_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Deletar execução de relatório"""
    db_execution = crud_supabase.get_report_execution(execution_id=execution_id, clinic_id=current_user.clinic_id)
    if not db_execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    crud_supabase.delete_report_execution(execution_id=execution_id, clinic_id=current_user.clinic_id)
    return {"message": "Execution deleted successfully"}

# ============================================================================
# ETAPA 5B - ESTOQUE AMPLIADO ENDPOINTS
# ============================================================================

# Stock Inventory endpoints
@app.post("/pharmacy/inventories/", response_model=schemas.StockInventory)
def create_stock_inventory(
    inventory: schemas.StockInventoryCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar novo inventário de estoque"""
    return crud_supabase.create_stock_inventory(
        inventory=inventory, 
        clinic_id=current_user.clinic_id,
        user_id=current_user.id
    )

@app.get("/pharmacy/inventories/", response_model=List[schemas.StockInventory])
def get_stock_inventories(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar inventários de estoque"""
    return crud_supabase.get_stock_inventories(
        clinic_id=current_user.clinic_id,
        status=status,
        skip=skip, 
        limit=limit
    )

@app.get("/pharmacy/inventories/{inventory_id}", response_model=schemas.StockInventory)
def get_stock_inventory(
    inventory_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter inventário específico"""
    inventory = crud_supabase.get_stock_inventory(inventory_id=inventory_id, clinic_id=current_user.clinic_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    
    return inventory

@app.put("/pharmacy/inventories/{inventory_id}", response_model=schemas.StockInventory)
def update_stock_inventory(
    inventory_id: int,
    inventory: schemas.StockInventoryUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar inventário de estoque"""
    db_inventory = crud_supabase.get_stock_inventory(inventory_id=inventory_id, clinic_id=current_user.clinic_id)
    if not db_inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    
    return crud_supabase.update_stock_inventory(inventory_id=inventory_id, inventory=inventory, clinic_id=current_user.clinic_id)

# Inventory Count endpoints
@app.post("/pharmacy/inventory-counts/", response_model=schemas.InventoryCount)
def create_inventory_count(
    count: schemas.InventoryCountCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Registrar contagem de inventário"""
    return crud_supabase.create_inventory_count(
        count=count,
        user_id=current_user.id,
        clinic_id=current_user.clinic_id
    )

@app.get("/pharmacy/inventory-counts/", response_model=List[schemas.InventoryCount])
def get_inventory_counts(
    inventory_id: Optional[int] = None,
    product_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar contagens de inventário"""
    return crud_supabase.get_inventory_counts(
        clinic_id=current_user.clinic_id,
        inventory_id=inventory_id,
        product_id=product_id,
        skip=skip,
        limit=limit
    )

@app.put("/pharmacy/inventory-counts/{count_id}", response_model=schemas.InventoryCount)
def update_inventory_count(
    count_id: int,
    count: schemas.InventoryCountUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar contagem de inventário"""
    return crud_supabase.update_inventory_count(count_id=count_id, count=count, clinic_id=current_user.clinic_id)

# Stock Alert endpoints
@app.post("/pharmacy/stock-alerts/", response_model=schemas.StockAlert)
def create_stock_alert(
    alert: schemas.StockAlertCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar alerta de estoque"""
    return crud_supabase.create_stock_alert(
        alert=alert, 
        clinic_id=current_user.clinic_id
    )

@app.get("/pharmacy/stock-alerts/", response_model=List[schemas.StockAlert])
def get_stock_alerts(
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    is_active: Optional[bool] = True,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar alertas de estoque"""
    return crud_supabase.get_stock_alerts(
        clinic_id=current_user.clinic_id,
        alert_type=alert_type,
        severity=severity,
        is_active=is_active,
        skip=skip,
        limit=limit
    )

@app.put("/pharmacy/stock-alerts/{alert_id}", response_model=schemas.StockAlert)
def update_stock_alert(
    alert_id: int,
    alert: schemas.StockAlertUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar/resolver alerta de estoque"""
    db_alert = crud_supabase.get_stock_alert(alert_id=alert_id, clinic_id=current_user.clinic_id)
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return crud_supabase.update_stock_alert(alert_id=alert_id, alert=alert, user_id=current_user.id, clinic_id=current_user.clinic_id)

# Stock Transfer endpoints
@app.post("/pharmacy/stock-transfers/", response_model=schemas.StockTransfer)
def create_stock_transfer(
    transfer: schemas.StockTransferCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar transferência de estoque"""
    return crud_supabase.create_stock_transfer(
        transfer=transfer, 
        clinic_id=current_user.clinic_id,
        user_id=current_user.id
    )

@app.get("/pharmacy/stock-transfers/", response_model=List[schemas.StockTransfer])
def get_stock_transfers(
    status: Optional[str] = None,
    from_location: Optional[str] = None,
    to_location: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar transferências de estoque"""
    return crud_supabase.get_stock_transfers(
        clinic_id=current_user.clinic_id,
        status=status,
        from_location=from_location,
        to_location=to_location,
        skip=skip,
        limit=limit
    )

@app.get("/pharmacy/stock-transfers/{transfer_id}", response_model=schemas.StockTransfer)
def get_stock_transfer(
    transfer_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter transferência específica"""
    transfer = crud_supabase.get_stock_transfer(transfer_id=transfer_id, clinic_id=current_user.clinic_id)
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    return transfer

@app.put("/pharmacy/stock-transfers/{transfer_id}", response_model=schemas.StockTransfer)
def update_stock_transfer(
    transfer_id: int,
    transfer: schemas.StockTransferUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar transferência de estoque"""
    db_transfer = crud_supabase.get_stock_transfer(transfer_id=transfer_id, clinic_id=current_user.clinic_id)
    if not db_transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    return crud_supabase.update_stock_transfer(transfer_id=transfer_id, transfer=transfer, user_id=current_user.id, clinic_id=current_user.clinic_id)

# Stock Transfer Item endpoints
@app.post("/pharmacy/stock-transfer-items/", response_model=schemas.StockTransferItem)
def create_stock_transfer_item(
    item: schemas.StockTransferItemCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Adicionar item à transferência"""
    return crud_supabase.create_stock_transfer_item(item=item, clinic_id=current_user.clinic_id)

@app.get("/pharmacy/stock-transfer-items/", response_model=List[schemas.StockTransferItem])
def get_stock_transfer_items(
    transfer_id: Optional[int] = None,
    product_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar itens de transferência"""
    return crud_supabase.get_stock_transfer_items(
        clinic_id=current_user.clinic_id,
        transfer_id=transfer_id,
        product_id=product_id,
        skip=skip,
        limit=limit
    )

@app.put("/pharmacy/stock-transfer-items/{item_id}", response_model=schemas.StockTransferItem)
def update_stock_transfer_item(
    item_id: int,
    item: schemas.StockTransferItemUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar item de transferência"""
    return crud_supabase.update_stock_transfer_item(item_id=item_id, item=item, clinic_id=current_user.clinic_id)

# Stock Adjustment endpoints
@app.post("/pharmacy/stock-adjustments/", response_model=schemas.StockAdjustment)
def create_stock_adjustment(
    adjustment: schemas.StockAdjustmentCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar ajuste de estoque"""
    return crud_supabase.create_stock_adjustment(
        adjustment=adjustment, 
        clinic_id=current_user.clinic_id,
        user_id=current_user.id
    )

@app.get("/pharmacy/stock-adjustments/", response_model=List[schemas.StockAdjustment])
def get_stock_adjustments(
    product_id: Optional[int] = None,
    adjustment_type: Optional[str] = None,
    reason: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar ajustes de estoque"""
    return crud_supabase.get_stock_adjustments(
        clinic_id=current_user.clinic_id,
        product_id=product_id,
        adjustment_type=adjustment_type,
        reason=reason,
        skip=skip,
        limit=limit
    )

@app.get("/pharmacy/stock-adjustments/{adjustment_id}", response_model=schemas.StockAdjustment)
def get_stock_adjustment(
    adjustment_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter ajuste específico"""
    adjustment = crud_supabase.get_stock_adjustment(adjustment_id=adjustment_id, clinic_id=current_user.clinic_id)
    if not adjustment:
        raise HTTPException(status_code=404, detail="Adjustment not found")
    
    return adjustment

@app.put("/pharmacy/stock-adjustments/{adjustment_id}", response_model=schemas.StockAdjustment)
def update_stock_adjustment(
    adjustment_id: int,
    adjustment: schemas.StockAdjustmentUpdate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Atualizar ajuste de estoque"""
    db_adjustment = crud_supabase.get_stock_adjustment(adjustment_id=adjustment_id, clinic_id=current_user.clinic_id)
    if not db_adjustment:
        raise HTTPException(status_code=404, detail="Adjustment not found")
    
    return crud_supabase.update_stock_adjustment(adjustment_id=adjustment_id, adjustment=adjustment, clinic_id=current_user.clinic_id)

# Stock Reports endpoints
@app.get("/pharmacy/reports/inventory-report/{inventory_id}")
def get_inventory_report(
    inventory_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Relatório de inventário específico"""
    inventory = crud_supabase.get_stock_inventory(inventory_id=inventory_id, clinic_id=current_user.clinic_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    
    counts = crud_supabase.get_inventory_counts(clinic_id=current_user.clinic_id, inventory_id=inventory_id)
    
    total_products = len(counts)
    total_counted = len([c for c in counts if c.counted_quantity is not None])
    total_discrepancies = len([c for c in counts if c.discrepancy != 0])
    discrepancy_percentage = (total_discrepancies / total_products * 100) if total_products > 0 else 0
    total_value_impact = sum([c.total_cost_impact for c in counts])
    
    return {
        "inventory_id": inventory_id,
        "total_products": total_products,
        "total_counted": total_counted,
        "total_discrepancies": total_discrepancies,
        "discrepancy_percentage": discrepancy_percentage,
        "total_value_impact": total_value_impact,
        "items": counts,
        "generated_at": datetime.now().isoformat()
    }

@app.get("/pharmacy/reports/stock-movement-report")
def get_stock_movement_report(
    start_date: date,
    end_date: date,
    product_id: Optional[int] = None,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Relatório de movimentações de estoque"""
    movements = crud_supabase.get_product_stock_movements(
        clinic_id=current_user.clinic_id,
        product_id=product_id,
        start_date=start_date,
        end_date=end_date
    )
    
    total_movements = len(movements)
    total_inbound = sum([m.quantity for m in movements if m.movement_type in ['entrada', 'ajuste_positivo']])
    total_outbound = sum([m.quantity for m in movements if m.movement_type in ['saida', 'ajuste_negativo']])
    net_movement = total_inbound - total_outbound
    
    movements_by_type = {}
    for movement in movements:
        movement_type = movement.movement_type
        movements_by_type[movement_type] = movements_by_type.get(movement_type, 0) + 1
    
    movements_by_product = []
    product_movements = {}
    for movement in movements:
        product_name = movement.product.name if movement.product else "N/A"
        if product_name not in product_movements:
            product_movements[product_name] = {"inbound": 0, "outbound": 0, "count": 0}
        
        if movement.movement_type in ['entrada', 'ajuste_positivo']:
            product_movements[product_name]["inbound"] += movement.quantity
        else:
            product_movements[product_name]["outbound"] += movement.quantity
        product_movements[product_name]["count"] += 1
    
    for product_name, data in product_movements.items():
        movements_by_product.append({
            "product_name": product_name,
            "total_inbound": data["inbound"],
            "total_outbound": data["outbound"],
            "net_movement": data["inbound"] - data["outbound"],
            "movement_count": data["count"]
        })
    
    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "total_movements": total_movements,
        "total_inbound": total_inbound,
        "total_outbound": total_outbound,
        "net_movement": net_movement,
        "movements_by_type": movements_by_type,
        "movements_by_product": movements_by_product,
        "generated_at": datetime.now().isoformat()
    }

@app.get("/pharmacy/reports/stock-alerts-summary")
def get_stock_alerts_summary(
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Resumo de alertas de estoque"""
    alerts = crud_supabase.get_stock_alerts(clinic_id=current_user.clinic_id, limit=1000)
    
    total_alerts = len(alerts)
    active_alerts = len([a for a in alerts if a.is_active])
    critical_alerts = len([a for a in alerts if a.severity == 'critical'])
    
    alerts_by_type = {}
    alerts_by_severity = {}
    
    for alert in alerts:
        # Por tipo
        alert_type = alert.alert_type
        alerts_by_type[alert_type] = alerts_by_type.get(alert_type, 0) + 1
        
        # Por severidade
        severity = alert.severity
        alerts_by_severity[severity] = alerts_by_severity.get(severity, 0) + 1
    
    # Alertas recentes (últimos 10)
    recent_alerts = alerts[:10]
    
    return {
        "total_alerts": total_alerts,
        "active_alerts": active_alerts,
        "critical_alerts": critical_alerts,
        "alerts_by_type": alerts_by_type,
        "alerts_by_severity": alerts_by_severity,
        "recent_alerts": recent_alerts,
        "generated_at": datetime.now().isoformat()
    }

# ============================================================================
# DEPARTMENT ENDPOINTS
# ============================================================================

@app.post("/departments/", response_model=schemas.Department)
def create_department(
    department: schemas.DepartmentCreate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "manager"]))
):
    """Criar novo departamento"""
    # Verificar se já existe departamento com o mesmo código
    existing_department = crud_supabase.get_department_by_code(
        clinic_id=current_user.clinic_id, 
        code=department.code
    )
    if existing_department:
        raise HTTPException(
            status_code=400, 
            detail="Já existe um departamento com este código"
        )
    
    return crud_supabase.create_department(
        department=department, 
        clinic_id=current_user.clinic_id
    )

@app.get("/departments/", response_model=List[schemas.Department])
def get_departments(
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar departamentos da clínica"""
    return crud_supabase.get_departments(
        clinic_id=current_user.clinic_id,
        is_active=is_active,
        skip=skip,
        limit=limit
    )

@app.get("/departments/{department_id}", response_model=schemas.Department)
def get_department(
    department_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter departamento específico"""
    department = crud_supabase.get_department(department_id=department_id, clinic_id=current_user.clinic_id)
    if not department:
        raise HTTPException(status_code=404, detail="Departamento não encontrado")
    
    return department

@app.put("/departments/{department_id}", response_model=schemas.Department)
def update_department(
    department_id: int,
    department: schemas.DepartmentUpdate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "manager"]))
):
    """Atualizar departamento"""
    db_department = crud_supabase.get_department(department_id=department_id, clinic_id=current_user.clinic_id)
    if not db_department:
        raise HTTPException(status_code=404, detail="Departamento não encontrado")
    
    # Verificar se o código não está sendo usado por outro departamento
    if department.code and department.code != db_department.code:
        existing_department = crud_supabase.get_department_by_code(
            clinic_id=current_user.clinic_id, 
            code=department.code
        )
        if existing_department and existing_department.id != department_id:
            raise HTTPException(
                status_code=400, 
                detail="Já existe um departamento com este código"
            )
    
    return crud_supabase.update_department(
        department_id=department_id, 
        department=department,
        clinic_id=current_user.clinic_id
    )

@app.delete("/departments/{department_id}")
def delete_department(
    department_id: int,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin"]))
):
    """Desativar departamento (soft delete)"""
    db_department = crud_supabase.get_department(department_id=department_id, clinic_id=current_user.clinic_id)
    if not db_department:
        raise HTTPException(status_code=404, detail="Departamento não encontrado")
    
    crud_supabase.delete_department(department_id=department_id, clinic_id=current_user.clinic_id)
    
    return {"message": "Departamento desativado com sucesso"}

@app.get("/departments/{department_id}/statistics")
def get_department_statistics(
    department_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter estatísticas de um departamento"""
    department = crud_supabase.get_department(department_id=department_id, clinic_id=current_user.clinic_id)
    if not department:
        raise HTTPException(status_code=404, detail="Departamento não encontrado")
    
    statistics = crud_supabase.get_department_statistics(
        department_id=department_id,
        clinic_id=current_user.clinic_id,
        start_date=start_date,
        end_date=end_date
    )
    
    if not statistics:
        raise HTTPException(status_code=404, detail="Estatísticas não encontradas")
    
    return statistics

@app.get("/departments/by-code/{department_code}", response_model=schemas.Department)
def get_department_by_code(
    department_code: str,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter departamento por código"""
    department = crud_supabase.get_department_by_code(
        clinic_id=current_user.clinic_id, 
        code=department_code
    )
    if not department:
        raise HTTPException(status_code=404, detail="Departamento não encontrado")
    
    return department

# ============================================================================
# ETAPA 5B - ESTOQUE AMPLIADO - ENDPOINTS ADICIONAIS
# ============================================================================

# Supplier Product Price endpoints
@app.post("/pharmacy/supplier-prices/", response_model=schemas.SupplierProductPrice)
def create_supplier_product_price(
    price: schemas.SupplierProductPriceCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar preço de produto por fornecedor"""
    return crud_supabase.create_supplier_product_price(clinic_id=current_user.clinic_id, price=price)

@app.get("/pharmacy/supplier-prices/", response_model=List[schemas.SupplierProductPrice])
def get_supplier_product_prices(
    product_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar preços de produtos por fornecedor"""
    return crud_supabase.get_supplier_product_prices(
        clinic_id=current_user.clinic_id,
        product_id=product_id,
        supplier_id=supplier_id,
        skip=skip,
        limit=limit
    )

@app.get("/pharmacy/products/{product_id}/price-comparison")
def get_product_price_comparison(
    product_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Comparar preços de um produto entre fornecedores"""
    prices = crud_supabase.get_supplier_product_prices(clinic_id=current_user.clinic_id, product_id=product_id)
    
    if not prices:
        raise HTTPException(status_code=404, detail="Nenhum preço encontrado para este produto")
    
    # Ordenar por preço
    sorted_prices = sorted(prices, key=lambda x: x.price)
    
    return {
        "product_id": product_id,
        "total_suppliers": len(prices),
        "best_price": sorted_prices[0].price if sorted_prices else None,
        "worst_price": sorted_prices[-1].price if sorted_prices else None,
        "average_price": sum(p.price for p in prices) / len(prices) if prices else 0,
        "prices": sorted_prices
    }

# Department Stock Level endpoints
@app.post("/pharmacy/department-stock/", response_model=schemas.DepartmentStockLevel)
def create_department_stock_level(
    stock: schemas.DepartmentStockLevelCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar nível de estoque por departamento"""
    return crud_supabase.create_department_stock_level(clinic_id=current_user.clinic_id, stock=stock)

@app.get("/pharmacy/department-stock/", response_model=List[schemas.DepartmentStockLevel])
def get_department_stock_levels(
    department_id: Optional[int] = None,
    product_id: Optional[int] = None,
    low_stock: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar níveis de estoque por departamento"""
    return crud_supabase.get_department_stock_levels(
        clinic_id=current_user.clinic_id,
        department_id=department_id,
        product_id=product_id,
        low_stock=low_stock,
        skip=skip,
        limit=limit
    )

# Category Alert endpoints
@app.post("/pharmacy/category-alerts/", response_model=schemas.CategoryAlert)
def create_category_alert(
    alert: schemas.CategoryAlertCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar alerta por categoria"""
    return crud_supabase.create_category_alert(
        clinic_id=current_user.clinic_id,
        alert=alert
    )

@app.get("/pharmacy/category-alerts/", response_model=List[schemas.CategoryAlert])
def get_category_alerts(
    category_id: Optional[int] = None,
    is_active: Optional[bool] = True,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar alertas por categoria"""
    return crud_supabase.get_category_alerts(
        clinic_id=current_user.clinic_id,
        category_id=category_id,
        is_active=is_active,
        skip=skip,
        limit=limit
    )

# Automatic Reorder endpoints
@app.post("/pharmacy/automatic-reorders/", response_model=schemas.AutomaticReorder)
def create_automatic_reorder(
    reorder: schemas.AutomaticReorderCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar regra de reposição automática"""
    return crud_supabase.create_automatic_reorder(
        clinic_id=current_user.clinic_id,
        reorder=reorder
    )

@app.get("/pharmacy/automatic-reorders/", response_model=List[schemas.AutomaticReorder])
def get_automatic_reorders(
    product_id: Optional[int] = None,
    is_enabled: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar regras de reposição automática"""
    return crud_supabase.get_automatic_reorders(
        clinic_id=current_user.clinic_id,
        product_id=product_id,
        is_enabled=is_enabled,
        skip=skip,
        limit=limit
    )

@app.post("/pharmacy/automatic-reorders/process")
def process_automatic_reorders(
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "pharmacy"]))
):
    """Processar reposições automáticas"""
    processed_orders = crud_supabase.process_automatic_reorders(
        clinic_id=current_user.clinic_id
    )
    
    return {
        "message": f"{len(processed_orders)} pedidos de reposição processados",
        "orders": processed_orders
    }

# ============================================================================
# ALIASES PARA COMPATIBILIDADE COM FRONTEND - ETAPA 5B
# ============================================================================

# Aliases para supplier-product-prices
@app.post("/supplier-product-prices/", response_model=schemas.SupplierProductPrice)
def create_supplier_product_price_alias(
    price: schemas.SupplierProductPriceCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Alias para criar preço de produto por fornecedor"""
    return crud_supabase.create_supplier_product_price(clinic_id=current_user.clinic_id, price=price)

@app.get("/supplier-product-prices/", response_model=List[schemas.SupplierProductPrice])
def get_supplier_product_prices_alias(
    product_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Alias para listar preços de produtos por fornecedor"""
    return crud_supabase.get_supplier_product_prices(
        clinic_id=current_user.clinic_id,
        product_id=product_id,
        supplier_id=supplier_id,
        skip=skip,
        limit=limit
    )

# Aliases para department-stock-levels
@app.post("/department-stock-levels/", response_model=schemas.DepartmentStockLevel)
def create_department_stock_level_alias(
    stock: schemas.DepartmentStockLevelCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Alias para criar nível de estoque por departamento"""
    return crud_supabase.create_department_stock_level(clinic_id=current_user.clinic_id, stock=stock)

@app.get("/department-stock-levels/", response_model=List[schemas.DepartmentStockLevel])
def get_department_stock_levels_alias(
    department_id: Optional[int] = None,
    product_id: Optional[int] = None,
    low_stock: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Alias para listar níveis de estoque por departamento"""
    return crud_supabase.get_department_stock_levels(
        clinic_id=current_user.clinic_id,
        department_id=department_id,
        product_id=product_id,
        low_stock=low_stock,
        skip=skip,
        limit=limit
    )

# Aliases para category-alerts
@app.post("/category-alerts/", response_model=schemas.CategoryAlert)
def create_category_alert_alias(
    alert: schemas.CategoryAlertCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Alias para criar alerta por categoria"""
    return crud_supabase.create_category_alert(
        clinic_id=current_user.clinic_id,
        alert=alert
    )

@app.get("/category-alerts/", response_model=List[schemas.CategoryAlert])
def get_category_alerts_alias(
    category_id: Optional[int] = None,
    is_active: Optional[bool] = True,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Alias para listar alertas por categoria"""
    return crud_supabase.get_category_alerts(
        clinic_id=current_user.clinic_id,
        category_id=category_id,
        is_active=is_active,
        skip=skip,
        limit=limit
    )

# Aliases para automatic-reorders
@app.post("/automatic-reorders/", response_model=schemas.AutomaticReorder)
def create_automatic_reorder_alias(
    reorder: schemas.AutomaticReorderCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Alias para criar regra de reposição automática"""
    return crud_supabase.create_automatic_reorder(
        clinic_id=current_user.clinic_id,
        reorder=reorder
    )

@app.get("/automatic-reorders/", response_model=List[schemas.AutomaticReorder])
def get_automatic_reorders_alias(
    product_id: Optional[int] = None,
    is_enabled: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Alias para listar regras de reposição automática"""
    return crud_supabase.get_automatic_reorders(
        clinic_id=current_user.clinic_id,
        product_id=product_id,
        is_enabled=is_enabled,
        skip=skip,
        limit=limit
    )

@app.post("/automatic-reorders/{reorder_id}/process")
def process_single_automatic_reorder(
    reorder_id: int,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "pharmacy"]))
):
    """Processar uma reposição automática específica"""
    processed_order = crud_supabase.process_single_automatic_reorder(
        clinic_id=current_user.clinic_id,
        reorder_id=reorder_id
    )
    
    if not processed_order:
        raise HTTPException(status_code=404, detail="Regra de reposição não encontrada")
    
    return {
        "message": "Pedido de reposição processado com sucesso",
        "order": processed_order
    }

# ============================================================================
# ETAPA 7 - SEGURANÇA E LGPD - ENDPOINTS ADICIONAIS
# ============================================================================

# Two Factor Auth endpoints
@app.post("/auth/2fa/setup")
def setup_2fa(
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Configurar autenticação de dois fatores"""
    import pyotp
    import qrcode
    import io
    import base64
    
    # Verificar se já existe configuração 2FA
    existing_2fa = crud_supabase.get_user_2fa(user_id=current_user.id, clinic_id=current_user.clinic_id)
    if existing_2fa and existing_2fa.is_enabled:
        raise HTTPException(status_code=400, detail="2FA já está habilitado")
    
    # Gerar nova chave secreta
    secret_key = pyotp.random_base32()
    
    # Criar ou atualizar registro 2FA
    if existing_2fa:
        crud_supabase.update_user_2fa(user_id=current_user.id, secret_key=secret_key, clinic_id=current_user.clinic_id)
    else:
        crud_supabase.create_user_2fa(user_id=current_user.id, secret_key=secret_key, clinic_id=current_user.clinic_id)
    
    # Gerar QR Code
    totp_uri = pyotp.totp.TOTP(secret_key).provisioning_uri(
        name=current_user.email,
        issuer_name="DataClínica"
    )
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(totp_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return {
        "secret_key": secret_key,
        "qr_code": f"data:image/png;base64,{qr_code_base64}",
        "manual_entry_key": secret_key
    }

@app.post("/auth/2fa/verify")
def verify_2fa(
    token: str,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Verificar e ativar 2FA"""
    import pyotp
    
    user_2fa = crud_supabase.get_user_2fa(user_id=current_user.id, clinic_id=current_user.clinic_id)
    if not user_2fa or not user_2fa.secret_key:
        raise HTTPException(status_code=400, detail="2FA não configurado")
    
    # Verificar token
    totp = pyotp.TOTP(user_2fa.secret_key)
    if not totp.verify(token):
        raise HTTPException(status_code=400, detail="Token inválido")
    
    # Ativar 2FA
    crud_supabase.enable_user_2fa(user_id=current_user.id, clinic_id=current_user.clinic_id)
    
    return {"message": "2FA ativado com sucesso"}

@app.post("/auth/2fa/disable")
def disable_2fa(
    password: str,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Desativar 2FA"""
    # Verificar senha atual
    if not auth.verify_password(password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Senha incorreta")
    
    crud_supabase.disable_user_2fa(user_id=current_user.id, clinic_id=current_user.clinic_id)
    
    return {"message": "2FA desativado com sucesso"}

# User Session endpoints
@app.get("/auth/sessions", response_model=List[schemas.UserSession])
def get_user_sessions(
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar sessões ativas do usuário"""
    return crud_supabase.get_user_sessions(user_id=current_user.id, clinic_id=current_user.clinic_id)

@app.delete("/auth/sessions/{session_id}")
def revoke_session(
    session_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Revogar sessão específica"""
    session = crud_supabase.get_user_session(session_id=session_id, clinic_id=current_user.clinic_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    crud_supabase.revoke_user_session(session_id=session_id, clinic_id=current_user.clinic_id)
    
    return {"message": "Sessão revogada com sucesso"}

@app.delete("/auth/sessions")
def revoke_all_sessions(
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Revogar todas as sessões do usuário"""
    crud_supabase.revoke_all_user_sessions(user_id=current_user.id, clinic_id=current_user.clinic_id)
    
    return {"message": "Todas as sessões foram revogadas"}

# Security Event endpoints
@app.get("/security/events", response_model=List[schemas.SecurityEvent])
def get_security_events(
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin", "security"]))
):
    """Listar eventos de segurança"""
    return crud_supabase.get_security_events(
        clinic_id=current_user.clinic_id,
        event_type=event_type,
        severity=severity,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit
    )

# Access Control endpoints
@app.post("/security/access-control/", response_model=schemas.AccessControl)
def create_access_control(
    access: schemas.AccessControlCreate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin"]))
):
    """Criar controle de acesso"""
    return crud_supabase.create_access_control(
        access=access, 
        clinic_id=current_user.clinic_id
    )

@app.get("/security/access-control/", response_model=List[schemas.AccessControl])
def get_access_controls(
    user_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin"]))
):
    """Listar controles de acesso"""
    return crud_supabase.get_access_controls(
        clinic_id=current_user.clinic_id,
        user_id=user_id,
        resource_type=resource_type,
        skip=skip,
        limit=limit
    )

# API Key endpoints
@app.post("/auth/api-keys/", response_model=schemas.ApiKey)
def create_api_key(
    api_key: schemas.ApiKeyCreate,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Criar chave de API"""
    return crud_supabase.create_api_key(
        api_key=api_key, 
        clinic_id=current_user.clinic_id
    )

@app.get("/auth/api-keys/", response_model=List[schemas.ApiKey])
def get_api_keys(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar chaves de API do usuário"""
    return crud_supabase.get_user_api_keys(
        user_id=current_user.id,
        clinic_id=current_user.clinic_id,
        skip=skip,
        limit=limit
    )

# ============================================================================
# ETAPA 8 - EXTRAS TÉCNICOS - ENDPOINTS
# ============================================================================

# External Integration endpoints
@app.post("/integrations/", response_model=schemas.ExternalIntegration)
def create_external_integration(
    integration: schemas.ExternalIntegrationCreate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin"]))
):
    """Criar integração externa"""
    return crud_supabase.create_external_integration(
        integration=integration, 
        clinic_id=current_user.clinic_id
    )

@app.get("/integrations/", response_model=List[schemas.ExternalIntegration])
def get_external_integrations(
    integration_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar integrações externas"""
    return crud_supabase.get_external_integrations(
        clinic_id=current_user.clinic_id,
        integration_type=integration_type,
        is_active=is_active,
        skip=skip,
        limit=limit
    )

@app.post("/integrations/{integration_id}/sync")
def sync_external_integration(
    integration_id: int,
    sync_type: str = "bidirectional",
    current_user: models.User = Depends(auth.check_permission_supabase(["admin"]))
):
    """Sincronizar integração externa"""
    integration = crud_supabase.get_external_integration(integration_id=integration_id, clinic_id=current_user.clinic_id)
    if not integration or integration.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    # Iniciar processo de sincronização
    sync_log = crud_supabase.start_integration_sync(
        integration_id=integration_id,
        sync_type=sync_type,
        clinic_id=current_user.clinic_id
    )
    
    return {
        "message": "Sincronização iniciada",
        "sync_log_id": sync_log.id
    }

# Tenant Configuration endpoints
@app.get("/tenant/configuration", response_model=schemas.TenantConfiguration)
def get_tenant_configuration(
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Obter configuração do tenant"""
    config = crud_supabase.get_tenant_configuration(clinic_id=current_user.clinic_id)
    if not config:
        # Criar configuração padrão se não existir
        config = crud_supabase.create_default_tenant_configuration(
            clinic_id=current_user.clinic_id
        )
    
    return config

@app.put("/tenant/configuration", response_model=schemas.TenantConfiguration)
def update_tenant_configuration(
    config: schemas.TenantConfigurationUpdate,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin"]))
):
    """Atualizar configuração do tenant"""
    return crud_supabase.update_tenant_configuration(
        clinic_id=current_user.clinic_id,
        config=config
    )

# System Notification endpoints
@app.get("/notifications/", response_model=List[schemas.SystemNotification])
def get_system_notifications(
    is_read: Optional[bool] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar notificações do sistema"""
    return crud_supabase.get_system_notifications(
        clinic_id=current_user.clinic_id,
        user_id=current_user.id,
        is_read=is_read,
        priority=priority,
        skip=skip,
        limit=limit
    )

@app.put("/notifications/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Marcar notificação como lida"""
    crud_supabase.mark_notification_as_read(notification_id=notification_id, clinic_id=current_user.clinic_id)
    
    return {"message": "Notificação marcada como lida"}

# Feature Flag endpoints
@app.get("/features/flags", response_model=List[schemas.FeatureFlag])
def get_feature_flags(
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Listar feature flags ativas para o usuário/clínica"""
    return crud_supabase.get_active_feature_flags(
        clinic_id=current_user.clinic_id,
        user_id=current_user.id
    )

@app.get("/features/flags/{flag_name}/enabled")
def is_feature_enabled(
    flag_name: str,
    current_user: models.User = Depends(auth.get_current_active_user_supabase)
):
    """Verificar se uma feature está habilitada"""
    enabled = crud_supabase.is_feature_enabled(
        flag_name=flag_name,
        clinic_id=current_user.clinic_id,
        user_id=current_user.id
    )
    
    return {"enabled": enabled}

# System Metrics endpoints
@app.get("/admin/metrics", response_model=List[schemas.SystemMetrics])
def get_system_metrics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 30,
    current_user: models.User = Depends(auth.check_permission_supabase(["admin"]))
):
    """Obter métricas do sistema (apenas admins)"""
    return crud_supabase.get_system_metrics(
        clinic_id=current_user.clinic_id,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit
    )

@app.get("/admin/metrics/dashboard")
def get_metrics_dashboard(
    current_user: models.User = Depends(auth.check_permission_supabase(["admin"]))
):
    """Dashboard de métricas do sistema"""
    today_metrics = crud_supabase.get_latest_system_metrics(clinic_id=current_user.clinic_id)
    
    if not today_metrics:
        return {
            "message": "Nenhuma métrica disponível",
            "metrics": None
        }
    
    return {
        "current_metrics": today_metrics,
        "trends": crud_supabase.get_metrics_trends(clinic_id=current_user.clinic_id, days=30),
        "alerts": crud_supabase.get_metrics_alerts(clinic_id=current_user.clinic_id)
    }