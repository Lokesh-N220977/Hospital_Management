from fastapi import APIRouter
from app.database import leaves_collection

router = APIRouter(
    prefix="/api/leaves",
    tags=["Leaves"]
)


@router.post("/apply")
async def apply_leave(leave: dict):

    result = await leaves_collection.insert_one(leave)

    return {
        "message": "Leave applied",
        "id": str(result.inserted_id)
    }