from app.database.collections import admin_settings_collection, hospital_settings_collection
from datetime import datetime
from app.models.admin_settings_model import AdminSettingsUpdate, HospitalSettingsUpdate

async def get_hospital_settings():
    doc = await hospital_settings_collection.find_one({"is_global": True})
    if not doc:
        default_settings = {
            "is_global": True,
            "hospital_name": "MedicPulse General",
            "email": "support@medicpulse.com",
            "mobile_number": "+91 91234 56789",
            "address": "Medical District Healthcare Center",
            "updated_at": datetime.utcnow()
        }
        await hospital_settings_collection.insert_one(default_settings)
        doc = default_settings
        
    # strip _id and is_global
    return {
        "hospital_name": doc.get("hospital_name"),
        "email": doc.get("email"),
        "mobile_number": doc.get("mobile_number"),
        "address": doc.get("address")
    }

async def update_hospital_settings(data: HospitalSettingsUpdate):
    update_data = data.dict(exclude_none=True)
    if not update_data:
        return await get_hospital_settings()
        
    update_data["updated_at"] = datetime.utcnow()
    
    await hospital_settings_collection.update_one(
        {"is_global": True},
        {"$set": update_data},
        upsert=True
    )
    return await get_hospital_settings()

async def get_admin_settings(user_id: str):
    doc = await admin_settings_collection.find_one({"user_id": user_id})
    if not doc:
        default_settings = {
            "user_id": user_id,
            "notifications": {
                "new_doctor_alerts": True,
                "critical_error_alerts": True,
                "daily_analytics": False
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await admin_settings_collection.insert_one(default_settings)
        return default_settings["notifications"]
        
    return doc.get("notifications", {})

async def update_admin_settings(user_id: str, data: AdminSettingsUpdate):
    update_data = data.dict(exclude_none=True)
    if not update_data:
        return await get_admin_settings(user_id)
        
    mongo_updates = {}
    for k, v in update_data.items():
        mongo_updates[f"notifications.{k}"] = v
    mongo_updates["updated_at"] = datetime.utcnow()
    
    await admin_settings_collection.update_one(
        {"user_id": user_id},
        {"$set": mongo_updates},
        upsert=True
    )
    return await get_admin_settings(user_id)
