from .connection import db

users_collection = db["users"]
doctors_collection = db["doctors"]
appointments_collection = db["appointments"]
doctor_schedules_collection = db["doctor_schedules"]
doctor_slots_collection = db["doctor_slots"]
doctor_leaves_collection = db["doctor_leaves"]
visit_history_collection = db["visit_history"]
