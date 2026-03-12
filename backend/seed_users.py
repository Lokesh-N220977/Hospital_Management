import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.utils.hash import hash_password

async def main():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['medicpulse']
    
    admin_password = hash_password("admin123")
    doctor_password = hash_password("doctor123")
    
    admin_user = {
        "name": "System Admin",
        "email": "admin@medicpulse.com",
        "password": admin_password,
        "phone": "000-000-0000",
        "role": "admin"
    }
    
    doctor_user = {
        "name": "Dr. Sarah Jenkins",
        "email": "sarah@medicpulse.com",
        "password": doctor_password,
        "phone": "555-019-2034",
        "role": "doctor",
        "specialty": "Cardiology"
    }
    
    # Upsert to avoid duplicates
    await db.users.update_one({"email": admin_user["email"]}, {"$set": admin_user}, upsert=True)
    await db.users.update_one({"email": doctor_user["email"]}, {"$set": doctor_user}, upsert=True)
    
    print("Seed complete. Admin: admin@medicpulse.com / admin123")
    print("Doctor: sarah@medicpulse.com / doctor123")

asyncio.run(main())
