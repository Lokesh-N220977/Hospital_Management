import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import api from "../../../services/api"
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  History,
  Bell,
  UserCircle,
  LogOut,
  X,
  Settings
} from "lucide-react"
import logo from "../../../assets/logo.png"

const navLinks = [
  { to: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patient/book-appointment", label: "Book Appointment", icon: CalendarPlus },
  { to: "/patient/appointments", label: "My Appointments", icon: CalendarCheck },
  { to: "/patient/visit-history", label: "Visit History", icon: History },
  { to: "/patient/notifications", label: "Notifications", icon: Bell, isNotif: true },
  { to: "/patient/profile", label: "Profile", icon: UserCircle },
  { to: "/patient/settings", label: "Settings", icon: Settings },
]

interface PatientSidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

const PatientSidebar = ({ mobileOpen = false, onClose }: PatientSidebarProps) => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = (user.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase();
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnread = async () => {
    try {
      const res = await api.get("/notifications")
      if (res.data.success) {
        const count = res.data.data.filter((n: any) => !n.is_read).length
        setUnreadCount(count)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 60000) // update every minute
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    navigate("/login")
  }

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="ps-overlay ps-overlay-open" onClick={onClose} />
      )}

      <aside className={`patient-sidebar${mobileOpen ? " ps-open" : ""}`}>
        {/* Logo */}
        <div className="ps-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logo} alt="Logo" style={{ height: '32px', width: 'auto' }} />
          <span className="ps-logo-text">MedicPulse</span>
          <button className="ps-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* User Avatar */}
        <div className="ps-user">
          <div className="ps-avatar">
            <span>{ initials }</span>
            <span className="ps-online-dot" />
          </div>
          <div className="ps-user-info">
            <p className="ps-user-name">{ user.name || "User" }</p>
            <p className="ps-user-role">Patient</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="ps-nav">
          <p className="ps-nav-label">MAIN MENU</p>
          <ul className="ps-menu">
            {navLinks.map(({ to, label, icon: Icon, isNotif }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `ps-link${isActive ? " ps-link-active" : ""}`
                  }
                  onClick={onClose}
                >
                  <span className="ps-link-icon">
                    <Icon size={19} />
                  </span>
                  <span className="ps-link-label">{label}</span>
                  {isNotif && unreadCount > 0 && (
                    <span className="ps-badge">{unreadCount}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout at the bottom */}
        <div className="ps-logout-wrap">
          <div className="ps-divider" />
          <button className="ps-logout-btn" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default PatientSidebar
