from fastapi import APIRouter, Depends, HTTPException
from app.models.review_model import ReviewCreate
from app.services.review_service import (
    create_review, get_doctor_reviews, 
    get_doctor_rating_summary, get_appointment_review
)
from app.routes.users import get_current_user
from app.database import db

router = APIRouter(prefix="/api/v1", tags=["Reviews"])

@router.get("/appointments/{appointment_id}/review")
async def get_appt_review(appointment_id: str):
    try:
        return await get_appointment_review(appointment_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/reviews")
async def add_review(
    data: ReviewCreate,
    current_user=Depends(get_current_user)
):
    try:
        return await create_review(data, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/doctors/{doctor_id}/reviews")
async def get_reviews(doctor_id: str):
    try:
        return await get_doctor_reviews(doctor_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/doctors/{doctor_id}/rating")
async def get_rating(doctor_id: str):
    try:
        return await get_doctor_rating_summary(doctor_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
