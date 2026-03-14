from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.database import visit_history_collection, appointments_collection
from app.models.visit_model import VisitCreate
from fastapi.responses import FileResponse
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import os


router = APIRouter(prefix="/api/visit-history", tags=["Visit History"])


@router.post("/add")
async def add_visit(visit: VisitCreate):

    appointment = await appointments_collection.find_one({
        "_id": ObjectId(visit.appointment_id)
    })

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    visit_data = {
        "appointment_id": visit.appointment_id,
        "doctor_id": appointment["doctor_id"],
        "patient_id": appointment["patient_id"],
        "diagnosis": visit.diagnosis,
        "medicines": visit.medicines,
        "notes": visit.notes
    }

    result = await visit_history_collection.insert_one(visit_data)

    await appointments_collection.update_one(
        {"_id": ObjectId(visit.appointment_id)},
        {"$set": {"status": "completed"}}
    )

    return {
        "message": "Visit recorded",
        "visit_id": str(result.inserted_id)
    }


@router.get("/patient/{patient_id}")
async def get_patient_history(patient_id: str):

    visits = []

    async for visit in visit_history_collection.find({"patient_id": patient_id}):

        visit["_id"] = str(visit["_id"])
        visits.append(visit)

    return visits

@router.get("/prescription/{visit_id}")
async def generate_prescription(visit_id: str):

    visit = await visit_history_collection.find_one({"_id": ObjectId(visit_id)})

    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    file_path = f"prescription_{visit_id}.pdf"

    styles = getSampleStyleSheet()

    story = []

    story.append(Paragraph("Hospital Prescription", styles["Title"]))
    story.append(Spacer(1, 20))

    story.append(Paragraph(f"Diagnosis: {visit['diagnosis']}", styles["Normal"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Medicines:", styles["Heading3"]))

    for med in visit["medicines"]:
        story.append(Paragraph(f"- {med}", styles["Normal"]))

    story.append(Spacer(1, 10))

    story.append(Paragraph(f"Notes: {visit['notes']}", styles["Normal"]))

    pdf = SimpleDocTemplate(file_path)
    pdf.build(story)

    return FileResponse(file_path, filename=file_path)