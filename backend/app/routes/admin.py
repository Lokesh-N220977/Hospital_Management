from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from app.core.role_checker import get_admin_user
from app.database import doctor_leaves_collection, doctors_collection
from app.models.doctor_model import DoctorCreate, DoctorUpdate
from app.services import leave_service, analytics_service, doctor_service
from app.core.logger import logger
from bson import ObjectId
import os
import uuid

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"], dependencies=[Depends(get_admin_user)])

@router.post("/add-doctor")
async def add_doctor(doctor: DoctorCreate):
    logger.info(f"Admin adding new doctor: {doctor.email}")
    password, doctor_id = await doctor_service.create_doctor(doctor)
    return {
        "message": "Doctor account and profile created successfully",
        "temp_password": password,
        "doctor_id": str(doctor_id)
    }

@router.post("/doctor/{doctor_id}/image")
async def upload_doctor_image(doctor_id: str, file: UploadFile = File(...)):
    logger.info(f"Admin uploading image for doctor: {doctor_id}")
    
    # Ensure upload directory exists
    UPLOAD_DIR = "uploads/doctor_profiles"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    image_url = f"/uploads/doctor_profiles/{file_name}"

    await doctors_collection.update_one(
        {"_id": ObjectId(doctor_id)},
        {
            "$set": {
                "profile_image_url": image_url,
                "profile_image_source": "admin"
            }
        }
    )

    return {"image_url": image_url}

@router.get("/leaves")
async def get_all_leaves(status: str = None):
    from app.database import doctors_collection
    logger.info(f"Admin fetching leaves. Filter status: {status}")
    query = {"status": status} if status else {}
    
    # Batch fetch leaves to avoid N+1 queries
    leaves_cursor = doctor_leaves_collection.find(query).sort("requested_at", -1)
    leaves = await leaves_cursor.to_list(1000)
    
    if not leaves:
        return []
        
    # Collect all doctor IDs involved
    doc_ids = list(set(l["doctor_id"] for l in leaves))
    
    # Try to find doctors by both email and _id as some records might use either
    obj_ids = []
    emails = []
    for d_id in doc_ids:
        if isinstance(d_id, str) and "@" in d_id:
            emails.append(d_id)
        else:
            try:
                obj_ids.append(ObjectId(d_id))
            except:
                emails.append(str(d_id))

    # Fetch all doctors in one go
    doctors = await doctors_collection.find({
        "$or": [
            {"_id": {"$in": obj_ids}},
            {"email": {"$in": emails}},
            {"user_id": {"$in": doc_ids}}
        ]
    }).to_list(len(doc_ids) + 10)
    
    # Create a mapping for quick lookup
    doc_map = {}
    for d in doctors:
        doc_map[str(d["_id"])] = d["name"]
        doc_map[d["email"]] = d["name"]
        if "user_id" in d:
            doc_map[str(d["user_id"])] = d["name"]

    # Attach names to leaves
    for leave in leaves:
        leave["_id"] = str(leave["_id"])
        leave["doctor_name"] = doc_map.get(str(leave["doctor_id"]), doc_map.get(leave["doctor_id"], "Unknown Doctor"))
        
    return leaves

@router.patch("/leaves/{leave_id}")
async def update_leave_status(leave_id: str, payload: dict):
    status = payload.get("status")
    if status == "approved":
        success = await leave_service.approve_leave(leave_id)
    elif status == "rejected":
        success = await leave_service.reject_leave(leave_id)
    else:
        raise HTTPException(status_code=400, detail="Invalid status. Use 'approved' or 'rejected'.")
        
    if not success:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    return {"message": f"Leave {status} successfully"}

@router.get("/dashboard")
async def get_dashboard_stats():
    return await analytics_service.get_system_analytics()

@router.get("/analytics/overview")
async def get_analytics_overview():
    data = await analytics_service.get_system_overview()
    return {"success": True, "data": data}

@router.get("/analytics/daily")
async def get_analytics_daily():
    data = await analytics_service.get_daily_trend()
    return {"success": True, "data": data}

@router.get("/analytics/doctors")
async def get_analytics_doctors():
    data = await analytics_service.get_doctor_workload()
    return {"success": True, "data": data}

@router.get("/analytics/slots")
async def get_analytics_slots():
    data = await analytics_service.get_peak_slots()
    return {"success": True, "data": data}

