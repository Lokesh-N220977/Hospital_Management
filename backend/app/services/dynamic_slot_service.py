from datetime import datetime, timedelta
from typing import List, Optional
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from app.database.collections import doctor_schedules_collection, appointments_collection
from app.models.dynamic_scheduling import SlotAvailability, Appointment
from app.core.logger import logger

class DynamicSlotService:
    @staticmethod
    async def generate_slots(doctor_id: str, date_str: str) -> dict:
        """
        Dynamically generates slots from the doctor's schedule for a specific date.
        Subtracts booked appointments to calculate real-time availability.
        """
        # 1. Get day_of_week (0=Monday, 6=Sunday)
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        day_of_week = dt.weekday()
        # 2. Check if doctor is active/not deleted
        from app.database.collections import doctors_collection
        doctor = await doctors_collection.find_one({"_id": ObjectId(doctor_id)})
        if not doctor or doctor.get("is_deleted") or not doctor.get("available", True):
            logger.info(f"Doctor {doctor_id} is deleted or unavailable. No slots generated.")
            return {"slots": [], "reason": "OFFLINE", "message": "Doctor is currently offline or unavailable."}
            
        # 3. Check if doctor is on approved leave
        from app.database.collections import doctor_leaves_collection
        leave = await doctor_leaves_collection.find_one({
            "doctor_id": ObjectId(doctor_id),
            "date": date_str,
            "status": "approved"
        })
        if leave:
            logger.info(f"Doctor {doctor_id} is on approved leave on {date_str}. No slots generated.")
            return {
                "slots": [], 
                "reason": "LEAVE", 
                "message": f"Doctor is on approved leave for {date_str}.",
                "specialization": doctor.get("specialization")
            }

        # 4. Fetch active schedule
        schedule = await doctor_schedules_collection.find_one({
            "doctor_id": ObjectId(doctor_id),
            "day_of_week": day_of_week,
            "is_active": True
        })

        if not schedule:
            return {"slots": [], "reason": "NO_SCHEDULE", "message": "Doctor has no active schedule for this day."}

        start_time_str = schedule["start_time"]
        end_time_str = schedule["end_time"]
        slot_duration = schedule["slot_duration"]
        break_start = schedule.get("break_start")
        break_end = schedule.get("break_end")
        max_patients = schedule.get("max_patients_per_slot", 1)

        # 5. Fetch existing appointments
        appointments = await appointments_collection.find({
            "doctor_id": {"$in": [ObjectId(doctor_id), doctor_id]},
            "$or": [{"date": date_str}, {"appointment_date": date_str}],
            "status": {"$in": ["booked", "BOOKED", "completed", "no_show"]}
        }).to_list(1000)

        # 6. Generate slots logic
        def parse_time(t: str):
            return datetime.strptime(t, "%H:%M")

        start = parse_time(start_time_str)
        end = parse_time(end_time_str)
        b_start = parse_time(break_start) if break_start else None
        b_end = parse_time(break_end) if break_end else None

        slots = []
        current = start

        while current < end:
            slot_time = current.strftime("%H:%M")

            # Skip break time
            if b_start is not None and b_end is not None:
                if b_start <= current < b_end:
                    current += timedelta(minutes=slot_duration)
                    continue

            # Count bookings for this slot
            booked_count = 0
            for appt in appointments:
                appt_time = appt.get("slot_time") or appt.get("time")
                if not appt_time and appt.get("slot_start") and isinstance(appt["slot_start"], datetime):
                    appt_time = appt["slot_start"].strftime("%H:%M")
                
                if appt_time == slot_time and appt.get("status", "").lower() in ["booked", "completed", "no_show"]:
                    booked_count += 1

            available = max_patients - booked_count

            slots.append({
                "time": slot_time,
                "available": max(available, 0),
                "booked": booked_count,
                "is_full": available <= 0,
                "max_patients_per_slot": max_patients
            })

            current += timedelta(minutes=slot_duration)

        return {"slots": slots, "reason": "SUCCESS"}

    @staticmethod
    async def book_appointment(doctor_id: str, date_str: str, slot_time: str, patient_id: str, idempotency_key: Optional[str] = None, symptoms: Optional[List[str]] = None):
        """
        Atomic booking logic:
        1. Generate slots to ensure slot exists
        2. Check is_full status
        3. Hard verify count condition (prevent race conditions)
        4. Insert appointment catching DuplicateKeyError
        """
        # 1. Regenerate slots to check real-time availability
        res = await DynamicSlotService.generate_slots(doctor_id, date_str)
        slots = res.get("slots", [])
        
        target_slot = next((s for s in slots if s["time"] == slot_time), None)
        
        if not target_slot:
            raise Exception("Invalid slot")
        
        if target_slot["is_full"]:
            raise Exception("Slot is full")

        # 3. HARD PROTECTION: Recount appointments just before insert
        existing_count = await appointments_collection.count_documents({
            "doctor_id": ObjectId(doctor_id),
            "date": date_str,
            "slot_time": slot_time,
            "status": {"$in": ["booked", "BOOKED"]}
        })

        if existing_count >= target_slot["max_patients_per_slot"]:
            raise Exception("Slot just got full")

        # 4. Fetch Meta Data for Listing (Denormalization)
        from app.database.collections import doctors_collection, patients_collection
        doc_task = doctors_collection.find_one({"_id": ObjectId(doctor_id)})
        pat_id = ObjectId(patient_id) if len(patient_id) == 24 else patient_id
        pat_task = patients_collection.find_one({"_id": pat_id})
        
        import asyncio
        doc, pat = await asyncio.gather(doc_task, pat_task)

        # 4.5. UNIQUE CONSTRAINT: One patient can book one doctor only once per day
        # (Allows different doctors, allows family members independently)
        existing_patient_booking = await appointments_collection.find_one({
            "doctor_id": ObjectId(doctor_id),
            "patient_id": pat_id,
            "date": date_str,
            "status": {"$in": ["booked", "BOOKED"]}
        })
        if existing_patient_booking:
            doctor_name = doc.get("name", "this doctor")
            raise Exception(f"Patient {pat.get('name', '')} already has an active appointment with {doctor_name} on {date_str}. Please cancel it before re-booking a different time.")

        # 5. Insert Appointment
        slot_datetime = datetime.strptime(f"{date_str} {slot_time}", "%Y-%m-%d %H:%M")
        new_appointment = {
            "doctor_id": ObjectId(doctor_id),
            "patient_id": pat_id,
            "doctor_name": doc.get("name", "Doctor") if doc else "Doctor",
            "patient_name": pat.get("name", "Patient") if pat else "Patient",
            "specialization": doc.get("specialization", "") if doc else "",
            "date": date_str,
            "appointment_date": date_str, # Double mapping for legacy
            "slot_time": slot_time,
            "slot_start": slot_datetime,
            "status": "booked",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        if idempotency_key:
            new_appointment["idempotency_key"] = idempotency_key
        if symptoms:
            new_appointment["symptoms"] = symptoms
            new_appointment["reason"] = ", ".join(symptoms) if isinstance(symptoms, list) else str(symptoms)

        try:
            result = await appointments_collection.insert_one(new_appointment)
            return str(result.inserted_id)
        except DuplicateKeyError:
            raise Exception("Duplicate booking prevented")
