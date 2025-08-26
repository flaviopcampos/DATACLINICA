from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, date
from passlib.context import CryptContext

import models, schemas
from encryption import field_encryption

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Clinic CRUD
def get_clinic(db: Session, clinic_id: int):
    return db.query(models.Clinic).filter(models.Clinic.id == clinic_id).first()

def get_clinic_by_cnpj(db: Session, cnpj: str):
    return db.query(models.Clinic).filter(models.Clinic.cnpj == cnpj).first()

def get_clinics(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Clinic).offset(skip).limit(limit).all()

def create_clinic(db: Session, clinic: schemas.ClinicCreate):
    db_clinic = models.Clinic(**clinic.dict())
    db.add(db_clinic)
    db.commit()
    db.refresh(db_clinic)
    return db_clinic

def update_clinic(db: Session, clinic_id: int, clinic: schemas.ClinicUpdate):
    db_clinic = db.query(models.Clinic).filter(models.Clinic.id == clinic_id).first()
    if db_clinic:
        update_data = clinic.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_clinic, field, value)
        db_clinic.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_clinic)
    return db_clinic

def delete_clinic(db: Session, clinic_id: int):
    db_clinic = db.query(models.Clinic).filter(models.Clinic.id == clinic_id).first()
    if db_clinic:
        db.delete(db_clinic)
        db.commit()
    return db_clinic

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    user_data = {
        'username': user.username,
        'email': user.email,
        'hashed_password': hashed_password,
        'full_name': user.full_name,
        'role': user.role,
        'is_active': user.is_active
    }
    # Aplicar criptografia automática nos campos sensíveis
    user_data = field_encryption.encrypt_model_data(user_data, 'User')
    db_user = models.User(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        update_data = user.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'User')
        for field, value in update_data.items():
            setattr(db_user, field, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# Patient CRUD
def get_patient(db: Session, patient_id: int):
    return db.query(models.Patient).filter(models.Patient.id == patient_id).first()

def get_patient_by_cpf(db: Session, cpf: str):
    return db.query(models.Patient).filter(models.Patient.cpf == cpf).first()

def get_patients(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(models.Patient)
    if search:
        query = query.filter(
            or_(
                models.Patient.name.ilike(f"%{search}%"),
                models.Patient.cpf.ilike(f"%{search}%"),
                models.Patient.email.ilike(f"%{search}%")
            )
        )
    return query.offset(skip).limit(limit).all()

def create_patient(db: Session, patient: schemas.PatientCreate):
    patient_data = patient.dict()
    # Aplicar criptografia automática nos campos sensíveis
    patient_data = field_encryption.encrypt_model_data(patient_data, 'Patient')
    db_patient = models.Patient(**patient_data)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def update_patient(db: Session, patient_id: int, patient: schemas.PatientUpdate):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient:
        update_data = patient.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'Patient')
        for field, value in update_data.items():
            setattr(db_patient, field, value)
        db_patient.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_patient)
    return db_patient

def delete_patient(db: Session, patient_id: int):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient:
        db.delete(db_patient)
        db.commit()
    return db_patient

# Doctor CRUD
def get_doctor(db: Session, doctor_id: int):
    return db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()

def get_doctor_by_crm(db: Session, crm: str):
    return db.query(models.Doctor).filter(models.Doctor.crm == crm).first()

def get_doctors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Doctor).offset(skip).limit(limit).all()

def create_doctor(db: Session, doctor: schemas.DoctorCreate):
    doctor_data = doctor.dict()
    # Aplicar criptografia automática nos campos sensíveis
    doctor_data = field_encryption.encrypt_model_data(doctor_data, 'Doctor')
    db_doctor = models.Doctor(**doctor_data)
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

def update_doctor(db: Session, doctor_id: int, doctor: schemas.DoctorUpdate):
    db_doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if db_doctor:
        update_data = doctor.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'Doctor')
        for field, value in update_data.items():
            setattr(db_doctor, field, value)
        db.commit()
        db.refresh(db_doctor)
    return db_doctor

def delete_doctor(db: Session, doctor_id: int):
    db_doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if db_doctor:
        db.delete(db_doctor)
        db.commit()
    return db_doctor

# Appointment CRUD
def get_appointment(db: Session, appointment_id: int):
    return db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()

def get_appointments(db: Session, skip: int = 0, limit: int = 100, patient_id: Optional[int] = None, doctor_id: Optional[int] = None, date_from: Optional[date] = None, date_to: Optional[date] = None):
    query = db.query(models.Appointment)
    
    if patient_id:
        query = query.filter(models.Appointment.patient_id == patient_id)
    if doctor_id:
        query = query.filter(models.Appointment.doctor_id == doctor_id)
    if date_from:
        query = query.filter(models.Appointment.appointment_date >= date_from)
    if date_to:
        query = query.filter(models.Appointment.appointment_date <= date_to)
    
    return query.offset(skip).limit(limit).all()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    appointment_data = appointment.dict()
    # Aplicar criptografia automática nos campos sensíveis
    appointment_data = field_encryption.encrypt_model_data(appointment_data, 'Appointment')
    db_appointment = models.Appointment(**appointment_data)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: int, appointment: schemas.AppointmentUpdate):
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment:
        update_data = appointment.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'Appointment')
        for field, value in update_data.items():
            setattr(db_appointment, field, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def delete_appointment(db: Session, appointment_id: int):
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment

# Medical Record CRUD
def get_medical_record(db: Session, record_id: int):
    return db.query(models.MedicalRecord).filter(models.MedicalRecord.id == record_id).first()

def get_medical_records(db: Session, skip: int = 0, limit: int = 100, patient_id: Optional[int] = None, doctor_id: Optional[int] = None):
    query = db.query(models.MedicalRecord)
    
    if patient_id:
        query = query.filter(models.MedicalRecord.patient_id == patient_id)
    if doctor_id:
        query = query.filter(models.MedicalRecord.doctor_id == doctor_id)
    
    return query.offset(skip).limit(limit).all()

def create_medical_record(db: Session, record: schemas.MedicalRecordCreate):
    record_data = record.dict()
    # Aplicar criptografia automática nos campos sensíveis
    record_data = field_encryption.encrypt_model_data(record_data, 'MedicalRecord')
    db_record = models.MedicalRecord(**record_data)
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def update_medical_record(db: Session, record_id: int, record: schemas.MedicalRecordUpdate):
    db_record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == record_id).first()
    if db_record:
        update_data = record.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'MedicalRecord')
        for field, value in update_data.items():
            setattr(db_record, field, value)
        db.commit()
        db.refresh(db_record)
    return db_record

def delete_medical_record(db: Session, record_id: int):
    db_record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == record_id).first()
    if db_record:
        db.delete(db_record)
        db.commit()
    return db_record

# Medication CRUD
def get_medication(db: Session, medication_id: int):
    return db.query(models.Medication).filter(models.Medication.id == medication_id).first()

def get_medications(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, low_stock: bool = False):
    query = db.query(models.Medication)
    
    if search:
        query = query.filter(
            or_(
                models.Medication.name.ilike(f"%{search}%"),
                models.Medication.active_ingredient.ilike(f"%{search}%")
            )
        )
    
    if low_stock:
        query = query.filter(models.Medication.quantity_in_stock <= models.Medication.minimum_stock)
    
    return query.offset(skip).limit(limit).all()

def create_medication(db: Session, medication: schemas.MedicationCreate):
    medication_data = medication.dict()
    # Aplicar criptografia automática nos campos sensíveis
    medication_data = field_encryption.encrypt_model_data(medication_data, 'Medication')
    db_medication = models.Medication(**medication_data)
    db.add(db_medication)
    db.commit()
    db.refresh(db_medication)
    return db_medication

def update_medication(db: Session, medication_id: int, medication: schemas.MedicationUpdate):
    db_medication = db.query(models.Medication).filter(models.Medication.id == medication_id).first()
    if db_medication:
        update_data = medication.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'Medication')
        for field, value in update_data.items():
            setattr(db_medication, field, value)
        db_medication.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_medication)
    return db_medication

def delete_medication(db: Session, medication_id: int):
    db_medication = db.query(models.Medication).filter(models.Medication.id == medication_id).first()
    if db_medication:
        db.delete(db_medication)
        db.commit()
    return db_medication

# Stock Movement CRUD
def create_stock_movement(db: Session, movement: schemas.StockMovementCreate):
    db_movement = models.StockMovement(**movement.dict())
    db.add(db_movement)
    
    # Atualizar estoque do medicamento
    medication = db.query(models.Medication).filter(models.Medication.id == movement.medication_id).first()
    if medication:
        if movement.movement_type == "entrada":
            medication.quantity_in_stock += movement.quantity
        elif movement.movement_type == "saida":
            medication.quantity_in_stock -= movement.quantity
        elif movement.movement_type == "ajuste":
            medication.quantity_in_stock = movement.quantity
    
    db.commit()
    db.refresh(db_movement)
    return db_movement

def get_stock_movements(db: Session, skip: int = 0, limit: int = 100, medication_id: Optional[int] = None):
    query = db.query(models.StockMovement)
    
    if medication_id:
        query = query.filter(models.StockMovement.medication_id == medication_id)
    
    return query.order_by(models.StockMovement.created_at.desc()).offset(skip).limit(limit).all()

# Financial Transaction CRUD
def get_financial_transaction(db: Session, transaction_id: int):
    return db.query(models.FinancialTransaction).filter(models.FinancialTransaction.id == transaction_id).first()

def get_financial_transactions(db: Session, skip: int = 0, limit: int = 100, transaction_type: Optional[str] = None, status: Optional[str] = None, date_from: Optional[date] = None, date_to: Optional[date] = None):
    query = db.query(models.FinancialTransaction)
    
    if transaction_type:
        query = query.filter(models.FinancialTransaction.transaction_type == transaction_type)
    if status:
        query = query.filter(models.FinancialTransaction.status == status)
    if date_from:
        query = query.filter(models.FinancialTransaction.due_date >= date_from)
    if date_to:
        query = query.filter(models.FinancialTransaction.due_date <= date_to)
    
    return query.offset(skip).limit(limit).all()

def create_financial_transaction(db: Session, transaction: schemas.FinancialTransactionCreate):
    transaction_data = transaction.dict()
    # Aplicar criptografia automática nos campos sensíveis
    transaction_data = field_encryption.encrypt_model_data(transaction_data, 'FinancialTransaction')
    db_transaction = models.FinancialTransaction(**transaction_data)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def update_financial_transaction(db: Session, transaction_id: int, transaction: schemas.FinancialTransactionUpdate):
    db_transaction = db.query(models.FinancialTransaction).filter(models.FinancialTransaction.id == transaction_id).first()
    if db_transaction:
        update_data = transaction.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'FinancialTransaction')
        for field, value in update_data.items():
            setattr(db_transaction, field, value)
        db.commit()
        db.refresh(db_transaction)
    return db_transaction

def delete_financial_transaction(db: Session, transaction_id: int):
    db_transaction = db.query(models.FinancialTransaction).filter(models.FinancialTransaction.id == transaction_id).first()
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
    return db_transaction

# Anamnesis CRUD
def get_anamnesis(db: Session, anamnesis_id: int):
    return db.query(models.Anamnesis).filter(models.Anamnesis.id == anamnesis_id).first()

def get_anamnesis_by_medical_record(db: Session, medical_record_id: int):
    return db.query(models.Anamnesis).filter(models.Anamnesis.medical_record_id == medical_record_id).first()

def get_anamneses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Anamnesis).offset(skip).limit(limit).all()

def create_anamnesis(db: Session, anamnesis: schemas.AnamnesisCreate):
    anamnesis_data = anamnesis.dict()
    # Aplicar criptografia automática nos campos sensíveis
    anamnesis_data = field_encryption.encrypt_model_data(anamnesis_data, 'Anamnesis')
    db_anamnesis = models.Anamnesis(**anamnesis_data)
    db.add(db_anamnesis)
    db.commit()
    db.refresh(db_anamnesis)
    return db_anamnesis

def update_anamnesis(db: Session, anamnesis_id: int, anamnesis: schemas.AnamnesisUpdate):
    db_anamnesis = db.query(models.Anamnesis).filter(models.Anamnesis.id == anamnesis_id).first()
    if db_anamnesis:
        update_data = anamnesis.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'Anamnesis')
        for field, value in update_data.items():
            setattr(db_anamnesis, field, value)
        db.commit()
        db.refresh(db_anamnesis)
    return db_anamnesis

def delete_anamnesis(db: Session, anamnesis_id: int):
    db_anamnesis = db.query(models.Anamnesis).filter(models.Anamnesis.id == anamnesis_id).first()
    if db_anamnesis:
        db.delete(db_anamnesis)
        db.commit()
    return db_anamnesis

# Physical Exam CRUD
def get_physical_exam(db: Session, exam_id: int):
    return db.query(models.PhysicalExam).filter(models.PhysicalExam.id == exam_id).first()

def get_physical_exam_by_medical_record(db: Session, medical_record_id: int):
    return db.query(models.PhysicalExam).filter(models.PhysicalExam.medical_record_id == medical_record_id).first()

def get_physical_exams(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PhysicalExam).offset(skip).limit(limit).all()

def create_physical_exam(db: Session, exam: schemas.PhysicalExamCreate):
    exam_data = exam.dict()
    # Aplicar criptografia automática nos campos sensíveis
    exam_data = field_encryption.encrypt_model_data(exam_data, 'PhysicalExam')
    db_exam = models.PhysicalExam(**exam_data)
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

def update_physical_exam(db: Session, exam_id: int, exam: schemas.PhysicalExamUpdate):
    db_exam = db.query(models.PhysicalExam).filter(models.PhysicalExam.id == exam_id).first()
    if db_exam:
        update_data = exam.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'PhysicalExam')
        for field, value in update_data.items():
            setattr(db_exam, field, value)
        db.commit()
        db.refresh(db_exam)
    return db_exam

def delete_physical_exam(db: Session, exam_id: int):
    db_exam = db.query(models.PhysicalExam).filter(models.PhysicalExam.id == exam_id).first()
    if db_exam:
        db.delete(db_exam)
        db.commit()
    return db_exam

# Medical Document CRUD
def get_medical_document(db: Session, document_id: int):
    return db.query(models.MedicalDocument).filter(models.MedicalDocument.id == document_id).first()

def get_medical_documents_by_patient(db: Session, patient_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.MedicalDocument).filter(models.MedicalDocument.patient_id == patient_id).offset(skip).limit(limit).all()

def get_medical_documents_by_medical_record(db: Session, medical_record_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.MedicalDocument).filter(models.MedicalDocument.medical_record_id == medical_record_id).offset(skip).limit(limit).all()

def get_medical_documents(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.MedicalDocument).offset(skip).limit(limit).all()

def create_medical_document(db: Session, document: schemas.MedicalDocumentCreate):
    document_data = document.dict()
    # Aplicar criptografia automática nos campos sensíveis
    document_data = field_encryption.encrypt_model_data(document_data, 'MedicalDocument')
    db_document = models.MedicalDocument(**document_data)
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def update_medical_document(db: Session, document_id: int, document: schemas.MedicalDocumentUpdate):
    db_document = db.query(models.MedicalDocument).filter(models.MedicalDocument.id == document_id).first()
    if db_document:
        update_data = document.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'MedicalDocument')
        for field, value in update_data.items():
            setattr(db_document, field, value)
        db.commit()
        db.refresh(db_document)
    return db_document

def delete_medical_document(db: Session, document_id: int):
    db_document = db.query(models.MedicalDocument).filter(models.MedicalDocument.id == document_id).first()
    if db_document:
        db.delete(db_document)
        db.commit()
    return db_document

# Prescription Medication CRUD
def get_prescription_medication(db: Session, medication_id: int):
    return db.query(models.PrescriptionMedication).filter(models.PrescriptionMedication.id == medication_id).first()

def get_prescription_medications_by_prescription(db: Session, prescription_id: int):
    return db.query(models.PrescriptionMedication).filter(models.PrescriptionMedication.prescription_id == prescription_id).all()

def get_prescription_medications(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PrescriptionMedication).offset(skip).limit(limit).all()

def create_prescription_medication(db: Session, medication: schemas.PrescriptionMedicationCreate):
    medication_data = medication.dict()
    # Aplicar criptografia automática nos campos sensíveis
    medication_data = field_encryption.encrypt_model_data(medication_data, 'PrescriptionMedication')
    db_medication = models.PrescriptionMedication(**medication_data)
    db.add(db_medication)
    db.commit()
    db.refresh(db_medication)
    return db_medication

