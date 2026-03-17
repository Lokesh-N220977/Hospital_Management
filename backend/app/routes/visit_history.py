from fastapi import APIRouter, Depends
from app.models.visit_history_model import VisitCreate
from app.services import visit_service
from fastapi.responses import FileResponse
from app.core.logger import logger

router = APIRouter(prefix="/api/v1/visit-history", tags=["Visit History"])

@router.post("/add")
async def add_visit(visit: VisitCreate):
    logger.info(f"Adding visit history for appointment {visit.appointment_id}")
    visit_id = await visit_service.record_visit(visit)
    return {"message": "Visit history recorded", "visit_id": visit_id}

@router.get("/prescription/{visit_id}")
async def get_prescription(visit_id: str):
    logger.info(f"Downloading prescription for visit {visit_id}")
    file_path = await visit_service.generate_prescription(visit_id)
    return FileResponse(file_path, filename=f"prescription_{visit_id}.pdf")