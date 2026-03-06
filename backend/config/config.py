import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hospital-secret-key'
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb://localhost:27017/hospital_system'
    DEBUG = True
