from fastapi import HTTPException
from app.database import visit_history_collection, appointments_collection
from bson import ObjectId
from app.core.logger import logger
from app.utils.pdf_generator import generate_prescription_pdf

async def record_visit(visit_data_obj):
    appt = await appointments_collection.find_one({"_id": ObjectId(visit_data_obj.appointment_id)})
    if not appt:
        logger.warning(f"Failed to record visit: Appointment {visit_data_obj.appointment_id} not found")
        raise HTTPException(status_code=404, detail="Appointment not found")

    visit_record = visit_data_obj.dict()
    visit_record["doctor_id"] = appt["doctor_id"]
    visit_record["patient_id"] = appt["patient_id"]
    
    result = await visit_history_collection.insert_one(visit_record)
    
    # Mark appointment as completed
    await appointments_collection.update_one(
        {"_id": ObjectId(visit_data_obj.appointment_id)},
        {"$set": {"status": "completed"}}
    )
    
    logger.info(f"Visit recorded for appointment {visit_data_obj.appointment_id}. Visit ID: {result.inserted_id}")
    return str(result.inserted_id)

async def get_visit_by_id(visit_id: str):
    return await visit_history_collection.find_one({"_id": ObjectId(visit_id)})

async def generate_prescription(visit_id: str):
    visit = await get_visit_by_id(visit_id)
    if not visit:
        logger.warning(f"Failed to generate prescription: Visit {visit_id} not found")
        raise HTTPException(status_code=404, detail="Visit record not found")
        
    file_path = generate_prescription_pdf(visit_id, visit)
    logger.info(f"Prescription generated for visit {visit_id}")
    return file_path
