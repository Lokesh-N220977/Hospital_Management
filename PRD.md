# Hospital Appointment & Records System

## 1. Project Title
**Hospital Appointment & Records System**

---

## 2. Problem Statement
Hospitals often manage appointments manually or using fragmented systems. This can lead to scheduling conflicts, inefficient patient management, and difficulty tracking visit history.

Patients frequently face issues such as long waiting times, lack of clarity in appointment availability, and difficulty accessing their previous visit information.

This system provides a digital hospital management solution where patients can easily book appointments, doctors can manage their schedules, and administrators can monitor hospital activity through dashboards and analytics.

---

## 3. Objectives

The primary objectives of the system are:

- Provide a digital platform for patients to register and book appointments
- Enable doctors to manage appointments and view patient visit history
- Allow administrators to manage doctors and monitor system activity
- Improve appointment scheduling efficiency
- Provide analytics dashboards for hospital insights
- Enable scalable frontend architecture using React for dynamic functionality
- Support API-driven communication between frontend and backend systems
---

## 4. User Roles

The system supports three main user roles:

### Patient
- Register and create an account (Email & Phone)
- Login to the system (Unified Email/Phone or Google OAuth)
- View available doctors
- Book appointments based on available time slots
- View visit history

---

## 5. Key New Features

### Unified Authentication
- Patients can log in using either their **Email** or **Phone Number** in a single input field.
- The backend automatically detects the identifier type and validates credentials accordingly.

### Google OAuth Integration
- One-click sign-in for Patients.
- Automatic account creation (Auto-Registration) if the user is new.
- Seamless linking between Google accounts and internal Patient records.

### SMS Gateway (Android)
- Real-time OTP (One Time Password) sent via a local Android phone acting as an SMS Gateway.
- Secure phone verification during registration.

---

## 6. Technologies Used

### Frontend
- **React.js (Vite)**: Component-based UI with dynamic routing.
- **TypeScript**: Ensuring type safety across the application.
- **Tailwind CSS**: Modern UI styling.

### Backend
- **FastAPI (Python)**: High-performance asynchronous framework.
- **Motor**: Async MongoDB driver.
- **Jose**: JWT-based secure authentication.
- **Google Auth**: Secure ID token verification.

### Database
- **MongoDB**: NoSQL database for flexible data storage.

---

## 7. System Architecture Overview

1. **Frontend Layer**
   - React components interact with FastAPI endpoints.
   - Session management via JWT stored in LocalStorage.
   - Google OAuth provider wrapping the application.

2. **Backend Layer (API)**
   - Asynchronous FastAPI routes for high concurrency.
   - Service-based architecture (Auth, Appointments, AI, Analytics).
   - Unified login logic detecting Email vs Phone.

3. **Service Layer**
   - **SMS Gateway Service**: Communicates with local Android API.
   - **Google Auth Service**: Verifies ID tokens via Google libraries.
   - **Analytics Service**: Provides real-time hospital insights.

---

## 9. Future Enhancements

Potential improvements to the system include:

- Online prescription management
- SMS or email appointment notifications
- Online payment for appointments
- Telemedicine consultation support
- AI-based appointment optimization

---

## 10. Expected Outcome

The system will provide a functional hospital appointment management prototype where patients can easily book appointments, doctors can manage schedules, and administrators can monitor hospital activity through an analytics dashboard.

This project demonstrates the practical application of web technologies for real-world healthcare workflow management.


# 11. Repository Structure

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