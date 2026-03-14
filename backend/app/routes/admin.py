from fastapi import APIRouter, HTTPException
from app.database import doctors_collection
from app.models.doctor_model import DoctorCreate
from app.database import doctor_schedules_collection
from app.models.schedule_model import DoctorScheduleCreate
from app.database import doctor_leaves_collection, appointments_collection
from app.models.leave_model import DoctorLeaveCreate
from bson import ObjectId
from datetime import datetime, timedelta
from app.database import users_collection, doctors_collection, appointments_collection


router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.post("/add-doctor")
async def add_doctor(doctor: DoctorCreate):

    existing = await doctors_collection.find_one({"email": doctor.email})

    if existing:
        raise HTTPException(status_code=400, detail="Doctor already exists")

    doctor_data = {
        "name": doctor.name,
        "email": doctor.email,
        "specialization": doctor.specialization,
        "experience": doctor.experience,
        "consultation_fee": doctor.consultation_fee,
        "available": True
    }

    result = await doctors_collection.insert_one(doctor_data)

    return {
        "message": "Doctor added successfully",
        "doctor_id": str(result.inserted_id)
    }


@router.get("/doctors")
async def admin_get_all_doctors():

    doctors = []

    async for doctor in doctors_collection.find():
        doctor["_id"] = str(doctor["_id"])
        doctors.append(doctor)

    return doctors


@router.post("/set-doctor-schedule")
async def set_doctor_schedule(schedule: DoctorScheduleCreate):

    schedule_data = {
        "doctor_id": schedule.doctor_id,
        "day": schedule.day,
        "start_time": schedule.start_time,
        "end_time": schedule.end_time,
        "slot_duration": schedule.slot_duration
    }

    result = await doctor_schedules_collection.insert_one(schedule_data)

    return {
        "message": "Schedule created",
        "schedule_id": str(result.inserted_id)
    }

@router.post("/doctor-leave")
async def doctor_leave(leave: DoctorLeaveCreate):

    leave_data = {
        "doctor_id": leave.doctor_id,
        "leave_date": leave.leave_date,
        "reason": leave.reason
    }

    await doctor_leaves_collection.insert_one(leave_data)

    # cancel appointments on that day
    await appointments_collection.update_many(
        {
            "doctor_id": leave.doctor_id,
            "date": leave.leave_date,
            "status": "booked"
        },
        {
            "$set": {"status": "cancelled"}
        }
    )

    return {"message": "Doctor leave recorded and appointments cancelled"}

@router.get("/analytics")
async def admin_analytics():

    today = datetime.now().strftime("%Y-%m-%d")

    total_doctors = await doctors_collection.count_documents({})
    total_patients = await users_collection.count_documents({"role": "patient"})
    total_appointments = await appointments_collection.count_documents({})
    today_appointments = await appointments_collection.count_documents({"date": today})

    # appointment status distribution
    booked = await appointments_collection.count_documents({"status": "booked"})
    completed = await appointments_collection.count_documents({"status": "completed"})
    cancelled = await appointments_collection.count_documents({"status": "cancelled"})

    # last 7 days appointments
    last7days = []

    for i in range(7):
        day = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")

        count = await appointments_collection.count_documents({"date": day})

        last7days.append({
            "date": day,
            "appointments": count
        })

    return {
        "system_stats": {
            "total_doctors": total_doctors,
            "total_patients": total_patients,
            "total_appointments": total_appointments,
            "today_appointments": today_appointments
        },
        "appointment_status": {
            "booked": booked,
            "completed": completed,
            "cancelled": cancelled
        },
        "appointments_last_7_days": last7days
    }

