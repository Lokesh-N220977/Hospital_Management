import asyncio
import sys
import os

# Add parent directory to sys.path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import client, db

async def check_transactions():
    print("Checking if MongoDB supports transactions...")
    try:
        async with await client.start_session() as session:
            async with session.start_transaction():
                # Perform a simple write in transaction
                await db["test_transaction"].insert_one({"test": "data"}, session=session)
                print("Transaction write successful. Committing...")
            print("Transaction committed successfully.")
            
            # Verify data exists
            doc = await db["test_transaction"].find_one({"test": "data"})
            if doc:
                print("Data verified after transaction.")
                await db["test_transaction"].delete_many({})
                return True
    except Exception as e:
        print(f"Transaction check failed: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(check_transactions())
    if result:
        print("\n[OK] Transactions ARE supported.")
    else:
        print("\n[FAIL] Transactions are NOT supported by this MongoDB setup.")
