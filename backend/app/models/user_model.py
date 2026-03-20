from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserRegister(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: str = "patient"
    gender: Optional[str] = None

class UserLogin(BaseModel):
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str
    role: str

class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str

class EmailLoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str

class ChangePassword(BaseModel):
    old_password: str
    new_password: str

class UserProfile(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    gender: Optional[str] = None

class PatientCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    gender: Optional[str] = None
    relation: Optional[str] = None