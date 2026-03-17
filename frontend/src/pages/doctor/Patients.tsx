import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Search, MoreHorizontal, Mail, Phone, Calendar, FileText, MessageSquare } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"

const patients = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1 234 567 890", lastVisit: "March 10, 2026", status: "Active", gender: "M", age: 32 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1 234 567 891", lastVisit: "March 12, 2026", status: "Active", gender: "F", age: 28 },
  { id: 3, name: "Robert Wilson", email: "robert@example.com", phone: "+1 234 567 892", lastVisit: "March 05, 2026", status: "Inactive", gender: "M", age: 45 },
  { id: 4, name: "Emily Brown", email: "emily@example.com", phone: "+1 234 567 893", lastVisit: "February 28, 2026", status: "Active", gender: "F", age: 24 },
  { id: 5, name: "Michael Davis", email: "michael@example.com", phone: "+1 234 567 894", lastVisit: "March 08, 2026", status: "Active", gender: "M", age: 38 },
]

function Patients() {
  const navigate = useNavigate()
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <DoctorLayout>
      <div className="pd-page">
        <div className="pd-header">
          <div className="pd-header-content">
            <h1 className="pd-page-title">My Patients</h1>
            <p className="pd-page-sub">View and manage all your registered patients and their medical history.</p>
          </div>
          <div className="pd-header-actions">
            <div className="pd-search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search by name or email..." />
            </div>
          </div>
        </div>

        <div className="pd-patients-grid">
          {patients.map((patient) => (
            <div key={patient.id} className="pd-patient-card">
              <div className="pd-patient-card-header">
                <div className="pd-patient-avatar-large">
                  {patient.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="pd-dropdown-wrap" style={{ position: "relative" }}>
                  <button 
                    className="pd-patient-more" 
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveDropdown(activeDropdown === patient.id ? null : patient.id)
                    }}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {activeDropdown === patient.id && (
                    <div className="pd-action-menu" ref={dropdownRef} style={{
                      position: "absolute", top: "100%", right: 0, 
                      background: "#fff", border: "1px solid #e2e8f0", 
                      borderRadius: "8px", padding: "8px 0", 
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10,
                      minWidth: "180px"
                    }}>
                      <button className="pd-menu-item" style={{
                        display: "flex", alignItems: "center", gap: "8px", 
                        padding: "8px 16px", width: "100%", border: "none", 
                        background: "none", color: "#475569", 
                        fontSize: "0.85rem", cursor: "pointer", textAlign: "left"
                      }}>
                        <FileText size={16} /> Request Lab Report
                      </button>
                      <button className="pd-menu-item" style={{
                        display: "flex", alignItems: "center", gap: "8px", 
                        padding: "8px 16px", width: "100%", border: "none", 
                        background: "none", color: "#475569", 
                        fontSize: "0.85rem", cursor: "pointer", textAlign: "left"
                      }}>
                        <MessageSquare size={16} /> Message Patient
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="pd-patient-card-body">
                <h3 className="pd-patient-card-name">{patient.name}</h3>
                <div className="pd-patient-card-meta">
                  <span>{patient.age} yrs • {patient.gender === "M" ? "Male" : "Female"}</span>
                  <span className={`pd-status-indicator pd-status--${patient.status.toLowerCase()}`}>
                    {patient.status}
                  </span>
                </div>
                
                <div className="pd-patient-contact-list">
                  <div className="pd-contact-item">
                    <Mail size={14} />
                    <span>{patient.email}</span>
                  </div>
                  <div className="pd-contact-item">
                    <Phone size={14} />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="pd-contact-item">
                    <Calendar size={14} />
                    <span>Last visit: {patient.lastVisit}</span>
                  </div>
                </div>
              </div>
              <div className="pd-patient-card-footer">
                <button 
                  className="pd-view-history-btn"
                  onClick={() => navigate("/doctor/visit-history")}
                >
                  View History
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DoctorLayout>
  )
}

export default Patients
