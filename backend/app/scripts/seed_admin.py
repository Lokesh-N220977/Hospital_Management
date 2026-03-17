import asyncio
from app.database import users_collection
from app.core.security import hash_password

async def seed_admin():
    existing_admin = await users_collection.find_one({"role": "admin"})
    if existing_admin:
        print("Admin user already exists")
        return

    admin_data = {
        "name": "System Admin",
        "email": "admin@hospital.com",
        "phone": "9999999999",
        "gender": "male",
        "password": hash_password("admin123"),
        "role": "admin",
        "is_active": True
    }
    await users_collection.insert_one(admin_data)
    print("Admin user seeded successfully. Login with admin@hospital.com / admin123")

if __name__ == "__main__":
    asyncio.run(seed_admin())
