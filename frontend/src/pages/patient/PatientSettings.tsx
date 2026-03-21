import PatientLayout from "../../components/layout/patient/PatientLayout"
import { Shield, Bell, Monitor, LogOut, Loader2, CheckCircle2, Clock, Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../hooks/useTheme"
import api from "../../services/api"

function PatientSettings() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { theme, setTheme } = useTheme()
    const [activeTab, setActiveTab] = useState("security")
    const [loading, setLoading] = useState(false)
    const [notifLoading, setNotifLoading] = useState(true)
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")

    // Security State
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    // Notification State
    const [notifications, setNotifications] = useState({
        appointment_reminders: true,
        reminder_time_minutes: 60
    })

    // Font State (managed locally for real-time update)
    const [fontSize, setFontSizeState] = useState(localStorage.getItem('patient-font-size') || 'Normal')

    const tabs = [
        { id: "security", label: "Security", icon: <Shield size={18} /> },
        { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
        { id: "display", label: "Display", icon: <Monitor size={18} /> },
    ]

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/patient/settings")
                if (res.data) setNotifications(res.data)
            } catch (err) { console.error("Failed to load settings") }
            finally { setNotifLoading(false) }
        }
        fetchSettings()
    }, [])

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("Passwords do not match"); return
        }
        setLoading(true); setError(""); setSuccess("")
        try {
            await api.put("/auth/change-password", {
                old_password: passwords.oldPassword,
                new_password: passwords.newPassword
            })
            setSuccess("Password updated successfully")
            setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to update password")
        } finally { setLoading(false) }
    }

    const updateNotification = async (key: string, value: any) => {
        setNotifications(prev => ({ ...prev, [key]: value }));
        try {
            await api.put("/patient/settings", { [key]: value });
            setSuccess("Syncing preferences...");
            setTimeout(() => setSuccess(""), 1500);
        } catch (err) { setError("Failed to sync settings") }
    }

    const handleFontSizeChange = (val: string) => {
        setFontSizeState(val);
        localStorage.setItem('patient-font-size', val);
        window.dispatchEvent(new Event('patient-prefs-changed')); // Notify layout
        setSuccess("Font size updated!");
        setTimeout(() => setSuccess(""), 2000);
    }

    return (
        <PatientLayout>
            <div className="pd-page">
                <div className="pd-header">
                    <div>
                        <h1 className="pd-page-title">Account Settings</h1>
                        <p className="pd-page-sub">Manage your security and account preferences.</p>
                    </div>
                </div>

                <div className="pd-settings-layout">
                    <aside className="pd-settings-nav">
                        <div className="pd-card">
                            <h3 className="pd-card-subtitle" style={{ margin: '10px 14px 16px 14px', fontSize: '1.05rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Settings Menu</h3>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`pd-settings-tab ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.icon} <span>{tab.label}</span>
                                </button>
                            ))}
                            <button className="pd-settings-tab pd-tab-danger" onClick={() => { logout(); navigate("/login"); }} style={{ color: "#ef4444", marginTop: '20px' }}>
                                <LogOut size={18} /> <span>Logout Session</span>
                            </button>
                        </div>
                    </aside>

                    <main className="pd-settings-content">
                        {error && <div className="pd-alert pd-alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
                        {success && <div className="pd-alert pd-alert-success" style={{ marginBottom: '20px' }}><CheckCircle2 size={16} /> {success}</div>}

                        {activeTab === "security" && (
                            <div className="pd-card">
                                <h3 className="pd-card-subtitle">Account Security</h3>
                                <p className="pd-page-sub mb-4">Secure your account by updating your password regularly.</p>
                                <form onSubmit={handlePasswordUpdate}>
                                    <div className="pd-field-stack">
                                        <div className="pd-field">
                                            <label>Current Password</label>
                                            <input type="password" placeholder="••••••••" className="pd-input" required value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} />
                                        </div>
                                        <div className="pd-field">
                                            <label>New Password</label>
                                            <input type="password" placeholder="Enter new password" className="pd-input" required value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
                                        </div>
                                        <div className="pd-field">
                                            <label>Confirm Password</label>
                                            <input type="password" placeholder="Confirm new password" className="pd-input" required value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="pd-settings-footer">
                                        <button className="pd-action-btn-primary" disabled={loading}>
                                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="pd-card">
                                <h3 className="pd-card-subtitle">Notification Toggles</h3>
                                <p className="pd-page-sub mb-4">Configure how you want to be alerted about your appointments.</p>
                                {notifLoading ? <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div> : (
                                    <div className="pd-field-stack">
                                        <div className="pd-notif-option" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-soft)', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>Appointment Reminders</span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Get notified about upcoming visits.</span>
                                            </div>
                                            <input type="checkbox" checked={notifications.appointment_reminders} onChange={e => updateNotification('appointment_reminders', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                        </div>
                                        <div className="pd-field" style={{ marginTop: '20px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Reminder Timing</label>
                                            <select className="pd-input" value={notifications.reminder_time_minutes} onChange={e => updateNotification('reminder_time_minutes', parseInt(e.target.value))} disabled={!notifications.appointment_reminders}>
                                                <option value="15">15 minutes before</option>
                                                <option value="30">30 minutes before</option>
                                                <option value="60">1 hour before</option>
                                                <option value="120">2 hours before</option>
                                                <option value="1440">1 day before</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "display" && (
                            <div className="pd-card">
                                <h3 className="pd-card-subtitle">Display Preferences</h3>
                                <p className="pd-page-sub mb-4">Customize your portal experience. Changes apply instantly.</p>
                                <div className="pd-field-stack">
                                    <div className="pd-field">
                                        <label>Theme</label>
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                            <button 
                                                onClick={() => setTheme('light')}
                                                style={{ 
                                                    flex: 1, padding: '12px', borderRadius: '12px', border: theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                                    background: theme === 'light' ? 'var(--primary-light)' : 'transparent', color: theme === 'light' ? 'var(--primary)' : 'var(--text-main)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
                                                }}
                                            >
                                                <Sun size={18} /> Light
                                            </button>
                                            <button 
                                                onClick={() => setTheme('dark')}
                                                style={{ 
                                                    flex: 1, padding: '12px', borderRadius: '12px', border: theme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                                    background: theme === 'dark' ? 'var(--primary-light)' : 'transparent', color: theme === 'dark' ? 'var(--primary)' : 'var(--text-main)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
                                                }}
                                            >
                                                <Moon size={18} /> Dark
                                            </button>
                                        </div>
                                    </div>
                                    <div className="pd-field" style={{ marginTop: '20px' }}>
                                        <label>Font Size</label>
                                        <select className="pd-input" value={fontSize} onChange={e => handleFontSizeChange(e.target.value)}>
                                            <option>Normal</option>
                                            <option>Large</option>
                                            <option>Extra Large</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </PatientLayout>
    )
}

export default PatientSettings
