from fastapi import HTTPException
from app.database import users_collection, patients_collection, otp_collection
from app.core.security import hash_password, verify_password
from bson import ObjectId
from app.core.auth_utils import create_access_token
from app.core.logger import logger
from datetime import datetime, timedelta
import random

# --- OTP GENERATION & HELPERS ---

def generate_otp_code():
    return str(random.randint(100000, 999999))

async def send_otp(send_data):
    phone = send_data.phone
    otp_code = generate_otp_code()
    
    # Store OTP in DB
    otp_record = {
        "phone": phone,
        "otp_code": otp_code,
        "expires_at": datetime.utcnow() + timedelta(minutes=5),
        "created_at": datetime.utcnow()
    }
    
    await otp_collection.delete_many({"phone": phone}) # Clear previous
    await otp_collection.insert_one(otp_record)
    
    # Mock SMS
    logger.info(f"--- MOCK SMS SENT TO {phone} ---")
    logger.info(f"Verification Code: {otp_code}")
    logger.info(f"-------------------------------")
    
    return {"message": "OTP sent successfully", "phone": phone}

async def verify_otp(verify_data):
    phone = verify_data.phone
    otp = verify_data.otp
    
    # 1. Check OTP in DB
    record = await otp_collection.find_one({"phone": phone, "otp_code": otp})
    
    if not record:
        logger.warning(f"OTP verification failed: Invalid code for {phone}")
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    if record["expires_at"] < datetime.utcnow():
        logger.warning(f"OTP verification failed: Expired code for {phone}")
        raise HTTPException(status_code=400, detail="OTP code expired")

    # 2. Check if user exists
    user = await users_collection.find_one({"phone": phone})
    
    if not user:
        # AUTO-REGISTER via Phone verification
        logger.info(f"Phone verified for new user {phone}. Creating account...")
        user_data = {
            "name": "User_" + phone[-4:],
            "phone": phone,
            "role": "patient",
            "is_phone_verified": True,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        user_res = await users_collection.insert_one(user_data)
        user_id = str(user_res.inserted_id)
        user = await users_collection.find_one({"_id": user_res.inserted_id})
        
        # Link existing patients or create new one
        await _link_patient_to_user(user_id, phone, user_data["name"])
    
    # 3. Clean up OTP
    await otp_collection.delete_many({"phone": phone})
    
    # 4. Generate Token
    token = create_access_token({"sub": user["phone"], "id": str(user["_id"]), "role": user["role"]})
    
    return {
        "access_token": token,
        "user": {
            "id": str(user["_id"]),
            "phone": user["phone"],
            "role": user["role"],
            "name": user.get("name")
        }
    }

# --- EMAIL LOGIN & IDENTITY ---

async def login_email(login_data):
    email = login_data.email
    password = login_data.password
    role = login_data.role
    
    user = await users_collection.find_one({"email": email})
    
    if not user:
        logger.warning(f"Email login failed: {email} not found")
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if user.get("role", "").lower() != role.lower():
        logger.warning(f"Email login failed: Role mismatch for {email}")
        raise HTTPException(status_code=403, detail="Role mismatch. Access denied.")
        
    if not user.get("password"):
        logger.warning(f"Email login failed: No password set for {email}")
        raise HTTPException(status_code=401, detail="Please use phone login to set up your password first")

    if not verify_password(password, user["password"]):
        logger.warning(f"Email login failed: Invalid password for {email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    token = create_access_token({"sub": user.get("phone", email), "id": str(user["_id"]), "role": user["role"]})
    
    return {
        "access_token": token,
        "user": {
            "id": str(user["_id"]),
            "phone": user.get("phone"),
            "email": user.get("email"),
            "role": user["role"],
            "name": user.get("name")
        }
    }

# --- HELPERS ---

async def _link_patient_to_user(user_id, phone, name):
    # Check if Admin already created patient(s) with this phone (walk-ins)
    existing_patients = await patients_collection.find({"phone": phone}).to_list(100)
    
    if existing_patients:
        # Link ALL patients with this phone to this user account
        await patients_collection.update_many(
            {"phone": phone},
            {"$set": {"user_id": user_id}}
        )
        logger.info(f"Linked {len(existing_patients)} existing patients to User {user_id}")
    else:
        # Create NEW patient record for the user themselves
        patient_data = {
            "name": name,
            "phone": phone,
            "user_id": user_id,
            "created_by": "self",
            "created_at": datetime.utcnow()
        }
        await patients_collection.insert_one(patient_data)
        logger.info(f"Created new primary patient record for User {user_id}")

# --- LEGACY / OTHER METHODS ---

async def register(user_data_obj):
    # Check phone
    if user_data_obj.phone:
        existing_phone = await users_collection.find_one({"phone": user_data_obj.phone})
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone already registered")
            
    # Check email
    if user_data_obj.email:
        existing_email = await users_collection.find_one({"email": user_data_obj.email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")

    user_data = {
        "name": user_data_obj.name,
        "phone": user_data_obj.phone,
        "email": user_data_obj.email,
        "password": hash_password(user_data_obj.password) if user_data_obj.password else None,
        "role": user_data_obj.role or "patient",
        "is_active": True,
        "created_at": datetime.utcnow()
    }

    user_res = await users_collection.insert_one(user_data)
    user_id = str(user_res.inserted_id)
    
    if user_data["role"] == "patient":
        await _link_patient_to_user(user_id, user_data_obj.phone, user_data_obj.name)

    logger.info(f"Manual registration: {user_data_obj.phone or user_data_obj.email}")
    return True

# Keep existing login logic for backward compatibility or direct use
async def login(login_data_obj):
    # This was phone based
    db_user = await users_collection.find_one({"phone": login_data_obj.phone})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid phone or password")
    if not verify_password(login_data_obj.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = create_access_token({"sub": db_user["phone"], "id": str(db_user["_id"]), "role": db_user["role"]})
    return {"token": token, "user": {"id": str(db_user["_id"]), "name": db_user.get("name"), "role": db_user["role"]}}

async def change_password(user_id: str, old_password: str, new_password: str):
    db_user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(old_password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    new_hashed = hash_password(new_password)
    await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": new_hashed}})
    return True

async def update_user_profile(user_id: str, update_data: dict):
    # Only allow safe fields
    safe_data = {k: v for k, v in update_data.items() if k in ["name", "email", "gender"]}
    if not safe_data: return False
    await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": safe_data})
    return True
