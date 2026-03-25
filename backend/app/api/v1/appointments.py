from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from pydantic import BaseModel
from app.services.dynamic_slot_service import DynamicSlotService
from app.database.collections import appointments_collection

router = APIRouter()

class BookingRequest(BaseModel):
    doctor_id: str
    patient_id: str
    date: str
    slot_time: str

@router.post("/appointments/book")
async def book_appointment(payload: dict):
    """
    Flexible booking endpoint supporting multiple slot field names and reasons.
    """
    try:
        doctor_id = payload.get("doctor_id")
        patient_id = payload.get("patient_id")
        date = payload.get("date")
        # Support both 'time' (common in admin) and 'slot_time' (common in patient)
        slot_time = payload.get("slot_time") or payload.get("time")
        reason = payload.get("reason")
        
        if not (doctor_id and patient_id and date and slot_time):
            raise Exception("Missing required fields: doctor_id, patient_id, date, time")

        # Convert reason string to symptoms list for DynamicSlotService if needed
        symptoms = [reason] if reason else None
        
        appt_id = await DynamicSlotService.book_appointment(
            doctor_id,
            date,
            slot_time,
            patient_id,
            symptoms=symptoms
        )
        return {"id": appt_id, "message": "Appointment booked successfully", "success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/appointments/cancel/{appointment_id}")
async def cancel_appointment(appointment_id: str):
    """
    Cancel an appointment and free up the dynamic slot.
    """
    # Support both case variations and multiple possible active states
    result = await appointments_collection.update_one(
        {"_id": ObjectId(appointment_id), "status": {"$in": ["booked", "BOOKED", "confirmed"]}},
        {"$set": {
            "status": "cancelled",
            "updated_at": datetime.utcnow(),
            "cancelled_by": "patient"
        }}
    )
    if result.modified_count == 0:
        # Check if it already exists but is in a different state
        appt = await appointments_collection.find_one({"_id": ObjectId(appointment_id)})
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        raise HTTPException(status_code=400, detail=f"Cannot cancel appointment in its current state: {appt.get('status')}")
    return {"message": "Appointment cancelled successfully"}

@router.get("/appointments/status/{appointment_id}")
async def get_appt_status(appointment_id: str):
    """
    Fetch appointment status.
    """
    appt = await appointments_collection.find_one({"_id": ObjectId(appointment_id)})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    return {
        "id": str(appt["_id"]),
        "status": appt.get("status"),
        "doctor_id": str(appt.get("doctor_id")),
        "date": appt.get("date"),
        "slot_time": appt.get("slot_time")
    }
