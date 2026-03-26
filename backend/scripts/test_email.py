import asyncio
import os
import sys

# Add the backend directory to sys.path so we can import 'app'
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.email_service import EmailService
from app.config import SMTP_USER

async def main():
    print("--- Hospital Email Connection Test ---")
    print(f"Sender Email: {SMTP_USER}")
    
    target = input("\nEnter recipient email address to receive a test message: ").strip()
    if not target:
        print("No email entered. Exiting.")
        return

    print(f"\nSending test appointment confirmation to {target}...")
    success = await EmailService.send_appointment_confirmation(
        to_email=target,
        patient_name="Test Patient",
        doctor_name="Antigravity AI",
        date="2026-03-27",
        time="10:30 AM"
    )

    if success:
        print("\nSUCCESS! Please check your inbox (and spam folder).")
    else:
        print("\nFAILED. Check the backend logs for the specific error.")

if __name__ == "__main__":
    asyncio.run(main())
