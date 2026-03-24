import asyncio
import sys
import os

# Add parent directory to sys.path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import client, db

async def check_mongo_config():
    print("Checking MongoDB configuration...")
    try:
        # Check version
        version_doc = await db.command("buildInfo")
        print(f"MongoDB Version: {version_doc['version']}")
        
        # Check replica set status
        try:
            repl_status = await db.command("replSetGetStatus")
            print(f"Replica Set: {repl_status.get('set', 'Unknown')}")
            print(f"Me: {repl_status.get('me', 'Unknown')}")
            print("OK: Replica set detected.")
        except Exception as e:
            print(f"Replica Set Check Error: {e}")
            print("INFO: This looks like a standalone MongoDB instance.")

        # Check write concern
        print(f"Write Concern: {client.write_concern}")
        
    except Exception as e:
        print(f"General Check Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_mongo_config())
