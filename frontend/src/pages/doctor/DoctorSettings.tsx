import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Shield, Bell, User, Monitor, Key, Globe, LogOut } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function DoctorSettings() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("general")

    const tabs = [
        { id: "general", label: "General", icon: <User size={18} /> },
        { id: "security", label: "Security", icon: <Shield size={18} /> },
        { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
        { id: "display", label: "Display", icon: <Monitor size={18} /> },
    ]

    return (
        <DoctorLayout>
            <div className="pd-page">
                <div className="pd-header">
                    <div className="pd-header-content">
                        <h1 className="pd-page-title">Settings</h1>
                        <p className="pd-page-sub">Manage your account preferences, security, and notification settings.</p>
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
                                onClick={() => navigate("/login")}
                                style={{ color: "#ef4444" }}
                            >
                                <LogOut size={18} />
                                <span>Logout Session</span>
                            </button>
                        </div>
                    </aside>

                    <main className="pd-settings-content">
                        {activeTab === "general" && (
                            <div className="pd-card">
                                <h3 className="pd-card-subtitle">Account Information</h3>
                                <div className="pd-form-grid">
                                    <div className="pd-field">
                                        <label>Professional Title</label>
                                        <input type="text" className="pd-input" defaultValue="Dr. John Doe" />
                                    </div>
                                    <div className="pd-field">
                                        <label>Specialization</label>
                                        <input type="text" className="pd-input" defaultValue="Senior Cardiologist" />
                                    </div>
                                    <div className="pd-field">
                                        <label>Email Address</label>
                                        <input type="email" className="pd-input" defaultValue="dr.johndoe@medicpulse.com" />
                                    </div>
                                    <div className="pd-field">
                                        <label>Language</label>
                                        <div className="pd-select-wrap">
                                            <select className="pd-input">
                                                <option>English (US)</option>
                                                <option>English (UK)</option>
                                                <option>Spanish</option>
                                            </select>
                                            <Globe size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div className="pd-settings-footer">
                                    <button className="pd-action-btn-primary">Save Changes</button>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="pd-card">
                                <h3 className="pd-card-subtitle">Password & Security</h3>
                                <div className="pd-field-stack">
                                    <div className="pd-field">
                                        <label>Current Password</label>
                                        <div className="pd-input-icon-wrap">
                                            <Key size={16} />
                                            <input type="password" placeholder="••••••••" className="pd-input" />
                                        </div>
                                    </div>
                                    <div className="pd-field">
                                        <label>New Password</label>
                                        <input type="password" placeholder="Enter new password" className="pd-input" />
                                    </div>
                                    <div className="pd-field">
                                        <label>Confirm Password</label>
                                        <input type="password" placeholder="Confirm new password" className="pd-input" />
                                    </div>
                                </div>
                                <div className="pd-settings-footer">
                                    <button className="pd-action-btn-primary">Update Password</button>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="pd-card">
                                <h3 className="pd-card-subtitle">Notification Settings</h3>
                                <p className="pd-page-sub mb-4">Choose how you wish to be notified of critical updates.</p>
                                <div className="pd-notif-option" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <span>New Patient Appointments</span>
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div className="pd-notif-option" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <span>Appointment Cancellations</span>
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div className="pd-notif-option" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <span>Direct Messages from Patients</span>
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div className="pd-notif-option" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Daily Schedule Summary</span>
                                    <input type="checkbox" />
                                </div>
                            </div>
                        )}

                        {activeTab === "display" && (
                            <div className="pd-card">
                                <h3 className="pd-card-subtitle">Display Preferences</h3>
                                <div className="pd-form-grid">
                                    <div className="pd-field">
                                        <label>Theme</label>
                                        <select className="pd-input">
                                            <option>System Default</option>
                                            <option>Light Profile</option>
                                            <option>Dark Mode</option>
                                        </select>
                                    </div>
                                    <div className="pd-field">
                                        <label>Dashboard Layout</label>
                                        <select className="pd-input">
                                            <option>Detailed View</option>
                                            <option>Compact Grid</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pd-settings-footer">
                                    <button className="pd-action-btn-primary">Save Preferences</button>
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
