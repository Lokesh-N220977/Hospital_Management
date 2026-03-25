from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.services.dynamic_slot_service import DynamicSlotService
SlotService = DynamicSlotService
from app.database.collections import doctor_schedules_collection, doctors_collection, doctor_shifts_collection, doctor_slots_collection
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
        
    # 3. Trigger slot re-generation
    await SlotService.regenerate_slots_on_schedule_update(str(data.doctor_id), str(data.location_id))

    return {"message": "Hardened schedule and shifts updated successfully"}

@router.get("/schedule/hardened")
async def get_hardened_schedule(doctor_id: str, location_id: str, day_of_week: int):
    """
    Fetch a doctor's schedule and shifts for a specific branch and day.
    """
    try:
        from bson import ObjectId
        schedule = await doctor_schedules_collection.find_one({
            "doctor_id": ObjectId(doctor_id),
            "location_id": ObjectId(location_id),
            "day_of_week": int(day_of_week),
            "is_active": True
        })
        
        if not schedule:
            return {"schedule": None, "shifts": []}
            
        shifts = await doctor_shifts_collection.find({"schedule_id": schedule["_id"]}).to_list(10)
        
        # Clean up shifts for JSON serialization
        for s in shifts:
            s["id"] = str(s["_id"])
            s["schedule_id"] = str(s["schedule_id"])
            del s["_id"]
            
        return {
            "schedule": {
                "id": str(schedule["_id"]),
                "doctor_id": str(schedule["doctor_id"]),
                "location_id": str(schedule["location_id"]),
                "day_of_week": schedule["day_of_week"]
            },
            "shifts": shifts
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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
    try:
        from app.database.collections import doctor_locations_collection, locations_collection
        from bson import ObjectId
        
        # Validate ObjectId
        try:
            d_oid = ObjectId(doctor_id)
        except Exception:
             raise HTTPException(status_code=400, detail="Invalid doctor ID format")

        mappings = await doctor_locations_collection.find({"doctor_id": d_oid, "is_active": True}).to_list(100)
        
        results = []
        for m in mappings:
            loc_id = m.get("location_id")
            if not loc_id: continue
            
            # Find the actual branch/location document
            loc_doc = await locations_collection.find_one({"_id": ObjectId(loc_id) if isinstance(loc_id, str) else loc_id})
            if loc_doc:
                # ONLY return a clean dict with serializable fields to avoid 'Database' object errors
                results.append({
                    "id": str(loc_doc.get("_id", "")),
                    "hospital_id": str(loc_doc.get("hospital_id", "")),
                    "name": str(loc_doc.get("name", "Unknown Branch")),
                    "city": str(loc_doc.get("city", "")),
                    "address": str(loc_doc.get("address", ""))
                })
        return results
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_doctor_locations: {str(e)}")
        # Log to absolute path for debugging
        try:
            with open(r"c:\Users\happy\Desktop\hospital_project\backend\error_log.txt", "a") as f:
                import traceback
                traceback.print_exc(file=f)
        except: pass
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/locations")
async def get_all_locations():
    """
    List all active hospital branches.
    """
    try:
        from app.database.collections import locations_collection
        locs = await locations_collection.find({"is_active": True}).to_list(100)
        results = []
        for loc in locs:
            results.append({
                "id": str(loc["_id"]),
                "hospital_id": str(loc.get("hospital_id", "")),
                "name": loc.get("name", "Unknown Branch"),
                "city": loc.get("city", "Unknown City"),
                "address": loc.get("address", "")
            })
        return results
    except Exception as e:
        print(f"Error in get_all_locations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
