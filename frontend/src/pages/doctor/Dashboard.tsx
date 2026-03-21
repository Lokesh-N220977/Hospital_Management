import { useState, useEffect } from "react"
import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { 
  Users, Calendar, Clock, ArrowRight, 
  FileText, Activity, Loader2
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getPortalProfile, getDoctorAppointments, getIssuedPrescriptions, getDoctorPatients } from "../../services/doctorService"

function DoctorDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescCount, setPrescCount] = useState(0)
  const [patientCount, setPatientCount] = useState(0)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const profileData = await getPortalProfile()
        setProfile(profileData)
        
        if (profileData && profileData.doctor_id) {
          const [appts, prescs, patientsRes] = await Promise.all([
            getDoctorAppointments(),
            getIssuedPrescriptions(profileData.doctor_id),
            getDoctorPatients(profileData.doctor_id)
          ])
          setAppointments(Array.isArray(appts) ? appts : [])
          setPrescCount(Array.isArray(prescs) ? prescs.length : 0)
          
          const pList = patientsRes?.success ? patientsRes.data : (Array.isArray(patientsRes) ? patientsRes : []);
          setPatientCount(pList.length);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])


  // Calculate Stats
  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.date === today && a.status !== 'cancelled' && a.status !== 'completed')
  const upcomingCount = appointments.filter(a => (a.date > today || (a.date === today && a.status === 'booked')) && a.status !== 'cancelled' && a.status !== 'completed').length
  
  const stats = [
    { title: "Appointments Today", value: todayAppts.length.toString(), icon: <Calendar size={24} />, color: "#0dcb6e" },
    { title: "Upcoming / Pending",  value: upcomingCount.toString(),  icon: <Clock size={24} />,    color: "#f59e0b" },
    { title: "Prescriptions",    value: prescCount.toString(),  icon: <FileText size={24} />,color: "#3b82f6" },
    { title: "Total Patients",     value: patientCount.toLocaleString(), icon: <Users size={24} />,  color: "#8b5cf6" },
  ]

  const recentAppointments = appointments.slice(0, 4)

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
        {/* Welcome Banner */}
        <div className="pd-welcome-banner" style={{ background: 'linear-gradient(135deg, #052c1e, #0dcb6e)' }}>
          <div className="pd-welcome-content">
            <div className="pd-welcome-text">
              <h1 className="pd-welcome-title">Welcome, {profile?.name || "Doctor"}! 👋</h1>
              <p className="pd-welcome-sub">{profile?.specialization || "Healthcare Professional"} • You have {stats[0].value} appointments scheduled for today.</p>
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
              <button className="pd-card-action" onClick={() => navigate("/doctor/appointments")}>
                View Full List <ArrowRight size={14} />
              </button>
            </div>

            <div className="pd-appt-list">
              {recentAppointments.length > 0 ? recentAppointments.map(appt => {
                const patientName = appt.patient_name || appt.patient || "Patient";
                return (
                  <div key={appt._id} className="pd-appt-item">
                    <div className="pd-appt-patient">
                      <div className="pd-appt-avatar" style={{ backgroundColor: '#0dcb6e15', color: '#0dcb6e' }}>
                        {patientName[0]}
                      </div>
                      <div className="pd-appt-info">
                        <h4 className="pd-appt-name">{patientName}</h4>
                        <p className="pd-appt-meta">{appt.type}</p>
                      </div>
                    </div>
                    <div className="pd-appt-time-wrap">
                      <Clock size={14} />
                      <span>{appt.time}</span>
                    </div>
                    <div className={`pd-appt-status pd-appt-status--${(appt.status || 'booked').toLowerCase()}`}>
                      {appt.status}
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <Calendar size={32} style={{ opacity: 0.3, marginBottom: '10px' }} />
                  <p>No upcoming appointments found.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pd-side-stack">
            <div className="pd-card">
              <h2 className="pd-card-title mb-4">Quick Actions</h2>
              <div className="pd-quick-grid">
                {[
                  { label: "Patients", icon: <Users size={18} />, color: "#0dcb6e", path: "/doctor/patients" },
                  { label: "Appointments",  icon: <FileText size={18} />, color: "#10b981", path: "/doctor/appointments" },
                  { label: "My Schedule",    icon: <Calendar size={18} />, color: "#f59e0b", path: "/doctor/my-schedule" },
                  { label: "Manage Leaves", icon: <Activity size={18} />, color: "#ef4444", path: "/doctor/leaves" },
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
          </div>
        </div>

      </div>
    </DoctorLayout>
  )
}

export default DoctorDashboard;