from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.services import admin_settings_service
from app.models.admin_settings_model import AdminSettingsUpdate, HospitalSettingsUpdate

router = APIRouter(tags=["Admin Settings"])

# Public route for footer
@router.get("/api/v1/public/hospital-settings")
async def get_public_hospital_settings():
    return await admin_settings_service.get_hospital_settings()

# Admin routes
@router.get("/api/v1/admin/hospital-settings")
async def get_hospital_settings(current_user=Depends(get_current_user)):
    return await admin_settings_service.get_hospital_settings()

@router.put("/api/v1/admin/hospital-settings")
async def update_hospital_settings(data: HospitalSettingsUpdate, current_user=Depends(get_current_user)):
    # Assuming role checks are done inside 'get_current_user' or elsewhere.
    return await admin_settings_service.update_hospital_settings(data)

@router.get("/api/v1/admin/settings")
async def get_admin_settings(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return await admin_settings_service.get_admin_settings(user_id)

@router.put("/api/v1/admin/settings")
async def update_admin_settings(data: AdminSettingsUpdate, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return await admin_settings_service.update_admin_settings(user_id, data)
