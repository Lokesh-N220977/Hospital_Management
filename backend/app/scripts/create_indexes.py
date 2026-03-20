import asyncio
from app.database import users_collection, doctors_collection, appointments_collection, patients_collection

async def create_indexes():
    # Remove old unique email if it exists
    try:
        await users_collection.drop_index("email_1")
    except:
        pass

    # Users: Phone based unique identity
    await users_collection.create_index("phone", unique=True)
    await users_collection.create_index("email") # Email is now non-unique / optional

    # Patients: Indexed by phone (non-unique) and user_id
    await patients_collection.create_index("phone")
    await patients_collection.create_index("user_id")

    # Doctors
    await doctors_collection.create_index("user_id")

    # Appointments: Performance & Double Booking Protection
    await appointments_collection.create_index("doctor_id")
    await appointments_collection.create_index("date")
    await appointments_collection.create_index("patient_id")
    
    await appointments_collection.create_index(
        [("doctor_id", 1), ("date", 1), ("time", 1)],
        unique=True
    )
    
    print("Hospital Management System MongoDB indexes updated successfully")

if __name__ == "__main__":
    asyncio.run(create_indexes())
