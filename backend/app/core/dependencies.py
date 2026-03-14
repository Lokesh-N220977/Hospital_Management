from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.database import users_collection
from app.core.auth_utils import SECRET_KEY, ALGORITHM

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        email = payload.get("sub")

        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token verification failed")

    user = await users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "gender": user.get("gender"),
        "role": user.get("role")
    }