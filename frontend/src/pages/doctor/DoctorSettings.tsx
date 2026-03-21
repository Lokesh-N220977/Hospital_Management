import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Shield, Bell, Monitor, LogOut, Loader2, CheckCircle2, Sun, Moon, Key } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../hooks/useTheme"
import api from "../../services/api"

function DoctorSettings() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { theme, setTheme } = useTheme()

    const [activeTab, setActiveTab] = useState("security")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")

    // Password change state
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    // Notification State
    const [notifLoading, setNotifLoading] = useState(true)
    const [notifications, setNotifications] = useState({
        new_appointment_alerts: true,
        cancellation_alerts: true,
        reschedule_alerts: true
    })

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/doctor/settings")
                if (res.data) setNotifications(res.data)
            } catch (err) {
                console.error("Failed to load settings")
            } finally {
                setNotifLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const updateNotification = async (key: string, value: boolean) => {
        setNotifications(prev => ({ ...prev, [key]: value }));
        try {
            await api.put("/doctor/settings", { [key]: value });
            setSuccess("Syncing preferences...");
            setTimeout(() => setSuccess(""), 1500);
        } catch (err) {
            setError("Failed to sync settings");
        }
    }

    const tabs = [
        { id: "security",      label: "Security",      icon: <Shield size={18} /> },
        { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
        { id: "display",       label: "Display",       icon: <Monitor size={18} /> },
    ]

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("Passwords do not match"); return
        }
        if (passwords.newPassword.length < 6) {
            setError("Password must be at least 6 characters"); return
        }
        setLoading(true); setError(""); setSuccess("")
        try {
            await api.put("/auth/change-password", {
                old_password: passwords.oldPassword,
                new_password: passwords.newPassword
            })
            setSuccess("Password updated successfully!")
            setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })
            setTimeout(() => setSuccess(""), 3000)
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to update password")
        } finally { setLoading(false) }
    }

    return (
        <DoctorLayout>
            <div className="pd-page">
                <div className="pd-header">
                    <div className="pd-header-content">
                        <h1 className="pd-page-title">Settings</h1>
                        <p className="pd-page-sub">Manage your security, notifications, and display preferences.</p>
                    </div>
                </div>

                <div className="pd-settings-layout">
                    {/* ── Sidebar Nav ── */}
                    <aside className="pd-settings-nav">
                        <div className="pd-card">
                            <h3 className="pd-card-subtitle" style={{ margin: '10px 14px 16px 14px', fontSize: '1.05rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                                Settings Menu
                            </h3>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`pd-settings-tab ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                            <button
                                className="pd-settings-tab pd-tab-danger"
                                onClick={() => { logout(); navigate("/login") }}
                                style={{ marginTop: '20px' }}
                            >
                                <LogOut size={18} />
                                <span>Logout Session</span>
                            </button>
                        </div>
                    </aside>

                    {/* ── Main Content ── */}
                    <main className="pd-settings-content">
                        {/* Toast alerts */}
                        {error && (
                            <div className="pd-alert-danger" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                ⚠️ {error}
                            </div>
                        )}
                        {success && (
                            <div className="pd-alert-info" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(13,203,110,0.08)', borderColor: 'rgba(13,203,110,0.2)', color: '#0dcb6e' }}>
                                <CheckCircle2 size={16} /> {success}
                            </div>
                        )}

                        {/* ── Security Tab ── */}
                        {activeTab === "security" && (
                            <div className="pd-card">
                                <h3 className="pd-card-subtitle">Password &amp; Security</h3>
                                <p className="pd-page-sub" style={{ marginBottom: '24px' }}>
                                    Keep your account secure by updating your password regularly.
                                </p>
                                <form onSubmit={handlePasswordUpdate}>
                                    <div className="pd-field-stack">
                                        <div className="pd-field">
                                            <label>Current Password</label>
                                            <div className="pd-input-icon-wrap">
                                                <Key size={16} />
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="pd-input"
                                                    required
                                                    value={passwords.oldPassword}
                                                    onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="pd-field">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter new password (min 6 chars)"
                                                className="pd-input"
                                                required
                                                value={passwords.newPassword}
                                                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="pd-field">
                                            <label>Confirm New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Repeat new password"
                                                className="pd-input"
                                                required
                                                value={passwords.confirmPassword}
                                                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="pd-settings-footer">
                                        <button className="pd-action-btn-primary" type="submit" disabled={loading}>
                                            {loading ? <><Loader2 className="animate-spin" size={18} /> Updating...</> : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ── Notifications Tab ── */}
                        {activeTab === "notifications" && (
                            <div className="pd-card">
                                <h3 className="pd-card-subtitle">Notification Settings</h3>
                                <p className="pd-page-sub" style={{ marginBottom: '24px' }}>
                                    Configure how you want to be alerted about your appointments.
                                </p>
                                
                                {notifLoading ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>
                                ) : (
                                    <div className="pd-field-stack">
                                        <div className="pd-notif-option" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>New Appointment Alerts</span>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>Get notified when a patient books a new appointment.</span>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.new_appointment_alerts} 
                                                onChange={e => updateNotification('new_appointment_alerts', e.target.checked)} 
                                                style={{ width: '20px', height: '20px', accentColor: '#0dcb6e', cursor: 'pointer' }} 
                                            />
                                        </div>

                                        <div className="pd-notif-option" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>Cancellation Alerts</span>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>Get notified when a patient cancels an appointment.</span>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.cancellation_alerts} 
                                                onChange={e => updateNotification('cancellation_alerts', e.target.checked)} 
                                                style={{ width: '20px', height: '20px', accentColor: '#0dcb6e', cursor: 'pointer' }} 
                                            />
                                        </div>


                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Display Tab ── */}
                        {activeTab === "display" && (
                            <div className="pd-card">
                                <h3 className="pd-card-subtitle">Display Preferences</h3>
                                <p className="pd-page-sub" style={{ marginBottom: '32px' }}>
                                    Customize your portal appearance. Changes apply instantly and only affect <strong>your</strong> account.
                                </p>

                                <div className="pd-field-stack">
                                    {/* Theme picker */}
                                    <div className="pd-field">
                                        <label style={{ marginBottom: '12px', display: 'block' }}>Theme</label>
                                        <div style={{ display: 'flex', gap: '14px' }}>
                                            {/* Light button */}
                                            <button
                                                onClick={() => setTheme('light')}
                                                style={{
                                                    flex: 1, padding: '18px 20px', borderRadius: '14px', cursor: 'pointer',
                                                    border: theme === 'light' ? '2px solid #0dcb6e' : '1px solid #334155',
                                                    background: theme === 'light' ? 'rgba(13,203,110,0.08)' : 'transparent',
                                                    color: theme === 'light' ? '#0dcb6e' : '#94a3b8',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                                                    fontWeight: 700, fontSize: '15px', transition: 'all 0.2s',
                                                }}
                                            >
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '12px',
                                                    background: theme === 'light' ? 'rgba(13,203,110,0.15)' : '#1e293b',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: theme === 'light' ? '#0dcb6e' : '#64748b',
                                                }}>
                                                    <Sun size={24} />
                                                </div>
                                                Light
                                                {theme === 'light' && (
                                                    <span style={{ fontSize: '11px', background: 'rgba(13,203,110,0.15)', color: '#0dcb6e', padding: '2px 10px', borderRadius: '20px' }}>
                                                        ✓ Active
                                                    </span>
                                                )}
                                            </button>

                                            {/* Dark button */}
                                            <button
                                                onClick={() => setTheme('dark')}
                                                style={{
                                                    flex: 1, padding: '18px 20px', borderRadius: '14px', cursor: 'pointer',
                                                    border: theme === 'dark' ? '2px solid #0dcb6e' : '1px solid #334155',
                                                    background: theme === 'dark' ? 'rgba(13,203,110,0.08)' : 'transparent',
                                                    color: theme === 'dark' ? '#0dcb6e' : '#94a3b8',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                                                    fontWeight: 700, fontSize: '15px', transition: 'all 0.2s',
                                                }}
                                            >
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '12px',
                                                    background: theme === 'dark' ? 'rgba(13,203,110,0.15)' : '#1e293b',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: theme === 'dark' ? '#0dcb6e' : '#64748b',
                                                }}>
                                                    <Moon size={24} />
                                                </div>
                                                Dark
                                                {theme === 'dark' && (
                                                    <span style={{ fontSize: '11px', background: 'rgba(13,203,110,0.15)', color: '#0dcb6e', padding: '2px 10px', borderRadius: '20px' }}>
                                                        ✓ Active
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </DoctorLayout>
    )
}

export default DoctorSettings
