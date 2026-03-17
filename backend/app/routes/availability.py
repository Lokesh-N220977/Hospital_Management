from fastapi import APIRouter
from app.services import scheduling_service

router = APIRouter(
    prefix="/api/v1/availability",
    tags=["Availability"]
)


@router.get("/{doctor_id}/{date}")
async def check_availability(doctor_id: str, date: str):

    slots = await scheduling_service.get_available_slots(
        doctor_id,
        date
    )

    return {
        "doctor_id": doctor_id,
        "date": date,
        "available_slots": slots
    }