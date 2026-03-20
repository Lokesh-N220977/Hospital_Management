from fastapi import HTTPException
from app.database import appointments_collection, patients_collection
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from datetime import datetime
from app.services import scheduling_service, doctor_service, patient_service
from app.core.logger import logger

async def book_appointment(appointment_data: dict):
    # 0. Basic Validation: Past dates
    appt_dt = datetime.strptime(f"{appointment_data['date']} {appointment_data['time']}", "%Y-%m-%d %H:%M")
    if appt_dt < datetime.now():
         raise HTTPException(status_code=400, detail="Cannot book appointments in the past")

    # 1. Fetch Doctor Info
    doc = await doctor_service.get_doctor_by_id(appointment_data["doctor_id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    appointment_data["doctor_name"] = doc["name"]
    appointment_data["specialization"] = doc["specialization"]

    # 2. Fetch Patient Info (Verification)
    patient = await patient_service.get_patient_by_id(appointment_data["patient_id"])
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    appointment_data["patient_name"] = patient["name"]
    appointment_data["patient_phone"] = patient["phone"]

    # 3. Try to lock the slot
    success = await scheduling_service.book_slot(
        appointment_data["doctor_id"],
        appointment_data["date"],
        appointment_data["time"]
    )
    
    if not success:
        logger.warning(f"Booking failed: Slot unavailable for {appointment_data['doctor_id']} at {appointment_data['time']}")
        raise HTTPException(status_code=400, detail="Slot already booked or unavailable")

    try:
        result = await appointments_collection.insert_one(appointment_data)
        logger.info(f"Appointment created: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        await scheduling_service.release_slot(
            appointment_data["doctor_id"],
            appointment_data["date"],
            appointment_data["time"]
        )
        logger.error(f"Booking insertion failed: {e}")
        raise HTTPException(status_code=500, detail="Could not finalize booking")


async def get_patient_appointments(patient_id: str):
    appointments = []
    # Search by patient_id (id of the patient record)
    async for appt in appointments_collection.find({"patient_id": patient_id}):
        appt["_id"] = str(appt["_id"])
        appointments.append(appt)
    return appointments

async def get_user_all_appointments(user_id: str):
    """Fetch appointments for all family members linked to a user."""
    # 1. Find all patients for this user
    patients = await patient_service.get_my_patients(user_id)
    patient_ids = [p["_id"] for p in patients]
    
    # 2. Find appointments for these patients
    appointments = []
    async for appt in appointments_collection.find({"patient_id": {"$in": patient_ids}}).sort("date", -1):
        appt["_id"] = str(appt["_id"])
        appointments.append(appt)
    return appointments

async def cancel_appointment(appointment_id: str):
    appt = await appointments_collection.find_one({"_id": ObjectId(appointment_id)})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    await appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "cancelled"}}
    )
    
    await scheduling_service.release_slot(
        appt["doctor_id"],
        appt["date"],
        appt["time"]
    )
    logger.info(f"Appointment {appointment_id} cancelled")
    return True

async def get_doctor_appointments(doctor_id: str):
    appointments = []
    async for appt in appointments_collection.find({"doctor_id": doctor_id}):
        appt["_id"] = str(appt["_id"])
        # Ensure name is present (auto-heal if legacy)
        if not appt.get("patient_name"):
            p = await patient_service.get_patient_by_id(appt.get("patient_id"))
            if p:
                appt["patient_name"] = p["name"]
        appointments.append(appt)
    
    appointments.sort(key=lambda x: datetime.strptime(f"{x['date']} {x['time']}", "%Y-%m-%d %H:%M"))
    return appointments

async def update_appointment_status(appointment_id: str, status: str):
    appt = await appointments_collection.find_one({"_id": ObjectId(appointment_id)})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    await appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": status}}
    )

    if status == "cancelled":
        await scheduling_service.release_slot(
            appt["doctor_id"],
            appt["date"],
            appt["time"]
        )
    return True

async def get_doctor_patients(doctor_id: str):
    """Retrieve a unique list of all patients that have booked with this doctor."""
    patients_dict = {}
    async for appt in appointments_collection.find({"doctor_id": doctor_id}):
        p_id = appt.get("patient_id")
        if p_id and p_id not in patients_dict:
            p = await patient_service.get_patient_by_id(p_id)
            if p and p.get("is_active", True) is not False:
                patients_dict[p_id] = {
                    "id": str(p["_id"]),
                    "name": p.get("name"),
                    "phone": p.get("phone"),
                    "gender": p.get("gender")
                }
    return list(patients_dict.values())

