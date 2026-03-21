import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Path to .env
env_path = os.path.join(os.getcwd(), '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hospital_db")

async def clear_notifications():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    result = await db.notifications.delete_many({})
    print(f"Deleted {result.deleted_count} old notifications.")
    client.close()

if __name__ == "__main__":
    asyncio.run(clear_notifications())
