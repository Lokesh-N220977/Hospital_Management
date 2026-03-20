import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from app.database import db

async def check_data():
    appts = await db["appointments"].find().to_list(1)
    if appts:
        appt = appts[0]
        print(f"Appointment doc keys: {appt.keys()}")
        print(f"doctor_id value: {appt.get('doctor_id')} type: {type(appt.get('doctor_id'))}")
        print(f"patient_id value: {appt.get('patient_id')} type: {type(appt.get('patient_id'))}")

if __name__ == "__main__":
    asyncio.run(check_data())
