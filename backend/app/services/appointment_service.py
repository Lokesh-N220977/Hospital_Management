from fastapi import HTTPException
from app.database import appointments_collection, patients_collection
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from datetime import datetime, timedelta
from app.services import scheduling_service, doctor_service, patient_service
from app.services.notification_service import NotificationService
from app.models.notification_model import NotificationType
from app.core.logger import logger

# Strict state machine
ALLOWED_TRANSITIONS = {
    "booked": ["cancelled", "completed", "no_show"],
    "cancelled": [],
    "completed": [],
    "no_show": []
}

async def book_appointment(appointment_data: dict):
    # Format dates
    doctor_id_str = appointment_data["doctor_id"]
    patient_id_str = appointment_data["patient_id"]
    date_str = appointment_data["date"]
    time_str = appointment_data["time"]
    
    appt_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    now = datetime.now()
    today_date = now.strftime("%Y-%m-%d")
    
    # Validation: Past date or time
    if date_str < today_date:
        raise HTTPException(status_code=400, detail="Invalid date: Cannot book in past dates")
    
    if appt_dt < now:
        raise HTTPException(status_code=400, detail="Cannot book appointments in the past time")
    
    # Parallelize initial fetches for performance
    import asyncio
    
    # Run independent validation checks in parallel
    doctor_task = doctor_service.get_doctor_by_id(doctor_id_str)
    patient_task = patient_service.get_patient_by_id(patient_id_str)
    schedule_task = scheduling_service.get_schedule(doctor_id_str)
    leave_task = scheduling_service.is_doctor_on_leave(doctor_id_str, date_str)
    
    doc, patient, sched, on_leave = await asyncio.gather(
        doctor_task, patient_task, schedule_task, leave_task
    )
    
    if not doc:
        raise HTTPException(status_code=400, detail="Doctor not found")
    if not doc.get("is_active", True) or doc.get("is_deleted", False):
        raise HTTPException(status_code=400, detail="Doctor is not active or deleted")
    
    if doc.get("verification_status") != "VERIFIED":
        raise HTTPException(status_code=400, detail="Doctor not available for booking (Verification Pending/Rejected)")
        
    if not patient:
        raise HTTPException(status_code=400, detail="Patient profile not found")
    if not patient.get("is_active", True) or patient.get("is_deleted", False):
        raise HTTPException(status_code=400, detail="Patient profile is not active or deleted")

    if on_leave:
        raise HTTPException(status_code=400, detail="Doctor is on leave for that date")

    duration = sched.get("slot_duration", 30) if sched else 30
    slot_end = appt_dt + timedelta(minutes=duration)

    # Atomic Check & Lock - Must match the unique index precisely
    existing = await appointments_collection.find_one({
        "doctor_id": {"$in": [ObjectId(doctor_id_str), doctor_id_str]},
        "slot_start": appt_dt,
        "status": {"$in": ["booked", "completed", "no_show"]} 
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="This slot is no longer available.")

    new_appt = {
        "status": "booked",
        "patient_id": ObjectId(patient_id_str),
        "doctor_id": ObjectId(doctor_id_str),
        "date": date_str,
        "appointment_date": date_str,
        "slot_time": time_str,
        "slot_start": appt_dt,
        "slot_end": slot_end,
        "is_active": True,
        "is_deleted": False,
        "created_at": now,
        "updated_at": now,
        "doctor_name": doc["name"],
        "specialization": doc.get("specialization", ""),
        "patient_name": patient["name"],
        "patient_phone": patient.get("phone", ""),
        "reason": appointment_data.get("reason", "")
    }

    try:
        result = await appointments_collection.insert_one(new_appt)
        logger.info(f"Appointment created: {result.inserted_id}")
        
        # Move notifications to background tasks to speed up response
        async def send_notifications():
            try:
                # 1. Patient Dashboard Notification
                user_id_to_notify = await NotificationService.get_recipient_id(patient_id_str)
                await NotificationService.create_notification(
                    user_id_to_notify, "patient", "Appointment Confirmed",
                    f"Your appointment with Dr. {doc.get('name')} is confirmed for {date_str} at {time_str}.",
                    "appointment_booked"
                )
                
                # 2. Email Notification (New)
                patient_email = patient.get("email")
                if patient_email:
                    from app.services.email_service import EmailService
                    await EmailService.send_appointment_confirmation(
                        to_email=patient_email,
                        patient_name=patient.get("name", "Valued Patient"),
                        doctor_name=doc.get('name', 'Doctor'),
                        date=date_str,
                        time=time_str
                    )

                # 3. Doctor Dashboard Notification
                doctor_user_id = doc.get("user_id")
                if doctor_user_id:
                    await NotificationService.create_notification(
                        str(doctor_user_id), "doctor", "New Appointment",
                        f"New patient booking: {patient.get('name')} for {date_str} at {time_str}.",
                        "new_appointment"
                    )
            except Exception as e:
                logger.error(f"Background notification failed: {e}")

        asyncio.create_task(send_notifications())
        
        return str(result.inserted_id)
    except DuplicateKeyError as e:
        logger.error(f"Duplicate booking: {e}")
        raise HTTPException(status_code=400, detail="Slot already booked (duplicate lock)")
    except Exception as e:
        logger.error(f"Booking insertion failed: {e}")
        raise HTTPException(status_code=500, detail="Could not finalize booking")


async def cancel_appointment(appointment_id: str, cancel_reason: str = "Cancelled by user", cancelled_by: str = "patient"):
    appt = await appointments_collection.find_one({"_id": ObjectId(appointment_id)})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    current_status = appt.get("status", "booked")
    
    if "cancelled" not in ALLOWED_TRANSITIONS.get(current_status, []):
        raise HTTPException(status_code=400, detail=f"Cannot transition from {current_status} to cancelled")
    
    # Cannot cancel past
    if appt.get("slot_start") and appt["slot_start"] < datetime.now():
        raise HTTPException(status_code=400, detail="Cannot cancel past appointments")

    await appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {
            "status": "cancelled",
            "cancelled_by": cancelled_by,
            "cancel_reason": cancel_reason,
            "is_active": False,
            "updated_at": datetime.now()
        }}
    )
    
    # Notify patient
    patient_id_str = str(appt.get("patient_id"))
    patient = await patient_service.get_patient_by_id(patient_id_str)
    doc_name = appt.get("doctor_name", "your doctor")
    appt_date = appt.get("appointment_date", appt.get("date", ""))
    
    if patient:
        user_id_to_notify = await NotificationService.get_recipient_id(patient_id_str)
        await NotificationService.create_notification(
            user_id_to_notify,
            "patient",
            "Appointment Cancelled",
            f"Your appointment with Dr. {doc_name} on {appt_date} has been cancelled. Reason: {cancel_reason}.",
            "appointment_cancelled"
        )
        
        # Email notification (New)
        if patient.get("email"):
            from app.services.email_service import EmailService
            import asyncio
            asyncio.create_task(EmailService.send_appointment_cancellation(
                to_email=patient["email"],
                patient_name=patient.get("name", "Valued Patient"),
                doctor_name=doc_name,
                date=appt_date
            ))
        
    # Notify doctor
    doctor_id_str = str(appt.get("doctor_id"))
    doc = await doctor_service.get_doctor_by_id(doctor_id_str)
    if doc and doc.get("user_id"):
        await NotificationService.create_notification(
            str(doc["user_id"]),
            "doctor",
            "Appointment Cancelled",
            f"The appointment with patient {appt.get('patient_name', 'your patient')} on {appt_date} has been cancelled.",
            "appointment_cancelled"
        )

    return True

