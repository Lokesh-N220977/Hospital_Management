from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PatientNotifications(BaseModel):
    appointment_reminders: bool = True
    reminder_time_minutes: int = Field(default=60, ge=0, le=1440) # Default 1h, max 24h

class PatientSettings(BaseModel):
    user_id: str
    notifications: PatientNotifications = Field(default_factory=PatientNotifications)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PatientSettingsUpdate(BaseModel):
    appointment_reminders: Optional[bool] = None
    reminder_time_minutes: Optional[int] = None
