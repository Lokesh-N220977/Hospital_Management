# MedicPulse - Advanced Hospital Management System

MedicPulse is a full-stack, state-of-the-art healthcare platform designed with a focus on premium aesthetics, dynamic data visualization, and robust role-based management.

## 🌟 Key Features

- **Role-Based Portals**: Tailored experiences for Patients, Doctors, and System Administrators.
- **Dynamic Analytics**: Live charting of revenue, patient demographics, and departmental load using Recharts.
- **Smart Scheduling**: Conflict-preventing appointment booking system with real-time slot availability.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices with modern glassmorphism and micro-animations.
- **Secure Medical Records**: Structured visit history, prescriptions, and encrypted patient data management.

---

## 🏗️ Project Architecture

The project is divided into two main sections: a modern React frontend and a robust FastAPI backend.

### 🎨 Frontend (`/frontend`)
Built with **React 18 + TypeScript + Vite** for maximum performance and type safety.

- **`src/pages/`**: Organized by user role (Admin, Doctor, Patient, Public).
- **`src/components/layout/`**: Modular layout engine using sidebars and navbars specific to each role.
- **`src/styles/`**: Comprehensive design system with CSS variables, modular stylesheets, and utility classes.
- **`src/services/`**: API abstraction layer for clean communication with the backend.

### ⚙️ Backend (`/backend`)
A high-performance asynchronous API built with **FastAPI (Python)**.

- **`app/routes/`**: Domain-specific API endpoints (Users, Doctors, Appointments, Analytics, etc.).
- **`app/models/`**: Data schemas and persistence logic.
- **`app/services/`**: Business logic layer decoupled from API routing.
- **`app/core/`**: Security (JWT), configuration, and global exceptions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Recharts, Lucide Icons, FontAwesome |
| **Backend** | Python, FastAPI, Pydantic, JWT Authentication |
| **Database** | *Configurable (SQLAlchemy/MongoDB Ready)* |
| **Aesthetics** | Vanilla CSS (Flexbox/Grid), Glassmorphism, Micro-animations |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd medicpulse
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   # Recommend creating a virtual environment
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

---

## 📁 Detailed Directory Structure

```
MedicPulse/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # Layouts & Reusable UI
│   │   ├── pages/            # Role-based views (Admin/Doctor/Patient)
│   │   ├── styles/           # Modern CSS Design System
│   │   └── services/         # API Layer
│   └── vite.config.ts        # Build Configuration
│
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── routes/           # API Controllers
│   │   ├── models/           # Data Structures
│   │   ├── services/         # Logic Helpers
│   │   └── core/             # Auth & Config
│   └── main.py               # Entry Point
│
├── docs/                     # API & Architecture Docs
└── README.md                 # Root Documentation
```

---

## 📄 License
© 2026 MedicPulse. All rights reserved.