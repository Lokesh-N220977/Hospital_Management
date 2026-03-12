from fastapi import APIRouter, Depends
from app.database import database
from bson import ObjectId
from app.utils.auth import get_current_admin

router = APIRouter()

@router.get("/admin/appointments")
async def get_all_appointments(admin_id: str = Depends(get_current_admin)):

    appointments = []

    async for appointment in database.appointments.find():

        appointment["_id"] = str(appointment["_id"])
        appointments.append(appointment)

    return appointments

@router.delete("/admin/appointments/{appointment_id}")
async def delete_appointment(
    appointment_id: str,
    admin_id: str = Depends(get_current_admin)
):

    await database.appointments.delete_one({"_id": ObjectId(appointment_id)})

    return {"message": "Appointment deleted"}

@router.delete("/admin/doctors/{doctor_id}")
async def delete_doctor(
    doctor_id: str,
    admin_id: str = Depends(get_current_admin)
):

    await database.doctors.delete_one({"_id": ObjectId(doctor_id)})

    return {"message": "Doctor removed"}


