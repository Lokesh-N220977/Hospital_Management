from fastapi import APIRouter, Depends
from app.core.role_checker import get_doctor_user
from app.models.leave_model import DoctorLeaveCreate
from app.models.schedule import DoctorScheduleUpdate, ManualAvailabilityCreate
from app.services import leave_service, doctor_service, scheduling_service
from app.core.logger import logger
from app.database import doctors_collection
from bson import ObjectId

from typing import Optional

router = APIRouter(prefix="/api/v1/doctors", tags=["Doctors"])

@router.get("/stats")
async def get_public_stats():
    from app.services import analytics_service
    stats = await analytics_service.get_system_analytics()
    # Return only public-safe stats
    return {
        "total_doctors": stats["total_doctors"],
        "total_patients": stats["total_patients"],
        "total_appointments": stats["total_appointments"]
    }

@router.get("/")
async def get_all_doctors(
    specialization: Optional[str] = None, 
    location: Optional[str] = None,
    min_experience: Optional[int] = None
):
    logger.info(f"Fetching doctors with filters - spec: {specialization}, loc: {location}, min_exp: {min_experience}")
    return await doctor_service.get_doctors(specialization, location, min_experience)

@router.get("/specializations")
async def get_specializations():
    return await doctor_service.get_distinct_specializations()

@router.get("/locations")
async def get_locations():
    return await doctor_service.get_distinct_locations()

@router.get("/{doctor_id}/slots")
async def get_slots(doctor_id: str, date: str):
    logger.info(f"Fetching slots for doctor {doctor_id} on {date}")
    slots = await scheduling_service.get_available_slots(doctor_id, date)
    return {"slots": slots}

@router.get("/profile/me")
async def get_my_profile(current_user=Depends(get_doctor_user)):
    logger.info(f"Fetching profile for doctor user: {current_user['email']}")
    doctor_profile = await doctor_service.get_doctor_by_user_id(str(current_user["_id"]))
    if not doctor_profile:
        return {
            "doctor_id": None,
            "user_id": str(current_user["_id"]),
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "specialization": "Not Set",
            "experience": 0
        }
    
    return {
        "doctor_id": doctor_profile["_id"],
        "user_id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "specialization": doctor_profile.get("specialization", "General"),
        "experience": doctor_profile.get("experience", 0),
        "phone": current_user.get("phone", "N/A")
    }

@router.post("/request-leave")
async def request_leave(leave: DoctorLeaveCreate, current_user=Depends(get_doctor_user)):
    logger.info(f"Doctor {current_user['email']} requesting leave for {leave.leave_date}")
    leave_id = await leave_service.request_leave(leave.doctor_id, leave.leave_date, leave.reason)
    return {"message": "Leave request submitted", "leave_id": leave_id}
