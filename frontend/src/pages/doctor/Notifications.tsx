import { useState, useEffect } from "react"
import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
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

export default function DoctorNotifications() {
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
    <DoctorLayout>
      <div className="pd-page">
        {/* Header */}
        <div className="pd-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="pd-header-content">
            <h1 className="pd-page-title" style={{ fontSize: '24px', fontWeight: 'bold' }}>Notifications</h1>
            <p className="pd-page-sub" style={{ color: '#6b7280' }}>Keep track of patient alerts, appointments, and updates.</p>
          </div>
          <div className="pd-header-actions">
            {unreadCount > 0 && (
              <button 
                onClick={markAll} 
                className="pd-action-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
              >
                <CheckCircle2 size={16} /> Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="pd-notif-layout" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading notifications...</div>
          ) : notifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', background: '#f8fafc', borderRadius: '8px' }}>
              <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifs.map(notif => (
              <div 
                key={notif.id} 
                style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  border: '1px solid',
                  borderColor: notif.is_read ? '#e2e8f0' : '#bbf7d0',
                  backgroundColor: notif.is_read ? '#f8fafc' : '#f0fdf4',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ 
                    background: notif.is_read ? '#e2e8f0' : '#dcfce7', 
                    color: notif.is_read ? '#64748b' : '#16a34a',
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: notif.is_read ? '500' : '600', color: '#0f172a' }}>
                      {notif.title}
                    </h4>
                    <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{formatDate(notif.created_at)}</span>
                  </div>
                </div>
                {!notif.is_read && (
                  <button 
                    onClick={(e) => markRead(notif.id, e)}
                    style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DoctorLayout>
  )
}
