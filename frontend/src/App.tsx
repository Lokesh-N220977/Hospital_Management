import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ScrollToTop from "./components/ScrollToTop"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { RoleProtectedRoute } from "./components/RoleProtectedRoute"

// Public
import Home from "./pages/public/Home"
import FindDoctors from "./pages/public/FindDoctors"
import Login from "./pages/public/Login"
import Register from "./pages/public/Register"

// Patient
import Dashboard from "./pages/patient/Dashboard"
import BookAppointment from "./pages/patient/BookAppointment"
import MyAppointments from "./pages/patient/MyAppointments"
import VisitHistory from "./pages/patient/VisitHistory"
import Notifications from "./pages/patient/Notifications"
import Profile from "./pages/patient/Profile"
import PatientSettings from "./pages/patient/PatientSettings"

// Doctor
import DoctorDashboard from "./pages/doctor/Dashboard"
import Schedule from "./pages/doctor/Schedule"
import Leaves from "./pages/doctor/Leaves"
import Appointments from "./pages/doctor/Appointments"
import Patients from "./pages/doctor/Patients"
import DoctorVisitHistory from "./pages/doctor/VisitHistory"
import Prescriptions from "./pages/doctor/Prescriptions"
import DoctorProfile from "./pages/doctor/Profile"
import Consultation from "./pages/doctor/Consultation"
import DoctorNotifications from "./pages/doctor/Notifications"
import DoctorSettings from "./pages/doctor/DoctorSettings"
import ChangePassword from "./pages/doctor/ChangePassword"

// Admin - Lazy Loading
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"))

// Other Admin (not lazy loaded but will be commented out)
import AdminDashboard from "./pages/admin/Dashboard"
import AdminAddDoctor from "./pages/admin/AddDoctor"
import AdminDoctors from "./pages/admin/Doctors"
import AdminAddPatient from "./pages/admin/AddPatient"
import AdminPatients from "./pages/admin/Patients"
import AdminAddAppointment from "./pages/admin/AddAppointment"
import AdminAppointments from "./pages/admin/Appointments"
import AdminSettings from "./pages/admin/Settings"
import AdminSchedules from "./pages/admin/DoctorSchedules"
const AdminLeaves = lazy(() => import("./pages/admin/LeaveRequests"))

import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<FindDoctors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Protected Patient Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleProtectedRoute allowedRoles={['patient']} />}>
              <Route path="/patient/dashboard" element={<Dashboard />} />
              <Route path="/patient/book-appointment" element={<BookAppointment />} />
              <Route path="/patient/appointments" element={<MyAppointments />} />
              <Route path="/patient/visit-history" element={<VisitHistory />} />
              <Route path="/patient/notifications" element={<Notifications />} />
              <Route path="/patient/profile" element={<Profile />} />
              <Route path="/patient/settings" element={<PatientSettings />} />
            </Route>
          </Route>

          {/* Protected Doctor Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleProtectedRoute allowedRoles={['doctor']} />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/change-password" element={<ChangePassword />} />
              <Route path="/doctor/appointments" element={<Appointments />} />
              <Route path="/doctor/my-schedule" element={<Schedule />} />
              <Route path="/doctor/leaves" element={<Leaves />} />
              <Route path="/doctor/patients" element={<Patients />} />
              <Route path="/doctor/visit-history" element={<DoctorVisitHistory />} />
              <Route path="/doctor/prescriptions" element={<Prescriptions />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
              <Route path="/doctor/consultation/:id" element={<Consultation />} />
              <Route path="/doctor/notifications" element={<DoctorNotifications />} />
              <Route path="/doctor/settings" element={<DoctorSettings />} />
              {/* Legacy routes for fallback */}
              <Route path="/doctor/today-appointments" element={<Appointments />} />
              <Route path="/doctor/schedule" element={<Schedule />} />
              <Route path="/doctor/availability" element={<Schedule />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/doctors" element={<AdminDoctors />} />
              <Route path="/admin/add-doctor" element={<AdminAddDoctor />} />
              <Route path="/admin/patients" element={<AdminPatients />} />
              <Route path="/admin/add-patient" element={<AdminAddPatient />} />
              <Route path="/admin/appointments" element={<AdminAppointments />} />
              <Route path="/admin/add-appointment" element={<AdminAddAppointment />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/schedules" element={<AdminSchedules />} />
              <Route path="/admin/leaves" element={<Suspense fallback={<div>Loading...</div>}><AdminLeaves /></Suspense>} />
            </Route>
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
