from fastapi import APIRouter
from app.database import doctors_collection
from datetime import datetime, timedelta
from app.database import doctor_schedules_collection
from app.database import doctor_leaves_collection
from app.database import appointments_collection
from datetime import datetime
from app.database import appointments_collection


router = APIRouter(prefix="/api/doctors", tags=["Doctors"])


@router.get("/")
async def get_all_doctors(
    specialization: str | None = None,
    min_experience: int | None = None,
    max_fee: int | None = None
):

    query = {"available": True}

    if specialization:
        query["specialization"] = specialization

    if min_experience:
        query["experience"] = {"$gte": min_experience}

    if max_fee:
        query["consultation_fee"] = {"$lte": max_fee}

    doctors = []

    async for doctor in doctors_collection.find(query):

        doctor["_id"] = str(doctor["_id"])
        doctors.append(doctor)

    return doctors


@router.get("/{doctor_id}")
async def get_doctor(doctor_id: str):

    from bson import ObjectId

    doctor = await doctors_collection.find_one({"_id": ObjectId(doctor_id)})

    if doctor:
        doctor["_id"] = str(doctor["_id"])

    return doctor


@router.get("/{doctor_id}/slots")
async def get_doctor_slots(doctor_id: str, date: str):

    # check doctor leave
    leave = await doctor_leaves_collection.find_one({
        "doctor_id": doctor_id,
        "leave_date": date
    })

    if leave:
        return {"message": "Doctor is on leave"}

    # get weekday
    day = datetime.strptime(date, "%Y-%m-%d").strftime("%A")

    schedule = await doctor_schedules_collection.find_one({
        "doctor_id": doctor_id,
        "day": day
    })

    if not schedule:
        return {"message": "Doctor not available on this day"}

    start = datetime.strptime(schedule["start_time"], "%H:%M")
    end = datetime.strptime(schedule["end_time"], "%H:%M")
    duration = schedule["slot_duration"]

    generated_slots = []

    while start < end:
        generated_slots.append(start.strftime("%H:%M"))
        start += timedelta(minutes=duration)

    # find booked slots
    booked_slots = []

    async for appt in appointments_collection.find({
        "doctor_id": doctor_id,
        "date": date,
        "status": "booked"
    }):
        booked_slots.append(appt["time"])

    # remove booked slots
    available_slots = [slot for slot in generated_slots if slot not in booked_slots]

    return {
        "doctor_id": doctor_id,
        "date": date,
        "available_slots": available_slots
    }

@router.get("/{doctor_id}/dashboard")
async def doctor_dashboard(doctor_id: str):

    today = datetime.now().strftime("%Y-%m-%d")

    today_appointments = []
    completed = 0
    upcoming = 0

    async for appt in appointments_collection.find({
        "doctor_id": doctor_id,
        "date": today
    }):

        appt["_id"] = str(appt["_id"])
        today_appointments.append(appt)

        if appt["status"] == "completed":
            completed += 1

        if appt["status"] == "booked":
            upcoming += 1

    return {
        "doctor_id": doctor_id,
        "date": today,
        "total_appointments": len(today_appointments),
        "completed": completed,
        "upcoming": upcoming,
        "appointments": today_appointments
    }

@router.get("/search")
async def search_doctors(query: str):

    doctors = []

    async for doctor in doctors_collection.find(
        {"name": {"$regex": query, "$options": "i"}}
    ).limit(5):

        doctor["_id"] = str(doctor["_id"])

        doctors.append({
            "id": doctor["_id"],
            "name": doctor["name"],
            "specialization": doctor["specialization"]
        })

    return doctors

