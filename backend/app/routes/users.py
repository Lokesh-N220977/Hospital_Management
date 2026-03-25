from fastapi import APIRouter, Depends, HTTPException
from app.models.user_model import (
    UserRegister, UserLogin, ChangePassword,
    SendOTPRequest, VerifyOTPRequest, EmailLoginRequest,
    SendEmailOTPRequest, VerifyEmailOTPRequest,
    UnifiedLoginRequest, GoogleLoginRequest
)
from app.services import auth_service
from app.core.dependencies import get_current_user
from app.core.logger import logger

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

# ─────────────────────────────────────────────────────────────────────
# PHONE / OTP Login Flow  (Primary)
# ─────────────────────────────────────────────────────────────────────

@router.post("/send-otp")
async def send_otp(data: SendOTPRequest):
    result = await auth_service.send_otp(data)
    return result

@router.post("/verify-otp")
async def verify_otp(data: VerifyOTPRequest):
    return await auth_service.verify_otp(data)

@router.post("/send-email-otp")
async def send_email_otp(data: SendEmailOTPRequest):
    return await auth_service.send_email_otp(data)

@router.post("/verify-email-otp")
async def verify_email_otp(data: VerifyEmailOTPRequest):
    return await auth_service.verify_email_otp(data)


# ─────────────────────────────────────────────────────────────────────
# EMAIL / Password Login  (Secondary)
# ─────────────────────────────────────────────────────────────────────

@router.post("/login-email")
async def login_email(data: EmailLoginRequest):
    return await auth_service.login_email(data)

@router.post("/login-unified")
async def login_unified(data: UnifiedLoginRequest):
    return await auth_service.login_unified(data)

@router.post("/google-login")
async def google_login(data: GoogleLoginRequest):
    return await auth_service.login_google(data)

# ─────────────────────────────────────────────────────────────────────
# Legacy phone+password login  (kept for admin & doctor compatibility)
# ─────────────────────────────────────────────────────────────────────

@router.post("/login")
async def login_user(user: UserLogin):
    return await auth_service.login(user)

@router.post("/register")
async def register_user(user: UserRegister):
    await auth_service.register(user)
    return {"message": "User registered successfully"}

# ─────────────────────────────────────────────────────────────────────
# Profile & Password Management
# ─────────────────────────────────────────────────────────────────────

@router.put("/change-password")
async def change_password_route(data: ChangePassword, current_user=Depends(get_current_user)):
    await auth_service.change_password(str(current_user["_id"]), data.old_password, data.new_password)
    return {"message": "Password updated successfully"}

@router.get("/my-profile")
async def profile(current_user=Depends(get_current_user)):
    logger.info(f"Profile fetched for: {current_user.get('phone')}")
    return current_user

@router.put("/my-profile")
async def update_profile(update_data: dict, current_user=Depends(get_current_user)):
    await auth_service.update_user_profile(str(current_user["_id"]), update_data)
    return {"message": "Profile updated successfully"}

@router.delete("/my-account")
async def delete_my_account(current_user=Depends(get_current_user)):
    """Soft delete/suspend account: keep data for analytics but mark inactive and cancel future bookings."""
    from app.database import users_collection, patients_collection, appointments_collection
    from datetime import datetime
    from bson import ObjectId
    
    user_id = str(current_user["_id"])
    now = datetime.utcnow()
    
    # 1. Set user inactive
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "is_active": False,
            "status": "deleted",
            "deactivated_at": now,
            "updated_at": now
        }}
    )
    
    # 2. Find all patients belonging to this user
    user_patients = await patients_collection.find({"user_id": user_id}).to_list(1000)
    patient_ids = [str(p["_id"]) for p in user_patients]
    
    if patient_ids:
        # 3. Mark patient record inactive
        await patients_collection.update_many(
            {"user_id": user_id},
            {"$set": {
                "is_active": False,
                "status": "suspended",
                "deactivated_at": now
            }}
        )
        
        # 4. Cancel all upcoming appointments for these patients
        now_str = now.strftime("%Y-%m-%d")
        await appointments_collection.update_many(
            {
                "patient_id": {"$in": patient_ids},
                "status": "booked", 
                "date": {"$gte": now_str}
            },
            {"$set": {
                "status": "cancelled", 
                "cancel_reason": "User account deactivated.",
                "cancelled_by": "system",
                "updated_at": now
            }}
        )
        
    logger.info(f"Account suspended/inactivated: {user_id}")
    return {"message": "Account suspended successfully. We will keep your medical records safe for your next visit."}