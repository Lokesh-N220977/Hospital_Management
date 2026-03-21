import { NavLink } from "react-router-dom"
import { 
  LayoutDashboard, ClipboardList, Clock, Users, History, 
  FileText, User, Settings, LogOut, 
  CalendarX, X, PlusSquare 
} from "lucide-react"

import { useAuth } from "../../../context/AuthContext"

interface DoctorSidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

const DoctorSidebar = ({ mobileOpen = false, onClose }: DoctorSidebarProps) => {
  const { user, logout } = useAuth()
  const links = [
    { title: "Dashboard",           path: "/doctor/dashboard",          icon: <LayoutDashboard size={20} /> },
    { title: "Appointments",        path: "/doctor/appointments",       icon: <ClipboardList size={20} /> },
    { title: "Schedule",            path: "/doctor/my-schedule",        icon: <Clock size={20} /> },
    { title: "Manage Leaves",       path: "/doctor/leaves",             icon: <CalendarX size={20} /> },
    { title: "Patients",            path: "/doctor/patients",           icon: <Users size={20} /> },
    { title: "Visit History",       path: "/doctor/visit-history",      icon: <History size={20} /> },
    { title: "Prescriptions",       path: "/doctor/prescriptions",      icon: <FileText size={20} /> },
    { title: "Profile",             path: "/doctor/profile",            icon: <User size={20} /> },
    { title: "Settings",            path: "/doctor/settings",           icon: <Settings size={20} /> },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="ps-overlay ps-overlay-open" onClick={onClose} />
      )}

      <aside className={`patient-sidebar dr-sidebar-theme${mobileOpen ? " ps-open" : ""}`}>
        <div className="ps-logo">
          <div className="ps-logo-icon" style={{ background: 'linear-gradient(135deg, #0dcb6e, #0ba358)' }}>
            <PlusSquare size={24} color="#fff" fill="#fff" />
          </div>
          <span className="ps-logo-text">MedicPulse</span>
          <button className="ps-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Doctor Info (Similar to patient view for consistency) */}
        <div className="ps-user">
          <div className="ps-avatar" style={{ background: 'linear-gradient(135deg, #0dcb6e, #0ba358)' }}>
            <span>{(user?.name || "D")[0].toUpperCase()}</span>
            <span className="ps-online-dot" />
          </div>
          <div className="ps-user-info">
            <p className="ps-user-name">{user?.name || "Doctor"}</p>
            <p className="ps-user-role">Practitioner</p>
          </div>
        </div>

        <nav className="ps-nav">
          <div className="ps-nav-group">
            <h3 className="ps-nav-label">Main Menu</h3>
            {links.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }: { isActive: boolean }) => `ps-link${isActive ? " ps-link-active" : ""}`}
                onClick={onClose}
              >
                <span className="ps-link-icon">{link.icon}</span>
                <span className="ps-link-label">{link.title}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="ps-footer">
          <div className="ps-divider" />
          <button className="ps-logout-btn" onClick={logout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default DoctorSidebar
