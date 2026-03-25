from datetime import datetime
from app.database import doctor_leaves_collection, appointments_collection
from bson import ObjectId
from app.core.logger import logger
from app.services import appointment_service, patient_service
from app.services.notification_service import NotificationService
from app.models.notification_model import NotificationType

async def request_leave(doctor_id: str, date: str, reason: str):
    # Check if leave already exists for this date
    existing = await doctor_leaves_collection.find_one({
        "doctor_id": doctor_id,
        "date": date
    })
    
    if existing:
        return None # Indicate already exists

    now = datetime.now()
    leave_data = {
        "doctor_id": doctor_id,
        "date": date,
        "reason": reason,
        "status": "pending",
        "created_at": now,
        "updated_at": now
    }
    result = await doctor_leaves_collection.insert_one(leave_data)
    
    # Notify Admin
    from app.database import users_collection, doctors_collection
    admin_user = await users_collection.find_one({"role": "admin"})
    doctor = await doctors_collection.find_one({"_id": ObjectId(doctor_id)})
    doctor_name = doctor.get("name", doctor_id) if doctor else doctor_id
    
    if admin_user:
        await NotificationService.create_notification(
            str(admin_user["_id"]),
            "admin",
            "Leave Request",
            f"Dr. {doctor_name} has requested leave for {date}.",
            "doctor_leave_request"
        )
    
    logger.info(f"Leave requested (pending) for doctor {doctor_name} on {date}.")
    return str(result.inserted_id)

async def approve_leave(leave_id: str):
    leave = await doctor_leaves_collection.find_one({"_id": ObjectId(leave_id)})
    if not leave:
        logger.warning(f"Leave approval failed: ID {leave_id} not found")
        return False
        
    await doctor_leaves_collection.update_one(
        {"_id": ObjectId(leave_id)},
        {"$set": {"status": "approved", "updated_at": datetime.now()}}
    )
    
    # Atomic update for all appointments on that doctor/date
    doc_id_val = leave["doctor_id"]
    try:
        doc_ids = [ObjectId(doc_id_val), str(doc_id_val)]
    except:
        doc_ids = [doc_id_val]
        
    date_val = leave["date"]
    
    # Find affected appointments to notify users
    affected_appointments = await appointments_collection.find({
        "doctor_id": {"$in": doc_ids},
        "$or": [{"appointment_date": date_val}, {"date": date_val}],
        "status": "booked"
    }).to_list(length=1000)

    # Atomic update for all appointments on that doctor/date
    result = await appointments_collection.update_many(
        {
            "doctor_id": {"$in": doc_ids},
            "$or": [{"appointment_date": date_val}, {"date": date_val}],
            "status": "booked"
        },
        {
            "$set": {
                "status": "cancelled",
                "cancel_reason": "Doctor on approved leave",
                "cancelled_by": "admin",
                "is_active": False,
                "updated_at": datetime.now()
            }
        }
    )
    
    # Notify affected patients
    for appt in affected_appointments:
        patient_id_str = str(appt.get("patient_id"))
        patient = await patient_service.get_patient_by_id(patient_id_str)
        if patient:
            user_id_to_notify = str(patient.get("user_id")) if patient.get("user_id") else patient_id_str
            doc_name = appt.get("doctor_name", "your doctor")
            await NotificationService.create_notification(
                user_id_to_notify,
                "patient",
                "Doctor Unavailable",
                f"Your appointment with Dr. {doc_name} on {date_val} has been cancelled due to doctor leave.",
                "doctor_leave"
            )
            
    # Notify doctor
    from app.database import doctors_collection
    doc = await doctors_collection.find_one({"_id": ObjectId(doc_id_val)})
    doctor_user_id = doc.get("user_id") if doc else None
    if doctor_user_id:
        await NotificationService.create_notification(
            str(doctor_user_id),
            "doctor",
            "Leave Approved",
            f"Your leave request for {date_val} has been approved. Affected appointments have been cancelled.",
            "doctor_leave_approved"
        )

    # 3. Handle Slots: (No longer needed to delete as slots are dynamic)
    # The generate_slots service will check the leave collection dynamically.
    logger.info(f"Leave approved for doctor {doc_id_val} on {date_val}. {result.modified_count} appointments cancelled.")
    return True

async def reject_leave(leave_id: str):
    result = await doctor_leaves_collection.update_one(
        {"_id": ObjectId(leave_id)},
        {"$set": {"status": "rejected", "updated_at": datetime.now()}}
    )
    if result.matched_count == 0:
        logger.warning(f"Leave rejection failed: ID {leave_id} not found")
        return False
    logger.info(f"Leave rejected for ID {leave_id}")
    return True

async def is_on_leave(doctor_id: str, date: str):
    """Check if a doctor is on EXPLICITLY approved leave for a given date."""
    leave = await doctor_leaves_collection.find_one({
        "doctor_id": doctor_id,
        "date": date,
        "status": "approved"
    })
    return leave is not None

async def get_doctor_leaves(doctor_id: str):
    """Fetch all leave requests for a doctor."""
    leaves = []
    async for leave in doctor_leaves_collection.find({"doctor_id": doctor_id}).sort("created_at", -1):
        leave["_id"] = str(leave["_id"])
        if "leave_date" in leave and "date" not in leave:
            leave["date"] = leave["leave_date"]
        # Standardize for frontend that might be looking for status
        if "status" not in leave:
            leave["status"] = "approved"  # old default
        leaves.append(leave)
    return leaves

