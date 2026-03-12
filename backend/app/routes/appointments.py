from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.database import database
from app.schemas.appointment_schema import AppointmentCreate
from app.utils.auth import get_current_patient

router = APIRouter()


@router.post("/appointments/book")
async def book_appointment(
    appointment: AppointmentCreate,
    user_id: str = Depends(get_current_patient)
):

    # check if doctor exists conceptually, though UI might send raw strings for doctor name/department for now
    # Since frontend sends 'doctor' string right now, we will store that directly if no explicit ID mapping is implemented yet.
    
    new_appointment = {
        "user_id": user_id,
        "doctor_id": appointment.doctor_id,
        "department": appointment.department,
        "appointment_date": appointment.appointment_date,
        "appointment_time": appointment.appointment_time,
        "status": "pending"
    }

    result = await database.appointments.insert_one(new_appointment)

    return {
        "message": "Appointment booked",
        "appointment_id": str(result.inserted_id)
    }

@router.get("/appointments/user")
async def get_my_appointments(user_id: str = Depends(get_current_patient)):

    if user_id == "dummy_patient_id":
         # Fallback mock for UI visualization if db empty
         return []

    appointments = []
    
    # We only return current/upcoming ones for `appointments/user` normally, 
    # but frontend simply renders whatever we send.
    async for appointment in database.appointments.find({"user_id": user_id}):
        appointment["_id"] = str(appointment["_id"])
        appointments.append(appointment)

    return appointments

@router.get("/appointments/history")
async def get_history(user_id: str = Depends(get_current_patient)):
    
    if user_id == "dummy_patient_id":
         # Return static mock data so frontend sees something
         return [
             { "doctor": 'Dr. Smith (General Physician)', "department": 'General Medicine', "date": '2024-01-15', "time": '10:00 AM' },
             { "doctor": 'Dr. Rao (Cardiologist)', "department": 'Cardiology', "date": '2023-12-02', "time": '11:30 AM' },
             { "doctor": 'Dr. Adams (Orthopedics)', "department": 'Orthopedics', "date": '2023-10-10', "time": '09:15 AM' }
         ]

    # In a real app we'd filter for past dates or completed statuses
    appointments = []
    async for appointment in database.appointments.find({"user_id": user_id}):
        appointment["_id"] = str(appointment["_id"])
        appointments.append(appointment)

    return appointments

@router.delete("/appointments/{appointment_id}")
async def cancel_appointment(
    appointment_id: str,
    user_id: str = Depends(get_current_patient)
):

    if user_id == "dummy_patient_id":
         return {"message": "Dummy appointment cancelled"}

    try:
         appointment = await database.appointments.find_one({
             "_id": ObjectId(appointment_id),
             "user_id": user_id
         })
    except Exception:
         raise HTTPException(status_code=400, detail="Invalid appointment ID format")

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    await database.appointments.delete_one({"_id": ObjectId(appointment_id)})

    return {"message": "Appointment cancelled"}
