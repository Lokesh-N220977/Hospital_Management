from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "hospital_db")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def fix_and_index():
    print(f"Connecting to database: {DB_NAME}")
    
    # 1. Handle Users Collection
    # Ensure phone is unique. If duplicates exist, we need to handle them.
    # For now, we'll just try to create the index and report errors.
    print("Creating unique index on users.phone...")
    try:
        db.users.create_index("phone", unique=True)
        print("Success: Unique index on users.phone created.")
    except Exception as e:
        print(f"Warning/Error on users.phone index: {e}")
        print("This usually means you have duplicate phone numbers in your 'users' collection.")

    # 2. Patients Collection
    print("Creating indexes on patients...")
    db.patients.create_index("phone")
    db.patients.create_index("user_id")
    print("Patients indexes created.")

    # 3. Appointments
    print("Creating index on appointments.doctor_id and patient_id...")
    db.appointments.create_index("doctor_id")
    db.appointments.create_index("patient_id")
    print("Appointments indexes created.")

if __name__ == "__main__":
    fix_and_index()
