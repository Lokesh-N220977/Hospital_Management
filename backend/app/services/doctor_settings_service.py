from app.database.collections import doctor_settings_collection
from bson import ObjectId
from datetime import datetime
from app.models.doctor_settings_model import DoctorSettingsUpdate

async def get_doctor_settings(user_id: str):
    """Fetch user settings, create defaults if missing (lazy creation)."""
    settings = await doctor_settings_collection.find_one({"user_id": user_id})
    if not settings:
        # Create default
        new_settings = {
            "user_id": user_id,
            "notifications": {
                "new_appointment_alerts": True,
                "cancellation_alerts": True,
                "reschedule_alerts": True
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await doctor_settings_collection.insert_one(new_settings)
        return new_settings["notifications"]
    
    return settings["notifications"]

async def update_doctor_settings(user_id: str, data: DoctorSettingsUpdate):
    """Partial update of settings."""
    update_data = data.dict(exclude_none=True)
    if not update_data:
        return await get_doctor_settings(user_id)
    
    # Format for nested update in mongo
    mongo_updates = {}
    for key, val in update_data.items():
        mongo_updates[f"notifications.{key}"] = val
    
    mongo_updates["updated_at"] = datetime.utcnow()
    
    await doctor_settings_collection.update_one(
        {"user_id": user_id},
        {"$set": mongo_updates},
        upsert=True # Just in case
    )
    
    return await get_doctor_settings(user_id)
