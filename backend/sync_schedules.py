import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def sync():
    load_dotenv()
    client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
    db = client[os.getenv("DATABASE_NAME")]
    
    # Get all doctors
    doctors = await db.doctors.find({"available": True}).to_list(100)
    print(f"Syncing schedules for {len(doctors)} active doctors...")
    
    for doc in doctors:
        doc_id = str(doc["_id"])
        # Check if schedule exists
        existing = await db.doctor_schedules.find_one({"doctor_id": doc_id})
        
        schedule_data = {
            "doctor_id": doc_id,
            "doctor_name": doc["name"],
            "specialization": doc["specialization"],
            "working_days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
            "working_hours": doc.get("working_hours", "09:00 - 17:00"),
            "slots_per_day": doc.get("slots_per_day", 16),
            "status": "Reporting"
        }
        
        if existing:
            # Update name/specialty in case it changed
            await db.doctor_schedules.update_one(
                {"doctor_id": doc_id},
                {"$set": {"doctor_name": doc["name"], "specialization": doc["specialization"]}}
            )
        else:
            # Create new schedule
            await db.doctor_schedules.insert_one(schedule_data)
            print(f"Created schedule for Dr. {doc['name']}")

    # Check for orphaned schedules (manual test data)
    await db.doctor_schedules.delete_many({"doctor_name": "Unknown Doctor"})
    print("Cleaned up orphaned 'Unknown Doctor' schedules.")

if __name__ == "__main__":
    asyncio.run(sync())
