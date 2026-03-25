from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from bson import ObjectId

from app.database import users_collection
from app.core.auth_utils import SECRET_KEY, ALGORITHM

security = HTTPBearer()

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")      # MongoDB ObjectId string — most reliable
        sub = payload.get("sub")         # phone or email depending on login method

        if not user_id and not sub:
            raise HTTPException(status_code=401, detail="Invalid token payload")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token verification failed")

    # ── Primary: look up by MongoDB ID (present in ALL tokens we generate) ──
    user = None
    if user_id:
        try:
            user = await users_collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            pass

    # ── Fallback: look up by sub (phone or email) if ID lookup fails ──
    if not user and sub:
        # Try phone first, then email
        user = await users_collection.find_one({"phone": sub})
        if not user:
            user = await users_collection.find_one({"email": sub})

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    current_user = {
        "_id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "gender": user.get("gender"),
        "role": user.get("role"),
        "must_change_password": user.get("must_change_password", False)
    }

    # Security rule: enforce password change on non-GET protected routes
    if current_user.get("must_change_password"):
        if request.method != "GET" and request.url.path != "/api/v1/auth/change-password":
            print(f"DEBUG: BLOCKED PATH {request.method} {request.url.path} due to must_change_password")
            raise HTTPException(status_code=403, detail="Password change required")

    return current_user