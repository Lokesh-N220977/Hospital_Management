from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class DoctorSchedule(BaseModel):
    doctor_id: str
    day_of_week: int  # 0-6 (Monday-Sunday)
    start_time: str   # "HH:MM"
    end_time: str     # "HH:MM"
    slot_duration: int = 30
    break_start: Optional[str] = None
    break_end: Optional[str] = None
    max_patients_per_slot: int = 1
    is_active: bool = True

class Appointment(BaseModel):
    doctor_id: str
    patient_id: str
    date: str         # "YYYY-MM-DD"
    slot_time: str    # "HH:MM"
    status: str = "BOOKED"  # BOOKED / CANCELLED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    idempotency_key: Optional[str] = None
    symptoms: Optional[List[str]] = []

class SlotAvailability(BaseModel):
    time: str
    available: int
    booked_count: int
