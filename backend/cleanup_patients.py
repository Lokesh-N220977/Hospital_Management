import asyncio
import sys
sys.path.insert(0, '.')

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "health_appointment")

async def main():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    patients = db["patients"]

    print("=" * 60)
    print("CURRENT PATIENT RECORDS IN DATABASE")
    print("=" * 60)

    all_patients = await patients.find({}).to_list(1000)
    
    if not all_patients:
        print("No patient records found.")
    else:
        for p in all_patients:
            print(f"  Name   : {p.get('name', 'N/A')}")
            print(f"  Phone  : {p.get('phone', 'N/A')}")
            print(f"  user_id: {p.get('user_id', 'None (walk-in)')}")
            print(f"  created_by: {p.get('created_by', 'unknown')}")
            print(f"  _id    : {p['_id']}")
            print("-" * 40)

    print(f"\nTotal patients: {len(all_patients)}")
    print("\nDeleting ALL patient records...")

    result = await patients.delete_many({})
    print(f"Deleted: {result.deleted_count} patient records.")
    print("Done. You can now re-create patients fresh.")
    
    client.close()

asyncio.run(main())
