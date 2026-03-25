import asyncio
import sys
import os
from datetime import datetime, timedelta
from bson import ObjectId

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.database import db
from app.database.collections import (
    doctor_schedules_collection,
    appointments_collection,
    doctors_collection,
    patients_collection
)
from app.services.dynamic_slot_service import DynamicSlotService

async def test_dynamic_scheduling():
    print("--- Starting Dynamic Scheduling Verification ---")
    
    # 1. Setup Test Data
    doctor = await doctors_collection.find_one({"email": "doctor1@hospital.com"})
    patient = await patients_collection.find_one({})
    
    if not (doctor and patient):
        print("Missing test data. Ensure doctors and patients are seeded.")
        return

    d_id = str(doctor["_id"])
    p_id = str(patient["_id"])
    
    # Use today's day of week
    today = datetime.now()
    day_of_week = today.weekday()
    date_str = today.strftime("%Y-%m-%d")

    print(f"Testing for Doctor: {doctor['name']} for Date: {date_str}")

    # 2. Create a Schedule
    print("\n[Step 1] Creating a schedule for today...")
    schedule_data = {
        "doctor_id": ObjectId(d_id),
        "day_of_week": day_of_week,
        "start_time": "09:00",
        "end_time": "11:00",
        "slot_duration": 30,
        "break_start": "10:00",
        "break_end": "10:30",
        "max_patients_per_slot": 1,
        "is_active": True
    }
    
    await doctor_schedules_collection.update_one(
        {"doctor_id": ObjectId(d_id), "day_of_week": day_of_week},
        {"$set": schedule_data},
        upsert=True
    )
    print("Schedule created: 09:00-11:00 with 30min slots and 10:00-10:30 break.")

    # 3. Generate Slots
    print("\n[Step 2] Generating slots dynamically...")
    slots = await DynamicSlotService.generate_slots(d_id, date_str)
    
    print(f"Generated {len(slots)} slots:")
    for s in slots:
        print(f"  - {s['time']}: Available={s['available']}, Booked={s['booked']}")
    
    # Expectation: 09:00, 09:30, 10:30 (10:00 is break start)
    times = [s['time'] for s in slots]
    if "10:00" in times:
        print("FAILURE: Break time 10:00 should have been skipped.")
    else:
        print("SUCCESS: Break time 10:00 was skipped.")

    # 4. Test Booking
    print("\n[Step 3] Booking an appointment for 09:00...")
    try:
        appt_id = await DynamicSlotService.book_appointment(d_id, date_str, "09:00", p_id)
        print(f"Booking success! Appointment ID: {appt_id}")
    except Exception as e:
        print(f"Booking failure: {e}")

    # 5. Verify Availability Change
    print("\n[Step 4] Verifying availability change...")
    slots_after = await DynamicSlotService.generate_slots(d_id, date_str)
    slot_0900 = next((s for s in slots_after if s["time"] == "09:00"), None)
    
    if slot_0900 and slot_0900["available"] == 0 and slot_0900["booked"] == 1:
        print("SUCCESS: Availability updated correctly (09:00 is now FULL).")
    else:
        print(f"FAILURE: Availability mismatch for 09:00. Received: {slot_0900}")

    # 6. Test Double Booking Prevention
    print("\n[Step 5] Testing double booking prevention (booking 09:00 again)...")
    try:
        await DynamicSlotService.book_appointment(d_id, date_str, "09:00", p_id)
        print("FAILURE: Should not have allowed booking a full slot.")
    except Exception as e:
        print(f"SUCCESS: Prevented double booking. Error: {e}")

    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    asyncio.run(test_dynamic_scheduling())
