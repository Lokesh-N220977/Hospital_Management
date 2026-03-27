# MedicPulse: Advanced Hospital Management System

A high-performance, asynchronous healthcare platform designed to simplify clinical workflows, optimize patient scheduling, and provide real-time operational analytics for medical institutions.

---

### 🔥 Core System Capabilities

#### 🧠 Smart Availability Engine (The "Brain")
*   **Static Slot Ticker**: Slots are dynamically calculated in real-time based on physician shifts, break times, and current load. 
*   **Atomic Booking Protection**: Prevents double-booking through high-concurrency checks and **Idempotency Keys**.
*   **Unique Constraint Logic**: Enforces a strict one-visit-per-physician-per-day rule for individual patient profiles to maintain schedule integrity.

#### 🚑 Intelligent Emergency Triage
*   **Symptom-Based Fast-Slotting**: Automatically scans the global physician panel to find the earliest possible arrival slot for urgent patients.
*   **Priority Triage**: Handles high-priority cases (chest pain, breathing difficulty) with instantaneous allocation.

#### 📅 Comprehensive Leave & Recommendation System
*   **Seamless Redirection**: If a physician is on approved leave, the system intelligently recommends **other specialists from the same department** to ensure continuity of care.
*   **Smart Alerts**: Patients receive proactive notifications if their preferred date conflicts with a physician's availability.

#### 🏥 Operations & Admin Control
*   **PDF Prescriptions**: Integrated **ReportLab** module for generating professional, printable digital prescriptions with medical charting.
*   **RBAC (Role Based Access Control)**: Tiered security for Patients, Doctors, and Administrators with JWT-secured endpoints.
*   **Historical Precision**: Logically suspends deleted accounts while preserving all historical medical data for analytics and reporting.

---

### 🛠️ Technology Stack

*   **Frontend**: React 19 (Vite), TypeScript, Axios, Lucide UI, Recharts.
*   **Backend**: Python 3.12, FastAPI (Asynchronous Framework), Uvicorn.
*   **Database**: MongoDB (NoSQL), Motor (Async Driver).
*   **Services**: APScheduler (Background Jobs), python-jose (JWT), Passlib (Bcrypt).
*   **Documents**: ReportLab (PDF Generation).

---

### 🏎️ Installation & Setup (For Review)

#### 1. Global Pre-requisites
*   **MongoDB Server**: Ensure `mongod` is running on `localhost:27017`.
*   **Database Name**: The system defaults to `hospital_db` (configurable in `.env`).

#### 2. Backend Initialization
```bash
cd backend
# 1. Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
# 2. Install production-pinned dependencies
pip install -r requirements.txt
# 3. Launch API Server
uvicorn app.main:app --reload
```

#### 3. Frontend Initialization
```bash
cd frontend
# 1. Install Node packages
npm install
# 2. Start Development Client
npm run dev
```

---

### 📖 API Documentation & Review
The system uses **Standardized JSON Responses** across all endpoints.
*   **Interactive Swagger UI**: Accessible at [http://localhost:8000/docs](http://localhost:8000/docs) during development.
*   **Re-Docs**: Alternative documentation at [http://localhost:8000/redoc](http://localhost:8000/redoc).

---
**MedicPulse Hospital 🩺** | *Built for Precision. Scaled for Care.*
