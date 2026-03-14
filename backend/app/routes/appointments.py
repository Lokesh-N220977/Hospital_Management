from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId

from app.database import appointments_collection
from app.models.appointment_model import AppointmentCreate
from app.core.dependencies import get_current_user
from pymongo.errors import DuplicateKeyError
from pymongo.errors import DuplicateKeyError
from app.services.availability_service import get_available_slots
from app.database import doctor_slots_collection

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.post("/book")
async def book_appointment(
    appointment: AppointmentCreate,
    current_user=Depends(get_current_user)
):

    patient_id = current_user["id"]

    appointment_data = {
        "doctor_id": appointment.doctor_id,
        "patient_id": patient_id,
        "appointment_date": appointment.date,
        "appointment_time": appointment.time,
        "reason": appointment.reason,
        "status": "booked"
    }

    # STEP 1 — check slot availability
    available = await get_available_slots(
        appointment_data["doctor_id"],
        appointment_data["appointment_date"]
    )

    if appointment_data["appointment_time"] not in available:
        raise HTTPException(
            status_code=400,
            detail="Slot not available"
        )

    # STEP 2 — mark slot as booked in doctor_slots
    slot_update = await doctor_slots_collection.update_one(
        {
            "doctor_id": appointment_data["doctor_id"],
            "date": appointment_data["appointment_date"],
            "slots.time": appointment_data["appointment_time"],
            "slots.booked": False
        },
        {
            "$set": {"slots.$.booked": True}
        }
    )

    if slot_update.modified_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Slot already booked"
        )

    # STEP 3 — insert appointment record
    try:
        result = await appointments_collection.insert_one(appointment_data)

    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail="This slot is already booked"
        )

    return {
        "message": "Appointment booked successfully",
        "appointment_id": str(result.inserted_id)
    }
@router.get("/my-appointments")
async def my_appointments(
    status: str | None = None,
    current_user=Depends(get_current_user)
):

    patient_id = current_user["id"]

    query = {"patient_id": patient_id}

    if status:
        query["status"] = status

    appointments = []

    async for appointment in appointments_collection.find(query):

        appointment["_id"] = str(appointment["_id"])
        appointments.append(appointment)

    return appointments


@router.post("/cancel/{appointment_id}")
async def cancel_appointment(
    appointment_id: str,
    current_user=Depends(get_current_user)
):

    patient_id = current_user["id"]

    appointment = await appointments_collection.find_one({
        "_id": ObjectId(appointment_id),
        "patient_id": patient_id
    })

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    await appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "cancelled"}}
    )

    await doctor_slots_collection.update_one(
    {
        "doctor_id": appointment["doctor_id"],
        "date": appointment["appointment_date"],
        "slots.time": appointment["appointment_time"]
    },
    {
        "$set": {"slots.$.booked": False}
    }
    )

    return {"message": "Appointment cancelled"}