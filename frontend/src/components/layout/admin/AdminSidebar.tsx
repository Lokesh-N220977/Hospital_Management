import { NavLink } from "react-router-dom"
import {
  Users, Stethoscope, Bookmark, Settings, LogOut, X, PieChart,
  UserPlus, CalendarDays, BarChart, FileText
} from "lucide-react"
import logo from "../../../assets/logo.png"

interface AdminSidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

const AdminSidebar = ({ mobileOpen = false, onClose }: AdminSidebarProps) => {
  const navGroups = [
    {
      label: "",
      links: [
        { title: "Dashboard", path: "/admin/dashboard", icon: <PieChart size={20} />, end: true }
      ]
    },
    {
      label: "Doctor Management",
      links: [
        { title: "Add Doctor", path: "/admin/add-doctor", icon: <UserPlus size={20} /> },
        { title: "Manage Doctors", path: "/admin/doctors", icon: <Stethoscope size={20} />, end: true },
        { title: "Doctor Schedules", path: "/admin/schedules", icon: <CalendarDays size={20} /> },
        { title: "Leave Requests", path: "/admin/leaves", icon: <FileText size={20} /> }
      ]
    },
    {
      label: "Patient Management",
      links: [
        { title: "Add Patient", path: "/admin/add-patient", icon: <UserPlus size={20} /> },
        { title: "Patients", path: "/admin/patients", icon: <Users size={20} />, end: true }
      ]
    },
    {
      label: "Appointment Management",
      links: [
        { title: "Add Appointment", path: "/admin/add-appointment", icon: <Bookmark size={20} /> },
        { title: "Appointments", path: "/admin/appointments", icon: <CalendarDays size={20} />, end: true }
      ]
    },
    {
      label: "Reports & Analytics",
      links: [
        { title: "Analytics", path: "/admin/analytics", icon: <BarChart size={20} /> }
      ]
    },
    {
      label: "System",
      links: [
        { title: "System Settings", path: "/admin/settings", icon: <Settings size={20} /> }
      ]
    }
  ]

  return (
    <>
      <div className={`ps-overlay${mobileOpen ? " ps-overlay-open" : ""}`} onClick={onClose} />

      <aside className={`patient-sidebar ad-sidebar-theme${mobileOpen ? " ps-open" : ""}`}>
        <div className="ps-logo">
          <img src={logo} alt="Logo" className="ps-logo-img" />
          <span className="ps-logo-text">Medic<span className="text-primary-gradient">Pulse</span></span>
          <button className="ps-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="ps-nav">
          {navGroups.map((group, idx) => (
            <div key={idx} className="ps-nav-group">
              {group.label && <h3 className="ps-nav-label">{group.label}</h3>}
              {group.links.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) => `ps-link${isActive ? " ps-link-active" : ""}`}
                  onClick={onClose}
                >
                  {link.icon}
                  <span>{link.title}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="ps-footer">
          <button className="ps-logout-btn" onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