def update_prescription_medication(db: Session, medication_id: int, medication: schemas.PrescriptionMedicationUpdate):
    db_medication = db.query(models.PrescriptionMedication).filter(models.PrescriptionMedication.id == medication_id).first()
    if db_medication:
        update_data = medication.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'PrescriptionMedication')
        for field, value in update_data.items():
            setattr(db_medication, field, value)
        db.commit()
        db.refresh(db_medication)
    return db_medication

def delete_prescription_medication(db: Session, medication_id: int):
    db_medication = db.query(models.PrescriptionMedication).filter(models.PrescriptionMedication.id == medication_id).first()
    if db_medication:
        db.delete(db_medication)
        db.commit()
    return db_medication

# CID Diagnosis CRUD
def get_cid_diagnosis(db: Session, cid_id: int):
    return db.query(models.CidDiagnosis).filter(models.CidDiagnosis.id == cid_id).first()

def get_cid_diagnosis_by_code(db: Session, code: str):
    return db.query(models.CidDiagnosis).filter(models.CidDiagnosis.code == code).first()

def search_cid_diagnosis(db: Session, search_term: str, skip: int = 0, limit: int = 20):
    return db.query(models.CidDiagnosis).filter(
        models.CidDiagnosis.code.ilike(f"%{search_term}%") |
        models.CidDiagnosis.description.ilike(f"%{search_term}%")
    ).offset(skip).limit(limit).all()

# ETAPA 4 - Faturamento e Financeiro CRUD

# Insurance Company CRUD
def get_insurance_company(db: Session, company_id: int):
    return db.query(models.InsuranceCompany).filter(models.InsuranceCompany.id == company_id).first()

def get_insurance_companies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.InsuranceCompany).offset(skip).limit(limit).all()

def create_insurance_company(db: Session, company: schemas.InsuranceCompanyCreate):
    company_data = company.dict()
    # Aplicar criptografia automática nos campos sensíveis
    company_data = field_encryption.encrypt_model_data(company_data, 'InsuranceCompany')
    db_company = models.InsuranceCompany(**company_data)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def update_insurance_company(db: Session, company_id: int, company: schemas.InsuranceCompanyUpdate):
    db_company = db.query(models.InsuranceCompany).filter(models.InsuranceCompany.id == company_id).first()
    if db_company:
        update_data = company.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'InsuranceCompany')
        for field, value in update_data.items():
            setattr(db_company, field, value)
        db.commit()
        db.refresh(db_company)
    return db_company

# TUSS Procedure CRUD
def get_tuss_procedure(db: Session, procedure_id: int):
    return db.query(models.TussProcedure).filter(models.TussProcedure.id == procedure_id).first()

def get_tuss_procedures(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(models.TussProcedure)
    if search:
        query = query.filter(
            models.TussProcedure.code.ilike(f"%{search}%") |
            models.TussProcedure.description.ilike(f"%{search}%")
        )
    return query.offset(skip).limit(limit).all()

def create_tuss_procedure(db: Session, procedure: schemas.TussProcedureCreate):
    procedure_data = procedure.dict()
    # Aplicar criptografia automática nos campos sensíveis
    procedure_data = field_encryption.encrypt_model_data(procedure_data, 'TussProcedure')
    db_procedure = models.TussProcedure(**procedure_data)
    db.add(db_procedure)
    db.commit()
    db.refresh(db_procedure)
    return db_procedure

# Billing Batch CRUD
def get_billing_batch(db: Session, batch_id: int):
    return db.query(models.BillingBatch).filter(models.BillingBatch.id == batch_id).first()

def get_billing_batches(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None):
    query = db.query(models.BillingBatch)
    if status:
        query = query.filter(models.BillingBatch.status == status)
    return query.offset(skip).limit(limit).all()

def create_billing_batch(db: Session, batch: schemas.BillingBatchCreate):
    batch_data = batch.dict()
    # Aplicar criptografia automática nos campos sensíveis
    batch_data = field_encryption.encrypt_model_data(batch_data, 'BillingBatch')
    db_batch = models.BillingBatch(**batch_data)
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

def update_billing_batch(db: Session, batch_id: int, batch: schemas.BillingBatchUpdate):
    db_batch = db.query(models.BillingBatch).filter(models.BillingBatch.id == batch_id).first()
    if db_batch:
        update_data = batch.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'BillingBatch')
        for field, value in update_data.items():
            setattr(db_batch, field, value)
        db_batch.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_batch)
    return db_batch

# Billing Item CRUD
def get_billing_item(db: Session, item_id: int):
    return db.query(models.BillingItem).filter(models.BillingItem.id == item_id).first()

def get_billing_items(db: Session, skip: int = 0, limit: int = 100, batch_id: Optional[int] = None):
    query = db.query(models.BillingItem)
    if batch_id:
        query = query.filter(models.BillingItem.batch_id == batch_id)
    return query.offset(skip).limit(limit).all()

def create_billing_item(db: Session, item: schemas.BillingItemCreate):
    item_data = item.dict()
    # Aplicar criptografia automática nos campos sensíveis
    item_data = field_encryption.encrypt_model_data(item_data, 'BillingItem')
    db_item = models.BillingItem(**item_data)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# Accounts Receivable CRUD
def get_accounts_receivable_item(db: Session, receivable_id: int):
    return db.query(models.AccountsReceivable).filter(models.AccountsReceivable.id == receivable_id).first()

def get_accounts_receivable(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None):
    query = db.query(models.AccountsReceivable)
    if status:
        query = query.filter(models.AccountsReceivable.status == status)
    return query.offset(skip).limit(limit).all()

def create_accounts_receivable(db: Session, receivable: schemas.AccountsReceivableCreate):
    receivable_data = receivable.dict()
    # Aplicar criptografia automática nos campos sensíveis
    receivable_data = field_encryption.encrypt_model_data(receivable_data, 'AccountsReceivable')
    db_receivable = models.AccountsReceivable(**receivable_data)
    db.add(db_receivable)
    db.commit()
    db.refresh(db_receivable)
    return db_receivable

def update_accounts_receivable(db: Session, receivable_id: int, receivable: schemas.AccountsReceivableUpdate):
    db_receivable = db.query(models.AccountsReceivable).filter(models.AccountsReceivable.id == receivable_id).first()
    if db_receivable:
        update_data = receivable.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'AccountsReceivable')
        for field, value in update_data.items():
            setattr(db_receivable, field, value)
        db_receivable.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_receivable)
    return db_receivable

# Accounts Payable CRUD
def get_accounts_payable_item(db: Session, payable_id: int):
    return db.query(models.AccountsPayable).filter(models.AccountsPayable.id == payable_id).first()

def get_accounts_payable(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None):
    query = db.query(models.AccountsPayable)
    if status:
        query = query.filter(models.AccountsPayable.status == status)
    return query.offset(skip).limit(limit).all()

def create_accounts_payable(db: Session, payable: schemas.AccountsPayableCreate):
    payable_data = payable.dict()
    # Aplicar criptografia automática nos campos sensíveis
    payable_data = field_encryption.encrypt_model_data(payable_data, 'AccountsPayable')
    db_payable = models.AccountsPayable(**payable_data)
    db.add(db_payable)
    db.commit()
    db.refresh(db_payable)
    return db_payable

def update_accounts_payable(db: Session, payable_id: int, payable: schemas.AccountsPayableUpdate):
    db_payable = db.query(models.AccountsPayable).filter(models.AccountsPayable.id == payable_id).first()
    if db_payable:
        update_data = payable.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'AccountsPayable')
        for field, value in update_data.items():
            setattr(db_payable, field, value)
        db_payable.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_payable)
    return db_payable

# Cash Flow CRUD
def get_cash_flow_item(db: Session, cash_flow_id: int):
    return db.query(models.CashFlow).filter(models.CashFlow.id == cash_flow_id).first()

def get_cash_flow(db: Session, skip: int = 0, limit: int = 100, transaction_type: Optional[str] = None):
    query = db.query(models.CashFlow)
    if transaction_type:
        query = query.filter(models.CashFlow.transaction_type == transaction_type)
    return query.offset(skip).limit(limit).all()

def create_cash_flow(db: Session, cash_flow: schemas.CashFlowCreate):
    cash_flow_data = cash_flow.dict()
    # Aplicar criptografia automática nos campos sensíveis
    cash_flow_data = field_encryption.encrypt_model_data(cash_flow_data, 'CashFlow')
    db_cash_flow = models.CashFlow(**cash_flow_data)
    db.add(db_cash_flow)
    db.commit()
    db.refresh(db_cash_flow)
    return db_cash_flow

def get_cid_diagnoses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.CidDiagnosis).offset(skip).limit(limit).all()

# Medical Record Diagnosis CRUD
def get_medical_record_diagnosis(db: Session, diagnosis_id: int):
    return db.query(models.MedicalRecordDiagnosis).filter(models.MedicalRecordDiagnosis.id == diagnosis_id).first()

def get_medical_record_diagnoses_by_record(db: Session, medical_record_id: int):
    return db.query(models.MedicalRecordDiagnosis).filter(models.MedicalRecordDiagnosis.medical_record_id == medical_record_id).all()

def create_medical_record_diagnosis(db: Session, diagnosis: schemas.MedicalRecordDiagnosisCreate):
    diagnosis_data = diagnosis.dict()
    # Aplicar criptografia automática nos campos sensíveis
    diagnosis_data = field_encryption.encrypt_model_data(diagnosis_data, 'MedicalRecordDiagnosis')
    db_diagnosis = models.MedicalRecordDiagnosis(**diagnosis_data)
    db.add(db_diagnosis)
    db.commit()
    db.refresh(db_diagnosis)
    return db_diagnosis

def delete_medical_record_diagnosis(db: Session, diagnosis_id: int):
    db_diagnosis = db.query(models.MedicalRecordDiagnosis).filter(models.MedicalRecordDiagnosis.id == diagnosis_id).first()
    if db_diagnosis:
        db.delete(db_diagnosis)
        db.commit()
    return db_diagnosis

# Medical Record Template CRUD
def get_medical_record_template(db: Session, template_id: int):
    return db.query(models.MedicalRecordTemplate).filter(models.MedicalRecordTemplate.id == template_id).first()

def get_medical_record_templates_by_clinic(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.MedicalRecordTemplate).filter(models.MedicalRecordTemplate.clinic_id == clinic_id).offset(skip).limit(limit).all()

def get_medical_record_templates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.MedicalRecordTemplate).offset(skip).limit(limit).all()

def create_medical_record_template(db: Session, template: schemas.MedicalRecordTemplateCreate):
    template_data = template.dict()
    # Aplicar criptografia automática nos campos sensíveis
    template_data = field_encryption.encrypt_model_data(template_data, 'MedicalRecordTemplate')
    db_template = models.MedicalRecordTemplate(**template_data)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def update_medical_record_template(db: Session, template_id: int, template: schemas.MedicalRecordTemplateUpdate):
    db_template = db.query(models.MedicalRecordTemplate).filter(models.MedicalRecordTemplate.id == template_id).first()
    if db_template:
        update_data = template.dict(exclude_unset=True)
        # Aplicar criptografia automática nos campos sensíveis
        update_data = field_encryption.encrypt_model_data(update_data, 'MedicalRecordTemplate')
        for field, value in update_data.items():
            setattr(db_template, field, value)
        db.commit()
        db.refresh(db_template)
    return db_template

def delete_medical_record_template(db: Session, template_id: int):
    db_template = db.query(models.MedicalRecordTemplate).filter(models.MedicalRecordTemplate.id == template_id).first()
    if db_template:
        db.delete(db_template)
        db.commit()
    return db_template

# Invoice NFS CRUD
def get_invoice_nfs(db: Session, invoice_id: int):
    return db.query(models.InvoiceNFS).filter(models.InvoiceNFS.id == invoice_id).first()

def get_invoices_nfs(db: Session, clinic_id: int, skip: int = 0, limit: int = 100, status: Optional[str] = None):
    query = db.query(models.InvoiceNFS).filter(models.InvoiceNFS.clinic_id == clinic_id)
    if status:
        query = query.filter(models.InvoiceNFS.status == status)
    return query.offset(skip).limit(limit).all()

def create_invoice_nfs(db: Session, invoice: schemas.InvoiceNFSCreate, clinic_id: int, user_id: int):
    # Gerar número da nota fiscal
    last_invoice = db.query(models.InvoiceNFS).filter(models.InvoiceNFS.clinic_id == clinic_id).order_by(models.InvoiceNFS.id.desc()).first()
    invoice_number = f"{clinic_id:04d}{(last_invoice.id + 1 if last_invoice else 1):06d}"
    
    # Buscar configuração de impostos
    tax_config = db.query(models.TaxConfiguration).filter(
        models.TaxConfiguration.clinic_id == clinic_id,
        models.TaxConfiguration.is_active == True
    ).first()
    
    if not tax_config:
        raise ValueError("Configuração de impostos não encontrada")
    
    # Calcular impostos
    net_amount = invoice.gross_amount - invoice.discount_amount
    iss_amount = net_amount * (tax_config.iss_rate / 100)
    pis_amount = net_amount * (tax_config.pis_rate / 100)
    cofins_amount = net_amount * (tax_config.cofins_rate / 100)
    irrf_amount = net_amount * (tax_config.irrf_rate / 100)
    total_taxes = iss_amount + pis_amount + cofins_amount + irrf_amount
    final_amount = net_amount - total_taxes
    
    db_invoice = models.InvoiceNFS(
        clinic_id=clinic_id,
        patient_id=invoice.patient_id,
        appointment_id=invoice.appointment_id,
        invoice_number=invoice_number,
        series="001",
        service_date=invoice.service_date,
        gross_amount=invoice.gross_amount,
        discount_amount=invoice.discount_amount,
        net_amount=net_amount,
        iss_rate=tax_config.iss_rate,
        iss_amount=iss_amount,
        pis_rate=tax_config.pis_rate,
        pis_amount=pis_amount,
        cofins_rate=tax_config.cofins_rate,
        cofins_amount=cofins_amount,
        irrf_rate=tax_config.irrf_rate,
        irrf_amount=irrf_amount,
        total_taxes=total_taxes,
        final_amount=final_amount,
        city_code=tax_config.city_code,
        service_code=invoice.service_code,
        description=invoice.description,
        notes=invoice.notes,
        created_by=user_id
    )
    
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice_nfs(db: Session, invoice_id: int, invoice: schemas.InvoiceNFSUpdate):
    db_invoice = db.query(models.InvoiceNFS).filter(models.InvoiceNFS.id == invoice_id).first()
    if db_invoice:
        update_data = invoice.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_invoice, field, value)
        if invoice.cancellation_reason:
            db_invoice.cancelled_at = datetime.utcnow()
        db.commit()
        db.refresh(db_invoice)
    return db_invoice

# Cost Center CRUD
def get_cost_center(db: Session, cost_center_id: int):
    return db.query(models.CostCenter).filter(models.CostCenter.id == cost_center_id).first()

def get_cost_centers(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.CostCenter).filter(models.CostCenter.clinic_id == clinic_id).offset(skip).limit(limit).all()

def create_cost_center(db: Session, cost_center: schemas.CostCenterCreate, clinic_id: int):
    db_cost_center = models.CostCenter(**cost_center.dict(), clinic_id=clinic_id)
    db.add(db_cost_center)
    db.commit()
    db.refresh(db_cost_center)
    return db_cost_center

def update_cost_center(db: Session, cost_center_id: int, cost_center: schemas.CostCenterUpdate):
    db_cost_center = db.query(models.CostCenter).filter(models.CostCenter.id == cost_center_id).first()
    if db_cost_center:
        update_data = cost_center.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_cost_center, field, value)
        db.commit()
        db.refresh(db_cost_center)
    return db_cost_center

# Tax Configuration CRUD
def get_tax_configuration(db: Session, config_id: int):
    return db.query(models.TaxConfiguration).filter(models.TaxConfiguration.id == config_id).first()

def get_tax_configurations(db: Session, clinic_id: int):
    return db.query(models.TaxConfiguration).filter(models.TaxConfiguration.clinic_id == clinic_id).all()

def get_active_tax_configuration(db: Session, clinic_id: int):
    return db.query(models.TaxConfiguration).filter(
        models.TaxConfiguration.clinic_id == clinic_id,
        models.TaxConfiguration.is_active == True
    ).first()

