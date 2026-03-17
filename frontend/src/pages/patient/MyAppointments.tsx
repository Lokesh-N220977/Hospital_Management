import { useState } from "react"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  CalendarCheck, Clock, CheckCircle2,
  AlertCircle, XCircle, ChevronDown,
  Search, Filter, Video, MapPin
} from "lucide-react"

const allAppointments = [
  {
    id: "APT001", doctor: "Dr. Rahul Sharma", specialty: "Cardiology",
    date: "Nov 24, 2024", time: "10:00 AM", status: "confirmed",
    type: "in-person", avatar: "RS", reason: "Chest pain checkup",
    location: "Block A, Room 204", color: "#3b82f6",
  },
  {
    id: "APT002", doctor: "Dr. Priya Mehta", specialty: "Dermatology",
    date: "Dec 2, 2024", time: "2:30 PM", status: "pending",
    type: "online", avatar: "PM", reason: "Skin rash follow-up",
    location: "Video Call", color: "#8b5cf6",
  },
  {
    id: "APT003", doctor: "Dr. Anil Kumar", specialty: "Orthopedics",
    date: "Oct 15, 2024", time: "11:00 AM", status: "completed",
    type: "in-person", avatar: "AK", reason: "Knee pain",
    location: "Block C, Room 301", color: "#10b981",
  },
  {
    id: "APT004", doctor: "Dr. Sneha Patel", specialty: "Neurology",
    date: "Sep 30, 2024", time: "3:00 PM", status: "cancelled",
    type: "in-person", avatar: "SP", reason: "Headache evaluation",
    location: "Block A, Room 108", color: "#ef4444",
  },
  {
    id: "APT005", doctor: "Dr. Kiran Desai", specialty: "Pediatrics",
    date: "Nov 10, 2024", time: "9:30 AM", status: "completed",
    type: "online", avatar: "KD", reason: "General checkup",
    location: "Video Call", color: "#f59e0b",
  },
]

const statusIcons: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle2 size={14} />,
  pending: <AlertCircle size={14} />,
  completed: <CheckCircle2 size={14} />,
  cancelled: <XCircle size={14} />,
}

const filters = ["All", "Confirmed", "Pending", "Completed", "Cancelled"]

function MyAppointments() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = allAppointments.filter(a => {
    const matchFilter = activeFilter === "All" || a.status === activeFilter.toLowerCase()
    const matchSearch = a.doctor.toLowerCase().includes(search.toLowerCase()) ||
      a.specialty.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <PatientLayout>
      <div className="ma-page">

        {/* Header */}
        <div className="ma-header">
          <div>
            <h2 className="ma-title">My Appointments</h2>
            <p className="ma-sub">Manage and track all your appointments</p>
          </div>
          <a href="/patient/book-appointment" className="ma-book-btn">
            + Book New
          </a>
        </div>

        {/* Summary Chips */}
        <div className="ma-summary-row">
          {[
            { label: "Total", count: allAppointments.length, color: "#3b82f6" },
            { label: "Upcoming", count: allAppointments.filter(a => a.status === "confirmed" || a.status === "pending").length, color: "#10b981" },
            { label: "Completed", count: allAppointments.filter(a => a.status === "completed").length, color: "#8b5cf6" },
            { label: "Cancelled", count: allAppointments.filter(a => a.status === "cancelled").length, color: "#ef4444" },
          ].map(({ label, count, color }) => (
            <div className="ma-summary-chip" key={label} style={{ borderLeft: `4px solid ${color}` }}>
              <span className="ma-chip-count" style={{ color }}>{count}</span>
              <span className="ma-chip-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="ma-controls">
          <div className="ma-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search doctor or specialty..."
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

        {/* Appointment Cards */}
        <div className="ma-list">
          {filtered.length === 0 && (
            <div className="ma-empty">
              <CalendarCheck size={48} />
              <p>No appointments found</p>
            </div>
          )}
          {filtered.map(appt => (
            <div key={appt.id} className="ma-card">
              <div
                className="ma-card-accent"
                style={{ background: appt.color }}
              />
              <div className="ma-card-body">
                <div className="ma-card-top">
                  <div className="ma-doc-avatar" style={{ background: appt.color }}>
                    {appt.avatar}
                  </div>
                  <div className="ma-doc-details">
                    <h4 className="ma-doc-name">{appt.doctor}</h4>
                    <p className="ma-doc-spec">{appt.specialty}</p>
                  </div>
                  <div className="ma-appt-datetime">
                    <p className="ma-appt-date">
                      <CalendarCheck size={13} /> {appt.date}
                    </p>
                    <p className="ma-appt-time">
                      <Clock size={13} /> {appt.time}
                    </p>
                  </div>
                  <span className={`ma-status-badge ma-status-${appt.status}`}>
                    {statusIcons[appt.status]} {appt.status}
                  </span>
                  <button
                    className="ma-expand-btn"
                    onClick={() => setExpanded(expanded === appt.id ? null : appt.id)}
                  >
                    <ChevronDown
                      size={18}
                      style={{ transform: expanded === appt.id ? "rotate(180deg)" : "none", transition: "0.3s" }}
                    />
                  </button>
                </div>

                {/* Expanded Details */}
                <div className={`ma-card-expand${expanded === appt.id ? " ma-card-expand-open" : ""}`}>
                  <div className="ma-expand-grid">
                    <div>
                      <p className="ma-expand-label">Appointment ID</p>
                      <p className="ma-expand-val">{appt.id}</p>
                    </div>
                    <div>
                      <p className="ma-expand-label">Reason</p>
                      <p className="ma-expand-val">{appt.reason}</p>
                    </div>
                    <div>
                      <p className="ma-expand-label">Type</p>
                      <p className="ma-expand-val">
                        {appt.type === "online"
                          ? <><Video size={13} /> Online</>
                          : <><MapPin size={13} /> In-Person</>}
                      </p>
                    </div>
                    <div>
                      <p className="ma-expand-label">Location</p>
                      <p className="ma-expand-val">{appt.location}</p>
                    </div>
                  </div>
                  {(appt.status === "confirmed" || appt.status === "pending") && (
                    <div className="ma-expand-actions">
                      <button className="ma-action-btn ma-reschedule">Reschedule</button>
                      <button className="ma-action-btn ma-cancel">Cancel</button>
                      {appt.type === "online" && (
                        <button className="ma-action-btn ma-join"><Video size={14} /> Join Call</button>
                      )}
                    </div>
                  )}
                  {appt.status === "completed" && (
                    <div className="ma-expand-actions">
                      <button className="ma-action-btn ma-view-report">View Report</button>
                      <button className="ma-action-btn ma-rebook">Rebook</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PatientLayout>
  )
}

export default MyAppointments