@router.put("/update-doctor/{doctor_id}")
async def update_doctor(doctor_id: str, data: DoctorUpdate):
    logger.info(f"Admin updating doctor: {doctor_id}")
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
        
    success = await doctor_service.update_doctor_profile(doctor_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Doctor not found or no changes made")
    return {"message": "Doctor profile updated"}

@router.delete("/delete-doctor/{doctor_id}")
async def delete_doctor_endpoint(doctor_id: str):
    logger.info(f"Admin deleting doctor: {doctor_id}")
    success = await doctor_service.delete_doctor(doctor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"message": "Doctor deleted successfully"}

@router.get("/doctor/{doctor_id}")
async def get_doctor_by_id_endpoint(doctor_id: str):
    logger.info(f"Admin fetching doctor profile: {doctor_id}")
    try:
        from app.database import doctors_collection
        doc = await doctors_collection.find_one({"_id": ObjectId(doctor_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Doctor not found")
        doc["_id"] = str(doc["_id"])
        return doc
    except Exception as e:
        logger.error(f"Error fetching doctor: {e}")
        raise HTTPException(status_code=400, detail="Invalid doctor ID format")

@router.get("/doctors")
async def get_all_doctors(search: str = None, specialization: str = None, status: str = None, page: int = 1, limit: int = 10):
    from app.database import doctors_collection
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"specialization": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    if specialization and specialization != "all":
        query["specialization"] = {"$regex": specialization, "$options": "i"}
    
    if status and status != "all":
        query["status"] = status
    
    skip = (page - 1) * limit
    doctors = await doctors_collection.find(query).sort("name", 1).skip(skip).limit(limit).to_list(limit)
    for d in doctors:
        d["_id"] = str(d["_id"])
    return doctors

@router.get("/patients")
async def get_all_patients(search: str = None, status: str = None):
    from app.database import patients_collection
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    if status and status != 'all':
        query["status"] = status
        
    patients = await patients_collection.find(query).to_list(100)
    for p in patients:
        p["_id"] = str(p["_id"])
    return patients

@router.put("/update-patient/{patient_id}")
async def update_patient(patient_id: str, payload: dict):
    from app.database import patients_collection
    from bson import ObjectId
    payload.pop("_id", None)
    await patients_collection.update_one({"_id": ObjectId(patient_id)}, {"$set": payload})
    return {"message": "Patient updated successfully"}

@router.delete("/delete-patient/{patient_id}")
async def delete_patient(patient_id: str):
    from app.services import patient_service
    await patient_service.delete_patient(patient_id)
    return {"message": "Patient suspended/inactivated successfully"}

@router.patch("/activate-patient/{patient_id}")
async def activate_patient(patient_id: str):
    from app.database import patients_collection, users_collection
    from bson import ObjectId
    
    # 1. Activate patient
    await patients_collection.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": {"is_active": True, "status": "active"}}
    )
    
    # 2. Find patient to see if linked to user
    patient = await patients_collection.find_one({"_id": ObjectId(patient_id)})
    if patient and patient.get("user_id"):
        # 3. Activate associated user account
        await users_collection.update_one(
            {"_id": ObjectId(patient["user_id"])},
            {"$set": {"is_active": True, "status": "active"}}
        )
        
    return {"message": "Patient and associated account reactivated successfully"}

@router.post("/add-patient")
async def add_patient(payload: dict):
    from app.services import patient_service
    # Admin adding patient starts with user_id=None
    patient_id = await patient_service.add_patient({
        "name": payload["name"],
        "phone": payload["phone"],
        "email": payload.get("email"),
        "age": payload.get("age"),
        "user_id": None,
        "created_by": "admin"
    })
    return {"message": "Patient record added successfully", "id": patient_id}

@router.get("/appointments")
async def get_all_appointments(search: str = None, status: str = None):
    from app.database import appointments_collection
    from app.services.appointment_service import _map_appt_for_frontend
    
    query = {"is_deleted": {"$ne": True}}
    if status and status != 'all':
        query["status"] = status
        
    if search:
        query["$or"] = [
            {"patient_name": {"$regex": search, "$options": "i"}},
            {"doctor_name": {"$regex": search, "$options": "i"}},
            {"_id": {"$regex": search, "$options": "i"} if not ObjectId.is_valid(search) else ObjectId(search)}
        ]

    # Sort by slot_start descending for most recent first
    appointments_cursor = appointments_collection.find(query).sort("slot_start", -1).limit(100)
    appointments = await appointments_cursor.to_list(100)
    
    return [_map_appt_for_frontend(a) for a in appointments]

@router.patch("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, payload: dict):
    from app.services import appointment_service
    status = payload.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    
    await appointment_service.update_appointment_status(appointment_id, status)
    return {"message": f"Appointment status updated to {status}"}

@router.delete("/appointments/{appointment_id}")
async def cancel_appointment_admin(appointment_id: str):
    from app.services import appointment_service
    await appointment_service.cancel_appointment(appointment_id, "Cancelled by Admin", "admin")
    return {"message": "Appointment cancelled successfully"}

@router.post("/reset-all-schedules")
async def reset_all_schedules():
    from app.database import doctor_schedules_collection
    # Reset all to default Mon-Fri, 09:00-17:00, 16 slots
    await doctor_schedules_collection.update_many(
        {},
        {"$set": {
            "working_days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
            "working_hours": "09:00 - 17:00",
            "slots_per_day": 16,
            "status": "Reporting"
        }}
    )
    return {"message": "All doctor schedules reset to system defaults"}

@router.put("/schedule/{schedule_id}")
async def update_doctor_schedule(schedule_id: str, update_data: dict):
    from app.database import doctor_schedules_collection
    from bson import ObjectId
    # Remove _id if present in update_data to avoid error
    update_data.pop("_id", None)
    
    result = await doctor_schedules_collection.update_one(
        {"_id": ObjectId(schedule_id)},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        return {"message": "No changes made to the schedule"}
    return {"message": "Schedule updated successfully"}

@router.get("/schedules")
async def get_all_schedules(search: str = None):
    from app.database import doctor_schedules_collection
    query = {}
    if search:
        query["$or"] = [
            {"doctor_name": {"$regex": search, "$options": "i"}},
            {"specialization": {"$regex": search, "$options": "i"}},
            {"doctor_id": {"$regex": search, "$options": "i"}}
        ]
    schedules = await doctor_schedules_collection.find(query).to_list(100)
    for s in schedules:
        s["_id"] = str(s["_id"])
    return schedules

