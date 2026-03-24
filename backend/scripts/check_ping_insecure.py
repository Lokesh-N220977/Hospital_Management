import asyncio
import sys
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add parent directory to sys.path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

async def check_ping_insecure():
    print(f"Pinging MongoDB with tlsInsecure=True...")
    print(f"URI: {MONGO_URI[:30]}...")
    try:
        # Use a new client with insecure TLS for testing
        client = AsyncIOMotorClient(MONGO_URI, tlsInsecure=True)
        await client.admin.command('ping')
        print("Ping successful!")
        
        db = client[DATABASE_NAME]
        cols = await db.list_collection_names()
        print(f"Database: {db.name}")
        print(f"Collections: {cols}")
        
        # Test transactions
        print("\nTesting transaction support...")
        async with await client.start_session() as session:
            async with session.start_transaction():
                await db["test_txn"].insert_one({"test": "insecure"}, session=session)
                print("TXN Write OK.")
            print("TXN Commit OK.")
            await db["test_txn"].delete_many({})
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(check_ping_insecure())