async def complete_appointment(appointment_id: str):
    appt = await appointments_collection.find_one({"_id": ObjectId(appointment_id)})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    current_status = str(appt.get("status", "booked")).lower()
    if "completed" not in ALLOWED_TRANSITIONS.get(current_status, []):
        raise HTTPException(status_code=400, detail=f"Cannot transition from {appt.get('status')} to completed")
        
    await appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {
            "status": "completed",
            "updated_at": datetime.now()
        }}
    )
    return True

async def update_appointment_status(appointment_id: str, status: str):
    if status == "cancelled":
        return await cancel_appointment(appointment_id, "Cancelled by doctor", "doctor")
    elif status == "completed":
        return await complete_appointment(appointment_id)
    elif status == "no_show":
        appt = await appointments_collection.find_one({"_id": ObjectId(appointment_id)})
        if not appt: raise HTTPException(status_code=404, detail="Not found")
        
        current_status = str(appt.get("status", "booked")).lower()
        if "no_show" not in ALLOWED_TRANSITIONS.get(current_status, []):
            raise HTTPException(status_code=400, detail=f"Invalid status transition from {appt.get('status')} to no_show")
        
        await appointments_collection.update_one({"_id": ObjectId(appointment_id)}, {"$set": {"status": "no_show", "updated_at": datetime.now()}})
        return True
    
    raise HTTPException(status_code=400, detail=f"Unsupported status update: {status}")

