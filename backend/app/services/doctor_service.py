from app.database import users_collection, doctors_collection
from app.core.security import hash_password, generate_temp_password
from app.core.logger import logger
from bson import ObjectId
from fastapi import HTTPException
from datetime import datetime
from typing import Optional

async def create_doctor(doctor_data_obj):
    existing_user = await users_collection.find_one({"email": doctor_data_obj.email})
    if existing_user:
        logger.warning(f"Failed to create doctor: Email {doctor_data_obj.email} already exists")
        raise HTTPException(status_code=400, detail="User already exists")

    temp_password = generate_temp_password()
    
    # Create user account
    user_data = {
        "name": doctor_data_obj.name,
        "email": doctor_data_obj.email,
        "phone": doctor_data_obj.phone,
        "gender": doctor_data_obj.gender,
        "password": hash_password(temp_password),
        "role": "doctor",
        "must_change_password": True,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    user_res = await users_collection.insert_one(user_data)

    # Create doctor profile
    doctor_record = {
        "user_id": str(user_res.inserted_id),
        "name": doctor_data_obj.name,
        "email": doctor_data_obj.email,
        "phone": doctor_data_obj.phone,
        "gender": doctor_data_obj.gender,
        "specialization": doctor_data_obj.specialization,
        "degree": doctor_data_obj.degree,
        "experience": doctor_data_obj.experience,
        "consultation_fee": doctor_data_obj.consultation_fee,
        "department": doctor_data_obj.department or "General",
        "location": doctor_data_obj.location or "Clinic",
        "available": True,
        "created_at": datetime.utcnow()
    }
    await doctors_collection.insert_one(doctor_record)
    logger.info(f"Doctor account and profile created: {doctor_data_obj.email}")
    return temp_password

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

async def get_doctors(specialization: Optional[str] = None):
    query: dict = {"available": True}
    if specialization and specialization != "All":
        query["specialization"] = specialization

    doctors_list = []
    async for doctor in doctors_collection.find(query):
        if "_id" in doctor:
            doctor["_id"] = str(doctor["_id"])
        doctors_list.append(doctor)
    return doctors_list

async def get_doctor_by_id(doctor_id: str):
    doctor = await doctors_collection.find_one({"_id": ObjectId(doctor_id)})
    if doctor:
        doctor["_id"] = str(doctor["_id"])
    return doctor

async def get_doctor_by_user_id(user_id: str):
    doctor = await doctors_collection.find_one({"user_id": user_id})
    if doctor:
        doctor["_id"] = str(doctor["_id"])
    return doctor
