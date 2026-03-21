from fastapi import APIRouter
from app.services import appointment_service

router = APIRouter()

def success_response(message: str, data=None):
    return {"success": True, "message": message, "data": data}

@router.get("/appointments/doctor/{doctor_id}")
async def get_doctor_appts(doctor_id: str):
    """Step 1: Get all appointments for a specific doctor."""
    data = await appointment_service.get_doctor_appointments(doctor_id)
    return success_response("Appointments fetched successfully", data)

@router.patch("/appointments/{appointment_id}")
async def update_status(appointment_id: str, status: str):
    """Step 1: Update the status of an appointment."""
    await appointment_service.update_appointment_status(appointment_id, status)
    return success_response(f"Appointment status updated to {status}")

@router.get("/appointments/doctor/{doctor_id}/patients")
async def get_patients(doctor_id: str):
    """Retrieve unique patients for a specific doctor."""
    data = await appointment_service.get_doctor_patients(doctor_id)
    return success_response("Patients fetched successfully", data)

