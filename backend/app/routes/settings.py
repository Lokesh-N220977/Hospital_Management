from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.services import patient_settings_service
from app.models.patient_settings_model import PatientSettingsUpdate

router = APIRouter(prefix="/api/v1/patient", tags=["Settings"])

@router.get("/settings")
async def get_settings(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return await patient_settings_service.get_patient_settings(user_id)

@router.put("/settings")
async def update_settings(data: PatientSettingsUpdate, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return await patient_settings_service.update_patient_settings(user_id, data)
