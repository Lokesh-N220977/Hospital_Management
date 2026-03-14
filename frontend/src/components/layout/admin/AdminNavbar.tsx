import { useState, useRef, useEffect } from "react"
import { Bell, Menu, ChevronDown, UserCircle, Settings, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

const AdminNavbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const navigate = useNavigate()
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
        <h1 className="pn-page-title">Admin Dashboard</h1>
      </div>

      <div className="pn-right">
        <button className="pn-icon-btn">
          <Bell size={20} />
          <span className="pn-bell-dot">5</span>
        </button>

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
