from app.database import doctor_slots_collection


async def get_available_slots(doctor_id: str, date: str):

    doc = await doctor_slots_collection.find_one({
        "doctor_id": doctor_id,
        "date": date
    })

    if not doc:
        return []

    available = []

    for s in doc["slots"]:
        if not s["booked"]:
            available.append(s["time"])

    return available