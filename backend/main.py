from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_indexes
from app.routes import users, doctors, appointments, admin, schedules, leaves
from app.routes import visit_history
from app.routes import availability

app = FastAPI(
    title="Hospital Appointment System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
    yield

app = FastAPI(
    title="Hospital Appointment System",
    version="1.0.0",
    lifespan=lifespan
)


# Register routers
app.include_router(users.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(admin.router)
app.include_router(visit_history.router)
app.include_router(schedules.router)
app.include_router(leaves.router)
app.include_router(availability.router)


@app.get("/")
def root():
    return {"message": "Hospital API Running"}