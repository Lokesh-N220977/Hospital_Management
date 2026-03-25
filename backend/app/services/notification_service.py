from datetime import datetime
from bson import ObjectId
from app.database.connection import get_database

db = get_database()

class NotificationService:

    @staticmethod
    async def create_notification(user_id: str, role: str, title: str, message: str, type: str):
        notification = {
            "user_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id,
            "role": role,
            "title": title,
            "message": message,
            "type": type,
            "is_read": False,
            "created_at": datetime.utcnow()
        }

        await db.notifications.insert_one(notification)
        return True

    @staticmethod
    async def get_user_notifications(user_id: str):
        try:
            notifications = await db.notifications.find(
                {"user_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}
            ).sort("created_at", -1).to_list(100)
            
            # format IDs for frontend
            formatted_notifications = []
            for n in notifications:
                n["id"] = str(n.pop("_id"))
                n["user_id"] = str(n["user_id"])
                formatted_notifications.append(n)
                
            return formatted_notifications
        except Exception as e:
            return []

    @staticmethod
    async def mark_as_read(notification_id: str):
        try:
            result = await db.notifications.update_one(
                {"_id": ObjectId(notification_id)},
                {"$set": {"is_read": True}}
            )
            return result.modified_count > 0
        except Exception as e:
            return False

    @staticmethod
    async def mark_all_as_read(user_id: str):
        try:
            result = await db.notifications.update_many(
                {
                    "user_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id,
                    "is_read": False
                },
                {"$set": {"is_read": True}}
            )
            return result.modified_count
        except Exception as e:
            return 0

    @staticmethod
    async def get_recipient_id(patient_id: str) -> str:
        """Helper to find the User Account ID that owns this patient profile."""
        try:
            from app.database.collections import patients_collection
            pat = await patients_collection.find_one({"_id": ObjectId(patient_id)})
            if pat and pat.get("user_id"):
                return str(pat["user_id"])
            return patient_id # fallback to patient id if no user linked
        except:
            return patient_id
