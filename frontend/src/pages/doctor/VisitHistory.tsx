import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Search, Filter, Calendar, Activity, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getPortalProfile, getDoctorAppointments } from "../../services/doctorService"

function VisitHistory() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const prof = await getPortalProfile()
        if (prof && prof.doctor_id) {
          const list = await getDoctorAppointments()
          // Filter for completed or cancelled
          const filtered = Array.isArray(list) 
            ? list.filter((a: any) => a.status === 'completed' || a.status === 'cancelled') 
            : []
          setAppointments(filtered)
        }
      } catch (err) {
        console.error("Failed to load history", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
            <h1 className="pd-page-title">Consultation Ledger</h1>
            <p className="pd-page-sub">Historical record of all completed and processed visits. Use search for specific patient reports.</p>
          </div>
          <div className="pd-header-actions">
            <div className="pd-search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search by patient name..." />
            </div>
            <button className="pd-filter-btn">
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="pd-card pd-table-card">
          <div className="pd-table-container">
            {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <Calendar size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                    <p>No historical records found for your account.</p>
                </div>
            ) : (
                <table className="pd-table">
                <thead>
                    <tr>
                    <th>Patient</th>
                    <th>Date / Schedule</th>
                    <th>Clinical Type</th>
                    <th>Outcome</th>
                    <th style={{ textAlign: 'right' }}>Identity</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((entry) => (
                    <tr key={entry._id} className="pd-table-row">
                        <td>
                        <div className="pd-patient-cell">
                            <div className="pd-avatar-sm" style={{ backgroundColor: '#0dcb6e15', color: '#0dcb6e' }}>
                            {(entry.patient_name || "P").split(" ").map((n:any) => n[0]).join("")}
                            </div>
                            <span className="pd-patient-name" style={{ fontWeight: 700 }}>{entry.patient_name || "Unknown Patient"}</span>
                        </div>
                        </td>
                        <td>
                        <div className="pd-time-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                            <Calendar size={14} />
                            <span>{entry.date} at {entry.time}</span>
                        </div>
                        </td>
                        <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={12} color="#0dcb6e" />
                                <span className="pd-appt-type">{entry.type || "General Consult"}</span>
                            </div>
                        </td>
                        <td>
                        <span className={`pd-status-pill pd-status--${(entry.status || "booked").toLowerCase()}`} style={{ 
                            textTransform: 'capitalize',
                            padding: '4px 12px',
                            borderRadius: '100px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            backgroundColor: entry.status === 'completed' ? '#f0fdf4' : '#fef2f2',
                            color: entry.status === 'completed' ? '#16a34a' : '#dc2626',
                            border: `1px solid ${entry.status === 'completed' ? '#bbf7d0' : '#fecaca'}`
                        }}>
                            {entry.status}
                        </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Ref: {entry._id?.slice(-6).toUpperCase() || "N/A"}</div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}

export default VisitHistory
