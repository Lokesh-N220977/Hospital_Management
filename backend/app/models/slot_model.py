from pydantic import BaseModel
from typing import Optional
from datetime import date

class Slot(BaseModel):
    id: Optional[str] = None
    doctor_id: str
    shift_id: str
    shift_type: str # MORNING / AFTERNOON / EVENING
    date: str # "YYYY-MM-DD"
    slot_time: str # "09:00"
    max_normal: int
    max_emergency: int
    booked_normal_count: int = 0
    booked_emergency_count: int = 0
