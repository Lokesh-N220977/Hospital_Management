from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime, date
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class DoctorBase(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(..., min_length=2, max_length=100)
    specialization: str
    is_active: bool = True

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ScheduleBase(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    doctor_id: PyObjectId
    location_id: PyObjectId # MANDATORY: Tie schedule to branch
    day_of_week: int  # 0-6
    is_active: bool = True

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ShiftBase(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    schedule_id: PyObjectId
    shift_type: str  # MORNING / AFTERNOON / EVENING
    start_time: str  # "09:00"
    end_time: str    # "12:00"
    slot_duration: int  # minutes
    max_patients_per_slot: int
    max_emergency_per_slot: int
    max_total_patients_per_shift: int
    current_total_bookings: int = 0
    max_overflow_per_shift: int = 5
    current_overflow_count: int = 0

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class SlotBase(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    doctor_id: PyObjectId
    location_id: PyObjectId # MANDATORY: Slots belong to branch
    shift_id: PyObjectId
    date: str # "YYYY-MM-DD"
    slot_time: str # "09:00"
    max_normal: int
    max_emergency: int
    booked_normal_count: int = 0
    booked_emergency_count: int = 0

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AppointmentBase(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    patient_id: PyObjectId
    doctor_id: PyObjectId
    location_id: PyObjectId # MANDATORY: Booking tied to branch
    slot_id: PyObjectId
    priority_level: str  # NORMAL / URGENT / EMERGENCY
    priority_score: int  # 1, 2, 3
    symptoms: List[str]
    emergency_reason: Optional[str] = None
    queue_position: int = 0
    estimated_wait_time: int = 0
    is_overflow: bool = False
    idempotency_key: str
    status: str = "BOOKED"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
