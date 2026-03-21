from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import users, doctors, appointments as legacy_appointments, admin, visit_history, doctor_portal, prescriptions, patients, notifications, reviews
from app.api.v1 import doctor_schedule, appointments
from app.services.scheduler_service import start_scheduler, stop_scheduler
from app.core.logger import logger

from app.database import client
from app.config import DATABASE_NAME

if not DATABASE_NAME:
    raise ValueError("DATABASE_NAME environment variable is required")

from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Hospital Management System", version="1.0.0")

# Ensure upload directory exists
os.makedirs("uploads/doctor_profiles", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

import asyncio

async def create_db_indexes():
    """Create database indexes in the background to speed up startup."""
    try:
        from app.database import (
            users_collection, 
            appointments_collection, 
            doctors_collection,
            patients_collection,
            doctor_schedules_collection,
            doctor_leaves_collection,
            visit_history_collection
        )
        from pymongo import ASCENDING, DESCENDING
        
        logger.info("Initializing database indexes...")
        # Users indexes
        await users_collection.create_index([("email", ASCENDING)], unique=True, sparse=True)
        await users_collection.create_index([("phone", ASCENDING)], unique=True, sparse=True)
        await users_collection.create_index([("role", ASCENDING)])
        
        # Doctors indexes
        await doctors_collection.create_index([("specialization", ASCENDING)])
        await doctors_collection.create_index([("location", ASCENDING)])
        await doctors_collection.create_index([("available", ASCENDING)])
        await doctors_collection.create_index([("user_id", ASCENDING)], unique=True)
        await doctors_collection.create_index([("experience", DESCENDING)])
        
        # Patients indexes
        await patients_collection.create_index([("user_id", ASCENDING)])
        await patients_collection.create_index([("email", ASCENDING)])
        await patients_collection.create_index([("phone", ASCENDING)])
        await patients_collection.create_index([("is_active", ASCENDING)])
        
        # Appointments indexes
        await appointments_collection.create_index([("doctor_id", ASCENDING)])
        await appointments_collection.create_index([("patient_id", ASCENDING)])
        await appointments_collection.create_index([("appointment_date", ASCENDING)])
        await appointments_collection.create_index([("status", ASCENDING)])
        await appointments_collection.create_index([("slot_start", DESCENDING)])
        
        # Composite index for finding specific slots
        await appointments_collection.create_index(
            [("doctor_id", ASCENDING), ("slot_start", ASCENDING)], 
            unique=True, 
            partialFilterExpression={"status": {"$in": ["booked", "completed", "no_show"]}}
        )

        # Schedules and Leaves
        await doctor_schedules_collection.create_index([("doctor_id", ASCENDING)], unique=True)
        await doctor_leaves_collection.create_index([("doctor_id", ASCENDING), ("date", ASCENDING)])

        # Visit History
        await visit_history_collection.create_index([("patient_id", ASCENDING)])
        await visit_history_collection.create_index([("appointment_id", ASCENDING)], unique=True)
        
        # Drop legacy unique index if it exists
        try:
            await appointments_collection.drop_index("doctor_id_1_date_1_time_1")
        except:
            pass
            
        logger.info("Database indexes initialized successfully.")
    except Exception as e:
        logger.error(f"Index creation failed: {e}")

@app.on_event("startup")
async def startup_db_client():
    try:
        # Quick ping to confirm connection
        await client.admin.command('ping')
        logger.info(f"Connected to MongoDB: {DATABASE_NAME}")
        
        # Start recurring jobs
        start_scheduler()
        
        # Run index creation in background
        asyncio.create_task(create_db_indexes())
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    stop_scheduler()
    logger.info("Application shutting down.")



# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"}
    )

# Routers
app.include_router(users.router)
app.include_router(doctors.router)
app.include_router(legacy_appointments.router) # Corrected from 'appointments.router' to fix name collision
app.include_router(admin.router)
app.include_router(visit_history.router)
app.include_router(doctor_portal.router)
app.include_router(prescriptions.router)
app.include_router(patients.router)
app.include_router(doctor_schedule.router, prefix="/api/v1")
app.include_router(appointments.router, prefix="/api/v1") # This refers to the v1 appointments router
app.include_router(notifications.router)
app.include_router(reviews.router)
from app.routes import settings, doctor_settings, admin_settings
app.include_router(settings.router)
app.include_router(doctor_settings.router)
app.include_router(admin_settings.router)

# Health Check
@app.get("/health")
async def health():
    return {"status": "running"}

@app.get("/")
async def root():
    return {"message": "Welcome to Hospital Management API"}
