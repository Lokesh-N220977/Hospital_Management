from datetime import datetime
from app.database.collections import (
    appointments_collection, 
    doctor_slots_collection, 
    doctor_schedules_collection
)
from app.services.priority_service import PriorityService
from app.services.slot_service import SlotService
from bson import ObjectId

class BookingEngine:
    @staticmethod
    async def book_appointment(doctor_id: str, patient_id: str, date: str, symptoms: list):
        """
        Production-grade booking engine.
        Handles:
        1. Priority Classification
        2. Slot finding (with normal/emergency limits)
        3. Overflow for emergency
        4. Queue position and wait time calculation
        """
        # 1. Classify Priority
        priority = PriorityService.classify_priority(symptoms)
        
        # 2. Ensure slots are generated for that date
        all_slots = await SlotService.generate_slots_for_date(doctor_id, date)
        
        if not all_slots:
            raise Exception("No active schedule found for this doctor on the selected date.")

        target_slot = None
        is_overflow = False
        
        # 3. Find available slot based on priority
        for slot in all_slots:
            if priority == "EMERGENCY":
                # Emergency can fit in any slot if count < max_emergency
                if slot.get("booked_emergency_count", 0) < slot.get("max_emergency", 1):
                    target_slot = slot
                    break
            else:
                # Normal/Urgent fit if booked_normal < max_normal
                if slot.get("booked_normal_count", 0) < slot.get("max_normal", 1):
                    target_slot = slot
                    break
        
        # 4. Handle Overflow (Emergency only)
        if not target_slot and priority == "EMERGENCY":
            # Try to find ANY slot in the SAME shift with space, or allow overflow in first slot
            # For now, let's allow overflow in the FIRST slot of the shift if all are full
            target_slot = all_slots[0]
            is_overflow = True

        if not target_slot:
            raise Exception("No slots available for this doctor on the selected date. Please try another shift or date.")

        # 5. Create Appointment
        appointment_id = str(ObjectId())
        
        # 6. Calculate Queue Position for this slot
        # Priority rule: EMERGENCY > URGENT > NORMAL
        # Sorting: priority DESC, booking_time ASC
        
        # Insert first, then recalculate
        new_appointment = {
            "_id": ObjectId(appointment_id),
            "doctor_id": doctor_id,
            "patient_id": patient_id,
            "date": date,
            "time": target_slot["slot_time"],
            "slot_id": target_slot["id"],
            "priority_level": priority,
            "symptoms": symptoms,
            "status": "BOOKED",
            "is_overflow": is_overflow,
            "booking_time": datetime.utcnow(),
        }
        
        await appointments_collection.insert_one(new_appointment)
        
        # 7. Update Slot counts
        if priority == "EMERGENCY":
            await doctor_slots_collection.update_one(
                {"_id": ObjectId(target_slot["id"])},
                {"$inc": {"booked_emergency_count": 1}}
            )
        else:
            await doctor_slots_collection.update_one(
                {"_id": ObjectId(target_slot["id"])},
                {"$inc": {"booked_normal_count": 1}}
            )

        # 8. Recalculate Queue Positions for this slot
        queue_info = await BookingEngine.refresh_queue_positions(target_slot["id"])
        
        # Find current appointment in queue_info
        my_info = next((item for item in queue_info if item["id"] == appointment_id), None)
        
        return {
            "appointment_id": appointment_id,
            "assigned_slot_time": target_slot["slot_time"],
            "shift_type": target_slot["shift_type"],
            "queue_position": my_info["queue_position"] if my_info else 0,
            "estimated_wait_time": my_info["estimated_wait_time"] if my_info else 0,
            "priority": priority,
            "is_overflow": is_overflow
        }

    @staticmethod
    async def refresh_queue_positions(slot_id: str):
        """
        Recalculates positions and wait times for all appointments in a slot.
        """
        appointments = await appointments_collection.find({
            "slot_id": slot_id,
            "status": "BOOKED"
        }).to_list(100)

        # Priority weights for sorting
        priority_map = {"EMERGENCY": 3, "URGENT": 2, "NORMAL": 1}
        
        # Sort by priority DESC, then booking_time ASC
        sorted_appointments = sorted(
            appointments,
            key=lambda x: (priority_map.get(x["priority_level"], 1), -x["booking_time"].timestamp()),
            reverse=True
        )

        avg_consultation_time = 15 # minutes
        queue_results = []

        for i, appt in enumerate(sorted_appointments):
            pos = i + 1
            wait_time = i * avg_consultation_time
            
            await appointments_collection.update_one(
                {"_id": appt["_id"]},
                {"$set": {
                    "queue_position": pos,
                    "estimated_wait_time": wait_time
                }}
            )
            
            queue_results.append({
                "id": str(appt["_id"]),
                "queue_position": pos,
                "estimated_wait_time": wait_time
            })
            
        return queue_results
