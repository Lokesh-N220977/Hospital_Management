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
    """Fetch visits for a single patient."""
    return await get_visits_by_patient_ids([patient_id])

async def get_visits_by_patient_ids(patient_ids: list):
    """Fetch clinical records, appointments, and prescriptions for multiple patient IDs in batch."""
    if not patient_ids:
        return []
        
    # 1, 2, 4. Fetch clinical records, appointments, and prescriptions in parallel
    import asyncio
    
    clinical_task = visit_history_collection.find(
        {"patient_id": {"$in": patient_ids}},
        {"_id": 1, "appointment_id": 1, "diagnosis": 1, "medicines": 1, "notes": 1, "patient_id": 1}
    ).to_list(1000)

    appointments_task = appointments_collection.find({
        "patient_id": {"$in": patient_ids},
        "status": {"$in": ["completed", "cancelled", "Completed", "Cancelled"]}
    }).sort("appointment_date", -1).to_list(1000)

    from app.database import prescriptions_collection
    prescriptions_task = prescriptions_collection.find(
        {"patient_id": {"$in": patient_ids}}
    ).to_list(500)

    clinical_records, appointments, standalone = await asyncio.gather(
        clinical_task, appointments_task, prescriptions_task
    )

    clinical_map = {str(r.get("appointment_id")): r for r in clinical_records if r.get("appointment_id")}

    visits = []
    for appt in appointments:
        appt_id = str(appt["_id"])
        
        # Skip empty completed appointments that have no actual clinical notes inside them
        status_lower = appt["status"].lower()
        if status_lower == "completed" and appt_id not in clinical_map:
            continue
            
        visit = {
            "type": "visit",
            "id": appt_id,
            "_id": appt_id,
            "patient_id": str(appt["patient_id"]),
            "doctor_id": str(appt["doctor_id"]),
            "doctor_name": appt.get("doctor_name", "Unknown Doctor"),
            "specialization": appt.get("specialization", "General Medicine"),
            "date": appt.get("appointment_date") or appt.get("date", ""),
            "status": appt["status"],
            "diagnosis": "Consultation completed" if status_lower == "completed" else "Appointment cancelled",
            "medicines": [],
            "notes": appt.get("cancel_reason", ""),
            "appointment_id": appt_id
        }

        # Override with clinical record if available
        if appt_id in clinical_map:
            record = clinical_map[appt_id]
            visit["diagnosis"] = record.get("diagnosis", visit["diagnosis"])
            visit["medicines"] = record.get("medicines", [])
            visit["notes"] = record.get("notes", visit["notes"])
            visit["_id"] = str(record["_id"])

        visits.append(visit)

    # 3. Handle orphaned clinical records
    for appt_id, record in clinical_map.items():
         if not any(v.get("appointment_id") == appt_id for v in visits):
            record["id"] = str(record["_id"])
            record["_id"] = record["id"]
            record["type"] = "visit"
            record["patient_id"] = str(record.get("patient_id"))
            visits.append(record)

    # 4. Handle Standalone Digital Prescriptions
    for p in standalone:
        visits.append({
            "type": "prescription",
            "id": str(p["_id"]),
            "_id": str(p["_id"]),
            "patient_id": str(p.get("patient_id")),
            "doctor_id": str(p.get("doctor_id", "")),
            "doctor_name": p.get("doctor_name", "Digital Prescription"),
            "specialization": "General Medicine",
            "date": p.get("date", ""),
            "status": p.get("status", "Active"),
            "diagnosis": "Pharmacological Order",
            "medicines": [f"{p.get('medicine')} {p.get('strength')} - {p.get('dosage')}"],
            "notes": p.get("instructions", "No specific instructions."),
            "appointment_id": ""
        })

    # 5. Global sort by date
    visits.sort(key=lambda x: x.get("date", ""), reverse=True)
    return visits

async def get_user_all_visits(user_id: str):
    from app.database import patients_collection
    # 1. Fetch all patient identities for this user in one go
    patients = await patients_collection.find({"user_id": user_id, "is_active": {"$ne": False}}).to_list(100)
    if not patients:
        return []
        
    patient_ids = [str(p["_id"]) for p in patients]
    patient_names = {str(p["_id"]): p.get("name", "Unknown Patient") for p in patients}
    
    # 2. Fetch all visits in batch
    all_visits = await get_visits_by_patient_ids(patient_ids)
    
    # 3. Attach patient names
    for v in all_visits:
        v["patient_name"] = patient_names.get(v.get("patient_id"), "Unknown Patient")
            
    return all_visits
