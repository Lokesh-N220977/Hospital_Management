import asyncio
import sys
sys.path.insert(0, '.')

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "health_appointment")

async def main():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    patients = db["patients"]
    users = db["users"]

    # Iterate over all users who are patients
    patient_users = await users.find({"role": "patient"}).to_list(1000)
    
    fixed_count = 0
    for u in patient_users:
        user_id = str(u["_id"])
        
        # Check if they have a primary patient record
        primary = await patients.find_one({"user_id": user_id, "created_by": "self"})
        if not primary:
            # Create the primary patient record
            patient_data = {
                "name": u.get("name", "Unknown Name"),
                "phone": u.get("phone", ""),
                "email": u.get("email", ""),
                "user_id": user_id,
                "created_by": "self",
                "created_at": datetime.utcnow()
            }
            res = await patients.insert_one(patient_data)
            print(f"Created primary account for User: {u.get('name')} (ID: {user_id}) -> Patient ID: {res.inserted_id}")
            fixed_count += 1
            
    print(f"Fixed {fixed_count} missing primary accounts.")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
