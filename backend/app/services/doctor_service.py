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
        "qualification": doctor_data_obj.degree,
        "about": "",
        "profile_image_url": doctor_data_obj.profile_image_url,
        "profile_image_source": doctor_data_obj.profile_image_source or "admin",
        "available": True,
        "created_at": datetime.utcnow()
    }
    doc_res = await doctors_collection.insert_one(doctor_record)
    logger.info(f"Doctor account and profile created: {doctor_data_obj.email}")
    return temp_password, doc_res.inserted_id

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

async def get_doctors(specialization: Optional[str] = None, location: Optional[str] = None, min_experience: Optional[int] = None):
    query: dict = {"available": True}
    if specialization and specialization not in ["All", "All Specialties", "any"]:
        query["specialization"] = specialization
    
    if location and location not in ["Any Location", "any", "Any"]:
        # Case insensitive match for location
        import re
        query["location"] = re.compile(f"^{re.escape(location)}$", re.IGNORECASE)

    if min_experience is not None and min_experience > 0:
        query["experience"] = {"$gte": min_experience}

    doctors_list = []
    # Find active doctors and convert ObjectId to string
    async for doctor in doctors_collection.find(query):
        if "_id" in doctor:
            doctor["_id"] = str(doctor["_id"])
        doctors_list.append(doctor)
    return doctors_list

async def get_distinct_specializations():
    """Returns a list of distinct specializations from active doctors."""
    # We want specializations from doctors who are 'available'
    specializations = await doctors_collection.distinct("specialization", {"available": True})
    # Filter out None and sort
    return sorted([s for s in specializations if s])

async def get_distinct_locations():
    """Returns a list of distinct locations from active doctors."""
    locations = await doctors_collection.distinct("location", {"available": True})
    return sorted([l for l in locations if l])

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

async def delete_doctor(doctor_id: str):
    from app.database import appointments_collection
    
    # mark doctor as not available
    await doctors_collection.update_one(
        {"_id": ObjectId(doctor_id)},
        {"$set": {"available": False, "is_deleted": True}}
    )
    
    # get doctor to find user_id
    doc = await doctors_collection.find_one({"_id": ObjectId(doctor_id)})
    if doc and "user_id" in doc:
        await users_collection.update_one(
            {"_id": ObjectId(doc["user_id"])},
            {"$set": {"is_active": False}}
        )
    
    # cancel future appointments
    now_str = datetime.utcnow().strftime("%Y-%m-%d")
    await appointments_collection.update_many(
        {"doctor_id": {"$in": [ObjectId(doctor_id), doctor_id]}, "status": "booked"},
        {"$set": {"status": "cancelled", "cancel_reason": "Doctor no longer available", "cancelled_by": "system", "is_active": False}}
    )
    logger.info(f"Doctor {doctor_id} logically deleted and future appointments cancelled.")
    return True