def create_tax_configuration(db: Session, config: schemas.TaxConfigurationCreate, clinic_id: int):
    # Desativar configurações anteriores
    db.query(models.TaxConfiguration).filter(
        models.TaxConfiguration.clinic_id == clinic_id,
        models.TaxConfiguration.is_active == True
    ).update({"is_active": False})
    
    db_config = models.TaxConfiguration(**config.dict(), clinic_id=clinic_id)
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def update_tax_configuration(db: Session, config_id: int, config: schemas.TaxConfigurationUpdate):
    db_config = db.query(models.TaxConfiguration).filter(models.TaxConfiguration.id == config_id).first()
    if db_config:
        update_data = config.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_config, field, value)
        db.commit()
        db.refresh(db_config)
    return db_config

# Bank Account CRUD
def get_bank_account(db: Session, account_id: int):
    return db.query(models.BankAccount).filter(models.BankAccount.id == account_id).first()

def get_bank_accounts(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.BankAccount).filter(models.BankAccount.clinic_id == clinic_id).offset(skip).limit(limit).all()

def create_bank_account(db: Session, account: schemas.BankAccountCreate, clinic_id: int):
    db_account = models.BankAccount(**account.dict(), clinic_id=clinic_id, current_balance=account.initial_balance)
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def update_bank_account(db: Session, account_id: int, account: schemas.BankAccountUpdate):
    db_account = db.query(models.BankAccount).filter(models.BankAccount.id == account_id).first()
    if db_account:
        update_data = account.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_account, field, value)
        db.commit()
        db.refresh(db_account)
    return db_account

# Bank Reconciliation CRUD
def get_bank_reconciliation(db: Session, reconciliation_id: int):
    return db.query(models.BankReconciliation).filter(models.BankReconciliation.id == reconciliation_id).first()

def get_bank_reconciliations(db: Session, bank_account_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.BankReconciliation).filter(models.BankReconciliation.bank_account_id == bank_account_id).offset(skip).limit(limit).all()

def create_bank_reconciliation(db: Session, reconciliation: schemas.BankReconciliationCreate, user_id: int):
    difference = reconciliation.bank_balance - reconciliation.system_balance
    db_reconciliation = models.BankReconciliation(
        **reconciliation.dict(),
        difference=difference,
        reconciled_by=user_id
    )
    db.add(db_reconciliation)
    db.commit()
    db.refresh(db_reconciliation)
    return db_reconciliation

def update_bank_reconciliation(db: Session, reconciliation_id: int, reconciliation: schemas.BankReconciliationUpdate, user_id: int):
    db_reconciliation = db.query(models.BankReconciliation).filter(models.BankReconciliation.id == reconciliation_id).first()
    if db_reconciliation:
        update_data = reconciliation.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_reconciliation, field, value)
        if reconciliation.status == "reconciled":
            db_reconciliation.reconciled_at = datetime.utcnow()
            db_reconciliation.reconciled_by = user_id
        db.commit()
        db.refresh(db_reconciliation)
    return db_reconciliation

# Doctor Payment CRUD
def get_doctor_payment(db: Session, payment_id: int):
    return db.query(models.DoctorPayment).filter(models.DoctorPayment.id == payment_id).first()

def get_doctor_payments(db: Session, clinic_id: int, doctor_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.DoctorPayment).filter(models.DoctorPayment.clinic_id == clinic_id)
    if doctor_id:
        query = query.filter(models.DoctorPayment.doctor_id == doctor_id)
    return query.offset(skip).limit(limit).all()

def create_doctor_payment(db: Session, payment: schemas.DoctorPaymentCreate, clinic_id: int, user_id: int):
    # Calcular valores baseados nos procedimentos do mês
    from sqlalchemy import func, extract
    year, month = payment.reference_month.split('-')
    
    # Buscar total de procedimentos e valores do médico no mês
    procedures_data = db.query(
        func.count(models.Appointment.id).label('total_procedures'),
        func.sum(models.Appointment.total_amount).label('gross_amount')
    ).filter(
        models.Appointment.doctor_id == payment.doctor_id,
        models.Appointment.clinic_id == clinic_id,
        extract('year', models.Appointment.appointment_date) == int(year),
        extract('month', models.Appointment.appointment_date) == int(month),
        models.Appointment.status == 'completed'
    ).first()
    
    total_procedures = procedures_data.total_procedures or 0
    gross_amount = procedures_data.gross_amount or 0
    
    clinic_amount = gross_amount * (payment.clinic_percentage / 100)
    doctor_amount = gross_amount * (payment.doctor_percentage / 100)
    net_amount = doctor_amount - payment.deductions
    
    db_payment = models.DoctorPayment(
        clinic_id=clinic_id,
        doctor_id=payment.doctor_id,
        reference_month=payment.reference_month,
        total_procedures=total_procedures,
        gross_amount=gross_amount,
        clinic_percentage=payment.clinic_percentage,
        clinic_amount=clinic_amount,
        doctor_percentage=payment.doctor_percentage,
        doctor_amount=doctor_amount,
        deductions=payment.deductions,
        net_amount=net_amount,
        payment_date=payment.payment_date,
        payment_method=payment.payment_method,
        notes=payment.notes,
        created_by=user_id
    )
    
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def update_doctor_payment(db: Session, payment_id: int, payment: schemas.DoctorPaymentUpdate):
    db_payment = db.query(models.DoctorPayment).filter(models.DoctorPayment.id == payment_id).first()
    if db_payment:
        update_data = payment.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_payment, field, value)
        # Recalcular valor líquido se deduções foram alteradas
        if 'deductions' in update_data:
            db_payment.net_amount = db_payment.doctor_amount - db_payment.deductions
        db.commit()
        db.refresh(db_payment)
    return db_payment

# Financial KPI CRUD
def get_financial_kpi(db: Session, kpi_id: int):
    return db.query(models.FinancialKPI).filter(models.FinancialKPI.id == kpi_id).first()

def get_financial_kpis(db: Session, clinic_id: int, kpi_type: Optional[str] = None, period_type: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.FinancialKPI).filter(models.FinancialKPI.clinic_id == clinic_id)
    if kpi_type:
        query = query.filter(models.FinancialKPI.kpi_type == kpi_type)
    if period_type:
        query = query.filter(models.FinancialKPI.period_type == period_type)
    return query.order_by(models.FinancialKPI.reference_date.desc()).offset(skip).limit(limit).all()

def create_financial_kpi(db: Session, kpi: schemas.FinancialKPICreate, clinic_id: int):
    variance = None
    if kpi.target_value:
        variance = kpi.kpi_value - kpi.target_value
    
    db_kpi = models.FinancialKPI(
        clinic_id=clinic_id,
        reference_date=kpi.reference_date,
        kpi_type=kpi.kpi_type,
        kpi_value=kpi.kpi_value,
        target_value=kpi.target_value,
        variance=variance,
        period_type=kpi.period_type
    )
    
    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    return db_kpi

# Supplier CRUD
def get_supplier(db: Session, supplier_id: int):
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()

def get_suppliers(db: Session, clinic_id: int, category: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Supplier).filter(models.Supplier.clinic_id == clinic_id)
    if category:
        query = query.filter(models.Supplier.category == category)
    return query.offset(skip).limit(limit).all()

def create_supplier(db: Session, supplier: schemas.SupplierCreate, clinic_id: int):
    db_supplier = models.Supplier(**supplier.dict(), clinic_id=clinic_id)
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def update_supplier(db: Session, supplier_id: int, supplier: schemas.SupplierUpdate):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if db_supplier:
        update_data = supplier.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_supplier, field, value)
        db.commit()
        db.refresh(db_supplier)
    return db_supplier

# Audit Log CRUD
def create_audit_log(db: Session, audit_log: schemas.AuditLogCreate):
    db_audit_log = models.AuditLog(**audit_log.dict())
    db.add(db_audit_log)
    db.commit()
    db.refresh(db_audit_log)
    return db_audit_log

def get_audit_logs(db: Session, clinic_id: int, skip: int = 0, limit: int = 100, 
                   start_date=None, end_date=None, table_name: str = None, user_id: int = None):
    query = db.query(models.AuditLog).filter(
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
    
    return query.order_by(models.AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

def get_audit_log(db: Session, audit_log_id: int, clinic_id: int):
    return db.query(models.AuditLog).filter(
        models.AuditLog.id == audit_log_id,
        models.AuditLog.clinic_id == clinic_id
    ).first()

# ETAPA 5 - Farmácia e Estoque CRUD

# Product Category CRUD
def get_product_category(db: Session, category_id: int):
    return db.query(models.ProductCategory).filter(models.ProductCategory.id == category_id).first()

def get_product_categories(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.ProductCategory).filter(
        models.ProductCategory.clinic_id == clinic_id,
        models.ProductCategory.is_active == True
    ).offset(skip).limit(limit).all()

def create_product_category(db: Session, category: schemas.ProductCategoryCreate, clinic_id: int):
    db_category = models.ProductCategory(**category.dict(), clinic_id=clinic_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_product_category(db: Session, category_id: int, category: schemas.ProductCategoryUpdate):
    db_category = db.query(models.ProductCategory).filter(models.ProductCategory.id == category_id).first()
    if db_category:
        update_data = category.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_product_category(db: Session, category_id: int):
    db_category = db.query(models.ProductCategory).filter(models.ProductCategory.id == category_id).first()
    if db_category:
        db_category.is_active = False
        db.commit()
        db.refresh(db_category)
    return db_category

# Product CRUD
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(db: Session, clinic_id: int, category_id: Optional[int] = None, 
                search: Optional[str] = None, low_stock: bool = False, 
                skip: int = 0, limit: int = 100):
    query = db.query(models.Product).filter(
        models.Product.clinic_id == clinic_id,
        models.Product.is_active == True
    )
    
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    
    if search:
        query = query.filter(
            models.Product.name.ilike(f"%{search}%") |
            models.Product.description.ilike(f"%{search}%") |
            models.Product.barcode.ilike(f"%{search}%")
        )
    
    if low_stock:
        query = query.filter(models.Product.current_stock <= models.Product.minimum_stock)
    
    return query.offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate, clinic_id: int):
    db_product = models.Product(**product.dict(), clinic_id=clinic_id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product:
        update_data = product.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        db_product.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product:
        db_product.is_active = False
        db.commit()
        db.refresh(db_product)
    return db_product

# Product Batch CRUD
def get_product_batch(db: Session, batch_id: int):
    return db.query(models.ProductBatch).filter(models.ProductBatch.id == batch_id).first()

def get_product_batches(db: Session, clinic_id: int, product_id: Optional[int] = None, 
                       expiring_soon: bool = False, skip: int = 0, limit: int = 100):
    query = db.query(models.ProductBatch).filter(
        models.ProductBatch.clinic_id == clinic_id,
        models.ProductBatch.is_active == True
    )
    
    if product_id:
        query = query.filter(models.ProductBatch.product_id == product_id)
    
    if expiring_soon:
        from datetime import date, timedelta
        thirty_days_from_now = date.today() + timedelta(days=30)
        query = query.filter(
            models.ProductBatch.expiry_date.isnot(None),
            models.ProductBatch.expiry_date <= thirty_days_from_now
        )
    
    return query.order_by(models.ProductBatch.expiry_date.asc()).offset(skip).limit(limit).all()

def create_product_batch(db: Session, batch: schemas.ProductBatchCreate, clinic_id: int):
    db_batch = models.ProductBatch(**batch.dict(), clinic_id=clinic_id)
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

def update_product_batch(db: Session, batch_id: int, batch: schemas.ProductBatchUpdate):
    db_batch = db.query(models.ProductBatch).filter(models.ProductBatch.id == batch_id).first()
    if db_batch:
        update_data = batch.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_batch, field, value)
        db.commit()
        db.refresh(db_batch)
    return db_batch

# Product Stock Movement CRUD
def get_product_stock_movement(db: Session, movement_id: int):
    return db.query(models.ProductStockMovement).filter(models.ProductStockMovement.id == movement_id).first()

def get_product_stock_movements(db: Session, clinic_id: int, product_id: Optional[int] = None,
                               department: Optional[str] = None, movement_type: Optional[str] = None,
                               skip: int = 0, limit: int = 100):
    query = db.query(models.ProductStockMovement).filter(models.ProductStockMovement.clinic_id == clinic_id)
    
    if product_id:
        query = query.filter(models.ProductStockMovement.product_id == product_id)
    if department:
        query = query.filter(models.ProductStockMovement.department == department)
    if movement_type:
        query = query.filter(models.ProductStockMovement.movement_type == movement_type)
    
    return query.order_by(models.ProductStockMovement.created_at.desc()).offset(skip).limit(limit).all()

def create_product_stock_movement(db: Session, movement: schemas.ProductStockMovementCreate, 
                                 clinic_id: int, user_id: int):
    db_movement = models.ProductStockMovement(
        **movement.dict(),
        clinic_id=clinic_id,
        user_id=user_id
    )
    
    # Atualizar estoque do produto
    db_product = db.query(models.Product).filter(models.Product.id == movement.product_id).first()
    if db_product:
        if movement.movement_type in ['entrada', 'ajuste_positivo']:
            db_product.current_stock += int(movement.quantity)
        elif movement.movement_type in ['saida', 'ajuste_negativo']:
            db_product.current_stock -= int(movement.quantity)
        
        db.add(db_movement)
        db.commit()
        db.refresh(db_movement)
        db.refresh(db_product)
    
    return db_movement

# Stock Requisition CRUD
def get_stock_requisition(db: Session, requisition_id: int):
    return db.query(models.StockRequisition).filter(models.StockRequisition.id == requisition_id).first()

def get_stock_requisitions(db: Session, clinic_id: int, department: Optional[str] = None,
                          status: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.StockRequisition).filter(models.StockRequisition.clinic_id == clinic_id)
    
    if department:
        query = query.filter(models.StockRequisition.department == department)
    if status:
        query = query.filter(models.StockRequisition.status == status)
    
    return query.order_by(models.StockRequisition.requested_at.desc()).offset(skip).limit(limit).all()

def create_stock_requisition(db: Session, requisition: schemas.StockRequisitionCreate, 
                           clinic_id: int, user_id: int):
    db_requisition = models.StockRequisition(
        **requisition.dict(),
        clinic_id=clinic_id,
        requested_by=user_id,
        status="pendente",
        requested_at=datetime.utcnow()
    )
    
    db.add(db_requisition)
    db.commit()
    db.refresh(db_requisition)
    return db_requisition

def update_stock_requisition(db: Session, requisition_id: int, requisition: schemas.StockRequisitionUpdate, user_id: int):
    db_requisition = db.query(models.StockRequisition).filter(models.StockRequisition.id == requisition_id).first()
    if db_requisition:
        update_data = requisition.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_requisition, field, value)
        
        # Atualizar timestamps baseado no status
        if requisition.status == "aprovada" and not db_requisition.approved_at:
            db_requisition.approved_at = datetime.utcnow()
            db_requisition.approved_by = user_id
        elif requisition.status == "atendida" and not db_requisition.fulfilled_at:
            db_requisition.fulfilled_at = datetime.utcnow()
            db_requisition.fulfilled_by = user_id
        
        db.commit()
        db.refresh(db_requisition)
    return db_requisition

# Stock Requisition Item CRUD
def get_stock_requisition_items(db: Session, requisition_id: int):
    return db.query(models.StockRequisitionItem).filter(
        models.StockRequisitionItem.requisition_id == requisition_id
    ).all()

def create_stock_requisition_item(db: Session, item: schemas.StockRequisitionItemCreate):
    db_item = models.StockRequisitionItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_stock_requisition_item(db: Session, item_id: int, item: schemas.StockRequisitionItemUpdate):
    db_item = db.query(models.StockRequisitionItem).filter(models.StockRequisitionItem.id == item_id).first()
    if db_item:
        update_data = item.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        db.commit()
        db.refresh(db_item)
    return db_item

# Purchase Order CRUD
def get_purchase_order(db: Session, order_id: int):
    return db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()

def get_purchase_orders(db: Session, clinic_id: int, supplier_id: Optional[int] = None,
                       status: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.clinic_id == clinic_id)
    
    if supplier_id:
        query = query.filter(models.PurchaseOrder.supplier_id == supplier_id)
    if status:
        query = query.filter(models.PurchaseOrder.status == status)
    
    return query.order_by(models.PurchaseOrder.created_at.desc()).offset(skip).limit(limit).all()

def create_purchase_order(db: Session, order: schemas.PurchaseOrderCreate, clinic_id: int, user_id: int):
    db_order = models.PurchaseOrder(
        **order.dict(),
        clinic_id=clinic_id,
        created_by=user_id,
        status="pendente"
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def update_purchase_order(db: Session, order_id: int, order: schemas.PurchaseOrderUpdate, user_id: int):
    db_order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if db_order:
        update_data = order.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_order, field, value)
        
        if order.status == "recebido" and not db_order.received_date:
            db_order.received_date = datetime.utcnow().date()
            db_order.received_by = user_id
        
        db.commit()
        db.refresh(db_order)
    return db_order

# Purchase Order Item CRUD
def get_purchase_order_items(db: Session, order_id: int):
    return db.query(models.PurchaseOrderItem).filter(
        models.PurchaseOrderItem.purchase_order_id == order_id
    ).all()

def create_purchase_order_item(db: Session, item: schemas.PurchaseOrderItemCreate):
    db_item = models.PurchaseOrderItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_purchase_order_item(db: Session, item_id: int, item: schemas.PurchaseOrderItemUpdate):
    db_item = db.query(models.PurchaseOrderItem).filter(models.PurchaseOrderItem.id == item_id).first()
    if db_item:
        update_data = item.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        db.commit()
        db.refresh(db_item)
    return db_item

# ============================================================================
# ETAPA 6 - RELATÓRIOS E BI - CRUD OPERATIONS
# ============================================================================

# Saved Report CRUD
def get_saved_report(db: Session, report_id: int):
    return db.query(models.SavedReport).filter(models.SavedReport.id == report_id).first()

def get_saved_reports(db: Session, clinic_id: int, user_id: Optional[int] = None, 
                     report_type: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.SavedReport).filter(models.SavedReport.clinic_id == clinic_id)
    
    if user_id:
        query = query.filter(
            or_(
                models.SavedReport.user_id == user_id,
                models.SavedReport.is_public == True
            )
        )
    
    if report_type:
        query = query.filter(models.SavedReport.report_type == report_type)
    
    return query.order_by(models.SavedReport.created_at.desc()).offset(skip).limit(limit).all()

def create_saved_report(db: Session, report: schemas.SavedReportCreate, clinic_id: int, user_id: int):
    db_report = models.SavedReport(
        **report.dict(),
        clinic_id=clinic_id,
        user_id=user_id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def update_saved_report(db: Session, report_id: int, report: schemas.SavedReportUpdate):
    db_report = db.query(models.SavedReport).filter(models.SavedReport.id == report_id).first()
    if db_report:
        update_data = report.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_report, field, value)
        db_report.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_report)
    return db_report

