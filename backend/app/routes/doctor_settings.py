from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.services import doctor_settings_service
from app.models.doctor_settings_model import DoctorSettingsUpdate

router = APIRouter(prefix="/api/v1/doctor", tags=["Settings"])

@router.get("/settings")
async def get_doctor_settings(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return await doctor_settings_service.get_doctor_settings(user_id)

@router.put("/settings")
async def update_doctor_settings(data: DoctorSettingsUpdate, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return await doctor_settings_service.update_doctor_settings(user_id, data)
