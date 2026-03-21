import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["hospital_db"]
    
    docs = await db.doctors.find().to_list(10)
    for d in docs:
        print(f"Doctor: id={d['_id']}, user_id={d.get('user_id')}, name={d['name']}")
        
    pats = await db.patients.find().to_list(10)
    for p in pats:
        print(f"Patient: id={p['_id']}, user_id={p.get('user_id')}, name={p['name']}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
