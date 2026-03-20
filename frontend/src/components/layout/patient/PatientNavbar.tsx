import { useState, useRef, useEffect } from "react"
import { Bell, Menu, ChevronDown, Search, X, User, LogOut, Settings } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

const pageTitles: Record<string, string> = {
  "/patient/dashboard": "Dashboard",
  "/patient/book-appointment": "Book Appointment",
  "/patient/appointments": "My Appointments",
  "/patient/visit-history": "Visit History",
  "/patient/notifications": "Notifications",
  "/patient/profile": "Profile",
  "/patient/settings": "Settings",
}

interface PatientNavbarProps {
  onMenuClick: () => void
}

const PatientNavbar = ({ onMenuClick }: PatientNavbarProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const title = pageTitles[location.pathname] || "Patient Portal"
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
        <button className="pn-hamburger" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="pn-title-wrap">
          <h1 className="pn-page-title">{title}</h1>
          <p className="pn-breadcrumb">MedicPulse Hospital &rsaquo; {title}</p>
        </div>
      </div>

      <div className="pn-right">
        <div className="pn-search pn-search-desktop">
          <Search size={16} />
          <input type="text" placeholder="Search..." className="pn-search-input" />
        </div>

        <button
          className="pn-icon-btn pn-search-mobile-btn"
          onClick={() => setShowSearch(s => !s)}
          aria-label="Search"
        >
          {showSearch ? <X size={20} /> : <Search size={20} />}
        </button>

        <button
          className="pn-icon-btn pn-bell"
          onClick={() => navigate("/patient/notifications")}
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="pn-bell-dot">3</span>
        </button>

        <div
          className="pn-profile"
          onClick={() => setShowDropdown(!showDropdown)}
          ref={dropdownRef}
        >
          <div className="pn-avatar">{(user.name || "U")[0].toUpperCase()}</div>
          <div className="pn-profile-info">
            <span className="pn-name">{user.name || "User"}</span>
            <span className="pn-role">Patient</span>
          </div>
          <ChevronDown size={16} className={`pn-chevron${showDropdown ? " pn-chevron-open" : ""}`} />

          {showDropdown && (
            <div className="pn-dropdown">
              <button 
                type="button" 
                onMouseDown={() => handleNav("/patient/profile")} 
                className="pn-dropdown-item"
              >
                <User size={16} /> <span>My Profile</span>
              </button>
              <button 
                type="button" 
                onMouseDown={() => handleNav("/patient/settings")} 
                className="pn-dropdown-item"
              >
                <Settings size={16} /> <span>Settings</span>
              </button>
              <hr className="pn-dropdown-hr" />
              <button 
                type="button" 
                onMouseDown={() => handleNav("/login")} 
                className="pn-dropdown-item pn-dropdown-danger"
              >
                <LogOut size={16} /> <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="pn-mobile-search">
          <Search size={16} />
          <input type="text" placeholder="Search..." className="pn-search-input" autoFocus />
        </div>
      )}
    </header>
  )
}

export default PatientNavbar
