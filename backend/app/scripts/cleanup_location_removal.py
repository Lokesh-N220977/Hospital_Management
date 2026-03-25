import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.database.collections import doctor_schedules_collection, appointments_collection, doctor_leaves_collection

async def clean_locations():
    print("🧹 Starting location cleanup in DB...")
    
    res1 = await doctor_schedules_collection.update_many({}, {"$unset": {"location_id": ""}})
    print(f"✅ Unset location_id in {res1.modified_count} doctor_schedules.")
    
    res2 = await appointments_collection.update_many({}, {"$unset": {"location_id": ""}})
    print(f"✅ Unset location_id in {res2.modified_count} appointments.")
    
    res3 = await doctor_leaves_collection.update_many({}, {"$unset": {"location_id": ""}})
    print(f"✅ Unset location_id in {res3.modified_count} doctor_leaves.")
    
    print("🚀 Cleanup complete!")

if __name__ == "__main__":
    asyncio.run(clean_locations())
