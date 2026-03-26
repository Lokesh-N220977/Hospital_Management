import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

load_dotenv()

async def main():
    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DATABASE_NAME")
    
    if not uri or not db_name:
        print("Missing MONGO_URI or DATABASE_NAME in .env")
        return

    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    print(f"--- MongoDB Cleaning Analysis ({db_name}) ---")
    
    # Required collections based on code audit
    required = {
        "users", "patients", "doctors", "appointments", "doctor_schedules",
        "doctor_leaves", "visit_history", "prescriptions", "otp", "reviews",
        "notifications", "patient_settings", "doctor_settings", "admin_settings",
        "hospital_settings", "hospitals", "locations", "doctor_locations",
        "doctor_shifts", "doctor_slots"
    }
    
    try:
        current_collections = await db.list_collection_names()
        
        print(f"\nTotal collections found: {len(current_collections)}")
        
        to_keep = []
        to_delete = []
        
        for coll in current_collections:
            if coll in required:
                to_keep.append(coll)
            else:
                to_delete.append(coll)
        
        print("\n✅ COLLECTIONS TO KEEP (CORE APP):")
        for c in sorted(to_keep):
            count = await db[c].count_documents({})
            print(f" - {c} ({count} documents)")
            
        if to_delete:
            print("\n🚨 UNKNOWN/UNREQUIRED COLLECTIONS (SAFE TO DELETE?):")
            for c in sorted(to_delete):
                count = await db[c].count_documents({})
                print(f" - {c} ({count} documents)")
        else:
            print("\n✨ Your database is already clean! No extra collections found.")
            
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
