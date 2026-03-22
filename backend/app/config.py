from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-12345")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# SMTP Settings
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
# SMS Settings (Local Phone Gateway)
SMS_GATEWAY_URL = os.getenv("SMS_GATEWAY_URL")
SMS_GATEWAY_USER = os.getenv("SMS_GATEWAY_USER", "admin")
SMS_GATEWAY_KEY = os.getenv("SMS_GATEWAY_KEY")

# Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
