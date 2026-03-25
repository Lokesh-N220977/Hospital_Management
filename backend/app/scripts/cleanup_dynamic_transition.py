import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def cleanup():
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
    db_name = os.environ.get("DATABASE_NAME", "health_appointment")
    client = AsyncIOMotorClient(mongo_uri)
    db = client[db_name]
    
    print(f"Cleaning up database: {db_name}")

    # 1. Drop doctor_slots collection
    await db.doctor_slots.drop()
    print("- Dropped collection: doctor_slots")

    # 2. Delete schedules without location_id
    result = await db.doctor_schedules.delete_many({"location_id": {"$exists": False}})
    print(f"- Deleted {result.deleted_count} schedules missing location_id")

    # 3. Drop doctor_shifts (dynamic system doesn't need them as per requirements)
    await db.doctor_shifts.drop()
    print("- Dropped collection: doctor_shifts")

    print("\nCleanup complete.")

if __name__ == "__main__":
    asyncio.run(cleanup())
