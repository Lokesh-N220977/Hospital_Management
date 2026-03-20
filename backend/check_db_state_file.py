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

    with open("out.log", "w", encoding="utf-8") as f:
        f.write("=" * 60 + "\n")
        f.write("PATIENTS IN DB:\n")
        all_patients = await patients.find({}).to_list(100)
        for p in all_patients:
            f.write(f"Name: {p.get('name')}, Phone: {p.get('phone')}, created_by: {p.get('created_by')}, user_id: {p.get('user_id')}\n")
            
        f.write("=" * 60 + "\n")
        f.write("USERS IN DB:\n")
        all_users = await users.find({}).to_list(100)
        for u in all_users:
            f.write(f"Name: {u.get('name')}, Phone: {u.get('phone')}, Role: {u.get('role')}, id: {str(u['_id'])}\n")

    client.close()

if __name__ == "__main__":
    asyncio.run(main())
