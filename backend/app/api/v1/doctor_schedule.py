from fastapi import APIRouter, HTTPException
from app.models.schedule import DoctorScheduleUpdate, LeaveCreate
from app.database import db
from app.services import scheduling_service, leave_service
from app.services.notification_service import NotificationService

router = APIRouter()
schedules_collection = db["doctor_schedules"]
leaves_collection = db["doctor_leaves"]

@router.post("/doctor/schedule")
async def save_schedule(data: DoctorScheduleUpdate):
    """Step 2: Save schedule pattern."""
    await schedules_collection.update_one(
        {"doctor_id": data.doctor_id},
        {"$set": data.dict()},
        upsert=True
    )
    
    # Notify all admins that this doctor updated their schedule
    try:
        users_coll = db["users"]
        admin_users = await users_coll.find(
            {"role": "admin", "is_active": {"$ne": False}},
            {"_id": 1}
        ).to_list(50)
        
        # Fetch doctor name for a clear message
        sched_doc = await schedules_collection.find_one({"doctor_id": data.doctor_id})
        doc_name = sched_doc.get("doctor_name", "A doctor") if sched_doc else "A doctor"
        
        for admin in admin_users:
            await NotificationService.create_notification(
                user_id=str(admin["_id"]),
                role="admin",
                title="Doctor Schedule Updated",
                message=f"{doc_name} has updated their working schedule. Start: {data.start_time}, End: {data.end_time}.",
                type="schedule"
            )
    except Exception:
        pass  # Non-blocking — schedule is saved regardless
    
    return {"message": "Schedule saved"}

@router.get("/doctor/schedule/{doctor_id}")
async def get_schedule(doctor_id: str):
    """Step 2: Get schedule pattern by ID."""
    sched = await schedules_collection.find_one({"doctor_id": doctor_id})
    if not sched:
        return {}
    
    if "_id" in sched:
        sched["_id"] = str(sched["_id"])
    return sched

@router.get("/slots")
async def get_slots(doctor_id: str, date: str):
    """Step 5: Get dynamic slots."""
    slots = await scheduling_service.get_available_slots(doctor_id, date)
    return {"slots": slots}

@router.post("/doctor/leave")
async def add_leave(data: LeaveCreate):
    """Step 2: Add practitioner leave with appointment cancellation."""
    leave_id = await leave_service.request_leave(data.doctor_id, data.date, data.reason or "No reason provided")
    if not leave_id:
         raise HTTPException(status_code=400, detail="Leave already exists for this date.")
    return {"message": "Leave added successfully.", "leave_id": leave_id}

@router.get("/doctor/leave/{doctor_id}")
async def get_leaves(doctor_id: str):
    """Step 2: Get all leaves for a specific doctor."""
    return await leave_service.get_doctor_leaves(doctor_id)
