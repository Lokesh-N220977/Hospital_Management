from app.database.connection import db


users_collection = db["users"]
doctors_collection = db["doctors"]
appointments_collection = db["appointments"]
doctor_schedules_collection = db["doctor_schedules"]
# doctor_shifts_collection = db["doctor_shifts"]  # DELETED for dynamic system
# doctor_slots_collection = db["doctor_slots"]    # DELETED for dynamic system
doctor_leaves_collection = db["doctor_leaves"]
visit_history_collection = db["visit_history"]
patients_collection = db["patients"]
prescriptions_collection = db["prescriptions"]
otp_collection = db["otp"]
reviews_collection = db["reviews"]
patient_settings_collection = db["patient_settings"]
doctor_settings_collection = db["doctor_settings"]
admin_settings_collection = db["admin_settings"]
hospital_settings_collection = db["hospital_settings"]
hospitals_collection = db["hospitals"]

