from fastapi import APIRouter, Depends
from app.admin.analytics import analytics_service
from app.core.role_checker import get_admin_user

router = APIRouter(prefix="/api/v1/admin/analytics", tags=["Admin Analytics"])

@router.get("/overview")
async def overview(current_user: dict = Depends(get_admin_user)):
    return {"success": True, "data": await analytics_service.get_overview()}

@router.get("/daily")
async def daily(days: int = 7, current_user: dict = Depends(get_admin_user)):
    return {"success": True, "data": await analytics_service.get_daily_trend(days)}

@router.get("/doctors")
async def doctors(current_user: dict = Depends(get_admin_user)):
    return {"success": True, "data": await analytics_service.get_doctor_workload()}

@router.get("/slots")
async def slots(current_user: dict = Depends(get_admin_user)):
    return {"success": True, "data": await analytics_service.get_peak_slots()}

@router.get("/patients")
async def patients(current_user: dict = Depends(get_admin_user)):
    return {"success": True, "data": await analytics_service.get_patient_activity()}
