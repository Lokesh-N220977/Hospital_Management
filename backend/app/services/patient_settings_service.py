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
            "share_personal_details": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await patient_settings_collection.insert_one(new_settings)
        return new_settings
    
    # Flatten notifications and include top-level settings for frontend ease-of-use
    output = {**settings.get("notifications", {})}
    output["share_personal_details"] = settings.get("share_personal_details", True)
    return output

async def update_patient_settings(user_id: str, data: PatientSettingsUpdate):
    """Partial update of settings."""
    update_data = data.dict(exclude_none=True)
    if not update_data:
        return await get_patient_settings(user_id)
    
    # Format for nested update in mongo
    mongo_updates = {}
    for key, val in update_data.items():
        if key in ["appointment_reminders", "reminder_time_minutes"]:
            mongo_updates[f"notifications.{key}"] = val
        else:
            mongo_updates[key] = val
    
    mongo_updates["updated_at"] = datetime.utcnow()
    
    await patient_settings_collection.update_one(
        {"user_id": user_id},
        {"$set": mongo_updates},
        upsert=True
    )
    
    return await get_patient_settings(user_id)
