from fastapi import APIRouter, HTTPException, Depends
from app.core.role_checker import get_admin_user
from app.database import doctor_leaves_collection
from app.models.doctor_model import DoctorCreate, DoctorUpdate
from app.services import leave_service, analytics_service, doctor_service
from app.core.logger import logger

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"], dependencies=[Depends(get_admin_user)])

@router.post("/add-doctor")
async def add_doctor(doctor: DoctorCreate):
    logger.info(f"Admin adding new doctor: {doctor.email}")
    await doctor_service.create_doctor(doctor)
    return {"message": "Doctor account and profile created successfully"}

@router.get("/leave-requests")
async def view_leave_requests():
    logger.info("Admin fetching pending leave requests")
    requests = []
    async for leave in doctor_leaves_collection.find({"status": "pending"}):
        leave["_id"] = str(leave["_id"])
        requests.append(leave)
    return requests

@router.put("/leave/{leave_id}/approve")
async def approve_doctor_leave(leave_id: str):
    logger.info(f"Admin approving leave: {leave_id}")
    success = await leave_service.approve_leave(leave_id)
    if not success:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return {"message": "Leave approved and appointments cancelled"}

@router.get("/analytics")
async def get_analytics():
    return await analytics_service.get_system_analytics()

@router.put("/update-doctor/{doctor_id}")
async def update_doctor(doctor_id: str, data: DoctorUpdate):
    logger.info(f"Admin updating doctor: {doctor_id}")
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
        
    success = await doctor_service.update_doctor_profile(doctor_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Doctor not found or no changes made")
    return {"message": "Doctor profile updated"}

