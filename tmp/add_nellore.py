import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "hospital_db")

async def fix_db():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    doctors_collection = db["doctors"]

    print("--- Adding Nellore to Doctors Location ---")
    
    # Use Nellore in the rotation
    locations = ["Nellore", "Hyderabad", "Bangalore", "Nellore", "Mumbai", "Delhi", "Nellore"]
    idx = 0

    async for doctor in doctors_collection.find({}):
        doc_id = doctor["_id"]
        
        # Every 2nd or 3rd doctor or if location is generic, use Nellore
        new_loc = locations[idx % len(locations)]
        
        update_fields = {
            "location": new_loc,
            "hospital": f"{new_loc} General Hospital" if new_loc == "Nellore" else f"{new_loc} Speciality Hospital"
        }
        
        await doctors_collection.update_one({"_id": doc_id}, {"$set": update_fields})
        print(f"Updated {doctor['name']} to {new_loc}")
        idx += 1

    print("--- DB Fix Complete ---")
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_db())
