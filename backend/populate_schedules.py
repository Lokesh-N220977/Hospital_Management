import sys
import os
import asyncio
from datetime import datetime
from bson import ObjectId

# Add the backend directory to sys.path so we can import 'app'
backend_dir = r"c:\Users\happy\Desktop\hospital_project\backend"
sys.path.append(backend_dir)

from app.database import doctors_collection, doctor_schedules_collection

async def main():
    print("Connecting to DB and fetching doctors...")
    doctors = await doctors_collection.find({}).to_list(1000)
    print(f"Found {len(doctors)} doctors. Enforcing standard Moday-Friday schedule...")
    
    days_to_work = [0, 1, 2, 3, 4] # Mon-Fri
    inserted = 0
    
    for doctor in doctors:
        doc_oid = doctor["_id"]
        
        # In the app, some places use user_id, but the schedule uses doctor collection _id mostly.
        # We will use doctor["_id"] as the doctor_id
        
        for day in days_to_work:
            query = {
                "doctor_id": doc_oid,
                "day_of_week": day
            }
            
            schedule_data = {
                "doctor_id": doc_oid,
                "day_of_week": day,
                "start_time": "09:00",
                "end_time": "17:00",
                "slot_duration": 30,
                "break_start": "13:00",
                "break_end": "14:00",
                "max_patients_per_slot": 1,
                "is_active": True,
                "updated_at": datetime.utcnow()
            }
            
            await doctor_schedules_collection.update_one(
                query,
                {"$set": schedule_data},
                upsert=True
            )
            inserted += 1
            
        # Optional: Disable Saturday and Sunday
        for day in [5, 6]:
            query = {
                "doctor_id": doc_oid,
                "day_of_week": day
            }
            inactive_schedule_data = {
                "doctor_id": doc_oid,
                "day_of_week": day,
                "start_time": "09:00",
                "end_time": "17:00",
                "slot_duration": 30,
                "break_start": "13:00",
                "break_end": "14:00",
                "max_patients_per_slot": 1,
                "is_active": False,
                "updated_at": datetime.utcnow()
            }
            await doctor_schedules_collection.update_one(
                query,
                {"$set": inactive_schedule_data},
                upsert=True
            )
            inserted += 1

    print(f"Successfully processed {len(doctors)} doctors and updated {inserted} document chunks!")

if __name__ == "__main__":
    asyncio.run(main())
