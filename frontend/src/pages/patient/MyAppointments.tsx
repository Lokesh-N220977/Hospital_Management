import { useState, useEffect } from "react"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  CalendarCheck, Clock, CheckCircle2,
  AlertCircle, XCircle, ChevronDown,
  Search, User
} from "lucide-react"
import { appointmentService } from "../../services/appointment.service"
import { reviewService } from "../../services/reviewService"
import ReviewModal from "../../components/ReviewModal"

const statusIcons: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle2 size={14} />,
  pending: <AlertCircle size={14} />,
  completed: <CheckCircle2 size={14} />,
  cancelled: <XCircle size={14} />,
  booked: <CheckCircle2 size={14} />,
}

const avatarColors = [
  "#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"
]

const filters = ["All", "Confirmed", "Pending", "Completed", "Cancelled", "Booked"]

function MyAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; appointmentId: string; existingReview?: any }>({ isOpen: false, appointmentId: "" })

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const data = await appointmentService.getMyAppointments()
      setAppointments(data)
    } catch (err) {
      setError("Failed to load appointments.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const filtered = appointments.filter(a => {
    const statusVal = a.status || "booked";
    const matchFilter = activeFilter === "All" || statusVal === activeFilter.toLowerCase()
    const matchSearch = (a.doctor_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.specialization || "").toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await appointmentService.cancelAppointment(id);
        // Refresh list
        const data = await appointmentService.getMyAppointments();
        setAppointments(data);
      } catch (err: any) {
        alert(err.response?.data?.detail || err.response?.data?.message || "Failed to cancel appointment.");
      }
    }
  }

  const handleReviewSuccess = () => {
    // Refresh list to update 'reviewed' status
    fetchAppointments();
  }

  const handleOpenReview = async (apptId: string, reviewed: boolean) => {
    if (reviewed) {
      try {
        const review = await reviewService.getAppointmentReview(apptId);
        setReviewModal({ isOpen: true, appointmentId: apptId, existingReview: review });
      } catch (err) {
        alert("Could not load review data.");
      }
    } else {
      setReviewModal({ isOpen: true, appointmentId: apptId });
    }
  }

  return (
    <PatientLayout>

      <div className="ma-page">
        <div className="ma-header">
          <div>
            <h2 className="ma-title">My Appointments</h2>
            <p className="ma-sub">Manage and track all your appointments</p>
          </div>
          <a href="/patient/book-appointment" className="ma-book-btn">
            + Book New
          </a>
        </div>

        <div className="ma-summary-row">
          {[
            { label: "Total", count: appointments.length, color: "#3b82f6" },
            { label: "Upcoming", count: appointments.filter(a => (a.status === "confirmed" || a.status === "pending" || a.status === "booked")).length, color: "#10b981" },
            { label: "Completed", count: appointments.filter(a => a.status === "completed").length, color: "#8b5cf6" },
            { label: "Cancelled", count: appointments.filter(a => a.status === "cancelled").length, color: "#ef4444" },
          ].map(({ label, count, color }) => (
            <div className="ma-summary-chip" key={label} style={{ borderLeft: `4px solid ${color}` }}>
              <span className="ma-chip-count" style={{ color }}>{count}</span>
              <span className="ma-chip-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="ma-controls">
          <div className="ma-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search appointments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ma-search-input"
            />
          </div>
          <div className="ma-filter-pills">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`ma-filter-pill${activeFilter === f ? " ma-filter-active" : ""}`}
              >{f}</button>
            ))}
          </div>
        </div>

        <div className="ma-list">
          {loading && <div style={{ padding: '40px', textAlign: 'center' }}>Loading your appointments...</div>}
          
          {!loading && filtered.length === 0 && (
            <div className="ma-empty">
              <CalendarCheck size={48} />
              <p>{error || "No appointments found"}</p>
            </div>
          )}
          
          {!loading && filtered.map((appt, idx) => (
            <div key={appt._id} className="ma-card">
              <div className="ma-card-accent" style={{ background: avatarColors[idx % avatarColors.length] }} />
              <div className="ma-card-body">
                <div className="ma-card-top">
                  <div className="ma-doc-avatar" style={{ background: avatarColors[idx % avatarColors.length] }}>
                    {((appt.doctor_name || "D")[0]).toUpperCase()}
                  </div>
                  <div className="ma-doc-details">
                    <h4 className="ma-doc-name">{appt.doctor_name || "Doctor"}</h4>
                    <p className="ma-doc-spec">{appt.specialization || "Specialist"}</p>
                  </div>
                  <div className="ma-appt-datetime">
                    <p className="ma-appt-date">
                      <CalendarCheck size={13} /> {appt.date}
                    </p>
                    <p className="ma-appt-time">
                      <Clock size={13} /> {appt.time}
                    </p>
                    <p className="ma-appt-patient" style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                       <User size={12} /> {appt.patient_name || "Self"}
                    </p>
                  </div>
                  <span className={`ma-status-badge ma-status-${appt.status || 'booked'}`}>
                    {statusIcons[appt.status || 'booked']} {appt.status || 'booked'}
                  </span>
                  <button
                    className="ma-expand-btn"
                    onClick={() => setExpanded(expanded === appt._id ? null : appt._id)}
                  >
                    <ChevronDown
                      size={18}
                      style={{ transform: expanded === appt._id ? "rotate(180deg)" : "none", transition: "0.3s" }}
                    />
                  </button>
                </div>

                <div className={`ma-card-expand${expanded === appt._id ? " ma-card-expand-open" : ""}`}>
                  <div className="ma-expand-grid">
                    <div>
                      <p className="ma-expand-label">Appointment ID</p>
                      <p className="ma-expand-val">{appt._id}</p>
                    </div>
                    <div>
                      <p className="ma-expand-label">Reason / Symptoms</p>
                      <p className="ma-expand-val">{appt.reason || appt.symptoms?.join(", ") || "General Consultation"}</p>
                    </div>
                    <div>
                      <p className="ma-expand-label">Doctor ID</p>
                      <p className="ma-expand-val">{appt.doctor_id}</p>
                    </div>
                    {(appt.status === "cancelled" || appt.status === "cancel") && (appt.cancel_reason || appt.cancellation_reason) && (
                      <div className="ma-cancellation-block">
                        <p className="ma-cancellation-label">Cancellation Reason</p>
                        <p className="ma-cancellation-text">{appt.cancel_reason || appt.cancellation_reason}</p>
                      </div>
                    )}
                  </div>
                  {(appt.status === "booked" || appt.status === "confirmed") && (
                    <div className="ma-expand-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                       <button 
                         className="ma-cancel-btn" 
                         onClick={() => handleCancel(appt._id)}
                       >
                         Cancel Appointment
                       </button>
                    </div>
                  )}
                  {appt.status === "completed" && (
                    <div className="ma-expand-actions" style={{ marginTop: '15px' }}>
                      <button 
                        className={`ma-review-btn ${appt.reviewed ? "ma-reviewed" : "ma-unreviewed"}`} 
                        onClick={() => handleOpenReview(appt._id, appt.reviewed)}
                      >
                        {appt.reviewed ? "👁️ View Review" : "⭐ Add Review"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        <div className="ma-legend">
          <span className="ma-legend-title">Status Legend</span>
          <div className="ma-legend-grid">
            <div className="ma-legend-item">
              <div className="ma-legend-dot" style={{ background: '#10b981' }} />
              Confirmed
            </div>
            <div className="ma-legend-item">
              <div className="ma-legend-dot" style={{ background: '#f59e0b' }} />
              Pending
            </div>
            <div className="ma-legend-item">
              <div className="ma-legend-dot" style={{ background: '#3b82f6' }} />
              Booked
            </div>
            <div className="ma-legend-item">
              <div className="ma-legend-dot" style={{ background: '#8b5cf6' }} />
              Completed
            </div>
            <div className="ma-legend-item">
              <div className="ma-legend-dot" style={{ background: '#ef4444' }} />
              Cancelled
            </div>
          </div>
        </div>
      </div>
        <ReviewModal
          key={`${reviewModal.appointmentId}-${reviewModal.existingReview ? 'view' : 'add'}`}
          isOpen={reviewModal.isOpen}
          onClose={() => setReviewModal({ isOpen: false, appointmentId: "", existingReview: undefined })}
          appointmentId={reviewModal.appointmentId}
          existingReview={reviewModal.existingReview}
          onSuccess={handleReviewSuccess}
        />
      </div>
    </PatientLayout>
  )
}

export default MyAppointments
