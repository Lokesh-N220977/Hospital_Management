import sys
import os
from pymongo import MongoClient

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config.config import Config

def get_db():
    """
    Returns the database object for MongoDB.
    """
    try:
        client = MongoClient(Config.MONGO_URI)
        db = client['hospital_system']
        print("Successfully connected to MongoDB")
        return db
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return None

# Export db instance
db = get_db()
