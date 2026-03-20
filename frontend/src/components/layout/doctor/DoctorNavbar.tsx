import { useState, useRef, useEffect } from "react"
import { Bell, Menu, ChevronDown, User, Settings, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"

const DoctorNavbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
          <h1 className="pn-page-title">Doctor Portal</h1>
          <p className="pn-breadcrumb">MedicPulse &rsaquo; Welcome Back</p>
        </div>
      </div>

      <div className="pn-right">
        <button className="pn-icon-btn" onClick={() => navigate("/doctor/notifications")}>
          <Bell size={20} />
          <span className="pn-bell-dot">3</span>
        </button>

        <div className="pn-profile" onClick={() => setShowDropdown(!showDropdown)} ref={dropdownRef}>
          <div className="pn-avatar" style={{ background: 'linear-gradient(135deg, #0dcb6e, #0ba358)' }}>
            {(user?.name || "D")[0].toUpperCase()}
          </div>
          <div className="pn-profile-info">
            <span className="pn-name">{user?.name || "Doctor"}</span>
            <span className="pn-role">{user?.specialization || "Practitioner"}</span>
          </div>
          <ChevronDown size={16} className={`pn-chevron${showDropdown ? " pn-chevron-open" : ""}`} />

          {showDropdown && (
            <div className="pn-dropdown">
              <button 
                type="button" 
                onMouseDown={() => handleNav("/doctor/profile")} 
                className="pn-dropdown-item"
              >
                <User size={16} /> <span>My Profile</span>
              </button>
              <button 
                type="button" 
                onMouseDown={() => handleNav("/doctor/settings")} 
                className="pn-dropdown-item"
              >
                <Settings size={16} /> <span>Settings</span>
              </button>
              <hr className="pn-dropdown-hr" />
              <button 
                type="button" 
                onClick={logout} 
                className="pn-dropdown-item pn-dropdown-danger"
              >
                <LogOut size={16} /> <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default DoctorNavbar
