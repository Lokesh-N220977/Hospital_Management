from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.core.role_checker import get_doctor_user
from app.models.appointment_model import AppointmentCreate
from app.services import appointment_service, doctor_service
from typing import Optional

router = APIRouter(prefix="/api/v1/appointments", tags=["Appointments"])

def success_response(message: str, data: Optional[dict | list | str] = None):
    return {"success": True, "message": message, "data": data}

@router.post("/book")
async def book_appt(appointment: AppointmentCreate, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    appointment_data = appointment.dict()
    
    # 1. Verification: Does this patient record belong to this user? (If role is patient)
    if current_user.get("role") == "patient":
        from app.services import patient_service
        p = await patient_service.get_patient_by_id(appointment.patient_id)
        if not p or p.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized access to this patient profile")
    
    appointment_id = await appointment_service.book_appointment(appointment_data)
    return success_response("Appointment booked successfully", {"appointment_id": appointment_id})

@router.get("/dashboard")
async def get_dashboard(current_user=Depends(get_current_user)):
    data = await appointment_service.get_patient_dashboard(str(current_user["_id"]))
    return success_response("Dashboard loaded", data)

@router.get("/my-appointments")
async def get_my_appts(current_user=Depends(get_current_user)):
    # Returns appointments for ALL family patients linked to this user
    data = await appointment_service.get_user_all_appointments(str(current_user["_id"]))
    return success_response("Appointments fetched successfully", data)

@router.get("/doctor/me")
async def get_doctor_appts(current_user=Depends(get_doctor_user)):
    doctor_profile = await doctor_service.get_doctor_by_user_id(str(current_user["_id"]))
    if not doctor_profile:
        return success_response("No doctor profile found", [])
    data = await appointment_service.get_doctor_appointments(doctor_profile["_id"])
    return success_response("Appointments fetched successfully", data)

@router.patch("/{appointment_id}")
async def update_status(appointment_id: str, status: str, current_user=Depends(get_doctor_user)):
    await appointment_service.update_appointment_status(appointment_id, status)
    return success_response(f"Appointment status updated to {status}")

@router.get("/doctor/{doctor_id}/patients")
async def get_patients(doctor_id: str, current_user=Depends(get_doctor_user)):
    data = await appointment_service.get_doctor_patients(doctor_id)
    return success_response("Patients fetched successfully", data)

@router.patch("/{appointment_id}/cancel")
async def cancel_appt(appointment_id: str, current_user=Depends(get_current_user)):
    # Add proper cancelling user mapping
    role = current_user.get("role", "patient")
    await appointment_service.cancel_appointment(appointment_id, "Cancelled manually", role)
    return success_response("Appointment cancelled")