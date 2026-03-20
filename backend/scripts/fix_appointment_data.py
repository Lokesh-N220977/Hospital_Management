import asyncio
from app.database import appointments_collection, doctors_collection
from bson import ObjectId

async def fix_data():
    appointments = await appointments_collection.find({
        "doctor_name": {"$exists": False}
    }).to_list(length=1000)
    
    print(f"Found {len(appointments)} appointments without metadata.")
    
    for appt in appointments:
        doc = await doctors_collection.find_one({"_id": ObjectId(appt["doctor_id"])})
        if doc:
            await appointments_collection.update_one(
                {"_id": appt["_id"]},
                {
                    "$set": {
                        "doctor_name": doc["name"],
                        "specialization": doc["specialization"]
                    }
                }
            )
            print(f"Fixed appointment {appt['_id']} for {doc['name']}")
        else:
            print(f"Doctor not found for appointment {appt['_id']}")

if __name__ == "__main__":
    asyncio.run(fix_data())
