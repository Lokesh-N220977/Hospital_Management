from fastapi import APIRouter, HTTPException, Depends
from app.core.role_checker import get_admin_user
from app.database import doctor_leaves_collection
from app.models.doctor_model import DoctorCreate, DoctorUpdate
from app.services import leave_service, analytics_service, doctor_service
from app.core.logger import logger

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"], dependencies=[Depends(get_admin_user)])

@router.post("/add-doctor")
async def add_doctor(doctor: DoctorCreate):
    logger.info(f"Admin adding new doctor: {doctor.email}")
    password = await doctor_service.create_doctor(doctor)
    return {
        "message": "Doctor account and profile created successfully",
        "temp_password": password
    }

@router.get("/leaves")
async def get_all_leaves(status: str = None):
    from app.database import doctors_collection
    logger.info(f"Admin fetching leaves. Filter status: {status}")
    query = {"status": status} if status else {}
    leaves = []
    async for leave in doctor_leaves_collection.find(query).sort("requested_at", -1):
        leave["_id"] = str(leave["_id"])
        # Find doctor name
        doc = await doctors_collection.find_one({"email": leave["doctor_id"]})
        if not doc:
            try:
                from bson import ObjectId
                doc = await doctors_collection.find_one({"_id": ObjectId(leave["doctor_id"])})
            except:
                pass
        leave["doctor_name"] = doc.get("name", "Unknown Doctor") if doc else "Unknown Doctor"
        leaves.append(leave)
    return leaves

@router.put("/leaves/{leave_id}")
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

@router.get("/doctors")
async def get_all_doctors(search: str = None, page: int = 1, limit: int = 10):
    from app.database import doctors_collection
    query = {}
    if search:
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"specialization": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]
        }
    
    skip = (page - 1) * limit
    doctors = await doctors_collection.find(query).skip(skip).limit(limit).to_list(limit)
    for d in doctors:
        d["_id"] = str(d["_id"])
    return doctors

@router.get("/patients")
async def get_all_patients(phone: str = None):
    from app.database import patients_collection
    query = {"phone": phone} if phone else {}
    patients = await patients_collection.find(query).to_list(100)
    for p in patients:
        p["_id"] = str(p["_id"])
    return patients

@router.post("/add-patient")
async def add_patient(payload: dict):
    from app.services import patient_service
    # Admin adding patient starts with user_id=None
    patient_id = await patient_service.add_patient({
        "name": payload["name"],
        "phone": payload["phone"],
        "email": payload.get("email"),
        "user_id": None,
        "created_by": "admin"
    })
    return {"message": "Patient record added successfully", "id": patient_id}

@router.get("/appointments")
async def get_all_appointments():
    from app.database import appointments_collection
    appointments = await appointments_collection.find().sort("date", -1).to_list(100)
    for a in appointments:
        a["_id"] = str(a["_id"])
    return appointments

@router.get("/schedules")
async def get_all_schedules():
    from app.database import doctor_schedules_collection
    schedules = await doctor_schedules_collection.find().to_list(100)
    for s in schedules:
        s["_id"] = str(s["_id"])
    return schedules

