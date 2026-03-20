import { useState, useEffect } from "react"
import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Search, XCircle, Clock, Calendar as CalendarIcon, Loader2, Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getPortalProfile, getDoctorAppointments, updateAppointmentStatus } from "../../services/doctorService"

function Appointments() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [apptList, setApptList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"Today" | "Upcoming" | "History">("Today")
  
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<string | null>(null)

  useEffect(() => {
    const initData = async () => {
      setLoading(true)
      try {
        const prof = await getPortalProfile()
        setProfile(prof)
        if (prof && prof.doctor_id) {
            const data = await getDoctorAppointments(prof.doctor_id)
            setApptList(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error("Failed to fetch appointments", err)
      } finally {
        setLoading(false)
      }
    }
    initData()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(id, newStatus)
      setApptList(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a))
      if (newStatus === "completed") alert("Appointment marked as completed!")
      if (newStatus === "cancelled") {
        alert("Appointment cancelled. Slot has been released.")
        setCancelModalOpen(false)
      }
    } catch (err) {
        console.error("Status update failed:", err)
        alert("Failed to update status")
    }
  }

  const getFilteredAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    
    if (activeTab === "Today") {
        return apptList.filter(a => a.date === today && a.status !== "cancelled" && a.status !== "completed")
    }
    if (activeTab === "Upcoming") {
        return apptList.filter(a => a.date > today && a.status !== "cancelled" && a.status !== "completed")
    }
    return apptList.filter(a => a.status === "completed" || a.status === "cancelled")
  }

  if (loading) {
    return (
      <DoctorLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Loader2 className="animate-spin" size={48} color="#0dcb6e" />
        </div>
      </DoctorLayout>
    )
  }

  const filtered = getFilteredAppointments()

  return (
    <DoctorLayout>
      <div className="pd-page">
        <div className="pd-header">
          <div className="pd-header-content">
            <h1 className="pd-page-title">Caseload Manager</h1>
            <p className="pd-page-sub">Monitor upcoming consultations and manage patient workflow. Sort by proximity or status.</p>
          </div>
          <div className="pd-header-actions" style={{ display: 'flex', gap: '12px' }}>
            <div className="pd-search-bar" style={{ maxWidth: '280px' }}>
              <Search size={18} />
              <input type="text" placeholder="Filter patient name..." />
            </div>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="pd-tab-nav" style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#f8fafc', padding: '6px', borderRadius: '12px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
            {(["Today", "Upcoming", "History"] as const).map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        transition: 'all 0.2s',
                        background: activeTab === tab ? '#ffffff' : 'transparent',
                        color: activeTab === tab ? '#0dcb6e' : '#64748b',
                        boxShadow: activeTab === tab ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {tab}
                    <span style={{ marginLeft: '6px', fontSize: '0.7rem', opacity: 0.6 }}>
                        ({apptList.filter(a => {
                            const today = new Date().toISOString().split('T')[0]
                            if (tab === "Today") return a.date === today && a.status !== "cancelled" && a.status !== "completed"
                            if (tab === "Upcoming") return a.date > today && a.status !== "cancelled" && a.status !== "completed"
                            return a.status === "completed" || a.status === "cancelled"
                        }).length})
                    </span>
                </button>
            ))}
        </div>

        <div className="pd-card pd-table-card">
          <div className="pd-table-container">
            <table className="pd-table">
              <thead>
                <tr>
                  <th>Patient Identity</th>
                  <th>Date & Schedule</th>
                  <th>Status</th>
                  <th>Clinical Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((appt) => {
                  const patientName = appt.patient_name || appt.patient || "Patient";
                  return (
                    <tr key={appt._id} className="pd-table-row">
                      <td>
                        <div className="pd-patient-cell">
                          <div className="pd-avatar-sm" style={{ background: '#0dcb6e15', color: '#0dcb6e', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                            {patientName.split(" ").filter(Boolean).map((n:any) => n[0]).join("")}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className="pd-patient-name" style={{ fontWeight: 800, color: '#1e293b' }}>{patientName}</span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Reason: {appt.type || "Routine Consultation"}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{appt.date}</span>
                          <div className="pd-time-badge" style={{ marginTop: '4px' }}>
                            <Clock size={14} />
                            {appt.time}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`pd-status-pill pd-status--${(appt.status || "booked").toLowerCase().replace(" ", "-")}`} style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                          {(appt.status || "BOOKED").toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="pd-table-actions">
                          {appt.status === "booked" && (
                            <>
                              <button className="pd-action-btn-primary" 
                                onClick={() => handleStatusChange(appt._id, "completed")}
                                style={{ padding: '8px 16px', fontSize: '0.75rem', borderRadius: '10px', background: '#0dcb6e' }}>
                                <Check size={14} style={{ marginRight: '4px' }}/>
                                Finish Visit
                              </button>
                              <button className="pd-action-icon-btn pd-danger" 
                                  onClick={() => {
                                      setSelectedAppt(appt._id)
                                      setCancelModalOpen(true)
                                  }}
                                  style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                              >
                                <XCircle size={18} color="#ef4444" />
                              </button>
                            </>
                          )}
                          {appt.status === "completed" && (
                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 800 }}>
                              <Check size={16} /> DATA FINALIZED
                            </span>
                          )}
                          {appt.status === "cancelled" && (
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, fontStyle: 'italic' }}>Released Slot</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                        <CalendarIcon size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>Zero Appointments in "{activeTab}"</p>
                        <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>Your clinical log for this category is currently empty.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {cancelModalOpen && (
        <div className="pd-modal-overlay">
          <div className="pd-modal" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem' }}>Confirm Cancellation</h3>
                <div onClick={() => setCancelModalOpen(false)} style={{ cursor: 'pointer', color: '#94a3b8' }}><XCircle size={24} /></div>
            </div>
            <p className="pd-modal-desc">Are you sure you want to release this slot? This action will notify the patient and return the time to the availability pool.</p>
            
            <div className="pd-modal-actions" style={{ marginTop: '32px' }}>
              <button className="pd-action-btn-secondary" onClick={() => setCancelModalOpen(false)} style={{ flex: 1 }}>Abort</button>
              <button className="pd-action-btn-danger" 
                onClick={() => handleStatusChange(selectedAppt!, "cancelled")}
                style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Yes, Release Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}

export default Appointments
