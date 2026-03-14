from fastapi import APIRouter
from app.services.availability_service import get_available_slots

router = APIRouter(
    prefix="/api/availability",
    tags=["Availability"]
)


@router.get("/{doctor_id}/{date}")
async def check_availability(doctor_id: str, date: str):

    slots = await get_available_slots(
        doctor_id,
        date
    )

    return {
        "doctor_id": doctor_id,
        "date": date,
        "available_slots": slots
    }