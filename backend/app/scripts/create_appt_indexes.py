import asyncio
import sys
import os

# Add the project root to the sys.path so app modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import appointments_collection

async def create_indexes():
    print("Creating indexes for appointments collection...")
    # Index for checking doctor slot availability (used for duplicates)
    await appointments_collection.create_index(
        [
            ("doctor_id", 1),
            ("appointment_date", 1),
            ("slot_start", 1)
        ]
    )
    
    # Index for querying by patient
    await appointments_collection.create_index([("patient_id", 1)])
    
    print("Indexes created successfully.")

if __name__ == "__main__":
    asyncio.run(create_indexes())
