from fastapi import APIRouter, Depends, HTTPException
from app.core.role_checker import get_doctor_user
from app.models.schedule import DoctorScheduleUpdate, LeaveCreate
from app.services import leave_service, doctor_service, scheduling_service
from app.core.logger import logger
from typing import List

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
        "consultation_fee": doctor.get("consultation_fee"),
        "bio": doctor.get("bio", "No bio provided yet."),
        "education": doctor.get("education", []),
        "certifications": doctor.get("certifications", []),
        "location": doctor.get("location", "Not specified"),
        "languages": doctor.get("languages", ["English"]),
        "profile_img": doctor.get("profile_img")
    }

@router.get("/leave")
async def get_leaves(current_user=Depends(get_doctor_user)):
    """Get all leave requests for the doctor."""
    doctor = await doctor_service.get_doctor_by_user_id(str(current_user["_id"]))
    if not doctor:
        return []
    return await leave_service.get_doctor_leaves(doctor["_id"])

@router.post("/leave")
async def add_leave(leave: LeaveCreate, current_user=Depends(get_doctor_user)):
    """Request a new leave."""
    doctor = await doctor_service.get_doctor_by_user_id(str(current_user["_id"]))
    if not doctor or doctor["_id"] != leave.doctor_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    leave_id = await leave_service.request_leave(leave.doctor_id, leave.date, leave.reason or "No reason provided")
    if not leave_id:
        raise HTTPException(status_code=400, detail="Leave already exists for this date.")
    return {"message": "Leave requested", "leave_id": leave_id}
