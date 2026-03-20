from fastapi import HTTPException
from app.database import visit_history_collection, appointments_collection, users_collection, doctors_collection
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

async def get_patient_visits(patient_id: str):
    # 1. Fetch clinical records from visit_history_collection
    clinical_records = await visit_history_collection.find({"patient_id": patient_id}).to_list(200)
    clinical_map = {str(r.get("appointment_id")): r for r in clinical_records if r.get("appointment_id")}

    # 2. Fetch all completed/cancelled appointments
    appointments = await appointments_collection.find({
        "patient_id": patient_id,
        "status": {"$in": ["completed", "cancelled", "Completed", "Cancelled"]}
    }).sort("date", -1).to_list(200)

    visits = []
    for appt in appointments:
        appt_id = str(appt["_id"])
        
        # Skip empty completed appointments that have no actual clinical notes inside them
        if appt["status"].lower() == "completed" and appt_id not in clinical_map:
            continue
            
        visit = {
            "type": "visit",
            "id": appt_id,
            "_id": appt_id,
            "doctor_id": appt["doctor_id"],
            "doctor_name": appt.get("doctor_name", "Unknown Doctor"),
            "specialization": appt.get("specialization", "General Medicine"),
            "date": appt["date"],
            "status": appt["status"],
            "diagnosis": "Consultation completed" if appt["status"] == "completed" else "Appointment cancelled",
            "medicines": [],
            "notes": appt.get("cancellation_reason", ""),
            "appointment_id": appt_id
        }

        # Override with clinical record if available
        if appt_id in clinical_map:
            record = clinical_map[appt_id]
            visit["diagnosis"] = record.get("diagnosis", visit["diagnosis"])
            visit["medicines"] = record.get("medicines", [])
            visit["notes"] = record.get("notes", visit["notes"])
            visit["_id"] = str(record["_id"])  # Crucial for downloading the PDF

        visits.append(visit)

    # 3. Handle orphaned clinical records (if any)
    for appt_id, record in clinical_map.items():
         if not any(v["appointment_id"] == appt_id for v in visits if v["type"] == "visit"):
            record["id"] = str(record["_id"])
            record["_id"] = record["id"]
            record["type"] = "visit"
            visits.append(record)

    # 3.5 Handle Standalone Digital Prescriptions
    from app.database import prescriptions_collection
    standalone = await prescriptions_collection.find({"patient_id": patient_id}).to_list(100)
    for p in standalone:
        visits.append({
            "type": "prescription",
            "id": str(p["_id"]),
            "_id": str(p["_id"]),
            "doctor_id": p.get("doctor_id", ""),
            "doctor_name": p.get("doctor_name", "Digital Prescription"),
            "specialization": "General Medicine",
            "date": p.get("date", ""),
            "status": p.get("status", "Active"),
            "diagnosis": "Pharmacological Order",
            "medicines": [f"{p.get('medicine')} {p.get('strength')} - {p.get('dosage')}"],
            "notes": p.get("instructions", "No specific instructions."),
            "appointment_id": ""
        })

    # 4. Final sort by date
    visits.sort(key=lambda x: x.get("date", ""), reverse=True)
    return visits

async def get_user_all_visits(user_id: str):
    from app.database import patients_collection
    # Fetch all patients connected to this user account
    patients = await patients_collection.find({"user_id": user_id}).to_list(100)
    
    all_visits = []
    for p in patients:
        p_id = str(p["_id"])
        # Fetch visits for each patient identity
        p_visits = await get_patient_visits(p_id)
        
        # Attach the exact patient name so the frontend sees who it belongs to
        for v in p_visits:
            v["patient_name"] = p.get("name", "Unknown Patient")
            
        all_visits.extend(p_visits)
        
    # Sort all family visits globally by date descending
    all_visits.sort(key=lambda x: x.get("date", ""), reverse=True)
    return all_visits
