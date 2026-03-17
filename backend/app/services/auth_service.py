from fastapi import HTTPException
from app.database import users_collection
from app.core.security import hash_password, verify_password
from app.core.auth_utils import create_access_token
from app.core.logger import logger

async def register(user_data_obj):
    existing_user = await users_collection.find_one({"email": user_data_obj.email})
    if existing_user:
        logger.warning(f"Registration failed: Email {user_data_obj.email} already exists")
        raise HTTPException(status_code=400, detail="User already exists")

    user_data = user_data_obj.dict()
    user_data["password"] = hash_password(user_data_obj.password)
    user_data["role"] = "patient"  # Default role
    user_data["is_active"] = True
    
    await users_collection.insert_one(user_data)
    logger.info(f"New user registered: {user_data_obj.email}")
    return True

async def login(login_data_obj):
    db_user = await users_collection.find_one({"email": login_data_obj.email})
    if not db_user or not verify_password(login_data_obj.password, db_user["password"]):
        logger.warning(f"Login failed: Invalid credentials for {login_data_obj.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not db_user.get("is_active", True):
        logger.warning(f"Login failed: Account inactive for {login_data_obj.email}")
        raise HTTPException(status_code=403, detail="Account is inactive")

    token = create_access_token({"sub": db_user["email"], "role": db_user["role"]})
    logger.info(f"User logged in: {login_data_obj.email} with role {db_user['role']}")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user["role"],
        "email": db_user["email"],
        "name": db_user.get("name")
    }
