"""Módulo de repositórios para operações com Supabase."""

from .clinic_repository import ClinicRepository
from .patient_repository import PatientRepository
from .appointment_repository import AppointmentRepository

__all__ = [
    'ClinicRepository',
    'PatientRepository', 
    'AppointmentRepository'
]