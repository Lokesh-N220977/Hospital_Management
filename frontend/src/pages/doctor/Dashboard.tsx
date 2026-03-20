import { useState, useEffect } from "react"
import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { 
  Users, Calendar, Clock, ArrowRight, 
  FileText, Activity, Star, Loader2, Lock, ShieldAlert, CheckCircle, Key
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getPortalProfile, getDoctorAppointments, getIssuedPrescriptions } from "../../services/doctorService"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"

function DoctorDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescCount, setPrescCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Password Modal State
  const [showPwdModal, setShowPwdModal] = useState(false)
  const [pwdData, setPwdData] = useState({ old: '', new: '', confirm: '' })
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)

  useEffect(() => {
    if (user?.must_change_password) {
      setShowPwdModal(true)
    }
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const profileData = await getPortalProfile()
        setProfile(profileData)
        
        if (profileData && profileData.doctor_id) {
          const [appts, prescs] = await Promise.all([
            getDoctorAppointments(profileData.doctor_id),
            getIssuedPrescriptions(profileData.doctor_id)
          ])
          setAppointments(Array.isArray(appts) ? appts : [])
          setPrescCount(Array.isArray(prescs) ? prescs.length : 0)
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError('')
    if (pwdData.new !== pwdData.confirm) {
      setPwdError('New passwords do not match')
      return
    }
    if (pwdData.new.length < 6) {
      setPwdError('Password must be at least 6 characters')
      return
    }
    setPwdLoading(true)
    try {
      await api.put('/auth/change-password', {
        old_password: pwdData.old,
        new_password: pwdData.new
      })
      setPwdSuccess(true)
      setTimeout(() => {
        logout()
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      setPwdError(err.response?.data?.detail || 'Failed to update password')
    } finally {
      setPwdLoading(false)
    }
  }

  // Calculate Stats
  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.date === today && a.status !== 'cancelled' && a.status !== 'completed')
  const upcomingCount = appointments.filter(a => (a.date > today || (a.date === today && a.status === 'booked')) && a.status !== 'cancelled' && a.status !== 'completed').length
  
  const stats = [
    { title: "Appointments Today", value: todayAppts.length.toString(), icon: <Calendar size={24} />, color: "#0dcb6e", trend: "+2 now" },
    { title: "Upcoming / Pending",  value: upcomingCount.toString(),  icon: <Clock size={24} />,    color: "#f59e0b", trend: "Next in 15m" },
    { title: "Prescriptions",    value: prescCount.toString(),  icon: <FileText size={24} />,color: "#3b82f6", trend: "Issued" },
    { title: "Total Patients",     value: "1,248", icon: <Users size={24} />,  color: "#8b5cf6", trend: "+12 week" },
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

        {/* Forced Password Change Modal */}
        {showPwdModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(5, 44, 30, 0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}>
            <div className="pd-card" style={{ maxWidth: '450px', width: '90%', padding: '40px' }}>
              {pwdSuccess ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle size={32} />
                  </div>
                  <h2>Password Updated!</h2>
                  <p style={{ color: '#64748b' }}>Your account is now secure. Accessing dashboard...</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#fff9eb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldAlert size={24} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', marginBottom: '2px' }}>Security Required</h2>
                      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Please update your temporary password.</p>
                    </div>
                  </div>

                  {pwdError && (
                    <div style={{ padding: '10px', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px' }}>
                      {pwdError}
                    </div>
                  )}

                  <form onSubmit={handlePwdSubmit}>
                    <div className="ad-field" style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Current Temp Password</label>
                      <input 
                        type="password" 
                        className="ad-input" 
                        required 
                        value={pwdData.old}
                        onChange={e => setPwdData({...pwdData, old: e.target.value})}
                      />
                    </div>
                    <div className="ad-field" style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>New Password</label>
                      <input 
                        type="password" 
                        className="ad-input" 
                        required 
                        value={pwdData.new}
                        onChange={e => setPwdData({...pwdData, new: e.target.value})}
                      />
                    </div>
                    <div className="ad-field" style={{ marginBottom: '25px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Confirm New Password</label>
                      <input 
                        type="password" 
                        className="ad-input" 
                        required 
                        value={pwdData.confirm}
                        onChange={e => setPwdData({...pwdData, confirm: e.target.value})}
                      />
                    </div>
                    <button type="submit" disabled={pwdLoading} className="ad-btn-duo" style={{ width: '100%', justifyContent: 'center', background: '#0dcb6e' }}>
                      {pwdLoading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                      <span>Update & Unlock Account</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}

export default DoctorDashboard;