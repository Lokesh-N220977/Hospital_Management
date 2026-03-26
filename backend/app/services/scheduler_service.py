from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
from app.database import appointments_collection
from app.services.notification_service import NotificationService
from app.core.logger import logger
from zoneinfo import ZoneInfo
import sys

# It's good practice to set timezone, using system default or UTC
scheduler = AsyncIOScheduler(timezone='UTC')

async def check_upcoming_appointments():
    """
    Job that runs periodically to check for upcoming appointments
    and send reminders if they haven't been sent yet.
    """
    try:
        now = datetime.now()
        # Find appointments starting in the next 1-2 hours (or whatever window)
        # Let's say we notify them 2 hours before the appointment
        upcoming_window_start = now + timedelta(hours=1, minutes=45)
        upcoming_window_end = now + timedelta(hours=2, minutes=15)
        
        # We need to find appointments where `slot_start` is within this window
        # and we haven't sent a reminder yet.
        # To strictly avoid duplicate reminders, we should set a flag "reminder_sent" on the appointment 
        # but to keep it simple, we'll check if a reminder notification already exists or just update the DB
        
        appointments = await appointments_collection.find({
            "status": "booked",
            "slot_start": {
                "$gte": upcoming_window_start,
                "$lte": upcoming_window_end
            },
            "reminder_sent": {"$ne": True}
        }).to_list(length=100)
        
        for appt in appointments:
            patient_id_str = str(appt.get("patient_id"))
            
            # Fetch user_id for the patient
            from app.services import patient_service
            patient = await patient_service.get_patient_by_id(patient_id_str)
            if patient:
                user_id_to_notify = str(patient.get("user_id")) if patient.get("user_id") else patient_id_str
                doc_name = appt.get("doctor_name", "your doctor")
                time_str = appt.get("time", "")
                
                await NotificationService.create_notification(
                    user_id_to_notify,
                    "patient",
                    "Appointment Reminder",
                    f"Reminder: You have an upcoming appointment with Dr. {doc_name} at {time_str}. Please arrive 10 minutes early.",
                    "reminder"
                )
                
                # 2. Email Reminder (New)
                patient_email = patient.get("email")
                if patient_email:
                    from app.services.email_service import EmailService
                    await EmailService.send_appointment_reminder(
                        to_email=patient_email,
                        patient_name=patient.get("name", "Valued Patient"),
                        doctor_name=doc_name,
                        time=time_str
                    )
                
                # Mark reminder as sent
                await appointments_collection.update_one(
                    {"_id": appt["_id"]},
                    {"$set": {"reminder_sent": True}}
                )
                
                logger.info(f"Sent reminder for appointment {appt['_id']} to user {user_id_to_notify}")
                
    except Exception as e:
        logger.error(f"Error in scheduled task check_upcoming_appointments: {e}")

def start_scheduler():
    """
    Start the background scheduler
    """
    if not scheduler.running:
        # Run every 10 minutes
        scheduler.add_job(check_upcoming_appointments, 'interval', minutes=10, id="upcoming_appointments_job", replace_existing=True)
        scheduler.start()
        logger.info("Background scheduler started")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Background scheduler stopped")
