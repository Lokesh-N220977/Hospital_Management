import PatientLayout from "../../components/layout/patient/PatientLayout"
import { Shield, Bell, User, Monitor, LogOut } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function PatientSettings() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("general")

    const tabs = [
        { id: "general", label: "General", icon: <User size={18} /> },
        { id: "security", label: "Security", icon: <Shield size={18} /> },
        { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
        { id: "display", label: "Display", icon: <Monitor size={18} /> },
    ]

    return (
        <PatientLayout>
            <div className="pd-page" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className="pd-header">
                    <div>
                        <h1 className="pd-page-title">Account Settings</h1>
                        <p className="pd-page-sub">Manage your profile, security and preferences.</p>
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
                                <h3 className="pd-card-subtitle">Personal Details</h3>
                                <div className="pd-form-grid">
                                    <div className="pd-field">
                                        <label>Full Name</label>
                                        <input type="text" className="pd-input" defaultValue="John Doe" />
                                    </div>
                                    <div className="pd-field">
                                        <label>Date of Birth</label>
                                        <input type="date" className="pd-input" defaultValue="1992-05-15" />
                                    </div>
                                    <div className="pd-field">
                                        <label>Email Address</label>
                                        <input type="email" className="pd-input" defaultValue="john.doe@example.com" />
                                    </div>
                                    <div className="pd-field">
                                        <label>Phone Number</label>
                                        <input type="text" className="pd-input" defaultValue="+1 234 567 890" />
                                    </div>
                                </div>
                                <div className="pd-settings-footer">
                                    <button className="pd-action-btn-primary">Save Changes</button>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="pd-card">
                                <h3 className="pd-card-subtitle">Account Security</h3>
                                <div className="pd-field-stack">
                                    <div className="pd-field">
                                        <label>Current Password</label>
                                        <input type="password" placeholder="••••••••" className="pd-input" />
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
                                <h3 className="pd-card-subtitle">Push Notifications</h3>
                                <p className="pd-page-sub mb-4">Toggle which events you want to be notified about.</p>
                                <div className="pd-notif-option">
                                    <span>Appointment Reminders</span>
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div className="pd-notif-option">
                                    <span>Lab Results Alerts</span>
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div className="pd-notif-option">
                                    <span>New Message Notifications</span>
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
                                            <option>Light Theme</option>
                                            <option>Dark Theme</option>
                                            <option>System Default</option>
                                        </select>
                                    </div>
                                    <div className="pd-field">
                                        <label>Font Size</label>
                                        <select className="pd-input">
                                            <option>Normal</option>
                                            <option>Large</option>
                                            <option>Extra Large</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pd-settings-footer">
                                    <button className="pd-action-btn-primary">Save Display Settings</button>
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
