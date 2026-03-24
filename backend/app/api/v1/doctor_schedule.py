from fastapi import APIRouter, HTTPException
from app.services.hardened_slot_service import HardenedSlotService
from app.database.collections import doctor_schedules_collection, doctors_collection, doctor_shifts_collection
from bson import ObjectId
from typing import List
from pydantic import BaseModel

router = APIRouter()

class ShiftCreate(BaseModel):
    shift_type: str
    start_time: str
    end_time: str
    slot_duration: int
    max_patients_per_slot: int
    max_emergency_per_slot: int
    max_total_patients_per_shift: int
    max_overflow_per_shift: int = 5

class ScheduleCreate(BaseModel):
    doctor_id: str
    location_id: str # MANDATORY: Tie schedule to branch
    day_of_week: int
    shifts: List[ShiftCreate]

@router.post("/schedule/hardened")
async def save_hardened_schedule(data: ScheduleCreate):
    """
    Save or update a doctor's weekly schedule and shifts.
    """
    sched_filter = {
        "doctor_id": ObjectId(data.doctor_id),
        "location_id": ObjectId(data.location_id),
        "day_of_week": data.day_of_week
    }
    sched_update = {
        "$set": {
            "doctor_id": ObjectId(data.doctor_id),
            "location_id": ObjectId(data.location_id),
            "day_of_week": data.day_of_week,
            "is_active": True,
            "updated_at": datetime.utcnow()
        }
    }
    
    # Check if doctor is mapped to this location
    from app.database.collections import doctor_locations_collection
    mapping = await doctor_locations_collection.find_one({
        "doctor_id": ObjectId(data.doctor_id),
        "location_id": ObjectId(data.location_id),
        "is_active": True
    })
    if not mapping:
         raise HTTPException(status_code=400, detail="Doctor is not assigned to this branch. Admin must assign them first.")

    res = await doctor_schedules_collection.update_one(sched_filter, sched_update, upsert=True)
    sched_id = res.upserted_id if res.upserted_id else (await doctor_schedules_collection.find_one(sched_filter))["_id"]

    # 2. Update Shifts
    # For simplicity in this improvement pass, we'll replace shifts for that schedule
    await doctor_shifts_collection.delete_many({"schedule_id": sched_id})
    
    for s in data.shifts:
        shift_doc = s.dict()
        shift_doc["schedule_id"] = sched_id
        shift_doc["current_total_bookings"] = 0
        shift_doc["current_overflow_count"] = 0
        await doctor_shifts_collection.insert_one(shift_doc)
        
    return {"message": "Hardened schedule and shifts updated successfully"}

@router.get("/doctors/{doctor_id}/availability")
async def get_availability(doctor_id: str, date: str):
    """
    Get availability grouped by location.
    """
    try:
        # returns List[{location_id, location_name, shifts: [...]}]
        data = await HardenedSlotService.get_full_availability(doctor_id, date)
        return {
            "date": date,
            "locations": data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/doctors/{doctor_id}/locations")
async def get_doctor_locations(doctor_id: str):
    """
    List all branches a doctor is assigned to.
    """
    from app.database.collections import doctor_locations_collection, locations_collection
    mappings = await doctor_locations_collection.find({"doctor_id": ObjectId(doctor_id), "is_active": True}).to_list(20)
    
    results = []
    for m in mappings:
        loc = await locations_collection.find_one({"_id": m["location_id"]})
        if loc:
            loc["id"] = str(loc["_id"])
            loc["hospital_id"] = str(loc["hospital_id"])
            results.append(loc)
    return results
