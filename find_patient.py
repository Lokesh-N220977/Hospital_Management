import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["hospital_db"]
    user = await db.users.find_one({"role": "patient"})
    if user:
        print(f"Patient email: {user.get('email')}")
    else:
        print("No patient found")
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
