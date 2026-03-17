from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import users, doctors, appointments, admin, visit_history, availability
from app.core.logger import logger

app = FastAPI(title="Hospital Management System", version="1.0.0")

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
app.include_router(appointments.router)
app.include_router(admin.router)
app.include_router(visit_history.router)
app.include_router(availability.router)

# Health Check
@app.get("/health")
async def health():
    return {"status": "running"}

@app.get("/")
async def root():
    return {"message": "Welcome to Hospital Management API"}
