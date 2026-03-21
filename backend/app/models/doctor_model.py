from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class DoctorCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str
    gender: str = "Male"
    specialization: str
    degree: str
    experience: int
    consultation_fee: int = 500  # Default fee
    department: Optional[str] = None
    location: Optional[str] = None
    profile_image_url: Optional[str] = None
    profile_image_source: Optional[str] = "admin"

class DoctorResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    specialization: str
    experience: int
    consultation_fee: float
    qualification: Optional[str] = None
    about: Optional[str] = None
    profile_image_url: Optional[str] = None
    profile_image_source: Optional[str] = None

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    qualification: Optional[str] = None
    degree: Optional[str] = None
    consultation_fee: Optional[float] = None
    about: Optional[str] = None
    available: Optional[bool] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    gender: Optional[str] = None
    status: Optional[str] = None