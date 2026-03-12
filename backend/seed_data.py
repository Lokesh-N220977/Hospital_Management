"""
MedicPulse - Comprehensive MongoDB Seed Script
Generates: 1 Admin, 15 Doctors, 50 Patients, ~200 Appointments
Target DB: health_appointment (MongoDB Atlas)

LOGIN CREDENTIALS
=================
ADMIN:
  Email:    admin@medicpulse.com
  Password: Admin@123

DOCTORS (all use password: Doctor@123)
  dr.james.carter@medicpulse.com   - Cardiology
  dr.sarah.mitchell@medicpulse.com - Neurology
  dr.robert.patel@medicpulse.com   - Orthopedics
  dr.emily.chen@medicpulse.com     - Pediatrics
  dr.david.nguyen@medicpulse.com   - Dermatology
  dr.priya.sharma@medicpulse.com   - Gynecology
  dr.michael.brown@medicpulse.com  - General Medicine
  dr.lisa.wong@medicpulse.com      - Ophthalmology
  dr.kevin.taylor@medicpulse.com   - ENT
  dr.angela.scott@medicpulse.com   - Psychiatry
  dr.mark.johnson@medicpulse.com   - Radiology
  dr.nina.gupta@medicpulse.com     - Gastroenterology
  dr.thomas.lee@medicpulse.com     - Urology
  dr.rachel.adams@medicpulse.com   - Endocrinology
  dr.carlos.rivera@medicpulse.com  - Oncology

PATIENTS (sample - all use password: Patient@123)
  patient001@email.com  through   patient050@email.com
"""

import asyncio
import random
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# ─────────────────────────────────────────────
# Data pools
# ─────────────────────────────────────────────

DEPARTMENTS = [
    "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
    "Dermatology", "Gynecology", "General Medicine", "Ophthalmology",
    "ENT", "Psychiatry", "Radiology", "Gastroenterology",
    "Urology", "Endocrinology", "Oncology"
]

TIME_SLOTS = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM",
    "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
    "04:30 PM", "05:00 PM"
]

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
GENDERS = ["Male", "Female"]

FIRST_NAMES_M = [
    "Aarav", "Arjun", "Dev", "Karan", "Rohit", "Suresh", "Vikram",
    "Nikhil", "Aditya", "Yash", "Rahul", "Sanjay", "Deepak", "Manish",
    "Praveen", "Rajesh", "Tushar", "Gaurav", "Harsh", "Varun",
    "Ankit", "Vivek", "Ravi", "Akash", "Neel", "Ajay", "Piyush"
]
FIRST_NAMES_F = [
    "Priya", "Ananya", "Sneha", "Kavya", "Divya", "Sunita", "Meena",
    "Lakshmi", "Pooja", "Ritu", "Sweta", "Geeta", "Nisha", "Asha",
    "Sonia", "Anjali", "Neha", "Rima", "Tina", "Poonam",
    "Shalini", "Savita", "Jyoti", "Rekha", "Usha", "Archana"
]
LAST_NAMES = [
    "Sharma", "Patel", "Gupta", "Kumar", "Singh", "Rao", "Shah",
    "Mehta", "Joshi", "Verma", "Nair", "Iyer", "Reddy", "Pillai",
    "Bose", "Das", "Chatterjee", "Mishra", "Tiwari", "Pandey",
    "Yadav", "Malhotra", "Kapoor", "Khanna", "Chopra", "Bhatia"
]

CITIES = [
    "Mumbai, Maharashtra", "Delhi, Delhi", "Bangalore, Karnataka",
    "Hyderabad, Telangana", "Chennai, Tamil Nadu", "Pune, Maharashtra",
    "Kolkata, West Bengal", "Ahmedabad, Gujarat", "Jaipur, Rajasthan",
    "Surat, Gujarat", "Lucknow, Uttar Pradesh", "Kanpur, Uttar Pradesh"
]

APPOINTMENT_STATUSES = [
    ("completed", 0.40),
    ("pending",   0.30),
    ("confirmed", 0.20),
    ("cancelled", 0.10),
]

def weighted_status():
    statuses, weights = zip(*APPOINTMENT_STATUSES)
    return random.choices(statuses, weights=weights, k=1)[0]

def random_date(start_days_ago=180, end_days_ahead=60):
    delta = random.randint(-start_days_ago, end_days_ahead)
    return (datetime.now() + timedelta(days=delta)).strftime("%Y-%m-%d")

def random_dob():
    year = random.randint(1960, 2000)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    return f"{year:04d}-{month:02d}-{day:02d}"

def random_phone():
    return f"+91 {random.randint(70000,99999):05d} {random.randint(10000,99999):05d}"


# ─────────────────────────────────────────────
# Doctor definitions
# ─────────────────────────────────────────────