def delete_saved_report(db: Session, report_id: int):
    db_report = db.query(models.SavedReport).filter(models.SavedReport.id == report_id).first()
    if db_report:
        db.delete(db_report)
        db.commit()
    return db_report

# Report Execution CRUD
def get_report_execution(db: Session, execution_id: int):
    return db.query(models.ReportExecution).filter(models.ReportExecution.id == execution_id).first()

def get_report_executions(db: Session, saved_report_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.ReportExecution).filter(
        models.ReportExecution.saved_report_id == saved_report_id
    ).order_by(models.ReportExecution.execution_date.desc()).offset(skip).limit(limit).all()

def create_report_execution(db: Session, execution: schemas.ReportExecutionCreate, user_id: int):
    db_execution = models.ReportExecution(
        **execution.dict(),
        executed_by=user_id,
        execution_date=datetime.utcnow(),
        status="pending"
    )
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    return db_execution

def update_report_execution(db: Session, execution_id: int, execution: schemas.ReportExecutionUpdate):
    db_execution = db.query(models.ReportExecution).filter(models.ReportExecution.id == execution_id).first()
    if db_execution:
        update_data = execution.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_execution, field, value)
        db.commit()
        db.refresh(db_execution)
    return db_execution

# Custom Dashboard CRUD
def get_custom_dashboard(db: Session, dashboard_id: int):
    return db.query(models.CustomDashboard).filter(models.CustomDashboard.id == dashboard_id).first()

def get_custom_dashboards(db: Session, clinic_id: int, user_id: Optional[int] = None, 
                         skip: int = 0, limit: int = 100):
    query = db.query(models.CustomDashboard).filter(models.CustomDashboard.clinic_id == clinic_id)
    
    if user_id:
        query = query.filter(
            or_(
                models.CustomDashboard.user_id == user_id,
                models.CustomDashboard.is_public == True
            )
        )
    
    return query.order_by(models.CustomDashboard.created_at.desc()).offset(skip).limit(limit).all()

def create_custom_dashboard(db: Session, dashboard: schemas.CustomDashboardCreate, clinic_id: int, user_id: int):
    db_dashboard = models.CustomDashboard(
        **dashboard.dict(),
        clinic_id=clinic_id,
        user_id=user_id
    )
    db.add(db_dashboard)
    db.commit()
    db.refresh(db_dashboard)
    return db_dashboard

def update_custom_dashboard(db: Session, dashboard_id: int, dashboard: schemas.CustomDashboardUpdate):
    db_dashboard = db.query(models.CustomDashboard).filter(models.CustomDashboard.id == dashboard_id).first()
    if db_dashboard:
        update_data = dashboard.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_dashboard, field, value)
        db_dashboard.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_dashboard)
    return db_dashboard

def delete_custom_dashboard(db: Session, dashboard_id: int):
    db_dashboard = db.query(models.CustomDashboard).filter(models.CustomDashboard.id == dashboard_id).first()
    if db_dashboard:
        db.delete(db_dashboard)
        db.commit()
    return db_dashboard

# Dashboard Widget CRUD
def get_dashboard_widget(db: Session, widget_id: int):
    return db.query(models.DashboardWidget).filter(models.DashboardWidget.id == widget_id).first()

def get_dashboard_widgets(db: Session, dashboard_id: int):
    return db.query(models.DashboardWidget).filter(
        models.DashboardWidget.dashboard_id == dashboard_id,
        models.DashboardWidget.is_active == True
    ).order_by(models.DashboardWidget.position_y, models.DashboardWidget.position_x).all()

def create_dashboard_widget(db: Session, widget: schemas.DashboardWidgetCreate):
    db_widget = models.DashboardWidget(**widget.dict())
    db.add(db_widget)
    db.commit()
    db.refresh(db_widget)
    return db_widget

def update_dashboard_widget(db: Session, widget_id: int, widget: schemas.DashboardWidgetUpdate):
    db_widget = db.query(models.DashboardWidget).filter(models.DashboardWidget.id == widget_id).first()
    if db_widget:
        update_data = widget.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_widget, field, value)
        db.commit()
        db.refresh(db_widget)
    return db_widget

def delete_dashboard_widget(db: Session, widget_id: int):
    db_widget = db.query(models.DashboardWidget).filter(models.DashboardWidget.id == widget_id).first()
    if db_widget:
        db.delete(db_widget)
        db.commit()
    return db_widget

# Performance Metric CRUD
def get_performance_metric(db: Session, metric_id: int):
    return db.query(models.PerformanceMetric).filter(models.PerformanceMetric.id == metric_id).first()

def get_performance_metrics(db: Session, clinic_id: int, metric_type: Optional[str] = None,
                           start_date: Optional[date] = None, end_date: Optional[date] = None,
                           skip: int = 0, limit: int = 100):
    query = db.query(models.PerformanceMetric).filter(models.PerformanceMetric.clinic_id == clinic_id)
    
    if metric_type:
        query = query.filter(models.PerformanceMetric.metric_type == metric_type)
    if start_date:
        query = query.filter(models.PerformanceMetric.metric_date >= start_date)
    if end_date:
        query = query.filter(models.PerformanceMetric.metric_date <= end_date)
    
    return query.order_by(models.PerformanceMetric.metric_date.desc()).offset(skip).limit(limit).all()

def create_performance_metric(db: Session, metric: schemas.PerformanceMetricCreate, clinic_id: int):
    db_metric = models.PerformanceMetric(
        **metric.dict(),
        clinic_id=clinic_id
    )
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

def update_performance_metric(db: Session, metric_id: int, metric: schemas.PerformanceMetricUpdate):
    db_metric = db.query(models.PerformanceMetric).filter(models.PerformanceMetric.id == metric_id).first()
    if db_metric:
        update_data = metric.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_metric, field, value)
        db.commit()
        db.refresh(db_metric)
    return db_metric

# BI Alert CRUD
def get_bi_alert(db: Session, alert_id: int):
    return db.query(models.BIAlert).filter(models.BIAlert.id == alert_id).first()

def get_bi_alerts(db: Session, clinic_id: int, alert_type: Optional[str] = None,
                 severity: Optional[str] = None, is_resolved: Optional[bool] = None,
                 skip: int = 0, limit: int = 100):
    query = db.query(models.BIAlert).filter(models.BIAlert.clinic_id == clinic_id)
    
    if alert_type:
        query = query.filter(models.BIAlert.alert_type == alert_type)
    if severity:
        query = query.filter(models.BIAlert.severity == severity)
    if is_resolved is not None:
        query = query.filter(models.BIAlert.is_resolved == is_resolved)
    
    return query.order_by(models.BIAlert.created_at.desc()).offset(skip).limit(limit).all()

def create_bi_alert(db: Session, alert: schemas.BIAlertCreate, clinic_id: int):
    db_alert = models.BIAlert(
        **alert.dict(),
        clinic_id=clinic_id
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def update_bi_alert(db: Session, alert_id: int, alert: schemas.BIAlertUpdate, user_id: Optional[int] = None):
    db_alert = db.query(models.BIAlert).filter(models.BIAlert.id == alert_id).first()
    if db_alert:
        update_data = alert.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_alert, field, value)
        
        # Se o alerta está sendo resolvido
        if alert.is_resolved and not db_alert.resolved_at:
            db_alert.resolved_at = datetime.utcnow()
            if user_id:
                db_alert.resolved_by = user_id
        
        db.commit()
        db.refresh(db_alert)
    return db_alert

# Alert Configuration CRUD
def get_alert_configuration(db: Session, config_id: int):
    return db.query(models.AlertConfiguration).filter(models.AlertConfiguration.id == config_id).first()

def get_alert_configurations(db: Session, clinic_id: int, user_id: Optional[int] = None,
                           metric_type: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.AlertConfiguration).filter(models.AlertConfiguration.clinic_id == clinic_id)
    
    if user_id:
        query = query.filter(models.AlertConfiguration.user_id == user_id)
    if metric_type:
        query = query.filter(models.AlertConfiguration.metric_type == metric_type)
    
    return query.order_by(models.AlertConfiguration.created_at.desc()).offset(skip).limit(limit).all()

def create_alert_configuration(db: Session, config: schemas.AlertConfigurationCreate, clinic_id: int, user_id: int):
    db_config = models.AlertConfiguration(
        **config.dict(),
        clinic_id=clinic_id,
        user_id=user_id
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def update_alert_configuration(db: Session, config_id: int, config: schemas.AlertConfigurationUpdate):
    db_config = db.query(models.AlertConfiguration).filter(models.AlertConfiguration.id == config_id).first()
    if db_config:
        update_data = config.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_config, field, value)
        db.commit()
        db.refresh(db_config)
    return db_config

def delete_alert_configuration(db: Session, config_id: int):
    db_config = db.query(models.AlertConfiguration).filter(models.AlertConfiguration.id == config_id).first()
    if db_config:
        db.delete(db_config)
        db.commit()
    return db_config

# ============================================================================
# ETAPA 5B - ESTOQUE AMPLIADO - CRUD OPERATIONS
# ============================================================================

# Stock Inventory CRUD
def get_stock_inventory(db: Session, inventory_id: int):
    return db.query(models.StockInventory).filter(models.StockInventory.id == inventory_id).first()

def get_stock_inventories(db: Session, clinic_id: int, status: Optional[str] = None,
                         skip: int = 0, limit: int = 100):
    query = db.query(models.StockInventory).filter(models.StockInventory.clinic_id == clinic_id)
    
    if status:
        query = query.filter(models.StockInventory.status == status)
    
    return query.order_by(models.StockInventory.created_at.desc()).offset(skip).limit(limit).all()

def create_stock_inventory(db: Session, inventory: schemas.StockInventoryCreate, 
                          clinic_id: int, user_id: int):
    db_inventory = models.StockInventory(
        **inventory.dict(),
        clinic_id=clinic_id,
        created_by=user_id
    )
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    return db_inventory

def update_stock_inventory(db: Session, inventory_id: int, inventory: schemas.StockInventoryUpdate):
    db_inventory = db.query(models.StockInventory).filter(models.StockInventory.id == inventory_id).first()
    if db_inventory:
        update_data = inventory.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_inventory, field, value)
        
        # Atualizar timestamps baseado no status
        if inventory.status == "em_andamento" and not db_inventory.started_at:
            db_inventory.started_at = datetime.utcnow()
        elif inventory.status == "concluido" and not db_inventory.completed_at:
            db_inventory.completed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_inventory)
    return db_inventory

# Inventory Count CRUD
def get_inventory_count(db: Session, count_id: int):
    return db.query(models.InventoryCount).filter(models.InventoryCount.id == count_id).first()

def get_inventory_counts(db: Session, clinic_id: int, inventory_id: Optional[int] = None,
                        product_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.InventoryCount).join(models.StockInventory).filter(
        models.StockInventory.clinic_id == clinic_id
    )
    
    if inventory_id:
        query = query.filter(models.InventoryCount.inventory_id == inventory_id)
    if product_id:
        query = query.filter(models.InventoryCount.product_id == product_id)
    
    return query.order_by(models.InventoryCount.created_at.desc()).offset(skip).limit(limit).all()

def create_inventory_count(db: Session, count: schemas.InventoryCountCreate, user_id: int):
    db_count = models.InventoryCount(
        **count.dict(),
        counted_by=user_id
    )
    
    # Calcular discrepância se quantidade contada foi fornecida
    if count.counted_quantity is not None:
        db_count.discrepancy = count.counted_quantity - count.expected_quantity
        
        # Calcular impacto de custo
        product = db.query(models.Product).filter(models.Product.id == count.product_id).first()
        if product and product.unit_cost:
            db_count.total_cost_impact = db_count.discrepancy * float(product.unit_cost)
    
    db.add(db_count)
    db.commit()
    db.refresh(db_count)
    return db_count

def update_inventory_count(db: Session, count_id: int, count: schemas.InventoryCountUpdate):
    db_count = db.query(models.InventoryCount).filter(models.InventoryCount.id == count_id).first()
    if db_count:
        update_data = count.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_count, field, value)
        
        # Recalcular discrepância se necessário
        if count.counted_quantity is not None:
            db_count.discrepancy = count.counted_quantity - db_count.expected_quantity
            
            # Recalcular impacto de custo
            product = db.query(models.Product).filter(models.Product.id == db_count.product_id).first()
            if product and product.unit_cost:
                db_count.total_cost_impact = db_count.discrepancy * float(product.unit_cost)
        
        db.commit()
        db.refresh(db_count)
    return db_count

# Stock Alert CRUD
def get_stock_alert(db: Session, alert_id: int):
    return db.query(models.StockAlert).filter(models.StockAlert.id == alert_id).first()

def get_stock_alerts(db: Session, clinic_id: int, alert_type: Optional[str] = None,
                    severity: Optional[str] = None, is_active: Optional[bool] = None,
                    skip: int = 0, limit: int = 100):
    query = db.query(models.StockAlert).filter(models.StockAlert.clinic_id == clinic_id)
    
    if alert_type:
        query = query.filter(models.StockAlert.alert_type == alert_type)
    if severity:
        query = query.filter(models.StockAlert.severity == severity)
    if is_active is not None:
        query = query.filter(models.StockAlert.is_active == is_active)
    
    return query.order_by(models.StockAlert.created_at.desc()).offset(skip).limit(limit).all()

def create_stock_alert(db: Session, alert: schemas.StockAlertCreate, clinic_id: int):
    db_alert = models.StockAlert(
        **alert.dict(),
        clinic_id=clinic_id
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def update_stock_alert(db: Session, alert_id: int, alert: schemas.StockAlertUpdate, user_id: int):
    db_alert = db.query(models.StockAlert).filter(models.StockAlert.id == alert_id).first()
    if db_alert:
        update_data = alert.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_alert, field, value)
        
        # Se o alerta foi resolvido, marcar data e usuário
        if alert.is_active == False and db_alert.is_active == True:
            db_alert.resolved_at = datetime.utcnow()
            db_alert.resolved_by = user_id
        
        db.commit()
        db.refresh(db_alert)
    return db_alert

