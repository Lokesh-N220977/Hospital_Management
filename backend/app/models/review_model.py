from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ReviewCreate(BaseModel):
    appointment_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewInDB(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    appointment_id: str
    rating: int
    comment: Optional[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DoctorRatingSummary(BaseModel):
    average_rating: float
    total_reviews: int
