from pydantic import BaseModel

class AppointmentCreate(BaseModel):
    department: str
    doctor_id: str
    appointment_date: str
    appointment_time: str