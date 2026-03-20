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
    users = db["users"]

    print("=" * 60)
    print("PATIENTS IN DB:")
    all_patients = await patients.find({}).to_list(100)
    for p in all_patients:
        print(f"Name: {p.get('name')}, Phone: {p.get('phone')}, created_by: {p.get('created_by')}, user_id: {p.get('user_id')}")
        
    print("=" * 60)
    print("USERS IN DB:")
    all_users = await users.find({}).to_list(100)
    for u in all_users:
        print(f"Name: {u.get('name')}, Phone: {u.get('phone')}, Role: {u.get('role')}, id: {str(u['_id'])}")

    client.close()

if __name__ == "__main__":
    asyncio.run(main())
