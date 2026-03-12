import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['medicpulse']
    
    print("--- Admins ---")
    admins = await db.users.find({'role': 'admin'}).to_list(10)
    for a in admins:
        print(a.get('email'), "-", "Password hash:", a.get('password'))
        
    print("--- Doctors ---")
    doctors = await db.users.find({'role': 'doctor'}).to_list(10)
    for d in doctors:
        print(d.get('email'), "-", "Password hash:", d.get('password'))

asyncio.run(main())
