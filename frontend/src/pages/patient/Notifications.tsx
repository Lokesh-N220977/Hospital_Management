import { useState } from "react"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  Bell, CheckCircle2, CalendarCheck,
  FileText, AlertCircle, Pill, Trash2, Settings, X,
  Volume2, VolumeX, Mail, Smartphone
} from "lucide-react"

type NotifType = "appointment" | "report" | "prescription" | "reminder" | "alert"

interface Notification {
  id: string
  type: NotifType
  title: string
  message: string
  time: string
  read: boolean
}

const typeIcons: Record<NotifType, React.ReactNode> = {
  appointment: <CalendarCheck size={18} />,
  report: <FileText size={18} />,
  prescription: <Pill size={18} />,
  reminder: <Bell size={18} />,
  alert: <AlertCircle size={18} />,
}

const typeColors: Record<NotifType, string> = {
  appointment: "#3b82f6",
  report: "#10b981",
  prescription: "#8b5cf6",
  reminder: "#f59e0b",
  alert: "#ef4444",
}

const initialNotifs: Notification[] = [
  { id: "N1", type: "appointment", read: false, title: "Appointment Confirmed", message: "Your appointment with Dr. Rahul Sharma on Nov 24 at 10:00 AM has been confirmed.", time: "2 hours ago" },
  { id: "N2", type: "report", read: false, title: "Lab Report Available", message: "Your blood test report (CBC) is now available. Click to view.", time: "5 hours ago" },
  { id: "N3", type: "prescription", read: false, title: "Prescription Renewed", message: "Dr. Priya Mehta has renewed your prescription for Cetirizine 10mg.", time: "Yesterday" },
  { id: "N4", type: "reminder", read: true, title: "Medication Reminder", message: "Time to take your Amlodipine 5mg. Don't skip your dose!", time: "2 days ago" },
  { id: "N5", type: "alert", read: true, title: "BP Reading Alert", message: "Your last recorded BP (145/95) is above the normal range. Consider consulting your doctor.", time: "3 days ago" },
  { id: "N6", type: "appointment", read: true, title: "Upcoming Appointment Reminder", message: "Reminder: You have an appointment with Dr. Priya Mehta on Dec 2 at 2:30 PM.", time: "4 days ago" },
]

function Notifications() {
  const [notifs, setNotifs] = useState(initialNotifs)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [showSettings, setShowSettings] = useState(false)

  // Settings preferences
  const [prefs, setPrefs] = useState({
    emailNotifs: true,
    smsNotifs: false,
    soundAlerts: true,
    appointmentAlerts: true,
    reportAlerts: true,
    reminderAlerts: true,
  })

  const unreadCount = notifs.filter(n => !n.read).length
  const markAll = () => setNotifs(notifs.map(n => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n))
  const deleteNotif = (id: string) => setNotifs(notifs.filter(n => n.id !== id))
  const displayed = filter === "unread" ? notifs.filter(n => !n.read) : notifs

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  return (
    <PatientLayout>
      <div className="nf-page">

        {/* Header */}
        <div className="nf-header">
          <div>
            <h2 className="nf-title">Notifications</h2>
            <p className="nf-sub">Stay updated with your health activities</p>
          </div>
          <div className="nf-header-actions">
            {unreadCount > 0 && (
              <button className="nf-mark-all" onClick={markAll}>
                <CheckCircle2 size={15} /> Mark all as read
              </button>
            )}
            <button
              className={`nf-settings-btn${showSettings ? " nf-settings-active" : ""}`}
              onClick={() => setShowSettings(s => !s)}
              title="Notification Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="nf-settings-panel">
            <div className="nf-settings-header">
              <h3 className="nf-settings-title"><Settings size={16} /> Notification Preferences</h3>
              <button className="nf-settings-close" onClick={() => setShowSettings(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="nf-settings-body">
              <p className="nf-settings-section-label">DELIVERY CHANNELS</p>
              <div className="nf-settings-grid">
                {[
                  { key: "emailNotifs", icon: <Mail size={16} />, label: "Email Notifications", desc: "Receive alerts via email" },
                  { key: "smsNotifs", icon: <Smartphone size={16} />, label: "SMS Notifications", desc: "Receive SMS alerts on phone" },
                  { key: "soundAlerts", icon: prefs.soundAlerts ? <Volume2 size={16} /> : <VolumeX size={16} />, label: "Sound Alerts", desc: "Play sound for new alerts" },
                ].map(({ key, icon, label, desc }) => (
                  <div className="nf-pref-item" key={key}>
                    <div className="nf-pref-icon">{icon}</div>
                    <div className="nf-pref-info">
                      <p className="nf-pref-label">{label}</p>
                      <p className="nf-pref-desc">{desc}</p>
                    </div>
                    <button
                      className={`nf-toggle${prefs[key as keyof typeof prefs] ? " nf-toggle-on" : ""}`}
                      onClick={() => toggle(key as keyof typeof prefs)}
                    >
                      <span className="nf-toggle-thumb" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="nf-settings-section-label" style={{ marginTop: "16px" }}>ALERT TYPES</p>
              <div className="nf-settings-grid">
                {[
                  { key: "appointmentAlerts", label: "Appointment Alerts", color: "#3b82f6" },
                  { key: "reportAlerts", label: "Report & Lab Alerts", color: "#10b981" },
                  { key: "reminderAlerts", label: "Medication Reminders", color: "#f59e0b" },
                ].map(({ key, label, color }) => (
                  <div className="nf-pref-item" key={key}>
                    <div className="nf-pref-icon" style={{ background: `${color}18`, color }}><Bell size={16} /></div>
                    <div className="nf-pref-info">
                      <p className="nf-pref-label">{label}</p>
                    </div>
                    <button
                      className={`nf-toggle${prefs[key as keyof typeof prefs] ? " nf-toggle-on" : ""}`}
                      onClick={() => toggle(key as keyof typeof prefs)}
                    >
                      <span className="nf-toggle-thumb" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="nf-controls">
          <div className="nf-tabs">
            <button className={`nf-tab${filter === "all" ? " nf-tab-active" : ""}`} onClick={() => setFilter("all")}>
              All ({notifs.length})
            </button>
            <button className={`nf-tab${filter === "unread" ? " nf-tab-active" : ""}`} onClick={() => setFilter("unread")}>
              Unread {unreadCount > 0 && <span className="nf-tab-badge">{unreadCount}</span>}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="nf-list">
          {displayed.length === 0 && (
            <div className="nf-empty">
              <Bell size={48} />
              <p>No notifications</p>
            </div>
          )}
          {displayed.map(notif => (
            <div key={notif.id} className={`nf-item${!notif.read ? " nf-item-unread" : ""}`} onClick={() => markRead(notif.id)}>
              <div className="nf-icon-wrap" style={{ background: `${typeColors[notif.type]}18`, color: typeColors[notif.type] }}>
                {typeIcons[notif.type]}
              </div>
              <div className="nf-body">
                <div className="nf-item-top">
                  <h4 className="nf-item-title">{notif.title}</h4>
                  {!notif.read && <span className="nf-unread-dot" />}
                </div>
                <p className="nf-item-msg">{notif.message}</p>
                <p className="nf-item-time">{notif.time}</p>
              </div>
              <button className="nf-delete-btn" onClick={e => { e.stopPropagation(); deleteNotif(notif.id) }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </PatientLayout>
  )
}

export default Notifications
