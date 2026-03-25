from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.role_checker import get_doctor_user
from app.models.schedule import DoctorScheduleUpdate, LeaveCreate
from app.models.doctor_model import DoctorUpdate
from app.services import leave_service, doctor_service, scheduling_service
from app.core.logger import logger
from app.database import doctors_collection, users_collection
from bson import ObjectId
import os
import uuid
from app.models.leave_model import DoctorLeaveCreate
from typing import List, Optional

router = APIRouter(prefix="/api/v1/doctor", tags=["Doctor Portal"])

@router.get("/profile")
async def get_doctor_profile(current_user=Depends(get_doctor_user)):
    """Fetch profile of the logged-in doctor."""
    doctor = await doctor_service.get_doctor_by_user_id(str(current_user["_id"]))
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    return {
        "doctor_id": doctor["_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "phone": current_user.get("phone"),
        "specialization": doctor.get("specialization"),
        "experience": doctor.get("experience"),
        "qualification": doctor.get("qualification"),
        "consultation_fee": doctor.get("consultation_fee", 500),
        "about": doctor.get("about", doctor.get("bio", "")),
        "location": doctor.get("location", "Not specified"),
        "profile_image_url": doctor.get("profile_image_url", doctor.get("profile_img")),
        "profile_image_source": doctor.get("profile_image_source"),
        "average_rating": doctor.get("average_rating", 0.0),
        "total_reviews": doctor.get("total_reviews", 0)
    }

@router.patch("/profile")
async def update_doctor_profile(data: DoctorUpdate, current_user=Depends(get_doctor_user)):
    doctor = await doctor_service.get_doctor_by_user_id(str(current_user["_id"]))
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    update_data = data.dict(exclude_none=True)
    
    # If name or phone is updated, update the user record too
    user_updates = {}
    if "name" in update_data:
        user_updates["name"] = update_data["name"]
    if "phone" in update_data:
        user_updates["phone"] = update_data["phone"]
        
    if user_updates:
        # Crucial fix: current_user["_id"] is string, DB needs ObjectId
        await users_collection.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": user_updates}
        )
    
    await doctor_service.update_doctor_profile(doctor["_id"], update_data)
    return {"message": "Profile updated successfully"}

@router.patch("/profile/image")
async def upload_profile_image(file: UploadFile = File(...), current_user=Depends(get_doctor_user)):
    doctor = await doctor_service.get_doctor_by_user_id(str(current_user["_id"]))
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    UPLOAD_DIR = "uploads/doctor_profiles"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    image_url = f"/uploads/doctor_profiles/{file_name}"

    await doctors_collection.update_one(
        {"_id": ObjectId(doctor["_id"])},
        {
            "$set": {
                "profile_image_url": image_url,
                "profile_image_source": "doctor"
            }
        }
    )

    return {"image_url": image_url}

@router.get("/leave/{doctor_id}")
async def get_doctor_leaves(doctor_id: str, current_user=Depends(get_doctor_user)):
    """Fetch all leave requests for a doctor."""
    return await leave_service.get_doctor_leaves(doctor_id)

@router.post("/leave")
async def request_leave(payload: dict, current_user=Depends(get_doctor_user)):
    """Request a leave (planned absence)."""
    doctor_id = payload.get("doctor_id")
    # Support both date and leave_date field names from various frontend versions
    leave_date = payload.get("date") or payload.get("leave_date")
    reason = payload.get("reason")
    
    if not (doctor_id and leave_date and reason):
        raise HTTPException(status_code=400, detail="Missing required fields: doctor_id, date, reason")
        
    leave_id = await leave_service.request_leave(doctor_id, leave_date, reason)
    if not leave_id:
        raise HTTPException(status_code=400, detail="Leave request already exists for this date.")
        
    return {"message": "Leave request submitted successfully", "id": leave_id}
