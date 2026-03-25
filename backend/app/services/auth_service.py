from fastapi import HTTPException
from app.database import users_collection, patients_collection, otp_collection
from app.core.security import hash_password, verify_password
from bson import ObjectId
from app.core.auth_utils import create_access_token
from app.core.logger import logger
from datetime import datetime, timedelta
import random
import smtplib
from email.message import EmailMessage
from app.config import (
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, 
    SMS_GATEWAY_URL, SMS_GATEWAY_USER, SMS_GATEWAY_KEY,
    GOOGLE_CLIENT_ID
)
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# --- OTP GENERATION & HELPERS ---

def generate_otp_code():
    return str(random.randint(100000, 999999))

async def send_sms_gateway(phone: str, otp: str):
    """Sends SMS using a local Android SMS Gateway API."""
    if not SMS_GATEWAY_URL:
        logger.warning(f"--- SMS GATEWAY NOT CONFIGURED. MOCK SMS TO {phone}: {otp} ---")
        return False
        
    # Normalize phone: extract last 10 digits
    clean_phone = "".join(filter(str.isdigit, str(phone)))
    if len(clean_phone) > 10:
        clean_phone = clean_phone[-10:]
    
    # Use 10-digit format (some local gateways in India prefer this over +91)
    full_phone = clean_phone
        
    # Message content (Very concise to avoid DLT blocks in India)
    message = f"MedicPulse OTP: {otp}"
    
    # Payload for 'SMS Gateway for Android' (capcom6)
    payload = {
        "phoneNumbers": [full_phone],
        "message": message,
        "simIndex": 0  # Explicitly use the first SIM slot
    }
    
    headers = {}
    if SMS_GATEWAY_KEY:
        if SMS_GATEWAY_USER:
            import base64
            auth_str = f"{SMS_GATEWAY_USER}:{SMS_GATEWAY_KEY}"
            auth_b64 = base64.b64encode(auth_str.encode("ascii")).decode("ascii")
            headers["Authorization"] = f"Basic {auth_b64}"
        else:
            headers["Authorization"] = f"Bearer {SMS_GATEWAY_KEY}" # Fallback to Bearer

    try:
        async with httpx.AsyncClient() as client:
            # The app uses /messages endpoint by default
            url = SMS_GATEWAY_URL.rstrip("/")
            if "/messages" not in url:
                url = url + "/messages"
                
            logger.info(f"Connecting to SMS Gateway: {url}")
            if "Authorization" in headers:
                logger.info(f"Auth header present: {headers['Authorization'][:10]}...")
            else:
                logger.warning("No Authorization header being sent!")
                
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)
            logger.info(f"Gateway Response: Status {response.status_code}, Body: {response.text[:50]}")
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"--- REAL SMS SENT TO {full_phone} via Gateway ---")
                return True
            else:
                logger.error(f"SMS Gateway Error: Status {response.status_code}, Response: {response.text}")
                return False
    except Exception as e:
        logger.error(f"SMS Gateway Exception: {str(e)}")
        return False

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
    
    # Send REAL SMS via Gateway
    sms_sent = await send_sms_gateway(phone, otp_code)
    
    # Mock fallback for logs
    if not sms_sent:
        logger.info(f"--- MOCK SMS SENT (Fallback) TO {phone} ---")
        logger.info(f"Verification Code: {otp_code}")
        logger.info(f"-------------------------------")
    
    return {"message": "OTP sent successfully", "phone": phone, "real_sms": sms_sent}

