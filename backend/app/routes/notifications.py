from fastapi import APIRouter, Depends
from typing import Optional
from app.core.dependencies import get_current_user
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])

def success_response(message: str, data: Optional[dict | list | str] = None):
    return {"success": True, "message": message, "data": data}

@router.get("")
async def get_my_notifications(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    data = await NotificationService.get_user_notifications(user_id)
    return success_response("Notifications fetched", data)

@router.patch("/{notification_id}/read")
async def mark_read(notification_id: str, current_user=Depends(get_current_user)):
    success = await NotificationService.mark_as_read(notification_id)
    if success:
        return success_response("Notification marked as read")
    return {"success": False, "message": "Notification not found or already read"}

@router.patch("/read-all")
async def mark_all_read(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    count = await NotificationService.mark_all_as_read(user_id)
    return success_response(f"{count} notifications marked as read")
