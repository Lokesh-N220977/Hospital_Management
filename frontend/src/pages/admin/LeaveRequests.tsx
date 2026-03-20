import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Calendar, Check, X, AlertCircle, Clock, Search, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getLeaveRequests, updateLeaveStatus } from "../../services/adminService"

function LeaveRequests() {
    const [leaves, setLeaves] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("pending")
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchLeaves = async () => {
        setLoading(true)
        try {
            const data = await getLeaveRequests(filter === "all" ? undefined : filter)
            setLeaves(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch leaves", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeaves()
    }, [filter])

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        if (!window.confirm(`Are you sure you want to ${status} this leave request?`)) return
        
        setActionLoading(id)
        try {
            await updateLeaveStatus(id, status)
            // Refresh list
            fetchLeaves()
        } catch (err) {
            alert("Failed to update leave status")
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "green"
            case "rejected": return "red"
            case "pending": return "orange"
            default: return "blue"
        }
    }

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title">Doctor Leave Requests</h1>
                        <p className="ad-page-sub">Review and manage time-off requests from healthcare providers.</p>
                    </div>
                </div>

                <div className="ad-card" style={{ marginBottom: '24px' }}>
                    <div className="ad-list-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        <div className="ad-filter-bar">
                            <button 
                                className={`ad-btn-primary ${filter === 'pending' ? '' : 'ad-btn-outline'}`}
                                onClick={() => setFilter("pending")}
                                style={{ background: filter === 'pending' ? '#f59e0b' : 'transparent', color: filter === 'pending' ? '#fff' : '#64748b', borderColor: filter === 'pending' ? '#f59e0b' : '#e2e8f0' }}
                            >
                                Pending
                            </button>
                            <button 
                                className={`ad-btn-primary ${filter === 'approved' ? '' : 'ad-btn-outline'}`}
                                onClick={() => setFilter("approved")}
                                style={{ background: filter === 'approved' ? '#10b981' : 'transparent', color: filter === 'approved' ? '#fff' : '#64748b', borderColor: filter === 'approved' ? '#10b981' : '#e2e8f0' }}
                            >
                                Approved
                            </button>
                            <button 
                                className={`ad-btn-primary ${filter === 'rejected' ? '' : 'ad-btn-outline'}`}
                                onClick={() => setFilter("rejected")}
                                style={{ background: filter === 'rejected' ? '#ef4444' : 'transparent', color: filter === 'rejected' ? '#fff' : '#64748b', borderColor: filter === 'rejected' ? '#ef4444' : '#e2e8f0' }}
                            >
                                Rejected
                            </button>
                            <button 
                                className={`ad-btn-primary ${filter === 'all' ? '' : 'ad-btn-outline'}`}
                                onClick={() => setFilter("all")}
                                style={{ background: filter === 'all' ? '#3b82f6' : 'transparent', color: filter === 'all' ? '#fff' : '#64748b', borderColor: filter === 'all' ? '#3b82f6' : '#e2e8f0' }}
                            >
                                All
                            </button>
                        </div>
                    </div>
                </div>

                <div className="ad-card">
                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto', color: '#3b82f6' }} />
                        </div>
                    ) : (
                        <div className="ad-table-wrap">
                            <table className="ad-table">
                                <thead>
                                    <tr>
                                        <th>Doctor Info</th>
                                        <th>Requested Date</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((leave, i) => (
                                        <tr key={leave._id || i}>
                                            <td>
                                                <div className="ad-user-cell">
                                                    <div className="ad-avatar" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                                        <Clock size={18} />
                                                    </div>
                                                    <div className="ad-user-info">
                                                        <span className="ad-user-name">{leave.doctor_name || "Doctor"}</span>
                                                        <span className="ad-user-sub">{leave.doctor_id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 500 }}>
                                                    <Calendar size={16} color="#3b82f6" />
                                                    {leave.date}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="ad-user-sub" style={{ maxWidth: '250px', display: 'block', whiteSpace: 'normal' }}>
                                                    {leave.reason || "No reason provided"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`ad-status ad-status--${getStatusColor(leave.status)}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {leave.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            disabled={!!actionLoading}
                                                            className="ad-btn-icon" 
                                                            style={{ background: '#ecfdf5', color: '#059669' }}
                                                            onClick={() => handleAction(leave._id, 'approved')}
                                                            title="Approve Leave"
                                                        >
                                                            {actionLoading === leave._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                                                        </button>
                                                        <button 
                                                            disabled={!!actionLoading}
                                                            className="ad-btn-icon" 
                                                            style={{ background: '#fef2f2', color: '#dc2626' }}
                                                            onClick={() => handleAction(leave._id, 'rejected')}
                                                            title="Reject Leave"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                                {leave.status !== 'pending' && (
                                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {leaves.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                                                <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                    <AlertCircle size={40} />
                                                    <p>No leave requests found for the selected filter.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

export default LeaveRequests
