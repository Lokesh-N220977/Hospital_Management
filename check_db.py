import asyncio
import motor.motor_asyncio
from bson import ObjectId

async def check():
    print("Connecting to MongoDB Atlas...")
    uri = "mongodb://hospital_user:Health123@ac-xsmnhj7-shard-00-00.iihhpoh.mongodb.net:27017,ac-xsmnhj7-shard-00-01.iihhpoh.mongodb.net:27017,ac-xsmnhj7-shard-00-02.iihhpoh.mongodb.net:27017/health_appointment?ssl=true&authSource=admin&retryWrites=true&w=majority"
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    db = client.health_appointment
    
    print(f"Using database: {db.name}")

    print("\n--- DOCTORS ---")
    doctors = await db.doctors.find().to_list(100)
    doc_map = {}
    for dr in doctors:
        doc_id = str(dr.get('_id'))
        name = dr.get('name')
        spec = dr.get('specialization')
        doc_map[doc_id] = f"{name} ({spec})"
        print(f"ID: {doc_id}, Name: {name}, Spec: {spec}")
    
    print("\n--- SCHEDULES ---")
    schedules = await db.doctor_schedules.find().to_list(100)
    for sch in schedules:
        d_id = sch.get('doctor_id')
        d_name = doc_map.get(d_id, f"Unknown ({d_id})")
        print(f"Doc: {d_name}, Days: {sch.get('working_days')}, Hours: {sch.get('working_hours')}, Slots/Day: {sch.get('slots_per_day')}")
        
    print("\n--- APPROVED LEAVES ---")
    leaves = await db.doctor_leaves.find({"status": "approved"}).to_list(100)
    for lv in leaves:
        d_id = lv.get('doctor_id')
        d_name = doc_map.get(d_id, f"Unknown ({d_id})")
        print(f"Doc: {d_name}, Date: {lv.get('date')}")

    print("\n--- RECENT APPOINTMENTS ---")
    appts = await db.appointments.find().sort("date", -1).limit(10).to_list(10)
    for ap in appts:
        print(f"Doc: {ap.get('doctor_name')}, Date: {ap.get('date')}, Time: {ap.get('time')}, Status: {ap.get('status')}")

if __name__ == "__main__":
    asyncio.run(check())
