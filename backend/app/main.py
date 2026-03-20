from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import users, doctors, appointments as legacy_appointments, admin, visit_history, doctor_portal, prescriptions, patients
from app.api.v1 import doctor_schedule, appointments
from app.core.logger import logger

from app.database import client
from app.config import DATABASE_NAME

if not DATABASE_NAME:
    raise ValueError("DATABASE_NAME environment variable is required")

app = FastAPI(title="Hospital Management System", version="1.0.0")

@app.on_event("startup")
async def startup_db_client():
    try:
        await client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB: {DATABASE_NAME}")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        # Not raising here to allow app to start for health checks, 
        # but the log clearly shows failure.



# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# Health Check
@app.get("/health")
async def health():
    return {"status": "running"}

@app.get("/")
async def root():
    return {"message": "Welcome to Hospital Management API"}
