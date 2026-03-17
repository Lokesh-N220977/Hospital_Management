from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.appointment_model import AppointmentCreate
from app.services import appointment_service

router = APIRouter(prefix="/api/v1/appointments", tags=["Appointments"])

@router.post("/book")
async def book_appt(appointment: AppointmentCreate, current_user=Depends(get_current_user)):
    # Assuming current_user is a dict and its ID is mapped to patient_id
    # Using email for simplicity as per existing logic in some parts, but tree says patient_id
    # We'll use the sub (email) or extract id if available
    patient_id = current_user.get("email") 
    appointment_data = appointment.dict()
    appointment_data["patient_id"] = patient_id
    appointment_data["status"] = "booked"
    
    appointment_id = await appointment_service.book_appointment(appointment_data)
    return {"message": "Appointment booked successfully", "appointment_id": appointment_id}

@router.get("/my-appointments")
async def get_my_appts(current_user=Depends(get_current_user)):
    return await appointment_service.get_patient_appointments(current_user.get("email"))

@router.put("/{appointment_id}/cancel")
async def cancel_appt(appointment_id: str, current_user=Depends(get_current_user)):
    await appointment_service.cancel_appointment(appointment_id)
    return {"message": "Appointment cancelled"}