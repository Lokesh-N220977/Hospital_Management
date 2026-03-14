import { NavLink } from "react-router-dom"
import { 
  Users, Stethoscope, Bookmark, Settings, LogOut, X, PlusSquare, PieChart,
  UserPlus, CalendarDays, BarChart, FileText
} from "lucide-react"

interface AdminSidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

const AdminSidebar = ({ mobileOpen = false, onClose }: AdminSidebarProps) => {
  const navGroups = [
    {
      label: "",
      links: [
        { title: "Dashboard", path: "/admin/dashboard", icon: <PieChart size={20} /> }
      ]
    },
    {
      label: "Doctor Management",
      links: [
        { title: "Add Doctor", path: "/admin/doctors/add", icon: <UserPlus size={20} /> },
        { title: "Manage Doctors", path: "/admin/doctors", icon: <Stethoscope size={20} /> },
        { title: "Doctor Schedules", path: "/admin/doctors/schedules", icon: <CalendarDays size={20} /> }
      ]
    },
    {
      label: "Patient Management",
      links: [
        { title: "Add Patient", path: "/admin/patients/add", icon: <UserPlus size={20} /> },
        { title: "Patients", path: "/admin/patients", icon: <Users size={20} /> }
      ]
    },
    {
      label: "Appointment Management",
      links: [
        { title: "Add Appointment", path: "/admin/appointments/add", icon: <Bookmark size={20} /> },
        { title: "Appointments", path: "/admin/appointments", icon: <CalendarDays size={20} /> }
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
      {/* Mobile Overlay */}
      <div className={`ps-overlay${mobileOpen ? " ps-overlay-open" : ""}`} onClick={onClose} />

      <aside className={`patient-sidebar ad-sidebar-theme${mobileOpen ? " ps-open" : ""}`}>
        <div className="ps-logo">
          <div className="ps-logo-icon">
            <PlusSquare size={24} color="#fff" fill="#fff" />
          </div>
          <span className="ps-logo-text">MedicPulse Admin</span>
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
          <button className="ps-logout-btn" onClick={() => window.location.href = "/login"}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
