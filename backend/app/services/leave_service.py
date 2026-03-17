from datetime import datetime
from app.database import doctor_leaves_collection, appointments_collection
from bson import ObjectId
from app.core.logger import logger

async def request_leave(doctor_id: str, leave_date: str, reason: str):
    leave_data = {
        "doctor_id": doctor_id,
        "leave_date": leave_date,
        "reason": reason,
        "status": "pending",
        "requested_at": datetime.utcnow()
    }
    result = await doctor_leaves_collection.insert_one(leave_data)
    logger.info(f"Leave requested by doctor {doctor_id} for {leave_date}")
    return str(result.inserted_id)

async def approve_leave(leave_id: str):
    leave = await doctor_leaves_collection.find_one({"_id": ObjectId(leave_id)})
    if not leave:
        logger.warning(f"Leave approval failed: ID {leave_id} not found")
        return False
        
    await doctor_leaves_collection.update_one(
        {"_id": ObjectId(leave_id)},
        {"$set": {"status": "approved"}}
    )
    
    # Cancel all appointments for that doctor on that day
    cancel_res = await appointments_collection.update_many(
        {
            "doctor_id": leave["doctor_id"],
            "date": leave["leave_date"],
            "status": "booked"
        },
        {"$set": {"status": "cancelled"}}
    )
    logger.info(f"Leave approved for doctor {leave['doctor_id']} on {leave['leave_date']}. {cancel_res.modified_count} appointments cancelled.")
    return True

async def reject_leave(leave_id: str):
    await doctor_leaves_collection.update_one(
        {"_id": ObjectId(leave_id)},
        {"$set": {"status": "rejected"}}
    )
    logger.info(f"Leave rejected: {leave_id}")
    return True

