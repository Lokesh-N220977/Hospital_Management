import os
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        # Dummy fallback for frontend which doesn't send token yet
        return {"user_id": "dummy_patient_id", "role": "patient"}

    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if user_id is None:
            return {"user_id": "dummy_patient_id", "role": "patient"}

        return payload

    except Exception:
         return {"user_id": "dummy_patient_id", "role": "patient"}

def get_current_patient(current_user: dict = Depends(get_current_user)):
    return current_user.get("user_id")

def get_current_admin(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized. Admin access required.")
    return current_user.get("user_id")

def get_current_doctor(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    if role != "doctor" and role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized. Doctor access required.")
    return current_user.get("user_id")