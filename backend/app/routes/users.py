from fastapi import APIRouter, HTTPException
from app.database import database
from app.schemas.user_schema import UserCreate, UserUpdate
from app.schemas.login_schema import UserLogin
from app.utils.hash import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from fastapi import Depends
from bson import ObjectId
from app.utils.auth import get_current_patient


router = APIRouter()

@router.post("/register")
async def register_user(user: UserCreate):

    existing_user = await database.users.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "phone": user.phone,
        "role": "patient"
    }

    result = await database.users.insert_one(new_user)

    return {"message": "User registered successfully", "id": str(result.inserted_id)}

from app.schemas.login_schema import UserLogin
from app.utils.hash import verify_password
from app.utils.jwt_handler import create_access_token


@router.post("/login")
async def login_user(user: UserLogin):

    db_user = await database.users.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_access_token({
        "user_id": str(db_user["_id"]),
        "role": db_user.get("role", "patient")
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/user/profile")
async def get_profile(user_id: str = Depends(get_current_patient)):

    # if dummy user id, return some mock data as frontend expects
    if user_id == "dummy_patient_id":
        return {
            "id": 'PT-89420',
            "fullName": 'Dummy Fallback User',
            "email": 'dummy@example.com',
            "phone": '+1 415 555 2671',
            "dob": '1985-06-15',
            "gender": 'Male',
            "bloodGroup": 'O+',
            "emergencyContact": 'Emergency Contact (+1 415 555 9812)',
            "address": '123 Health Ave, Wellness City, CA 94102'
        }

    try:
        user = await database.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["_id"] = str(user["_id"])
    
    # Map backend user format to frontend expected format
    profile_data = {
        "id": str(user["_id"]),
        "fullName": user.get("fullName", user.get("name", "")),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "dob": user.get("dob", ""),
        "gender": user.get("gender", ""),
        "bloodGroup": user.get("bloodGroup", ""),
        "emergencyContact": user.get("emergencyContact", ""),
        "address": user.get("address", "")
    }

    return profile_data

from app.schemas.user_schema import UserProfileUpdate

@router.put("/user/profile")
async def update_profile(
    profile_update: UserProfileUpdate, 
    user_id: str = Depends(get_current_patient)
):
    if user_id == "dummy_patient_id":
        return {"message": "Dummy profile updated successfully (simulated)."}

    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    
    if not update_data:
         return {"message": "No data provided to update"}

    try:
         result = await database.users.update_one(
             {"_id": ObjectId(user_id)},
             {"$set": update_data}
         )
         if result.modified_count == 0:
              raise HTTPException(status_code=400, detail="Profile update failed or no changes made")
         return {"message": "Profile updated successfully"}
    except Exception as e:
         raise HTTPException(status_code=400, detail=str(e))

