from datetime import datetime, timedelta

def generate_slots(start_time: str, end_time: str, slot_minutes: int = 15):
    
    slots = []

    start = datetime.strptime(start_time, "%H:%M")
    end = datetime.strptime(end_time, "%H:%M")

    current = start

    while current < end:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=slot_minutes)

    return slots