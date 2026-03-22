from pydantic import BaseModel
from typing import List, Optional

class DoctorScheduleUpdate(BaseModel):
    doctor_id: str
    working_days: List[str] # ["Mon", "Tue", etc.]
    start_time: str # "09:00"
    end_time: str # "17:00"
    lunch_start_time: Optional[str] = None # "13:00"
    lunch_end_time: Optional[str] = None # "14:00"
    slot_duration: int = 30

class LeaveCreate(BaseModel):
    doctor_id: str
    date: str # "2026-03-25"
    reason: Optional[str] = None

class ManualAvailabilityCreate(BaseModel):
    doctor_id: str
    date: str
    start_time: str
    end_time: str
    slot_duration: int = 30