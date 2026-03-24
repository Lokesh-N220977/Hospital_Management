from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.services.hardened_booking_service import HardenedBookingService
from app.database.collections import appointments_collection
from bson import ObjectId
from pydantic import BaseModel
from typing import List

router = APIRouter()

class BookingRequest(BaseModel):
    doctor_id: str
    patient_id: str
    location_id: str # MANDATORY: Booking tied to branch
    date: str
    shift_id: str
    symptoms: List[str]
    idempotency_key: str

@router.post("/appointments/book")
async def book_appointment(data: BookingRequest):
    """
    Production-grade: Book appointment with transaction safety and priority logic.
    """
    try:
        result = await HardenedBookingService.book_appointment(
            data.doctor_id,
            data.patient_id,
            data.location_id,
            data.date,
            data.shift_id,
            data.symptoms,
            data.idempotency_key
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/appointments/cancel/{appointment_id}")
async def cancel_appointment(appointment_id: str):
    """
    Production-grade: Atomic cancellation with queue adjustment.
    """
    success = await HardenedBookingService.cancel_appointment(appointment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Appointment not found or already cancelled")
    return {"message": "Appointment cancelled successfully"}

@router.get("/appointments/status/{appointment_id}")
async def get_appt_status(appointment_id: str):
    """
    Fresh read for status, queue position, and wait time.
    """
    appt = await appointments_collection.find_one({"_id": ObjectId(appointment_id)})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    return {
        "id": str(appt["_id"]),
        "status": appt.get("status"),
        "queue_position": appt.get("queue_position"),
        "estimated_wait_time": appt.get("estimated_wait_time"),
        "priority_level": appt.get("priority_level"),
        "is_overflow": appt.get("is_overflow", False)
    }
