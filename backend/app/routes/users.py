from fastapi import APIRouter, Depends, HTTPException
from app.models.user_model import (
    UserRegister, UserLogin, ChangePassword,
    SendOTPRequest, VerifyOTPRequest, EmailLoginRequest
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

# ─────────────────────────────────────────────────────────────────────
# EMAIL / Password Login  (Secondary)
# ─────────────────────────────────────────────────────────────────────

@router.post("/login-email")
async def login_email(data: EmailLoginRequest):
    return await auth_service.login_email(data)

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
    """Soft delete account: anonymize data, cancel future appointments, keep medical history."""
    from app.database import users_collection, patients_collection, appointments_collection
    from datetime import datetime
    from bson import ObjectId
    
    user_id = str(current_user["_id"])
    timestamp = int(datetime.utcnow().timestamp())
    deleted_marker = f"deleted_{user_id}_{timestamp}"
    
    # 1. Anonymize user and set inactive
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "name": "Deleted User",
            "phone": deleted_marker,
            "email": f"{deleted_marker}@deleted.local",
            "password": None,
            "is_active": False,
            "deleted_at": datetime.utcnow()
        }}
    )
    
    # 2. Find all patients belonging to this user
    user_patients = await patients_collection.find({"user_id": user_id}).to_list(1000)
    patient_ids = [str(p["_id"]) for p in user_patients]
    
    if patient_ids:
        # 3. Anonymize patient identities and lock them
        await patients_collection.update_many(
            {"user_id": user_id},
            {"$set": {
                "name": "Deleted Patient",
                "phone": deleted_marker,
                "email": None,
                "is_active": False,
                "deleted_at": datetime.utcnow()
            }}
        )
        
        # 4. Cancel all upcoming appointments for these patients
        now_str = datetime.utcnow().strftime("%Y-%m-%d")
        await appointments_collection.update_many(
            {
                "patient_id": {"$in": patient_ids},
                "status": "booked", 
                "date": {"$gte": now_str}
            },
            {"$set": {"status": "cancelled", "notes": "Account deactivated."}}
        )
        
    logger.info(f"Account softly deleted & anonymized: {user_id}")
    return {"message": "Account deleted successfully"}