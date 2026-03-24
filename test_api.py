import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def test_slots():
    print("Fetching doctors...")
    try:
        resp = requests.get(f"{BASE_URL}/doctors/")
        doctors = resp.json()
        if not doctors:
            print("No doctors found.")
            return
        
        doc = doctors[0]
        doc_id = doc["_id"]
        print(f"Testing slots for Doctor: {doc.get('name')} ({doc_id})")
        
        # Test for today
        date = datetime.now().strftime("%Y-%m-%d")
        print(f"Testing for date: {date}")
        
        slots_resp = requests.get(f"{BASE_URL}/slots", params={"doctor_id": doc_id, "date": date})
        print(f"Response status: {slots_resp.status_code}")
        print(f"Response data: {json.dumps(slots_resp.json(), indent=2)}")
        
        # Also check schedule
        sched_resp = requests.get(f"{BASE_URL}/doctor/schedule/{doc_id}")
        print(f"Schedule status: {sched_resp.status_code}")
        print(f"Schedule data: {json.dumps(sched_resp.json(), indent=2)}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_slots()
