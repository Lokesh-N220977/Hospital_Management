from datetime import datetime
from typing import List, Optional
from app.database import client, db
from app.database.collections import (
    appointments_collection, 
    doctor_slots_collection, 
    doctor_shifts_collection
)
from app.services.hardened_slot_service import classify_priority
from bson import ObjectId

class HardenedBookingService:
    @staticmethod
    async def book_appointment(doctor_id: str, patient_id: str, location_id: str, date_str: str, shift_id: str, symptoms: List[str], idempotency_key: str):
        """
        Hardened, transaction-safe booking engine with location support.
        """
        # 1. Start Session for Transaction
        async with await client.start_session() as session:
            async with session.start_transaction():
                # 2. Idempotency Check
                existing = await appointments_collection.find_one(
                    {"idempotency_key": idempotency_key},
                    session=session
                )
                if existing:
                    return HardenedBookingService._map_appt(existing)

                # 3. Validate Doctor-Location Mapping
                from app.database.collections import doctor_locations_collection
                mapping = await doctor_locations_collection.find_one({
                    "doctor_id": ObjectId(doctor_id),
                    "location_id": ObjectId(location_id),
                    "is_active": True
                }, session=session)
                
                if not mapping:
                    raise Exception("Doctor is not assigned to this branch/location.")

                # 4. Classify Priority
                priority_level, priority_score = classify_priority(symptoms)

                # 5. Find all slots for this branch/shift sorted by time
                slots = await doctor_slots_collection.find(
                    {
                        "doctor_id": ObjectId(doctor_id),
                        "location_id": ObjectId(location_id),
                        "date": date_str,
                        "shift_id": ObjectId(shift_id)
                    },
                    session=session
                ).sort("slot_time", 1).to_list(100)

                target_slot = None
                is_overflow = False

                for slot in slots:
                    if priority_level == "NORMAL":
                        # Try atomic slot update for NORMAL
                        res = await doctor_slots_collection.find_one_and_update(
                            {
                                "_id": slot["_id"],
                                "location_id": ObjectId(location_id),
                                "booked_normal_count": {"$lt": slot["max_normal"]}
                            },
                            {"$inc": {"booked_normal_count": 1}},
                            session=session,
                            return_document=True
                        )
                        if res:
                            target_slot = res
                            break
                    else:
                        # Try atomic slot update for URGENT/EMERGENCY
                        res = await doctor_slots_collection.find_one_and_update(
                            {
                                "_id": slot["_id"],
                                "location_id": ObjectId(location_id),
                                "booked_emergency_count": {"$lt": slot["max_emergency"]}
                            },
                            {"$inc": {"booked_emergency_count": 1}},
                            session=session,
                            return_document=True
                        )
                        if res:
                            target_slot = res
                            break

                # 6. Handle Shift-Level Enforcement & Overflow
                shift = await doctor_shifts_collection.find_one({"_id": ObjectId(shift_id)}, session=session)
                if not shift:
                    raise Exception("Shift not found")

                if not target_slot:
                    if priority_level == "EMERGENCY":
                        # EMERGENCY Overflow logic
                        if shift.get("current_overflow_count", 0) < shift.get("max_overflow_per_shift", 5):
                            # Allow overflow in the first slot of the shift (for queueing)
                            target_slot = slots[0]
                            is_overflow = True
                            await doctor_shifts_collection.update_one(
                                {"_id": shift["_id"]},
                                {"$inc": {"current_overflow_count": 1}},
                                session=session
                            )
                        else:
                            raise Exception("Emergency capacity full for this shift.")
                    else:
                        raise Exception("All normal slots full for this shift.")

                # 7. Increment Shift Total Bookings
                if not is_overflow:
                    if shift.get("current_total_bookings", 0) >= shift.get("max_total_patients_per_shift", 20):
                        raise Exception("Shift total capacity reached.")
                    
                    await doctor_shifts_collection.update_one(
                        {"_id": shift["_id"]},
                        {"$inc": {"current_total_bookings": 1}},
                        session=session
                    )

                # 8. Insert Appointment
                new_appt = {
                    "patient_id": ObjectId(patient_id),
                    "doctor_id": ObjectId(doctor_id),
                    "location_id": ObjectId(location_id),
                    "slot_id": target_slot["_id"],
                    "priority_level": priority_level,
                    "priority_score": priority_score,
                    "symptoms": symptoms,
                    "queue_position": 0, # To be updated
                    "estimated_wait_time": 0,
                    "is_overflow": is_overflow,
                    "idempotency_key": idempotency_key,
                    "status": "BOOKED",
                    "created_at": datetime.utcnow()
                }
                
                insert_res = await appointments_collection.insert_one(new_appt, session=session)
                new_appt_id = insert_res.inserted_id

                # 9. Optimized Range-Based Queue Shift
                await appointments_collection.update_many(
                    {
                        "location_id": ObjectId(location_id),
                        "slot_id": target_slot["_id"],
                        "status": "BOOKED",
                        "_id": {"$ne": new_appt_id},
                        "$or": [
                            {"priority_score": {"$lt": priority_score}},
                            {
                                "priority_score": priority_score,
                                "$or": [
                                    {"created_at": {"$gt": new_appt["created_at"]}},
                                    {
                                        "created_at": new_appt["created_at"],
                                        "_id": {"$gt": new_appt_id}
                                    }
                                ]
                            }
                        ]
                    },
                    {"$inc": {"queue_position": 1}},
                    session=session
                )

                # 10. Calculate My Position
                count_before = await appointments_collection.count_documents(
                    {
                        "location_id": ObjectId(location_id),
                        "slot_id": target_slot["_id"],
                        "status": "BOOKED",
                        "$or": [
                            {"priority_score": {"$gt": priority_score}},
                            {
                                "priority_score": priority_score,
                                "$or": [
                                    {"created_at": {"$lt": new_appt["created_at"]}},
                                    {
                                        "created_at": new_appt["created_at"],
                                        "_id": {"$lt": new_appt_id}
                                    }
                                ]
                            }
                        ]
                    },
                    session=session
                )
                
                my_pos = count_before + 1
                wait_time = count_before * 10 # 10 min avg

                await appointments_collection.update_one(
                    {"_id": new_appt_id},
                    {"$set": {"queue_position": my_pos, "estimated_wait_time": wait_time}},
                    session=session
                )

                final_appt = await appointments_collection.find_one({"_id": new_appt_id}, session=session)
                return HardenedBookingService._map_appt(final_appt)

    @staticmethod
    async def cancel_appointment(appointment_id: str):
        """
        Transactional cancellation flow.
        """
        async with await client.start_session() as session:
            async with session.start_transaction():
                appt = await appointments_collection.find_one({"_id": ObjectId(appointment_id)}, session=session)
                if not appt or appt["status"] == "CANCELLED":
                    return False

                # 1. Update Status
                await appointments_collection.update_one(
                    {"_id": appt["_id"]},
                    {"$set": {"status": "CANCELLED"}},
                    session=session
                )

                # 2. Decrement Counts
                if appt.get("is_overflow"):
                    # Decrement overflow counter in shift
                    slot = await doctor_slots_collection.find_one({"_id": appt["slot_id"]}, session=session)
                    if slot:
                        await doctor_shifts_collection.update_one(
                            {"_id": slot["shift_id"]},
                            {"$inc": {"current_overflow_count": -1}},
                            session=session
                        )
                else:
                    # Decrement normal/emergency slot counter
                    if appt["priority_level"] == "EMERGENCY":
                         await doctor_slots_collection.update_one(
                            {"_id": appt["slot_id"]},
                            {"$inc": {"booked_emergency_count": -1}},
                            session=session
                        )
                    else:
                         await doctor_slots_collection.update_one(
                            {"_id": appt["slot_id"]},
                            {"$inc": {"booked_normal_count": -1}},
                            session=session
                        )
                    
                    # Decrement shift total bookings
                    slot = await doctor_slots_collection.find_one({"_id": appt["slot_id"]}, session=session)
                    if slot:
                        await doctor_shifts_collection.update_one(
                            {"_id": slot["shift_id"]},
                            {"$inc": {"current_total_bookings": -1}},
                            session=session
                        )

                # 3. Optimized Range-Based Queue Adjustment
                # Decrement queue_position for all with position > cancelled_position
                await appointments_collection.update_many(
                    {
                        "slot_id": appt["slot_id"],
                        "status": "BOOKED",
                        "queue_position": {"$gt": appt["queue_position"]}
                    },
                    {"$inc": {"queue_position": -1}},
                    session=session
                )
                
                return True

    @staticmethod
    def _map_appt(appt):
        if not appt: return None
        appt["id"] = str(appt["_id"])
        appt["patient_id"] = str(appt["patient_id"])
        appt["doctor_id"] = str(appt["doctor_id"])
        appt["slot_id"] = str(appt["slot_id"])
        return appt
