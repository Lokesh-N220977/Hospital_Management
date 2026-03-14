from pydantic import BaseModel


class VisitCreate(BaseModel):
    appointment_id: str
    diagnosis: str
    medicines: list[str]
    notes: str