async def send_email_otp(send_data):
    email = send_data.email
    otp_code = generate_otp_code()
    
    # Store OTP in DB
    otp_record = {
        "email": email,
        "otp_code": otp_code,
        "expires_at": datetime.utcnow() + timedelta(minutes=5),
        "created_at": datetime.utcnow()
    }
    
    await otp_collection.delete_many({"email": email}) # Clear previous
    await otp_collection.insert_one(otp_record)
    
    # Send REAL Email
    if not SMTP_USER or not SMTP_PASS:
        logger.warning(f"--- SMTP NOT CONFIGURED. MOCK EMAIL SENT TO {email} ---")
        logger.info(f"Verification Code: {otp_code}")
        return {"message": "Verification code sent (MOCK)", "email": email}

    try:
        msg = EmailMessage()
        msg.set_content(f"Your MedicPulse verification code is: {otp_code}. This code will expire in 5 minutes.")
        msg["Subject"] = "MedicPulse: Your Email Verification Code"
        msg["From"] = SMTP_USER
        msg["To"] = email

        # Correctly join the task of sending email
        import asyncio
        loop = asyncio.get_event_loop()
        
        def _send() -> None:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
        
        # Run synchronous SMTP in a thread to not block the event loop
        await loop.run_in_executor(None, _send)
        
        logger.info(f"--- REAL EMAIL SENT TO {email} ---")
        return {"message": "Verification code sent successfully to your email", "email": email}
        
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        # Fallback to mock for development if needed, or raise error
        # return {"message": "Verification code sent (MOCKED DUE TO ERROR)", "email": email}
        raise HTTPException(status_code=500, detail="Failed to send verification email. Please check your SMTP settings.")

async def verify_email_otp(verify_data):
    email = verify_data.email
    otp = verify_data.otp
    
    record = await otp_collection.find_one({"email": email, "otp_code": otp})
    
    if not record:
        logger.warning(f"Email OTP verification failed: Invalid code for {email}")
        raise HTTPException(status_code=400, detail="Invalid verification code")
        
    if record["expires_at"] < datetime.utcnow():
        logger.warning(f"Email OTP verification failed: Expired code for {email}")
        raise HTTPException(status_code=400, detail="Verification code expired")

    # Clean up OTP
    await otp_collection.delete_many({"email": email})
    
    return {"status": "success", "message": "Email verified successfully"}

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
            "name": "User_" + str(phone)[-4:],
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
    
    # If user was suspended, DO NOT allow login. User must re-register to reactivate.
    if not user.get("is_active", True):
        logger.warning(f"Login attempted on deleted account: {phone}")
        raise HTTPException(
            status_code=403, 
            detail="Account deleted. Please register again to reactivate."
        )
    
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
        
    if not user.get("is_active", True):
        logger.warning(f"Email login attempted on deleted account: {email}")
        raise HTTPException(status_code=403, detail="Account deleted. Please register again to reactivate.")
        
    if user.get("role", "").lower() != role.lower():
        logger.warning(f"Email login failed: Role mismatch for {email}")
        raise HTTPException(status_code=403, detail="Role mismatch. Access denied.")
    
    # Verification check for doctors
    if role.lower() == "doctor":
        from app.database import doctors_collection
        doctor_profile = await doctors_collection.find_one({"user_id": str(user["_id"])})
        if not doctor_profile or doctor_profile.get("verification_status") != "VERIFIED":
            logger.warning(f"Login denied: Doctor {email} is not VERIFIED")
            raise HTTPException(status_code=403, detail="Account pending verification. Please contact administrator.")
        
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
            "name": user.get("name"),
            "must_change_password": user.get("must_change_password", False)
        }
    }

