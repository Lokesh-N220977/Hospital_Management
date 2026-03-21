import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["hospital_db"]
    
    # Check appointments
    count = await db.appointments.count_documents({})
    print(f"Total appointments: {count}")
    
    # Check a few appointments
    async for appt in db.appointments.find().limit(5):
        print(f"Appt: doctor_id={appt.get('doctor_id')}, type={type(appt.get('doctor_id'))}, patient_id={appt.get('patient_id')}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
