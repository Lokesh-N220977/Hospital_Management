import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio
from app.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
from app.core.logger import logger

class EmailService:
    """
    Dedicated service for sending professional HTML emails.
    Uses SMTP settings from configuration.
    """
    
    @staticmethod
    async def send_email(to_email: str, subject: str, html_content: str):
        """Sends an HTML email using SMTP settings."""
        if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS]):
            logger.warning("Email credentials not fully configured in .env. Skipping email.")
            return False

        if not to_email:
            return False

        # Run blocking SMTP calls in a separate thread to keep FastAPI responsive
        def _send():
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"Hospital Management <{SMTP_USER}>"
                msg["To"] = to_email

                part = MIMEText(html_content, "html")
                msg.attach(part)

                with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                    # Upgrade to secure connection
                    server.starttls()
                    server.login(SMTP_USER, SMTP_PASS)
                    server.sendmail(SMTP_USER, to_email, msg.as_string())
                return True
            except Exception as e:
                logger.error(f"Failed to send email to {to_email}: {e}")
                return False

        return await asyncio.to_thread(_send)

    @staticmethod
    async def send_appointment_confirmation(to_email: str, patient_name: str, doctor_name: str, date: str, time: str):
        """Patient confirmation email."""
        html = f"""
        <html>
            <body style="font-family: Segoe UI, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; padding: 20px;">
                <div style="max-width: 600px; margin: auto; padding: 25px; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; border-top: 6px solid #4f46e5;">
                    <h2 style="color: #4f46e5; margin-bottom: 20px;">Appointment Confirmed!</h2>
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    <p>Your appointment has been successfully scheduled. Here are the details for your visit:</p>
                    
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. {doctor_name}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> {date}</p>
                        <p style="margin: 5px 0;"><strong>Time:</strong> {time}</p>
                    </div>

                    <p><strong>Location:</strong> Hospital Main Campus, Reception Floor.</p>
                    <p style="color: #4b5563; font-size: 14px;">Please arrive 10-15 minutes prior to your scheduled time. If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 25px 0;">
                    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Thank you for trusting MedicPulse.<br>This is an automated system email.</p>
                </div>
            </body>
        </html>
        """
        return await EmailService.send_email(to_email, f"Appointment Confirmed - Dr. {doctor_name}", html)

    @staticmethod
    async def send_appointment_reminder(to_email: str, patient_name: str, doctor_name: str, time: str):
        """Automated reminder email."""
        html = f"""
        <html>
            <body style="font-family: Segoe UI, Arial, sans-serif; padding: 20px; background-color: #fdfdfd;">
                <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-top: 6px solid #f59e0b; background: white;">
                    <h2 style="color: #f59e0b;">Appointment Reminder</h2>
                    <p>Hi <strong>{patient_name}</strong>,</p>
                    <p>This is a friendly reminder of your appointment with <strong>Dr. {doctor_name}</strong> today at <strong>{time}</strong>.</p>
                    <p>We look forward to seeing you soon.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777; text-align: center;">Team MedicPulse</p>
                </div>
            </body>
        </html>
        """
        return await EmailService.send_email(to_email, f"Reminder: Appointment Today at {time}", html)

    @staticmethod
    async def send_appointment_cancellation(to_email: str, patient_name: str, doctor_name: str, date: str):
        """Cancellation alert email."""
        html = f"""
        <html>
            <body style="font-family: Segoe UI, Arial, sans-serif; padding: 20px;">
                <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-top: 6px solid #ef4444; background: white;">
                    <h2 style="color: #ef4444;">Appointment Cancelled</h2>
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    <p>Unfortunately, your appointment with <strong>Dr. {doctor_name}</strong> on <strong>{date}</strong> has been cancelled.</p>
                    <p>We apologize for any inconvenience caused. You can log in to our portal to book a new slot.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">We apologize for the inconvenience.<br>MedicPulse Management</p>
                </div>
            </body>
        </html>
        """
        return await EmailService.send_email(to_email, "Appointment Cancellation Notice", html)

    @staticmethod
    async def send_prescription_notification(to_email: str, patient_name: str, doctor_name: str):
        """Notification for a new prescription issued."""
        html = f"""
        <html>
            <body style="font-family: Segoe UI, Arial, sans-serif; padding: 20px;">
                <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-top: 6px solid #10b981; background: white;">
                    <h2 style="color: #10b981;">New Prescription Issued</h2>
                    <p>Hello <strong>{patient_name}</strong>,</p>
                    <p>Dr. <strong>{doctor_name}</strong> has just issued a new digital prescription for you.</p>
                    <p>You can view and download it immediately by logging into your patient dashboard.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777; text-align: center;">Team MedicPulse</p>
                </div>
            </body>
        </html>
        """
        return await EmailService.send_email(to_email, f"New Prescription from Dr. {doctor_name}", html)
