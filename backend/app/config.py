from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set")

if not DATABASE_NAME:
    raise ValueError("DATABASE_NAME is not set")

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-12345")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))