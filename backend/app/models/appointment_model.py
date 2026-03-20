from pydantic import BaseModel
from typing import Optional

class AppointmentCreate(BaseModel):
    doctor_id: str
    patient_id: str  # Mandatory: Which family member/identity is this for?
    date: str
    time: str
    reason: str