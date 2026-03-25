import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hospital_db")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

async def verify():
    print("Starting Multi-Branch Verification...")
    
    # 1. Setup Test Data
    # Get any doctor
    doctor = await db.doctors.find_one({})
    if not doctor:
        print("No doctor found for testing.")
        return
    
    doctor_id = doctor["_id"]
    print(f"Testing with Doctor: {doctor.get('name', 'Unknown')} ({doctor_id})")

    # Get Hospital
    hospital = await db.hospitals.find_one()
    
    # Create a New Branch
    branch_name = "East Wing Clinic"
    existing_branch = await db.locations.find_one({"name": branch_name})
    if existing_branch:
        new_branch_id = existing_branch["_id"]
    else:
        new_branch = {
            "hospital_id": hospital["_id"],
            "name": branch_name,
            "address": "456 East Side Rd",
            "city": "Vijayawada",
            "state": "Andhra Pradesh",
            "is_active": True
        }
        br_result = await db.locations.insert_one(new_branch)
        new_branch_id = br_result.inserted_id
    
    print(f"Using Branch: {new_branch_id}")

    # Map Doctor to New Branch
    await db.doctor_locations.update_one(
        {"doctor_id": doctor_id, "location_id": new_branch_id},
        {"$set": {"is_primary": False, "is_active": True}},
        upsert=True
    )
    print("Mapped doctor to new branch.")

    # 2. Create Schedules for Tuesday (Day 1)
    target_date = "2026-03-31" # A Tuesday
    day_of_week = 1

    # Branch 1 Schedule (Morning)
    # Using existing Main Square Branch (from migration)
    main_branch = await db.locations.find_one({"name": "Main Square Branch"})
    main_branch_id = main_branch["_id"]
    
    # Create/Update Schedule for Branch 1
    await db.doctor_schedules.update_one(
        {"doctor_id": doctor_id, "location_id": main_branch_id, "day_of_week": day_of_week},
        {"$set": {"is_active": True, "updated_at": datetime.utcnow()}},
        upsert=True
    )
    sched1 = await db.doctor_schedules.find_one({"doctor_id": doctor_id, "location_id": main_branch_id, "day_of_week": day_of_week})
    
    await db.doctor_shifts.delete_many({"schedule_id": sched1["_id"]})
    shift1_doc = {
        "schedule_id": sched1["_id"],
        "shift_type": "MORNING",
        "start_time": "09:00",
        "end_time": "10:00",
        "slot_duration": 30,
        "max_patients_per_slot": 2,
        "max_emergency_per_slot": 1,
        "max_total_patients_per_shift": 10,
        "current_total_bookings": 0
    }
    await db.doctor_shifts.insert_one(shift1_doc)

    # Branch 2 Schedule (Afternoon)
    await db.doctor_schedules.update_one(
        {"doctor_id": doctor_id, "location_id": new_branch_id, "day_of_week": day_of_week},
        {"$set": {"is_active": True, "updated_at": datetime.utcnow()}},
        upsert=True
    )
    sched2 = await db.doctor_schedules.find_one({"doctor_id": doctor_id, "location_id": new_branch_id, "day_of_week": day_of_week})
    
    await db.doctor_shifts.delete_many({"schedule_id": sched2["_id"]})
    shift2_doc = {
        "schedule_id": sched2["_id"],
        "shift_type": "AFTERNOON",
        "start_time": "14:00",
        "end_time": "15:00",
        "slot_duration": 30,
        "max_patients_per_slot": 2,
        "max_emergency_per_slot": 1,
        "max_total_patients_per_shift": 10,
        "current_total_bookings": 0
    }
    await db.doctor_shifts.insert_one(shift2_doc)
    print("Created independent schedules for two branches.")

    # 3. Simulate "get_full_availability"
    from app.services.hardened_slot_service import HardenedSlotService
    avail = await HardenedSlotService.get_full_availability(str(doctor_id), target_date)
    
    print(f"Availability check: Found {len(avail)} locations.")
    for loc in avail:
        print(f" - {loc['location_name']}: {len(loc['shifts'])} shifts")
        for s in loc['shifts']:
            print(f"   * {s['shift_type']} ({s['summary']['available_normal']} slots)")

    if len(avail) >= 2:
        print("SUCCEEDED: Doctor availability correctly grouped by branch.")
    else:
        print("FAILED: Expected at least 2 locations in availability.")

    print("\nVerification completed.")

if __name__ == "__main__":
    asyncio.run(verify())
