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

---

## 4. User Roles

The system supports three main user roles:

### Patient
- Register and create an account
- Login to the system
- View available doctors
- Book appointments based on available time slots
- View visit history

### Doctor
- Login to the system
- View scheduled appointments
- Manage working schedule
- Access patient visit history
- Apply for leave on specific days

### Admin
- Register doctors in the system
- Manage doctor profiles
- Approve or reject doctor leave requests
- Cancel appointment slots when doctors are unavailable
- View system analytics dashboards

---

## 5. Appointment Scheduling Logic

- Each doctor has fixed working hours defined by the hospital.
- Within those hours, appointments are divided into time slots based on the average consultation duration per patient.
- Patients can:
  - Select a doctor
  - View available slots
  - Book an appointment.

### Special Cases

- If a doctor applies for leave, the request must be approved by the admin.
- Once approved:
  - The admin can cancel all appointment slots for that doctor on that day.
  - Patients with booked appointments may be notified or rescheduled.

---

## 6. Key Features

### Patient Features
- Patient registration and authentication
- Doctor browsing
- Appointment booking
- Appointment status tracking
- Visit history viewing

### Doctor Features
- Secure doctor login
- Appointment schedule view
- Patient visit history
- Leave request submission

### Admin Features
- Doctor registration and management
- Leave request approval system
- Appointment slot cancellation
- Hospital activity analytics

### Dashboard Features
- Total number of patients
- Total number of doctors
- Number of appointments per day
- Doctor-wise appointment statistics
- Graphical charts for hospital activity

---

## 7. Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python
- Flask

### Database
- MongoDB

### Visualization
- Chart.js (for dashboards and analytics charts)

---

## 8. System Architecture Overview

1. **Frontend Layer**
   - User interface built with HTML, CSS, and JavaScript.
   - Handles patient, doctor, and admin interactions.

2. **Backend Layer**
   - Flask server processes requests.
   - Handles authentication, appointment logic, and API responses.

3. **Database Layer**
   - MongoDB stores:
     - patient records
     - doctor profiles
     - appointment data
     - visit history

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

├── backend
│   ├── app.py
│   ├── config
│   │   ├── config.py
│   │   ├── __init__.py
│   │   └── __pycache__
│   │       ├── config.cpython-310.pyc
│   │       └── __init__.cpython-310.pyc
│   ├── __init__.py
│   ├── models
│   │   ├── appointment_model.py
│   │   ├── doctor_model.py
│   │   ├── __init__.py
│   │   ├── patient_model.py
│   │   └── __pycache__
│   │       ├── doctor_model.cpython-310.pyc
│   │       └── __init__.cpython-310.pyc
│   ├── __pycache__
│   │   └── __init__.cpython-310.pyc
│   ├── routes
│   │   ├── appointment_routes.py
│   │   ├── auth_routes.py
│   │   ├── doctor_routes.py
│   │   ├── __init__.py
│   │   ├── patient_routes.py
│   │   └── __pycache__
│   │       ├── appointment_routes.cpython-310.pyc
│   │       ├── auth_routes.cpython-310.pyc
│   │       ├── doctor_routes.cpython-310.pyc
│   │       ├── __init__.cpython-310.pyc
│   │       └── patient_routes.cpython-310.pyc
│   └── utils
│       ├── helpers.py
│       ├── __init__.py
│       └── __pycache__
│           ├── helpers.cpython-310.pyc
│           └── __init__.cpython-310.pyc
├── database
│   ├── db.py
│   └── __pycache__
│       └── db.cpython-310.pyc
├── frontend
│   ├── components
│   │   ├── navbar.html
│   │   └── sidebar.html
│   ├── css
│   │   └── style.css
│   ├── images
│   │   └── appointment-banner.jpg
│   ├── js
│   │   ├── main.js
│   │   └── script.js
│   └── pages
│       ├── admin_dashboard.html
│       ├── analytics.html
│       ├── appointment.html
│       ├── doctors.html
│       ├── login.html
│       ├── my_appointments.html
│       ├── patient_dashboard.html
│       ├── profile.html
│       ├── register.html
│       └── visit_history.html
├── index.html
├── PRD.md
└── README.md
