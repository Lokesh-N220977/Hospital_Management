from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserRegister(BaseModel):
    name: str
    phone: Optional[str] = None  # Optional — format validation done on frontend
    email: EmailStr
    password: Optional[str] = None
    role: str = "patient"
    gender: Optional[str] = None
    age: int

class UserLogin(BaseModel):
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str
    role: str

class UnifiedLoginRequest(BaseModel):
    identifier: str  # Email or Phone
    password: str
    role: str

class GoogleLoginRequest(BaseModel):
    token: str
    role: str = "patient"

class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str

class SendEmailOTPRequest(BaseModel):
    email: EmailStr

class VerifyEmailOTPRequest(BaseModel):
    email: EmailStr
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
    age: int

class PatientCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    gender: Optional[str] = None
    relation: Optional[str] = None
    age: int