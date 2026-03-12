from fastapi import APIRouter, HTTPException, Depends
from app.database import database
from app.schemas.doctor_schema import DoctorCreate
from app.utils.auth import get_current_admin
from app.utils.hash import hash_password
from bson import ObjectId

router = APIRouter()

# Create doctor
@router.post("/doctors")
async def create_doctor(doctor: DoctorCreate, admin_id: str = Depends(get_current_admin)):

    new_doctor = doctor.dict()
    new_doctor["password"] = hash_password(new_doctor["password"])

    result = await database.doctors.insert_one(new_doctor)

    return {
        "message": "Doctor added",
        "doctor_id": str(result.inserted_id)
    }


# Get all doctors
@router.get("/doctors")
async def get_doctors():

    doctors = []

    async for doctor in database.doctors.find():
        doctor["_id"] = str(doctor["_id"])
        doctors.append(doctor)

    return doctors


# Get single doctor
@router.get("/doctor/{doctor_id}")
async def get_doctor(doctor_id: str):

    doctor = await database.doctors.find_one({"_id": ObjectId(doctor_id)})

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    doctor["_id"] = str(doctor["_id"])

    return doctor