import { useState } from "react"
import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import {
    Bell, CheckCircle2, CalendarCheck,
    FileText, AlertCircle, Pill, Trash2,
    Clock, Activity
} from "lucide-react"

type NotifType = "appointment" | "report" | "prescription" | "clinical" | "alert"

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
    clinical: <Activity size={18} />,
    alert: <AlertCircle size={18} />,
}

const typeColors: Record<NotifType, string> = {
    appointment: "#3b82f6",
    report: "#10b981",
    prescription: "#8b5cf6",
    clinical: "#0dcb6e",
    alert: "#ef4444",
}

const initialNotifs: Notification[] = [
    { id: "DN1", type: "appointment", read: false, title: "New Appointment Request", message: "A new patient, Sarah Miller, has requested an appointment for tomorrow at 11:30 AM.", time: "1 hour ago" },
    { id: "DN2", type: "clinical", read: false, title: "Urgent Lab Result", message: "Patient John Doe's blood report shows critically high potassium levels. Immediate review required.", time: "3 hours ago" },
    { id: "DN3", type: "report", read: true, title: "Monthly Performance Report", message: "Your practice performance report for February 2026 is now available for download.", time: "Yesterday" },
    { id: "DN4", type: "alert", read: true, title: "Hospital Meeting", message: "Emergency board meeting scheduled for today at 4:30 PM in Conference Room B.", time: "2 days ago" },
]

function DoctorNotifications() {
    const [notifs, setNotifs] = useState(initialNotifs)
    const [filter, setFilter] = useState<"all" | "unread">("all")

    const unreadCount = notifs.filter(n => !n.read).length
    const markAll = () => setNotifs(notifs.map(n => ({ ...n, read: true })))
    const markRead = (id: string) => setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n))
    const deleteNotif = (id: string) => setNotifs(notifs.filter(n => n.id !== id))
    const displayed = filter === "unread" ? notifs.filter(n => !n.read) : notifs

    return (
        <DoctorLayout>
            <div className="pd-page">
                <div className="pd-header">
                    <div className="pd-header-content">
                        <h1 className="pd-page-title">Notifications</h1>
                        <p className="pd-page-sub">Keep track of patient alerts, appointments, and hospital updates.</p>
                    </div>
                    <div className="pd-header-actions">
                        {unreadCount > 0 && (
                            <button className="pd-action-btn-secondary pd-btn-sm" onClick={markAll}>
                                <CheckCircle2 size={16} />
                                <span>Mark all as read</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="pd-notif-layout">
                    <div className="pd-card">
                        <div className="pd-notif-tabs">
                            <button className={`pd-notif-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
                                All Notifications ({notifs.length})
                            </button>
                            <button className={`pd-notif-tab ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
                                Unread ({unreadCount})
                            </button>
                        </div>

                        <div className="pd-notif-list">
                            {displayed.length === 0 ? (
                                <div className="pd-empty-state">
                                    <Bell size={48} className="text-slate-200" />
                                    <p>No notifications to display</p>
                                </div>
                            ) : (
                                displayed.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`pd-notif-item ${!notif.read ? "unread" : ""}`}
                                        onClick={() => markRead(notif.id)}
                                    >
                                        <div className="pd-notif-icon" style={{ background: `${typeColors[notif.type]}15`, color: typeColors[notif.type] }}>
                                            {typeIcons[notif.type]}
                                        </div>
                                        <div className="pd-notif-content">
                                            <div className="pd-notif-info">
                                                <h4 className="pd-notif-title">{notif.title}</h4>
                                                <span className="pd-notif-time"><Clock size={12} /> {notif.time}</span>
                                            </div>
                                            <p className="pd-notif-msg">{notif.message}</p>
                                        </div>
                                        <button className="pd-notif-delete" onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    )
}

export default DoctorNotifications
