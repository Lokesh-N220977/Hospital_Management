import logging
from datetime import datetime
from bson import ObjectId
from app.database import prescriptions_collection
from app.core.logger import logger

async def create_prescription(prescription_data: dict):
    """Create a new prescription in the database."""
    try:
        prescription_data["created_at"] = datetime.utcnow()
        prescription_data["status"] = "Active"
        result = await prescriptions_collection.insert_one(prescription_data)
        logger.info(f"Prescription created with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Error creating prescription: {e}")
        return None

async def get_doctor_prescriptions(doctor_id: str):
    """Fetch all prescriptions issued by a specific doctor."""
    prescriptions = []
    async for presc in prescriptions_collection.find({"doctor_id": doctor_id}).sort("created_at", -1):
        presc["id"] = str(presc["_id"])
        del presc["_id"]
        prescriptions.append(presc)
    return prescriptions

async def get_patient_prescriptions(patient_id: str):
    """Fetch all prescriptions for a specific patient."""
    prescriptions = []
    async for presc in prescriptions_collection.find({"patient_id": patient_id}).sort("created_at", -1):
        presc["id"] = str(presc["_id"])
        del presc["_id"]
        prescriptions.append(presc)
    return prescriptions

async def update_prescription_status(prescription_id: str, status: str):
    """Update status (e.g., Expired, Completed)."""
    try:
        await prescriptions_collection.update_one(
            {"_id": ObjectId(prescription_id)},
            {"$set": {"status": status}}
        )
        return True
    except Exception as e:
        logger.error(f"Error updating prescription status: {e}")
        return False
