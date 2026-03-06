# MedicPulse Hospital Appointment Management System

A professional, modern, and minimal medical dashboard interface built with HTML and CSS.

## Features
- **Login Page**: Role-based access simulation (Patient/Admin).
- **Patient Dashboard**: Overview of upcoming appointments and medical notifications.
- **Admin Dashboard**: Real-time hospital statistics and activity tracking.
- **Appointment Booking**: Clean form for scheduling visits with time slot selection.
- **Visit History**: Tabular view of past medical records.
- **Analytics**: Data visualization placeholders for hospital performance.

## Design System
- **Primary Color**: #1E88E5 (Professional Blue)
- **Background**: #FFFFFF / #E3F2FD (Clean & Light)
- **Typography**: Poppins (Modern Sans-Serif)
- **Components**: Rounded corners, soft shadows, and responsive sidebar navigation.

## Project Structure
```
hospital_project
│
├── frontend
│   ├── css
│   ├── js
│   ├── components
│   └── pages
│
├── backend
│   ├── app.py           # Application Entry points
│   ├── config/          # Configurations
│   ├── routes/          # API Blueprints
│   ├── models/          # Schema definitions
│   └── utils/           # Shared helpers
│
├── database
│   └── db.py            # MongoDB connection
│
├── README.md
└── .gitignore
```

## Backend API Endpoints
- **Status**: `GET /`
- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Patients**: `GET /api/patients`, `POST /api/patients`
- **Doctors**: `GET /api/doctors`
- **Appointments**: `POST /api/appointments`, `GET /api/appointments`

## How to Run
1. **Frontend**: Simply open `index.html` in your web browser.
2. **Backend**: 
   - Ensure Python 3.x is installed.
   - Install dependencies: `pip install flask flask-cors pymongo`
   - Run: `python backend/app.py`