from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.models.dynamic_scheduling import DoctorSchedule, Appointment
from app.services.dynamic_slot_service import DynamicSlotService
from app.database.collections import doctor_schedules_collection, appointments_collection

router = APIRouter()

@router.get("/slots")
async def get_dynamic_slots(
    doctor_id: str = Query(...), 
    date: str = Query(...)
):
    """
    Fetch dynamically generated slots for a doctor/date.
    """
    try:
        slots = await DynamicSlotService.generate_slots(doctor_id, date)
        return slots
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/appointments")
async def create_appointment(data: Appointment):
    """
    Book an appointment using dynamic availability checks.
    """
    try:
        # Atomic booking check inside service
        appointment_id = await DynamicSlotService.book_appointment(
            str(data.doctor_id),
            data.date,
            data.slot_time,
            str(data.patient_id),
            data.idempotency_key,
            data.symptoms
        )
        return {"id": appointment_id, "message": "Appointment booked successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/schedules/{doctor_id}")
async def get_doctor_schedules(doctor_id: str, day_of_week: Optional[int] = Query(None)):
    """
    Fetch all active schedules for a doctor, optionally filtering by day.
    """
    query = {"doctor_id": ObjectId(doctor_id)}
    if day_of_week is not None:
        query["day_of_week"] = day_of_week
        
    schedules = await doctor_schedules_collection.find(query).to_list(100)
    
    for s in schedules:
        s["_id"] = str(s["_id"])
        s["doctor_id"] = str(s["doctor_id"])
        if "location_id" in s:
            del s["location_id"]
        
    return schedules

@router.post("/schedules")
async def upsert_schedule(data: DoctorSchedule):
    """
    Create or update a doctor's schedule for a specific day.
    """
    query = {
        "doctor_id": ObjectId(data.doctor_id),
        "day_of_week": data.day_of_week
    }
    
    schedule_dict = data.dict()
    schedule_dict["doctor_id"] = ObjectId(data.doctor_id)
    schedule_dict["updated_at"] = datetime.utcnow()

    # Use upsert to handle both create and update
    await doctor_schedules_collection.update_one(
        query,
        {"$set": schedule_dict},
        upsert=True
    )
    
    return {"message": "Schedule updated successfully"}
