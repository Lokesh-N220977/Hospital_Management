from datetime import datetime, timedelta
from app.database import doctor_slots_collection, doctor_schedules_collection
from app.utils.date_utils import get_day_from_date
from app.core.logger import logger

def generate_slots(start_time: str, end_time: str, slot_minutes: int = 15):
    """Utility to generate a list of time slots."""
    slots = []
    start = datetime.strptime(start_time, "%H:%M")
    end = datetime.strptime(end_time, "%H:%M")
    current = start
    while current < end:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=slot_minutes)
    return slots

async def create_daily_slots(doctor_id: str, date: str):
    """Initialize slots for a specific doctor on a specific date."""
    day = get_day_from_date(date)
    schedule = await doctor_schedules_collection.find_one({
        "doctor_id": doctor_id,
        "day": day
    })

    if not schedule:
        logger.warning(f"No schedule found for doctor {doctor_id} on {day}")
        return False

    slots = generate_slots(schedule["start_time"], schedule["end_time"])
    slot_objects = [{"time": s, "booked": False} for s in slots]

    await doctor_slots_collection.update_one(
        {"doctor_id": doctor_id, "date": date},
        {"$set": {"slots": slot_objects}},
        upsert=True
    )
    logger.info(f"Initialized slots for doctor {doctor_id} on {date}")
    return True

async def get_available_slots(doctor_id: str, date: str):
    """Retrieve all unbooked slots for a doctor on a given date."""
    doc = await doctor_slots_collection.find_one({"doctor_id": doctor_id, "date": date})
    if not doc:
        return []
    return [s["time"] for s in doc["slots"] if not s["booked"]]

async def book_slot(doctor_id: str, date: str, time: str):
    """Atomically lock a slot."""
    result = await doctor_slots_collection.update_one(
        {
            "doctor_id": doctor_id,
            "date": date,
            "slots.time": time,
            "slots.booked": False
        },
        {"$set": {"slots.$.booked": True}}
    )
    if result.modified_count > 0:
        logger.info(f"Slot booked: {doctor_id} on {date} at {time}")
        return True
    return False

async def release_slot(doctor_id: str, date: str, time: str):
    """Unlock a previously booked slot."""
    await doctor_slots_collection.update_one(
        {
            "doctor_id": doctor_id,
            "date": date,
            "slots.time": time
        },
        {"$set": {"slots.$.booked": False}}
    )
    logger.info(f"Slot released: {doctor_id} on {date} at {time}")
