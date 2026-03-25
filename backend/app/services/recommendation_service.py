from typing import List, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.database import doctors_collection, appointments_collection
from app.services.dynamic_slot_service import DynamicSlotService

class RecommendationService:
    SYMPTOM_MAP = {
        "fever": "General Physician",
        "cold": "General Physician",
        "cough": "General Physician",
        "heart": "Cardiology",
        "chest": "Cardiology",
        "skin": "Dermatology",
        "rash": "Dermatology",
        "bones": "Orthopedics",
        "fracture": "Orthopedics",
        "headache": "Neurology",
        "seizure": "Neurology",
        "eye": "Ophthalmology",
        "vision": "Ophthalmology",
        "child": "Pediatrics",
        "baby": "Pediatrics"
    }
    

    @staticmethod
    async def get_emergency_slot(symptoms: str, preferred_date: str) -> Dict:
        # Find earliest available slot across ALL active doctors
        doctors_cursor = doctors_collection.find({"available": True})
        doctors = await doctors_cursor.to_list(100)
        
        best_option = None
        
        for doc in doctors:
            doc_id = str(doc["_id"])
            try:
                slots = await DynamicSlotService.generate_slots(doc_id, preferred_date)
            except Exception:
                slots = []
                
            available_slots = [s for s in slots if not s["is_full"]]
            if not available_slots:
                continue
                
            first_slot = available_slots[0]
            
            if best_option is None or first_slot["time"] < best_option["time"]:
                best_option = {
                    "doctor_id": doc_id,
                    "doctor_name": doc.get("name"),
                    "specialization": doc.get("specialization"),
                    "time": first_slot["time"],
                    "date": preferred_date
                }
                
        return best_option