DOCTORS_DATA = [
    {
        "name": "Dr. James Carter",
        "email": "dr.james.carter@medicpulse.com",
        "phone": "+91 98001 00001",
        "specialization": "Cardiology",
        "experience": 14,
        "available_days": ["Monday", "Tuesday", "Wednesday", "Friday"],
        "operating_hours": "09:00 AM - 05:00 PM",
        "fee": 800,
        "rating": 4.8,
        "photo_url": "https://ui-avatars.com/api/?name=James+Carter&background=0D8ABC&color=fff"
    },
    {
        "name": "Dr. Sarah Mitchell",
        "email": "dr.sarah.mitchell@medicpulse.com",
        "phone": "+91 98001 00002",
        "specialization": "Neurology",
        "experience": 11,
        "available_days": ["Monday", "Wednesday", "Thursday"],
        "operating_hours": "10:00 AM - 06:00 PM",
        "fee": 900,
        "rating": 4.7,
        "photo_url": "https://ui-avatars.com/api/?name=Sarah+Mitchell&background=E8A838&color=fff"
    },
    {
        "name": "Dr. Robert Patel",
        "email": "dr.robert.patel@medicpulse.com",
        "phone": "+91 98001 00003",
        "specialization": "Orthopedics",
        "experience": 18,
        "available_days": ["Tuesday", "Thursday", "Friday"],
        "operating_hours": "08:00 AM - 04:00 PM",
        "fee": 700,
        "rating": 4.9,
        "photo_url": "https://ui-avatars.com/api/?name=Robert+Patel&background=27AE60&color=fff"
    },
    {
        "name": "Dr. Emily Chen",
        "email": "dr.emily.chen@medicpulse.com",
        "phone": "+91 98001 00004",
        "specialization": "Pediatrics",
        "experience": 9,
        "available_days": ["Monday", "Tuesday", "Thursday", "Saturday"],
        "operating_hours": "09:00 AM - 05:00 PM",
        "fee": 600,
        "rating": 4.9,
        "photo_url": "https://ui-avatars.com/api/?name=Emily+Chen&background=8E44AD&color=fff"
    },
    {
        "name": "Dr. David Nguyen",
        "email": "dr.david.nguyen@medicpulse.com",
        "phone": "+91 98001 00005",
        "specialization": "Dermatology",
        "experience": 12,
        "available_days": ["Wednesday", "Friday", "Saturday"],
        "operating_hours": "10:00 AM - 06:00 PM",
        "fee": 750,
        "rating": 4.6,
        "photo_url": "https://ui-avatars.com/api/?name=David+Nguyen&background=E74C3C&color=fff"
    },
    {
        "name": "Dr. Priya Sharma",
        "email": "dr.priya.sharma@medicpulse.com",
        "phone": "+91 98001 00006",
        "specialization": "Gynecology",
        "experience": 15,
        "available_days": ["Monday", "Wednesday", "Friday"],
        "operating_hours": "09:00 AM - 05:00 PM",
        "fee": 850,
        "rating": 4.8,
        "photo_url": "https://ui-avatars.com/api/?name=Priya+Sharma&background=E91E63&color=fff"
    },
    {
        "name": "Dr. Michael Brown",
        "email": "dr.michael.brown@medicpulse.com",
        "phone": "+91 98001 00007",
        "specialization": "General Medicine",
        "experience": 20,
        "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "operating_hours": "08:00 AM - 04:00 PM",
        "fee": 500,
        "rating": 4.7,
        "photo_url": "https://ui-avatars.com/api/?name=Michael+Brown&background=1565C0&color=fff"
    },
    {
        "name": "Dr. Lisa Wong",
        "email": "dr.lisa.wong@medicpulse.com",
        "phone": "+91 98001 00008",
        "specialization": "Ophthalmology",
        "experience": 10,
        "available_days": ["Tuesday", "Thursday", "Saturday"],
        "operating_hours": "10:00 AM - 05:00 PM",
        "fee": 650,
        "rating": 4.5,
        "photo_url": "https://ui-avatars.com/api/?name=Lisa+Wong&background=00897B&color=fff"
    },
    {
        "name": "Dr. Kevin Taylor",
        "email": "dr.kevin.taylor@medicpulse.com",
        "phone": "+91 98001 00009",
        "specialization": "ENT",
        "experience": 8,
        "available_days": ["Monday", "Wednesday", "Friday"],
        "operating_hours": "09:30 AM - 05:30 PM",
        "fee": 600,
        "rating": 4.6,
        "photo_url": "https://ui-avatars.com/api/?name=Kevin+Taylor&background=F57C00&color=fff"
    },
    {
        "name": "Dr. Angela Scott",
        "email": "dr.angela.scott@medicpulse.com",
        "phone": "+91 98001 00010",
        "specialization": "Psychiatry",
        "experience": 13,
        "available_days": ["Tuesday", "Thursday"],
        "operating_hours": "11:00 AM - 07:00 PM",
        "fee": 1000,
        "rating": 4.8,
        "photo_url": "https://ui-avatars.com/api/?name=Angela+Scott&background=6A1B9A&color=fff"
    },
    {
        "name": "Dr. Mark Johnson",
        "email": "dr.mark.johnson@medicpulse.com",
        "phone": "+91 98001 00011",
        "specialization": "Radiology",
        "experience": 16,
        "available_days": ["Monday", "Tuesday", "Thursday", "Friday"],
        "operating_hours": "08:00 AM - 04:00 PM",
        "fee": 900,
        "rating": 4.7,
        "photo_url": "https://ui-avatars.com/api/?name=Mark+Johnson&background=37474F&color=fff"
    },
    {
        "name": "Dr. Nina Gupta",
        "email": "dr.nina.gupta@medicpulse.com",
        "phone": "+91 98001 00012",
        "specialization": "Gastroenterology",
        "experience": 11,
        "available_days": ["Wednesday", "Thursday", "Saturday"],
        "operating_hours": "09:00 AM - 05:00 PM",
        "fee": 800,
        "rating": 4.6,
        "photo_url": "https://ui-avatars.com/api/?name=Nina+Gupta&background=2E7D32&color=fff"
    },
    {
        "name": "Dr. Thomas Lee",
        "email": "dr.thomas.lee@medicpulse.com",
        "phone": "+91 98001 00013",
        "specialization": "Urology",
        "experience": 14,
        "available_days": ["Monday", "Wednesday", "Friday"],
        "operating_hours": "09:00 AM - 05:00 PM",
        "fee": 750,
        "rating": 4.5,
        "photo_url": "https://ui-avatars.com/api/?name=Thomas+Lee&background=0277BD&color=fff"
    },
    {
        "name": "Dr. Rachel Adams",
        "email": "dr.rachel.adams@medicpulse.com",
        "phone": "+91 98001 00014",
        "specialization": "Endocrinology",
        "experience": 12,
        "available_days": ["Tuesday", "Thursday", "Saturday"],
        "operating_hours": "10:00 AM - 06:00 PM",
        "fee": 850,
        "rating": 4.7,
        "photo_url": "https://ui-avatars.com/api/?name=Rachel+Adams&background=C62828&color=fff"
    },
    {
        "name": "Dr. Carlos Rivera",
        "email": "dr.carlos.rivera@medicpulse.com",
        "phone": "+91 98001 00015",
        "specialization": "Oncology",
        "experience": 19,
        "available_days": ["Monday", "Tuesday", "Thursday"],
        "operating_hours": "08:00 AM - 04:00 PM",
        "fee": 1200,
        "rating": 4.9,
        "photo_url": "https://ui-avatars.com/api/?name=Carlos+Rivera&background=4E342E&color=fff"
    },
]


