import asyncio
import os
import sys

# Add the project root to sys.path to allow absolute imports of app
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)

from app.database.collections import doctor_slots_collection

async def check():
    count = await doctor_slots_collection.count_documents({})
    print(f"Total Slot Records in Database: {count}")
    
    first = await doctor_slots_collection.find_one({})
    if first:
        print(f"Sample Record found for Doctor: {first['doctor_id']} on {first['date']}")
        print(f"Number of slots in this record: {len(first['slots'])}")

if __name__ == "__main__":
    asyncio.run(check())
