import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["hospital_db"]
    users = await db.users.find().to_list(10)
    for u in users:
        print(f"User: role={u.get('role')}, email={u.get('email')}")
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