def _map_appt_for_frontend(appt, privacy_map=None):
    if not appt: return appt
    
    # 1. Standard conversions
    for key in ["_id", "doctor_id", "patient_id", "user_id", "doctor_user_id"]:
        if key in appt and appt[key]:
            appt[key] = str(appt[key])
            
    # 2. Map back fields for frontend
    if "appointment_date" in appt:
        appt["date"] = appt["appointment_date"]
    else:
        appt["date"] = appt.get("date", "")
        
    if "slot_start" in appt and isinstance(appt["slot_start"], datetime):
        appt["time"] = appt["slot_start"].strftime("%H:%M")
    elif "slot_time" in appt:
        appt["time"] = appt["slot_time"]
    else:
        appt["time"] = appt.get("time", "")

    # Map symptoms to reason for frontend display
    if "symptoms" in appt and not appt.get("reason"):
        syms = appt["symptoms"]
        appt["reason"] = ", ".join(syms) if isinstance(syms, list) else str(syms)

    # Normalize status for frontend (always lowercase)
    if "status" in appt:
        appt["status"] = str(appt["status"]).lower()

    # Apply privacy mask if requested
    if privacy_map is not None:
        patient_id = str(appt.get("patient_id"))
        # We need to know which user this patient belongs to.
        # For simplicity, we can assume the appointment document might have user_id, 
        # but if not, we rely on the map containing patient_id instead of user_id.
        share = privacy_map.get(patient_id, True)
        if not share:
            if "patient_phone" in appt:
                raw_phone = str(appt["patient_phone"])
                appt["patient_phone"] = "********" + raw_phone[-4:] if len(raw_phone) >= 4 else "********"
            # You can also mask gender if it was in the appt, though it's usually just patient_name/phone

    # 3. Final safety check: Convert ANY remaining ObjectIds in the dict
    for k, v in appt.items():
        if isinstance(v, ObjectId):
            appt[k] = str(v)
            
    return appt

async def get_patient_appointments(patient_id: str):
    appointments = []
    # Both legacy string and ObjectId might exist, but we enforce ObjectId going forward
    async for appt in appointments_collection.find({"patient_id": {"$in": [ObjectId(patient_id), patient_id]}}).sort("slot_start", -1):
        appointments.append(_map_appt_for_frontend(appt))
    return appointments

async def get_user_all_appointments(user_id: str):
    from app.services import patient_service
    patients = await patient_service.get_my_patients(user_id)
    if not patients:
        return []
    patient_ids = [ObjectId(p["_id"]) for p in patients] + [str(p["_id"]) for p in patients]
    
    appointments = []
    # Try to sort by slot_start at DB level. Handle both 'booked' and 'BOOKED'
    async for appt in appointments_collection.find({
        "patient_id": {"$in": patient_ids},
        "status": {"$in": ["booked", "BOOKED", "confirmed", "cancelled", "completed"]} # Broaden search
    }).sort("slot_start", -1):
        appointments.append(_map_appt_for_frontend(appt))
    
    # Secondary sort in Python in case some legacy records don't have slot_start
    appointments.sort(key=lambda x: x.get("slot_start") if isinstance(x.get("slot_start"), datetime) else datetime.min, reverse=True)
    return appointments

async def get_doctor_appointments(doctor_id: str):
    appointments = []
    # 1. Fetch appointments
    async for appt in appointments_collection.find({
        "doctor_id": {"$in": [ObjectId(doctor_id), doctor_id]},
        "status": {"$in": ["booked", "BOOKED", "confirmed", "cancelled", "completed"]}
    }).sort("slot_start", 1):
        appointments.append(appt)

    if not appointments:
        return []

    # 2. Fetch privacy settings for these patients
    patient_ids = [ObjectId(a["patient_id"]) for a in appointments if "patient_id" in a]
    from app.database import patients_collection, patient_settings_collection
    patients_list = await patients_collection.find({"_id": {"$in": patient_ids}}).to_list(length=1000)
    
    user_ids = list(set([str(p["user_id"]) for p in patients_list if p.get("user_id")]))
    settings_list = await patient_settings_collection.find({"user_id": {"$in": user_ids}}).to_list(length=1000)
    
    # Map user_id to setting
    user_privacy = {str(s["user_id"]): s.get("share_personal_details", True) for s in settings_list}
    # Map patient_id to setting
    patient_privacy = {str(p["_id"]): user_privacy.get(str(p.get("user_id")), True) for p in patients_list}

    # 3. Map for frontend with privacy
    return [_map_appt_for_frontend(a, privacy_map=patient_privacy) for a in appointments]

