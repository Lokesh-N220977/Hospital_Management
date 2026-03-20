import asyncio
import os
import sys

# Add the project root to sys.path to allow absolute imports of app
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)

from app.database.collections import users_collection, doctors_collection

async def validate():
    print("--- VALIDATING DATA INTEGRITY ---")
    
    # 1. Check Admin
    admin = await users_collection.find_one({"role": "admin"})
    if not admin:
        print("[FAIL] Admin user not found!")
    else:
        print(f"[PASS] Admin user found: {admin['email']}")
        if "$2b$" in admin["password"] or "$2y$" in admin["password"]:
            print("[PASS] Admin password is hashed (bcrypt).")
        else:
            print("[FAIL] Admin password is NOT hashed or not bcrypt!")

    # 2. Check Doctors in users_collection
    doc_users_count = await users_collection.count_documents({"role": "doctor"})
    if doc_users_count == 0:
        print("[FAIL] No doctor users found in users_collection!")
    else:
        print(f"[PASS] {doc_users_count} doctor users found in users_collection.")

    # 3. Check Doctors collection
    doc_profiles_count = await doctors_collection.count_documents({})
    if doc_profiles_count == 0:
        print("[FAIL] No doctor profiles found in doctors_collection!")
    else:
        print(f"[PASS] {doc_profiles_count} doctor profiles found in doctors_collection.")

    # 4. Check for critical fields in doctor profile
    first_doc = await doctors_collection.find_one({})
    if first_doc:
        critical_fields = ["user_id", "name", "specialization", "experience", "consultation_fee"]
        missing = [f for f in critical_fields if f not in first_doc or not first_doc[f]]
        if missing:
            print(f"[FAIL] Doctor profile missing fields: {missing}")
        else:
            print("[PASS] Doctor profile contains all critical fields.")

    print("--- VALIDATION COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(validate())
