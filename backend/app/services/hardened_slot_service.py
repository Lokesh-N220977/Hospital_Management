from datetime import datetime, timedelta, timezone
from typing import List, Tuple
from app.database import db
from app.database.collections import doctor_slots_collection, doctor_shifts_collection, doctor_schedules_collection
from bson import ObjectId

def classify_priority(symptoms: List[str]) -> Tuple[str, int]:
    """
    Classifies symptoms into (level, score).
    EMERGENCY = 3, URGENT = 2, NORMAL = 1
    """
    emergency_set = {"chest pain", "breathing difficulty", "unconscious"}
    urgent_set = {"high fever", "severe pain"}

    symptoms_lower = {s.lower().strip() for s in symptoms}

    if symptoms_lower.intersection(emergency_set):
        return "EMERGENCY", 3
    elif symptoms_lower.intersection(urgent_set):
        return "URGENT", 2
    return "NORMAL", 1

class HardenedSlotService:
    @staticmethod
    async def generate_slots(shift_id: str, doctor_id: str, location_id: str, target_date: str):
        """
        Generates slots for a specific shift, date, and branch.
        target_date: "YYYY-MM-DD"
        """
        shift = await doctor_shifts_collection.find_one({"_id": ObjectId(shift_id)})
        if not shift:
            return []

        start_time = datetime.strptime(shift["start_time"], "%H:%M")
        end_time = datetime.strptime(shift["end_time"], "%H:%M")
        duration = shift["slot_duration"]

        current = start_time
        generated_slots = []

        while current < end_time:
            slot_time = current.strftime("%H:%M")
            
            # Unique index: (doctor_id, location_id, shift_id, date, slot_time)
            slot_doc = {
                "doctor_id": ObjectId(doctor_id),
                "location_id": ObjectId(location_id),
                "shift_id": ObjectId(shift_id),
                "date": target_date,
                "slot_time": slot_time,
                "max_normal": shift["max_patients_per_slot"],
                "max_emergency": shift["max_emergency_per_slot"],
                "booked_normal_count": 0,
                "booked_emergency_count": 0
            }

            try:
                # Insert if not exists (atomic unique index check)
                await doctor_slots_collection.insert_one(slot_doc)
                slot_doc["id"] = str(slot_doc["_id"])
                generated_slots.append(slot_doc)
            except Exception: # DuplicateKeyError 
                # Fetch existing if duplicate
                existing = await doctor_slots_collection.find_one({
                    "doctor_id": ObjectId(doctor_id),
                    "location_id": ObjectId(location_id),
                    "shift_id": ObjectId(shift_id),
                    "date": target_date,
                    "slot_time": slot_time
                })
                if existing:
                    existing["id"] = str(existing["_id"])
                    generated_slots.append(existing)

            current += timedelta(minutes=duration)

        return generated_slots

    @staticmethod
    async def get_availability_by_location(doctor_id: str, location_id: str, target_date: str):
        """
        Returns availability for a specific doctor at a specific branch.
        """
        dt = datetime.strptime(target_date, "%Y-%m-%d")
        day_of_week = dt.weekday()
        
        schedule = await doctor_schedules_collection.find_one({
            "doctor_id": ObjectId(doctor_id),
            "location_id": ObjectId(location_id), # Location specific schedule
            "day_of_week": day_of_week,
            "is_active": True
        })
        
        if not schedule:
            return []

        shifts = await doctor_shifts_collection.find({"schedule_id": schedule["_id"]}).to_list(10)
        
        result_shifts = []
        for shift in shifts:
            slots = await HardenedSlotService.generate_slots(str(shift["_id"]), doctor_id, location_id, target_date)
            
            avail_normal = sum(max(0, s["max_normal"] - s["booked_normal_count"]) for s in slots)
            avail_emergency = sum(max(0, s["max_emergency"] - s["booked_emergency_count"]) for s in slots)
            
            result_shifts.append({
                "shift_type": shift["shift_type"],
                "shift_id": str(shift["_id"]),
                "summary": {
                    "available_normal": avail_normal,
                    "available_emergency": avail_emergency
                },
                "slots": [
                    {
                        "id": str(s["_id"]),
                        "time": s["slot_time"],
                        "available_normal": max(0, s["max_normal"] - s["booked_normal_count"]),
                        "available_emergency": max(0, s["max_emergency"] - s["booked_emergency_count"])
                    } for s in slots
                ]
            })
            
        return result_shifts

    @staticmethod
    async def get_full_availability(doctor_id: str, target_date: str):
        """
        Returns availability grouped by all locations the doctor works at.
        """
        from app.database.collections import doctor_locations_collection, locations_collection
        
        # 1. Get all branches for the doctor
        mappings = await doctor_locations_collection.find({"doctor_id": ObjectId(doctor_id), "is_active": True}).to_list(20)
        
        results = []
        for mapping in mappings:
            loc_id = mapping["location_id"]
            location = await locations_collection.find_one({"_id": loc_id})
            
            if not location:
                continue
                
            shifts = await HardenedSlotService.get_availability_by_location(doctor_id, str(loc_id), target_date)
            
            results.append({
                "location_id": str(loc_id),
                "location_name": location["name"],
                "address": f"{location['address']}, {location['city']}",
                "shifts": shifts
            })
            
        return results