# Stock Transfer CRUD
def get_stock_transfer(db: Session, transfer_id: int):
    return db.query(models.StockTransfer).filter(models.StockTransfer.id == transfer_id).first()

def get_stock_transfers(db: Session, clinic_id: int, status: Optional[str] = None,
                       from_location: Optional[str] = None, to_location: Optional[str] = None,
                       skip: int = 0, limit: int = 100):
    query = db.query(models.StockTransfer).filter(models.StockTransfer.clinic_id == clinic_id)
    
    if status:
        query = query.filter(models.StockTransfer.status == status)
    if from_location:
        query = query.filter(models.StockTransfer.from_location == from_location)
    if to_location:
        query = query.filter(models.StockTransfer.to_location == to_location)
    
    return query.order_by(models.StockTransfer.created_at.desc()).offset(skip).limit(limit).all()

def create_stock_transfer(db: Session, transfer: schemas.StockTransferCreate, 
                         clinic_id: int, user_id: int):
    db_transfer = models.StockTransfer(
        **transfer.dict(),
        clinic_id=clinic_id,
        created_by=user_id
    )
    db.add(db_transfer)
    db.commit()
    db.refresh(db_transfer)
    return db_transfer

def update_stock_transfer(db: Session, transfer_id: int, transfer: schemas.StockTransferUpdate, user_id: int):
    db_transfer = db.query(models.StockTransfer).filter(models.StockTransfer.id == transfer_id).first()
    if db_transfer:
        update_data = transfer.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_transfer, field, value)
        
        # Atualizar timestamps baseado no status
        if transfer.status == "em_transito" and not db_transfer.shipped_at:
            db_transfer.shipped_at = datetime.utcnow()
            db_transfer.shipped_by = user_id
        elif transfer.status == "recebido" and not db_transfer.received_at:
            db_transfer.received_at = datetime.utcnow()
            db_transfer.received_by = user_id
        
        db.commit()
        db.refresh(db_transfer)
    return db_transfer

# Stock Transfer Item CRUD
def get_stock_transfer_item(db: Session, item_id: int):
    return db.query(models.StockTransferItem).filter(models.StockTransferItem.id == item_id).first()

def get_stock_transfer_items(db: Session, transfer_id: Optional[int] = None,
                            product_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.StockTransferItem)
    
    if transfer_id:
        query = query.filter(models.StockTransferItem.transfer_id == transfer_id)
    if product_id:
        query = query.filter(models.StockTransferItem.product_id == product_id)
    
    return query.offset(skip).limit(limit).all()

def create_stock_transfer_item(db: Session, item: schemas.StockTransferItemCreate):
    db_item = models.StockTransferItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_stock_transfer_item(db: Session, item_id: int, item: schemas.StockTransferItemUpdate):
    db_item = db.query(models.StockTransferItem).filter(models.StockTransferItem.id == item_id).first()
    if db_item:
        update_data = item.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        db.commit()
        db.refresh(db_item)
    return db_item

# Stock Adjustment CRUD
def get_stock_adjustment(db: Session, adjustment_id: int):
    return db.query(models.StockAdjustment).filter(models.StockAdjustment.id == adjustment_id).first()

def get_stock_adjustments(db: Session, clinic_id: int, product_id: Optional[int] = None,
                         adjustment_type: Optional[str] = None, reason: Optional[str] = None,
                         skip: int = 0, limit: int = 100):
    query = db.query(models.StockAdjustment).filter(models.StockAdjustment.clinic_id == clinic_id)
    
    if product_id:
        query = query.filter(models.StockAdjustment.product_id == product_id)
    if adjustment_type:
        query = query.filter(models.StockAdjustment.adjustment_type == adjustment_type)
    if reason:
        query = query.filter(models.StockAdjustment.reason.ilike(f"%{reason}%"))
    
    return query.order_by(models.StockAdjustment.created_at.desc()).offset(skip).limit(limit).all()

def create_stock_adjustment(db: Session, adjustment: schemas.StockAdjustmentCreate, 
                           clinic_id: int, user_id: int):
    db_adjustment = models.StockAdjustment(
        **adjustment.dict(),
        clinic_id=clinic_id,
        created_by=user_id
    )
    
    # Atualizar estoque do produto
    product = db.query(models.Product).filter(models.Product.id == adjustment.product_id).first()
    if product:
        if adjustment.adjustment_type == "positivo":
            product.current_stock += adjustment.quantity
        elif adjustment.adjustment_type == "negativo":
            product.current_stock -= adjustment.quantity
        
        # Calcular valor do ajuste
        if product.unit_cost:
            db_adjustment.total_value = adjustment.quantity * float(product.unit_cost)
    
    db.add(db_adjustment)
    
    # Criar movimento de estoque correspondente
    movement_type = "ajuste_positivo" if adjustment.adjustment_type == "positivo" else "ajuste_negativo"
    stock_movement = models.ProductStockMovement(
        product_id=adjustment.product_id,
        movement_type=movement_type,
        quantity=adjustment.quantity,
        unit_cost=product.unit_cost if product else None,
        total_cost=db_adjustment.total_value,
        reference_type="ajuste",
        reference_id=None,  # Será atualizado após commit
        notes=f"Ajuste de estoque: {adjustment.reason}",
        clinic_id=clinic_id,
        user_id=user_id
    )
    db.add(stock_movement)
    
    db.commit()
    
    # Atualizar referência do movimento
    stock_movement.reference_id = db_adjustment.id
    db.commit()
    
    db.refresh(db_adjustment)
    return db_adjustment

def update_stock_adjustment(db: Session, adjustment_id: int, adjustment: schemas.StockAdjustmentUpdate):
    db_adjustment = db.query(models.StockAdjustment).filter(models.StockAdjustment.id == adjustment_id).first()
    if db_adjustment:
        update_data = adjustment.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_adjustment, field, value)
        db.commit()
        db.refresh(db_adjustment)
    return db_adjustment

# ============================================================================
# LGPD SPECIFIC CRUD FUNCTIONS
# ============================================================================

def get_patient_by_user_id(db: Session, user_id: int):
    """Buscar paciente pelo ID do usuário"""
    return db.query(models.Patient).filter(models.Patient.user_id == user_id).first()

def get_appointments_by_patient(db: Session, patient_id: int, skip: int = 0, limit: int = 100):
    """Buscar agendamentos de um paciente específico"""
    return db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id
    ).order_by(models.Appointment.date.desc()).offset(skip).limit(limit).all()

