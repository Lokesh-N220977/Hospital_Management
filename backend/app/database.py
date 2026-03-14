from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URI, DATABASE_NAME

client = AsyncIOMotorClient(MONGO_URI)

db = client[DATABASE_NAME]

users_collection = db["users"]
doctors_collection = db["doctors"]
appointments_collection = db["appointments"]
doctor_schedules_collection = db["doctor_schedules"]
doctor_leaves_collection = db["doctor_leaves"]
visit_history_collection = db["visit_history"]
schedules_collection = db["schedules"]
leaves_collection = db["leaves"]
doctor_slots_collection = db["doctor_slots"]


async def create_indexes():
    await users_collection.create_index("email", unique=True)
    await doctors_collection.create_index("name")
    await doctors_collection.create_index([("name", "text")])
    await appointments_collection.create_index("doctor_id")
    await appointments_collection.create_index("patient_id")
    await appointments_collection.create_index(
    [("doctor_id", 1), ("date", 1), ("time", 1)],
    unique=True
    )

    from pymongo import ASCENDING

    async def create_indexes():

        await appointments_collection.create_index(
            [
                ("doctor_id", ASCENDING),
                ("appointment_date", ASCENDING),
                ("appointment_time", ASCENDING)
            ],
            unique=True
        )
