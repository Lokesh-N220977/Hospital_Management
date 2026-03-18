import { BrowserRouter, Routes, Route } from "react-router-dom"
import ScrollToTop from "./components/ScrollToTop"
import Home from "./pages/public/Home"
import FindDoctors from "./pages/public/FindDoctors"
import Login from "./pages/public/Login"
import Register from "./pages/public/Register"
import Dashboard from "./pages/patient/Dashboard"
import BookAppointment from "./pages/patient/BookAppointment"
import MyAppointments from "./pages/patient/MyAppointments"
import VisitHistory from "./pages/patient/VisitHistory"
import Notifications from "./pages/patient/Notifications"
import Profile from "./pages/patient/Profile"
import PatientSettings from "./pages/patient/PatientSettings"

// Doctor
import DoctorDashboard from "./pages/doctor/Dashboard"
import TodaySchedule from "./pages/doctor/TodaySchedule.tsx"
import Calendar from "./pages/doctor/Calendar"
import Patients from "./pages/doctor/Patients"
import DoctorVisitHistory from "./pages/doctor/VisitHistory"
import Prescriptions from "./pages/doctor/Prescriptions"
import DoctorProfile from "./pages/doctor/Profile"
import Consultation from "./pages/doctor/Consultation"
import DoctorNotifications from "./pages/doctor/Notifications"
import DoctorSettings from "./pages/doctor/DoctorSettings"

// Admin
import AdminDashboard from "./pages/admin/Dashboard"
import AdminAddDoctor from "./pages/admin/AddDoctor"
import AdminDoctors from "./pages/admin/Doctors"
import AdminDoctorSchedules from "./pages/admin/DoctorSchedules"
import AdminAddPatient from "./pages/admin/AddPatient"
import AdminPatients from "./pages/admin/Patients"
import AdminAddAppointment from "./pages/admin/AddAppointment"
import AdminAppointments from "./pages/admin/Appointments"
import AdminAnalytics from "./pages/admin/Analytics"
import AdminSettings from "./pages/admin/Settings"

import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<FindDoctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient Dashboard */}
        <Route path="/patient/dashboard" element={<Dashboard />} />
        <Route path="/patient/book-appointment" element={<BookAppointment />} />
        <Route path="/patient/appointments" element={<MyAppointments />} />
        <Route path="/patient/visit-history" element={<VisitHistory />} />
        <Route path="/patient/notifications" element={<Notifications />} />
        <Route path="/patient/profile" element={<Profile />} />
        <Route path="/patient/settings" element={<PatientSettings />} />

        {/* Doctor Dashboard */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/today-appointments" element={<TodaySchedule />} />
        <Route path="/doctor/schedule" element={<Calendar />} />
        <Route path="/doctor/patients" element={<Patients />} />
        <Route path="/doctor/visit-history" element={<DoctorVisitHistory />} />
        <Route path="/doctor/prescriptions" element={<Prescriptions />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/doctor/consultation/:id" element={<Consultation />} />
        <Route path="/doctor/notifications" element={<DoctorNotifications />} />
        <Route path="/doctor/settings" element={<DoctorSettings />} />

        {/* Admin Dashboard */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/doctors/add" element={<AdminAddDoctor />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/doctors/schedules" element={<AdminDoctorSchedules />} />
        <Route path="/admin/patients/add" element={<AdminAddPatient />} />
        <Route path="/admin/patients" element={<AdminPatients />} />
        <Route path="/admin/appointments/add" element={<AdminAddAppointment />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/settings" element={<AdminSettings />} />


        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App