def get_audit_logs_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Buscar logs de auditoria de um usuário específico"""
    return db.query(models.AuditLog).filter(
        models.AuditLog.user_id == user_id
    ).order_by(models.AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

def anonymize_audit_logs(db: Session, user_id: int):
    """Anonimizar logs de auditoria de um usuário (LGPD)"""
    audit_logs = db.query(models.AuditLog).filter(models.AuditLog.user_id == user_id).all()
    for log in audit_logs:
        log.user_id = None
        log.details = "[DADOS REMOVIDOS - LGPD]"
        log.ip_address = "[ANONIMIZADO]"
    db.commit()
    return len(audit_logs)

def get_user_data_summary(db: Session, user_id: int):
    """Obter resumo dos dados de um usuário para relatórios LGPD"""
    user = get_user(db, user_id)
    if not user:
        return None
    
    summary = {
        "user_id": user_id,
        "user_role": user.role,
        "has_lgpd_consent": user.lgpd_consent,
        "consent_date": user.lgpd_consent_date,
        "data_sharing_consent": user.data_sharing_consent,
        "marketing_consent": user.marketing_consent,
        "audit_logs_count": 0,
        "medical_records_count": 0,
        "appointments_count": 0
    }
    
    # Contar logs de auditoria
    audit_count = db.query(models.AuditLog).filter(models.AuditLog.user_id == user_id).count()
    summary["audit_logs_count"] = audit_count
    
    # Se for paciente, contar dados médicos
    if user.role == "patient":
        patient = get_patient_by_user_id(db, user_id)
        if patient:
            medical_records_count = db.query(models.MedicalRecord).filter(
                models.MedicalRecord.patient_id == patient.id
            ).count()
            appointments_count = db.query(models.Appointment).filter(
                models.Appointment.patient_id == patient.id
            ).count()
            
            summary["medical_records_count"] = medical_records_count
            summary["appointments_count"] = appointments_count
    
    return summary

def delete_patient_medical_data(db: Session, patient_id: int):
    """Deletar todos os dados médicos de um paciente (LGPD)"""
    deleted_count = {
        "medical_records": 0,
        "appointments": 0,
        "prescriptions": 0,
        "medical_documents": 0
    }
    
    # Deletar prontuários médicos
    medical_records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).all()
    for record in medical_records:
        db.delete(record)
    deleted_count["medical_records"] = len(medical_records)
    
    # Deletar agendamentos
    appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id
    ).all()
    for appointment in appointments:
        db.delete(appointment)
    deleted_count["appointments"] = len(appointments)
    
    # Deletar prescrições
    prescriptions = db.query(models.Prescription).filter(
        models.Prescription.patient_id == patient_id
    ).all()
    for prescription in prescriptions:
        db.delete(prescription)
    deleted_count["prescriptions"] = len(prescriptions)
    
    # Deletar documentos médicos
    medical_documents = db.query(models.MedicalDocument).filter(
        models.MedicalDocument.patient_id == patient_id
    ).all()
    for document in medical_documents:
        db.delete(document)
    deleted_count["medical_documents"] = len(medical_documents)
    
    db.commit()
    return deleted_count

def update_user_lgpd_consent(db: Session, user_id: int, consent_data: dict):
    """Atualizar consentimentos LGPD de um usuário"""
    user = get_user(db, user_id)
    if not user:
        return None
    
    from datetime import datetime
    
    # Atualizar campos de consentimento
    if "lgpd_consent" in consent_data:
        user.lgpd_consent = consent_data["lgpd_consent"]
        user.lgpd_consent_date = datetime.now()
    
    if "data_sharing_consent" in consent_data:
        user.data_sharing_consent = consent_data["data_sharing_consent"]
    
    if "marketing_consent" in consent_data:
        user.marketing_consent = consent_data["marketing_consent"]
    
    db.commit()
    db.refresh(user)
    return user

def get_users_without_lgpd_consent(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    """Buscar usuários que não deram consentimento LGPD"""
    return db.query(models.User).filter(
        models.User.clinic_id == clinic_id,
        or_(
            models.User.lgpd_consent == False,
            models.User.lgpd_consent.is_(None)
        )
    ).offset(skip).limit(limit).all()

def get_lgpd_compliance_stats(db: Session, clinic_id: int):
    """Obter estatísticas de compliance LGPD para uma clínica"""
    total_users = db.query(models.User).filter(models.User.clinic_id == clinic_id).count()
    
    users_with_consent = db.query(models.User).filter(
        models.User.clinic_id == clinic_id,
        models.User.lgpd_consent == True
    ).count()
    
    users_with_data_sharing = db.query(models.User).filter(
        models.User.clinic_id == clinic_id,
        models.User.data_sharing_consent == True
    ).count()
    
    users_with_marketing = db.query(models.User).filter(
        models.User.clinic_id == clinic_id,
        models.User.marketing_consent == True
    ).count()
    
    return {
        "total_users": total_users,
        "users_with_lgpd_consent": users_with_consent,
        "users_without_lgpd_consent": total_users - users_with_consent,
        "data_sharing_consent_count": users_with_data_sharing,
        "marketing_consent_count": users_with_marketing,
        "compliance_rate": round((users_with_consent / total_users * 100), 2) if total_users > 0 else 0
    }

# ============================================================================
# DEPARTMENT CRUD FUNCTIONS
# ============================================================================

def get_department(db: Session, department_id: int):
    """Buscar departamento por ID"""
    return db.query(models.Department).filter(models.Department.id == department_id).first()

def get_departments(db: Session, clinic_id: int, is_active: Optional[bool] = None, skip: int = 0, limit: int = 100):
    """Listar departamentos de uma clínica"""
    query = db.query(models.Department).filter(models.Department.clinic_id == clinic_id)
    
    if is_active is not None:
        query = query.filter(models.Department.is_active == is_active)
    
    return query.order_by(models.Department.name).offset(skip).limit(limit).all()

def get_department_by_code(db: Session, clinic_id: int, code: str):
    """Buscar departamento por código"""
    return db.query(models.Department).filter(
        models.Department.clinic_id == clinic_id,
        models.Department.code == code
    ).first()

def create_department(db: Session, department: schemas.DepartmentCreate, clinic_id: int):
    """Criar novo departamento"""
    db_department = models.Department(
        **department.dict(),
        clinic_id=clinic_id
    )
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

def update_department(db: Session, department_id: int, department: schemas.DepartmentUpdate):
    """Atualizar departamento"""
    db_department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if db_department:
        update_data = department.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_department, field, value)
        db.commit()
        db.refresh(db_department)
    return db_department

def delete_department(db: Session, department_id: int):
    """Deletar departamento (soft delete)"""
    db_department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if db_department:
        db_department.is_active = False
        db.commit()
        db.refresh(db_department)
    return db_department

def get_department_statistics(db: Session, department_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None):
    """Obter estatísticas de um departamento"""
    department = get_department(db, department_id)
    if not department:
        return None
    
    # Filtros de data
    date_filter = []
    if start_date:
        date_filter.append(models.ProductStockMovement.movement_date >= start_date)
    if end_date:
        date_filter.append(models.ProductStockMovement.movement_date <= end_date)
    
    # Movimentações do departamento
    movements_query = db.query(models.ProductStockMovement).filter(
        models.ProductStockMovement.department == department.code
    )
    
    if date_filter:
        movements_query = movements_query.filter(and_(*date_filter))
    
    movements = movements_query.all()
    
    # Calcular estatísticas
    total_movements = len(movements)
    total_entries = len([m for m in movements if m.movement_type in ['entrada', 'ajuste_positivo']])
    total_exits = len([m for m in movements if m.movement_type in ['saida', 'ajuste_negativo']])
    total_cost = sum([m.total_cost for m in movements if m.total_cost])
    
    # Requisições do departamento
    requisitions_count = db.query(models.StockRequisition).filter(
        models.StockRequisition.department == department.code
    ).count()
    
    # Transferências de/para o departamento
    transfers_from = db.query(models.StockTransfer).filter(
        models.StockTransfer.from_department == department.code
    ).count()
    
    transfers_to = db.query(models.StockTransfer).filter(
        models.StockTransfer.to_department == department.code
    ).count()
    
    return {
        "department_id": department_id,
        "department_name": department.name,
        "department_code": department.code,
        "total_movements": total_movements,
        "total_entries": total_entries,
        "total_exits": total_exits,
        "total_cost": float(total_cost) if total_cost else 0,
        "requisitions_count": requisitions_count,
        "transfers_from": transfers_from,
        "transfers_to": transfers_to,
        "budget_limit": float(department.budget_limit) if department.budget_limit else None,
        "budget_usage_percentage": round((float(total_cost) / float(department.budget_limit) * 100), 2) if department.budget_limit and total_cost else 0
    }

# ============================================================================
# ETAPA 5B - ESTOQUE AMPLIADO - CRUD FUNCTIONS
# ============================================================================

# Supplier Product Price CRUD
def get_supplier_product_price(db: Session, price_id: int):
    return db.query(models.SupplierProductPrice).filter(models.SupplierProductPrice.id == price_id).first()

def get_supplier_product_prices(db: Session, product_id: Optional[int] = None, supplier_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.SupplierProductPrice)
    
    if product_id:
        query = query.filter(models.SupplierProductPrice.product_id == product_id)
    if supplier_id:
        query = query.filter(models.SupplierProductPrice.supplier_id == supplier_id)
    
    return query.order_by(models.SupplierProductPrice.price).offset(skip).limit(limit).all()

def create_supplier_product_price(db: Session, price: schemas.SupplierProductPriceCreate):
    db_price = models.SupplierProductPrice(**price.dict())
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return db_price

def update_supplier_product_price(db: Session, price_id: int, price: schemas.SupplierProductPriceUpdate):
    db_price = db.query(models.SupplierProductPrice).filter(models.SupplierProductPrice.id == price_id).first()
    if db_price:
        update_data = price.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_price, field, value)
        db.commit()
        db.refresh(db_price)
    return db_price

# Department Stock Level CRUD
def get_department_stock_level(db: Session, level_id: int):
    return db.query(models.DepartmentStockLevel).filter(models.DepartmentStockLevel.id == level_id).first()

def get_department_stock_levels(db: Session, department_id: Optional[int] = None, product_id: Optional[int] = None, low_stock: Optional[bool] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.DepartmentStockLevel)
    
    if department_id:
        query = query.filter(models.DepartmentStockLevel.department_id == department_id)
    if product_id:
        query = query.filter(models.DepartmentStockLevel.product_id == product_id)
    if low_stock is not None:
        if low_stock:
            query = query.filter(models.DepartmentStockLevel.current_stock <= models.DepartmentStockLevel.minimum_stock)
        else:
            query = query.filter(models.DepartmentStockLevel.current_stock > models.DepartmentStockLevel.minimum_stock)
    
    return query.offset(skip).limit(limit).all()

def create_department_stock_level(db: Session, stock: schemas.DepartmentStockLevelCreate):
    db_stock = models.DepartmentStockLevel(**stock.dict())
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock

def update_department_stock_level(db: Session, level_id: int, stock: schemas.DepartmentStockLevelUpdate):
    db_stock = db.query(models.DepartmentStockLevel).filter(models.DepartmentStockLevel.id == level_id).first()
    if db_stock:
        update_data = stock.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_stock, field, value)
        db.commit()
        db.refresh(db_stock)
    return db_stock

# Category Alert CRUD
def get_category_alert(db: Session, alert_id: int):
    return db.query(models.CategoryAlert).filter(models.CategoryAlert.id == alert_id).first()

def get_category_alerts(db: Session, clinic_id: int, category_id: Optional[int] = None, is_active: Optional[bool] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.CategoryAlert).filter(models.CategoryAlert.clinic_id == clinic_id)
    
    if category_id:
        query = query.filter(models.CategoryAlert.category_id == category_id)
    if is_active is not None:
        query = query.filter(models.CategoryAlert.is_active == is_active)
    
    return query.order_by(models.CategoryAlert.created_at.desc()).offset(skip).limit(limit).all()

def create_category_alert(db: Session, alert: schemas.CategoryAlertCreate, clinic_id: int):
    db_alert = models.CategoryAlert(**alert.dict(), clinic_id=clinic_id)
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def update_category_alert(db: Session, alert_id: int, alert: schemas.CategoryAlertUpdate):
    db_alert = db.query(models.CategoryAlert).filter(models.CategoryAlert.id == alert_id).first()
    if db_alert:
        update_data = alert.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_alert, field, value)
        db.commit()
        db.refresh(db_alert)
    return db_alert

# Automatic Reorder CRUD
def get_automatic_reorder(db: Session, reorder_id: int):
    return db.query(models.AutomaticReorder).filter(models.AutomaticReorder.id == reorder_id).first()

def get_automatic_reorders(db: Session, clinic_id: int, product_id: Optional[int] = None, is_enabled: Optional[bool] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.AutomaticReorder).filter(models.AutomaticReorder.clinic_id == clinic_id)
    
    if product_id:
        query = query.filter(models.AutomaticReorder.product_id == product_id)
    if is_enabled is not None:
        query = query.filter(models.AutomaticReorder.is_enabled == is_enabled)
    
    return query.offset(skip).limit(limit).all()

def create_automatic_reorder(db: Session, reorder: schemas.AutomaticReorderCreate, clinic_id: int):
    db_reorder = models.AutomaticReorder(**reorder.dict(), clinic_id=clinic_id)
    db.add(db_reorder)
    db.commit()
    db.refresh(db_reorder)
    return db_reorder

def update_automatic_reorder(db: Session, reorder_id: int, reorder: schemas.AutomaticReorderUpdate):
    db_reorder = db.query(models.AutomaticReorder).filter(models.AutomaticReorder.id == reorder_id).first()
    if db_reorder:
        update_data = reorder.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_reorder, field, value)
        db.commit()
        db.refresh(db_reorder)
    return db_reorder

def process_automatic_reorders(db: Session, clinic_id: int):
    """Processar reposições automáticas"""
    # Buscar produtos com estoque baixo e reposição automática habilitada
    reorders = db.query(models.AutomaticReorder).filter(
        models.AutomaticReorder.clinic_id == clinic_id,
        models.AutomaticReorder.is_enabled == True
    ).all()
    
    processed_orders = []
    
    for reorder in reorders:
        product = db.query(models.Product).filter(models.Product.id == reorder.product_id).first()
        if product and product.current_stock <= reorder.trigger_level:
            # Criar pedido de compra automático
            purchase_order = models.PurchaseOrder(
                clinic_id=clinic_id,
                supplier_id=reorder.supplier_id,
                order_date=datetime.now().date(),
                status="pendente",
                notes=f"Pedido automático - Produto: {product.name}",
                created_by=None  # Sistema automático
            )
            db.add(purchase_order)
            db.flush()  # Para obter o ID
            
            # Adicionar item ao pedido
            order_item = models.PurchaseOrderItem(
                purchase_order_id=purchase_order.id,
                product_id=product.id,
                quantity=reorder.reorder_quantity,
                unit_price=product.last_purchase_price or 0,
                total_price=(reorder.reorder_quantity * (product.last_purchase_price or 0))
            )
            db.add(order_item)
            
            # Atualizar última execução
            reorder.last_executed = datetime.now()
            
            processed_orders.append({
                "product_name": product.name,
                "quantity": reorder.reorder_quantity,
                "supplier_id": reorder.supplier_id,
                "order_id": purchase_order.id
            })
    
    db.commit()
    return processed_orders

# ============================================================================
# ETAPA 7 - SEGURANÇA E LGPD - CRUD FUNCTIONS
# ============================================================================

# Two Factor Auth CRUD
def get_user_2fa(db: Session, user_id: int):
    return db.query(models.TwoFactorAuth).filter(models.TwoFactorAuth.user_id == user_id).first()

def create_user_2fa(db: Session, user_id: int, secret_key: str):
    db_2fa = models.TwoFactorAuth(
        user_id=user_id,
        secret_key=secret_key,
        is_enabled=False,
        is_configured=True
    )
    db.add(db_2fa)
    db.commit()
    db.refresh(db_2fa)
    return db_2fa

def update_user_2fa(db: Session, user_id: int, secret_key: str):
    db_2fa = db.query(models.TwoFactorAuth).filter(models.TwoFactorAuth.user_id == user_id).first()
    if db_2fa:
        db_2fa.secret_key = secret_key
        db_2fa.is_configured = True
        db.commit()
        db.refresh(db_2fa)
    return db_2fa

def enable_user_2fa(db: Session, user_id: int):
    db_2fa = db.query(models.TwoFactorAuth).filter(models.TwoFactorAuth.user_id == user_id).first()
    if db_2fa:
        db_2fa.is_enabled = True
        db_2fa.last_used_at = datetime.now()
        db.commit()
        db.refresh(db_2fa)
    return db_2fa

def disable_user_2fa(db: Session, user_id: int):
    db_2fa = db.query(models.TwoFactorAuth).filter(models.TwoFactorAuth.user_id == user_id).first()
    if db_2fa:
        db_2fa.is_enabled = False
        db.commit()
        db.refresh(db_2fa)
    return db_2fa

# User Session CRUD
def get_user_session(db: Session, session_id: int):
    return db.query(models.UserSession).filter(models.UserSession.id == session_id).first()

def get_user_sessions(db: Session, user_id: int, active_only: bool = True):
    query = db.query(models.UserSession).filter(models.UserSession.user_id == user_id)
    
    if active_only:
        query = query.filter(models.UserSession.is_active == True)
    
    return query.order_by(models.UserSession.created_at.desc()).all()

def create_user_session(db: Session, session: schemas.UserSessionCreate):
    db_session = models.UserSession(**session.dict())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def revoke_user_session(db: Session, session_id: int):
    db_session = db.query(models.UserSession).filter(models.UserSession.id == session_id).first()
    if db_session:
        db_session.is_active = False
        db_session.ended_at = datetime.now()
        db.commit()
        db.refresh(db_session)
    return db_session

def revoke_all_user_sessions(db: Session, user_id: int):
    sessions = db.query(models.UserSession).filter(
        models.UserSession.user_id == user_id,
        models.UserSession.is_active == True
    ).all()
    
    for session in sessions:
        session.is_active = False
        session.ended_at = datetime.now()
    
    db.commit()
    return len(sessions)

# Security Event CRUD
def get_security_event(db: Session, event_id: int):
    return db.query(models.SecurityEvent).filter(models.SecurityEvent.id == event_id).first()

def get_security_events(db: Session, clinic_id: int, event_type: Optional[str] = None, severity: Optional[str] = None, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.SecurityEvent).filter(models.SecurityEvent.clinic_id == clinic_id)
    
    if event_type:
        query = query.filter(models.SecurityEvent.event_type == event_type)
    if severity:
        query = query.filter(models.SecurityEvent.severity == severity)
    if start_date:
        query = query.filter(models.SecurityEvent.timestamp >= start_date)
    if end_date:
        query = query.filter(models.SecurityEvent.timestamp <= end_date)
    
    return query.order_by(models.SecurityEvent.timestamp.desc()).offset(skip).limit(limit).all()

def create_security_event(db: Session, event: schemas.SecurityEventCreate, clinic_id: int):
    db_event = models.SecurityEvent(**event.dict(), clinic_id=clinic_id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

# Access Control CRUD
def get_access_control(db: Session, access_id: int):
    return db.query(models.AccessControl).filter(models.AccessControl.id == access_id).first()

def get_access_controls(db: Session, clinic_id: int, user_id: Optional[int] = None, resource_type: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.AccessControl).filter(models.AccessControl.clinic_id == clinic_id)
    
    if user_id:
        query = query.filter(models.AccessControl.user_id == user_id)
    if resource_type:
        query = query.filter(models.AccessControl.resource_type == resource_type)
    
    return query.offset(skip).limit(limit).all()

def create_access_control(db: Session, access: schemas.AccessControlCreate, clinic_id: int):
    db_access = models.AccessControl(**access.dict(), clinic_id=clinic_id)
    db.add(db_access)
    db.commit()
    db.refresh(db_access)
    return db_access

def update_access_control(db: Session, access_id: int, access: schemas.AccessControlUpdate):
    db_access = db.query(models.AccessControl).filter(models.AccessControl.id == access_id).first()
    if db_access:
        update_data = access.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_access, field, value)
        db.commit()
        db.refresh(db_access)
    return db_access

# API Key CRUD
def get_api_key(db: Session, key_id: int):
    return db.query(models.ApiKey).filter(models.ApiKey.id == key_id).first()

def get_user_api_keys(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.ApiKey).filter(
        models.ApiKey.user_id == user_id,
        models.ApiKey.is_active == True
    ).order_by(models.ApiKey.created_at.desc()).offset(skip).limit(limit).all()

def create_api_key(db: Session, api_key: schemas.ApiKeyCreate, clinic_id: int):
    import secrets
    import hashlib
    
    # Gerar chave única
    key_value = secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(key_value.encode()).hexdigest()
    
    db_key = models.ApiKey(
        **api_key.dict(),
        clinic_id=clinic_id,
        key_hash=key_hash
    )
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    
    # Retornar a chave apenas uma vez
    db_key.key_value = key_value
    return db_key

def revoke_api_key(db: Session, key_id: int):
    db_key = db.query(models.ApiKey).filter(models.ApiKey.id == key_id).first()
    if db_key:
        db_key.is_active = False
        db_key.revoked_at = datetime.now()
        db.commit()
        db.refresh(db_key)
    return db_key

# ============================================================================
# ETAPA 8 - EXTRAS TÉCNICOS - CRUD FUNCTIONS
# ============================================================================

# External Integration CRUD
def get_external_integration(db: Session, integration_id: int):
    return db.query(models.ExternalIntegration).filter(models.ExternalIntegration.id == integration_id).first()

def get_external_integrations(db: Session, clinic_id: int, integration_type: Optional[str] = None, is_active: Optional[bool] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.ExternalIntegration).filter(models.ExternalIntegration.clinic_id == clinic_id)
    
    if integration_type:
        query = query.filter(models.ExternalIntegration.integration_type == integration_type)
    if is_active is not None:
        query = query.filter(models.ExternalIntegration.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()

def create_external_integration(db: Session, integration: schemas.ExternalIntegrationCreate, clinic_id: int):
    db_integration = models.ExternalIntegration(**integration.dict(), clinic_id=clinic_id)
    db.add(db_integration)
    db.commit()
    db.refresh(db_integration)
    return db_integration

def update_external_integration(db: Session, integration_id: int, integration: schemas.ExternalIntegrationUpdate):
    db_integration = db.query(models.ExternalIntegration).filter(models.ExternalIntegration.id == integration_id).first()
    if db_integration:
        update_data = integration.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_integration, field, value)
        db.commit()
        db.refresh(db_integration)
    return db_integration

def start_integration_sync(db: Session, integration_id: int, sync_type: str):
    sync_log = models.IntegrationSyncLog(
        integration_id=integration_id,
        sync_type=sync_type,
        status="iniciado",
        started_at=datetime.now()
    )
    db.add(sync_log)
    db.commit()
    db.refresh(sync_log)
    return sync_log

# Tenant Configuration CRUD
def get_tenant_configuration(db: Session, clinic_id: int):
    return db.query(models.TenantConfiguration).filter(models.TenantConfiguration.clinic_id == clinic_id).first()

def create_default_tenant_configuration(db: Session, clinic_id: int):
    default_config = {
        "theme": "default",
        "language": "pt-BR",
        "timezone": "America/Sao_Paulo",
        "date_format": "DD/MM/YYYY",
        "currency": "BRL",
        "max_users": 50,
        "storage_limit_gb": 10,
        "backup_enabled": True,
        "audit_retention_days": 365
    }
    
    db_config = models.TenantConfiguration(
        clinic_id=clinic_id,
        configuration=default_config
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def update_tenant_configuration(db: Session, clinic_id: int, config: schemas.TenantConfigurationUpdate):
    db_config = db.query(models.TenantConfiguration).filter(models.TenantConfiguration.clinic_id == clinic_id).first()
    if db_config:
        update_data = config.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_config, field, value)
        db.commit()
        db.refresh(db_config)
    return db_config

# System Notification CRUD
def get_system_notification(db: Session, notification_id: int):
    return db.query(models.SystemNotification).filter(models.SystemNotification.id == notification_id).first()

def get_system_notifications(db: Session, clinic_id: int, user_id: int, is_read: Optional[bool] = None, priority: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.SystemNotification).filter(
        models.SystemNotification.clinic_id == clinic_id,
        models.SystemNotification.user_id == user_id
    )
    
    if is_read is not None:
        query = query.filter(models.SystemNotification.is_read == is_read)
    if priority:
        query = query.filter(models.SystemNotification.priority == priority)
    
    return query.order_by(models.SystemNotification.created_at.desc()).offset(skip).limit(limit).all()

def create_system_notification(db: Session, notification: schemas.SystemNotificationCreate, clinic_id: int):
    db_notification = models.SystemNotification(**notification.dict(), clinic_id=clinic_id)
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def mark_notification_as_read(db: Session, notification_id: int):
    db_notification = db.query(models.SystemNotification).filter(models.SystemNotification.id == notification_id).first()
    if db_notification:
        db_notification.is_read = True
        db_notification.read_at = datetime.now()
        db.commit()
        db.refresh(db_notification)
    return db_notification

# Feature Flag CRUD
def get_feature_flag(db: Session, flag_id: int):
    return db.query(models.FeatureFlag).filter(models.FeatureFlag.id == flag_id).first()

def get_active_feature_flags(db: Session, clinic_id: int, user_id: int):
    return db.query(models.FeatureFlag).filter(
        models.FeatureFlag.clinic_id == clinic_id,
        models.FeatureFlag.is_enabled == True,
        or_(
            models.FeatureFlag.target_users.is_(None),
            models.FeatureFlag.target_users.contains([user_id])
        )
    ).all()

def is_feature_enabled(db: Session, flag_name: str, clinic_id: int, user_id: int):
    flag = db.query(models.FeatureFlag).filter(
        models.FeatureFlag.name == flag_name,
        models.FeatureFlag.clinic_id == clinic_id,
        models.FeatureFlag.is_enabled == True
    ).first()
    
    if not flag:
        return False
    
    # Verificar se o usuário está no target
    if flag.target_users and user_id not in flag.target_users:
        return False
    
    return True

def create_feature_flag(db: Session, flag: schemas.FeatureFlagCreate, clinic_id: int):
    db_flag = models.FeatureFlag(**flag.dict(), clinic_id=clinic_id)
    db.add(db_flag)
    db.commit()
    db.refresh(db_flag)
    return db_flag

# System Metrics CRUD
def get_system_metrics(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None, skip: int = 0, limit: int = 30):
    query = db.query(models.SystemMetrics)
    
    if start_date:
        query = query.filter(models.SystemMetrics.date >= start_date)
    if end_date:
        query = query.filter(models.SystemMetrics.date <= end_date)
    
    return query.order_by(models.SystemMetrics.date.desc()).offset(skip).limit(limit).all()

def get_latest_system_metrics(db: Session):
    return db.query(models.SystemMetrics).order_by(models.SystemMetrics.date.desc()).first()

def create_system_metrics(db: Session, metrics: schemas.SystemMetricsCreate):
    db_metrics = models.SystemMetrics(**metrics.dict())
    db.add(db_metrics)
    db.commit()
    db.refresh(db_metrics)
    return db_metrics

def get_metrics_trends(db: Session, days: int = 30):
    from datetime import timedelta
    start_date = datetime.now().date() - timedelta(days=days)
    
    metrics = db.query(models.SystemMetrics).filter(
        models.SystemMetrics.date >= start_date
    ).order_by(models.SystemMetrics.date).all()
    
    if not metrics:
        return {}
    
    # Calcular tendências
    first_metric = metrics[0]
    last_metric = metrics[-1]
    
    trends = {
        "active_users_trend": ((last_metric.active_users - first_metric.active_users) / first_metric.active_users * 100) if first_metric.active_users > 0 else 0,
        "total_appointments_trend": ((last_metric.total_appointments - first_metric.total_appointments) / first_metric.total_appointments * 100) if first_metric.total_appointments > 0 else 0,
        "system_uptime_trend": last_metric.system_uptime - first_metric.system_uptime,
        "error_rate_trend": last_metric.error_rate - first_metric.error_rate
    }
    
    return trends

def get_metrics_alerts(db: Session):
    latest_metrics = get_latest_system_metrics(db)
    if not latest_metrics:
        return []
    
    alerts = []
    
    # Verificar alertas baseados nas métricas
    if latest_metrics.system_uptime < 95.0:
        alerts.append({
            "type": "uptime",
            "message": f"Uptime do sistema baixo: {latest_metrics.system_uptime}%",
            "severity": "high"
        })
    
    if latest_metrics.error_rate > 5.0:
        alerts.append({
            "type": "error_rate",
            "message": f"Taxa de erro alta: {latest_metrics.error_rate}%",
            "severity": "medium"
        })
    
    if latest_metrics.database_connections > 80:
        alerts.append({
            "type": "database",
            "message": f"Muitas conexões de banco: {latest_metrics.database_connections}",
            "severity": "medium"
        })
    
    return alerts

# ============================================================================
# TELEMEDICINA - CRUD FUNCTIONS
# ============================================================================

# Telemedicine Room CRUD
def get_telemedicine_room(db: Session, room_id: int):
    return db.query(models.TelemedicineRoom).filter(models.TelemedicineRoom.id == room_id).first()

def get_telemedicine_rooms(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.TelemedicineRoom).filter(
        models.TelemedicineRoom.clinic_id == clinic_id
    ).offset(skip).limit(limit).all()

def create_telemedicine_room(db: Session, room: schemas.TelemedicineRoomCreate, clinic_id: int, created_by: int):
    import uuid
    room_id = str(uuid.uuid4())
    
    # Apply encryption to sensitive fields
    room_data = field_encryption.encrypt_model_data(room.dict(), "TelemedicineRoom")
    
    db_room = models.TelemedicineRoom(
        **room_data,
        clinic_id=clinic_id,
        room_id=room_id,
        created_by=created_by,
        status="active"
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def update_telemedicine_room(db: Session, room_id: int, room: schemas.TelemedicineRoomUpdate):
    db_room = db.query(models.TelemedicineRoom).filter(models.TelemedicineRoom.id == room_id).first()
    if db_room:
        update_data = room.dict(exclude_unset=True)
        # Apply encryption to sensitive fields
        encrypted_data = field_encryption.encrypt_model_data(update_data, "TelemedicineRoom")
        for field, value in encrypted_data.items():
            setattr(db_room, field, value)
        db.commit()
        db.refresh(db_room)
    return db_room

def delete_telemedicine_room(db: Session, room_id: int):
    db_room = db.query(models.TelemedicineRoom).filter(models.TelemedicineRoom.id == room_id).first()
    if db_room:
        db_room.status = "inactive"
        db.commit()
        db.refresh(db_room)
    return db_room

# Teleconsultation CRUD
def get_teleconsultation(db: Session, consultation_id: int):
    return db.query(models.Teleconsultation).filter(models.Teleconsultation.id == consultation_id).first()

def get_teleconsultations(db: Session, clinic_id: int, patient_id: Optional[int] = None, doctor_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Teleconsultation).filter(models.Teleconsultation.clinic_id == clinic_id)
    
    if patient_id:
        query = query.filter(models.Teleconsultation.patient_id == patient_id)
    if doctor_id:
        query = query.filter(models.Teleconsultation.doctor_id == doctor_id)
    
    return query.order_by(models.Teleconsultation.scheduled_datetime.desc()).offset(skip).limit(limit).all()

def create_teleconsultation(db: Session, consultation: schemas.TeleconsultationCreate, clinic_id: int):
    # Apply encryption to sensitive fields
    consultation_data = field_encryption.encrypt_model_data(consultation.dict(), "Teleconsultation")
    
    db_consultation = models.Teleconsultation(
        **consultation_data,
        clinic_id=clinic_id,
        status="scheduled"
    )
    db.add(db_consultation)
    db.commit()
    db.refresh(db_consultation)
    return db_consultation

def update_teleconsultation(db: Session, consultation_id: int, consultation: schemas.TeleconsultationUpdate):
    db_consultation = db.query(models.Teleconsultation).filter(models.Teleconsultation.id == consultation_id).first()
    if db_consultation:
        update_data = consultation.dict(exclude_unset=True)
        # Apply encryption to sensitive fields
        encrypted_data = field_encryption.encrypt_model_data(update_data, "Teleconsultation")
        for field, value in encrypted_data.items():
            setattr(db_consultation, field, value)
        db.commit()
        db.refresh(db_consultation)
    return db_consultation

def start_teleconsultation(db: Session, consultation_id: int):
    db_consultation = db.query(models.Teleconsultation).filter(models.Teleconsultation.id == consultation_id).first()
    if db_consultation:
        db_consultation.status = "in_progress"
        db_consultation.started_at = datetime.now()
        db.commit()
        db.refresh(db_consultation)
    return db_consultation

def end_teleconsultation(db: Session, consultation_id: int):
    db_consultation = db.query(models.Teleconsultation).filter(models.Teleconsultation.id == consultation_id).first()
    if db_consultation:
        db_consultation.status = "completed"
        db_consultation.ended_at = datetime.now()
        db.commit()
        db.refresh(db_consultation)
    return db_consultation

# Teleconsultation Participant CRUD
def get_teleconsultation_participants(db: Session, consultation_id: int):
    return db.query(models.TeleconsultationParticipant).filter(
        models.TeleconsultationParticipant.teleconsultation_id == consultation_id
    ).all()

def add_teleconsultation_participant(db: Session, participant: schemas.TeleconsultationParticipantCreate):
    db_participant = models.TeleconsultationParticipant(
        **participant.dict(),
        is_active=True
    )
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant

def update_participant_status(db: Session, participant_id: int, participant: schemas.TeleconsultationParticipantUpdate):
    db_participant = db.query(models.TeleconsultationParticipant).filter(
        models.TeleconsultationParticipant.id == participant_id
    ).first()
    if db_participant:
        update_data = participant.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_participant, field, value)
        db.commit()
        db.refresh(db_participant)
    return db_participant

# Shared Document CRUD
def get_shared_documents(db: Session, consultation_id: int):
    return db.query(models.SharedDocument).filter(
        models.SharedDocument.teleconsultation_id == consultation_id,
        models.SharedDocument.is_active == True
    ).all()

def create_shared_document(db: Session, document: schemas.SharedDocumentCreate):
    # Apply encryption to sensitive fields
    document_data = field_encryption.encrypt_model_data(document.dict(), "SharedDocument")
    
    db_document = models.SharedDocument(
        **document_data,
        is_active=True
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def update_shared_document(db: Session, document_id: int, document: schemas.SharedDocumentUpdate):
    db_document = db.query(models.SharedDocument).filter(models.SharedDocument.id == document_id).first()
    if db_document:
        update_data = document.dict(exclude_unset=True)
        # Apply encryption to sensitive fields
        encrypted_data = field_encryption.encrypt_model_data(update_data, "SharedDocument")
        for field, value in encrypted_data.items():
            setattr(db_document, field, value)
        db.commit()
        db.refresh(db_document)
    return db_document

def delete_shared_document(db: Session, document_id: int):
    db_document = db.query(models.SharedDocument).filter(models.SharedDocument.id == document_id).first()
    if db_document:
        db_document.is_active = False
        db.commit()
        db.refresh(db_document)
    return db_document

# Remote Monitoring CRUD
def get_remote_monitoring(db: Session, monitoring_id: int):
    return db.query(models.RemoteMonitoring).filter(models.RemoteMonitoring.id == monitoring_id).first()

def get_patient_monitoring(db: Session, patient_id: int, clinic_id: int):
    return db.query(models.RemoteMonitoring).filter(
        models.RemoteMonitoring.patient_id == patient_id,
        models.RemoteMonitoring.clinic_id == clinic_id,
        models.RemoteMonitoring.is_active == True
    ).all()

def create_remote_monitoring(db: Session, monitoring: schemas.RemoteMonitoringCreate, clinic_id: int):
    # Apply encryption to sensitive fields
    monitoring_data = field_encryption.encrypt_model_data(monitoring.dict(), "RemoteMonitoring")
    
    db_monitoring = models.RemoteMonitoring(
        **monitoring_data,
        clinic_id=clinic_id,
        is_active=True
    )
    db.add(db_monitoring)
    db.commit()
    db.refresh(db_monitoring)
    return db_monitoring

def update_remote_monitoring(db: Session, monitoring_id: int, monitoring: schemas.RemoteMonitoringUpdate):
    db_monitoring = db.query(models.RemoteMonitoring).filter(models.RemoteMonitoring.id == monitoring_id).first()
    if db_monitoring:
        update_data = monitoring.dict(exclude_unset=True)
        # Apply encryption to sensitive fields
        encrypted_data = field_encryption.encrypt_model_data(update_data, "RemoteMonitoring")
        for field, value in encrypted_data.items():
            setattr(db_monitoring, field, value)
        db.commit()
        db.refresh(db_monitoring)
    return db_monitoring

# Vital Sign Reading CRUD
def get_vital_sign_readings(db: Session, monitoring_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.VitalSignReading).filter(
        models.VitalSignReading.monitoring_id == monitoring_id
    ).order_by(models.VitalSignReading.reading_datetime.desc()).offset(skip).limit(limit).all()

def create_vital_sign_reading(db: Session, reading: schemas.VitalSignReadingCreate):
    # Apply encryption to sensitive fields
    reading_data = field_encryption.encrypt_model_data(reading.dict(), "VitalSignReading")
    
    db_reading = models.VitalSignReading(
        **reading_data,
        is_verified=False
    )
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    return db_reading

def verify_vital_sign_reading(db: Session, reading_id: int):
    db_reading = db.query(models.VitalSignReading).filter(models.VitalSignReading.id == reading_id).first()
    if db_reading:
        db_reading.is_verified = True
        db.commit()
        db.refresh(db_reading)
    return db_reading

# Medication Adherence Log CRUD
def get_medication_adherence_logs(db: Session, monitoring_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.MedicationAdherenceLog).filter(
        models.MedicationAdherenceLog.monitoring_id == monitoring_id
    ).order_by(models.MedicationAdherenceLog.scheduled_time.desc()).offset(skip).limit(limit).all()

def create_medication_adherence_log(db: Session, log: schemas.MedicationAdherenceLogCreate):
    db_log = models.MedicationAdherenceLog(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def update_medication_adherence(db: Session, log_id: int, log: schemas.MedicationAdherenceLogUpdate):
    db_log = db.query(models.MedicationAdherenceLog).filter(models.MedicationAdherenceLog.id == log_id).first()
    if db_log:
        update_data = log.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_log, field, value)
        db.commit()
        db.refresh(db_log)
    return db_log

# Digital Prescription CRUD
def get_digital_prescription(db: Session, prescription_id: int):
    return db.query(models.DigitalPrescription).filter(models.DigitalPrescription.id == prescription_id).first()

def get_patient_prescriptions(db: Session, patient_id: int, clinic_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.DigitalPrescription).filter(
        models.DigitalPrescription.patient_id == patient_id,
        models.DigitalPrescription.clinic_id == clinic_id
    ).order_by(models.DigitalPrescription.prescription_date.desc()).offset(skip).limit(limit).all()

def create_digital_prescription(db: Session, prescription: schemas.DigitalPrescriptionCreate, clinic_id: int):
    import uuid
    prescription_number = f"RX-{uuid.uuid4().hex[:8].upper()}"
    
    db_prescription = models.DigitalPrescription(
        **prescription.dict(),
        clinic_id=clinic_id,
        prescription_number=prescription_number,
        status="active"
    )
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

def update_digital_prescription(db: Session, prescription_id: int, prescription: schemas.DigitalPrescriptionUpdate):
    db_prescription = db.query(models.DigitalPrescription).filter(models.DigitalPrescription.id == prescription_id).first()
    if db_prescription:
        update_data = prescription.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_prescription, field, value)
        db.commit()
        db.refresh(db_prescription)
    return db_prescription

def dispense_prescription(db: Session, prescription_id: int):
    db_prescription = db.query(models.DigitalPrescription).filter(models.DigitalPrescription.id == prescription_id).first()
    if db_prescription:
        db_prescription.status = "dispensed"
        db_prescription.dispensed_at = datetime.now()
        db_prescription.refills_used += 1
        db.commit()
        db.refresh(db_prescription)
    return db_prescription

# Digital Prescription Medication CRUD
def get_prescription_medications(db: Session, prescription_id: int):
    return db.query(models.DigitalPrescriptionMedication).filter(
        models.DigitalPrescriptionMedication.prescription_id == prescription_id
    ).all()

def add_prescription_medication(db: Session, medication: schemas.DigitalPrescriptionMedicationCreate):
    db_medication = models.DigitalPrescriptionMedication(**medication.dict())
    db.add(db_medication)
    db.commit()
    db.refresh(db_medication)
    return db_medication

def update_prescription_medication(db: Session, medication_id: int, medication: schemas.DigitalPrescriptionMedicationUpdate):
    db_medication = db.query(models.DigitalPrescriptionMedication).filter(
        models.DigitalPrescriptionMedication.id == medication_id
    ).first()
    if db_medication:
        update_data = medication.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_medication, field, value)
        db.commit()
        db.refresh(db_medication)
    return db_medication

# ============================================================================
# CRUD PARA SISTEMA DE PERMISSÕES GRANULARES
# ============================================================================

# UserRole CRUD
def get_user_role(db: Session, role_id: int):
    return db.query(models.UserRole).filter(models.UserRole.id == role_id).first()

def get_user_role_by_code(db: Session, code: str, clinic_id: int):
    return db.query(models.UserRole).filter(
        models.UserRole.code == code,
        models.UserRole.clinic_id == clinic_id
    ).first()

def get_user_roles(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.UserRole).filter(
        models.UserRole.clinic_id == clinic_id,
        models.UserRole.is_active == True
    ).offset(skip).limit(limit).all()

def create_user_role(db: Session, role: schemas.UserRoleCreate):
    db_role = models.UserRole(**role.dict())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def update_user_role(db: Session, role_id: int, role: schemas.UserRoleUpdate):
    db_role = db.query(models.UserRole).filter(models.UserRole.id == role_id).first()
    if db_role:
        update_data = role.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_role, field, value)
        db_role.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_role)
    return db_role

def delete_user_role(db: Session, role_id: int):
    db_role = db.query(models.UserRole).filter(models.UserRole.id == role_id).first()
    if db_role:
        db_role.is_active = False
        db.commit()
        db.refresh(db_role)
    return db_role

# Module CRUD
def get_module(db: Session, module_id: int):
    return db.query(models.Module).filter(models.Module.id == module_id).first()

def get_module_by_code(db: Session, code: str):
    return db.query(models.Module).filter(models.Module.code == code).first()

def get_modules(db: Session, skip: int = 0, limit: int = 100, parent_id: Optional[int] = None):
    query = db.query(models.Module).filter(models.Module.is_active == True)
    if parent_id is not None:
        query = query.filter(models.Module.parent_module_id == parent_id)
    return query.order_by(models.Module.sort_order).offset(skip).limit(limit).all()

def create_module(db: Session, module: schemas.ModuleCreate):
    db_module = models.Module(**module.dict())
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

def update_module(db: Session, module_id: int, module: schemas.ModuleUpdate):
    db_module = db.query(models.Module).filter(models.Module.id == module_id).first()
    if db_module:
        update_data = module.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_module, field, value)
        db.commit()
        db.refresh(db_module)
    return db_module

def delete_module(db: Session, module_id: int):
    db_module = db.query(models.Module).filter(models.Module.id == module_id).first()
    if db_module:
        db_module.is_active = False
        db.commit()
        db.refresh(db_module)
    return db_module

# RolePermission CRUD
def get_role_permission(db: Session, permission_id: int):
    return db.query(models.RolePermission).filter(models.RolePermission.id == permission_id).first()

def get_role_permissions(db: Session, role_id: int):
    return db.query(models.RolePermission).filter(models.RolePermission.role_id == role_id).all()

def get_role_module_permission(db: Session, role_id: int, module_id: int):
    return db.query(models.RolePermission).filter(
        models.RolePermission.role_id == role_id,
        models.RolePermission.module_id == module_id
    ).first()

def create_role_permission(db: Session, permission: schemas.RolePermissionCreate):
    db_permission = models.RolePermission(**permission.dict())
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    return db_permission

def update_role_permission(db: Session, permission_id: int, permission: schemas.RolePermissionUpdate):
    db_permission = db.query(models.RolePermission).filter(models.RolePermission.id == permission_id).first()
    if db_permission:
        update_data = permission.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_permission, field, value)
        db.commit()
        db.refresh(db_permission)
    return db_permission

def delete_role_permission(db: Session, permission_id: int):
    db_permission = db.query(models.RolePermission).filter(models.RolePermission.id == permission_id).first()
    if db_permission:
        db.delete(db_permission)
        db.commit()
    return db_permission

# UserRoleAssignment CRUD
def get_user_role_assignment(db: Session, assignment_id: int):
    return db.query(models.UserRoleAssignment).filter(models.UserRoleAssignment.id == assignment_id).first()

def get_user_role_assignments(db: Session, user_id: int):
    return db.query(models.UserRoleAssignment).filter(
        models.UserRoleAssignment.user_id == user_id,
        models.UserRoleAssignment.is_active == True
    ).all()

def create_user_role_assignment(db: Session, assignment: schemas.UserRoleAssignmentCreate):
    db_assignment = models.UserRoleAssignment(**assignment.dict())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def update_user_role_assignment(db: Session, assignment_id: int, assignment: schemas.UserRoleAssignmentUpdate):
    db_assignment = db.query(models.UserRoleAssignment).filter(models.UserRoleAssignment.id == assignment_id).first()
    if db_assignment:
        update_data = assignment.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_assignment, field, value)
        db.commit()
        db.refresh(db_assignment)
    return db_assignment

def deactivate_user_role_assignment(db: Session, assignment_id: int):
    db_assignment = db.query(models.UserRoleAssignment).filter(models.UserRoleAssignment.id == assignment_id).first()
    if db_assignment:
        db_assignment.is_active = False
        db.commit()
        db.refresh(db_assignment)
    return db_assignment

# ============================================================================
# CRUD PARA SISTEMA DE LEITOS E QUARTOS
# ============================================================================

# Room CRUD
def get_room(db: Session, room_id: int):
    return db.query(models.Room).filter(models.Room.id == room_id).first()

def get_room_by_number(db: Session, room_number: str, clinic_id: int):
    return db.query(models.Room).filter(
        models.Room.room_number == room_number,
        models.Room.clinic_id == clinic_id
    ).first()

def get_rooms(db: Session, clinic_id: int, department_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Room).filter(
        models.Room.clinic_id == clinic_id,
        models.Room.is_active == True
    )
    if department_id:
        query = query.filter(models.Room.department_id == department_id)
    return query.offset(skip).limit(limit).all()

def create_room(db: Session, room: schemas.RoomCreate):
    db_room = models.Room(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def update_room(db: Session, room_id: int, room: schemas.RoomUpdate):
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if db_room:
        update_data = room.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_room, field, value)
        db_room.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_room)
    return db_room

def delete_room(db: Session, room_id: int):
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if db_room:
        db_room.is_active = False
        db.commit()
        db.refresh(db_room)
    return db_room

# Bed CRUD
def get_bed(db: Session, bed_id: int):
    return db.query(models.Bed).filter(models.Bed.id == bed_id).first()

def get_bed_by_number(db: Session, bed_number: str, room_id: int):
    return db.query(models.Bed).filter(
        models.Bed.bed_number == bed_number,
        models.Bed.room_id == room_id
    ).first()

def get_beds(db: Session, clinic_id: int, room_id: Optional[int] = None, status: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Bed).filter(
        models.Bed.clinic_id == clinic_id,
        models.Bed.is_active == True
    )
    if room_id:
        query = query.filter(models.Bed.room_id == room_id)
    if status:
        query = query.filter(models.Bed.status == status)
    return query.offset(skip).limit(limit).all()

def get_available_beds(db: Session, clinic_id: int, room_type: Optional[str] = None):
    query = db.query(models.Bed).join(models.Room).filter(
        models.Bed.clinic_id == clinic_id,
        models.Bed.status == "available",
        models.Bed.is_active == True,
        models.Room.is_active == True
    )
    if room_type:
        query = query.filter(models.Room.room_type == room_type)
    return query.all()

def create_bed(db: Session, bed: schemas.BedCreate):
    db_bed = models.Bed(**bed.dict())
    db.add(db_bed)
    db.commit()
    db.refresh(db_bed)
    return db_bed

def update_bed(db: Session, bed_id: int, bed: schemas.BedUpdate):
    db_bed = db.query(models.Bed).filter(models.Bed.id == bed_id).first()
    if db_bed:
        # Registrar mudança de status se necessário
        old_status = db_bed.status
        update_data = bed.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_bed, field, value)
        
        db_bed.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_bed)
        
        # Se o status mudou, criar histórico
        if 'status' in update_data and old_status != update_data['status']:
            create_bed_status_history(db, schemas.BedStatusHistoryCreate(
                bed_id=bed_id,
                previous_status=old_status,
                new_status=update_data['status'],
                change_reason="Status atualizado via API",
                changed_by=1  # TODO: Pegar do contexto do usuário
            ))
    return db_bed

def delete_bed(db: Session, bed_id: int):
    db_bed = db.query(models.Bed).filter(models.Bed.id == bed_id).first()
    if db_bed:
        db_bed.is_active = False
        db.commit()
        db.refresh(db_bed)
    return db_bed

# BedStatusHistory CRUD
def get_bed_status_history(db: Session, bed_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.BedStatusHistory).filter(
        models.BedStatusHistory.bed_id == bed_id
    ).order_by(models.BedStatusHistory.changed_at.desc()).offset(skip).limit(limit).all()

def create_bed_status_history(db: Session, history: schemas.BedStatusHistoryCreate):
    db_history = models.BedStatusHistory(**history.dict())
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

# ============================================================================
# CRUD PARA SISTEMA DE INTERNAÇÃO
# ============================================================================

# PatientAdmission CRUD
def get_patient_admission(db: Session, admission_id: int):
    return db.query(models.PatientAdmission).filter(models.PatientAdmission.id == admission_id).first()

def get_patient_admission_by_number(db: Session, admission_number: str, clinic_id: int):
    return db.query(models.PatientAdmission).filter(
        models.PatientAdmission.admission_number == admission_number,
        models.PatientAdmission.clinic_id == clinic_id
    ).first()

def get_patient_admissions(db: Session, clinic_id: int, patient_id: Optional[int] = None, status: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.PatientAdmission).filter(models.PatientAdmission.clinic_id == clinic_id)
    if patient_id:
        query = query.filter(models.PatientAdmission.patient_id == patient_id)
    if status:
        query = query.filter(models.PatientAdmission.status == status)
    return query.order_by(models.PatientAdmission.admission_date.desc()).offset(skip).limit(limit).all()

def get_active_admissions(db: Session, clinic_id: int):
    return db.query(models.PatientAdmission).filter(
        models.PatientAdmission.clinic_id == clinic_id,
        models.PatientAdmission.status == "active"
    ).all()

def create_patient_admission(db: Session, admission: schemas.PatientAdmissionCreate):
    # Marcar leito como ocupado
    bed = db.query(models.Bed).filter(models.Bed.id == admission.bed_id).first()
    if bed:
        bed.status = "occupied"
        
        # Criar histórico de mudança de status do leito
        create_bed_status_history(db, schemas.BedStatusHistoryCreate(
            bed_id=admission.bed_id,
            previous_status="available",
            new_status="occupied",
            change_reason="Paciente internado",
            changed_by=admission.admitting_doctor_id
        ))
    
    db_admission = models.PatientAdmission(**admission.dict())
    db.add(db_admission)
    db.commit()
    db.refresh(db_admission)
    return db_admission

def update_patient_admission(db: Session, admission_id: int, admission: schemas.PatientAdmissionUpdate):
    db_admission = db.query(models.PatientAdmission).filter(models.PatientAdmission.id == admission_id).first()
    if db_admission:
        update_data = admission.dict(exclude_unset=True)
        
        # Se está sendo dado alta, liberar o leito
        if 'status' in update_data and update_data['status'] in ['discharged', 'transferred', 'deceased']:
            bed = db.query(models.Bed).filter(models.Bed.id == db_admission.bed_id).first()
            if bed:
                bed.status = "cleaning"  # Leito precisa ser limpo antes de ficar disponível
                create_bed_status_history(db, schemas.BedStatusHistoryCreate(
                    bed_id=db_admission.bed_id,
                    previous_status="occupied",
                    new_status="cleaning",
                    change_reason=f"Paciente {update_data['status']}",
                    changed_by=1  # TODO: Pegar do contexto do usuário
                ))
        
        for field, value in update_data.items():
            setattr(db_admission, field, value)
        
        db_admission.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_admission)
    return db_admission

# BedTransfer CRUD
def get_bed_transfers(db: Session, admission_id: int):
    return db.query(models.BedTransfer).filter(
        models.BedTransfer.admission_id == admission_id
    ).order_by(models.BedTransfer.transfer_date.desc()).all()

def create_bed_transfer(db: Session, transfer: schemas.BedTransferCreate):
    # Liberar leito anterior
    from_bed = db.query(models.Bed).filter(models.Bed.id == transfer.from_bed_id).first()
    if from_bed:
        from_bed.status = "cleaning"
        create_bed_status_history(db, schemas.BedStatusHistoryCreate(
            bed_id=transfer.from_bed_id,
            previous_status="occupied",
            new_status="cleaning",
            change_reason="Transferência de paciente",
            changed_by=transfer.authorized_by
        ))
    
    # Ocupar novo leito
    to_bed = db.query(models.Bed).filter(models.Bed.id == transfer.to_bed_id).first()
    if to_bed:
        to_bed.status = "occupied"
        create_bed_status_history(db, schemas.BedStatusHistoryCreate(
            bed_id=transfer.to_bed_id,
            previous_status="available",
            new_status="occupied",
            change_reason="Recebimento de paciente transferido",
            changed_by=transfer.authorized_by
        ))
    
    # Atualizar internação com novo leito
    admission = db.query(models.PatientAdmission).filter(models.PatientAdmission.id == transfer.admission_id).first()
    if admission:
        admission.bed_id = transfer.to_bed_id
    
    # Criar registro de transferência
    transfer_data = transfer.dict()
    if not transfer_data.get('transfer_date'):
        transfer_data['transfer_date'] = datetime.utcnow()
    
    db_transfer = models.BedTransfer(**transfer_data)
    db.add(db_transfer)
    db.commit()
    db.refresh(db_transfer)
    return db_transfer

# DailyRateConfig CRUD
def get_daily_rate_config(db: Session, config_id: int):
    return db.query(models.DailyRateConfig).filter(models.DailyRateConfig.id == config_id).first()

def get_daily_rate_configs(db: Session, clinic_id: int, is_active: bool = True, skip: int = 0, limit: int = 100):
    query = db.query(models.DailyRateConfig).filter(models.DailyRateConfig.clinic_id == clinic_id)
    if is_active is not None:
        query = query.filter(models.DailyRateConfig.is_active == is_active)
    return query.offset(skip).limit(limit).all()

def create_daily_rate_config(db: Session, config: schemas.DailyRateConfigCreate):
    db_config = models.DailyRateConfig(**config.dict())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def update_daily_rate_config(db: Session, config_id: int, config: schemas.DailyRateConfigUpdate):
    db_config = db.query(models.DailyRateConfig).filter(models.DailyRateConfig.id == config_id).first()
    if db_config:
        update_data = config.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_config, field, value)
        db_config.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_config)
    return db_config

# DailyRateTier CRUD
def get_daily_rate_tiers(db: Session, config_id: int):
    return db.query(models.DailyRateTier).filter(
        models.DailyRateTier.config_id == config_id
    ).order_by(models.DailyRateTier.day_from).all()

def create_daily_rate_tier(db: Session, tier: schemas.DailyRateTierCreate):
    db_tier = models.DailyRateTier(**tier.dict())
    db.add(db_tier)
    db.commit()
    db.refresh(db_tier)
    return db_tier

def update_daily_rate_tier(db: Session, tier_id: int, tier: schemas.DailyRateTierUpdate):
    db_tier = db.query(models.DailyRateTier).filter(models.DailyRateTier.id == tier_id).first()
    if db_tier:
        update_data = tier.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_tier, field, value)
        db.commit()
        db.refresh(db_tier)
    return db_tier

def delete_daily_rate_tier(db: Session, tier_id: int):
    db_tier = db.query(models.DailyRateTier).filter(models.DailyRateTier.id == tier_id).first()
    if db_tier:
        db.delete(db_tier)
        db.commit()
    return db_tier

# AdmissionBilling CRUD
def get_admission_billing(db: Session, billing_id: int):
    return db.query(models.AdmissionBilling).filter(models.AdmissionBilling.id == billing_id).first()

def get_admission_billings(db: Session, admission_id: int):
    return db.query(models.AdmissionBilling).filter(
        models.AdmissionBilling.admission_id == admission_id
    ).order_by(models.AdmissionBilling.billing_date.desc()).all()

def create_admission_billing(db: Session, billing: schemas.AdmissionBillingCreate):
    db_billing = models.AdmissionBilling(**billing.dict())
    db.add(db_billing)
    db.commit()
    db.refresh(db_billing)
    return db_billing

def update_admission_billing(db: Session, billing_id: int, billing: schemas.AdmissionBillingUpdate):
    db_billing = db.query(models.AdmissionBilling).filter(models.AdmissionBilling.id == billing_id).first()
    if db_billing:
        update_data = billing.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_billing, field, value)
        db_billing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_billing)
    return db_billing

# BillingItem CRUD
def get_billing_items(db: Session, billing_id: int):
    return db.query(models.BillingItem).filter(models.BillingItem.billing_id == billing_id).all()

def create_billing_item(db: Session, item: schemas.BillingItemCreate):
    db_item = models.BillingItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_billing_item(db: Session, item_id: int, item: schemas.BillingItemUpdate):
    db_item = db.query(models.BillingItem).filter(models.BillingItem.id == item_id).first()
    if db_item:
        update_data = item.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_billing_item(db: Session, item_id: int):
    db_item = db.query(models.BillingItem).filter(models.BillingItem.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item