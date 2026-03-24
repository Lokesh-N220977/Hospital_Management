import sys
import os
import pymongo
from dotenv import load_dotenv

# Add parent directory to sys.path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

def check_pymongo():
    print(f"Pinging MongoDB with blocking pymongo...")
    try:
        # Connect with a short timeout
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("Ping successful!")
        
        db_name = os.getenv("DATABASE_NAME")
        db = client[db_name]
        print(f"Database: {db.name}")
        print(f"Collections: {db.list_collection_names()}")
        
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False

if __name__ == "__main__":
    check_pymongo()
