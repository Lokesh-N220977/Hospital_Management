import requests

# 1. book an appointment directly
r = requests.post("http://localhost:8000/api/v1/appointments/", json={
    "doctor_id": "60a8f7c9e13d4b1a4c9b1a5a", # we will find a real doctor id instead
    "patient_id": "60a8f7c9e13d4b1a4c9b1a5b", # and real patient
    "date": "2026-03-31",
    "time": "10:00",
    "reason": "Test"
})
print(r.json())
