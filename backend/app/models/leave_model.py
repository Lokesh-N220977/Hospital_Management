from pydantic import BaseModel


class DoctorLeaveCreate(BaseModel):
    doctor_id: str
    leave_date: str
    reason: str