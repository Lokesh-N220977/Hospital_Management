from datetime import datetime

# Schema structure for Doctor
doctor_schema = {
    "doctor_id": str,
    "name": str,
    "specialization": str,
    "department": str,
    "available_slots": list,
    "email": str,
    "created_at": datetime
}

from database.db import db
import uuid

# a function to add doctor to the database
def add_doctor(data):
    data["doctor_id"] = str(uuid.uuid4())
    data["created_at"] = datetime.utcnow()

    db.doctors.insert_one(data)
    return data

def get_all_doctors():
    doctors = list(db.doctors.find({}, {"_id": 0}))
    return doctors

#update doctor details  
def update_doctor(doctor_id, data):
    db.doctors.update_one(
        {"doctor_id": doctor_id},
        {"$set": data}
    )
