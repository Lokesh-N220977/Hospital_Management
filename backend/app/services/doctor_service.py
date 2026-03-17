from app.database import users_collection, doctors_collection
from app.core.security import hash_password
from app.core.logger import logger
from bson import ObjectId
from fastapi import HTTPException

async def create_doctor(doctor_data_obj):
    existing_user = await users_collection.find_one({"email": doctor_data_obj.email})
    if existing_user:
        logger.warning(f"Failed to create doctor: Email {doctor_data_obj.email} already exists")
        raise HTTPException(status_code=400, detail="User already exists")

    # Create user account
    user_data = {
        "name": doctor_data_obj.name,
        "email": doctor_data_obj.email,
        "phone": doctor_data_obj.phone,
        "gender": doctor_data_obj.gender,
        "password": hash_password("doctor123"),
        "role": "doctor",
        "is_active": True
    }
    user_res = await users_collection.insert_one(user_data)

    # Create doctor profile
    doctor_record = {
        "user_id": str(user_res.inserted_id),
        "name": doctor_data_obj.name,
        "email": doctor_data_obj.email,
        "specialization": doctor_data_obj.specialization,
        "experience": doctor_data_obj.experience,
        "consultation_fee": doctor_data_obj.consultation_fee,
        "available": True
    }
    await doctors_collection.insert_one(doctor_record)
    logger.info(f"Doctor created: {doctor_data_obj.email}")
    return True

async def update_doctor_profile(doctor_id: str, update_data: dict):
    clean_data = {k: v for k, v in update_data.items() if v is not None}
    if not clean_data:
        return False
        
    result = await doctors_collection.update_one(
        {"_id": ObjectId(doctor_id)},
        {"$set": clean_data}
    )
    if result.modified_count > 0:
        logger.info(f"Doctor profile updated: {doctor_id}")
        return True
    return False

from typing import Optional

async def get_doctors(specialization: Optional[str] = None):
    query: dict = {"available": True}
    if specialization:
        query["specialization"] = specialization
    
    doctors_list = []
    async for doctor in doctors_collection.find(query):
        doctor["_id"] = str(doctor["_id"])
        doctors_list.append(doctor)
    return doctors_list



async def get_doctor_by_id(doctor_id: str):

    doctor = await doctors_collection.find_one({"_id": ObjectId(doctor_id)})
    if doctor:
        doctor["_id"] = str(doctor["_id"])
    return doctor
