import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.database import db

async def check_data():
    appts = await db["appointments"].find().to_list(10)
    print("Appointments sample:")
    for a in appts:
        print(a)
        
    leaves = await db["doctor_leaves"].find().to_list(10)
    print("\nLeaves sample:")
    for l in leaves:
        print(l)
    
    docs = await db["doctors"].find().to_list(10)
    print("\nDoctors sample:")
    for d in docs:
        print(d)

if __name__ == "__main__":
    asyncio.run(check_data())
