from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class HospitalSettings(BaseModel):
    hospital_name: str = "MedicPulse General"
    email: str = "support@medicpulse.com"
    mobile_number: str = "+91 91234 56789"
    address: str = "Medical District Healthcare Center"
    facebook_url: str = "#"
    twitter_url: str = "#"
    instagram_url: str = "#"
    linkedin_url: str = "#"

class HospitalSettingsUpdate(BaseModel):
    hospital_name: Optional[str] = None
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    address: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_url: Optional[str] = None
    instagram_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class AdminNotifications(BaseModel):
    new_doctor_alerts: bool = True
    critical_error_alerts: bool = True
    daily_analytics: bool = False

class AdminSettings(BaseModel):
    user_id: str
    notifications: AdminNotifications = Field(default_factory=AdminNotifications)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AdminSettingsUpdate(BaseModel):
    new_doctor_alerts: Optional[bool] = None
    critical_error_alerts: Optional[bool] = None
    daily_analytics: Optional[bool] = None
