import { useState, useRef, useEffect } from "react"
import { Menu, ChevronDown, UserCircle, Settings, LogOut } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import NotificationDropdown from "../../ui/NotificationDropdown"

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
  "/admin/dashboard": { title: "Admin Dashboard", breadcrumb: "System Overview" },
  "/admin/add-doctor": { title: "Add New Doctor", breadcrumb: "Staff Management" },
  "/admin/doctors": { title: "Manage Doctors", breadcrumb: "Medical Staff" },
  "/admin/schedules": { title: "Doctor Schedules", breadcrumb: "Time Management" },
  "/admin/leaves": { title: "Leave Requests", breadcrumb: "HR Management" },
  "/admin/add-patient": { title: "Register Patient", breadcrumb: "Patient Records" },
  "/admin/patients": { title: "Patient Directory", breadcrumb: "Medical Records" },
  "/admin/add-appointment": { title: "Create Appointment", breadcrumb: "Scheduling" },
  "/admin/appointments": { title: "Manage Appointments", breadcrumb: "Hospital Visits" },
  "/admin/analytics": { title: "Hospital Analytics", breadcrumb: "Data Insights" },
  "/admin/settings": { title: "System Settings", breadcrumb: "Configuration" },
  "/admin/profile": { title: "Admin Profile", breadcrumb: "Account Details" },
}

const AdminNavbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentPath = location.pathname
  const { title, breadcrumb } = pageTitles[currentPath] || { title: "Admin Portal", breadcrumb: "MedicPulse" }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleNav = (path: string) => {
    navigate(path)
    setShowDropdown(false)
  }

  return (
    <header className="pn-navbar">
      <div className="pn-left">
        <button className="pn-hamburger" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        <div className="pn-title-wrap">
          <h1 className="pn-page-title text-primary-gradient">{title}</h1>
          <p className="pn-breadcrumb">MedicPulse &rsaquo; {breadcrumb}</p>
        </div>
      </div>

      <div className="pn-right">
        <NotificationDropdown />

        <div className="pn-profile" onClick={() => setShowDropdown(!showDropdown)} ref={dropdownRef}>
          <div className="pn-avatar" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>AD</div>
          <div className="pn-profile-info">
            <span className="pn-name">System Admin</span>
            <span className="pn-role">Full Access</span>
          </div>
          <ChevronDown size={16} className={`pn-chevron${showDropdown ? " pn-chevron-open" : ""}`} />

          {showDropdown && (
            <div className="pn-dropdown">
              <button type="button" onClick={() => handleNav("/admin/profile")} className="pn-dropdown-item">
                <UserCircle size={16} /> My Account
              </button>
              <button type="button" onClick={() => handleNav("/admin/settings")} className="pn-dropdown-item">
                <Settings size={16} /> System Settings
              </button>
              <hr className="pn-dropdown-hr" />
              <button type="button" onClick={() => handleNav("/login")} className="pn-dropdown-item pn-dropdown-danger">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar
