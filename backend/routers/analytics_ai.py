from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import json

from database import get_db
from models import (
    PredictiveModel, ModelPrediction, PatientSatisfactionSurvey,
    DiagnosticPattern, SchedulingOptimization, Patient, Appointment
)
from schemas import (
    PredictiveModelCreate, PredictiveModelUpdate, PredictiveModel as PredictiveModelSchema,
    ModelPredictionCreate, ModelPredictionUpdate, ModelPrediction as ModelPredictionSchema,
    PatientSatisfactionSurveyCreate, PatientSatisfactionSurveyUpdate, PatientSatisfactionSurvey as PatientSatisfactionSurveySchema,
    DiagnosticPatternCreate, DiagnosticPatternUpdate, DiagnosticPattern as DiagnosticPatternSchema,
    SchedulingOptimizationCreate, SchedulingOptimizationUpdate, SchedulingOptimization as SchedulingOptimizationSchema
)
from auth import get_current_user
from models import User
from encryption import field_encryption

router = APIRouter(prefix="/analytics-ai", tags=["Analytics and AI"])

# Predictive Model endpoints
@router.post("/models/", response_model=PredictiveModelSchema)
def create_predictive_model(
    model: PredictiveModelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar um novo modelo preditivo"""
    # Apply encryption to sensitive fields
    model_data = field_encryption.encrypt_model_data(model.dict(), "PredictiveModel")
    
    db_model = PredictiveModel(
        **model_data,
        clinic_id=current_user.clinic_id,
        version="1.0",
        status="training"
    )
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

@router.get("/models/", response_model=List[PredictiveModelSchema])
def get_predictive_models(
    skip: int = 0,
    limit: int = 100,
    model_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar modelos preditivos"""
    query = db.query(PredictiveModel).filter(
        PredictiveModel.clinic_id == current_user.clinic_id,
        PredictiveModel.is_active == True
    )
    
    if model_type:
        query = query.filter(PredictiveModel.model_type == model_type)
    if status:
        query = query.filter(PredictiveModel.status == status)
    
    return query.offset(skip).limit(limit).all()

@router.get("/models/{model_id}", response_model=PredictiveModelSchema)
def get_predictive_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter detalhes de um modelo preditivo"""
    model = db.query(PredictiveModel).filter(
        PredictiveModel.id == model_id,
        PredictiveModel.clinic_id == current_user.clinic_id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo preditivo não encontrado"
        )
    
    return model

@router.put("/models/{model_id}", response_model=PredictiveModelSchema)
def update_predictive_model(
    model_id: int,
    model_update: PredictiveModelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar um modelo preditivo"""
    model = db.query(PredictiveModel).filter(
        PredictiveModel.id == model_id,
        PredictiveModel.clinic_id == current_user.clinic_id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo preditivo não encontrado"
        )
    
    update_data = model_update.dict(exclude_unset=True)
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "PredictiveModel")
    for field, value in encrypted_data.items():
        setattr(model, field, value)
    
    model.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(model)
    return model

@router.post("/models/{model_id}/train")
def train_predictive_model(
    model_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Treinar um modelo preditivo"""
    model = db.query(PredictiveModel).filter(
        PredictiveModel.id == model_id,
        PredictiveModel.clinic_id == current_user.clinic_id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo preditivo não encontrado"
        )
    
    model.status = "training"
    model.updated_at = datetime.utcnow()
    db.commit()
    
    # Adicionar tarefa em background para treinar o modelo
    background_tasks.add_task(train_model_background, model_id, db)
    
    return {"message": "Treinamento do modelo iniciado"}

# Model Prediction endpoints
@router.post("/predictions/", response_model=ModelPredictionSchema)
def create_prediction(
    prediction: ModelPredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar uma nova predição"""
    # Verificar se o modelo existe e está ativo
    model = db.query(PredictiveModel).filter(
        PredictiveModel.id == prediction.model_id,
        PredictiveModel.clinic_id == current_user.clinic_id,
        PredictiveModel.status == "active"
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo preditivo ativo não encontrado"
        )
    
    # Apply encryption to sensitive fields
    prediction_data = field_encryption.encrypt_model_data(prediction.dict(), "ModelPrediction")
    
    db_prediction = ModelPrediction(**prediction_data)
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

@router.get("/predictions/", response_model=List[ModelPredictionSchema])
def get_predictions(
    skip: int = 0,
    limit: int = 100,
    model_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar predições"""
    # Subquery para obter apenas modelos da clínica do usuário
    model_subquery = db.query(PredictiveModel.id).filter(
        PredictiveModel.clinic_id == current_user.clinic_id
    ).subquery()
    
    query = db.query(ModelPrediction).filter(
        ModelPrediction.model_id.in_(model_subquery)
    )
    
    if model_id:
        query = query.filter(ModelPrediction.model_id == model_id)
    if patient_id:
        query = query.filter(ModelPrediction.patient_id == patient_id)
    if start_date:
        query = query.filter(ModelPrediction.prediction_date >= start_date)
    if end_date:
        query = query.filter(ModelPrediction.prediction_date <= end_date)
    
    return query.order_by(ModelPrediction.prediction_date.desc()).offset(skip).limit(limit).all()

@router.put("/predictions/{prediction_id}/feedback", response_model=ModelPredictionSchema)
def update_prediction_feedback(
    prediction_id: int,
    prediction_update: ModelPredictionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar feedback de uma predição"""
    # Subquery para verificar se o modelo pertence à clínica
    model_subquery = db.query(PredictiveModel.id).filter(
        PredictiveModel.clinic_id == current_user.clinic_id
    ).subquery()
    
    prediction = db.query(ModelPrediction).filter(
        ModelPrediction.id == prediction_id,
        ModelPrediction.model_id.in_(model_subquery)
    ).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Predição não encontrada"
        )
    
    update_data = prediction_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prediction, field, value)
    
    db.commit()
    db.refresh(prediction)
    return prediction

# Patient Satisfaction Survey endpoints
@router.post("/surveys/", response_model=PatientSatisfactionSurveySchema)
def create_satisfaction_survey(
    survey: PatientSatisfactionSurveyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar uma nova pesquisa de satisfação"""
    # Apply encryption to sensitive fields
    survey_data = field_encryption.encrypt_model_data(survey.dict(), "PatientSatisfactionSurvey")
    
    db_survey = PatientSatisfactionSurvey(
        **survey_data,
        clinic_id=current_user.clinic_id
    )
    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)
    return db_survey

@router.get("/surveys/", response_model=List[PatientSatisfactionSurveySchema])
def get_satisfaction_surveys(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    survey_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar pesquisas de satisfação"""
    query = db.query(PatientSatisfactionSurvey).filter(
        PatientSatisfactionSurvey.clinic_id == current_user.clinic_id
    )
    
    if patient_id:
        query = query.filter(PatientSatisfactionSurvey.patient_id == patient_id)
    if survey_type:
        query = query.filter(PatientSatisfactionSurvey.survey_type == survey_type)
    if start_date:
        query = query.filter(PatientSatisfactionSurvey.survey_date >= start_date)
    if end_date:
        query = query.filter(PatientSatisfactionSurvey.survey_date <= end_date)
    
    return query.order_by(PatientSatisfactionSurvey.survey_date.desc()).offset(skip).limit(limit).all()

@router.get("/surveys/analytics")
def get_satisfaction_analytics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    survey_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter analytics de satisfação do paciente"""
    query = db.query(PatientSatisfactionSurvey).filter(
        PatientSatisfactionSurvey.clinic_id == current_user.clinic_id
    )
    
    if start_date:
        query = query.filter(PatientSatisfactionSurvey.survey_date >= start_date)
    if end_date:
        query = query.filter(PatientSatisfactionSurvey.survey_date <= end_date)
    if survey_type:
        query = query.filter(PatientSatisfactionSurvey.survey_type == survey_type)
    
    surveys = query.all()
    
    if not surveys:
        return {
            "total_surveys": 0,
            "average_ratings": {},
            "recommendation_rate": 0,
            "response_distribution": {}
        }
    
    total_surveys = len(surveys)
    
    # Calcular médias das avaliações
    ratings = {
        "overall": [s.overall_rating for s in surveys],
        "wait_time": [s.wait_time_rating for s in surveys if s.wait_time_rating],
        "staff_courtesy": [s.staff_courtesy_rating for s in surveys if s.staff_courtesy_rating],
        "facility_cleanliness": [s.facility_cleanliness_rating for s in surveys if s.facility_cleanliness_rating],
        "communication": [s.communication_rating for s in surveys if s.communication_rating],
        "treatment_effectiveness": [s.treatment_effectiveness_rating for s in surveys if s.treatment_effectiveness_rating]
    }
    
    average_ratings = {}
    for category, values in ratings.items():
        if values:
            average_ratings[category] = sum(values) / len(values)
    
    # Taxa de recomendação
    recommendations = [s.would_recommend for s in surveys if s.would_recommend is not None]
    recommendation_rate = (sum(recommendations) / len(recommendations) * 100) if recommendations else 0
    
    # Distribuição de respostas
    response_distribution = {}
    for rating in range(1, 6):
        response_distribution[f"{rating}_stars"] = len([s for s in surveys if s.overall_rating == rating])
    
    return {
        "total_surveys": total_surveys,
        "average_ratings": average_ratings,
        "recommendation_rate": round(recommendation_rate, 2),
        "response_distribution": response_distribution
    }

# Diagnostic Pattern endpoints
@router.post("/diagnostic-patterns/", response_model=DiagnosticPatternSchema)
def create_diagnostic_pattern(
    pattern: DiagnosticPatternCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar um novo padrão diagnóstico"""
    # Apply encryption to sensitive fields
    pattern_data = field_encryption.encrypt_model_data(pattern.dict(), "DiagnosticPattern")
    
    db_pattern = DiagnosticPattern(
        **pattern_data,
        clinic_id=current_user.clinic_id,
        status="discovered"
    )
    db.add(db_pattern)
    db.commit()
    db.refresh(db_pattern)
    return db_pattern

@router.get("/diagnostic-patterns/", response_model=List[DiagnosticPatternSchema])
def get_diagnostic_patterns(
    skip: int = 0,
    limit: int = 100,
    pattern_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar padrões diagnósticos"""
    query = db.query(DiagnosticPattern).filter(
        DiagnosticPattern.clinic_id == current_user.clinic_id,
        DiagnosticPattern.is_active == True
    )
    
    if pattern_type:
        query = query.filter(DiagnosticPattern.pattern_type == pattern_type)
    if status:
        query = query.filter(DiagnosticPattern.status == status)
    
    return query.offset(skip).limit(limit).all()

@router.put("/diagnostic-patterns/{pattern_id}/validate", response_model=DiagnosticPatternSchema)
def validate_diagnostic_pattern(
    pattern_id: int,
    pattern_update: DiagnosticPatternUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validar um padrão diagnóstico"""
    pattern = db.query(DiagnosticPattern).filter(
        DiagnosticPattern.id == pattern_id,
        DiagnosticPattern.clinic_id == current_user.clinic_id
    ).first()
    
    if not pattern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Padrão diagnóstico não encontrado"
        )
    
    update_data = pattern_update.dict(exclude_unset=True)
    # Apply encryption to sensitive fields
    encrypted_data = field_encryption.encrypt_model_data(update_data, "DiagnosticPattern")
    for field, value in encrypted_data.items():
        setattr(pattern, field, value)
    
    pattern.status = "validated"
    pattern.last_validated = datetime.utcnow()
    pattern.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(pattern)
    return pattern

# Scheduling Optimization endpoints
@router.post("/scheduling-optimization/", response_model=SchedulingOptimizationSchema)
def create_scheduling_optimization(
    optimization: SchedulingOptimizationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar uma nova otimização de agendamento"""
    # Apply encryption to sensitive fields
    optimization_data = field_encryption.encrypt_model_data(optimization.dict(), "SchedulingOptimization")
    
    db_optimization = SchedulingOptimization(
        **optimization_data,
        clinic_id=current_user.clinic_id,
        status="pending"
    )
    db.add(db_optimization)
    db.commit()
    db.refresh(db_optimization)
    
    # Adicionar tarefa em background para executar a otimização
    background_tasks.add_task(run_scheduling_optimization, db_optimization.id, db)
    
    return db_optimization

@router.get("/scheduling-optimization/", response_model=List[SchedulingOptimizationSchema])
def get_scheduling_optimizations(
    skip: int = 0,
    limit: int = 100,
    optimization_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar otimizações de agendamento"""
    query = db.query(SchedulingOptimization).filter(
        SchedulingOptimization.clinic_id == current_user.clinic_id
    )
    
    if optimization_type:
        query = query.filter(SchedulingOptimization.optimization_type == optimization_type)
    if status:
        query = query.filter(SchedulingOptimization.status == status)
    
    return query.order_by(SchedulingOptimization.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/scheduling-optimization/{optimization_id}/apply")
def apply_scheduling_optimization(
    optimization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Aplicar uma otimização de agendamento"""
    optimization = db.query(SchedulingOptimization).filter(
        SchedulingOptimization.id == optimization_id,
        SchedulingOptimization.clinic_id == current_user.clinic_id,
        SchedulingOptimization.status == "completed"
    ).first()
    
    if not optimization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Otimização de agendamento não encontrada ou não completada"
        )
    
    # Aqui seria implementada a lógica para aplicar a otimização
    # Por exemplo: atualizar horários de agendamentos existentes
    
    optimization.status = "applied"
    optimization.applied_at = datetime.utcnow()
    optimization.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Otimização de agendamento aplicada com sucesso"}

@router.get("/dashboard/overview")
def get_analytics_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter visão geral do dashboard de analytics"""
    # Estatísticas de modelos preditivos
    total_models = db.query(PredictiveModel).filter(
        PredictiveModel.clinic_id == current_user.clinic_id,
        PredictiveModel.is_active == True
    ).count()
    
    active_models = db.query(PredictiveModel).filter(
        PredictiveModel.clinic_id == current_user.clinic_id,
        PredictiveModel.status == "active"
    ).count()
    
    # Estatísticas de predições (último mês)
    last_month = datetime.utcnow() - timedelta(days=30)
    model_subquery = db.query(PredictiveModel.id).filter(
        PredictiveModel.clinic_id == current_user.clinic_id
    ).subquery()
    
    recent_predictions = db.query(ModelPrediction).filter(
        ModelPrediction.model_id.in_(model_subquery),
        ModelPrediction.prediction_date >= last_month
    ).count()
    
    # Estatísticas de satisfação (último mês)
    recent_surveys = db.query(PatientSatisfactionSurvey).filter(
        PatientSatisfactionSurvey.clinic_id == current_user.clinic_id,
        PatientSatisfactionSurvey.survey_date >= last_month
    ).all()
    
    avg_satisfaction = 0
    if recent_surveys:
        avg_satisfaction = sum(s.overall_rating for s in recent_surveys) / len(recent_surveys)
    
    # Padrões diagnósticos
    diagnostic_patterns = db.query(DiagnosticPattern).filter(
        DiagnosticPattern.clinic_id == current_user.clinic_id,
        DiagnosticPattern.is_active == True
    ).count()
    
    return {
        "predictive_models": {
            "total": total_models,
            "active": active_models
        },
        "predictions_last_month": recent_predictions,
        "patient_satisfaction": {
            "surveys_last_month": len(recent_surveys),
            "average_rating": round(avg_satisfaction, 2)
        },
        "diagnostic_patterns": diagnostic_patterns
    }

# Funções auxiliares para tarefas em background
def train_model_background(model_id: int, db: Session):
    """Função para treinar modelo em background"""
    model = db.query(PredictiveModel).filter(
        PredictiveModel.id == model_id
    ).first()
    
    if not model:
        return
    
    try:
        # Aqui seria implementada a lógica de treinamento do modelo
        # Por exemplo: usar scikit-learn, TensorFlow, etc.
        
        import time
        time.sleep(10)  # Simular tempo de treinamento
        
        # Simular métricas de performance
        model.performance_metrics = {
            "accuracy": 0.85,
            "precision": 0.82,
            "recall": 0.88,
            "f1_score": 0.85
        }
        model.accuracy_score = 0.85
        model.status = "active"
        model.last_trained = datetime.utcnow()
        model.updated_at = datetime.utcnow()
        
    except Exception as e:
        model.status = "error"
        model.updated_at = datetime.utcnow()
    
    db.commit()

def run_scheduling_optimization(optimization_id: int, db: Session):
    """Função para executar otimização de agendamento em background"""
    optimization = db.query(SchedulingOptimization).filter(
        SchedulingOptimization.id == optimization_id
    ).first()
    
    if not optimization:
        return
    
    try:
        optimization.status = "running"
        db.commit()
        
        # Aqui seria implementada a lógica de otimização
        # Por exemplo: algoritmos genéticos, programação linear, etc.
        
        import time
        start_time = time.time()
        time.sleep(5)  # Simular tempo de otimização
        end_time = time.time()
        
        # Simular resultado da otimização
        optimization.optimized_schedule = {
            "appointments": [],
            "resources": [],
            "time_slots": []
        }
        optimization.improvement_metrics = {
            "wait_time_reduction": "15%",
            "utilization_increase": "12%",
            "patient_satisfaction_improvement": "8%"
        }
        optimization.execution_time_seconds = end_time - start_time
        optimization.algorithm_used = "genetic_algorithm"
        optimization.status = "completed"
        optimization.updated_at = datetime.utcnow()
        
    except Exception as e:
        optimization.status = "failed"
        optimization.updated_at = datetime.utcnow()
    
    db.commit()