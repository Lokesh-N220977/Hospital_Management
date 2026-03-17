import asyncio
from app.database import users_collection, doctors_collection, appointments_collection

async def create_indexes():
    # Performance indexes
    await users_collection.create_index("email", unique=True)
    await doctors_collection.create_index("user_id")
    await appointments_collection.create_index("doctor_id")
    await appointments_collection.create_index("date")
    
    # Preventing double booking
    await appointments_collection.create_index(
        [("doctor_id", 1), ("date", 1), ("time", 1)],
        unique=True
    )
    print("MongoDB indexes created successfully")

if __name__ == "__main__":
    asyncio.run(create_indexes())
