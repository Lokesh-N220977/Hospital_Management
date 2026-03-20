import { useState, useEffect } from "react"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  CalendarCheck,
  History,
  Bell,
  Heart,
  ChevronRight,
  Clock,
  AlertCircle,
  XCircle,
  User,
  PlusCircle
} from "lucide-react"
import { appointmentService } from "../../services/appointment.service"

function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, patientsRes] = await Promise.all([
          appointmentService.getDashboardData(),
          appointmentService.getMyPatients()
        ]);
        setData(dashRes);
        setPatients(patientsRes);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetchDashboard();
  }, [])

  const handleCancel = async (id: string) => {
    if (window.confirm("Cancel this appointment?")) {
      try {
        await appointmentService.cancelAppointment(id);
        const res = await appointmentService.getDashboardData();
        setData(res);
      } catch (err) {
        alert("Failed to cancel.");
      }
    }
  }

  if (loading) return <PatientLayout><div style={{ padding: '100px', textAlign: 'center' }}>Loading Your Dashboard...</div></PatientLayout>;

  const stats = data?.stats || { total: 0, upcoming: 0, cancelled: 0 };
  const upcoming = data?.upcoming || [];
  const recent = data?.recent || [];

  const displayStats = [
    {
       icon: CalendarCheck,
       label: "Total Bookings",
       value: stats.total,
       sub: "Lifetime appointments",
       color: "#3b82f6",
       bg: "#eff6ff",
    },
    {
       icon: Clock,
       label: "Upcoming",
       value: stats.upcoming,
       sub: upcoming.length > 0 ? `Next: ${upcoming[0].date}` : "No upcoming visits",
       color: "#10b981",
       bg: "#ecfdf5",
    },
    {
       icon: AlertCircle,
       label: "Cancelled",
       value: stats.cancelled,
       sub: "Review history",
       color: "#ef4444",
       bg: "#fef2f2",
    }
  ]

  const getInitials = (name: string) => {
    return (name || "D").split(" ").map(n => n[0]).join("").toUpperCase();
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <PatientLayout>
      <div className={`pd-page-v${visible ? " pd-visible" : ""}`}>

        {/* Welcome Banner */}
        <div className="pd-welcome-banner">
          <div className="pd-welcome-content">
            <div className="pd-welcome-text">
              <h2 className="pd-welcome-title">Welcome back, <span>{user.name || "User"}! 👋</span></h2>
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

        {/* Cancellation Alerts */}
        {data?.alerts && data.alerts.length > 0 && (
          <div className="pd-alerts-section" style={{ marginBottom: '24px' }}>
            {data.alerts.map((alert: any) => (
              <div key={alert._id} className="pd-alert-banner" style={{ 
                background: '#fff1f2', 
                borderLeft: '5px solid #e11d48', 
                padding: '16px', 
                borderRadius: '8px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'start',
                gap: '12px'
              }}>
                <AlertCircle size={24} color="#e11d48" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#9f1239', margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>
                    Appointment Cancelled by Provider
                  </h4>
                  <p style={{ color: '#4b5563', margin: 0, fontSize: '0.9rem' }}>
                    Your visit with <strong>{alert.doctor_name}</strong> on <strong>{alert.date}</strong> at <strong>{alert.time}</strong> has been cancelled.
                  </p>
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px 12px', 
                    background: 'rgba(225, 29, 72, 0.05)', 
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#be123c',
                    fontStyle: 'italic',
                    border: '1px solid rgba(225, 29, 72, 0.1)'
                  }}>
                    <strong>Reason:</strong> {alert.cancellation_reason || "Scheduled administrative leave."}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="pd-stats-grid">
          {displayStats.map(({ icon: Icon, label, value, sub, color, bg }, i) => (
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
              {upcoming.length > 0 ? upcoming.map((appt: any) => (
                <div className="pd-appt-item" key={appt._id}>
                  <div className="pd-appt-avatar" style={{ background: '#eef2ff', color: '#4f46e5' }}>{getInitials(appt.doctor_name)}</div>
                  <div className="pd-appt-info">
                    <p className="pd-appt-doctor">{appt.doctor_name}</p>
                    <p className="pd-appt-specialty">{appt.specialization}</p>
                  </div>
                  <div className="pd-appt-time">
                    <p className="pd-appt-date">{appt.date}</p>
                    <p className="pd-appt-clock"><Clock size={12} /> {appt.time}</p>
                  </div>
                  <button 
                    onClick={() => handleCancel(appt._id)}
                    className="pd-cancel-mini-btn"
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px', borderRadius: '4px' }}
                    title="Cancel Appointment"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                   No upcoming appointments.
                </div>
              )}
            </div>
            <a href="/patient/book-appointment" className="pd-book-btn">
              + Book New Appointment
            </a>
          </div>

          {/* Recent Activity */}
          <div className="pd-card">
            <div className="pd-card-header">
              <h3 className="pd-card-title">
                <Bell size={18} /> Recent History
              </h3>
              <a href="/patient/appointments" className="pd-card-link">See all <ChevronRight size={14} /></a>
            </div>
            <ul className="pd-activity-list">
              {recent.length > 0 ? recent.map((item: any, i: number) => (
                <li className="pd-activity-item" key={item._id} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className={`pd-activity-dot pd-dot-${item.status === 'cancelled' ? 'cancelled' : 'completed'}`} style={{ backgroundColor: item.status === 'cancelled' ? '#ef4444' : '#10b981' }} />
                  <div className="pd-activity-body">
                    <p className="pd-activity-text">
                       Appointment with {item.doctor_name} was {item.status}
                    </p>
                    {item.status === 'cancelled' && item.cancellation_reason && (
                      <p style={{ fontSize: '0.8rem', color: '#be123c', marginTop: '2px', fontWeight: 500 }}>
                        Note: {item.cancellation_reason}
                      </p>
                    )}
                    <p className="pd-activity-time">{item.date} at {item.time}</p>
                  </div>
                </li>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                  No recent activity.
                </div>
              )}
            </ul>
          </div>

          {/* Family Profiles Card */}
          <div className="pd-card">
            <div className="pd-card-header">
              <h3 className="pd-card-title">
                <User size={18} /> My Family Profiles
              </h3>
            </div>
            <div className="pd-family-list" style={{ padding: '0 20px 20px' }}>
              {patients.length > 0 ? patients.map((p, i) => (
                <div key={p._id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px 0',
                  borderBottom: i === patients.length - 1 ? 'none' : '1px solid #f1f5f9'
                }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: p.created_by === 'self' ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: p.created_by === 'self' ? '#166534' : '#64748b' }}>
                    {getInitials(p.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{p.name}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{p.created_by === 'self' ? 'Primary' : 'Family Member'}</p>
                  </div>
                </div>
              )) : (
                <p style={{ fontSize: '13px', color: '#999', textAlign: 'center' }}>No profiles found.</p>
              )}
              <button 
                className="pd-add-member-btn"
                onClick={() => window.location.href = '/patient/profile'}
                style={{ 
                  width: '100%', 
                  marginTop: '10px', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: '1px dashed #cbd5e1', 
                  background: 'none', 
                  color: '#64748b', 
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <PlusCircle size={14} /> Add Family Member
              </button>
            </div>
          </div>

        </div>
      </div>
    </PatientLayout>
  )
}

export default Dashboard