async def get_doctor_patients(doctor_id: str):
    # Find all unique patient IDs for this doctor
    patient_ids = await appointments_collection.distinct(
        "patient_id", 
        {"doctor_id": {"$in": [ObjectId(doctor_id), doctor_id]}}
    )
    
    if not patient_ids:
        return []
        
    # Convert all to ObjectIds for the $in query
    obj_ids = []
    for pid in patient_ids:
        try:
            obj_ids.append(ObjectId(pid))
        except:
            pass
            
    # Fetch all patients in one query
    patients_list = await patients_collection.find({
        "_id": {"$in": obj_ids},
        "is_active": {"$ne": False}
    }).to_list(length=1000)

    # Fetch privacy settings for associated users
    user_ids = list(set([str(p["user_id"]) for p in patients_list if p.get("user_id")]))
    from app.database import patient_settings_collection
    settings_list = await patient_settings_collection.find({"user_id": {"$in": user_ids}}).to_list(length=1000)
    # Map user_id to share_personal_details setting
    privacy_map = {str(s["user_id"]): s.get("share_personal_details", True) for s in settings_list}
    
    return [
        {
            "id": str(p["_id"]),
            "name": p.get("name"),
            "phone": p.get("phone") if privacy_map.get(str(p.get("user_id")), True) else "********" + str(p.get("phone", ""))[-4:],
            "gender": p.get("gender") if privacy_map.get(str(p.get("user_id")), True) else "Hidden"
        } for p in patients_list
    ]

async def get_patient_dashboard(user_id: str):
    patients = await patient_service.get_my_patients(user_id)
    if not patients:
        return {
            "stats": {
                "total": 0,
                "upcoming": 0,
                "cancelled": 0
            },
            "upcoming": [],
            "recent": [],
            "alerts": []
        }
        
    patient_ids = [ObjectId(p["_id"]) for p in patients] + [str(p["_id"]) for p in patients]
    now = datetime.now()
    
    # 1. Total appointments
    total = await appointments_collection.count_documents({"patient_id": {"$in": patient_ids}})
    
    # 2. Upcoming appointments count
    upcoming_count = await appointments_collection.count_documents({
        "patient_id": {"$in": patient_ids},
        "status": "booked",
        "slot_start": {"$gte": now}
    })
    
    # 3. Cancelled appointments count
    cancelled_count = await appointments_collection.count_documents({
        "patient_id": {"$in": patient_ids},
        "status": "cancelled"
    })
    
    # 4. Fetch actual upcoming appointments for the list (next 5)
    upcoming_docs = await appointments_collection.find({
        "patient_id": {"$in": patient_ids},
        "status": "booked",
        "slot_start": {"$gte": now}
    }).sort("slot_start", 1).to_list(length=5)
    
    # 5. Fetch recent activity (last 5 - either cancelled, completed or past booked)
    recent_docs = await appointments_collection.find({
        "patient_id": {"$in": patient_ids},
        "$or": [
            {"status": {"$in": ["cancelled", "completed"]}},
            {"status": "booked", "slot_start": {"$lt": now}}
        ]
    }).sort("slot_start", -1).to_list(length=5)

    # 6. Fetch "Alerts" - e.g. appointments cancelled by doctor that haven't been dismissed
    # For now, simplistic approach: last 7 days doctor cancellations
    seven_days_ago = now - timedelta(days=7)
    alert_docs = await appointments_collection.find({
        "patient_id": {"$in": patient_ids},
        "status": "cancelled",
        "cancelled_by": "doctor",
        "updated_at": {"$gte": seven_days_ago}
    }).to_list(length=3)
    
    return {
        "stats": {
            "total": total,
            "upcoming": upcoming_count,
            "cancelled": cancelled_count
        },
        "upcoming": [_map_appt_for_frontend(a) for a in upcoming_docs],
        "recent": [_map_appt_for_frontend(a) for a in recent_docs],
        "alerts": [_map_appt_for_frontend(a) for a in alert_docs]
    }
