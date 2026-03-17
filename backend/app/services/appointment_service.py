from fastapi import HTTPException
from app.database import appointments_collection
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from app.services import scheduling_service
from app.core.logger import logger

async def book_appointment(appointment_data: dict):
    # Try to lock the slot
    success = await scheduling_service.book_slot(
        appointment_data["doctor_id"],
        appointment_data["date"],
        appointment_data["time"]
    )
    
    if not success:
        logger.warning(f"Booking failed: Slot unavailable for {appointment_data['doctor_id']} at {appointment_data['time']}")
        raise HTTPException(status_code=400, detail="Slot already booked or unavailable")

    try:
        result = await appointments_collection.insert_one(appointment_data)
        logger.info(f"Appointment created: {result.inserted_id}")
        return str(result.inserted_id)
    except DuplicateKeyError:
        # Rollback slot booking if insert fails
        await scheduling_service.release_slot(
            appointment_data["doctor_id"],
            appointment_data["date"],
            appointment_data["time"]
        )
        logger.error(f"Double booking detected for {appointment_data['doctor_id']}")
        raise HTTPException(status_code=400, detail="Double booking detected")

async def get_patient_appointments(patient_id: str):
    appointments = []
    async for appt in appointments_collection.find({"patient_id": patient_id}):
        appt["_id"] = str(appt["_id"])
        appointments.append(appt)
    return appointments

async def cancel_appointment(appointment_id: str):
    appt = await appointments_collection.find_one({"_id": ObjectId(appointment_id)})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    await appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "cancelled"}}
    )
    
    # Unlock the slot
    await scheduling_service.release_slot(
        appt["doctor_id"],
        appt["date"],
        appt["time"]
    )
    logger.info(f"Appointment {appointment_id} cancelled")
    return True

