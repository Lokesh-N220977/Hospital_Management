
import { useState, useEffect } from "react"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  CalendarCheck,
  History,
  Bell,
  TrendingUp,
  Heart,
  Activity,
  Thermometer,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

const statsData = [
  {
    icon: CalendarCheck,
    label: "Upcoming Appointment",
    value: "Nov 24, 2024",
    sub: "10:00 AM with Dr. Rahul Sharma",
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    icon: History,
    label: "Past Visits",
    value: "12",
    sub: "Last: Oct 15, 2024",
    color: "#10b981",
    bg: "#ecfdf5",
  },
  {
    icon: Bell,
    label: "Notifications",
    value: "3 New",
    sub: "View all updates",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
]

const upcomingAppointments = [
  {
    doctor: "Dr. Rahul Sharma",
    specialty: "Cardiology",
    date: "Nov 24, 2024",
    time: "10:00 AM",
    status: "confirmed",
    avatar: "RS",
  },
  {
    doctor: "Dr. Priya Mehta",
    specialty: "Dermatology",
    date: "Dec 2, 2024",
    time: "2:30 PM",
    status: "pending",
    avatar: "PM",
  },
]

const recentActivities = [
  { text: "Lab report uploaded by Dr. Sharma", time: "2 hours ago", type: "report" },
  { text: "Appointment confirmed for Nov 24", time: "Yesterday", type: "appointment" },
  { text: "Prescription renewed", time: "3 days ago", type: "prescription" },
  { text: "Blood test results available", time: "5 days ago", type: "report" },
]

const healthMetrics = [
  { label: "Blood Pressure", value: "120/80", unit: "mmHg", icon: Activity, color: "#3b82f6", status: "normal" },
  { label: "Heart Rate", value: "72", unit: "bpm", icon: Heart, color: "#ef4444", status: "normal" },
  { label: "Temperature", value: "98.6", unit: "°F", icon: Thermometer, color: "#f59e0b", status: "normal" },
  { label: "Weight", value: "68", unit: "kg", icon: TrendingUp, color: "#10b981", status: "normal" },
]

function Dashboard() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <PatientLayout>
      <div className={`pd-page-v${visible ? " pd-visible" : ""}`}>

        {/* Welcome Banner */}
        <div className="pd-welcome-banner">
          <div className="pd-welcome-content">
            <div className="pd-welcome-text">
              <h2 className="pd-welcome-title">Welcome back, <span>John! 👋</span></h2>
              <p className="pd-welcome-sub">Here's your health overview for today, {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
            <div className="pd-welcome-graphic">
              <div className="pd-pulse-ring" />
              <Heart size={32} className="pd-pulse-icon" />
            </div>
          </div>
          <div className="pd-banner-shapes">
            <div className="pd-shape pd-shape-1" />
            <div className="pd-shape pd-shape-2" />
            <div className="pd-shape pd-shape-3" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="pd-stats-grid">
          {statsData.map(({ icon: Icon, label, value, sub, color, bg }, i) => (
            <div
              className="pd-stat-card"
              key={label}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="pd-stat-icon-wrap" style={{ background: bg }}>
                <Icon size={26} style={{ color }} />
              </div>
              <div className="pd-stat-body">
                <p className="pd-stat-label">{label}</p>
                <h3 className="pd-stat-value" style={{ color }}>{value}</h3>
                <p className="pd-stat-sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="pd-main-grid">

          {/* Upcoming Appointments */}
          <div className="pd-card">
            <div className="pd-card-header">
              <h3 className="pd-card-title">
                <CalendarCheck size={18} /> Upcoming Appointments
              </h3>
              <a href="/patient/appointments" className="pd-card-link">View all <ChevronRight size={14} /></a>
            </div>
            <div className="pd-appointments-list">
              {upcomingAppointments.map((appt, i) => (
                <div className="pd-appt-item" key={i}>
                  <div className="pd-appt-avatar">{appt.avatar}</div>
                  <div className="pd-appt-info">
                    <p className="pd-appt-doctor">{appt.doctor}</p>
                    <p className="pd-appt-specialty">{appt.specialty}</p>
                  </div>
                  <div className="pd-appt-time">
                    <p className="pd-appt-date">{appt.date}</p>
                    <p className="pd-appt-clock"><Clock size={12} /> {appt.time}</p>
                  </div>
                  <span className={`pd-appt-status pd-status-${appt.status}`}>
                    {appt.status === "confirmed" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
            <a href="/patient/book-appointment" className="pd-book-btn">
              + Book New Appointment
            </a>
          </div>

          {/* Health Metrics */}
          <div className="pd-card">
            <div className="pd-card-header">
              <h3 className="pd-card-title">
                <Activity size={18} /> Health Metrics
              </h3>
              <span className="pd-last-updated">Last checked: Today</span>
            </div>
            <div className="pd-metrics-grid">
              {healthMetrics.map(({ label, value, unit, icon: Icon, color, status }) => (
                <div className="pd-metric-card" key={label}>
                  <div className="pd-metric-icon" style={{ background: `${color}18`, color }}>
                    <Icon size={20} />
                  </div>
                  <p className="pd-metric-label">{label}</p>
                  <p className="pd-metric-value">
                    {value} <span className="pd-metric-unit">{unit}</span>
                  </p>
                  <span className={`pd-metric-status pd-s-${status}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="pd-card">
            <div className="pd-card-header">
              <h3 className="pd-card-title">
                <Bell size={18} /> Recent Activity
              </h3>
              <a href="/patient/notifications" className="pd-card-link">See all <ChevronRight size={14} /></a>
            </div>
            <ul className="pd-activity-list">
              {recentActivities.map((item, i) => (
                <li className="pd-activity-item" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className={`pd-activity-dot pd-dot-${item.type}`} />
                  <div className="pd-activity-body">
                    <p className="pd-activity-text">{item.text}</p>
                    <p className="pd-activity-time">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Health Summary / Progress */}
          <div className="pd-card pd-health-chart-card">
            <div className="pd-card-header">
              <h3 className="pd-card-title">
                <TrendingUp size={18} /> Health Summary
              </h3>
            </div>
            <p className="pd-chart-sub">Recent reports and upcoming checkups are listed here.</p>
            <div className="pd-progress-bars">
              {[
                { label: "Hydration Goal", val: 78, color: "#3b82f6" },
                { label: "Exercise Target", val: 55, color: "#10b981" },
                { label: "Sleep Quality", val: 85, color: "#8b5cf6" },
                { label: "Medication Adherence", val: 92, color: "#f59e0b" },
              ].map(({ label, val, color }) => (
                <div className="pd-progress-item" key={label}>
                  <div className="pd-progress-header">
                    <span className="pd-progress-label">{label}</span>
                    <span className="pd-progress-val">{val}%</span>
                  </div>
                  <div className="pd-progress-track">
                    <div
                      className="pd-progress-fill"
                      style={{ width: `${val}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PatientLayout>
  )
}

export default Dashboard