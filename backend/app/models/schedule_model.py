from pydantic import BaseModel


class DoctorScheduleCreate(BaseModel):
    doctor_id: str
    day: str
    start_time: str
    end_time: str
    slot_duration: int