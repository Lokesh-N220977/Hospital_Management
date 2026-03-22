# MedicPulse - Detailed Setup Guide

This guide provides step-by-step instructions to get the **MedicPulse** Hospital Management System running on your local machine.

---

## 1. Backend Setup (FastAPI)

The backend is built with FastAPI and requires Python 3.10+.

### Step-by-Step:
1.  **Navigate to Backend**:
    ```bash
    cd backend
    ```
2.  **Create a Virtual Environment**:
    ```bash
    python -m venv venv
    ```
3.  **Activate Virtual Environment**:
    *   **Windows**: `.\venv\Scripts\activate`
    *   **Mac/Linux**: `source venv/bin/activate`
4.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
5.  **Configure Environment**:
    *   Create a `.env` file (copy from `.env.example`).
    *   Ensure your `MONGO_URI` is correct.
    *   Add your `GOOGLE_CLIENT_ID` for authentication.
6.  **Run the Server**:
    ```bash
    uvicorn app.main:app --reload
    ```
    *The API will be available at `http://localhost:8000/docs`.*

---

## 2. Frontend Setup (React + Vite)

The frontend is a modern React application.

### Step-by-Step:
1.  **Navigate to Frontend**:
    ```bash
    cd frontend
    ```
2.  **Install Packages**:
    ```bash
    npm install
    ```
    *Note: I have installed `@react-oauth/google` for social login and `react-icons` for the UI.*
3.  **Configure Environment**:
    *   Create a `.env` file (copy from `.env.example`).
    *   Add `VITE_GOOGLE_CLIENT_ID` (same as backend).
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    *The app will be available at `http://localhost:5173`.*

---

## 3. Google OAuth Setup

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a project and set up the **OAuth Consent Screen**.
3.  Create an **OAuth 2.0 Client ID** (Web Application).
4.  **Important**: Add `http://localhost:5173` to **Authorized JavaScript origins**.
5.  Copy the Client ID to both your backend and frontend `.env` files.

---

## 4. SMS Gateway (Android)

1.  Install the **smsgate** app on your Android phone.
2.  Ensure your phone and laptop are on the same Wi-Fi.
3.  Get the Local IP from the app (e.g., `http://192.168.x.x:8080`).
4.  Update `SMS_GATEWAY_URL` in your `backend/.env`.
5.  Ensure `SMS_GATEWAY_USER` and `SMS_GATEWAY_KEY` match the app settings.

---

## 5. Summary of Key Dependencies Installed

### Backend:
- `fastapi`: High performance API framework.
- `motor`: For asynchronous MongoDB operations.
- `google-auth`: For verifying Google login tokens.
- `python-jose`: For secure JWT creation.

### Frontend:
- `@react-oauth/google`: Handles the Google Sign-In button and logic.
- `react-router-dom`: Modern routing within the app.
- `react-icons`: Used for all professional icons in the UI.
