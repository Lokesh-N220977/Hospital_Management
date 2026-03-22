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
    # 1 & 2. Get schedule and check leave in parallel for performance
    import asyncio
    from app.database import doctor_leaves_collection
    
    leave_task = doctor_leaves_collection.find_one({
        "doctor_id": doctor_id,
        "date": date,
        "status": "approved"
    })
    sched_task = schedules_collection.find_one({"doctor_id": doctor_id})
    
    leave, sched = await asyncio.gather(leave_task, sched_task)
    
    if leave or not sched:
        return []

    # 2. Check working day
    try:
        day = datetime.datetime.strptime(date, "%Y-%m-%d").strftime("%a")
    except Exception:
        return []

    if day not in sched.get("working_days", []):
        return []

    # 3. Generate slots
    start = to_minutes(sched["start_time"])
    end = to_minutes(sched["end_time"])
    duration = sched["slot_duration"]
    
    lunch_start = None
    lunch_end = None
    if sched.get("lunch_start_time") and sched.get("lunch_end_time"):
        lunch_start = to_minutes(sched["lunch_start_time"])
        lunch_end = to_minutes(sched["lunch_end_time"])

    all_slots = []
    current = start

    while current + duration <= end:
        # Check if this slot overlaps with lunch break
        # A slot overlaps if it starts during lunch, OR if its end time falls into lunch (excluding exact boundary)
        is_lunch = False
        if lunch_start is not None and lunch_end is not None:
            if (current >= lunch_start and current < lunch_end) or ((current + duration) > lunch_start and (current + duration) <= lunch_end) or (current <= lunch_start and (current + duration) >= lunch_end):
                is_lunch = True
        
        if not is_lunch:
            all_slots.append(to_time(current))
            
        current += duration

    # 4. Remove booked slots - Perform filtering at DB level for performance & accuracy
    booked = []
    from bson import ObjectId
    import datetime as dt_mod
    
    # Optimize query to use the most efficient index (doctor_id + appointment_date or slot_start)
    day_start = dt_mod.datetime.strptime(date, "%Y-%m-%d")
    day_end = day_start + dt_mod.timedelta(days=1)
    
    cursor = appointments_collection.find({
        "doctor_id": {"$in": [ObjectId(doctor_id), doctor_id]},
        "status": {"$in": ["booked", "completed", "no_show"]},
        "$or": [
            {"appointment_date": date},
            {"slot_start": {"$gte": day_start, "$lt": day_end}}
        ]
    }, {"slot_start": 1, "time": 1}) # Projection for performance
    
    async for appt in cursor:
        if "slot_start" in appt and isinstance(appt["slot_start"], dt_mod.datetime):
            booked.append(appt["slot_start"].strftime("%H:%M"))
        elif "time" in appt:
            booked.append(appt["time"])

    # Returns list of {time, booked} objects as expected by the frontend
    result = []
    
    # Check if the requested date is today
    now = datetime.datetime.now()
    is_today = (date == now.strftime("%Y-%m-%d"))
    current_time_str = now.strftime("%H:%M")
    
    for s in all_slots:
        is_booked = (s in booked)
        if is_today and s < current_time_str:
            is_booked = True # mark past times today as booked
        
        result.append({"time": s, "booked": is_booked})
        
    return result

async def book_slot(doctor_id: str, date: str, time: str):
    """Checks if a slot is available before booking."""
    # 1. Check leave
    leave = await db["doctor_leaves"].find_one({
        "doctor_id": doctor_id,
        "date": date,
        "status": "approved"
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

async def get_schedule(doctor_id: str):
    """Fetch the schedule of a doctor."""
    return await schedules_collection.find_one({"doctor_id": doctor_id})

async def is_doctor_on_leave(doctor_id: str, date: str):
    """Check if the doctor is on leave on a given date."""
    leave = await db["doctor_leaves"].find_one({
        "doctor_id": doctor_id,
        "date": date,
        "status": "approved"
    })
    return bool(leave)
