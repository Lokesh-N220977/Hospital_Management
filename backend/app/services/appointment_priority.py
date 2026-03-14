def calculate_priority(patient_age: int, emergency: bool):

    priority = 0

    if emergency:
        priority += 5

    if patient_age >= 60:
        priority += 2

    return priority