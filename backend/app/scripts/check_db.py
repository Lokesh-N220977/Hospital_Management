import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def check_data():
    client = AsyncIOMotorClient("mongodb://localhost:27017") # Default local or from env?
    # Let's try to find the connection string from config.py
    db = client["hospital_management"] # Default name from previous context?
    
    appts = await db["appointments"].find().to_list(10)
    print("Appointments sample:")
    for a in appts:
        print(a)
        
    leaves = await db["doctor_leaves"].find().to_list(10)
    print("\nLeaves sample:")
    for l in leaves:
        print(l)

if __name__ == "__main__":
    asyncio.run(check_data())
