from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class ShiftType(str, Enum):
    MORNING = "MORNING"
    AFTERNOON = "AFTERNOON"
    EVENING = "EVENING"

class DoctorShift(BaseModel):
    id: Optional[str] = None
    schedule_id: str
    shift_type: ShiftType
    start_time: str # "09:00"
    end_time: str # "13:00"
    slot_duration: int = 15 # in minutes
    max_patients_per_slot: int = 1
    max_emergency_per_slot: int = 1
    max_total_patients_per_shift: int = 20

class DoctorSchedule(BaseModel):
    id: Optional[str] = None
    doctor_id: str
    day_of_week: int = Field(..., ge=0, le=6) # 0=Monday, 6=Sunday
    is_active: bool = True
    shifts: List[DoctorShift] = []
