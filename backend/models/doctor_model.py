from datetime import datetime

# Schema structure for Doctor
doctor_schema = {
    "doctor_id": str,
    "name": str,
    "specialization": str,
    "department": str,
    "available_slots": list,
    "email": str,
    "created_at": datetime
}
