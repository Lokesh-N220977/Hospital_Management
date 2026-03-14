from app.database import doctor_slots_collection
from app.services.slot_generator import generate_slots
from app.utils.date_utils import get_day_from_date
from app.database import schedules_collection


async def create_daily_slots(doctor_id: str, date: str):

    day = get_day_from_date(date)

    schedule = await schedules_collection.find_one({
        "doctor_id": doctor_id,
        "day": day
    })

    if not schedule:
        return

    slots = generate_slots(
        schedule["start_time"],
        schedule["end_time"]
    )

    slot_objects = []

    for s in slots:
        slot_objects.append({
            "time": s,
            "booked": False
        })

    await doctor_slots_collection.insert_one({
        "doctor_id": doctor_id,
        "date": date,
        "slots": slot_objects
    })