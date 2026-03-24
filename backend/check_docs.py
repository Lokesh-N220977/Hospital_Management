import asyncio
import os
import sys

# Add the project root to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from app.database.connection import client, db

async def check():
    print("Pinging MongoDB...")
    try:
        await asyncio.wait_for(client.admin.command('ping'), timeout=5.0)
        print("Ping successful!")
    except asyncio.TimeoutError:
        print("Ping timed out!")
        return
    except Exception as e:
        print(f"Ping failed: {e}")
        return

    doctors_collection = db["doctors"]
    count = await doctors_collection.count_documents({})
    print(f"Doctor count: {count}")
    async for d in doctors_collection.find({}):
        print(f"- {d.get('name')} ({d.get('email')}, {d.get('location')}, exp: {d.get('experience')})")

if __name__ == "__main__":
    asyncio.run(check())