async def login_unified(login_data):
    identifier = login_data.identifier
    password = login_data.password
    role = login_data.role
    
    # Detect if email or phone
    is_email = "@" in identifier
    
    if not is_email and role == "patient":
        raise HTTPException(
            status_code=400, 
            detail="Patients must log in using their email address. Phone login is not supported."
        )
    
    if is_email:
        query = {"email": identifier.lower()}
    else:
        # Normalize phone: extract digits, keep last 10
        clean_phone = "".join(filter(str.isdigit, identifier))
        if len(clean_phone) > 10:
            clean_phone = clean_phone[-10:]
        elif len(clean_phone) < 10:
             raise HTTPException(status_code=400, detail="Invalid phone number format")
        query = {"phone": clean_phone}
        
    user = await users_collection.find_one(query)
    
    if not user:
        logger.warning(f"Unified login failed: {identifier} not found")
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account deactivated")
        
    if user.get("role", "").lower() != role.lower():
        raise HTTPException(status_code=403, detail="Role mismatch")

    # Verification check for doctors
    if role.lower() == "doctor":
        from app.database import doctors_collection
        doctor_profile = await doctors_collection.find_one({"user_id": str(user["_id"])})
        if not doctor_profile or doctor_profile.get("verification_status") != "VERIFIED":
            logger.warning(f"Login denied: Doctor {identifier} is not VERIFIED")
            raise HTTPException(status_code=403, detail="Account pending verification. Please contact administrator.")

    if not user.get("password"):
        raise HTTPException(status_code=401, detail="Please set up your password via OTP login first")

    if not verify_password(password, user["password"]):
        logger.warning(f"Unified login failed: Invalid password for {identifier}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = create_access_token({"sub": user.get("phone") or user.get("email"), "id": str(user["_id"]), "role": user["role"]})
    
    return {
        "access_token": token,
        "user": {
            "id": str(user["_id"]),
            "phone": user.get("phone"),
            "email": user.get("email"),
            "role": user["role"],
            "name": user.get("name"),
            "must_change_password": user.get("must_change_password", False)
        }
    }

async def login_google(login_data):
    token = login_data.token
    role = login_data.role

    if not GOOGLE_CLIENT_ID:
        logger.error("GOOGLE_CLIENT_ID not configured")
        raise HTTPException(status_code=500, detail="Google Login not configured on server")

    try:
        # Verify Google Token
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        
        email = idinfo['email']
        name = idinfo.get('name', 'Google User')
        google_id = idinfo['sub']
        
        # Find user by email
        user = await users_collection.find_one({"email": email})
        
        if not user:
            # AUTO-REGISTER if not exists
            new_user = {
                "email": email,
                "name": name,
                "role": role,
                "google_id": google_id,
                "is_active": True,
                "created_at": datetime.utcnow()
            }
            res = await users_collection.insert_one(new_user)
            user = await users_collection.find_one({"_id": res.inserted_id})
            logger.info(f"Auto-registered new Google user: {email}")
            
            # If it's a patient, link them
            if role == "patient":
                await _link_patient_to_user(str(user["_id"]), None, name)
        else:
            # Check if role matches
            if user.get("role", "").lower() != role.lower():
                 raise HTTPException(status_code=403, detail=f"Account exists as {user.get('role')}, not {role}")
            
            # Update google_id if not present
            if not user.get("google_id"):
                await users_collection.update_one({"_id": user["_id"]}, {"$set": {"google_id": google_id}})

        token = create_access_token({"sub": email, "id": str(user["_id"]), "role": user["role"]})
        
        return {
            "access_token": token,
            "user": {
                "id": str(user["_id"]),
                "email": user.get("email"),
                "role": user["role"],
                "name": user.get("name")
            }
        }
    except ValueError as e:
        logger.error(f"Google Token Verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google Token")
    except Exception as e:
        logger.error(f"Google Login error: {e}")
        raise HTTPException(status_code=500, detail="Google Login failed")

# --- HELPERS ---

async def _link_patient_to_user(user_id, phone, name, age=None):
    # Check if Admin already created patient(s) with this phone (walk-ins)
    existing_patients = await patients_collection.find({"phone": phone}).to_list(100)
    
    if existing_patients:
        # Link ALL patients with this phone to this user account
        update_set = {"user_id": user_id}
        if age:
            update_set["age"] = age
            
        await patients_collection.update_many(
            {"phone": phone},
            {"$set": update_set}
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
        if age:
            patient_data["age"] = age
            
        await patients_collection.insert_one(patient_data)
        logger.info(f"Created new primary patient record for User {user_id}")

# --- LEGACY / OTHER METHODS ---

async def register(user_data_obj):
    # Check phone
    if user_data_obj.phone:
        existing_phone = await users_collection.find_one({"phone": user_data_obj.phone})
        if existing_phone:
            # If suspended (deleted), reactivate and START FRESH
            if not existing_phone.get("is_active", True):
                u_id_str = str(existing_phone["_id"])
                # 1. Update user to active
                await users_collection.update_one(
                    {"_id": existing_phone["_id"]},
                    {"$set": {
                        "is_active": True, 
                        "status": "active", 
                        "password": hash_password(user_data_obj.password) if user_data_obj.password else existing_phone.get("password"),
                        "reactivated_at": datetime.utcnow()
                    }}
                )
                
                # 2. Archive old patient records so they don't appear in "My Profile" or "MyAppointments"
                # We move user_id to legacy_user_id to keep the link for admin/analytics but hide from user
                await patients_collection.update_many(
                    {"user_id": u_id_str},
                    {"$set": {"legacy_user_id": u_id_str, "user_id": None, "status": "archived_history"}}
                )
                
                # 3. Create a NEW primary patient record for this "new" account session
                await _link_patient_to_user(u_id_str, user_data_obj.phone, user_data_obj.name, getattr(user_data_obj, 'age', None))
                
                logger.info(f"User {user_data_obj.phone} reactivated with a FRESH profile.")
                return True
            raise HTTPException(status_code=400, detail="Phone already registered")
            
    # Check email
    if user_data_obj.email:
        existing_email = await users_collection.find_one({"email": user_data_obj.email})
        if existing_email:
            # If suspended, reactivate
            if not existing_email.get("is_active", True):
                await users_collection.update_one(
                    {"_id": existing_email["_id"]},
                    {"$set": {
                        "is_active": True, 
                        "status": "active",
                        "password": hash_password(user_data_obj.password) if user_data_obj.password else existing_email.get("password"),
                        "reactivated_at": datetime.utcnow()
                    }}
                )
                await patients_collection.update_many(
                    {"user_id": str(existing_email["_id"])},
                    {"$set": {"is_active": True, "status": "active"}}
                )
                logger.info(f"User {user_data_obj.email} reactivated via email re-registration.")
                return True
            raise HTTPException(status_code=400, detail="Email already registered")

    user_data = {
        "name": user_data_obj.name,
        "phone": user_data_obj.phone,
        "email": user_data_obj.email,
        "password": hash_password(user_data_obj.password) if user_data_obj.password else None,
        "role": user_data_obj.role or "patient",
        "age": getattr(user_data_obj, 'age', None),
        "is_active": True,
        "created_at": datetime.utcnow()
    }

    user_res = await users_collection.insert_one(user_data)
    user_id = str(user_res.inserted_id)
    
    if user_data["role"] == "patient":
        await _link_patient_to_user(user_id, user_data_obj.phone, user_data_obj.name, user_data.get("age"))

    logger.info(f"Manual registration: {user_data_obj.phone or user_data_obj.email}")
    return True

# Keep existing login logic for backward compatibility or direct use
async def login(login_data_obj):
    # This was phone based
    db_user = await users_collection.find_one({"phone": login_data_obj.phone})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid phone or password")
        
    if not db_user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account deleted. Please register again.")
        
    if not verify_password(login_data_obj.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = create_access_token({"sub": db_user["phone"], "id": str(db_user["_id"]), "role": db_user["role"]})
    return {
        "token": token, 
        "user": {
            "id": str(db_user["_id"]), 
            "name": db_user.get("name"), 
            "role": db_user["role"],
            "must_change_password": db_user.get("must_change_password", False)
        }
    }

async def change_password(user_id: str, old_password: str, new_password: str):
    db_user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # If user has a password, verify it first
    if db_user.get("password"):
        if not verify_password(old_password, db_user["password"]):
            raise HTTPException(status_code=400, detail="Incorrect old password")
    
    new_hashed = hash_password(new_password)
    await users_collection.update_one(
        {"_id": ObjectId(user_id)}, 
        {"$set": {"password": new_hashed, "must_change_password": False}}
    )
    return {"message": "Password updated successfully"}

async def update_user_profile(user_id: str, update_data: dict):
    # Only allow safe fields for user account
    # 1. Update user account
    safe_data = {k: v for k, v in update_data.items() if k in ["name", "email", "gender", "age", "phone"]}
    if not safe_data: return False
    
    await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": safe_data})
    
    # 2. Sync with primary patient record
    patient_sync = {k: v for k, v in safe_data.items() if k in ["name", "gender", "age", "phone"]}
    if patient_sync:
        await patients_collection.update_many(
            {"user_id": user_id, "created_by": "self"},
            {"$set": patient_sync}
        )
        # Also update any other records with same phone to keep consistency across walk-ins? 
        # For now, just primary self is enough.
        
    logger.info(f"User profile synced for ID: {user_id}")
    return True
