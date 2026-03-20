import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Search, Mail, Phone, Calendar, Loader2, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { getPortalProfile, getDoctorPatients } from "../../services/doctorService"

function Patients() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const prof = await getPortalProfile()
        setProfile(prof)
        if (prof && prof.doctor_id) {
          const list = await getDoctorPatients(prof.doctor_id)
          setPatients(Array.isArray(list) ? list : [])
        }
      } catch (err) {
        console.error("Failed to load patients", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (loading) {
    return (
      <DoctorLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
          <Loader2 className="animate-spin" size={48} color="#0dcb6e" />
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="pd-page">
        <div className="pd-header">
          <div className="pd-header-content">
            <h1 className="pd-page-title">Patient Records</h1>
            <p className="pd-page-sub">Comprehensive overview of individuals who have interacted with your clinic. Access medical history and contact logs.</p>
          </div>
          <div className="pd-header-actions">
            <div className="pd-search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search by name or email..." />
            </div>
          </div>
        </div>

        {patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', color: '#64748b' }}>
                <User size={60} style={{ opacity: 0.1, marginBottom: '20px' }} />
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>No Patients Recorded</h3>
                <p>Patients will appear here once they start booking appointments with you.</p>
            </div>
        ) : (
            <div className="pd-patients-grid">
            {patients.map((patient) => (
                <div key={patient.id} className="pd-patient-card">
                <div className="pd-patient-card-header">
                    <div className="pd-patient-avatar-large">
                    {(patient.name || "P").split(" ").map((n:any) => n[0]).join("")}
                    </div>
                </div>
                <div className="pd-patient-card-body">
                    <h3 className="pd-patient-card-name" style={{ fontWeight: 800 }}>{patient.name || "Unknown Patient"}</h3>
                    <div className="pd-patient-card-meta">
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Active Patient</span>
                    </div>

                    <div className="pd-patient-contact-list" style={{ marginTop: '20px' }}>
                    <div className="pd-contact-item">
                        <Mail size={14} />
                        <span>{patient.email || "No email provided"}</span>
                    </div>
                    <div className="pd-contact-item">
                        <Phone size={14} />
                        <span>{patient.phone || "No contact info"}</span>
                    </div>
                    <div className="pd-contact-item">
                        <Calendar size={14} />
                        <span>Last interact: {patient.last_visit || "N/A"}</span>
                    </div>
                    </div>
                </div>
                <div className="pd-patient-card-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <button
                        className="pd-view-history-btn"
                        onClick={() => navigate("/doctor/visit-history")}
                        style={{ width: '100%', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                    >
                    Full History
                    </button>
                    <button
                        className="pd-view-history-btn"
                        onClick={() => navigate(`/doctor/consultation/new?patient_id=${patient.id}`)}
                        style={{ width: '100%', background: '#0dcb6e', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', marginTop: '10px' }}
                    >
                    New Consultation
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </DoctorLayout>
  )
}

export default Patients
