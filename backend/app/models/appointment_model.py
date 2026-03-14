from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    doctor_id: str
    date: str
    time: str
    reason: str