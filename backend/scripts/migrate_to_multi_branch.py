import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hospital_db")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

async def migrate():
    print(f"Starting migration on {DATABASE_NAME}...")
    
    # 1. Create Default Hospital
    hospital = {
        "name": "Main City Hospital",
        "is_active": True
    }
    h_result = await db.hospitals.insert_one(hospital)
    hospital_id = h_result.inserted_id
    print(f"Created Hospital: {hospital_id}")

    # 2. Create Default Location
    location = {
        "hospital_id": hospital_id,
        "name": "Main Square Branch",
        "address": "123 Healthcare Ave",
        "city": "Vijayawada",
        "state": "Andhra Pradesh",
        "is_active": True
    }
    l_result = await db.locations.insert_one(location)
    location_id = l_result.inserted_id
    print(f"Created Location: {location_id}")

    # 3. Map all existing Doctors to this location
    doctors = await db.doctors.find().to_list(length=1000)
    for doc in doctors:
        await db.doctor_locations.update_one(
            {"doctor_id": doc["_id"], "location_id": location_id},
            {"$set": {"is_primary": True, "is_active": True}},
            upsert=True
        )
    print(f"Mapped {len(doctors)} doctors to location {location_id}")

    # 4. Backfill schedules, slots, and appointments
    collections_to_update = ["doctor_schedules", "doctor_slots", "appointments"]
    for coll_name in collections_to_update:
        result = await db[coll_name].update_many(
            {"location_id": {"$exists": False}},
            {"$set": {"location_id": location_id}}
        )
        print(f"Updated {result.modified_count} documents in {coll_name}")

    print("Migration completed successfully.")

if __name__ == "__main__":
    asyncio.run(migrate())
