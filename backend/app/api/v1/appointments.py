from fastapi import APIRouter
from app.services import appointment_service

router = APIRouter()

@router.get("/appointments/doctor/{doctor_id}")
async def get_doctor_appts(doctor_id: str):
    """Step 1: Get all appointments for a specific doctor."""
    return await appointment_service.get_doctor_appointments(doctor_id)

@router.patch("/appointments/{appointment_id}")
async def update_status(appointment_id: str, status: str):
    """Step 1: Update the status of an appointment."""
    return await appointment_service.update_appointment_status(appointment_id, status)

@router.get("/appointments/doctor/{doctor_id}/patients")
async def get_patients(doctor_id: str):
    """Retrieve unique patients for a specific doctor."""
    return await appointment_service.get_doctor_patients(doctor_id)
