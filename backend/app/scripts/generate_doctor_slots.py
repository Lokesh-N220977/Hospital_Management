import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add the project root to sys.path to allow absolute imports of app
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)

# Import dependencies after sys.path is updated
from app.database.collections import doctors_collection, doctor_schedules_collection
from app.services.scheduling_service import create_daily_slots

async def setup_schedules_and_slots():
    print("--- STARTING SCHEDULE & SLOT GENERATION ---")
    
    # 1. Fetch available doctors
    doctors = await doctors_collection.find().to_list(length=10)
    if not doctors:
        print("[FAIL] No doctors found in database. Please run seed_data.py first.")
        return

    # 2. Add sample schedules for each doctor
    # Each doctor will work Monday - Friday: 09:00 to 17:00
    working_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    
    print(f"Setting up schedules for {len(doctors)} doctors...")
    await doctor_schedules_collection.delete_many({})  # Clear old schedules

    for doc in doctors:
        doc_id = str(doc["user_id"])  # Important to use the user_id (or profile _id) based on system preference
        # Based on scheduling_service.py: it uses doctor_id from parameter
        # Let's check consistency: BookAppointment uses the Profile ID or User ID?
        # Usually frontend hits GET /doctors and uses the Profile ID.
        # But our scheduling_service expects "doctor_id". 
        # I'll use the profile '_id' for slot identification.
        
        doctor_ref_id = str(doc["_id"])
        
        for day in working_days:
            schedule = {
                "doctor_id": doctor_ref_id,
                "day": day,
                "start_time": "09:00",
                "end_time": "16:00",  # Shorter day to allow slots
                "slot_duration": 30
            }
            await doctor_schedules_collection.insert_one(schedule)
        
        print(f"Schedules created for {doc['name']} ({doc['specialization']})")

        # 3. Generate slots for the next 7 days
        today = datetime.now()
        for i in range(7):
            target_date = (today + timedelta(days=i)).strftime("%Y-%m-%d")
            await create_daily_slots(doctor_ref_id, target_date)

    print("--- SLOT GENERATION COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(setup_schedules_and_slots())