async def seed():
    print("\n🌱 MedicPulse - MongoDB Seed Script")
    print("=" * 50)

    client = AsyncIOMotorClient(MONGO_URL, tlsAllowInvalidCertificates=True)
    db = client.health_appointment

    # ── Clear existing data ──
    print("\n🗑  Clearing old collections...")
    await db.users.drop()
    await db.doctors.drop()
    await db.appointments.drop()
    print("   ✅ Old data cleared.")

    # ─────────────────────────────────────────
    # 1. Admin user
    # ─────────────────────────────────────────
    print("\n👤 Seeding Admin...")
    admin = {
        "name": "System Administrator",
        "email": "admin@medicpulse.com",
        "password": hash_password("Admin@123"),
        "phone": "+91 00000 00000",
        "role": "admin",
        "gender": "Male",
        "dob": "1985-01-01",
        "address": "MedicPulse HQ, Bangalore, Karnataka",
        "bloodGroup": "O+",
        "emergencyContact": "+91 00000 00001"
    }
    await db.users.insert_one(admin)
    print("   ✅ Admin inserted: admin@medicpulse.com / Admin@123")

    # ─────────────────────────────────────────
    # 2. Doctors (in 'doctors' collection + 'users' for login)
    # ─────────────────────────────────────────
    print("\n🩺 Seeding 15 Doctors...")
    doctor_ids = {}
    doctor_password_hash = hash_password("Doctor@123")

    for doc_data in DOCTORS_DATA:
        # Insert into doctors collection (for listing/booking)
        doctor_doc = {**doc_data, "password": doctor_password_hash, "role": "doctor"}
        result = await db.doctors.insert_one(doctor_doc)
        doctor_id = result.inserted_id
        doctor_ids[doc_data["email"]] = doctor_id

        # Insert into users collection (for login)
        user_doc = {
            "name": doc_data["name"],
            "email": doc_data["email"],
            "password": doctor_password_hash,
            "phone": doc_data["phone"],
            "role": "doctor",
            "specialization": doc_data["specialization"],
            "doctor_id": str(doctor_id),
            "gender": "Male" if doc_data["name"].split()[1] in ["James","Robert","David","Michael","Kevin","Mark","Thomas","Carlos"] else "Female",
            "dob": random_dob(),
            "address": random.choice(CITIES),
            "bloodGroup": random.choice(BLOOD_GROUPS),
            "emergencyContact": random_phone()
        }
        await db.users.insert_one(user_doc)
        print(f"   ✅ {doc_data['name']} ({doc_data['specialization']}) - {doc_data['email']}")

    # ─────────────────────────────────────────
    # 3. Patients (50)
    # ─────────────────────────────────────────
    print("\n🧑‍⚕️ Seeding 50 Patients...")
    patient_ids = []
    patient_password_hash = hash_password("Patient@123")

    for i in range(1, 51):
        gender = random.choice(GENDERS)
        first_name = random.choice(FIRST_NAMES_M if gender == "Male" else FIRST_NAMES_F)
        last_name = random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"
        email = f"patient{i:03d}@email.com"

        patient = {
            "name": full_name,
            "fullName": full_name,
            "email": email,
            "password": patient_password_hash,
            "phone": random_phone(),
            "role": "patient",
            "gender": gender,
            "dob": random_dob(),
            "bloodGroup": random.choice(BLOOD_GROUPS),
            "address": random.choice(CITIES),
            "emergencyContact": random_phone()
        }
        result = await db.users.insert_one(patient)
        patient_ids.append(result.inserted_id)

    print(f"   ✅ 50 patients inserted: patient001@email.com to patient050@email.com / Patient@123")

    # ─────────────────────────────────────────
    # 4. Appointments (~200)
    # ─────────────────────────────────────────
    print("\n📅 Seeding ~200 Appointments...")
    doctor_list = DOCTORS_DATA  # has email/specialization
    doctor_email_list = list(doctor_ids.keys())
    appointments = []

    for patient_id in patient_ids:
        # Each patient gets 3-5 appointments
        num_appts = random.randint(3, 5)
        for _ in range(num_appts):
            doc_email = random.choice(doctor_email_list)
            doc_data = next(d for d in DOCTORS_DATA if d["email"] == doc_email)
            doc_id = doctor_ids[doc_email]

            appt_date = random_date(start_days_ago=180, end_days_ahead=60)
            appt_date_dt = datetime.strptime(appt_date, "%Y-%m-%d")
            # Determine status based on date
            if appt_date_dt.date() < datetime.now().date():
                status = random.choices(["completed", "cancelled"], weights=[0.85, 0.15])[0]
            else:
                status = random.choices(["confirmed", "pending"], weights=[0.60, 0.40])[0]

            appointment = {
                "user_id": str(patient_id),
                "doctor_id": str(doc_id),
                "doctor_name": doc_data["name"],
                "department": doc_data["specialization"],
                "appointment_date": appt_date,
                "appointment_time": random.choice(TIME_SLOTS),
                "status": status,
                "fee": doc_data["fee"],
                "notes": random.choice([
                    "Follow-up visit", "Routine check-up", "New consultation",
                    "Lab results review", "Prescription renewal", "Post-surgery follow-up",
                    "Vaccine appointment", "Annual physical exam", ""
                ]),
                "created_at": datetime.now().isoformat()
            }
            appointments.append(appointment)

    await db.appointments.insert_many(appointments)
    print(f"   ✅ {len(appointments)} appointments inserted.")

    # ─────────────────────────────────────────
    # Summary
    # ─────────────────────────────────────────
    total_users = await db.users.count_documents({})
    total_doctors = await db.doctors.count_documents({})
    total_appts = await db.appointments.count_documents({})

    print("\n" + "=" * 50)
    print("✅ SEED COMPLETE!")
    print(f"   Users collection  : {total_users} documents")
    print(f"   Doctors collection: {total_doctors} documents")
    print(f"   Appointments      : {total_appts} documents")
    print("\n📋 LOGIN CREDENTIALS")
    print("=" * 50)
    print("🔴 ADMIN")
    print("   Email    : admin@medicpulse.com")
    print("   Password : Admin@123")
    print("\n🟢 DOCTORS (any of the 15, password same for all)")
    print("   Email    : dr.james.carter@medicpulse.com")
    print("   Password : Doctor@123")
    print("   --")
    print("   Email    : dr.sarah.mitchell@medicpulse.com")
    print("   Password : Doctor@123")
    print("   (etc. for all 15 doctors)")
    print("\n🔵 PATIENTS (any of the 50, password same for all)")
    print("   Email    : patient001@email.com")
    print("   Password : Patient@123")
    print("   --")
    print("   Email    : patient025@email.com")
    print("   Password : Patient@123")
    print("=" * 50)

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
