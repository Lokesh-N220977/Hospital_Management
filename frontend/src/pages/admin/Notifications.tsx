import { useState, useEffect } from "react"
import AdminLayout from "../../components/layout/admin/AdminLayout"
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

export default function AdminNotifications() {
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
    <AdminLayout>
      <div className="nf-page">
        {/* Header */}
        <div className="nf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 className="nf-title" style={{ fontSize: '24px', fontWeight: 'bold' }}>Admin Notifications</h2>
            <p className="nf-sub" style={{ color: '#6b7280' }}>Updates and system alerts for administrators</p>
          </div>
          <div className="nf-header-actions">
            {unreadCount > 0 && (
              <button onClick={markAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}>
                <CheckCircle2 size={16} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="nf-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading system notifications...</div>
          ) : notifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
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
                  border: '1px solid #e5e7eb', 
                  backgroundColor: notif.is_read ? 'white' : '#eff6ff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ 
                    background: notif.is_read ? '#f3f4f6' : '#dbeafe', 
                    color: notif.is_read ? '#6b7280' : '#2563eb',
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: notif.is_read ? '500' : '600', color: '#111827' }}>
                      {notif.title}
                    </h4>
                    <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(notif.created_at)}</span>
                  </div>
                </div>
                {!notif.is_read && (
                  <button 
                    onClick={(e) => markRead(notif.id, e)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
