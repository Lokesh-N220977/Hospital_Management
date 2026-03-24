import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add parent directory to sys.path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import client, db
from app.database.collections import (
    doctors_collection, 
    doctor_schedules_collection, 
    doctor_shifts_collection, 
    doctor_slots_collection,
    appointments_collection
)
from app.services.hardened_booking_service import HardenedBookingService
from app.services.hardened_slot_service import HardenedSlotService
from bson import ObjectId

async def setup_test_data():
    print("Setting up test doctor and schedule...")
    # 1. Clear existing test data
    test_doc_name = "STRESS_TEST_DOCTOR"
    await doctors_collection.delete_many({"name": test_doc_name})
    
    # 2. Create Doctor
    doc_res = await doctors_collection.insert_one({
        "name": test_doc_name,
        "specialization": "Cardiology",
        "is_active": True,
        "verification_status": "VERIFIED"
    })
    doc_id = doc_res.inserted_id
    
    # 3. Create Schedule (Today)
    target_date = datetime.now().strftime("%Y-%m-%d")
    day_of_week = datetime.now().weekday()
    
    sched_res = await doctor_schedules_collection.insert_one({
        "doctor_id": doc_id,
        "day_of_week": day_of_week,
        "is_active": True
    })
    sched_id = sched_res.inserted_id
    
    # 4. Create Shift (Morning)
    shift_res = await doctor_shifts_collection.insert_one({
        "schedule_id": sched_id,
        "shift_type": "MORNING",
        "start_time": "09:00",
        "end_time": "10:00",
        "slot_duration": 15,
        "max_patients_per_slot": 2,
        "max_emergency_per_slot": 1,
        "max_total_patients_per_shift": 5,
        "max_overflow_per_shift": 2,
        "current_total_bookings": 0,
        "current_overflow_count": 0
    })
    shift_id = shift_res.inserted_id
    
    # 5. Generate Slots
    await HardenedSlotService.generate_slots(str(shift_id), str(doc_id), target_date)
    
    return str(doc_id), str(shift_id), target_date

async def test_concurrency(doc_id, shift_id, target_date):
    print(f"\n--- Starting Concurrency Test (10 simultaneous requests) ---")
    
    tasks = []
    for i in range(10):
        # Mixed priorities
        symptoms = ["chest pain"] if i < 3 else ["fever"]
        tasks.append(
            HardenedBookingService.book_appointment(
                doc_id, 
                str(ObjectId()), # Random patient 
                target_date, 
                shift_id, 
                symptoms, 
                f"IDEM_{i}_{datetime.now().timestamp()}"
            )
        )
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    success_count = 0
    fail_count = 0
    for r in results:
        if isinstance(r, Exception):
            # print(f"Booking error: {r}")
            fail_count += 1
        else:
            success_count += 1
            
    print(f"Results: Successes={success_count}, Failures={fail_count}")
    
    # Check shift counts
    shift = await doctor_shifts_collection.find_one({"_id": ObjectId(shift_id)})
    print(f"Shift counts: Total={shift['current_total_bookings']}, Overflow={shift['current_overflow_count']}")
    
    # Check queue integrity in the first slot
    slots = await doctor_slots_collection.find({"shift_id": ObjectId(shift_id)}).sort("slot_time", 1).to_list(10)
    for slot in slots:
        appts = await appointments_collection.find({"slot_id": slot["_id"], "status": "BOOKED"}).sort([("queue_position", 1)]).to_list(100)
        print(f"Slot {slot['slot_time']}: {len(appts)} appointments")
        positions = [a["queue_position"] for a in appts]
        print(f"  Positions: {positions}")
        priorities = [a["priority_level"] for a in appts]
        print(f"  Priorities: {priorities}")
        
        # Verify no duplicate positions
        if len(set(positions)) != len(positions):
            print("  [ERROR] DUPLICATE QUEUE POSITIONS DETECTED!")
        else:
            print("  [OK] Queue positions are unique.")

async def run_tests():
    try:
        doc_id, shift_id, target_date = await setup_test_data()
        await test_concurrency(doc_id, shift_id, target_date)
    except Exception as e:
        print(f"Test execution failed: {e}")
    finally:
        # Cleanup
        # await doctors_collection.delete_many({"name": "STRESS_TEST_DOCTOR"})
        pass

if __name__ == "__main__":
    asyncio.run(run_tests())
