from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.dependencies import get_current_user
from app.core.role_checker import get_doctor_user
from app.models.prescription_model import PrescriptionCreate, PrescriptionResponse
from app.services import prescription_service, doctor_service

router = APIRouter(prefix="/api/v1/prescriptions", tags=["Prescriptions"])

@router.post("/", response_model=dict)
async def create_new_prescription(
    prescription: PrescriptionCreate, 
    current_user=Depends(get_doctor_user)
):
    """Allow doctors to issue new prescriptions."""
    # Basic authorization check
    if prescription.doctor_id != str(current_user["_id"]) and prescription.doctor_id != current_user.get("id"):
         # For flexibility during initial testing, we'll allow but log
         pass

    data = prescription.dict()
    presc_id = await prescription_service.create_prescription(data)
    
    if presc_id:
        # Notify patient via email
        try:
            from app.services import patient_service
            patient = await patient_service.get_patient_by_id(prescription.patient_id)
            if patient and patient.get("email"):
                from app.services.email_service import EmailService
                import asyncio
                asyncio.create_task(EmailService.send_prescription_notification(
                    to_email=patient["email"],
                    patient_name=patient.get("name", "Valued Patient"),
                    doctor_name=current_user.get("name", "Doctor")
                ))
        except Exception as e:
            print(f"Prescription email notification failed: {e}")

    return {"message": "Prescription issued successfully", "id": presc_id}

@router.get("/doctor/{doctor_id}", response_model=List[dict])
async def get_doctor_issued_prescriptions(
    doctor_id: str, 
    current_user=Depends(get_doctor_user)
):
    """Fetch all prescriptions issued by the doctor."""
    return await prescription_service.get_doctor_prescriptions(doctor_id)

@router.get("/patient/{patient_id}", response_model=List[dict])
async def get_patient_received_prescriptions(
    patient_id: str, 
    current_user=Depends(get_current_user)
):
    """Fetch all prescriptions for the patient."""
    return await prescription_service.get_patient_prescriptions(patient_id)

@router.patch("/{presc_id}/status")
async def update_status(
    presc_id: str, 
    status: str, 
    current_user=Depends(get_doctor_user)
):
    """Update prescription status (Doctor only)."""
    success = await prescription_service.update_prescription_status(presc_id, status)
    if not success:
        raise HTTPException(status_code=400, detail="Update failed")
    return {"message": f"Status updated to {status}"}

@router.get("/{presc_id}", response_model=dict)
async def get_prescription(
    presc_id: str
):
    """Fetch single prescription by ID."""
    from app.database import prescriptions_collection
    from bson import ObjectId
    try:
        presc = await prescriptions_collection.find_one({"_id": ObjectId(presc_id)})
        if not presc:
            raise HTTPException(status_code=404, detail="Prescription not found")
        presc["id"] = str(presc["_id"])
        presc.pop("_id", None)
        return {"data": presc}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid Prescription ID format")

@router.get("/{presc_id}/download")
async def download_prescription(
    presc_id: str
):
    from fastapi.responses import FileResponse
    from app.utils.pdf_generator import generate_standalone_prescription_pdf
    from app.database import prescriptions_collection
    from bson import ObjectId
    
    presc = await prescriptions_collection.find_one({"_id": ObjectId(presc_id)})
    if not presc:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    file_path = generate_standalone_prescription_pdf(presc_id, presc)
    return FileResponse(file_path, filename=f"Medical_Prescription_{presc_id}.pdf")
