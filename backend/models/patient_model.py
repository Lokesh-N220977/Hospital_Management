from datetime import datetime

# Schema structure for Patient
patient_schema = {
    "patient_id": str,
    "name": str,
    "age": int,
    "phone": str,
    "email": str,
    "password": str,
    "created_at": datetime
}
