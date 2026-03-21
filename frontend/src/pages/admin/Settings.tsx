import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Shield, Bell, User, Monitor, LogOut, CheckCircle2, Loader2, Sun, Moon, Key } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../hooks/useTheme"

function AdminSettings() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { theme, setTheme } = useTheme()

    const [activeTab, setActiveTab] = useState("general")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")

    // General Settings (Hospital Info)
    const [hospitalInfo, setHospitalInfo] = useState({
        hospital_name: "",
        email: "",
        mobile_number: "",
        address: ""
    })
    const [generalLoading, setGeneralLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)

    // Security Settings (Password)
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    // Notification Settings
    const [notifications, setNotifications] = useState({
        new_doctor_alerts: true,
        critical_error_alerts: true,
        daily_analytics: false
    })
    const [notifLoading, setNotifLoading] = useState(true)

    // Fetch initial data
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const [hospRes, notifRes] = await Promise.all([
                    api.get("/admin/hospital-settings"),
                    api.get("/admin/settings")
                ])
                if (hospRes.data) setHospitalInfo(hospRes.data)
                if (notifRes.data) setNotifications(notifRes.data)
            } catch (err) {
                console.error("Failed to load settings", err)
            } finally {
                setGeneralLoading(false)
                setNotifLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleHospitalUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError(""); setSuccess("")
        try {
            await api.put("/admin/hospital-settings", hospitalInfo)
            setSuccess("Hospital info updated successfully! Footer will reflect this.")
            setEditMode(false)
            setTimeout(() => setSuccess(""), 3000)
        } catch (err: any) {
            setError("Failed to update hospital info")
        } finally { setLoading(false) }
    }

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

    const updateNotification = async (key: string, value: boolean) => {
        setNotifications(prev => ({ ...prev, [key]: value }));
        try {
            await api.put("/admin/settings", { [key]: value });
            setSuccess("Syncing alert preferences...");
            setTimeout(() => setSuccess(""), 1500);
        } catch (err) {
            setError("Failed to update notification setting")
        }
    }

    const tabs = [
        { id: "general", label: "General Admin Info", icon: <User size={18} /> },
        { id: "security", label: "Security & Access", icon: <Shield size={18} /> },
        { id: "notifications", label: "System Alerts", icon: <Bell size={18} /> },
        { id: "display", label: "Display Options", icon: <Monitor size={18} /> },
    ]

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className="ad-header">
                    <div>
                        <h1 className="ad-page-title">System Settings</h1>
                        <p className="ad-page-sub">Configure global platform rules, security, and alerts.</p>
                    </div>
                </div>

                <div className="pd-settings-layout">
                    <aside className="pd-settings-nav">
                        <div className="pd-card">
                            <h3 className="pd-card-subtitle" style={{ margin: '10px 14px 16px 14px', fontSize: '1.05rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Settings Menu</h3>
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

                        {activeTab === "general" && (
                            <div className="ad-card">
                                <h3 className="pd-card-subtitle">Global Platform Info</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <p className="pd-page-sub mb-4" style={{ marginBottom: 0 }}>
                                        This information represents the hospital and will be displayed publicly on the landing page footer.
                                    </p>
                                    {!editMode && (
                                        <button className="ad-btn-primary" onClick={() => setEditMode(true)} style={{ background: '#3b82f6', color: '#fff' }}>
                                            Edit Info
                                        </button>
                                    )}
                                </div>
                                {generalLoading ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>
                                ) : (
                                    <form onSubmit={handleHospitalUpdate}>
                                        <div className="ad-form-grid">
                                            <div className="ad-field">
                                                <label>Hospital Name</label>
                                                <input 
                                                    type="text" 
                                                    className="ad-input" 
                                                    required
                                                    disabled={!editMode}
                                                    style={{ opacity: !editMode ? 0.7 : 1 }}
                                                    value={hospitalInfo.hospital_name} 
                                                    onChange={e => setHospitalInfo({...hospitalInfo, hospital_name: e.target.value})} 
                                                />
                                            </div>
                                            <div className="ad-field">
                                                <label>Support Email</label>
                                                <input 
                                                    type="email" 
                                                    className="ad-input"
                                                    required
                                                    disabled={!editMode}
                                                    style={{ opacity: !editMode ? 0.7 : 1 }}
                                                    value={hospitalInfo.email} 
                                                    onChange={e => setHospitalInfo({...hospitalInfo, email: e.target.value})} 
                                                />
                                            </div>
                                            <div className="ad-field">
                                                <label>Mobile Number</label>
                                                <input 
                                                    type="text" 
                                                    className="ad-input" 
                                                    required
                                                    disabled={!editMode}
                                                    style={{ opacity: !editMode ? 0.7 : 1 }}
                                                    value={hospitalInfo.mobile_number} 
                                                    onChange={e => setHospitalInfo({...hospitalInfo, mobile_number: e.target.value})} 
                                                />
                                            </div>
                                            <div className="ad-field">
                                                <label>Full Address</label>
                                                <input 
                                                    type="text" 
                                                    className="ad-input" 
                                                    required
                                                    disabled={!editMode}
                                                    style={{ opacity: !editMode ? 0.7 : 1 }}
                                                    value={hospitalInfo.address} 
                                                    onChange={e => setHospitalInfo({...hospitalInfo, address: e.target.value})} 
                                                />
                                            </div>
                                        </div>
                                        {editMode && (
                                            <div className="ad-form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                                <button className="pd-action-btn-primary" type="submit" disabled={loading} style={{ background: '#0dcb6e', borderColor: '#0bba65' }}>
                                                    {loading ? "Saving..." : "Save Changes"}
                                                </button>
                                                <button className="pd-action-btn-secondary" type="button" onClick={() => setEditMode(false)}>
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                )}
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="ad-card">
                                <h3 className="pd-card-subtitle">Admin Security</h3>
                                <p className="pd-page-sub mb-4" style={{ marginBottom: '20px' }}>
                                    Keep your primary administrative account secure.
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
                                                    onChange={e => setPasswords({...passwords, oldPassword: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="pd-field">
                                            <label>New Password</label>
                                            <input 
                                                type="password" 
                                                placeholder="Enter new password" 
                                                className="pd-input"
                                                required
                                                value={passwords.newPassword}
                                                onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                                            />
                                        </div>
                                        <div className="pd-field">
                                            <label>Confirm Password</label>
                                            <input 
                                                type="password" 
                                                placeholder="Confirm new password" 
                                                className="pd-input"
                                                required
                                                value={passwords.confirmPassword}
                                                onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="ad-form-actions" style={{ marginTop: '20px' }}>
                                        <button className="ad-btn-primary" type="submit" disabled={loading}>
                                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="ad-card">
                                <h3 className="pd-card-subtitle">System Alerts</h3>
                                <p className="pd-page-sub mb-4" style={{ marginBottom: '20px' }}>
                                    Toggle critical administrative alerts. Instantly syncs across the platform.
                                </p>
                                {notifLoading ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>
                                ) : (
                                    <div className="pd-field-stack">
                                        <div className="pd-notif-option" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>New Doctor Registrations</span>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>Get alerted when a new doctor signs up.</span>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.new_doctor_alerts}
                                                onChange={e => updateNotification('new_doctor_alerts', e.target.checked)}
                                                style={{ width: '20px', height: '20px', accentColor: '#0dcb6e', cursor: 'pointer' }}
                                            />
                                        </div>
                                        <div className="pd-notif-option" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>Critical Error Reports</span>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>Monitor severe system issues instantly.</span>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.critical_error_alerts}
                                                onChange={e => updateNotification('critical_error_alerts', e.target.checked)}
                                                style={{ width: '20px', height: '20px', accentColor: '#0dcb6e', cursor: 'pointer' }}
                                            />
                                        </div>
                                        <div className="pd-notif-option" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>Daily Analytics Rollup</span>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>Receive end-of-day data summaries.</span>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.daily_analytics}
                                                onChange={e => updateNotification('daily_analytics', e.target.checked)}
                                                style={{ width: '20px', height: '20px', accentColor: '#0dcb6e', cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "display" && (
                            <div className="ad-card">
                                <h3 className="pd-card-subtitle">Display Options</h3>
                                <p className="pd-page-sub mb-4" style={{ marginBottom: '20px' }}>
                                    Customize your administrative portal's appearance. 
                                </p>
                                <div className="pd-field-stack">
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
        </AdminLayout>
    )
}

export default AdminSettings
