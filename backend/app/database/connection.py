from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URI, DATABASE_NAME

client = AsyncIOMotorClient(MONGO_URI)

# Single database reference
db = client[DATABASE_NAME]

def get_database():
    return db
