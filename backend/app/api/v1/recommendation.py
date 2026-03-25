from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from app.services.recommendation_service import RecommendationService

router = APIRouter()


class EmergencyRequest(BaseModel):
    symptoms: str
    preferred_date: str


@router.post("/emergency-slot")
async def emergency_slot(data: EmergencyRequest):
    try:
        slot = await RecommendationService.get_emergency_slot(data.symptoms, data.preferred_date)
        if not slot:
            raise HTTPException(status_code=404, detail="No emergency slots available for today")
        return slot
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
