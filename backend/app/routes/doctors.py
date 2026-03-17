from fastapi import APIRouter, Depends
from app.core.role_checker import get_doctor_user
from app.models.leave_model import DoctorLeaveCreate
from app.services import leave_service, doctor_service, scheduling_service
from app.core.logger import logger

from typing import Optional

router = APIRouter(prefix="/api/v1/doctors", tags=["Doctors"])

@router.get("/")
async def get_all_doctors(specialization: Optional[str] = None):

    logger.info("Fetching all available doctors")
    return await doctor_service.get_doctors(specialization)

@router.get("/{doctor_id}/slots")
async def get_slots(doctor_id: str, date: str):
    logger.info(f"Fetching slots for doctor {doctor_id} on {date}")
    slots = await scheduling_service.get_available_slots(doctor_id, date)
    if not slots:
        return {"message": "No slots available for this date", "slots": []}
    return {"slots": slots}

@router.post("/request-leave")
async def request_leave(leave: DoctorLeaveCreate, current_user=Depends(get_doctor_user)):
    logger.info(f"Doctor {current_user['email']} requesting leave for {leave.leave_date}")
    leave_id = await leave_service.request_leave(leave.doctor_id, leave.leave_date, leave.reason)
    return {"message": "Leave request submitted", "leave_id": leave_id}

