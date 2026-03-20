import asyncio
import os
import sys

sys.path.append(os.getcwd())

from app.database import doctor_leaves_collection

async def check():
    print("Checking leaves in doctor_leaves_collection...")
    async for leave in doctor_leaves_collection.find():
        print(f"ID: {leave['_id']}, Doctor: {leave.get('doctor_id')}, Status: {leave.get('status')}, Date: {leave.get('date')}")

if __name__ == "__main__":
    asyncio.run(check())
