from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DoctorNotifications(BaseModel):
    new_appointment_alerts: bool = True
    cancellation_alerts: bool = True
    reschedule_alerts: bool = True

class DoctorSettings(BaseModel):
    user_id: str
    notifications: DoctorNotifications = Field(default_factory=DoctorNotifications)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DoctorSettingsUpdate(BaseModel):
    new_appointment_alerts: Optional[bool] = None
    cancellation_alerts: Optional[bool] = None
    reschedule_alerts: Optional[bool] = None
