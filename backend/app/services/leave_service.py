from datetime import datetime
from app.database import doctor_leaves_collection, appointments_collection
from bson import ObjectId
from app.core.logger import logger

async def request_leave(doctor_id: str, date: str, reason: str):
    # Check if leave already exists for this date
    existing = await doctor_leaves_collection.find_one({
        "doctor_id": doctor_id,
        "date": date
    })
    
    if existing:
        return None # Indicate already exists

    leave_data = {
        "doctor_id": doctor_id,
        "date": date,
        "reason": reason,
        "status": "pending",
        "requested_at": datetime.utcnow()
    }
    result = await doctor_leaves_collection.insert_one(leave_data)
    
    # Cancel all appointments for that doctor on that day
    cancel_res = await appointments_collection.update_many(
        {
            "doctor_id": doctor_id,
            "date": date,
            "status": {"$in": ["booked", "confirmed", "pending"]}
        },
        {
            "$set": {
                "status": "cancelled",
                "cancellation_reason": f"Doctor on leave: {reason}"
            }
        }
    )
    
    logger.info(f"Leave approved for doctor {doctor_id} on {date}. {cancel_res.modified_count} appointments cancelled.")
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
            "date": leave["date"],
            "status": {"$in": ["booked", "confirmed", "pending"]}
        },
        {
            "$set": {
                "status": "cancelled",
                "cancellation_reason": f"Doctor on leave: {leave.get('reason', 'Scheduled leave')}"
            }
        }
    )
    logger.info(f"Leave approved for doctor {leave['doctor_id']} on {leave['date']}. {cancel_res.modified_count} appointments cancelled.")
    return True

async def reject_leave(leave_id: str):
    result = await doctor_leaves_collection.update_one(
        {"_id": ObjectId(leave_id)},
        {"$set": {"status": "rejected"}}
    )
    if result.matched_count == 0:
        logger.warning(f"Leave rejection failed: ID {leave_id} not found")
        return False
    logger.info(f"Leave rejected for ID {leave_id}")
    return True

async def is_on_leave(doctor_id: str, date: str):
    """Check if a doctor is on approved leave for a given date."""
    leave = await doctor_leaves_collection.find_one({
        "doctor_id": doctor_id,
        "date": date,
        "status": "approved"
    })
    return leave is not None

async def get_doctor_leaves(doctor_id: str):
    """Fetch all leave requests for a doctor."""
    leaves = []
    async for leave in doctor_leaves_collection.find({"doctor_id": doctor_id}):
        leave["_id"] = str(leave["_id"])
        # Ensure we return 'date' field even if old records have 'leave_date'
        if "leave_date" in leave and "date" not in leave:
            leave["date"] = leave["leave_date"]
        leaves.append(leave)
    return leaves
