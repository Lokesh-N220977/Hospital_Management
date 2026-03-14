from fastapi import APIRouter, HTTPException, Depends
from app.database import users_collection
from app.models.user_model import UserRegister, UserLogin
from app.core.security import hash_password, verify_password
from app.core.auth_utils import create_access_token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register")
async def register_user(user: UserRegister):

    existing_user = await users_collection.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user_data = {
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "gender": user.gender,
        "password": hash_password(user.password),
        "role": "patient"
    }

    await users_collection.insert_one(user_data)

    return {"message": "User registered successfully"}

@router.post("/login")
async def login_user(user: UserLogin):

    db_user = await users_collection.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        {
            "sub": db_user["email"],
            "role": db_user["role"]
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user["role"],
        "email": db_user["email"]
    }


@router.get("/my-profile")
async def profile(current_user=Depends(get_current_user)):
    return current_user