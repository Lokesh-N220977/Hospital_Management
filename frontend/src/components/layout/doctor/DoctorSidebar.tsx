import { useNavigate, NavLink } from "react-router-dom"
import { 
  LayoutDashboard, Clock, Users, History, FileText, 
  User, LogOut, X, PlusSquare, CalendarCheck, Settings, Bell 
} from "lucide-react"

interface DoctorSidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

const DoctorSidebar = ({ mobileOpen = false, onClose }: DoctorSidebarProps) => {
  const navigate = useNavigate()
  const links = [
    { title: "Dashboard",           path: "/doctor/dashboard",          icon: <LayoutDashboard size={20} /> },
    { title: "Today's Appointments",path: "/doctor/today-appointments",icon: <CalendarCheck size={20} /> },
    { title: "My Schedule",         path: "/doctor/schedule",           icon: <Clock size={20} /> },
    { title: "Patients",           path: "/doctor/patients",           icon: <Users size={20} /> },
    { title: "Visit History",       path: "/doctor/visit-history",      icon: <History size={20} /> },
    { title: "Prescriptions",      path: "/doctor/prescriptions",      icon: <FileText size={20} /> },
    { title: "Notifications",      path: "/doctor/notifications",      icon: <Bell size={20} />, badge: 3 },
    { title: "Profile",            path: "/doctor/profile",            icon: <User size={20} /> },
    { title: "Settings",           path: "/doctor/settings",           icon: <Settings size={20} /> },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="ps-overlay ps-overlay-open" onClick={onClose} />
      )}

      <aside className={`patient-sidebar${mobileOpen ? " ps-open" : ""}`}>
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
            <span>DS</span>
            <span className="ps-online-dot" />
          </div>
          <div className="ps-user-info">
            <p className="ps-user-name">Dr. Sarah</p>
            <p className="ps-user-role">Cardiologist</p>
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
                {link.badge && <span className="ps-badge">{link.badge}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="ps-footer">
          <div className="ps-divider" />
          <button className="ps-logout-btn" onClick={() => navigate("/login")}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default DoctorSidebar
