from datetime import datetime, timedelta, date
from app.database.collections import doctor_slots_collection, doctor_schedules_collection
from app.models.slot_model import Slot
from bson import ObjectId

class SlotService:
    @staticmethod
    async def generate_slots_for_date(doctor_id: str, target_date: str):
        """
        Generates slots for a doctor on a specific date based on their active shifts.
        target_date: "YYYY-MM-DD"
        """
        # 1. Get the day of week (0=Monday, 6=Sunday)
        dt = datetime.strptime(target_date, "%Y-%m-%d")
        day_of_week = dt.weekday()

        # 2. Find active schedule for that day
        schedule_data = await doctor_schedules_collection.find_one({
            "doctor_id": doctor_id,
            "day_of_week": day_of_week,
            "is_active": True
        })

        if not schedule_data:
            return []

        generated_slots = []
        
        # 3. For each shift in the schedule
        for shift in schedule_data.get("shifts", []):
            shift_id = str(shift.get("_id") or ObjectId())
            shift_type = shift.get("shift_type")
            start_time_str = shift.get("start_time")
            end_time_str = shift.get("end_time")
            duration = shift.get("slot_duration", 15)
            max_normal = shift.get("max_patients_per_slot", 1)
            max_emergency = shift.get("max_emergency_per_slot", 1)

            # Convert times to datetime objects for calculation
            current_time = datetime.strptime(f"{target_date} {start_time_str}", "%Y-%m-%d %H:%M")
            end_time = datetime.strptime(f"{target_date} {end_time_str}", "%Y-%m-%d %H:%M")

            while current_time < end_time:
                slot_time_str = current_time.strftime("%H:%M")
                
                # Check if slot already exists to prevent duplicates
                existing_slot = await doctor_slots_collection.find_one({
                    "doctor_id": doctor_id,
                    "date": target_date,
                    "slot_time": slot_time_str
                })

                if not existing_slot:
                    new_slot = Slot(
                        doctor_id=doctor_id,
                        shift_id=shift_id,
                        shift_type=shift_type,
                        date=target_date,
                        slot_time=slot_time_str,
                        max_normal=max_normal,
                        max_emergency=max_emergency
                    )
                    
                    slot_dict = new_slot.dict()
                    result = await doctor_slots_collection.insert_one(slot_dict)
                    slot_dict["id"] = str(result.inserted_id)
                    generated_slots.append(slot_dict)
                else:
                    existing_slot["id"] = str(existing_slot["_id"])
                    generated_slots.append(existing_slot)

                current_time += timedelta(minutes=duration)

        return generated_slots

    @staticmethod
    async def get_available_slots(doctor_id: str, target_date: str):
        """
        Returns all slots for a doctor on a date.
        """
        slots = await doctor_slots_collection.find({
            "doctor_id": doctor_id,
            "date": target_date
        }).sort("slot_time", 1).to_list(100)
        
        for s in slots:
            s["id"] = str(s["_id"])
        
        return slots
