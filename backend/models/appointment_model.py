from datetime import datetime

# Schema structure for Appointment
appointment_schema = {
    "appointment_id": str,
    "patient_id": str,
    "doctor_id": str,
    "date": str,
    "time": str,
    "status": str,  # Scheduled, Completed, Cancelled
    "created_at": datetime
}
