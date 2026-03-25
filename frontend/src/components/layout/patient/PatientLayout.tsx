import { useState, useEffect } from "react"
import PatientSidebar from "./PatientSidebar"
import PatientNavbar from "./PatientNavbar"
import { useTheme } from "../../../hooks/useTheme"
import { useAuth } from "../../../context/AuthContext"
import { ShieldAlert, CheckCircle, Loader2, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "../../../services/api"

type Props = {
  children: React.ReactNode
}

function PatientLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [prefKey, setPrefKey] = useState(0)
  const { theme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Forced Password State
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
    const handlePrefChange = () => setPrefKey(prev => prev + 1)
    window.addEventListener('patient-prefs-changed', handlePrefChange)
    window.addEventListener('theme-change', handlePrefChange)
    return () => {
      window.removeEventListener('patient-prefs-changed', handlePrefChange)
      window.removeEventListener('theme-change', handlePrefChange)
    }
  }, [])

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError('')
    if (pwdData.new !== pwdData.confirm) return setPwdError('New passwords do not match')
    if (pwdData.new.length < 6) return setPwdError('Password must be at least 6 characters')
    
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

  const fontSize = localStorage.getItem('patient-font-size') || 'Normal'
  const fontClass = `font-size-${fontSize.toLowerCase().replace(' ', '-')}`
  const themeClass = theme === 'dark' ? 'dark' : ''

  return (
    <div key={prefKey} className={`pl-wrapper patient-portal ${fontClass} ${themeClass}`.trim()}>
      <PatientSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="pl-main">
        <PatientNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="pl-content" style={{ opacity: showPwdModal ? 0.3 : 1, filter: showPwdModal ? 'blur(4px)' : 'none', pointerEvents: showPwdModal ? 'none' : 'auto', transition: 'all 0.4s' }}>
          {children}
        </main>
      </div>

      {showPwdModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
        }}>
          <div className="pd-premium-modal" style={{ maxWidth: '440px', padding: '45px', textAlign: 'center', background: 'white', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
            {pwdSuccess ? (
              <div style={{ padding: '20px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(22, 163, 74, 0.15)' }}>
                  <CheckCircle size={36} />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Security Updated!</h2>
                <p style={{ color: '#64748b', fontWeight: 600 }}>Your account is now secure. Re-authenticating...</p>
              </div>
            ) : (
              <>
                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #fde68a' }}>
                  <ShieldAlert size={30} />
                </div>
                
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.5px' }}>Action Required</h2>
                <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '32px', fontWeight: 500 }}>This is your first login. For your security, please update your temporary password.</p>

                {pwdError && (
                  <div style={{ padding: '12px 16px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '24px', fontWeight: 700, border: '1px solid #fee2e2' }}>
                    {pwdError}
                  </div>
                )}

                <form onSubmit={handlePwdSubmit} style={{ textAlign: 'left' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Temporary Password</label>
                    <input 
                      type="password" 
                      className="pd-input-premium" 
                      style={{ padding: '14px 20px', width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                      required 
                      placeholder="Enter current temp password"
                      value={pwdData.old}
                      onChange={e => setPwdData({...pwdData, old: e.target.value})}
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>New Secure Password</label>
                    <input 
                      type="password" 
                      className="pd-input-premium" 
                      style={{ padding: '14px 20px', width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                      required 
                      placeholder="Minimum 6 characters"
                      value={pwdData.new}
                      onChange={e => setPwdData({...pwdData, new: e.target.value})}
                    />
                  </div>
                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Confirm New Password</label>
                    <input 
                      type="password" 
                      className="pd-input-premium" 
                      style={{ padding: '14px 20px', width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                      required 
                      placeholder="Repeat new password"
                      value={pwdData.confirm}
                      onChange={e => setPwdData({...pwdData, confirm: e.target.value})}
                    />
                  </div>
                  <button type="submit" disabled={pwdLoading} style={{ 
                    width: '100%', padding: '16px', borderRadius: '18px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.25)', transition: 'all 0.3s'
                  }}>
                    {pwdLoading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                    <span>Update & Secure Account</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientLayout

