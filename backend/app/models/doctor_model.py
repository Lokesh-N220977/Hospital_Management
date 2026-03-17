from pydantic import BaseModel, EmailStr, Field


class DoctorCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    specialization: str
    experience: int
    consultation_fee: int


class DoctorResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    specialization: str
    experience: int
    consultation_fee: int
from typing import Optional

class DoctorUpdate(BaseModel):
    specialization: Optional[str]
    experience: Optional[int]
    consultation_fee: Optional[int]
    available: Optional[bool]