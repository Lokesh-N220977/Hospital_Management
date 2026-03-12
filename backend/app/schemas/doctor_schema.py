from pydantic import BaseModel
from typing import Optional

class DoctorCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    specialization: str
    experience: int
    available_days: list[str]
    operating_hours: str
    photo_url: Optional[str] = None