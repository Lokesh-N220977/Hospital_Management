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
    print("Seeding/Updating system data (non-destructive)...")
    
    # Admin User - Upsert
    admin_email = "admin@hospital.com"
    admin_account = {
        "name": "System Admin",
        "email": admin_email,
        "phone": "9999999999",
        "gender": "male",
        "role": "admin",
        "is_active": True,
        "password": hash_password("admin123")
    }
    await users_collection.update_one(
        {"email": admin_email},
        {"$set": admin_account},
        upsert=True
    )
    print(f"Admin user seeded/updated: {admin_email}")

    # Doctors List
    doctors_info = [
        {
            "name": "Dr. Ravi Kumar",
            "email": "ravi@hospital.com",
            "specialization": "Cardiology",
            "experience": 10,
            "location": "Mumbai",
            "consultation_fee": "₹500",
            "available": True,
            "role": "doctor",
            "profile_image_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800"
        },
        {
            "name": "Dr. Priya Sharma",
            "email": "priya@hospital.com",
            "specialization": "Dermatology",
            "experience": 7,
            "location": "Delhi",
            "consultation_fee": "₹400",
            "available": True,
            "role": "doctor",
            "profile_image_url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800"
        },
        {
            "name": "Dr. Sameer Khan",
            "email": "sameer@hospital.com",
            "specialization": "Orthopedics",
            "experience": 8,
            "location": "Bangalore",
            "consultation_fee": "₹600",
            "available": True,
            "role": "doctor",
            "profile_image_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800"
        }
    ]

    for doc in doctors_info:
        # Create/Update Auth account
        user_account = {
            "name": doc["name"],
            "email": doc["email"],
            "role": "doctor",
            "is_active": True,
            "password": hash_password("doctor123")
        }
        await users_collection.update_one(
            {"email": doc["email"]},
            {"$set": user_account},
            upsert=True
        )
        
        # Get user_id
        user_doc = await users_collection.find_one({"email": doc["email"]})
        user_id = str(user_doc["_id"])
        
        # Create/Update Doctor Profile
        doctor_profile = doc.copy()
        doctor_profile["user_id"] = user_id
        
        await doctors_collection.update_one(
            {"email": doc["email"]},
            {"$set": doctor_profile},
            upsert=True
        )

    print("Doctors seeded/updated successfully")
    print("--- SEEDING COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(seed())
