from app.database.collections import patient_settings_collection
from bson import ObjectId
from datetime import datetime
from app.models.patient_settings_model import PatientSettingsUpdate

async def get_patient_settings(user_id: str):
    """Fetch user settings, create defaults if missing (lazy creation)."""
    settings = await patient_settings_collection.find_one({"user_id": user_id})
    if not settings:
        # Create default
        new_settings = {
            "user_id": user_id,
            "notifications": {
                "appointment_reminders": True,
                "reminder_time_minutes": 60
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await patient_settings_collection.insert_one(new_settings)
        return new_settings["notifications"]
    
    return settings["notifications"]

async def update_patient_settings(user_id: str, data: PatientSettingsUpdate):
    """Partial update of settings."""
    update_data = data.dict(exclude_none=True)
    if not update_data:
        return await get_patient_settings(user_id)
    
    # Format for nested update in mongo
    mongo_updates = {}
    for key, val in update_data.items():
        mongo_updates[f"notifications.{key}"] = val
    
    mongo_updates["updated_at"] = datetime.utcnow()
    
    await patient_settings_collection.update_one(
        {"user_id": user_id},
        {"$set": mongo_updates},
        upsert=True # Just in case
    )
    
    return await get_patient_settings(user_id)
