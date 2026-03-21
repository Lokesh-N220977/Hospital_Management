from pydantic import BaseModel, Field
from typing import Optional

class AppointmentCreate(BaseModel):
    doctor_id: str
    patient_id: str
    date: str
    time: str
    reason: Optional[str] = None