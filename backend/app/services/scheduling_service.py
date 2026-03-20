from app.database import db, appointments_collection
import datetime

schedules_collection = db["doctor_schedules"]

def to_minutes(t):
    h, m = map(int, t.split(":"))
    return h * 60 + m

def to_time(m):
    return f"{m//60:02d}:{m%60:02d}"

async def get_available_slots(doctor_id: str, date: str):
    """
    Step 4: Slot Generation Engine (CRITICAL)
    """
    # Check leave (Step 3: Leave System Implementation)
    leave = await db["doctor_leaves"].find_one({
        "doctor_id": doctor_id,
        "date": date
    })
    if leave:
        return []

    # 1. Get schedule
    sched = await schedules_collection.find_one({"doctor_id": doctor_id})
    if not sched:
        return []

    # 2. Check working day
    try:
        day = datetime.datetime.strptime(date, "%Y-%m-%d").strftime("%a")
    except Exception:
        return []

    if day not in sched["working_days"]:
        return []

    # 3. Generate slots
    start = to_minutes(sched["start_time"])
    end = to_minutes(sched["end_time"])
    duration = sched["slot_duration"]

    all_slots = []
    current = start

    while current + duration <= end:
        all_slots.append(to_time(current))
        current += duration

    # 4. Remove booked slots
    booked = []
    cursor = appointments_collection.find({
        "doctor_id": doctor_id,
        "date": date,
        "status": {"$ne": "cancelled"}
    })
    async for appt in cursor:
        booked.append(appt["time"])

    # Returns list of {time, booked} objects as expected by the frontend
    return [{"time": s, "booked": (s in booked)} for s in all_slots]

async def book_slot(doctor_id: str, date: str, time: str):
    """Checks if a slot is available before booking."""
    # 1. Check leave
    leave = await db["doctor_leaves"].find_one({
        "doctor_id": doctor_id,
        "date": date
    })
    if leave:
        return False
        
    # 2. Check existing appointment
    existing = await appointments_collection.find_one({
        "doctor_id": doctor_id,
        "date": date,
        "time": time,
        "status": {"$ne": "cancelled"}
    })
    if existing:
        return False
        
    return True

async def release_slot(doctor_id: str, date: str, time: str):
    """Optional: Release a locked slot (currently no-op as appointments are source of truth)."""
    return True
