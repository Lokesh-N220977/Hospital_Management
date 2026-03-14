from fastapi import APIRouter
from app.database import schedules_collection

router = APIRouter(
    prefix="/api/schedules",
    tags=["Schedules"]
)


@router.post("/create")
async def create_schedule(schedule: dict):

    result = await schedules_collection.insert_one(schedule)

    return {
        "message": "Schedule created",
        "id": str(result.inserted_id)
    }