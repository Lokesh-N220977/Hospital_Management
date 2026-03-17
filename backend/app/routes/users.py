from fastapi import APIRouter, Depends
from app.models.user_model import UserRegister, UserLogin
from app.services import auth_service
from app.core.dependencies import get_current_user
from app.core.logger import logger

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

@router.post("/register")
async def register_user(user: UserRegister):
    await auth_service.register(user)
    return {"message": "User registered successfully"}

@router.post("/login")
async def login_user(user: UserLogin):
    return await auth_service.login(user)

@router.get("/my-profile")
async def profile(current_user=Depends(get_current_user)):
    logger.info(f"Profile fetched for: {current_user.get('email')}")
    return current_user