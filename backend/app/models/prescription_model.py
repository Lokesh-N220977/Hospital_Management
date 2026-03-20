from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PrescriptionBase(BaseModel):
    patient_id: str
    patient_name: str
    doctor_id: str
    doctor_name: str
    medicine: str
    strength: Optional[str] = None
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None
    date: str = datetime.now().strftime("%B %d, %Y")

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionResponse(PrescriptionBase):
    id: str
    status: str = "Active"
