import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")

async def main():
    print(f"Connecting to: {MONGO_URL[:50]}...")
    client = AsyncIOMotorClient(MONGO_URL, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=15000)
    try:
        result = await client.admin.command("ping")
        print("SUCCESS! Ping:", result)
        db = client.health_appointment
        count = await db.users.count_documents({})
        print(f"Current users count: {count}")
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")
    finally:
        client.close()

asyncio.run(main())
