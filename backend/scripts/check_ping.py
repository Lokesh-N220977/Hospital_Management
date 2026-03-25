import asyncio
import sys
import os

# Add parent directory to sys.path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import client, db

async def check_ping():
    print("Pinging MongoDB...")
    try:
        await client.admin.command('ping')
        print("Ping successful!")
        
        # Check active collections
        print(f"Database: {db.name}")
        cols = await db.list_collection_names()
        print(f"Collections: {cols}")
        return True
    except Exception as e:
        print(f"Ping failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(check_ping())
