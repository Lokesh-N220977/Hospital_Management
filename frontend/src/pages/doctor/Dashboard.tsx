import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { 
  Users, Calendar, CheckCircle, Clock, ArrowRight, 
  FileText, Activity, Star
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const stats = [
  { title: "Appointments Today", value: "12", icon: <Calendar size={24} />, color: "#0dcb6e", trend: "+2 now" },
  { title: "Upcoming / Pending",  value: "8",  icon: <Clock size={24} />,    color: "#f59e0b", trend: "Next in 15m" },
  { title: "Completed Today",    value: "4",  icon: <CheckCircle size={24} />,color: "#10b981", trend: "View logs" },
  { title: "Total Patients",     value: "1,432", icon: <Users size={24} />,  color: "#8b5cf6", trend: "+12 week" },
]

const recentAppointments = [
  { id: 1, patient: "John Doe", time: "10:00 AM", type: "Follow-up", status: "Confirmed", initials: "JD", color: "#0dcb6e" },
  { id: 2, patient: "Jane Smith", time: "10:45 AM", type: "First Visit", status: "Pending", initials: "JS", color: "#f59e0b" },
  { id: 3, patient: "Robert Brown", time: "11:30 AM", type: "Check-up", status: "In-Progress", initials: "RB", color: "#10b981" },
  { id: 4, patient: "Alice Cooper", time: "01:15 PM", type: "X-Ray Review", status: "Review", initials: "AC", color: "#8b5cf6" },
]

function DoctorDashboard() {
  const navigate = useNavigate()

  return (
    <DoctorLayout>
      <div className="pd-page">
        {/* Welcome Banner */}
        <div className="pd-welcome-banner" style={{ background: 'linear-gradient(135deg, #052c1e, #0dcb6e)' }}>
          <div className="pd-welcome-content">
            <div className="pd-welcome-text">
              <h1 className="pd-welcome-title">Welcome, Dr. Sarah! 👋</h1>
              <p className="pd-welcome-sub">You have 12 appointments scheduled for today. Your next consultation starts in 15 minutes.</p>
            </div>
            <div className="pd-welcome-metrics">
              <div className="pd-metric-item">
                <span className="pd-metric-val">98%</span>
                <span className="pd-metric-label">Patient Rating</span>
              </div>
              <div className="pd-metric-sep" />
              <div className="pd-metric-item">
                <span className="pd-metric-val">1.2k</span>
                <span className="pd-metric-label">Consultations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="pd-stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="pd-stat-card">
              <div className="pd-stat-icon-wrap" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="pd-stat-info">
                <h3 className="pd-stat-value">{stat.value}</h3>
                <p className="pd-stat-label">{stat.title}</p>
                <span className="pd-stat-trend" style={{ color: stat.color }}>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pd-main-grid">
          {/* Recent Appointments */}
          <div className="pd-card pd-card--main">
            <div className="pd-card-header">
              <div className="pd-card-title-wrap">
                <Calendar className="pd-card-icon" />
                <h2 className="pd-card-title">Next Appointments</h2>
              </div>
              <button 
                className="pd-card-action" 
                onClick={() => navigate("/doctor/today-appointments")}
              >
                View Full List <ArrowRight size={14} />
              </button>
            </div>

            <div className="pd-appt-list">
              {recentAppointments.map(appt => (
                <div key={appt.id} className="pd-appt-item">
                  <div className="pd-appt-patient">
                    <div className="pd-appt-avatar" style={{ backgroundColor: `${appt.color}15`, color: appt.color }}>
                      {appt.initials}
                    </div>
                    <div className="pd-appt-info">
                      <h4 className="pd-appt-name">{appt.patient}</h4>
                      <p className="pd-appt-meta">{appt.type}</p>
                    </div>
                  </div>
                  <div className="pd-appt-time-wrap">
                    <Clock size={14} />
                    <span>{appt.time}</span>
                  </div>
                  <div className={`pd-appt-status pd-appt-status--${appt.status.toLowerCase()}`}>
                    {appt.status}
                  </div>
                  <button 
                    className="pd-appt-btn" 
                    onClick={() => navigate(`/doctor/consultation/${appt.id}`)}
                  >
                    Start <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Notes */}
          <div className="pd-side-stack">
            <div className="pd-card">
              <h2 className="pd-card-title mb-4">Quick Actions</h2>
              <div className="pd-quick-grid">
                {[
                  { label: "Add Patient", icon: <Users size={18} />, color: "#0dcb6e", path: "/doctor/patients" },
                  { label: "New Report",  icon: <FileText size={18} />, color: "#10b981", path: "/doctor/today-appointments" },
                  { label: "Schedule",    icon: <Calendar size={18} />, color: "#f59e0b", path: "/doctor/schedule" },
                  { label: "Vitals Check", icon: <Activity size={18} />, color: "#ef4444", path: "/doctor/today-appointments" },
                ].map((action, i) => (
                  <button key={i} className="pd-quick-btn" onClick={() => navigate(action.path)}>
                    <span className="pd-quick-icon" style={{ backgroundColor: `${action.color}15`, color: action.color }}>
                      {action.icon}
                    </span>
                    <span className="pd-quick-label">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pd-card pd-card--premium">
              <Star className="pd-premium-star" />
              <h3>Premium Support</h3>
              <p>Get priority assistance from our 24/7 technical team.</p>
              <button className="pd-premium-btn">Contact Support</button>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}

export default DoctorDashboard;