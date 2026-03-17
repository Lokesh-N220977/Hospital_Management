from datetime import datetime, timedelta
from jose import jwt
from app.config import JWT_SECRET, ACCESS_TOKEN_EXPIRE_MINUTES

ALGORITHM = "HS256"
SECRET_KEY = JWT_SECRET



def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt