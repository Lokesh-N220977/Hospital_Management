from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
from bson import ObjectId

class NotificationType(str, Enum):
    APPOINTMENT_BOOKED = "appointment_booked"
    APPOINTMENT_CANCELLED = "appointment_cancelled"
    APPOINTMENT_RESCHEDULED = "appointment_rescheduled"
    DOCTOR_LEAVE = "doctor_leave"
    REMINDER = "reminder"

class Notification(BaseModel):
    user_id: str
    role: str  # patient | doctor | admin
    title: str
    message: str
    type: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# The response model doesn't need ObjectId format since we usually convert ObjectId to string in FastAPI responses
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
