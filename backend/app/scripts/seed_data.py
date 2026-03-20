import asyncio
import os
import sys

# Add the project root to sys.path to allow absolute imports of app
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)

# Import dependencies after sys.path is updated
from app.database.collections import users_collection, doctors_collection
from app.core.security import hash_password

async def seed():
    print("Connecting to database and clearing existing data...")
    # Clean users and doctors
    await users_collection.delete_many({})
    await doctors_collection.delete_many({})
    
    # Admin User
    admin_data = {
        "name": "System Admin",
        "email": "admin@hospital.com",
        "phone": "9999999999",
        "gender": "male",
        "role": "admin",
        "is_active": True,
        "password": hash_password("admin123")
    }
    await users_collection.insert_one(admin_data)
    print("Admin user seeded: admin@hospital.com")

    # Doctors List
    doctors_info = [
        {
            "name": "Dr. Ravi Kumar",
            "email": "ravi@hospital.com",
            "specialization": "Cardiology",
            "experience": "10 years",
            "consultation_fee": "₹500",
            "available": True,
            "role": "doctor"
        },
        {
            "name": "Dr. Priya Sharma",
            "email": "priya@hospital.com",
            "specialization": "Dermatology",
            "experience": "7 years",
            "consultation_fee": "₹400",
            "available": True,
            "role": "doctor"
        }
    ]

    for doc in doctors_info:
        # Create Auth account
        user_account = {
            "name": doc["name"],
            "email": doc["email"],
            "role": "doctor",
            "is_active": True,
            "password": hash_password("doctor123")
        }
        res = await users_collection.insert_one(user_account)
        
        # Create Doctor Profile
        doctor_profile = doc.copy()
        doctor_profile["user_id"] = str(res.inserted_id)
        await doctors_collection.insert_one(doctor_profile)

    print("Doctors seeded successfully")
    print("--- SEEDING COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(seed())
