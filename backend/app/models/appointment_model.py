from pydantic import BaseModel, Field
from typing import Optional
from typing import Optional, List

class AppointmentCreate(BaseModel):
    doctor_id: str
    patient_id: str
    date: str
    time: str
    reason: Optional[str] = None
    priority_level: str = "NORMAL" # NORMAL / URGENT / EMERGENCY
    symptoms: List[str] = []
    queue_position: Optional[int] = None
    estimated_wait_time: Optional[int] = None
    is_overflow: bool = False
    slot_id: Optional[str] = None