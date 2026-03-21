from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.services import patient_service
from app.models.user_model import PatientCreate
from app.core.logger import logger

router = APIRouter(prefix="/api/v1/patients", tags=["Patients"])

@router.get("/my")
async def get_my_family_patients(current_user=Depends(get_current_user)):
    """Fetch all patient identities linked to the logged-in user (Self + Family)."""
    user_id = str(current_user["_id"])
    return await patient_service.get_my_patients(user_id)

@router.post("/add")
async def add_family_member(patient: PatientCreate, current_user=Depends(get_current_user)):
    """Allow user to add a family member's medical identity to their account."""
    user_id = str(current_user["_id"])
    patient_data = patient.dict()
    patient_data["user_id"] = user_id
    patient_data["created_by"] = "family"
    patient_id = await patient_service.add_patient(patient_data)
    return {"message": "Family member added successfully", "id": patient_id}

@router.get("/{patient_id}")
async def get_patient_details(patient_id: str, current_user=Depends(get_current_user)):
    """Fetch specific patient details. Ensures the patient belongs to the user."""
    patient = await patient_service.get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient.get("user_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    return patient

@router.put("/{patient_id}")
async def update_family_member(patient_id: str, update_data: dict, current_user=Depends(get_current_user)):
    """Update a family member's details. Only owner can edit."""
    patient = await patient_service.get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient.get("user_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    # Cannot edit primary self record's phone (identity key)
    safe = {k: v for k, v in update_data.items() if k in ["name", "gender", "relation", "phone", "age"]}
    await patient_service.update_patient(patient_id, safe)
    return {"message": "Member updated successfully"}

@router.delete("/{patient_id}")
async def delete_family_member(patient_id: str, current_user=Depends(get_current_user)):
    """Delete a family member. Cannot delete the primary self record."""
    patient = await patient_service.get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient.get("user_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    if patient.get("created_by") == "self":
        raise HTTPException(status_code=400, detail="Cannot delete your primary account patient record")
    await patient_service.delete_patient(patient_id)
    return {"message": "Member removed successfully"}
