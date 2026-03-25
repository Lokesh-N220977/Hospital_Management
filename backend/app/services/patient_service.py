from app.database import patients_collection
from bson import ObjectId
from app.core.logger import logger
from datetime import datetime

async def add_patient(patient_data: dict):
    """Admin or User adds a new medical identity (patient member)."""
    patient_data["created_at"] = datetime.utcnow()
    # Ensure patient starts with user_id = null if admin adds it, or fixed user_id if self-adding
    
    result = await patients_collection.insert_one(patient_data)
    logger.info(f"Registered new patient record: {patient_data['name']} (ID: {result.inserted_id})")
    return str(result.inserted_id)

async def search_patients(phone: str):
    """Admin searches for patients by phone."""
    patients = []
    async for p in patients_collection.find({"phone": phone, "is_active": {"$ne": False}}):
        p["_id"] = str(p["_id"])
        patients.append(p)
    return patients

async def get_my_patients(user_id: str):
    """Patient user fetches all family members linked to their account, auto-fixing missing primary."""
    patients = []
    has_primary = False
    
    # Query by both string and ObjectId to be safe
    query = {"$or": [{"user_id": user_id}, {"user_id": ObjectId(user_id)} if ObjectId.is_valid(user_id) else {}], "is_active": {"$ne": False}}
    async for p in patients_collection.find(query):
        p["_id"] = str(p["_id"])
        if p.get("created_by") == "self":
            has_primary = True
        patients.append(p)
        
    # Auto-fix: if no "self" record exists, see if we can promote one or create one
    if not has_primary and user_id:
        from app.database import users_collection
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        # Relax role check: any logged in user should have a patient identity if they reach here
        if user:
            # 1. Check if they have an un-tagged walk-in record with matching phone
            matching_walkin = next((p for p in patients if p.get("phone") == user.get("phone")), None)
            
            if matching_walkin:
                # Promote to primary
                await patients_collection.update_one(
                    {"_id": ObjectId(matching_walkin["_id"])},
                    {"$set": {"created_by": "self"}}
                )
                matching_walkin["created_by"] = "self"
                logger.info(f"Auto-promoted walk-in record to primary 'self' for user {user_id}")
            else:
                # 2. Complete fallback: generate a new primary record
                patient_data = {
                    "name": user.get("name", "Unknown"),
                    "phone": user.get("phone", ""),
                    "email": user.get("email", ""),
                    "user_id": user_id,
                    "created_by": "self",
                    "created_at": datetime.utcnow()
                }
                res = await patients_collection.insert_one(patient_data)
                patient_data["_id"] = str(res.inserted_id)
                patients.insert(0, patient_data)
                logger.info(f"Auto-generated missing primary 'self' record for user {user_id}")
            
    # Deduplicate: one record per phone, prioritizing 'self' (primary)
    unique_patients = {}
    for p in patients:
        phone = p.get("phone")
        if phone not in unique_patients or p.get("created_by") == "self":
            unique_patients[phone] = p
            
    return list(unique_patients.values())

async def get_patient_by_id(patient_id: str):
    try:
        p = await patients_collection.find_one({"_id": ObjectId(patient_id)})
        if p:
            p["_id"] = str(p["_id"])
        return p
    except:
        return None

async def update_patient(patient_id: str, update_data: dict):
    from datetime import datetime
    update_data["updated_at"] = datetime.utcnow()
    await patients_collection.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": update_data}
    )
    logger.info(f"Patient record updated: {patient_id}")

async def delete_patient(patient_id: str):
    """Soft delete a patient record, deactivate linked user, and cancel future appointments."""
    from datetime import datetime
    from app.database import appointments_collection, users_collection
    
    # Get patient details to check for user_id
    patient = await patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        return False

    # 1. Soft delete the patient
    await patients_collection.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": {
            "is_active": False, 
            "status": "deleted", 
            "deleted_at": datetime.utcnow()
        }}
    )
    
    # 2. Deactivate associated User account if exists
    user_id = patient.get("user_id")
    if user_id:
        try:
            # user_id might be string or ObjectId
            u_oid = ObjectId(user_id) if isinstance(user_id, str) and len(user_id) == 24 else user_id
            await users_collection.update_one(
                {"_id": u_oid},
                {"$set": {"is_active": False, "status": "suspended", "updated_at": datetime.utcnow()}}
            )
            logger.info(f"Associated User account {user_id} deactivated for patient {patient_id}")
        except Exception as e:
            logger.error(f"Failed to deactivate User {user_id}: {e}")

    # 3. Cancel future appointments associated with this patient
    # We keep the record for analytics as requested.
    now_str = datetime.utcnow().strftime("%Y-%m-%d")
    result = await appointments_collection.update_many(
        {
            "patient_id": {"$in": [ObjectId(patient_id), patient_id]}, 
            "status": "booked", 
            "$or": [{"date": {"$gte": now_str}}, {"appointment_date": {"$gte": now_str}}]
        },
        {"$set": {
            "status": "cancelled", 
            "cancel_reason": "Patient account suspended.", 
            "cancelled_by": "system", 
            "is_active": False
        }}
    )
    
    logger.info(f"Patient record soft-deleted: {patient_id}. Cancelled {result.modified_count} future appointments.")
    return True
