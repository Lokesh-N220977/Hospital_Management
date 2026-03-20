from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.core.role_checker import get_doctor_user
from app.models.appointment_model import AppointmentCreate
from app.services import appointment_service, doctor_service

router = APIRouter(prefix="/api/v1/appointments", tags=["Appointments"])

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
    
    # Using specific patient_id from payload
    appointment_data["status"] = "booked"
    appointment_id = await appointment_service.book_appointment(appointment_data)
    return {"message": "Appointment booked successfully", "appointment_id": appointment_id}

@router.get("/dashboard")
async def get_dashboard(current_user=Depends(get_current_user)):
    # Updated to use user ID for multi-patient dashboard summary
    return await appointment_service.get_patient_dashboard(str(current_user["_id"]))

@router.get("/my-appointments")
async def get_my_appts(current_user=Depends(get_current_user)):
    # Returns appointments for ALL family patients linked to this user
    return await appointment_service.get_user_all_appointments(str(current_user["_id"]))

@router.get("/doctor/me")
async def get_doctor_appts(current_user=Depends(get_doctor_user)):
    doctor_profile = await doctor_service.get_doctor_by_user_id(str(current_user["_id"]))
    if not doctor_profile:
        return []
    return await appointment_service.get_doctor_appointments(doctor_profile["_id"])

@router.patch("/{appointment_id}")
async def update_status(appointment_id: str, status: str, current_user=Depends(get_doctor_user)):
    await appointment_service.update_appointment_status(appointment_id, status)
    return {"message": f"Appointment status updated to {status}"}

@router.get("/doctor/{doctor_id}/patients")
async def get_patients(doctor_id: str, current_user=Depends(get_doctor_user)):
    return await appointment_service.get_doctor_patients(doctor_id)

@router.put("/{appointment_id}/cancel")
async def cancel_appt(appointment_id: str, current_user=Depends(get_current_user)):
    await appointment_service.cancel_appointment(appointment_id)
    return {"message": "Appointment cancelled"}