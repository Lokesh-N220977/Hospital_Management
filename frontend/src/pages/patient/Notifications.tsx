import { useState, useEffect } from "react"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import { Bell, CheckCircle2 } from "lucide-react"
import api from "../../services/api"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

export default function Notifications() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifs = async () => {
    try {
      setLoading(true)
      const res = await api.get("/notifications")
      if (res.data.success) {
        setNotifs(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifs()
  }, [])

  const markAll = async () => {
    try {
      await api.patch("/notifications/read-all")
      setNotifs(notifs.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const markRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifs(notifs.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = notifs.filter(n => !n.is_read).length

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <PatientLayout>
      <div className="nf-page">
        {/* Header */}
        <div className="nf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 className="nf-title" style={{ fontSize: '24px', fontWeight: 'bold' }}>Notifications</h2>
            <p className="nf-sub" style={{ color: '#6b7280' }}>Updates and alerts about your appointments</p>
          </div>
          <div className="nf-header-actions">
            {unreadCount > 0 && (
              <button onClick={markAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}>
                <CheckCircle2 size={16} /> Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="nf-list">
          {loading ? (
            <div className="nf-loading">Loading notifications...</div>
          ) : notifs.length === 0 ? (
            <div className="nf-empty">
              <Bell size={48} className="nf-empty-icon" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifs.map(notif => (
              <div 
                key={notif.id} 
                className={`nf-item ${notif.is_read ? 'read' : 'unread'}`}
              >
                <div className="nf-item-left">
                  <div className={`nf-icon-wrap ${notif.is_read ? 'read' : 'unread'}`}>
                    <Bell size={20} />
                  </div>
                  <div className="nf-item-content">
                    <h4 className={`nf-item-title ${notif.is_read ? 'read' : 'unread'}`}>
                      {notif.title}
                    </h4>
                    <p className="nf-item-msg">
                      {notif.message}
                    </p>
                    <span className="nf-item-time">{formatDate(notif.created_at)}</span>
                  </div>
                </div>
                {!notif.is_read && (
                  <button 
                    onClick={(e) => markRead(notif.id, e)}
                    className="nf-mark-read"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PatientLayout>
  )
}
